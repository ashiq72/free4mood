'use client'
import EditProfileCoverModal from '@/components/modules/profile/profileModal/EditProfileCoverModal';
import EditProfileFullModal from '@/components/modules/profile/profileModal/EditProfileFullModal';
import EditProfileImageModal from '@/components/modules/profile/profileModal/EditProfileImageModal';

import { Camera, Grid, ImageIcon, MoreHorizontal, PenSquare, Users, Video } from 'lucide-react';
import Image from 'next/image'
import { useState } from 'react';


// --- Types & Interfaces ---
interface TabItem {
  id: string;
  label: string;
  icon: any;
}
interface IUserInfo {
  name: string;
  about: string;
  bio: string;
  title: string;
  description: string;
  image?: string;
}
interface ProfileHeaderProps {
  userInfo: IUserInfo | null;
  loading: boolean;
  loadUser:  () => void;
}



export const ProfileHeader = ({ userInfo, loading, loadUser }: ProfileHeaderProps) => {


  const [activeTab, setActiveTab] = useState("posts");
  const [openFullModal, setOpenFullModal] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [openCoverModal, setOpenCoverModal] = useState(false);

  
  const tabs: TabItem[] = [
    { id: "posts", label: "Posts", icon: Grid },
    { id: "about", label: "About", icon: Users },
    { id: "friends", label: "Friends", icon: Users },
    { id: "photos", label: "Photos", icon: ImageIcon },
    { id: "videos", label: "Videos", icon: Video },
  ];
  return (
    <div><div className="bg-white dark:bg-zinc-900 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto">
          {/* Cover Photo */}
          <div className="relative h-64 md:h-80 w-full rounded-b-xl overflow-hidden group">
            <Image
              width={35}
              height={35}
              src="https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2940&auto=format&fit=crop"
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {/* Edit Cover Button */}
            <div>
              <button
                onClick={() => setOpenCoverModal(true)}
                className="absolute bottom-4 right-4 bg-white/80 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white transition-colors flex items-center gap-2"
              >
                <Camera className="w-4 h-4 cursor-pointer" />
                <span className="hidden sm:inline cursor-pointer">
                  Edit Cover Photo
                </span>
              </button>
              {/* Custom Popup */}
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
          </div>

          {/* Profile Info Area */}
          <div className="px-4 sm:px-8 pb-4">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-16 gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-gray-200">
                  <Image
                    width={35}
                    height={35}
                    src="https://picsum.photos/200?random=41"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <button
                    onClick={() => setOpenImageModal(true)}
                    className="absolute bottom-2 right-2 p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 transition-colors border border-white dark:border-black cursor-pointer"
                  >
                    <Camera className="w-4 h-4 cursor-pointer" />
                  </button>

                  {/* Custom Popup */}
                  <EditProfileImageModal
                    openImageModal={openImageModal}
                    onClose={() => setOpenImageModal(false)}
                  >
                    <h2 className="text-xl font-semibold mb-2 cursor-pointer">Edit Profile</h2>
                    <p className="text-sm text-zinc-500 mb-4">
                      Set the dimensions for the layer.
                    </p>
                  </EditProfileImageModal>
                </div>
              </div>

              {/* Name & Headline */}
              <div className="flex-1 mt-2 md:mt-0 md:mb-0">
                {loading ? (
                  <NameSkeleton />
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {userInfo?.name}
                    </h1>

                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      <span>{ userInfo?.bio ? `${userInfo?.bio} • `: '' } </span> 0 followers
                    </p>
                  </>
                )}
                {/* Followers Thumbnails (Optional UI Candy) */}
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                      <Image
                        width={35}
                        height={35}
                        key={i}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900"
                        src={`https://picsum.photos/100?random=${i}`}
                        alt=""
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    Followed by DesignTeam + 1 others
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-0 md:mt-0 md:mb-0 w-full md:w-auto">
                <div>
                  <button
                    onClick={() => setOpenFullModal(true)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <PenSquare className="w-4 h-4" />
                    Edit Profile
                  </button>

                  {/* Custom Popup */}
                  <EditProfileFullModal
                    openFullModal={openFullModal}
                    onClose={() => setOpenFullModal(false)}
                    loadUser={loadUser}
                    
                  >
                    
                  </EditProfileFullModal>
                </div>

                <button className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 mt-6 border-t border-gray-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer
                    ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div></div>
  )
}


const NameSkeleton = () => (
  <div className="space-y-2">
    <div className="h-7 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
    <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
  </div>
);