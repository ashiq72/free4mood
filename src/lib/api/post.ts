// No need PostData interface anymore
// We are using FormData for file + text upload

export const createPost = async (formData: FormData) => {
  try {
    const response = await fetch(
      `https://base360.onrender.com/api/v1/posts/create-post`,
      {
        method: "POST",
        body: formData, // ⭐ Correct
        // ❌ DO NOT set Content-Type
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getAllPosts = async () => {
  const response = await fetch(`https://base360.onrender.com/api/v1/posts/`);
  return response.json();
};
