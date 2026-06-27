import Navbar from "@/features/layout/components/Navbar";
import { getCurrentUser } from "@/lib/api/auth.server";
import { redirect } from "next/navigation";

const CommonLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default CommonLayout;
