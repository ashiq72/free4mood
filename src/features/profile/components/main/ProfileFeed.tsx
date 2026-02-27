import { Feed } from "@/features/feed/components/Feed";
import { CreatePostBox } from "@/features/feed/components/CreatePostBox";

interface ProfileFeedProps {
  scope?: "my" | "user";
  targetUserId?: string;
}

export const ProfileFeed = ({ scope = "my", targetUserId }: ProfileFeedProps) => {
  return (
    <div>
      <div className="lg:col-span-2 space-y-6">
        {scope === "my" && <CreatePostBox />}
        <Feed scope={scope} targetUserId={targetUserId} />
      </div>
    </div>
  );
};
