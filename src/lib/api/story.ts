"use client";

import { assertSuccess, requestJson } from "./client";
import { getApiUrl } from "./config";
import { getAccessToken, getClientTenantId } from "./session";
import type { ApiResponse } from "./types";

export type StoryUser = {
  _id?: string;
  name?: string;
  image?: string;
};

export type Story = {
  _id?: string;
  image?: string;
  caption?: string;
  createdAt?: string;
  expiresAt?: string;
  user?: StoryUser;
};

const withAuthHeaders = (json = false) => {
  const token = getAccessToken();
  if (!token) throw new Error("Access token not found");
  return {
    Authorization: `Bearer ${token}`,
    "x-tenant-id": getClientTenantId(),
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
};

export const createStory = async (
  formData: FormData,
): Promise<ApiResponse<Story>> => {
  const data = await requestJson<ApiResponse<Story>>(
    `${getApiUrl()}/stories/create-story`,
    {
      method: "POST",
      headers: withAuthHeaders(),
      body: formData,
    },
  );
  return assertSuccess(data, "Failed to create story");
};

export const getStoryFeed = async (): Promise<ApiResponse<Story[]>> => {
  const data = await requestJson<ApiResponse<Story[]>>(
    `${getApiUrl()}/stories/feed`,
    {
      cache: "no-store",
      headers: withAuthHeaders(),
    },
  );
  return assertSuccess(data, "Failed to fetch stories");
};

export const deleteStory = async (storyId: string): Promise<ApiResponse<null>> => {
  const data = await requestJson<ApiResponse<null>>(
    `${getApiUrl()}/stories/${encodeURIComponent(storyId)}`,
    {
      method: "DELETE",
      headers: withAuthHeaders(),
    },
  );
  return assertSuccess(data, "Failed to delete story");
};

