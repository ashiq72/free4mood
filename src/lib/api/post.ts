const BASE_URL = "https://base360.vercel.app/api/v1/";

interface PostData {
  [key: string]: unknown;
}

export const createPost = async (postData: PostData) => {
  try {
    const response = await fetch(`http://localhost:4000/api/v1/posts/`, {
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
  const response = await fetch(`http://localhost:4000/api/v1/posts/`);
  return response.json();
};
