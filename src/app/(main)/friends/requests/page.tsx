"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, UserCheck, UserX, Clock } from "lucide-react";

// Types
interface RequestUser {
  id: number;
  name: string;
  avatar: string;
  mutual: number;
  time: string; // e.g., "2d ago"
}

export default function FriendRequestsPage() {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  const receivedRequests: RequestUser[] = [
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
    {
      id: 5,
      name: "Fahim Murshed",
      avatar: "https://picsum.photos/200?random=205",
      mutual: 4,
      time: "2w",
    },
  ];

  const sentRequests: RequestUser[] = [
    {
      id: 101,
      name: "Jennifer Lawrence",
      avatar: "https://picsum.photos/200?random=301",
      mutual: 1,
      time: "1d",
    },
    {
      id: 102,
      name: "Chris Pratt",
      avatar: "https://picsum.photos/200?random=302",
      mutual: 0,
      time: "5d",
    },
  ];

  return (
    <div className='max-w-4xl mx-auto pb-10'>
      {/* Header */}
      <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 mb-6 sticky top-20 z-30'>
        <div className='flex items-center gap-4 mb-4'>
          <Link
            href='/friends'
            className='p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors'
          >
            <ArrowLeft className='w-5 h-5 text-gray-600 dark:text-gray-300' />
          </Link>
          <div>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
              Friend Requests
            </h1>
            <p className='text-xs text-gray-500'>
              Manage your incoming and outgoing requests
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex gap-4 border-b border-gray-200 dark:border-zinc-800'>
          <button
            onClick={() => setActiveTab("received")}
            className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${
              activeTab === "received"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Received Requests{" "}
            <span className='ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full'>
              {receivedRequests.length}
            </span>
            {activeTab === "received" && (
              <div className='absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full' />
            )}
          </button>

          <button
            onClick={() => setActiveTab("sent")}
            className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${
              activeTab === "sent"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Sent Requests{" "}
            <span className='ml-1 text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full'>
              {sentRequests.length}
            </span>
            {activeTab === "sent" && (
              <div className='absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full' />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='space-y-4'>
        {activeTab === "received" && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {receivedRequests.map((req) => (
              <div
                key={req.id}
                className='bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 flex gap-4'
              >
                <img
                  src={req.avatar}
                  alt={req.name}
                  className='w-20 h-20 rounded-lg object-cover'
                />
                <div className='flex-1 min-w-0 flex flex-col justify-center'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <h3 className='font-semibold text-gray-900 dark:text-white text-base truncate'>
                        {req.name}
                      </h3>
                      <p className='text-xs text-gray-500 mb-2'>
                        {req.mutual} mutual friends • {req.time}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2 mt-auto'>
                    <button className='flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors'>
                      Confirm
                    </button>
                    <button className='flex-1 py-1.5 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors'>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {receivedRequests.length === 0 && (
              <EmptyState message='No new friend requests' />
            )}
          </div>
        )}

        {activeTab === "sent" && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {sentRequests.map((req) => (
              <div
                key={req.id}
                className='bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 flex gap-4 items-center'
              >
                <img
                  src={req.avatar}
                  alt={req.name}
                  className='w-16 h-16 rounded-full object-cover border border-gray-100 dark:border-zinc-700'
                />
                <div className='flex-1 min-w-0'>
                  <h3 className='font-semibold text-gray-900 dark:text-white text-base truncate'>
                    {req.name}
                  </h3>
                  <p className='text-xs text-gray-500 mb-3'>
                    Sent {req.time} ago
                  </p>
                  <button className='px-4 py-1.5 border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto'>
                    Cancel Request
                  </button>
                </div>
              </div>
            ))}
            {sentRequests.length === 0 && (
              <EmptyState message='No sent requests' />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const EmptyState = ({ message }: { message: string }) => (
  <div className='col-span-full py-12 flex flex-col items-center justify-center text-center'>
    <div className='w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4'>
      <Clock className='w-8 h-8 text-gray-400' />
    </div>
    <p className='text-gray-500 dark:text-gray-400 font-medium'>{message}</p>
  </div>
);
