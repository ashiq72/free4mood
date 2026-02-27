"use client";

import { ProfileHeader } from "@/features/profile/components/main/ProfileHeader";
import { ProfileMain } from "@/features/profile/components/main/ProfileMain";
import type { IUserInfo } from "@/features/profile/types";
import { getFollowStats } from "@/lib/api/social";
import { getMe } from "@/lib/api/user";
import { useEffect, useState } from "react";

export default function Profile() {
  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await getMe<IUserInfo>();
      setUserInfo(res.data);

      const profileId = (res.data as IUserInfo | null)?._id;
      if (profileId) {
        const statsRes = await getFollowStats(profileId);
        setFollowStats({
          followers: Number(statsRes.data?.followers || 0),
          following: Number(statsRes.data?.following || 0),
        });
      } else {
        setFollowStats({ followers: 0, following: 0 });
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
      />
      <ProfileMain userInfo={userInfo} loading={loading} />
    </div>
  );
}
