"use client";

import { useState } from "react";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

// --- Types ---
interface FriendRequest {
  id: number;
  name: string;
  avatar: string;
  mutual: number;
  time: string;
}

interface FriendSuggestion {
  id: number;
  name: string;
  avatar: string;
  mutual: number;
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<
    "suggestions" | "requests" | "all_friends"
  >("suggestions");

  // --- Mock Data ---
  const friendRequests: FriendRequest[] = [
    {
      id: 1,
      name: "Nusrat Jahan",
      avatar: "https://picsum.photos/200?random=101",
      mutual: 12,
      time: "2d",
    },
    {
      id: 2,
      name: "Rahim Ahmed",
      avatar: "https://picsum.photos/200?random=102",
      mutual: 5,
      time: "4d",
    },
    {
      id: 3,
      name: "Karim Ullah",
      avatar: "https://picsum.photos/200?random=103",
      mutual: 2,
      time: "1w",
    },
    {
      id: 4,
      name: "Sadiya Islam",
      avatar: "https://picsum.photos/200?random=104",
      mutual: 8,
      time: "1w",
    },
  ];

  const suggestions: FriendSuggestion[] = [
    {
      id: 1,
      name: "Tanvir Hasan",
      avatar: "https://picsum.photos/200?random=201",
      mutual: 3,
    },
    {
      id: 2,
      name: "Rifat Chowdhury",
      avatar: "https://picsum.photos/200?random=202",
      mutual: 15,
    },
    {
      id: 3,
      name: "Ayesha Siddiqua",
      avatar: "https://picsum.photos/200?random=203",
      mutual: 7,
    },
    {
      id: 4,
      name: "Mehedi Hasan",
      avatar: "https://picsum.photos/200?random=204",
      mutual: 1,
    },
    {
      id: 5,
      name: "Fahim Murshed",
      avatar: "https://picsum.photos/200?random=205",
      mutual: 4,
    },
    {
      id: 6,
      name: "Lamia Khan",
      avatar: "https://picsum.photos/200?random=206",
      mutual: 9,
    },
  ];

  return (
    <div className='max-w-5xl mx-auto pb-10'>
      {/* 1. Page Header & Tabs */}
      <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 mb-6 sticky top-20 z-30'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-4 mb-4'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
            <Users className='w-6 h-6' />
            Friends
          </h1>

          {/* Search Box */}
          <div className='relative w-full md:w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search Friends'
              className='w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20'
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className='flex gap-2 overflow-x-auto no-scrollbar pb-1'>
          <TabButton
            active={activeTab === "suggestions"}
            onClick={() => setActiveTab("suggestions")}
            label='Suggestions'
          />
          <TabButton
            active={activeTab === "requests"}
            onClick={() => setActiveTab("requests")}
            label='Friend Requests'
            count={friendRequests.length}
          />
          <TabButton
            active={activeTab === "all_friends"}
            onClick={() => setActiveTab("all_friends")}
            label='All Friends'
          />
        </div>
      </div>

      {/* 2. Content Sections */}
      <div className='space-y-8'>
        {/* --- FRIEND REQUESTS SECTION --- */}
        {(activeTab === "requests" || activeTab === "suggestions") && (
          <section>
            <div className='flex justify-between items-center mb-4 px-1'>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                Friend Requests
              </h2>
              <span className='text-blue-600 text-sm font-medium hover:underline cursor-pointer'>
                See all
              </span>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {friendRequests.map((friend) => (
                <div
                  key={friend.id}
                  className='bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-zinc-800'
                >
                  <div className='aspect-square relative cursor-pointer'>
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div className='p-3'>
                    <h3 className='font-semibold text-gray-900 dark:text-white truncate'>
                      {friend.name}
                    </h3>
                    <p className='text-xs text-gray-500 mb-3'>
                      {friend.mutual} mutual friends
                    </p>
                    <div className='flex flex-col gap-2'>
                      <button className='w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors'>
                        Confirm
                      </button>
                      <button className='w-full py-1.5 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors'>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className='border-t border-gray-200 dark:border-zinc-800 my-6'></div>

        {/* --- PEOPLE YOU MAY KNOW (SUGGESTIONS) --- */}
        {activeTab === "suggestions" && (
          <section>
            <div className='flex justify-between items-center mb-4 px-1'>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                People You May Know
              </h2>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {suggestions.map((friend) => (
                <div
                  key={friend.id}
                  className='bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-zinc-800'
                >
                  <div className='aspect-square relative cursor-pointer group'>
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    />
                  </div>
                  <div className='p-3'>
                    <h3 className='font-semibold text-gray-900 dark:text-white truncate'>
                      {friend.name}
                    </h3>
                    <p className='text-xs text-gray-500 mb-3'>
                      {friend.mutual} mutual friends
                    </p>
                    <div className='flex flex-col gap-2'>
                      <button className='w-full py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2'>
                        <UserPlus className='w-4 h-4' />
                        Add Friend
                      </button>
                      <button className='w-full py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors'>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- ALL FRIENDS --- */}
        {activeTab === "all_friends" && (
          <section>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {/* Using same suggestion data as mock for all friends */}
              {suggestions.map((friend) => (
                <div
                  key={friend.id}
                  className='flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800'
                >
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className='w-20 h-20 rounded-xl object-cover'
                  />
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-bold text-gray-900 dark:text-white truncate'>
                      {friend.name}
                    </h3>
                    <p className='text-sm text-gray-500 mb-2'>
                      {friend.mutual} mutual friends
                    </p>
                    <button className='px-4 py-1.5 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors'>
                      Message
                    </button>
                  </div>
                  <button className='p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full'>
                    <MoreHorizontal className='w-5 h-5' />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Helper Component for Tabs
const TabButton = ({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) => (
  <button
    onClick={onClick}
    className={`
      px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2
      ${
        active
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
      }
    `}
  >
    {label}
    {count !== undefined && count > 0 && (
      <span
        className={`
        text-xs px-1.5 py-0.5 rounded-full 
        ${active ? "bg-white text-blue-600" : "bg-red-500 text-white"}
      `}
      >
        {count}
      </span>
    )}
  </button>
);
