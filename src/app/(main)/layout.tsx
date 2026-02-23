import Navbar from "@/features/layout/components/Navbar";
import { getCurrentUser } from "@/lib/api/auth.server";
import Providers from "@/shared/providers/Providers";

const CommonLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();

  return (
    <div>
      <Providers user={user}>
        <Navbar />
        {children}
      </Providers>
    </div>
  );
};

export default CommonLayout;
