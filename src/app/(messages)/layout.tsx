import Navber from "@/app/components/layout/Navber";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navber />
      {children}
    </div>
  );
};

export default CommonLayout;
