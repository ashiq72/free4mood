"use client";

import { useState } from "react";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  MoreHorizontal,
  Image as ImageIcon,
  Users,
  Grid,
  Camera,
  PenSquare,
  Heart,
  MessageCircle,
  Share2,
  Video,
} from "lucide-react";

// --- Types & Interfaces ---
interface TabItem {
  id: string;
  label: string;
  icon: any;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");

  const tabs: TabItem[] = [
    { id: "posts", label: "Posts", icon: Grid },
    { id: "about", label: "About", icon: Users }, // Contextual icon
    { id: "friends", label: "Friends", icon: Users },
    { id: "photos", label: "Photos", icon: ImageIcon },
    { id: "videos", label: "Videos", icon: Video },
  ];

  return (
    <div className='min-h-screen bg-gray-100 dark:bg-black pb-20'>
      {/* 1. Profile Header Section (Cover + Info) */}
      <div className='bg-white dark:bg-zinc-900 shadow-sm mb-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Cover Photo */}
          <div className='relative h-64 md:h-80 w-full rounded-b-xl overflow-hidden group'>
            <img
              src='https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2940&auto=format&fit=crop'
              alt='Cover'
              className='w-full h-full object-cover'
            />
            {/* Edit Cover Button */}
            <button className='absolute bottom-4 right-4 bg-white/80 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white transition-colors flex items-center gap-2'>
              <Camera className='w-4 h-4' />
              <span className='hidden sm:inline'>Edit Cover Photo</span>
            </button>
          </div>

          {/* Profile Info Area */}
          <div className='px-4 sm:px-8 pb-4'>
            <div className='flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-16 gap-6'>
              {/* Profile Picture */}
              <div className='relative'>
                <div className='w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-gray-200'>
                  <img
                    src='https://picsum.photos/200?random=41'
                    alt='Profile'
                    className='w-full h-full object-cover'
                  />
                </div>
                <button className='absolute bottom-2 right-2 p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 transition-colors border border-white dark:border-black'>
                  <Camera className='w-4 h-4' />
                </button>
              </div>

              {/* Name & Headline */}
              <div className='flex-1 mt-2 md:mt-0 md:mb-4'>
                <h1 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white'>
                  Safayet Hossain
                </h1>
                <p className='text-gray-500 dark:text-gray-400 font-medium'>
                  Web Designer & Developer • 2.4k followers
                </p>

                {/* Followers Thumbnails (Optional UI Candy) */}
                <div className='flex items-center gap-1 mt-2'>
                  <div className='flex -space-x-2 overflow-hidden'>
                    {[1, 2, 3].map((i) => (
                      <img
                        key={i}
                        className='inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900'
                        src={`https://picsum.photos/100?random=${i}`}
                        alt=''
                      />
                    ))}
                  </div>
                  <span className='text-xs text-gray-500 ml-2'>
                    Followed by DesignTeam + 12 others
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center gap-3 mt-4 md:mt-0 md:mb-6 w-full md:w-auto'>
                <button className='flex-1 md:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2'>
                  <PenSquare className='w-4 h-4' />
                  Edit Profile
                </button>
                <button className='px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors'>
                  <MoreHorizontal className='w-5 h-5' />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className='flex items-center gap-1 mt-8 border-t border-gray-200 dark:border-zinc-800 overflow-x-auto no-scrollbar'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }
                  `}
                >
                  <tab.icon className='w-4 h-4' />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* LEFT SIDEBAR (Intro, Photos, Friends) */}
          <div className='space-y-6'>
            {/* Intro Card */}
            <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-zinc-800'>
              <h2 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>
                Intro
              </h2>
              <div className='space-y-4'>
                <p className='text-sm text-center text-gray-600 dark:text-gray-300'>
                  Passionate about building beautiful user interfaces. 🎨 code
                  is poetry.
                </p>
                <div className='border-t border-gray-100 dark:border-zinc-800 my-4'></div>

                <div className='space-y-3'>
                  <div className='flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300'>
                    <MapPin className='w-5 h-5 text-gray-400' />
                    <span>
                      Lives in{" "}
                      <strong className='text-gray-900 dark:text-white'>
                        Dhaka, Bangladesh
                      </strong>
                    </span>
                  </div>
                  <div className='flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300'>
                    <LinkIcon className='w-5 h-5 text-gray-400' />
                    <a href='#' className='text-blue-600 hover:underline'>
                      safayet.design
                    </a>
                  </div>
                  <div className='flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300'>
                    <Calendar className='w-5 h-5 text-gray-400' />
                    <span>Joined October 2023</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Photos Preview Card */}
            <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-zinc-800'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-lg font-bold text-gray-900 dark:text-white'>
                  Photos
                </h2>
                <a href='#' className='text-sm text-blue-600 hover:underline'>
                  See all
                </a>
              </div>
              <div className='grid grid-cols-3 gap-2'>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div
                    key={i}
                    className='aspect-square rounded-lg overflow-hidden bg-gray-100'
                  >
                    <img
                      src={`https://picsum.photos/300?random=${i + 10}`}
                      alt='Gallery'
                      className='w-full h-full object-cover hover:scale-110 transition-transform duration-300'
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Friends Preview Card */}
            <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-zinc-800'>
              <div className='flex justify-between items-center mb-4'>
                <div>
                  <h2 className='text-lg font-bold text-gray-900 dark:text-white'>
                    Friends
                  </h2>
                  <p className='text-xs text-gray-500'>1,245 friends</p>
                </div>
                <a href='#' className='text-sm text-blue-600 hover:underline'>
                  See all
                </a>
              </div>
              <div className='grid grid-cols-3 gap-4'>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className='text-center'>
                    <div className='aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2'>
                      <img
                        src={`https://picsum.photos/200?random=${i + 50}`}
                        alt='Friend'
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <p className='text-xs font-semibold text-gray-900 dark:text-white truncate'>
                      Friend Name
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT MAIN CONTENT (Feed) */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Create Post Input */}
            <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-zinc-800'>
              <div className='flex gap-4'>
                <img
                  src='https://picsum.photos/200?random=41'
                  alt='Me'
                  className='w-10 h-10 rounded-full object-cover'
                />
                <div className='flex-1'>
                  <input
                    type='text'
                    placeholder="What's on your mind, Safayet?"
                    className='w-full h-10 px-4 bg-gray-100 dark:bg-zinc-800 rounded-full text-sm focus:outline-none hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors'
                  />
                </div>
              </div>
              <div className='flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800'>
                <div className='flex gap-2'>
                  <button className='flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors'>
                    <Video className='w-5 h-5 text-red-500' />
                    <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                      Live Video
                    </span>
                  </button>
                  <button className='flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors'>
                    <ImageIcon className='w-5 h-5 text-green-500' />
                    <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                      Photo/Video
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pinned/Featured Post */}
            <PostCard
              image='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'
              text="Just finished working on the new Bponi Suite dashboard design! 🚀 Using Rust for backend and Flutter for the app. It's blazing fast."
              time='2 hours ago'
              likes='234'
              comments='45'
            />

            {/* Text Only Post */}
            <PostCard
              text='Does anyone have a good recommendation for a Rust API schema library? Need something robust for version management.'
              time='5 hours ago'
              likes='89'
              comments='12'
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Component: Post Card ---
const PostCard = ({
  image,
  text,
  time,
  likes,
  comments,
}: {
  image?: string;
  text: string;
  time: string;
  likes: string;
  comments: string;
}) => {
  return (
    <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden'>
      {/* Post Header */}
      <div className='p-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <img
            src='https://picsum.photos/200?random=41'
            alt='User'
            className='w-10 h-10 rounded-full object-cover'
          />
          <div>
            <h3 className='font-semibold text-gray-900 dark:text-white text-sm'>
              Safayet Hossain
            </h3>
            <p className='text-xs text-gray-500'>{time}</p>
          </div>
        </div>
        <button className='text-gray-400 hover:text-gray-600'>
          <MoreHorizontal className='w-5 h-5' />
        </button>
      </div>

      {/* Post Content */}
      <div className='px-4 pb-2'>
        <p className='text-gray-800 dark:text-gray-200 text-sm mb-3 leading-relaxed'>
          {text}
        </p>
      </div>

      {image && (
        <div className='w-full h-80 bg-gray-100'>
          <img
            src={image}
            alt='Post Content'
            className='w-full h-full object-cover'
          />
        </div>
      )}

      {/* Post Stats */}
      <div className='px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 dark:border-zinc-800'>
        <div className='flex items-center gap-1'>
          <div className='bg-blue-500 p-1 rounded-full'>
            <Heart className='w-2 h-2 text-white fill-current' />
          </div>
          <span>{likes} likes</span>
        </div>
        <span>{comments} comments • 5 shares</span>
      </div>

      {/* Action Buttons */}
      <div className='px-2 py-1 flex items-center justify-between'>
        <button className='flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 font-medium text-sm group'>
          <Heart className='w-5 h-5 group-hover:text-red-500 transition-colors' />
          Like
        </button>
        <button className='flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 font-medium text-sm'>
          <MessageCircle className='w-5 h-5' />
          Comment
        </button>
        <button className='flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 font-medium text-sm'>
          <Share2 className='w-5 h-5' />
          Share
        </button>
      </div>
    </div>
  );
};
