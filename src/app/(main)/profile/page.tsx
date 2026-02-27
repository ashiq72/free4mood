"use client";

import { ProfileHeader } from "@/features/profile/components/main/ProfileHeader";
import { ProfileMain } from "@/features/profile/components/main/ProfileMain";
import { splitMediaUrls } from "@/features/profile/media";
import type { IUserInfo, ProfileTabKey } from "@/features/profile/types";
import { getMyPosts } from "@/lib/api/post";
import { getFollowStats, getMyFriends, type FollowUser } from "@/lib/api/social";
import { getMe } from "@/lib/api/user";
import { useEffect, useState } from "react";

export default function Profile() {
  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("posts");
  const [friendsPreview, setFriendsPreview] = useState<FollowUser[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await getMe<IUserInfo>();
      const me = res.data;
      setUserInfo(me);

      const profileId = me?._id;
      if (profileId) {
        const [statsRes, friendsRes, postsRes] = await Promise.all([
          getFollowStats(profileId),
          getMyFriends({ limit: 80 }),
          getMyPosts({ limit: 80 }),
        ]);

        setFollowStats({
          followers: Number(statsRes.data?.followers || 0),
          following: Number(statsRes.data?.following || 0),
        });

        const friends = Array.isArray(friendsRes.data) ? friendsRes.data : [];
        setFriendsPreview(friends);

        const posts = Array.isArray(postsRes.data) ? postsRes.data : [];
        const mediaUrls = posts
          .map((post) => post.image)
          .filter((url): url is string => typeof url === "string" && !!url);
        const { photos, videos } = splitMediaUrls(mediaUrls);
        setPhotoPreview(photos);
        setVideoPreview(videos);
      } else {
        setFollowStats({ followers: 0, following: 0 });
        setFriendsPreview([]);
        setPhotoPreview([]);
        setVideoPreview([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black pb-20">
      <ProfileHeader
        userInfo={userInfo}
        loading={loading}
        loadUser={loadUser}
        followStats={followStats}
        friendCount={friendsPreview.length}
        friendPreview={friendsPreview}
        coverImage={userInfo?.coverImage || photoPreview[0]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabCounts={{
          friends: friendsPreview.length,
          photos: photoPreview.length,
          videos: videoPreview.length,
        }}
      />
      <ProfileMain
        userInfo={userInfo}
        loading={loading}
        friends={friendsPreview}
        photos={photoPreview}
        videos={videoPreview}
        activeTab={activeTab}
      />
    </div>
  );
}
