"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ProfileHeader } from "@/features/profile/components/main/ProfileHeader";
import { ProfileMain } from "@/features/profile/components/main/ProfileMain";
import { splitMediaUrls } from "@/features/profile/media";
import type { IUserInfo, ProfileTabKey } from "@/features/profile/types";
import { getUserPosts } from "@/lib/api/post";
import {
  getFollowerUsers,
  getSocialProfile,
  type FollowUser,
} from "@/lib/api/social";
import { useUser } from "@/shared/context/UserContext";

export default function PublicProfilePage() {
  const { user } = useUser();
  const params = useParams<{ username?: string }>();
  const rawParam = decodeURIComponent(params?.username || "").trim();
  const profileUserId = useMemo(
    () => rawParam.match(/[0-9a-fA-F]{24}/)?.[0] || "",
    [rawParam],
  );

  const [activeTab, setActiveTab] = useState<ProfileTabKey>("posts");
  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
  const [friendsPreview, setFriendsPreview] = useState<FollowUser[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string[]>([]);
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });
  const [friendCount, setFriendCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    if (!profileUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [profileRes, followerRes, postRes] = await Promise.all([
        getSocialProfile(profileUserId),
        getFollowerUsers(profileUserId, { limit: 80 }),
        getUserPosts(profileUserId, { limit: 80 }),
      ]);

      const payload = profileRes.data;
      setUserInfo((payload?.user || null) as IUserInfo | null);
      const profileMedia = Array.isArray(payload?.photos) ? payload.photos : [];
      const postMedia = Array.isArray(postRes.data)
        ? postRes.data
            .map((post) => post.image)
            .filter((url): url is string => typeof url === "string" && !!url)
        : [];
      const { photos, videos } = splitMediaUrls([...profileMedia, ...postMedia]);
      setPhotoPreview(photos);
      setVideoPreview(videos);
      setFollowStats({
        followers: Number(payload?.followStats?.followers || 0),
        following: Number(payload?.followStats?.following || 0),
      });
      setFriendCount(Number(payload?.friendStats?.friends || 0));
      setFriendsPreview(Array.isArray(followerRes.data) ? followerRes.data : []);
    } catch (error) {
      console.error(error);
      setUserInfo(null);
      setFriendsPreview([]);
      setPhotoPreview([]);
      setVideoPreview([]);
      setFollowStats({ followers: 0, following: 0 });
      setFriendCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUserId]);

  useEffect(() => {
    setActiveTab("posts");
  }, [profileUserId]);

  if (!profileUserId) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
        Invalid profile link.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black pb-20">
      <ProfileHeader
        userInfo={userInfo}
        loading={loading}
        loadUser={loadProfile}
        followStats={followStats}
        friendCount={friendCount}
        friendPreview={friendsPreview}
        coverImage={userInfo?.coverImage || photoPreview[0]}
        isOwnProfile={Boolean(user?.userId && user.userId === profileUserId)}
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
        feedScope="user"
        profileUserId={profileUserId}
        activeTab={activeTab}
      />
    </div>
  );
}
