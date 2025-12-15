"use server";

import { cookies } from "next/headers";
const tenantId = "free4mood";
export const createPost = async (formData: FormData) => {
  try {
    const cookieStore = await cookies(); // ✅ await added
    const token = cookieStore.get("accessToken")?.value;

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
      throw new Error("Failed to create post");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getAllPosts = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  return response.json();
};
