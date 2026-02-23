"use client";

import UserProvider from "@/shared/context/UserContext";
import type { IUser } from "@/shared/types/user";

export default function Providers({
  children,
  user,
}: {
  children: React.ReactNode;
  user: IUser | null;
}) {
  return <UserProvider initialUser={user}>{children}</UserProvider>;
}
