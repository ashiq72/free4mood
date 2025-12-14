export const createPost = async (formData: FormData) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts/create-post`,
      {
        method: "POST",
        body: formData,
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getAllPosts = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/`);
  return response.json();
};
