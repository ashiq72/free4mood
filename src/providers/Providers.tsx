"use client";

import UserProvider from "@/context/UserContext";

export default function Providers({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  return <UserProvider initialUser={user}>{children}</UserProvider>;
}
