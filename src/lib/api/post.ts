"use client";

import { assertSuccess, requestJson } from "./client";
import { getApiUrl } from "./config";
import type { ApiResponse } from "./types";
import type { Post } from "@/features/feed/types";
import { getAccessToken, getClientTenantId } from "./session";

export type FeedPostsResponse = ApiResponse<Post[]> & {
  meta?: {
    limit?: number;
    hasMore?: boolean;
    nextCursor?: string | null;
  };
};

type FeedQuery = {
  limit?: number;
  cursor?: string;
};

const buildFeedQuery = (params?: FeedQuery) => {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.cursor) query.set("cursor", params.cursor);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

export const createPost = async (
  formData: FormData
): Promise<ApiResponse<Post>> => {
  const token = getAccessToken();
  const tenantId = getClientTenantId();

  if (!token) {
    throw new Error("Access token not found");
  }

  return requestJson<ApiResponse<Post>>(
    `${getApiUrl()}/posts/create-post`,
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId,
      },
    }
  ).then((data) => assertSuccess(data, "Failed to create post"));
};

export const getAllPosts = async (
  params?: FeedQuery,
): Promise<FeedPostsResponse> => {
  const tenantId = getClientTenantId();
  const suffix = buildFeedQuery(params);

  const data = await requestJson<FeedPostsResponse>(
    `${getApiUrl()}/posts${suffix}`,
    {
      cache: "no-store",
      headers: {
        "x-tenant-id": tenantId,
      },
    },
  );

  return assertSuccess(data, "Failed to fetch posts");
};

export const getMyPosts = async (params?: FeedQuery): Promise<FeedPostsResponse> => {
  const tenantId = getClientTenantId();
  const token = getAccessToken();
  const suffix = buildFeedQuery(params);
  if (!token) {
    throw new Error("Access token not found");
  }

  const data = await requestJson<FeedPostsResponse>(
    `${getApiUrl()}/posts/my${suffix}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId,
      },
    },
  );

  return assertSuccess(data, "Failed to fetch your posts");
};

export const togglePostLike = async (
  postId: string,
): Promise<ApiResponse<Post>> => {
  const tenantId = getClientTenantId();
  const token = getAccessToken();
  if (!token) {
    throw new Error("Access token not found");
  }

  const data = await requestJson<ApiResponse<Post>>(
    `${getApiUrl()}/posts/${postId}/toggle-like`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId,
      },
    },
  );

  return assertSuccess(data, "Failed to update like");
};

export const addPostComment = async (
  postId: string,
  text: string,
): Promise<ApiResponse<Post>> => {
  const tenantId = getClientTenantId();
  const token = getAccessToken();
  if (!token) {
    throw new Error("Access token not found");
  }

  const data = await requestJson<ApiResponse<Post>>(
    `${getApiUrl()}/posts/${postId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId,
      },
      body: JSON.stringify({ text }),
    },
  );

  return assertSuccess(data, "Failed to add comment");
};
