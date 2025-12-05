// NO "use client"
import UserProvider from "@/context/UserContext";
import { getCurrentUser } from "@/lib/api/auth/auth";

export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser(); // server-side cookie decode

  return <UserProvider initialUser={user}>{children}</UserProvider>;
}
