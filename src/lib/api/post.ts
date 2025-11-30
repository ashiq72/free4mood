const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://base360.vercel.app/api/v1/";

export const createPost = async (postData: any) => {
  try {
    const response = await fetch(`${BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    return response.json();
  } catch (error) {
    console.error("Error creating post:", error);
  }
};

export const getPosts = async () => {
  const response = await fetch(`${BASE_URL}/posts`);
  return response.json();
};
