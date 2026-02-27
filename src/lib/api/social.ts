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
  username?: string;
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

export type FriendRequestItem = {
  _id: string;
  from?: FollowUser;
  to?: FollowUser;
  status?: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt?: string;
};

export type SocialSearchResult = {
  users: FollowUser[];
  posts: {
    _id?: string;
    text?: string;
    image?: string;
    user?: {
      _id?: string;
      name?: string;
      image?: string;
    };
  }[];
};

export type SocialProfilePayload = {
  user: {
    _id?: string;
    name?: string;
    bio?: string;
    about?: string;
    website?: string;
    location?: string;
    dateOfBirth?: string;
    image?: string;
    createdAt?: string;
  };
  followStats: FollowStats;
  photos: string[];
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

export const getNotificationStreamUrl = () => {
  const token = getAccessToken();
  const tenantId = getClientTenantId();
  if (!token) {
    throw new Error("Access token not found");
  }

  const query = new URLSearchParams({
    token,
    tenantId,
  });
  return `${getApiUrl()}/notifications/stream?${query.toString()}`;
};

export const sendFriendRequest = async (
  targetUserId: string,
): Promise<ApiResponse<unknown>> => {
  const data = await requestJson<ApiResponse<unknown>>(
    `${getApiUrl()}/friend-requests/${targetUserId}/send`,
    {
      method: "POST",
      headers: withAuthHeaders(),
    },
  );
  return assertSuccess(data, "Failed to send friend request");
};

export const cancelFriendRequest = async (
  requestId: string,
): Promise<ApiResponse<unknown>> => {
  const data = await requestJson<ApiResponse<unknown>>(
    `${getApiUrl()}/friend-requests/${requestId}/cancel`,
    {
      method: "PATCH",
      headers: withAuthHeaders(),
    },
  );
  return assertSuccess(data, "Failed to cancel friend request");
};

export const acceptFriendRequest = async (
  requestId: string,
): Promise<ApiResponse<unknown>> => {
  const data = await requestJson<ApiResponse<unknown>>(
    `${getApiUrl()}/friend-requests/${requestId}/accept`,
    {
      method: "PATCH",
      headers: withAuthHeaders(),
    },
  );
  return assertSuccess(data, "Failed to accept friend request");
};

export const rejectFriendRequest = async (
  requestId: string,
): Promise<ApiResponse<unknown>> => {
  const data = await requestJson<ApiResponse<unknown>>(
    `${getApiUrl()}/friend-requests/${requestId}/reject`,
    {
      method: "PATCH",
      headers: withAuthHeaders(),
    },
  );
  return assertSuccess(data, "Failed to reject friend request");
};

export const getIncomingFriendRequests = async (
  params?: CursorQuery,
): Promise<ApiResponse<FriendRequestItem[]> & { meta?: CursorMeta }> => {
  const suffix = buildCursorQuery(params);
  const data = await requestJson<
    ApiResponse<FriendRequestItem[]> & { meta?: CursorMeta }
  >(`${getApiUrl()}/friend-requests/incoming${suffix}`, {
    headers: withAuthHeaders(),
    cache: "no-store",
  });
  return assertSuccess(data, "Failed to fetch incoming requests");
};

export const getOutgoingFriendRequests = async (
  params?: CursorQuery,
): Promise<ApiResponse<FriendRequestItem[]> & { meta?: CursorMeta }> => {
  const suffix = buildCursorQuery(params);
  const data = await requestJson<
    ApiResponse<FriendRequestItem[]> & { meta?: CursorMeta }
  >(`${getApiUrl()}/friend-requests/outgoing${suffix}`, {
    headers: withAuthHeaders(),
    cache: "no-store",
  });
  return assertSuccess(data, "Failed to fetch outgoing requests");
};

export const getMyFriends = async (
  params?: CursorQuery,
): Promise<ApiResponse<FollowUser[]> & { meta?: CursorMeta }> => {
  const suffix = buildCursorQuery(params);
  const data = await requestJson<ApiResponse<FollowUser[]> & { meta?: CursorMeta }>(
    `${getApiUrl()}/friend-requests/friends/me${suffix}`,
    {
      headers: withAuthHeaders(),
      cache: "no-store",
    },
  );
  return assertSuccess(data, "Failed to fetch friends");
};

export const toggleBlockUser = async (
  targetUserId: string,
): Promise<ApiResponse<{ isBlocked: boolean }>> => {
  const data = await requestJson<ApiResponse<{ isBlocked: boolean }>>(
    `${getApiUrl()}/blocks/${targetUserId}/toggle`,
    {
      method: "PATCH",
      headers: withAuthHeaders(),
    },
  );
  return assertSuccess(data, "Failed to update block status");
};

export const getMyBlockedUsers = async (
  params?: CursorQuery,
): Promise<ApiResponse<FollowUser[]> & { meta?: CursorMeta }> => {
  const suffix = buildCursorQuery(params);
  const data = await requestJson<ApiResponse<FollowUser[]> & { meta?: CursorMeta }>(
    `${getApiUrl()}/blocks/me${suffix}`,
    {
      headers: withAuthHeaders(),
      cache: "no-store",
    },
  );
  return assertSuccess(data, "Failed to fetch blocked users");
};

export const createReport = async (payload: {
  targetType: "user" | "post" | "comment";
  targetId: string;
  reason: string;
  details?: string;
}): Promise<ApiResponse<unknown>> => {
  const data = await requestJson<ApiResponse<unknown>>(`${getApiUrl()}/reports`, {
    method: "POST",
    headers: withAuthHeaders(true),
    body: JSON.stringify(payload),
  });
  return assertSuccess(data, "Failed to submit report");
};

export const searchSocial = async (
  q: string,
  params?: { limitUsers?: number; limitPosts?: number },
): Promise<ApiResponse<SocialSearchResult>> => {
  const query = new URLSearchParams();
  query.set("q", q);
  if (params?.limitUsers) query.set("limitUsers", String(params.limitUsers));
  if (params?.limitPosts) query.set("limitPosts", String(params.limitPosts));

  const data = await requestJson<ApiResponse<SocialSearchResult>>(
    `${getApiUrl()}/search?${query.toString()}`,
    {
      headers: withAuthHeaders(),
      cache: "no-store",
    },
  );
  return assertSuccess(data, "Failed to search");
};

export const getSocialProfile = async (
  userId: string,
): Promise<ApiResponse<SocialProfilePayload>> => {
  const data = await requestJson<ApiResponse<SocialProfilePayload>>(
    `${getApiUrl()}/profiles/${userId}`,
    {
      headers: withAuthHeaders(),
      cache: "no-store",
    },
  );
  return assertSuccess(data, "Failed to fetch profile");
};
