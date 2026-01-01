

export async function createUser(payload: Record<string, unknown>) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user-info/create-user-info`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    let data;

    try {
      // Try to parse JSON safely
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid JSON");
    }

    if (!res.ok) {
      throw new Error(data.message || "Failed to create user");
    }

    return data;
  } catch (error: Error | unknown) {
    throw new Error(error instanceof Error ? error.message : "Something went wrong");
  }
}


export const getMe = async () => {
  const res = await fetch("/api/me", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
};
