import { IUserInfo } from "@/types/TProfile";
import { FriendsPreview } from "./FriendsPreview"
import { IntroCard } from "./IntroCard";

import { PhotosGrid } from "./PhotosGrid"
import { ProfileFeed } from "./ProfileFeed"

interface ProfileHeaderProps {
  userInfo: IUserInfo | null;
  loading: boolean;
}

export const ProfileMain = ({ userInfo, loading }: ProfileHeaderProps) => {
  return (
    <div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDEBAR (Intro, Photos, Friends) */}
          <div className="space-y-6">
            {/* Intro Card */}
         
          <IntroCard userInfo={userInfo} loading={loading} />
            {/* Photos Preview Card */}
          <PhotosGrid />

            {/* Friends Preview Card */}
          <FriendsPreview />
          </div>

          {/* RIGHT MAIN CONTENT (Feed) */}
         <ProfileFeed />
        </div>
      </div>
    </div>
  )
}
