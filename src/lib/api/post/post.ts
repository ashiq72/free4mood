"use server";

import { cookies, headers } from "next/headers"; // ১. headers ইম্পোর্ট করুন

// হেল্পার ফাংশন: বর্তমান ইউজার কোন সাবডোমেইনে আছে তা বের করা
async function getTenantId() {
  const headersList = await headers();
  const host = headersList.get("host") || ""; // e.g. "shop1.localhost:3000" or "shop1.saas.com"

  // আপনার ডোমেইন লজিক অনুযায়ী পার্স করুন
  // এখানে সিম্পল লজিক: প্রথম অংশটাই টেন্যান্ট আইডি
  const parts = host.split(".");
  if (parts.length > 1) {
    return parts[0]; // "shop1"
  }
  return "default"; // অথবা null রিটার্ন করে এরর থ্রো করতে পারেন
}

export const createPost = async (formData: FormData) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    // ২. ডায়নামিক টেন্যান্ট আইডি বের করা
    // const tenantId = await getTenantId();
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
          "x-tenant-id": tenantId, // ✅ ডায়নামিক আইডি পাঠানো হচ্ছে
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
  // ৩. GET রিকোয়েস্টেও টেন্যান্ট আইডি পাঠাতে হবে
  // const tenantId = await getTenantId();
  const tenantId = "free4mood";

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/`, {
    cache: "no-store",
    headers: {
      "x-tenant-id": tenantId, // ✅ মিসিং ছিল, এখন ঠিক আছে
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  return response.json();
};
