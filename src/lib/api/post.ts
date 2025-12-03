// const BASE_URL = "https://base360.vercel.app/api/v1/";

interface PostData {
  [key: string]: unknown;
}

export const createPost = async (formData: FormData) => {
  try {
    const response = await fetch(
      `https://base360.onrender.com/api/v1/posts/create-post`,
      {
        method: "POST",
        body: formData, // ⭐ MUST use FormData
        // ❌ DO NOT set Content-Type manually
      }
    );

    return response.json();
  } catch (error) {
    console.error("Error creating post:", error);
  }
};

export const getAllPosts = async () => {
  const response = await fetch(`https://base360.onrender.com/api/v1/posts/`);
  return response.json();
};
