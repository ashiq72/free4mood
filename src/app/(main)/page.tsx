import { CreatePostBox } from "@/features/feed/components/CreatePostBox";
import { Feed } from "@/features/feed/components/Feed";
import { LeftSidebar } from "@/features/feed/components/LeftSidebar";
import { RightSidebar } from "@/features/feed/components/RightSidebar";
import { Stories } from "@/features/feed/components/Stories";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-black pt-2">
      <div className="flex justify-between max-w-[1920px] mx-auto px-0 sm:px-4 gap-8 relative">
        {/* --- LEFT SIDEBAR (Navigation) --- */}
        <div className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
          <LeftSidebar />
        </div>

        {/* --- MIDDLE (Feed & Stories) --- */}
        <div className="flex-1 min-w-0 max-w-[700px] mx-auto">
          <Stories />
          <div className="pb-1">
            <CreatePostBox />
          </div>
          <Feed />
        </div>

        {/* --- RIGHT SIDEBAR (Contacts & Requests) --- */}
        <div className="hidden xl:block w-[280px] xl:w-[320px] shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
