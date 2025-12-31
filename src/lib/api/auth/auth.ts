"use server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { FieldValues } from "react-hook-form";

export const loginUser = async (payload: FieldValues) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_CORE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (data.success) {
      (await cookies()).set("accessToken", data.data.accessToken);
    }
    if (!res.ok) {
      throw new Error(data.message || "Login failed!");
    }
    return data;
  } catch (error: Error | unknown) {
    throw new Error(error instanceof Error ? error.message : "Something went wrong");
  }
};

export const getCurrentUser = async () => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  let decodedData: Record<string, unknown> | null = null;

  if (accessToken) {
    decodedData = jwtDecode(accessToken);

    return decodedData;
  } else {
    return null;
  }
};

export const logout = async () => {
  (await cookies()).delete("accessToken");
};
