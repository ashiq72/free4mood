"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Check,
  Clock3,
  LoaderCircle,
  MessageCircle,
  Search,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { RemoteImage } from "@/shared/components/RemoteImage";
import { useUser } from "@/shared/context/UserContext";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  getFollowSuggestions,
  getIncomingFriendRequests,
  getMyFriends,
  getOutgoingFriendRequests,
  rejectFriendRequest,
  sendFriendRequest,
  type FriendRequestItem,
  type FollowUser,
} from "@/lib/api/social";
import { startConversation } from "@/lib/api/message";

const PAGE_SIZE = 12;
const DEFAULT_AVATAR = "/default-avatar.svg";

const getUserImage = (user?: FollowUser | null) =>
  user?.image || user?.profileImage || DEFAULT_AVATAR;

const timeAgo = (value?: string) => {
  if (!value) return "Recently";
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "Recently";
  const minutes = Math.floor((Date.now() - time) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const matchesSearch = (person: FollowUser | undefined, value: string) => {
  if (!value.trim()) return true;
  const query = value.trim().toLowerCase();
  return [person?.name, person?.username, person?.bio]
    .filter(Boolean)
    .some((field) => field?.toLowerCase().includes(query));
};

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
    () => new Set(friends.map((item) => item._id).filter(Boolean)),
    [friends],
  );

  const filteredSuggestions = useMemo(
    () =>
      suggestions.filter(
        (person) =>
          !friendIdSet.has(person._id) &&
          !requestedSet.has(person._id) &&
          !incomingRequesterSet.has(person._id),
      ),
    [suggestions, friendIdSet, requestedSet, incomingRequesterSet],
  );

  const filteredFriends = useMemo(
    () => friends.filter((person) => matchesSearch(person, search)),
    [friends, search],
  );

  const filteredIncoming = useMemo(
    () =>
      incomingRequests.filter((request) =>
        matchesSearch(request.from, search),
      ),
    [incomingRequests, search],
  );

  const filteredOutgoing = useMemo(
    () =>
      outgoingRequests.filter((request) => matchesSearch(request.to, search)),
    [outgoingRequests, search],
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
    setSuggestions((previous) => {
      if (mode === "reset") return rows;
      const seen = new Set(previous.map((item) => item._id));
      return [...previous, ...rows.filter((item) => !seen.has(item._id))];
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
    setFriends((previous) => {
      if (mode === "reset") return rows;
      const seen = new Set(previous.map((item) => item._id));
      return [...previous, ...rows.filter((item) => !seen.has(item._id))];
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
      toast.error(
        error instanceof Error ? error.message : "Failed to load friends",
      );
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
    if (!user?.userId || activeTab !== "suggestions") return;
    const timer = window.setTimeout(() => {
      void loadSuggestions("reset");
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, user?.userId, activeTab]);

  const selectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSearch("");
  };

  const handleFriendRequest = async (targetUserId: string) => {
    if (friendIdSet.has(targetUserId)) {
      toast.info("You are already friends");
      return;
    }

    setActionLoadingId(`request-${targetUserId}`);
    try {
      await sendFriendRequest(targetUserId);
      setSuggestions((previous) =>
        previous.filter((person) => person._id !== targetUserId),
      );
      await loadRequestSnapshots();
      toast.success("Friend request sent");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send request";
      const lower = message.toLowerCase();
      if (lower.includes("already sent you a request")) {
        await loadRequestSnapshots();
        selectTab("requests");
        toast.info("This person already sent you a request");
      } else if (lower.includes("already friends")) {
        await Promise.all([
          loadRequestSnapshots(),
          loadFriends("reset"),
          loadSuggestions("reset"),
        ]);
        toast.info("You are already friends");
      } else {
        toast.error(message);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAccept = async (requestId: string) => {
    setActionLoadingId(`accept-${requestId}`);
    try {
      await acceptFriendRequest(requestId);
      setIncomingRequests((previous) =>
        previous.filter((request) => request._id !== requestId),
      );
      await Promise.all([loadFriends("reset"), loadSuggestions("reset")]);
      toast.success("You are now friends");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to accept request",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionLoadingId(`reject-${requestId}`);
    try {
      await rejectFriendRequest(requestId);
      setIncomingRequests((previous) =>
        previous.filter((request) => request._id !== requestId),
      );
      toast.success("Request declined");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to decline request",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    setActionLoadingId(`cancel-${requestId}`);
    try {
      await cancelFriendRequest(requestId);
      setOutgoingRequests((previous) =>
        previous.filter((request) => request._id !== requestId),
      );
      await loadSuggestions("reset");
      toast.success("Request cancelled");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel request",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMessage = async (targetUserId: string) => {
    setActionLoadingId(`message-${targetUserId}`);
    try {
      const response = await startConversation(targetUserId);
      if (!response.data?._id) throw new Error("Conversation could not start");
      router.push(`/messages/${response.data._id}`);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start conversation",
      );
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
      toast.error(
        error instanceof Error ? error.message : "Failed to load more",
      );
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

  const searchPlaceholder =
    activeTab === "suggestions"
      ? "Find someone new"
      : activeTab === "requests"
        ? "Search requests"
        : "Search your friends";

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl py-12 text-center text-sm text-[var(--mood-muted)]">
        Please sign in to manage your circle.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--mood-canvas)]">
      <div className="relative z-30 border-b border-[var(--mood-line)] bg-[color:var(--mood-canvas)]/95 backdrop-blur-xl md:sticky md:top-[68px]">
        <div className="mx-auto max-w-6xl px-4 pb-0 pt-6 sm:px-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase text-[var(--mood-coral)]">
                <Sparkles className="h-3.5 w-3.5" />
                Your social circle
              </p>
              <h1 className="text-3xl font-bold text-[var(--mood-ink)]">
                People
              </h1>
              <p className="mt-1 text-sm text-[var(--mood-muted)]">
                Discover new voices and stay close to the people you know.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mood-muted)]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-11 w-full rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] pl-10 pr-10 text-sm text-[var(--mood-ink)] outline-none transition placeholder:text-[var(--mood-muted)] focus:border-[var(--mood-jade)]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--mood-muted)] hover:bg-[var(--mood-surface-soft)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <nav
            className="mt-6 flex gap-1 overflow-x-auto no-scrollbar"
            aria-label="People views"
          >
            <TabButton
              active={activeTab === "suggestions"}
              onClick={() => selectTab("suggestions")}
              label="Discover"
              icon={UserPlus}
            />
            <TabButton
              active={activeTab === "requests"}
              onClick={() => selectTab("requests")}
              label="Requests"
              icon={Clock3}
              count={incomingRequests.length + outgoingRequests.length}
              attention={incomingRequests.length > 0}
            />
            <TabButton
              active={activeTab === "friends"}
              onClick={() => selectTab("friends")}
              label="My friends"
              icon={Users}
              count={friends.length}
            />
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        {loading ? (
          <LoadingGrid />
        ) : (
          <>
            {activeTab === "suggestions" && (
              <section>
                <SectionHeader
                  title="People you may connect with"
                  description="Only people with no current friendship or pending request appear here."
                  count={filteredSuggestions.length}
                />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredSuggestions.map((person) => (
                    <SuggestionCard
                      key={person._id}
                      person={person}
                      loading={
                        actionLoadingId === `request-${person._id}`
                      }
                      onAdd={() => void handleFriendRequest(person._id)}
                    />
                  ))}
                  {filteredSuggestions.length === 0 && (
                    <EmptyState
                      icon={UserCheck}
                      title={search ? "No people match your search" : "You are all caught up"}
                      description={
                        search
                          ? "Try a different name or clear the search."
                          : "New people will appear here as the community grows."
                      }
                    />
                  )}
                </div>
              </section>
            )}

            {activeTab === "requests" && (
              <div className="space-y-9">
                <section>
                  <SectionHeader
                    title="Waiting for your reply"
                    description="Accept people you know or quietly decline the request."
                    count={filteredIncoming.length}
                    accent
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredIncoming.map((request) =>
                      request.from ? (
                        <IncomingRequestCard
                          key={request._id}
                          request={request}
                          accepting={
                            actionLoadingId === `accept-${request._id}`
                          }
                          rejecting={
                            actionLoadingId === `reject-${request._id}`
                          }
                          onAccept={() => void handleAccept(request._id)}
                          onReject={() => void handleReject(request._id)}
                        />
                      ) : null,
                    )}
                    {filteredIncoming.length === 0 && (
                      <EmptyState
                        icon={Check}
                        title={search ? "No received requests match" : "Nothing waiting for you"}
                        description={
                          search
                            ? "Try another name."
                            : "New friend requests will appear here."
                        }
                      />
                    )}
                  </div>
                </section>

                <section className="border-t border-[var(--mood-line)] pt-8">
                  <SectionHeader
                    title="Requests you sent"
                    description="Pending invitations can be cancelled at any time."
                    count={filteredOutgoing.length}
                  />
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredOutgoing.map((request) =>
                      request.to ? (
                        <OutgoingRequestCard
                          key={request._id}
                          request={request}
                          loading={
                            actionLoadingId === `cancel-${request._id}`
                          }
                          onCancel={() => void handleCancel(request._id)}
                        />
                      ) : null,
                    )}
                    {filteredOutgoing.length === 0 && (
                      <EmptyState
                        icon={Clock3}
                        title={search ? "No sent requests match" : "No pending invitations"}
                        description={
                          search
                            ? "Try another name."
                            : "People you invite will appear here until they respond."
                        }
                      />
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "friends" && (
              <section>
                <SectionHeader
                  title="Your friends"
                  description="Open a profile or jump directly into a conversation."
                  count={filteredFriends.length}
                />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredFriends.map((person) => (
                    <FriendCard
                      key={person._id}
                      person={person}
                      loading={actionLoadingId === `message-${person._id}`}
                      onMessage={() => void handleMessage(person._id)}
                    />
                  ))}
                  {filteredFriends.length === 0 && (
                    <EmptyState
                      icon={Users}
                      title={search ? "No friends match your search" : "Your circle is ready to grow"}
                      description={
                        search
                          ? "Try another name or clear the search."
                          : "Visit Discover to find people you would like to know."
                      }
                    />
                  )}
                </div>
              </section>
            )}

            {canLoadMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadMoreByTab()}
                  disabled={loadingMore}
                  className="flex h-10 items-center gap-2 rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] px-5 text-sm font-bold text-[var(--mood-ink)] transition hover:border-[var(--mood-ink)] disabled:opacity-60"
                >
                  {loadingMore && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}
                  {loadingMore
                    ? "Loading"
                    : activeTab === "friends"
                      ? "Load more friends"
                      : "Show more people"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const SectionHeader = ({
  title,
  description,
  count,
  accent = false,
}: {
  title: string;
  description: string;
  count: number;
  accent?: boolean;
}) => (
  <div className="mb-4 flex items-end justify-between gap-4">
    <div>
      <h2 className="text-lg font-bold text-[var(--mood-ink)]">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-[var(--mood-muted)]">
        {description}
      </p>
    </div>
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
        accent && count > 0
          ? "bg-[var(--mood-coral)] text-white"
          : "bg-[var(--mood-surface-soft)] text-[var(--mood-muted)]"
      }`}
    >
      {count}
    </span>
  </div>
);

const SuggestionCard = ({
  person,
  loading,
  onAdd,
}: {
  person: FollowUser;
  loading: boolean;
  onAdd: () => void;
}) => (
  <article className="rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] p-4">
    <div className="flex items-center gap-3">
      <Link href={`/profile/${person._id}`} className="shrink-0">
        <RemoteImage
          src={getUserImage(person)}
          alt={person.name}
          className="h-14 w-14 rounded-md object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${person._id}`}
          className="block truncate text-sm font-bold text-[var(--mood-ink)] hover:text-[var(--mood-coral)]"
        >
          {person.name}
        </Link>
        {person.username && (
          <p className="truncate text-xs text-[var(--mood-jade)]">
            @{person.username}
          </p>
        )}
        <p className="mt-0.5 line-clamp-1 text-xs text-[var(--mood-muted)]">
          {person.bio || "A new voice in the community"}
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={onAdd}
      disabled={loading}
      className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[var(--mood-ink)] text-xs font-bold text-white transition hover:bg-[var(--mood-coral)] disabled:opacity-60 dark:bg-white dark:text-black"
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {loading ? "Sending" : "Connect"}
    </button>
  </article>
);

const IncomingRequestCard = ({
  request,
  accepting,
  rejecting,
  onAccept,
  onReject,
}: {
  request: FriendRequestItem;
  accepting: boolean;
  rejecting: boolean;
  onAccept: () => void;
  onReject: () => void;
}) => {
  const person = request.from!;
  const busy = accepting || rejecting;

  return (
    <article className="rounded-md border border-[var(--mood-line)] border-l-2 border-l-[var(--mood-coral)] bg-[var(--mood-surface)] p-4">
      <div className="flex items-center gap-3">
        <Link href={`/profile/${person._id}`} className="shrink-0">
          <RemoteImage
            src={getUserImage(person)}
            alt={person.name}
            className="h-14 w-14 rounded-md object-cover"
          />
        </Link>
        <div className="min-w-0">
          <Link
            href={`/profile/${person._id}`}
            className="block truncate text-sm font-bold text-[var(--mood-ink)] hover:text-[var(--mood-coral)]"
          >
            {person.name}
          </Link>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--mood-muted)]">
            <Clock3 className="h-3 w-3" />
            Sent {timeAgo(request.createdAt)}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onAccept}
          disabled={busy}
          className="flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--mood-jade)] text-xs font-bold text-white disabled:opacity-60"
        >
          {accepting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Accept
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={busy}
          className="flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--mood-line)] text-xs font-bold text-[var(--mood-ink)] hover:bg-[var(--mood-surface-soft)] disabled:opacity-60"
        >
          {rejecting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
          Decline
        </button>
      </div>
    </article>
  );
};

const OutgoingRequestCard = ({
  request,
  loading,
  onCancel,
}: {
  request: FriendRequestItem;
  loading: boolean;
  onCancel: () => void;
}) => {
  const person = request.to!;

  return (
    <article className="rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] p-4">
      <div className="flex items-center gap-3">
        <Link href={`/profile/${person._id}`} className="shrink-0">
          <RemoteImage
            src={getUserImage(person)}
            alt={person.name}
            className="h-12 w-12 rounded-md object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${person._id}`}
            className="block truncate text-sm font-bold text-[var(--mood-ink)] hover:text-[var(--mood-coral)]"
          >
            {person.name}
          </Link>
          <p className="mt-1 text-[11px] text-[var(--mood-muted)]">
            Sent {timeAgo(request.createdAt)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[var(--mood-line)] text-xs font-bold text-[var(--mood-ink)] hover:bg-[var(--mood-surface-soft)] disabled:opacity-60"
      >
        {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {loading ? "Cancelling" : "Cancel request"}
      </button>
    </article>
  );
};

const FriendCard = ({
  person,
  loading,
  onMessage,
}: {
  person: FollowUser;
  loading: boolean;
  onMessage: () => void;
}) => (
  <article className="flex items-center gap-3 rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] p-3">
    <Link href={`/profile/${person._id}`} className="shrink-0">
      <RemoteImage
        src={getUserImage(person)}
        alt={person.name}
        className="h-14 w-14 rounded-md object-cover"
      />
    </Link>
    <div className="min-w-0 flex-1">
      <Link
        href={`/profile/${person._id}`}
        className="block truncate text-sm font-bold text-[var(--mood-ink)] hover:text-[var(--mood-coral)]"
      >
        {person.name}
      </Link>
      <p className="mt-0.5 line-clamp-1 text-xs text-[var(--mood-muted)]">
        {person.bio || "Part of your circle"}
      </p>
    </div>
    <button
      type="button"
      onClick={onMessage}
      disabled={loading}
      title={`Message ${person.name}`}
      aria-label={`Message ${person.name}`}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--mood-surface-soft)] text-[var(--mood-jade)] transition hover:bg-[var(--mood-jade)] hover:text-white disabled:opacity-60"
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4" />
      )}
    </button>
  </article>
);

const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) => (
  <div className="col-span-full flex min-h-44 flex-col items-center justify-center rounded-md border border-dashed border-[var(--mood-line)] px-6 text-center">
    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--mood-surface-soft)] text-[var(--mood-jade)]">
      <Icon className="h-5 w-5" />
    </span>
    <p className="text-sm font-bold text-[var(--mood-ink)]">{title}</p>
    <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--mood-muted)]">
      {description}
    </p>
  </div>
);

const LoadingGrid = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="h-36 animate-pulse rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] p-4"
      >
        <div className="flex gap-3">
          <div className="h-14 w-14 rounded-md bg-[var(--mood-surface-soft)]" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 w-1/2 rounded bg-[var(--mood-surface-soft)]" />
            <div className="h-3 w-3/4 rounded bg-[var(--mood-surface-soft)]" />
          </div>
        </div>
        <div className="mt-4 h-9 rounded-md bg-[var(--mood-surface-soft)]" />
      </div>
    ))}
  </div>
);

const TabButton = ({
  active,
  onClick,
  label,
  icon: Icon,
  count,
  attention = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: ElementType;
  count?: number;
  attention?: boolean;
}) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={`relative flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-bold transition ${
      active
        ? "border-[var(--mood-coral)] text-[var(--mood-ink)]"
        : "border-transparent text-[var(--mood-muted)] hover:text-[var(--mood-ink)]"
    }`}
  >
    <Icon className="h-4 w-4" />
    {label}
    {count !== undefined && (
      <span
        className={`min-w-5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
          attention && count > 0
            ? "bg-[var(--mood-coral)] text-white"
            : "bg-[var(--mood-surface-soft)] text-[var(--mood-muted)]"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);
