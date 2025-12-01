export const loginUser = async (payload: any) => {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/auth/login`, {
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
