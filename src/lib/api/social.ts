"use client";

import { getApiUrl } from "./config";
import { assertSuccess, requestJson } from "./client";
import { getAccessToken, getClientTenantId } from "./session";
import type { ApiResponse } from "./types";

export type CursorMeta = {
  limit?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
  unreadCount?: number;
};

export type FollowStats = {
  followers: number;
  following: number;
  isFollowing: boolean;
};

export type FollowUser = {
  _id: string;
  name: string;
  image?: string;
  bio?: string;
};

export type NotificationItem = {
  _id: string;
  type: "like" | "comment" | "follow";
  isRead: boolean;
  commentText?: string;
  createdAt?: string;
  actor?: {
    _id?: string;
    name?: string;
    image?: string;
  };
  post?: {
    _id?: string;
    image?: string;
    text?: string;
  };
};

type CursorQuery = {
  limit?: number;
  cursor?: string;
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

const buildCursorQuery = (params?: CursorQuery) => {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.cursor) query.set("cursor", params.cursor);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

export const toggleFollow = async (
  targetUserId: string,
): Promise<ApiResponse<FollowStats>> => {
  const data = await requestJson<ApiResponse<FollowStats>>(
    `${getApiUrl()}/follows/${targetUserId}/toggle`,
    {
      method: "PATCH",
      headers: withAuthHeaders(),
    },
  );
  return assertSuccess(data, "Failed to update follow state");
};

export const getFollowStats = async (
  userId: string,
): Promise<ApiResponse<FollowStats>> => {
  const data = await requestJson<ApiResponse<FollowStats>>(
    `${getApiUrl()}/follows/stats/${userId}`,
    {
      headers: withAuthHeaders(),
      cache: "no-store",
    },
  );
  return assertSuccess(data, "Failed to fetch follow stats");
};

export const getFollowingUsers = async (
  userId: string,
  params?: CursorQuery,
): Promise<ApiResponse<FollowUser[]> & { meta?: CursorMeta }> => {
  const suffix = buildCursorQuery(params);
  const data = await requestJson<ApiResponse<FollowUser[]> & { meta?: CursorMeta }>(
    `${getApiUrl()}/follows/${userId}/following${suffix}`,
    {
      headers: withAuthHeaders(),
      cache: "no-store",
    },
  );
  return assertSuccess(data, "Failed to fetch following list");
};

export const getFollowerUsers = async (
  userId: string,
  params?: CursorQuery,
): Promise<ApiResponse<FollowUser[]> & { meta?: CursorMeta }> => {
  const suffix = buildCursorQuery(params);
  const data = await requestJson<ApiResponse<FollowUser[]> & { meta?: CursorMeta }>(
    `${getApiUrl()}/follows/${userId}/followers${suffix}`,
    {
      headers: withAuthHeaders(),
      cache: "no-store",
    },
  );
  return assertSuccess(data, "Failed to fetch followers list");
};

export const getFollowSuggestions = async (
  params?: CursorQuery & { search?: string },
): Promise<ApiResponse<FollowUser[]> & { meta?: CursorMeta }> => {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.search?.trim()) query.set("search", params.search.trim());
  const suffix = query.toString() ? `?${query.toString()}` : "";

  const data = await requestJson<ApiResponse<FollowUser[]> & { meta?: CursorMeta }>(
    `${getApiUrl()}/follows/suggestions/me${suffix}`,
    {
      headers: withAuthHeaders(),
      cache: "no-store",
    },
  );
  return assertSuccess(data, "Failed to fetch follow suggestions");
};

export const getNotifications = async (
  params?: CursorQuery & { filter?: "all" | "unread" },
): Promise<ApiResponse<NotificationItem[]> & { meta?: CursorMeta }> => {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.filter) query.set("filter", params.filter);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  const data = await requestJson<ApiResponse<NotificationItem[]> & { meta?: CursorMeta }>(
    `${getApiUrl()}/notifications${suffix}`,
    {
      headers: withAuthHeaders(),
      cache: "no-store",
    },
  );
  return assertSuccess(data, "Failed to fetch notifications");
};

export const getUnreadNotificationCount = async (): Promise<
  ApiResponse<{ unreadCount: number }>
> => {
  const data = await requestJson<ApiResponse<{ unreadCount: number }>>(
    `${getApiUrl()}/notifications/unread-count`,
    {
      headers: withAuthHeaders(),
      cache: "no-store",
    },
  );
  return assertSuccess(data, "Failed to fetch unread notification count");
};

export const markAllNotificationsRead = async (): Promise<
  ApiResponse<{ matched: number; modified: number }>
> => {
  const data = await requestJson<
    ApiResponse<{ matched: number; modified: number }>
  >(`${getApiUrl()}/notifications/mark-all-read`, {
    method: "PATCH",
    headers: withAuthHeaders(),
  });
  return assertSuccess(data, "Failed to mark notifications as read");
};

export const markNotificationRead = async (
  notificationId: string,
): Promise<ApiResponse<unknown>> => {
  const data = await requestJson<ApiResponse<unknown>>(
    `${getApiUrl()}/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: withAuthHeaders(),
    },
  );
  return assertSuccess(data, "Failed to mark notification as read");
};
