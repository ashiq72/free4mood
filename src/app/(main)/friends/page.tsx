"use client";

import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Users,
  UserMinus,
} from "lucide-react";
import { useUser } from "@/shared/context/UserContext";
import {
  getFollowSuggestions,
  getFollowerUsers,
  getFollowingUsers,
  toggleFollow,
  type FollowUser,
} from "@/lib/api/social";
import { toast } from "sonner";

const PAGE_SIZE = 12;

export default function FriendsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<
    "suggestions" | "requests" | "all_friends"
  >("suggestions");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<FollowUser[]>([]);
  const [suggestionsCursor, setSuggestionsCursor] = useState<string | null>(null);
  const [suggestionsHasMore, setSuggestionsHasMore] = useState(false);

  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [followersCursor, setFollowersCursor] = useState<string | null>(null);
  const [followersHasMore, setFollowersHasMore] = useState(false);

  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [followingCursor, setFollowingCursor] = useState<string | null>(null);
  const [followingHasMore, setFollowingHasMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const followingSet = useMemo(
    () => new Set(following.map((item) => item._id)),
    [following],
  );

  const loadSuggestions = async (mode: "reset" | "more") => {
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

  const loadFollowers = async (mode: "reset" | "more") => {
    if (!user?.userId) return;
    const res = await getFollowerUsers(user.userId, {
      limit: PAGE_SIZE,
      cursor: mode === "more" ? followersCursor || undefined : undefined,
    });
    const rows = Array.isArray(res.data) ? res.data : [];
    const meta = (res.meta || {}) as {
      hasMore?: boolean;
      nextCursor?: string | null;
    };

    setFollowersHasMore(Boolean(meta.hasMore));
    setFollowersCursor(meta.nextCursor ?? null);
    setFollowers((prev) => {
      if (mode === "reset") return rows;
      const seen = new Set(prev.map((x) => x._id));
      return [...prev, ...rows.filter((x) => !seen.has(x._id))];
    });
  };

  const loadFollowing = async (mode: "reset" | "more") => {
    if (!user?.userId) return;
    const res = await getFollowingUsers(user.userId, {
      limit: PAGE_SIZE,
      cursor: mode === "more" ? followingCursor || undefined : undefined,
    });
    const rows = Array.isArray(res.data) ? res.data : [];
    const meta = (res.meta || {}) as {
      hasMore?: boolean;
      nextCursor?: string | null;
    };

    setFollowingHasMore(Boolean(meta.hasMore));
    setFollowingCursor(meta.nextCursor ?? null);
    setFollowing((prev) => {
      if (mode === "reset") return rows;
      const seen = new Set(prev.map((x) => x._id));
      return [...prev, ...rows.filter((x) => !seen.has(x._id))];
    });
  };

  const loadInitial = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      await Promise.all([
        loadSuggestions("reset"),
        loadFollowers("reset"),
        loadFollowing("reset"),
      ]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load friend graph";
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
    if (!user?.userId) return;
    const timer = window.setTimeout(() => {
      void loadSuggestions("reset");
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, user?.userId]);

  const handleToggleFollow = async (targetUserId: string) => {
    setActionLoadingId(targetUserId);
    try {
      const res = await toggleFollow(targetUserId);
      const isFollowingNow = Boolean(res.data?.isFollowing);

      if (isFollowingNow) {
        const userFromSuggestions = suggestions.find((x) => x._id === targetUserId);
        if (userFromSuggestions) {
          setFollowing((prev) => [userFromSuggestions, ...prev]);
        }
        setSuggestions((prev) => prev.filter((x) => x._id !== targetUserId));
      } else {
        setFollowing((prev) => prev.filter((x) => x._id !== targetUserId));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update follow state";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const loadMoreByTab = async () => {
    try {
      setLoadingMore(true);
      if (activeTab === "suggestions") {
        await loadSuggestions("more");
      } else if (activeTab === "requests") {
        await loadFollowers("more");
      } else {
        await loadFollowing("more");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load more";
      toast.error(message);
    } finally {
      setLoadingMore(false);
    }
  };

  const canLoadMore =
    activeTab === "suggestions"
      ? suggestionsHasMore
      : activeTab === "requests"
        ? followersHasMore
        : followingHasMore;

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

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people"
              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
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
            label="Followers"
            count={followers.length}
          />
          <TabButton
            active={activeTab === "all_friends"}
            onClick={() => setActiveTab("all_friends")}
            label="Following"
            count={following.length}
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300">
          Loading graph...
        </div>
      ) : (
        <div className="space-y-8">
          {activeTab === "suggestions" && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {suggestions.map((person) => (
                  <UserCard
                    key={person._id}
                    person={person}
                    actionLabel="Follow"
                    actionIcon={UserPlus}
                    loading={actionLoadingId === person._id}
                    onAction={() => void handleToggleFollow(person._id)}
                  />
                ))}
                {suggestions.length === 0 && (
                  <EmptyState message="No suggestions available" />
                )}
              </div>
            </section>
          )}

          {activeTab === "requests" && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {followers.map((person) => (
                  <UserCard
                    key={person._id}
                    person={person}
                    actionLabel={followingSet.has(person._id) ? "Following" : "Follow back"}
                    actionIcon={UserPlus}
                    loading={actionLoadingId === person._id}
                    disabled={followingSet.has(person._id)}
                    onAction={() => void handleToggleFollow(person._id)}
                  />
                ))}
                {followers.length === 0 && (
                  <EmptyState message="No followers yet" />
                )}
              </div>
            </section>
          )}

          {activeTab === "all_friends" && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {following.map((person) => (
                  <div
                    key={person._id}
                    className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800"
                  >
                    <img
                      src={person.image || "https://picsum.photos/200?random=21"}
                      alt={person.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {person.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                        {person.bio || "No bio yet"}
                      </p>
                      <button
                        onClick={() => void handleToggleFollow(person._id)}
                        disabled={actionLoadingId === person._id}
                        className="px-4 py-1.5 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {actionLoadingId === person._id ? "..." : "Unfollow"}
                      </button>
                    </div>
                    <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {following.length === 0 && (
                  <EmptyState message="You are not following anyone yet" />
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
      <div className="flex flex-col gap-2">
        <button
          onClick={onAction}
          disabled={loading || disabled}
          className="w-full py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <ActionIcon className="w-4 h-4" />
          {loading ? "..." : actionLabel}
        </button>
        <button className="w-full py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
          <UserMinus className="w-4 h-4" />
          Remove
        </button>
      </div>
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
