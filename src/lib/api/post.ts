// No need PostData interface anymore
// We are using FormData for file + text upload

export const createPost = async (formData: FormData) => {
  try {
    const response = await fetch(
<<<<<<< HEAD
      `https://base360.onrender.com/api/v1/posts/create-post`,
=======
      "https://base360.onrender.com/api/v1/posts/create-post",
>>>>>>> afd6e61e70195658c75e3c62df3e205c25b281b2
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
<<<<<<< HEAD
  const response = await fetch(`https://base360.onrender.com/api/v1/posts/`);
=======
  const response = await fetch("https://base360.onrender.com/api/v1/posts/");
>>>>>>> afd6e61e70195658c75e3c62df3e205c25b281b2
  return response.json();
};
