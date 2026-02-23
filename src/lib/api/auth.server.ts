"use server";

import { jwtDecode, JwtPayload } from "jwt-decode";
import { cookies } from "next/headers";
import type { IUser } from "@/shared/types/user";

type AuthTokenPayload = IUser & JwtPayload;

export const getCurrentUser = async (): Promise<IUser | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return null;

  try {
    return jwtDecode<AuthTokenPayload>(accessToken) ?? null;
  } catch {
    return null;
  }
};

export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
};
