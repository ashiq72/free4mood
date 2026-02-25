"use server";

import { cookies, headers } from "next/headers";
import { assertSuccess, requestJson } from "./client";
import { getApiUrl, getTenantIdFallback } from "./config";
import type { ApiResponse } from "./types";
import type { Post } from "@/features/feed/types";

const getTenantId = async () => {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const parts = host.split(".");
  if (parts.length > 1 && parts[0]) return parts[0];
  return getTenantIdFallback();
};

const getAccessToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value ?? null;
};

export const createPost = async (
  formData: FormData
): Promise<ApiResponse<Post>> => {
  const token = await getAccessToken();
  const tenantId = await getTenantId();

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
  const tenantId = await getTenantId();

  const data = await requestJson<ApiResponse<Post[]>>(`${getApiUrl()}/posts/`, {
    cache: "no-store",
    headers: {
      "x-tenant-id": tenantId,
    },
  });

  return assertSuccess(data, "Failed to fetch posts");
};
