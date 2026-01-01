'use client'
import { ProfileHeader } from "@/components/modules/profile/pofileHeader/ProfileHeader";
import { ProfileMain } from "@/components/modules/profile/profileMain/ProfileMain";
import { getMe } from "@/lib/api/user/user";
import { useEffect, useState } from "react";
interface IUserInfo {
  name: string;
  bio: string;
  title: string;
  description: string;
  image?: string;
}

export default function Profile() {
 
    const [userInfo, setUserInfo] = useState<IUserInfo[]>([]);
    const [loading, setLoading] = useState(true);
  
  useEffect(() => {
  const loadUser = async () => {
    try {
      const res = await getMe();
      setUserInfo(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadUser();
}, []);
  

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black pb-20">
      {/* 1. Profile Header Section (Cover + Info) */}
      <ProfileHeader userInfo={userInfo} loading={loading} />
      {/* 2. Main Content Grid */}
     <ProfileMain userInfo={userInfo} loading={loading} />
    </div>
  );
}
