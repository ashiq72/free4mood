"use client";

import EditProfileCoverModal from "@/features/profile/components/modal/EditProfileCoverModal";
import EditProfileFullModal from "@/features/profile/components/modal/EditProfileFullModal";
import EditProfileImageModal from "@/features/profile/components/modal/EditProfileImageModal";
import type { IUserInfo, ProfileTabKey } from "@/features/profile/types";
import type { FollowUser } from "@/lib/api/social";
import {
  Camera,
  CircleUserRound,
  Grid,
  ImageIcon,
  LucideIcon,
  MoreHorizontal,
  PenSquare,
  Users,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface TabItem {
  id: ProfileTabKey;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface ProfileHeaderProps {
  userInfo: IUserInfo | null;
  loading: boolean;
  loadUser: () => void;
  followStats?: {
    followers: number;
    following: number;
  };
  friendPreview?: FollowUser[];
  coverImage?: string;
  isOwnProfile?: boolean;
  activeTab: ProfileTabKey;
  onTabChange: (tab: ProfileTabKey) => void;
  tabCounts?: Partial<Record<ProfileTabKey, number>>;
}

export const ProfileHeader = ({
  userInfo,
  loading,
  loadUser,
  followStats,
  friendPreview,
  coverImage,
  isOwnProfile = true,
  activeTab,
  onTabChange,
  tabCounts,
}: ProfileHeaderProps) => {
  const [openFullModal, setOpenFullModal] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [openCoverModal, setOpenCoverModal] = useState(false);

  const tabs: TabItem[] = [
    { id: "posts", label: "Posts", icon: Grid, count: tabCounts?.posts },
    { id: "about", label: "About", icon: CircleUserRound },
    { id: "friends", label: "Friends", icon: Users, count: tabCounts?.friends },
    { id: "photos", label: "Photos", icon: ImageIcon, count: tabCounts?.photos },
    { id: "videos", label: "Videos", icon: Video, count: tabCounts?.videos },
  ];

  return (
    <div className="mb-6">
      <div className="bg-white dark:bg-zinc-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="relative h-48 sm:h-56 md:h-72 w-full rounded-b-2xl overflow-hidden group">
            <Image
              width={1600}
              height={720}
              src={
                coverImage ||
                "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2940&auto=format&fit=crop"
              }
              alt="Cover"
              className="w-full h-full object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
            {isOwnProfile && (
              <div>
                <button
                  onClick={() => setOpenCoverModal(true)}
                  className="absolute bottom-4 right-4 bg-white/85 dark:bg-black/55 backdrop-blur-md px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-white transition-colors flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 cursor-pointer" />
                  <span className="hidden sm:inline cursor-pointer">
                    Edit Cover Photo
                  </span>
                </button>
                <EditProfileCoverModal
                  openCoverModal={openCoverModal}
                  onClose={() => setOpenCoverModal(false)}
                >
                  <h2 className="text-xl font-semibold mb-2">Edit Cover Photo</h2>
                  <p className="text-sm text-zinc-500 mb-4">
                    Set the dimensions for the layer.
                  </p>
                </EditProfileCoverModal>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-8 pb-4">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-16 gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-gray-200 shadow-lg">
                  <Image
                    width={160}
                    height={160}
                    src={userInfo?.image || "https://via.placeholder.com/160"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                {isOwnProfile && (
                  <div>
                    <button
                      onClick={() => setOpenImageModal(true)}
                      className="absolute bottom-2 right-2 p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 transition-colors border border-white dark:border-black cursor-pointer"
                    >
                      <Camera className="w-4 h-4 cursor-pointer" />
                    </button>

                    <EditProfileImageModal
                      openImageModal={openImageModal}
                      onClose={() => setOpenImageModal(false)}
                      loadUser={loadUser}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 mt-2 md:mt-0 md:mb-0">
                {loading ? (
                  <NameSkeleton />
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {userInfo?.name || "Unknown User"}
                    </h1>

                    <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">
                      <span>{userInfo?.bio ? `${userInfo.bio} · ` : ""}</span>
                      {followStats?.followers ?? 0} followers ·{" "}
                      {followStats?.following ?? 0} following
                    </p>
                  </>
                )}
                <div className="flex items-center gap-1 mt-2">
                  {(friendPreview?.length || 0) > 0 ? (
                    <div className="flex -space-x-2 overflow-hidden">
                      {friendPreview!.slice(0, 3).map((friend, i) => (
                        <Image
                          width={35}
                          height={35}
                          key={friend._id || i}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900"
                          src={
                            friend.image ||
                            `https://picsum.photos/100?random=${i + 1}`
                          }
                          alt={friend.name || "Friend"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-6" />
                  )}
                  <span className="text-xs text-gray-500 ml-2">
                    {(friendPreview?.length || 0) > 0
                      ? "Connected with your friends"
                      : "No friends to preview yet"}
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <div className="flex items-center gap-2 sm:gap-3 mt-0 md:mt-0 md:mb-0 w-full md:w-auto">
                  <div>
                    <button
                      onClick={() => setOpenFullModal(true)}
                      className="px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <PenSquare className="w-4 h-4" />
                      Edit Profile
                    </button>

                    <EditProfileFullModal
                      openFullModal={openFullModal}
                      onClose={() => setOpenFullModal(false)}
                      loadUser={loadUser}
                      userInfo={userInfo}
                    />
                  </div>

                  <button className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-gray-200 dark:border-zinc-800 pt-3 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 sm:px-5 py-2.5 text-sm font-semibold rounded-full border transition-colors whitespace-nowrap cursor-pointer
                    ${
                      activeTab === tab.id
                        ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-300"
                        : "border-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {typeof tab.count === "number" && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs ${
                        activeTab === tab.id
                          ? "bg-white text-blue-700 dark:bg-blue-800 dark:text-blue-100"
                          : "bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-zinc-200"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NameSkeleton = () => (
  <div className="space-y-2">
    <div className="h-7 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
    <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
  </div>
);
