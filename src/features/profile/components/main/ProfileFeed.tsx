import { Feed } from "@/features/feed/components/Feed";
import { CreatePostBox } from "@/features/feed/components/CreatePostBox";

export const ProfileFeed = () => {
  return (
    <div>
      <div className="lg:col-span-2 space-y-6">
        <CreatePostBox />
        <Feed scope="my" />
      </div>
    </div>
  );
};
