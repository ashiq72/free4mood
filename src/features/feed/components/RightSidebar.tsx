"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Search, X } from "lucide-react";
import { toast } from "sonner";
import { RemoteImage } from "@/shared/components/RemoteImage";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  getFollowSuggestions,
  getNotificationStreamUrl,
  getIncomingFriendRequests,
  getMyFriends,
  getOutgoingFriendRequests,
  rejectFriendRequest,
  sendFriendRequest,
  type FollowUser,
  type FriendRequestItem,
} from "@/lib/api/social";

const DEFAULT_AVATAR = "/default-avatar.svg";
const getUserImage = (user?: FollowUser | null) =>
  (user as { image?: string; profileImage?: string } | null | undefined)
    ?.image ||
  (user as { image?: string; profileImage?: string } | null | undefined)
    ?.profileImage ||
  DEFAULT_AVATAR;

export const RightSidebar = () => {
  const [friends, setFriends] = useState<FollowUser[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>(
    [],
  );
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestItem[]>(
    [],
  );
  const [suggestions, setSuggestions] = useState<FollowUser[]>([]);
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSidebarData = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const [friendsRes, incomingRes, outgoingRes, suggestionsRes] =
        await Promise.all([
          getMyFriends({ limit: 100 }),
          getIncomingFriendRequests({ limit: 6 }),
          getOutgoingFriendRequests({ limit: 30 }),
          getFollowSuggestions({ limit: 6 }),
        ]);

      setFriends(Array.isArray(friendsRes.data) ? friendsRes.data : []);
      setIncomingRequests(Array.isArray(incomingRes.data) ? incomingRes.data : []);
      setOutgoingRequests(Array.isArray(outgoingRes.data) ? outgoingRes.data : []);
      setSuggestions(Array.isArray(suggestionsRes.data) ? suggestionsRes.data : []);
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
    void loadSidebarData();
  }, [loadSidebarData]);

  useEffect(() => {
    let active = true;
    let stream: EventSource | null = null;
    let pollTimer: number | null = null;

    const refreshSocialPanels = async () => {
      if (!active) return;
      await loadSidebarData(true);
    };

    try {
      const streamUrl = getNotificationStreamUrl();
      stream = new EventSource(streamUrl);

      stream.addEventListener("notification_new", () => {
        if (!active) return;
        void refreshSocialPanels();
      });

      stream.addEventListener("unread_count", () => {
        if (!active) return;
        void refreshSocialPanels();
      });

      stream.onerror = () => {
        if (!active) return;
        if (pollTimer === null) {
          pollTimer = window.setInterval(() => {
            void refreshSocialPanels();
          }, 30000);
        }
      };
    } catch {
      pollTimer = window.setInterval(() => {
        void refreshSocialPanels();
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
  }, [loadSidebarData]);

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((item) => (item.name || "").toLowerCase().includes(q));
  }, [friends, search]);

  const friendIdSet = useMemo(
    () => new Set(friends.map((friend) => friend._id).filter(Boolean)),
    [friends],
  );

  const pendingUserIdSet = useMemo(
    () =>
      new Set([
        ...incomingRequests
          .map((request) => request.from?._id)
          .filter((id): id is string => Boolean(id)),
        ...outgoingRequests
          .map((request) => request.to?._id)
          .filter((id): id is string => Boolean(id)),
      ]),
    [incomingRequests, outgoingRequests],
  );

  const filteredSuggestions = useMemo(
    () =>
      suggestions.filter(
        (item) =>
          !friendIdSet.has(item._id) && !pendingUserIdSet.has(item._id),
      ),
    [suggestions, friendIdSet, pendingUserIdSet],
  );

  const pendingOutgoingMap = useMemo(() => {
    const map = new Map<string, string>();
    outgoingRequests.forEach((req) => {
      if (req.to?._id && req._id) {
        map.set(req.to._id, req._id);
      }
    });
    return map;
  }, [outgoingRequests]);

  const handleAccept = async (requestId: string) => {
    setActionLoadingId(`accept-${requestId}`);
    try {
      await acceptFriendRequest(requestId);
      setIncomingRequests((prev) => prev.filter((item) => item._id !== requestId));
      const friendRes = await getMyFriends({ limit: 100 });
      setFriends(Array.isArray(friendRes.data) ? friendRes.data : []);
      toast.success("Friend request accepted");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to accept request";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionLoadingId(`reject-${requestId}`);
    try {
      await rejectFriendRequest(requestId);
      setIncomingRequests((prev) => prev.filter((item) => item._id !== requestId));
      toast.success("Friend request rejected");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to reject request";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSuggestionAction = async (targetUserId: string) => {
    if (friendIdSet.has(targetUserId)) {
      toast.info("Already friends");
      return;
    }

    const existingRequestId = pendingOutgoingMap.get(targetUserId);
    const actionId = existingRequestId
      ? `cancel-${existingRequestId}`
      : `send-${targetUserId}`;

    setActionLoadingId(actionId);
    try {
      if (existingRequestId) {
        await cancelFriendRequest(existingRequestId);
        setOutgoingRequests((prev) =>
          prev.filter((item) => item._id !== existingRequestId),
        );
        toast.success("Request cancelled");
      } else {
        await sendFriendRequest(targetUserId);
        setSuggestions((prev) =>
          prev.filter((person) => person._id !== targetUserId),
        );
        const outgoingRes = await getOutgoingFriendRequests({ limit: 30 });
        setOutgoingRequests(Array.isArray(outgoingRes.data) ? outgoingRes.data : []);
        toast.success("Friend request sent");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update request";
      if (message.toLowerCase().includes("already friends")) {
        toast.info("Already friends");
        await loadSidebarData(true);
        return;
      }
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <aside className="space-y-6 border-l border-[var(--mood-line)] pl-6">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            People to meet
          </h3>
          <Link href="/friends" className="text-xs font-semibold text-[var(--mood-jade)] hover:underline">
            Explore
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : filteredSuggestions.length === 0 ? (
          <p className="text-sm text-gray-500">No suggestions right now.</p>
        ) : (
          <div className="space-y-2">
            {filteredSuggestions.slice(0, 3).map((item) => {
              const requestId = pendingOutgoingMap.get(item._id);
              const loadingId = requestId
                ? `cancel-${requestId}`
                : `send-${item._id}`;
              const pending = Boolean(requestId);
              return (
                <div
                  key={item._id}
                   className="border-b border-[var(--mood-line)] py-3 last:border-0"
                >
                  <Link
                    href={`/profile/${item._id}`}
                     className="mb-2.5 flex items-center gap-2.5"
                  >
                    <RemoteImage
                      src={getUserImage(item)}
                      alt={item.name || "User"}
                       className="h-10 w-10 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {item.name || "Unknown"}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {item.bio || "Suggested for you"}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleSuggestionAction(item._id)}
                    disabled={actionLoadingId === loadingId}
                     className={`w-full rounded-md px-3 py-2 text-xs font-semibold transition ${
                       pending
                         ? "border border-[var(--mood-line)] bg-transparent text-[var(--mood-ink)] hover:bg-[var(--mood-surface-soft)]"
                         : "bg-[var(--mood-ink)] text-white hover:bg-[var(--mood-coral)] dark:bg-white dark:text-black"
                    } disabled:opacity-60`}
                  >
                    {actionLoadingId === loadingId
                      ? "..."
                      : pending
                        ? "Cancel request"
                        : "Add friend"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t border-[var(--mood-line)] pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Friend Requests
          </h3>
          <Link
            href="/friends/requests"
            className="text-xs font-semibold text-[var(--mood-jade)] hover:underline"
          >
            See all
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : incomingRequests.length === 0 ? (
          <p className="text-sm text-gray-500">No pending requests.</p>
        ) : (
          <div className="space-y-3">
            {incomingRequests.slice(0, 3).map((request) => {
              const from = request.from;
              if (!from?._id) return null;
              return (
                <div
                  key={request._id}
                  className="border-b border-[var(--mood-line)] py-3 last:border-0"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <RemoteImage
                      src={getUserImage(from)}
                      className="h-10 w-10 rounded-md object-cover"
                      alt={from.name || "Requester"}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {from.name || "Unknown"}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {from.bio || "Wants to connect"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={actionLoadingId === `accept-${request._id}`}
                      onClick={() => void handleAccept(request._id)}
                      className="rounded-md bg-[var(--mood-jade)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                    >
                      {actionLoadingId === `accept-${request._id}`
                        ? "..."
                        : "Confirm"}
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === `reject-${request._id}`}
                      onClick={() => void handleReject(request._id)}
                      className="rounded-md border border-[var(--mood-line)] px-3 py-2 text-xs font-semibold text-[var(--mood-ink)] hover:bg-[var(--mood-surface-soft)] disabled:opacity-60"
                    >
                      {actionLoadingId === `reject-${request._id}` ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t border-[var(--mood-line)] pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Contacts
          </h3>
          <div className="flex gap-2 text-gray-500">
            <Search className="h-4 w-4" />
            <MoreHorizontal className="h-4 w-4" />
          </div>
        </div>

        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] pl-8 pr-2 text-xs outline-none focus:border-[var(--mood-jade)]"
            placeholder="Search contacts"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : filteredContacts.length === 0 ? (
          <p className="text-sm text-gray-500">No contacts found.</p>
        ) : (
          <div className="space-y-1">
            {filteredContacts.map((friend) => (
              <Link
                key={friend._id}
                href={`/profile/${friend._id}`}
                className="flex items-center gap-3 rounded-md p-2 transition hover:bg-[var(--mood-surface-soft)]"
              >
                <div className="relative">
                  <RemoteImage
                    src={getUserImage(friend)}
                    className="h-9 w-9 rounded-md object-cover"
                    alt={friend.name || "Friend"}
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-zinc-900" />
                </div>
                <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                  {friend.name || "Unknown"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
};
