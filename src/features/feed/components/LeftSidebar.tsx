"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  Compass,
  MessageCircle,
  Settings,
  UserCircle2,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import type { IUserInfo } from "@/features/profile/types";
import { getMyPosts } from "@/lib/api/post";
import {
  getFollowSuggestions,
  getNotificationStreamUrl,
  getIncomingFriendRequests,
  getMyFriends,
  getUnreadNotificationCount,
  type FollowUser,
} from "@/lib/api/social";
import { getMe } from "@/lib/api/user";

type SidebarCounts = {
  friends: number;
  requests: number;
  unreadNotifications: number;
  posts: number;
};

const DEFAULT_AVATAR = "/default-avatar.svg";
const getUserImage = (user?: FollowUser | IUserInfo | null) =>
  (user as { image?: string; profileImage?: string } | null | undefined)
    ?.image ||
  (user as { image?: string; profileImage?: string } | null | undefined)
    ?.profileImage ||
  DEFAULT_AVATAR;

const menuItems: Array<{
  key: keyof SidebarCounts | null;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    key: null,
    href: "/profile",
    label: "My Profile",
    icon: UserCircle2,
    color: "text-indigo-500",
  },
  {
    key: "friends",
    href: "/friends",
    label: "Friends",
    icon: Users,
    color: "text-blue-500",
  },
  {
    key: "requests",
    href: "/friends/requests",
    label: "Requests",
    icon: MessageCircle,
    color: "text-emerald-500",
  },
  {
    key: "unreadNotifications",
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
    color: "text-rose-500",
  },
  {
    key: null,
    href: "/watch",
    label: "Watch",
    icon: Video,
    color: "text-violet-500",
  },
  {
    key: null,
    href: "/settings",
    label: "Settings",
    icon: Settings,
    color: "text-orange-500",
  },
];

export const LeftSidebar = () => {
  const [me, setMe] = useState<IUserInfo | null>(null);
  const [counts, setCounts] = useState<SidebarCounts>({
    friends: 0,
    requests: 0,
    unreadNotifications: 0,
    posts: 0,
  });
  const [suggestions, setSuggestions] = useState<FollowUser[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSidebar = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const [meRes, friendsRes, requestRes, unreadRes, postsRes, suggestionRes] =
        await Promise.all([
          getMe<IUserInfo>(),
          getMyFriends({ limit: 100 }),
          getIncomingFriendRequests({ limit: 100 }),
          getUnreadNotificationCount(),
          getMyPosts({ limit: 100 }),
          getFollowSuggestions({ limit: 4 }),
        ]);

      const meData = meRes.data || null;
      const friendRows = Array.isArray(friendsRes.data) ? friendsRes.data : [];
      const requestRows = Array.isArray(requestRes.data) ? requestRes.data : [];
      const postRows = Array.isArray(postsRes.data) ? postsRes.data : [];
      const suggestionRows = Array.isArray(suggestionRes.data)
        ? suggestionRes.data
        : [];
      const friendIdSet = new Set(
        friendRows
          .map((friend) => friend?._id)
          .filter((id): id is string => typeof id === "string" && !!id),
      );

      setMe(meData);
      setCounts({
        friends: friendRows.length,
        requests: requestRows.length,
        unreadNotifications: Number(unreadRes.data?.unreadCount || 0),
        posts: postRows.length,
      });
      setSuggestions(
        suggestionRows.filter((person) => !friendIdSet.has(person._id)),
      );
    } catch (error: unknown) {
      if (!silent) {
        const message =
          error instanceof Error ? error.message : "Failed to load sidebar";
        toast.error(message);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadSidebar();
  }, [loadSidebar]);

  useEffect(() => {
    let active = true;
    let stream: EventSource | null = null;
    let pollTimer: number | null = null;

    const refreshUnread = async () => {
      try {
        const res = await getUnreadNotificationCount();
        if (!active) return;
        setCounts((prev) => ({
          ...prev,
          unreadNotifications: Number(res.data?.unreadCount || 0),
        }));
      } catch {
        // ignore background refresh failures
      }
    };

    try {
      const streamUrl = getNotificationStreamUrl();
      stream = new EventSource(streamUrl);

      stream.addEventListener("unread_count", (event) => {
        if (!active) return;
        try {
          const payload = JSON.parse((event as MessageEvent).data || "{}");
          setCounts((prev) => ({
            ...prev,
            unreadNotifications: Number(payload?.unreadCount || 0),
          }));
        } catch {
          // ignore parse errors
        }
      });

      stream.addEventListener("notification_new", () => {
        if (!active) return;
        void loadSidebar(true);
      });

      stream.onerror = () => {
        if (!active) return;
        if (pollTimer === null) {
          pollTimer = window.setInterval(() => {
            void refreshUnread();
            void loadSidebar(true);
          }, 30000);
        }
      };
    } catch {
      pollTimer = window.setInterval(() => {
        void refreshUnread();
        void loadSidebar(true);
      }, 30000);
    }

    return () => {
      active = false;
      if (pollTimer !== null) {
        window.clearInterval(pollTimer);
      }
      if (stream) {
        stream.close();
      }
    };
  }, [loadSidebar]);

  const shownMenu = useMemo(
    () => (expanded ? menuItems : menuItems.slice(0, 4)),
    [expanded],
  );

  return (
    <div className="space-y-5 pr-4">
      <Link
        href="/profile"
        className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80"
      >
        <div className="flex items-center gap-3">
          <img
            src={getUserImage(me)}
            alt="User"
            className="h-11 w-11 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900 dark:text-white">
              {me?.name || "My Profile"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {me?.bio || "Keep your profile updated"}
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <StatCell label="Posts" value={counts.posts} />
          <StatCell label="Friends" value={counts.friends} />
          <StatCell label="Alerts" value={counts.unreadNotifications} />
        </div>
      </Link>

      <div className="space-y-1">
        {shownMenu.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-gray-200 dark:hover:bg-zinc-800"
          >
            <item.icon className={`h-5 w-5 ${item.color}`} />
            <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-black dark:text-gray-200 dark:group-hover:text-white">
              {item.label}
            </span>
            {item.key && counts[item.key] > 0 && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {counts[item.key]}
              </span>
            )}
          </Link>
        ))}

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex w-full items-center gap-3 rounded-xl p-3 transition hover:bg-gray-200 dark:hover:bg-zinc-800"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
            <ChevronDown
              className={`h-4 w-4 text-gray-700 transition-transform dark:text-gray-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {expanded ? "See less" : "See more"}
          </span>
        </button>
      </div>

      <div className="border-b border-gray-300 dark:border-zinc-700" />

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Discover People
          </h3>
          <Link
            href="/friends"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            <Compass className="h-3.5 w-3.5" />
            Explore
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-gray-500">No suggestions available now.</p>
        ) : (
          <div className="space-y-2">
            {suggestions.map((person) => (
              <Link
                key={person._id}
                href={`/profile/${person._id}`}
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <img
                  src={getUserImage(person)}
                  alt={person.name || "User"}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                    {person.name || "Unknown"}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {person.bio || "New member"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCell = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg bg-gray-100 px-2 py-1.5 dark:bg-zinc-800">
    <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    <p className="text-[11px] text-gray-500">{label}</p>
  </div>
);
