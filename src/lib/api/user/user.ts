export async function createUser(payload: any) {
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
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
}
