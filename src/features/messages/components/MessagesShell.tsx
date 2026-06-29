"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RemoteImage } from "@/shared/components/RemoteImage";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  getConversationMessages,
  getConversations,
  getMessageStreamUrl,
  markConversationRead,
  sendMessage,
  startConversation,
  type ConversationItem,
  type MessageItem,
} from "@/lib/api/message";
import {
  getMyFriends,
  type FollowUser,
} from "@/lib/api/social";
import { useUser } from "@/shared/context/UserContext";

const DEFAULT_AVATAR = "/default-avatar.svg";
const CONVERSATION_LIMIT = 50;
const MESSAGE_LIMIT = 30;
const FRIEND_PAGE_LIMIT = 50;

type MessagesShellProps = {
  initialConversationId?: string;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const formatTime = (value?: string | Date | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const formatMessageTime = (value?: string | Date | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function MessagesShell({
  initialConversationId,
}: MessagesShellProps) {
  const router = useRouter();
  const { user } = useUser();

  const [conversationSearch, setConversationSearch] = useState("");
  const [activeList, setActiveList] = useState<"chats" | "friends">("chats");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [friends, setFriends] = useState<FollowUser[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState(
    initialConversationId || "",
  );
  const [activeConversation, setActiveConversation] =
    useState<ConversationItem | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageCursor, setMessageCursor] = useState<string | null>(null);
  const [messagesHasMore, setMessagesHasMore] = useState(false);
  const [composerText, setComposerText] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshingConversations, setRefreshingConversations] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [startingUserId, setStartingUserId] = useState<string | null>(null);

  const messageListRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef(selectedConversationId);

  const selectedConversation = useMemo(
    () =>
      conversations.find((item) => item._id === selectedConversationId) ||
      activeConversation,
    [conversations, selectedConversationId, activeConversation],
  );
  const conversationByUserId = useMemo(() => {
    const map = new Map<string, ConversationItem>();
    conversations.forEach((conversation) => {
      const participantId = conversation.otherParticipant?._id;
      if (participantId) map.set(participantId, conversation);
    });
    return map;
  }, [conversations]);
  const normalizedSearch = conversationSearch.trim().toLowerCase();
  const visibleConversations = useMemo(() => {
    if (!normalizedSearch) return conversations;
    return conversations.filter((conversation) => {
      const participant = conversation.otherParticipant;
      return (
        (participant?.name || "").toLowerCase().includes(normalizedSearch) ||
        (conversation.lastMessageText || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [conversations, normalizedSearch]);
  const visibleFriends = useMemo(() => {
    const filtered = normalizedSearch
      ? friends.filter(
          (friend) =>
            (friend.name || "").toLowerCase().includes(normalizedSearch) ||
            (friend.bio || "").toLowerCase().includes(normalizedSearch),
        )
      : friends;
    return [...filtered].sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }, [friends, normalizedSearch]);
  const unreadConversationCount = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) => total + Number(conversation.unreadCount || 0),
        0,
      ),
    [conversations],
  );
  const getProfileHref = (userId?: string) =>
    userId ? `/profile/${userId}` : "/profile";

  const scrollToBottom = () => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    selectedConversationRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const upsertConversation = (
    conversation: ConversationItem,
    options?: { pinTop?: boolean; forceUnreadZero?: boolean },
  ) => {
    setConversations((prev) => {
      const nextItem = {
        ...conversation,
        unreadCount: options?.forceUnreadZero ? 0 : conversation.unreadCount,
      };
      const rest = prev.filter((item) => item._id !== conversation._id);
      if (options?.pinTop === false) {
        return [...rest, nextItem];
      }
      return [nextItem, ...rest];
    });
  };

  const loadConversations = async (opts?: { silent?: boolean }) => {
    if (!user?.userId) return;

    if (opts?.silent) {
      setRefreshingConversations(true);
    } else {
      setLoadingConversations(true);
    }

    try {
      setListError(null);
      const response = await getConversations({
        limit: CONVERSATION_LIMIT,
      });
      const rows = Array.isArray(response.data) ? response.data : [];
      setConversations(rows);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to load conversations");
      setListError(message);
      if (!opts?.silent) toast.error(message);
    } finally {
      setLoadingConversations(false);
      setRefreshingConversations(false);
    }
  };

  const loadFriends = async (silent = false) => {
    if (!user?.userId) return;
    if (!silent) setLoadingFriends(true);

    try {
      setListError(null);
      const allFriends: FollowUser[] = [];
      const seenIds = new Set<string>();
      let cursor: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const response = await getMyFriends({
          limit: FRIEND_PAGE_LIMIT,
          cursor,
        });
        const rows = Array.isArray(response.data) ? response.data : [];
        rows.forEach((friend) => {
          if (!friend._id || seenIds.has(friend._id)) return;
          seenIds.add(friend._id);
          allFriends.push(friend);
        });

        const nextCursor = response.meta?.nextCursor || undefined;
        hasMore = Boolean(response.meta?.hasMore && nextCursor);
        if (nextCursor === cursor) break;
        cursor = nextCursor;
      }

      setFriends(allFriends);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to load friends");
      setListError(message);
      if (!silent) toast.error(message);
    } finally {
      setLoadingFriends(false);
    }
  };

  const refreshWorkspace = async () => {
    setRefreshingConversations(true);
    await Promise.all([
      loadConversations({ silent: true }),
      loadFriends(true),
    ]);
    setRefreshingConversations(false);
  };

  const loadMessages = async (
    conversationId: string,
    mode: "reset" | "older" = "reset",
  ) => {
    if (!user?.userId || !conversationId) return;
    const previousScrollHeight = messageListRef.current?.scrollHeight || 0;

    if (mode === "reset") {
      setLoadingMessages(true);
    } else {
      setLoadingMoreMessages(true);
    }

    try {
      setMessageError(null);
      const response = await getConversationMessages(conversationId, {
        limit: MESSAGE_LIMIT,
        cursor: mode === "older" ? messageCursor || undefined : undefined,
      });
      const payload = response.data;
      const incomingMessages = Array.isArray(payload?.messages)
        ? payload.messages
        : [];
      const meta = response.meta || {};

      setMessagesHasMore(Boolean(meta.hasMore));
      setMessageCursor(meta.nextCursor ?? null);

      if (payload?.conversation) {
        setActiveConversation(payload.conversation);
        upsertConversation(payload.conversation, { forceUnreadZero: true });
      }

      setMessages((prev) => {
        if (mode === "reset") return incomingMessages;

        const existingIds = new Set(prev.map((item) => item._id));
        const olderRows = incomingMessages.filter((item) => !existingIds.has(item._id));
        return [...olderRows, ...prev];
      });

      if (mode === "reset") {
        window.setTimeout(scrollToBottom, 60);
      } else {
        window.setTimeout(() => {
          const node = messageListRef.current;
          if (!node) return;
          node.scrollTop += node.scrollHeight - previousScrollHeight;
        }, 40);
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to load messages");
      setMessageError(message);
      toast.error(message);
    } finally {
      setLoadingMessages(false);
      setLoadingMoreMessages(false);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setActiveConversation(
      conversations.find((conversation) => conversation._id === conversationId) ||
        null,
    );
    router.push(`/messages/${conversationId}`);
  };

  const handleBackToMessages = () => {
    setSelectedConversationId("");
    setActiveConversation(null);
    setMessages([]);
    setMessageError(null);
    router.push("/messages");
  };

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = composerText.trim();
    if (!text || !selectedConversationId || sending) return;

    try {
      setSending(true);
      const response = await sendMessage({
        conversationId: selectedConversationId,
        text,
      });
      const payload = response.data;
      if (payload?.message) {
        setMessages((prev) => {
          if (prev.some((item) => item._id === payload.message._id)) {
            return prev;
          }
          return [...prev, payload.message];
        });
      }
      if (payload?.conversation) {
        setActiveConversation(payload.conversation);
        upsertConversation(payload.conversation, { pinTop: true, forceUnreadZero: true });
      }
      setComposerText("");
      window.setTimeout(scrollToBottom, 50);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to send message"));
    } finally {
      setSending(false);
    }
  };

  const handleStartConversation = async (targetUserId?: string) => {
    if (!targetUserId) return;

    const existingConversation = conversationByUserId.get(targetUserId);
    if (existingConversation) {
      handleConversationSelect(existingConversation._id);
      return;
    }

    try {
      setStartingUserId(targetUserId);
      const response = await startConversation(targetUserId);
      const conversation = response.data;
      if (!conversation?._id) return;
      upsertConversation(conversation, { pinTop: true });
      setSelectedConversationId(conversation._id);
      setActiveConversation(conversation);
      setActiveList("chats");
      router.push(`/messages/${conversation._id}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to start conversation"));
    } finally {
      setStartingUserId(null);
    }
  };

  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  useEffect(() => {
    if (!user?.userId) return;
    void Promise.all([loadConversations(), loadFriends()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  useEffect(() => {
    if (!selectedConversationId || !user?.userId) return;
    setMessages([]);
    setMessageCursor(null);
    setMessagesHasMore(false);
    void loadMessages(selectedConversationId, "reset");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId, user?.userId]);

  useEffect(() => {
    if (!user?.userId) return;

    let active = true;
    let stream: EventSource | null = null;
    let fallbackTimer: number | null = null;

    const refetchFromServer = async () => {
      try {
        const conversationRes = await getConversations({
          limit: CONVERSATION_LIMIT,
        });
        if (!active) return;

        const rows = Array.isArray(conversationRes.data) ? conversationRes.data : [];
        setConversations(rows);

        const currentConversationId = selectedConversationRef.current;
        if (
          currentConversationId &&
          !rows.some((item) => item._id === currentConversationId)
        ) {
          setSelectedConversationId("");
          setMessages([]);
          setActiveConversation(null);
          return;
        }

        if (currentConversationId) {
          const messageRes = await getConversationMessages(currentConversationId, {
            limit: MESSAGE_LIMIT,
          });
          if (!active) return;
          const payload = messageRes.data;
          setMessages(Array.isArray(payload?.messages) ? payload.messages : []);
          if (payload?.conversation) {
            setActiveConversation(payload.conversation);
            upsertConversation(payload.conversation, { forceUnreadZero: true });
          }
        }
      } catch {
        // ignore fallback polling errors
      }
    };

    try {
      stream = new EventSource(getMessageStreamUrl());

      stream.addEventListener("message_new", (event) => {
        if (!active) return;
        try {
          const payload = JSON.parse((event as MessageEvent).data || "{}") as {
            conversation?: ConversationItem;
            message?: MessageItem;
          };
          const incomingConversation = payload.conversation;
          const incomingMessage = payload.message;

          if (!incomingConversation?._id) return;

          const currentConversationId = selectedConversationRef.current;
          const isActiveConversation =
            incomingConversation._id === currentConversationId;

          upsertConversation(incomingConversation, {
            pinTop: true,
            forceUnreadZero: isActiveConversation,
          });

          if (isActiveConversation && incomingMessage?._id) {
            setMessages((prev) => {
              if (prev.some((row) => row._id === incomingMessage._id)) {
                return prev;
              }
              return [...prev, incomingMessage];
            });

            const senderId = incomingMessage.sender?._id;
            if (senderId && senderId !== user.userId) {
              void markConversationRead(incomingConversation._id).catch(() => undefined);
            }
            window.setTimeout(scrollToBottom, 40);
          }
        } catch {
          // ignore malformed realtime payload
        }
      });

      stream.addEventListener("conversation_read", (event) => {
        if (!active) return;
        try {
          const payload = JSON.parse((event as MessageEvent).data || "{}") as {
            conversationId?: string;
          };
          if (!payload?.conversationId) return;
          setConversations((prev) =>
            prev.map((item) =>
              item._id === payload.conversationId
                ? { ...item, unreadCount: 0 }
                : item,
            ),
          );
        } catch {
          // ignore malformed payload
        }
      });

      stream.onerror = () => {
        if (!active || fallbackTimer !== null) return;
        fallbackTimer = window.setInterval(() => {
          void refetchFromServer();
        }, 8000);
      };
    } catch {
      fallbackTimer = window.setInterval(() => {
        void refetchFromServer();
      }, 8000);
    }

    return () => {
      active = false;
      if (fallbackTimer !== null) {
        window.clearInterval(fallbackTimer);
      }
      if (stream) {
        stream.close();
      }
    };
  }, [user?.userId]);

  if (!user?.userId) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center text-sm text-gray-500 dark:text-gray-300">
        Please login to open messages.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-0 py-0 sm:px-4 sm:py-4">
      <div className="grid h-[calc(100svh-4.5rem)] min-h-[32rem] overflow-hidden border-y border-gray-200 bg-white sm:h-[calc(100svh-6.5rem)] sm:rounded-lg sm:border lg:grid-cols-[360px_minmax(0,1fr)] dark:border-zinc-800 dark:bg-zinc-900">
        <aside
          className={`min-h-0 flex-col border-r border-gray-200 dark:border-zinc-800 ${
            selectedConversationId ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="border-b border-gray-200 p-4 dark:border-zinc-800">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Messages
                </h1>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {friends.length} {friends.length === 1 ? "friend" : "friends"}
                  {unreadConversationCount > 0
                    ? ` · ${unreadConversationCount} unread`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                title="Refresh messages"
                aria-label="Refresh messages"
                onClick={() => void refreshWorkspace()}
                disabled={refreshingConversations}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshingConversations ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={conversationSearch}
                onChange={(event) => setConversationSearch(event.target.value)}
                placeholder={
                  activeList === "chats"
                    ? "Search chats"
                    : "Search friends"
                }
                aria-label={
                  activeList === "chats"
                    ? "Search chats"
                    : "Search friends"
                }
                className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 rounded-md bg-gray-100 p-1 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setActiveList("chats")}
                className={`flex h-9 items-center justify-center gap-2 rounded-sm text-sm font-medium transition ${
                  activeList === "chats"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Chats
                {unreadConversationCount > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                    {unreadConversationCount > 99
                      ? "99+"
                      : unreadConversationCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveList("friends")}
                className={`flex h-9 items-center justify-center gap-2 rounded-sm text-sm font-medium transition ${
                  activeList === "friends"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Users className="h-4 w-4" />
                Friends
                <span className="text-xs text-gray-400">{friends.length}</span>
              </button>
            </div>
          </div>

          {listError && (
            <div className="m-3 flex items-center justify-between gap-3 border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <span>{listError}</span>
              <button
                type="button"
                onClick={() => void refreshWorkspace()}
                className="shrink-0 font-semibold hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {activeList === "chats" ? (
              loadingConversations ? (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading chats...
                </div>
              ) : visibleConversations.length ? (
                <ul>
                  {visibleConversations.map((conversation) => {
                    const participant = conversation.otherParticipant;
                    const isSelected =
                      selectedConversationId === conversation._id;
                    return (
                      <li key={conversation._id}>
                        <button
                          type="button"
                          onClick={() =>
                            handleConversationSelect(conversation._id)
                          }
                          className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition dark:border-zinc-800 ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-950/30"
                              : "hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                          }`}
                        >
                          <div className="relative shrink-0">
                            <RemoteImage
                              src={participant?.image || DEFAULT_AVATAR}
                              alt={participant?.name || "User"}
                              className="h-11 w-11 rounded-full object-cover"
                            />
                            {conversation.unreadCount > 0 && (
                              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
                                {conversation.unreadCount > 99
                                  ? "99+"
                                  : conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                {participant?.name || "Unknown user"}
                              </p>
                              <span className="shrink-0 text-[11px] text-gray-500 dark:text-gray-400">
                                {formatTime(conversation.lastMessageAt)}
                              </span>
                            </div>
                            <p
                              className={`truncate text-xs ${
                                conversation.unreadCount > 0
                                  ? "font-semibold text-gray-800 dark:text-gray-200"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {conversation.lastMessageSender?._id ===
                              user.userId
                                ? "You: "
                                : ""}
                              {conversation.lastMessageText ||
                                "Conversation started"}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-6 py-12 text-center">
                  <MessageSquare className="mx-auto h-7 w-7 text-gray-300 dark:text-zinc-600" />
                  <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {normalizedSearch ? "No chats found" : "No chats yet"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Open Friends to start a conversation.
                  </p>
                </div>
              )
            ) : loadingFriends ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading friends...
              </div>
            ) : visibleFriends.length ? (
              <ul>
                {visibleFriends.map((friend) => {
                  const existingConversation = conversationByUserId.get(
                    friend._id,
                  );
                  return (
                    <li key={friend._id}>
                      <button
                        type="button"
                        onClick={() =>
                          void handleStartConversation(friend._id)
                        }
                        disabled={startingUserId === friend._id}
                        className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                      >
                        <RemoteImage
                          src={
                            friend.image ||
                            friend.profileImage ||
                            DEFAULT_AVATAR
                          }
                          alt={friend.name || "Friend"}
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {friend.name || "Unknown user"}
                          </p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {startingUserId === friend._id
                              ? "Opening chat..."
                              : existingConversation
                                ? "Continue conversation"
                                : friend.bio || "Start a conversation"}
                          </p>
                        </div>
                        {startingUserId === friend._id ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600" />
                        ) : (
                          <MessageCircle className="h-4 w-4 shrink-0 text-blue-600" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center">
                <Users className="mx-auto h-7 w-7 text-gray-300 dark:text-zinc-600" />
                <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                  {normalizedSearch ? "No friends found" : "No friends yet"}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Friends will appear here when requests are accepted.
                </p>
              </div>
            )}
          </div>
        </aside>

        <section
          className={`min-h-0 bg-white dark:bg-zinc-900 ${
            selectedConversationId ? "flex" : "hidden lg:flex"
          }`}
        >
          {!selectedConversation ? (
            selectedConversationId ? (
              messageError ? (
                <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    {messageError}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={handleBackToMessages}
                      className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-800"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void loadMessages(selectedConversationId, "reset")
                      }
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening conversation...
                </div>
              )
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-zinc-800">
                  <MessageSquare className="h-8 w-8 text-gray-500 dark:text-gray-300" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Choose someone to message
                </h2>
                <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                  Select an existing chat or open Friends to start a new
                  conversation.
                </p>
              </div>
            )
          ) : (
            <div className="flex h-full w-full min-w-0 flex-col">
              <header className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleBackToMessages}
                  aria-label="Back to messages"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 lg:hidden dark:text-gray-300 dark:hover:bg-zinc-800"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Link
                  href={getProfileHref(selectedConversation.otherParticipant?._id)}
                  className="flex min-w-0 items-center gap-3"
                >
                  <RemoteImage
                    src={selectedConversation.otherParticipant?.image || DEFAULT_AVATAR}
                    alt={selectedConversation.otherParticipant?.name || "User"}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 hover:underline dark:text-white">
                      {selectedConversation.otherParticipant?.name || "Unknown user"}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {selectedConversation.otherParticipant?.bio ||
                        "Direct conversation"}
                    </p>
                  </div>
                </Link>
              </header>

              <div
                ref={messageListRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50/60 px-4 py-4 dark:bg-zinc-950/60"
              >
                {loadingMessages ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading messages...
                  </div>
                ) : (
                  <>
                    {messageError && (
                      <div className="flex items-center justify-between gap-3 border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                        <span>{messageError}</span>
                        <button
                          type="button"
                          onClick={() =>
                            void loadMessages(selectedConversationId, "reset")
                          }
                          className="shrink-0 font-semibold hover:underline"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    {messagesHasMore && (
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedConversationId) return;
                            void loadMessages(selectedConversationId, "older");
                          }}
                          disabled={loadingMoreMessages}
                          className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800"
                        >
                          {loadingMoreMessages ? "Loading..." : "Load older"}
                        </button>
                      </div>
                    )}

                    {messages.length ? (
                      messages.map((item) => {
                        const isOwn = item.sender?._id === user.userId;
                        return (
                          <div
                            key={item._id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
                                isOwn
                                  ? "rounded-br-md bg-blue-600 text-white"
                                  : "rounded-bl-md border border-gray-200 bg-white text-gray-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-100"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                {item.text}
                              </p>
                              <p
                                className={`mt-1 text-[11px] ${
                                  isOwn ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {formatMessageTime(item.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        No messages yet. Say hello.
                      </div>
                    )}
                  </>
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="border-t border-gray-100 px-3 py-3 dark:border-zinc-800"
              >
                <div className="flex items-end gap-2">
                  <textarea
                    value={composerText}
                    onChange={(event) => setComposerText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" || event.shiftKey) return;
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }}
                    placeholder="Type a message..."
                    aria-label="Message"
                    maxLength={5000}
                    rows={1}
                    className="max-h-28 min-h-11 flex-1 resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                  />
                  <button
                    type="submit"
                    title="Send message"
                    aria-label="Send message"
                    disabled={sending || !composerText.trim()}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
