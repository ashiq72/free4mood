"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AtSign,
  Bell,
  Check,
  Heart,
  MessageCircle,
  MoreHorizontal,
  UserPlus,
} from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/api/social";
import { toast } from "sonner";
import { useUser } from "@/shared/context/UserContext";

const PAGE_SIZE = 15;

type FilterType = "all" | "unread";

const getRelativeTime = (value?: string) => {
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

export default function NotificationsPage() {
  const { user } = useUser();
  const [filter, setFilter] = useState<FilterType>("all");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadNotifications = async (mode: "reset" | "more") => {
    try {
      if (mode === "reset") {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await getNotifications({
        limit: PAGE_SIZE,
        cursor: mode === "more" ? cursor || undefined : undefined,
        filter,
      });

      const rows = Array.isArray(res.data) ? res.data : [];
      const meta = (res.meta || {}) as {
        hasMore?: boolean;
        nextCursor?: string | null;
        unreadCount?: number;
      };

      setUnreadCount((prev) => Number(meta.unreadCount ?? prev));
      setHasMore(Boolean(meta.hasMore));
      setCursor(meta.nextCursor ?? null);
      setItems((prev) => {
        if (mode === "reset") return rows;
        const seen = new Set(prev.map((item) => item._id));
        const merged = [...prev];
        rows.forEach((row) => {
          if (!seen.has(row._id)) merged.push(row);
        });
        return merged;
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load notifications";
      toast.error(message);
    } finally {
      if (mode === "reset") {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (!user) return;
    setItems([]);
    setCursor(null);
    setHasMore(false);
    void loadNotifications("reset");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, user]);

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to mark as read";
      toast.error(message);
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (item.isRead) return;
    try {
      await markNotificationRead(item._id);
      setItems((prev) =>
        prev.map((entry) =>
          entry._id === item._id ? { ...entry, isRead: true } : entry,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // keep silent to avoid noisy UX
    }
  };

  const emptyMessage = useMemo(() => {
    if (filter === "unread") return "No unread notifications";
    return "No notifications yet";
  }, [filter]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center text-sm text-gray-500 dark:text-gray-300">
        Please login to view notifications.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 mb-4 sticky top-20 z-30">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <button
            onClick={markAllRead}
            disabled={unreadCount <= 0}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 font-medium hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filter === "unread"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              Unread
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Unread: {unreadCount}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-zinc-800">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading notifications...
          </div>
        ) : items.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {items.map((notification) => (
              <NotificationRow
                key={notification._id}
                notification={notification}
                onClick={() => void handleItemClick(notification)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {emptyMessage}
            </h3>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => void loadNotifications("more")}
            disabled={loadingMore}
            className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-60 cursor-pointer"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

const NotificationRow = ({
  notification,
  onClick,
}: {
  notification: NotificationItem;
  onClick: () => void;
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return (
          <div className="bg-red-500 p-1.5 rounded-full">
            <Heart className="w-3.5 h-3.5 text-white fill-current" />
          </div>
        );
      case "comment":
        return (
          <div className="bg-blue-500 p-1.5 rounded-full">
            <MessageCircle className="w-3.5 h-3.5 text-white fill-current" />
          </div>
        );
      case "follow":
        return (
          <div className="bg-green-500 p-1.5 rounded-full">
            <UserPlus className="w-3.5 h-3.5 text-white" />
          </div>
        );
      default:
        return (
          <div className="bg-orange-500 p-1.5 rounded-full">
            <AtSign className="w-3.5 h-3.5 text-white" />
          </div>
        );
    }
  };

  const actorName = notification.actor?.name || "Someone";
  const timeLabel = getRelativeTime(notification.createdAt);

  return (
    <div
      onClick={onClick}
      className={`p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer relative group ${
        !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
      }`}
    >
      <div className="flex gap-4">
        <div className="relative shrink-0">
          <img
            src={notification.actor?.image || "https://picsum.photos/200?random=41"}
            alt={actorName}
            className="w-14 h-14 rounded-full object-cover border border-gray-100 dark:border-zinc-800"
          />
          <div className="absolute -bottom-1 -right-1 border-2 border-white dark:border-black rounded-full shadow-sm">
            {getIcon()}
          </div>
        </div>

        <div className="flex-1 min-w-0 pr-8">
          <p className="text-sm text-gray-900 dark:text-gray-100">
            <span className="font-bold hover:underline">{actorName}</span>{" "}
            <span className="text-gray-600 dark:text-gray-300">
              {notification.type === "like" && "liked your post."}
              {notification.type === "comment" && (
                <>
                  commented:{" "}
                  <span className="text-gray-500 dark:text-gray-400 font-normal">
                    &quot;{notification.commentText || "Nice post!"}&quot;
                  </span>
                </>
              )}
              {notification.type === "follow" && "started following you."}
            </span>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
            {timeLabel}
          </p>
        </div>

        {notification.post?.image && (
          <div className="shrink-0">
            <img
              src={notification.post.image}
              alt="Post"
              className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-zinc-800"
            />
          </div>
        )}

        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2">
          {!notification.isRead && (
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
          )}
          <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-all">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
