"use client";

import { ProfileHeader } from "@/components/modules/profile/profileMain/ProfileHeader";
import { ProfileMain } from "@/components/modules/profile/profileMain/ProfileMain";
import { getMe } from "@/lib/api/user/user";
import { IUserInfo } from "@/types/TProfile";
import { useEffect, useState } from "react";


export default function Profile() {
  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ reusable fetch function
  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await getMe();
      setUserInfo(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // first load
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black pb-20">
      {/* Profile Header */}
      <ProfileHeader
        userInfo={userInfo}
        loading={loading}
        loadUser={loadUser} // ✅ important
      />

      {/* Main Content */}
      <ProfileMain userInfo={userInfo} loading={loading} />
    </div>
  );
}
