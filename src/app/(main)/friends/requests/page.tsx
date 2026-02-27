"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  rejectFriendRequest,
  type FriendRequestItem,
} from "@/lib/api/social";
import { useUser } from "@/shared/context/UserContext";
import { toast } from "sonner";

type ActiveTab = "received" | "sent";
type LoadMode = "reset" | "more";

const PAGE_SIZE = 12;
const DEFAULT_AVATAR = "/default-avatar.svg";
const getUserImage = (user?: { image?: string; profileImage?: string } | null) =>
  user?.image || user?.profileImage || DEFAULT_AVATAR;

const timeAgo = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
};

export default function FriendRequestsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<ActiveTab>("received");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [incoming, setIncoming] = useState<FriendRequestItem[]>([]);
  const [incomingCursor, setIncomingCursor] = useState<string | null>(null);
  const [incomingHasMore, setIncomingHasMore] = useState(false);

  const [outgoing, setOutgoing] = useState<FriendRequestItem[]>([]);
  const [outgoingCursor, setOutgoingCursor] = useState<string | null>(null);
  const [outgoingHasMore, setOutgoingHasMore] = useState(false);

  const loadIncoming = async (mode: LoadMode) => {
    const res = await getIncomingFriendRequests({
      limit: PAGE_SIZE,
      cursor: mode === "more" ? incomingCursor || undefined : undefined,
    });
    const rows = Array.isArray(res.data) ? res.data : [];
    const meta = (res.meta || {}) as {
      hasMore?: boolean;
      nextCursor?: string | null;
    };

    setIncomingHasMore(Boolean(meta.hasMore));
    setIncomingCursor(meta.nextCursor ?? null);
    setIncoming((prev) => {
      if (mode === "reset") return rows;
      const seen = new Set(prev.map((item) => item._id));
      return [...prev, ...rows.filter((item) => !seen.has(item._id))];
    });
  };

  const loadOutgoing = async (mode: LoadMode) => {
    const res = await getOutgoingFriendRequests({
      limit: PAGE_SIZE,
      cursor: mode === "more" ? outgoingCursor || undefined : undefined,
    });
    const rows = Array.isArray(res.data) ? res.data : [];
    const meta = (res.meta || {}) as {
      hasMore?: boolean;
      nextCursor?: string | null;
    };

    setOutgoingHasMore(Boolean(meta.hasMore));
    setOutgoingCursor(meta.nextCursor ?? null);
    setOutgoing((prev) => {
      if (mode === "reset") return rows;
      const seen = new Set(prev.map((item) => item._id));
      return [...prev, ...rows.filter((item) => !seen.has(item._id))];
    });
  };

  useEffect(() => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([loadIncoming("reset"), loadOutgoing("reset")]);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load requests";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const receivedCount = incoming.length;
  const sentCount = outgoing.length;

  const hasMore = useMemo(
    () => (activeTab === "received" ? incomingHasMore : outgoingHasMore),
    [activeTab, incomingHasMore, outgoingHasMore],
  );

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      if (activeTab === "received") {
        await loadIncoming("more");
      } else {
        await loadOutgoing("more");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load more requests";
      toast.error(message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      setActionLoadingId(requestId);
      await acceptFriendRequest(requestId);
      setIncoming((prev) => prev.filter((item) => item._id !== requestId));
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
    try {
      setActionLoadingId(requestId);
      await rejectFriendRequest(requestId);
      setIncoming((prev) => prev.filter((item) => item._id !== requestId));
      toast.success("Friend request rejected");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to reject request";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      setActionLoadingId(requestId);
      await cancelFriendRequest(requestId);
      setOutgoing((prev) => prev.filter((item) => item._id !== requestId));
      toast.success("Friend request cancelled");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel request";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center text-sm text-gray-500 dark:text-gray-300">
        Please login to view friend requests.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 mb-6 sticky top-20 z-30">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/friends"
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Friend Requests
            </h1>
            <p className="text-xs text-gray-500">
              Manage incoming and outgoing requests
            </p>
          </div>
        </div>

        <div className="flex gap-4 border-b border-gray-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("received")}
            className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${
              activeTab === "received"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Received
            <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
              {receivedCount}
            </span>
            {activeTab === "received" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("sent")}
            className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${
              activeTab === "sent"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Sent
            <span className="ml-1 text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
              {sentCount}
            </span>
            {activeTab === "sent" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300">
          Loading requests...
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === "received" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incoming.map((req) => (
                <div
                  key={req._id}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 flex gap-4"
                >
                  <img
                    src={getUserImage(req.from)}
                    alt={req.from?.name || "User"}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    {req.from?._id ? (
                      <Link
                        href={`/profile/${req.from._id}`}
                        className="font-semibold text-gray-900 dark:text-white text-base truncate hover:underline cursor-pointer"
                      >
                        {req.from?.name || "Unknown user"}
                      </Link>
                    ) : (
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                        {req.from?.name || "Unknown user"}
                      </h3>
                    )}
                    <p className="text-xs text-gray-500 mb-2">
                      {timeAgo(req.createdAt)}
                    </p>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => void handleAccept(req._id)}
                        disabled={actionLoadingId === req._id}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                      >
                        {actionLoadingId === req._id ? "..." : "Accept"}
                      </button>
                      <button
                        onClick={() => void handleReject(req._id)}
                        disabled={actionLoadingId === req._id}
                        className="flex-1 py-1.5 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {incoming.length === 0 && (
                <EmptyState message="No incoming friend requests" />
              )}
            </div>
          )}

          {activeTab === "sent" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outgoing.map((req) => (
                <div
                  key={req._id}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 flex gap-4 items-center"
                >
                  <img
                    src={getUserImage(req.to)}
                    alt={req.to?.name || "User"}
                    className="w-16 h-16 rounded-full object-cover border border-gray-100 dark:border-zinc-700"
                  />
                  <div className="flex-1 min-w-0">
                    {req.to?._id ? (
                      <Link
                        href={`/profile/${req.to._id}`}
                        className="font-semibold text-gray-900 dark:text-white text-base truncate hover:underline cursor-pointer"
                      >
                        {req.to?.name || "Unknown user"}
                      </Link>
                    ) : (
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                        {req.to?.name || "Unknown user"}
                      </h3>
                    )}
                    <p className="text-xs text-gray-500 mb-3">
                      Sent {timeAgo(req.createdAt)}
                    </p>
                    <button
                      onClick={() => void handleCancel(req._id)}
                      disabled={actionLoadingId === req._id}
                      className="px-4 py-1.5 border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto disabled:opacity-60"
                    >
                      {actionLoadingId === req._id ? "..." : "Cancel request"}
                    </button>
                  </div>
                </div>
              ))}
              {outgoing.length === 0 && <EmptyState message="No sent requests" />}
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => void handleLoadMore()}
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

const EmptyState = ({ message }: { message: string }) => (
  <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
    <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
      <Clock className="w-8 h-8 text-gray-400" />
    </div>
    <p className="text-gray-500 dark:text-gray-400 font-medium">{message}</p>
  </div>
);
