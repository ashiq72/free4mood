"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  UserRoundPlus,
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
import { searchSocial } from "@/lib/api/social";
import { useUser } from "@/shared/context/UserContext";

const DEFAULT_AVATAR = "/default-avatar.svg";
const CONVERSATION_LIMIT = 50;
const MESSAGE_LIMIT = 30;

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
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
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
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshingConversations, setRefreshingConversations] = useState(false);

  const [newChatQuery, setNewChatQuery] = useState("");
  const [newChatLoading, setNewChatLoading] = useState(false);
  const [newChatUsers, setNewChatUsers] = useState<
    { _id?: string; name?: string; image?: string; bio?: string }[]
  >([]);
  const [startingUserId, setStartingUserId] = useState<string | null>(null);

  const messageListRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef(selectedConversationId);
  const conversationSearchRef = useRef(conversationSearch);

  const selectedConversation = useMemo(
    () =>
      conversations.find((item) => item._id === selectedConversationId) ||
      activeConversation,
    [conversations, selectedConversationId, activeConversation],
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

  useEffect(() => {
    conversationSearchRef.current = conversationSearch;
  }, [conversationSearch]);

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
      const response = await getConversations({
        limit: CONVERSATION_LIMIT,
        search: conversationSearch.trim() || undefined,
      });
      const rows = Array.isArray(response.data) ? response.data : [];
      setConversations(rows);

      if (!selectedConversationId && rows.length > 0) {
        setSelectedConversationId(
          initialConversationId && rows.some((item) => item._id === initialConversationId)
            ? initialConversationId
            : rows[0]._id,
        );
      }

      if (
        selectedConversationId &&
        !rows.some((item) => item._id === selectedConversationId)
      ) {
        setSelectedConversationId("");
        setMessages([]);
        setActiveConversation(null);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load conversations"));
    } finally {
      setLoadingConversations(false);
      setRefreshingConversations(false);
    }
  };

  const loadMessages = async (
    conversationId: string,
    mode: "reset" | "older" = "reset",
  ) => {
    if (!user?.userId || !conversationId) return;

    if (mode === "reset") {
      setLoadingMessages(true);
    } else {
      setLoadingMoreMessages(true);
    }

    try {
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
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load messages"));
    } finally {
      setLoadingMessages(false);
      setLoadingMoreMessages(false);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    router.push(`/messages/${conversationId}`);
  };

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = composerText.trim();
    if (!text || !selectedConversationId) return;

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
    try {
      setStartingUserId(targetUserId);
      const response = await startConversation(targetUserId);
      const conversation = response.data;
      if (!conversation?._id) return;
      upsertConversation(conversation, { pinTop: true });
      setSelectedConversationId(conversation._id);
      setNewChatQuery("");
      setNewChatUsers([]);
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
    void loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  useEffect(() => {
    if (!user?.userId) return;
    const timer = window.setTimeout(() => {
      void loadConversations();
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationSearch, user?.userId]);

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
    const query = newChatQuery.trim();
    if (query.length < 2) {
      setNewChatUsers([]);
      return;
    }

    let active = true;
    setNewChatLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await searchSocial(query, { limitUsers: 8, limitPosts: 0 });
        if (!active) return;
        const users = Array.isArray(response.data?.users) ? response.data.users : [];
        setNewChatUsers(users.filter((item) => item._id && item._id !== user.userId));
      } catch {
        if (!active) return;
        setNewChatUsers([]);
      } finally {
        if (active) setNewChatLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [newChatQuery, user?.userId]);

  useEffect(() => {
    if (!user?.userId) return;

    let active = true;
    let stream: EventSource | null = null;
    let fallbackTimer: number | null = null;

    const refetchFromServer = async () => {
      try {
        const conversationRes = await getConversations({
          limit: CONVERSATION_LIMIT,
          search: conversationSearchRef.current.trim() || undefined,
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
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-gray-100 p-4 dark:border-zinc-800">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Messages
              </h1>
              <button
                type="button"
                onClick={() => void loadConversations({ silent: true })}
                disabled={refreshingConversations}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshingConversations ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="relative mb-3">
              <UserRoundPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={newChatQuery}
                onChange={(event) => setNewChatQuery(event.target.value)}
                placeholder="Start new chat..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none ring-blue-500/20 transition focus:ring-4 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
              />
            </div>

            {newChatQuery.trim().length >= 2 && (
              <div className="mb-3 max-h-48 overflow-auto rounded-xl border border-gray-100 bg-gray-50/60 p-2 dark:border-zinc-700 dark:bg-zinc-800/40">
                {newChatLoading ? (
                  <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching users...
                  </div>
                ) : newChatUsers.length ? (
                  <div className="space-y-1">
                    {newChatUsers.map((candidate) => (
                      <div
                        key={candidate._id}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white dark:hover:bg-zinc-800"
                      >
                        <Link
                          href={getProfileHref(candidate._id)}
                          className="flex min-w-0 flex-1 items-center gap-3 cursor-pointer"
                        >
                          <img
                            src={candidate.image || DEFAULT_AVATAR}
                            alt={candidate.name || "User"}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white hover:underline">
                              {candidate.name || "Unknown user"}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {candidate.bio || "Tap to start a conversation"}
                            </p>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleStartConversation(candidate._id)}
                          disabled={startingUserId === candidate._id}
                          className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-700"
                        >
                          {startingUserId === candidate._id ? "..." : "Chat"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No users found
                  </p>
                )}
              </div>
            )}

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={conversationSearch}
                onChange={(event) => setConversationSearch(event.target.value)}
                placeholder="Search conversations"
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none ring-blue-500/20 transition focus:ring-4 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {loadingConversations ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading conversations...
              </div>
            ) : conversations.length ? (
              <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                {conversations.map((conversation) => {
                  const participant = conversation.otherParticipant;
                  const isSelected = selectedConversationId === conversation._id;
                  return (
                    <li key={conversation._id}>
                      <div
                        onClick={() => handleConversationSelect(conversation._id)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                        } cursor-pointer`}
                      >
                        <Link
                          href={getProfileHref(participant?._id)}
                          onClick={(event) => event.stopPropagation()}
                          className="flex min-w-0 flex-1 items-center gap-3 cursor-pointer"
                        >
                          <div className="relative shrink-0">
                            <img
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
                              <p className="truncate text-sm font-semibold text-gray-900 hover:underline dark:text-white">
                                {participant?.name || "Unknown user"}
                              </p>
                              <span className="shrink-0 text-[11px] text-gray-500 dark:text-gray-400">
                                {formatTime(conversation.lastMessageAt)}
                              </span>
                            </div>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {conversation.lastMessageText || "No messages yet"}
                            </p>
                          </div>
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No conversations yet
              </div>
            )}
          </div>
        </aside>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {!selectedConversation ? (
            <div className="flex h-[75vh] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-zinc-800">
                <MessageSquare className="h-8 w-8 text-gray-500 dark:text-gray-300" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Select a conversation
              </h2>
              <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                Pick a chat from the left panel or start a new one by searching a
                user.
              </p>
            </div>
          ) : (
            <div className="flex h-[75vh] flex-col">
              <header className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
                <Link
                  href={getProfileHref(selectedConversation.otherParticipant?._id)}
                  className="flex min-w-0 items-center gap-3 cursor-pointer"
                >
                  <img
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
                className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-white to-gray-50 px-4 py-4 dark:from-zinc-900 dark:to-zinc-950"
              >
                {loadingMessages ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading messages...
                  </div>
                ) : (
                  <>
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
                    placeholder="Type a message..."
                    rows={1}
                    className="max-h-28 min-h-11 flex-1 resize-y rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none ring-blue-500/20 transition focus:ring-4 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                  />
                  <button
                    type="submit"
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
