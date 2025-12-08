import Navber from "@/components/layout/Navber";
import { getCurrentUser } from "@/lib/api/auth/auth";
import Providers from "@/providers/Providers";

const CommonLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();

  return (
    <div>
      <Providers user={user}>
        <Navber />
        {children}
      </Providers>
    </div>
  );
};

export default CommonLayout;
