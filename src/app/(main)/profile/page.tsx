"use client";

import { ProfileHeader } from "@/features/profile/components/main/ProfileHeader";
import { ProfileMain } from "@/features/profile/components/main/ProfileMain";
import { getMe } from "@/lib/api/user";
import type { IUserInfo } from "@/features/profile/types";
import { useEffect, useState } from "react";

export default function Profile() {
  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ reusable fetch function
  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await getMe<IUserInfo>();
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
