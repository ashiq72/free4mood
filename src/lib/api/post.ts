"use client";

import { assertSuccess, requestJson } from "./client";
import { getApiUrl, getTenantIdFallback } from "./config";
import type { ApiResponse } from "./types";
import type { Post } from "@/features/feed/types";

const getClientTenantId = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const parts = host.split(".");
    if (parts.length > 1 && parts[0]) return parts[0];
  }
  return getTenantIdFallback();
};

const getAccessToken = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
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

export const getAllPosts = async (): Promise<ApiResponse<Post[]>> => {
  const tenantId = getClientTenantId();

  const data = await requestJson<ApiResponse<Post[]>>(`${getApiUrl()}/posts/`, {
    cache: "no-store",
    headers: {
      "x-tenant-id": tenantId,
    },
  });

  return assertSuccess(data, "Failed to fetch posts");
};

export const getMyPosts = async (): Promise<ApiResponse<Post[]>> => {
  const tenantId = getClientTenantId();
  const token = getAccessToken();
  if (!token) {
    throw new Error("Access token not found");
  }

  const data = await requestJson<ApiResponse<Post[]>>(`${getApiUrl()}/posts/my`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-tenant-id": tenantId,
    },
  });

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
