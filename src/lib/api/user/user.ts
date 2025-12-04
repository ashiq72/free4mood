// src/lib/api/user.ts

export async function createUser(payload: any) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/create-user`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "User creation failed");
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
}
