"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  ArrowRight,
  BellRing,
  Search,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { useUser } from "@/shared/context/UserContext";
import {
  getFollowSuggestions,
  getIncomingFriendRequests,
  getMyFriends,
  getOutgoingFriendRequests,
  sendFriendRequest,
  cancelFriendRequest,
  type FriendRequestItem,
  type FollowUser,
} from "@/lib/api/social";
import { toast } from "sonner";

const PAGE_SIZE = 12;

type ActiveTab = "suggestions" | "requests" | "friends";

type LoadMode = "reset" | "more";

export default function FriendsPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchFromQuery = (searchParams.get("search") || "").trim();

  const [activeTab, setActiveTab] = useState<ActiveTab>("suggestions");
  const [search, setSearch] = useState(searchFromQuery);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<FollowUser[]>([]);
  const [suggestionsCursor, setSuggestionsCursor] = useState<string | null>(null);
  const [suggestionsHasMore, setSuggestionsHasMore] = useState(false);

  const [friends, setFriends] = useState<FollowUser[]>([]);
  const [friendsCursor, setFriendsCursor] = useState<string | null>(null);
  const [friendsHasMore, setFriendsHasMore] = useState(false);

  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestItem[]>(
    [],
  );
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const requestedSet = useMemo(
    () =>
      new Set(
        outgoingRequests
          .map((item) => item.to?._id)
          .filter((id): id is string => Boolean(id)),
      ),
    [outgoingRequests],
  );
  const incomingRequesterSet = useMemo(
    () =>
      new Set(
        incomingRequests
          .map((item) => item.from?._id)
          .filter((id): id is string => Boolean(id)),
      ),
    [incomingRequests],
  );
  const friendIdSet = useMemo(
    () =>
      new Set(
        friends
          .map((item) => item._id)
          .filter((id): id is string => Boolean(id)),
      ),
    [friends],
  );
  const filteredSuggestions = useMemo(
    () => suggestions.filter((person) => !friendIdSet.has(person._id)),
    [suggestions, friendIdSet],
  );

  const loadSuggestions = async (mode: LoadMode) => {
    const res = await getFollowSuggestions({
      limit: PAGE_SIZE,
      cursor: mode === "more" ? suggestionsCursor || undefined : undefined,
      search: search.trim() || undefined,
    });

    const rows = Array.isArray(res.data) ? res.data : [];
    const meta = (res.meta || {}) as {
      hasMore?: boolean;
      nextCursor?: string | null;
    };

    setSuggestionsHasMore(Boolean(meta.hasMore));
    setSuggestionsCursor(meta.nextCursor ?? null);
    setSuggestions((prev) => {
      if (mode === "reset") return rows;
      const seen = new Set(prev.map((x) => x._id));
      return [...prev, ...rows.filter((x) => !seen.has(x._id))];
    });
  };

  const loadFriends = async (mode: LoadMode) => {
    const res = await getMyFriends({
      limit: PAGE_SIZE,
      cursor: mode === "more" ? friendsCursor || undefined : undefined,
    });

    const rows = Array.isArray(res.data) ? res.data : [];
    const meta = (res.meta || {}) as {
      hasMore?: boolean;
      nextCursor?: string | null;
    };

    setFriendsHasMore(Boolean(meta.hasMore));
    setFriendsCursor(meta.nextCursor ?? null);
    setFriends((prev) => {
      if (mode === "reset") return rows;
      const seen = new Set(prev.map((x) => x._id));
      return [...prev, ...rows.filter((x) => !seen.has(x._id))];
    });
  };

  const loadRequestSnapshots = async () => {
    const [incomingRes, outgoingRes] = await Promise.all([
      getIncomingFriendRequests({ limit: 50 }),
      getOutgoingFriendRequests({ limit: 50 }),
    ]);

    setIncomingRequests(Array.isArray(incomingRes.data) ? incomingRes.data : []);
    setOutgoingRequests(Array.isArray(outgoingRes.data) ? outgoingRes.data : []);
  };

  const loadInitial = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      await Promise.all([
        loadSuggestions("reset"),
        loadFriends("reset"),
        loadRequestSnapshots(),
      ]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load friend page";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  useEffect(() => {
    setSearch(searchFromQuery);
  }, [searchFromQuery]);

  useEffect(() => {
    if (!user?.userId) return;
    const timer = window.setTimeout(() => {
      void loadSuggestions("reset");
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, user?.userId]);

  const handleFriendRequestToggle = async (targetUserId: string) => {
    if (friendIdSet.has(targetUserId)) {
      toast.info("Already friends");
      return;
    }

    setActionLoadingId(`request-${targetUserId}`);
    try {
      const existing = outgoingRequests.find((item) => item.to?._id === targetUserId);
      if (existing?._id) {
        await cancelFriendRequest(existing._id);
        setOutgoingRequests((prev) =>
          prev.filter((item) => item._id !== existing._id),
        );
        toast.success("Friend request cancelled");
      } else {
        await sendFriendRequest(targetUserId);
        await loadRequestSnapshots();
        toast.success("Friend request sent");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update friend request";
      const lower = message.toLowerCase();
      if (lower.includes("already sent you a request")) {
        await loadRequestSnapshots();
        toast.error("This user already sent you a request. Open Requests tab.");
        setActiveTab("requests");
        router.push("/friends/requests");
      } else if (lower.includes("already friends")) {
        await Promise.all([loadRequestSnapshots(), loadFriends("reset"), loadSuggestions("reset")]);
        toast.info("Already friends");
      } else if (
        lower.includes("already sent") ||
        lower.includes("conflict")
      ) {
        await Promise.all([loadRequestSnapshots(), loadFriends("reset")]);
        toast.error(message);
      } else {
        toast.error(message);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const loadMoreByTab = async () => {
    try {
      setLoadingMore(true);
      if (activeTab === "suggestions") {
        await loadSuggestions("more");
      } else if (activeTab === "friends") {
        await loadFriends("more");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load more";
      toast.error(message);
    } finally {
      setLoadingMore(false);
    }
  };

  const canLoadMore =
    activeTab === "suggestions"
      ? suggestionsHasMore
      : activeTab === "friends"
        ? friendsHasMore
        : false;

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto py-10 text-center text-sm text-gray-500 dark:text-gray-300">
        Please login to manage friends.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 mb-6 sticky top-20 z-30">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Friends
          </h1>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people"
                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <Link
              href="/friends/requests"
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              <UserCheck className="w-4 h-4" />
              Requests
            </Link>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <TabButton
            active={activeTab === "suggestions"}
            onClick={() => setActiveTab("suggestions")}
            label="Suggestions"
          />
          <TabButton
            active={activeTab === "requests"}
            onClick={() => setActiveTab("requests")}
            label="Requests"
            count={incomingRequests.length + outgoingRequests.length}
          />
          <TabButton
            active={activeTab === "friends"}
            onClick={() => setActiveTab("friends")}
            label="Friends"
            count={friends.length}
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300">
          Loading friend page...
        </div>
      ) : (
        <div className="space-y-8">
          {activeTab === "suggestions" && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredSuggestions.map((person) => {
                  const isRequested = requestedSet.has(person._id);
                  const hasIncomingRequest = incomingRequesterSet.has(person._id);
                  return (
                    <UserCard
                      key={person._id}
                      person={person}
                      actionLabel={
                        hasIncomingRequest
                          ? "Respond request"
                          : isRequested
                            ? "Cancel request"
                            : "Add friend"
                      }
                      actionIcon={isRequested ? UserMinus : UserCheck}
                      loading={actionLoadingId === `request-${person._id}`}
                      onAction={() => {
                        if (hasIncomingRequest) {
                          router.push("/friends/requests");
                          return;
                        }
                        void handleFriendRequestToggle(person._id);
                      }}
                    />
                  );
                })}
                {filteredSuggestions.length === 0 && (
                  <EmptyState message="No suggestions available" />
                )}
              </div>
            </section>
          )}

          {activeTab === "requests" && (
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                  <p className="text-sm text-gray-500">Incoming requests</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                    {incomingRequests.length}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                  <p className="text-sm text-gray-500">Sent requests</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                    {outgoingRequests.length}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/50 p-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <BellRing className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Open request manager to accept, reject, or cancel friend requests
                    </span>
                  </div>
                  <Link
                    href="/friends/requests"
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Open Requests
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {activeTab === "friends" && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {friends.map((person) => (
                  <div
                    key={person._id}
                    className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800"
                  >
                    <img
                      src={person.image || "https://picsum.photos/200?random=21"}
                      alt={person.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {person.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {person.bio || "No bio yet"}
                      </p>
                    </div>
                  </div>
                ))}
                {friends.length === 0 && (
                  <EmptyState message="No friends yet. Send requests from Suggestions." />
                )}
              </div>
            </section>
          )}

          {canLoadMore && (
            <div className="flex justify-center">
              <button
                onClick={() => void loadMoreByTab()}
                disabled={loadingMore}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-60"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const UserCard = ({
  person,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  loading,
  disabled,
}: {
  person: FollowUser;
  actionLabel: string;
  actionIcon: ElementType;
  onAction: () => void;
  loading?: boolean;
  disabled?: boolean;
}) => (
  <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-zinc-800">
    <div className="aspect-square relative cursor-pointer group">
      <img
        src={person.image || "https://picsum.photos/200?random=12"}
        alt={person.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-3">
      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
        {person.name}
      </h3>
      <p className="text-xs text-gray-500 mb-3 line-clamp-1">
        {person.bio || "No bio yet"}
      </p>
      <button
        onClick={onAction}
        disabled={loading || disabled}
        className="w-full py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <ActionIcon className="w-4 h-4" />
        {loading ? "..." : actionLabel}
      </button>
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="col-span-full rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/50 p-8 text-center text-sm text-gray-500 dark:text-gray-300">
    {message}
  </div>
);

const TabButton = ({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) => (
  <button
    onClick={onClick}
    className={`
      px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2
      ${
        active
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
      }
    `}
  >
    {label}
    {count !== undefined && count > 0 && (
      <span
        className={`
        text-xs px-1.5 py-0.5 rounded-full 
        ${active ? "bg-white text-blue-600" : "bg-red-500 text-white"}
      `}
      >
        {count}
      </span>
    )}
  </button>
);
