"use client";

import { assertSuccess, requestJson } from "./client";
import { getApiUrl } from "./config";
import { getAccessToken, getClientTenantId } from "./session";
import type { ApiResponse } from "./types";

export type MessageUser = {
  _id: string;
  name?: string;
  image?: string;
  bio?: string;
};

export type ConversationItem = {
  _id: string;
  participants: MessageUser[];
  otherParticipant: MessageUser | null;
  lastMessageText: string;
  lastMessageAt?: string | Date | null;
  lastMessageSender?: MessageUser | null;
  unreadCount: number;
};

export type MessageItem = {
  _id: string;
  conversation: string;
  sender: MessageUser | null;
  recipient: MessageUser | null;
  text: string;
  readAt?: string | Date | null;
  createdAt?: string | Date | null;
};

export type CursorMeta = {
  limit?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
  total?: number;
};

const withAuthHeaders = (json = false) => {
  const token = getAccessToken();
  const tenantId = getClientTenantId();

  if (!token) {
    throw new Error("Access token not found");
  }

  return {
    Authorization: `Bearer ${token}`,
    "x-tenant-id": tenantId,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
};

const buildQuery = (params?: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  if (!params) return "";

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const asString = String(value).trim();
    if (!asString) return;
    query.set(key, asString);
  });

  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

export const getConversations = async (
  params?: { limit?: number; search?: string },
): Promise<ApiResponse<ConversationItem[]> & { meta?: CursorMeta }> => {
  const suffix = buildQuery({
    limit: params?.limit,
    search: params?.search,
  });

  const data = await requestJson<ApiResponse<ConversationItem[]> & { meta?: CursorMeta }>(
    `${getApiUrl()}/messages/conversations${suffix}`,
    {
      headers: withAuthHeaders(),
      cache: "no-store",
    },
  );

  return assertSuccess(data, "Failed to fetch conversations");
};

export const startConversation = async (
  targetUserId: string,
): Promise<ApiResponse<ConversationItem>> => {
  const data = await requestJson<ApiResponse<ConversationItem>>(
    `${getApiUrl()}/messages/conversations/${targetUserId}/start`,
    {
      method: "POST",
      headers: withAuthHeaders(),
    },
  );

  return assertSuccess(data, "Failed to start conversation");
};

export const getConversationMessages = async (
  conversationId: string,
  params?: { limit?: number; cursor?: string },
): Promise<
  ApiResponse<{ conversation: ConversationItem; messages: MessageItem[] }> & {
    meta?: CursorMeta;
  }
> => {
  const suffix = buildQuery({
    limit: params?.limit,
    cursor: params?.cursor,
  });

  const data = await requestJson<
    ApiResponse<{ conversation: ConversationItem; messages: MessageItem[] }> & {
      meta?: CursorMeta;
    }
  >(`${getApiUrl()}/messages/conversations/${conversationId}/messages${suffix}`, {
    headers: withAuthHeaders(),
    cache: "no-store",
  });

  return assertSuccess(data, "Failed to fetch messages");
};

export const sendMessage = async (payload: {
  text: string;
  conversationId?: string;
  recipientUserId?: string;
}): Promise<
  ApiResponse<{ conversation: ConversationItem; message: MessageItem }>
> => {
  const data = await requestJson<
    ApiResponse<{ conversation: ConversationItem; message: MessageItem }>
  >(`${getApiUrl()}/messages/send`, {
    method: "POST",
    headers: withAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  return assertSuccess(data, "Failed to send message");
};

export const markConversationRead = async (
  conversationId: string,
): Promise<ApiResponse<{ matched: number; modified: number }>> => {
  const data = await requestJson<
    ApiResponse<{ matched: number; modified: number }>
  >(`${getApiUrl()}/messages/conversations/${conversationId}/read`, {
    method: "PATCH",
    headers: withAuthHeaders(),
  });

  return assertSuccess(data, "Failed to mark conversation as read");
};

export const getUnreadMessageCount = async (): Promise<
  ApiResponse<{ unreadCount: number }>
> => {
  const data = await requestJson<ApiResponse<{ unreadCount: number }>>(
    `${getApiUrl()}/messages/unread-count`,
    {
      headers: withAuthHeaders(),
      cache: "no-store",
    },
  );

  return assertSuccess(data, "Failed to fetch unread message count");
};

export const getMessageStreamUrl = () => {
  const token = getAccessToken();
  const tenantId = getClientTenantId();

  if (!token) {
    throw new Error("Access token not found");
  }

  const query = new URLSearchParams({
    token,
    tenantId,
  });

  return `${getApiUrl()}/messages/stream?${query.toString()}`;
};
