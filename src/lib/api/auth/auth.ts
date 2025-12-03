export const loginUser = async (payload: any) => {
  try {
<<<<<<< HEAD
    const res = await fetch(`https://base360.vercel.app/api/v1/auth/login`, {
=======
    const res = await fetch(`https://base360.onrender.com/v1/auth/login`, {
>>>>>>> afd6e61e70195658c75e3c62df3e205c25b281b2
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // VERY IMPORTANT: cookies (refresh token) send/receive
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed!");
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
};
