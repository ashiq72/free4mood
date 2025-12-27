"use server";

import { cookies, headers } from "next/headers";

async function getTenantId() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const parts = host.split(".");
  if (parts.length > 1) {
    return parts[0]; // "shop1"
  }
  return "default";
}

export const createPost = async (formData: FormData) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const tenantId = "free4mood";

    if (!token) {
      throw new Error("Access token not found");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts/create-post`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create post");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getAllPosts = async () => {
  // const tenantId = await getTenantId();
  const tenantId = "free4mood";

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/`, {
    cache: "no-store",
    headers: {
      "x-tenant-id": tenantId,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  return response.json();
};
