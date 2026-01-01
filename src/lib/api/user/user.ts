import { IFormInput } from "@/types/auth";


export async function createUser(payload: IFormInput) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user-info/create-user-info`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json().catch(() => {
      throw new Error("Server returned invalid JSON");
    });

    if (!res.ok) {
      throw new Error(data.message || "Failed to create user");
    }

    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Something went wrong"
    );
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

// lib/api/user/user.ts
// lib/api/user/user.ts
export const updateUser = async (data: FormData | Record<string, unknown>) => {
  const isFormData = data instanceof FormData;

  const res = await fetch("/api/userinfo", {
    method: "PATCH",
    headers: isFormData
      ? undefined
      : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to update user info");
  }

  return result;
};


