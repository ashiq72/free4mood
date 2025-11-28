"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  UserPlus,
  MoreHorizontal,
  Check,
  Bell,
  AtSign,
} from "lucide-react";

// --- Types ---
type NotificationType = "like" | "comment" | "follow" | "mention";

interface Notification {
  id: number;
  type: NotificationType;
  actor: {
    name: string;
    avatar: string;
  };
  content?: string; // For comments or mentions
  postImage?: string; // If related to a post
  time: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // --- Mock Data ---
  const notifications: Notification[] = [
    {
      id: 1,
      type: "like",
      actor: {
        name: "Sarah Rahman",
        avatar: "https://picsum.photos/200?random=1",
      },
      postImage: "https://picsum.photos/200?random=10",
      time: "2m ago",
      isRead: false,
    },
    {
      id: 2,
      type: "comment",
      actor: {
        name: "Tanvir Hasan",
        avatar: "https://picsum.photos/200?random=2",
      },
      content: "Great work! Really love the color palette 🎨",
      postImage: "https://picsum.photos/200?random=11",
      time: "15m ago",
      isRead: false,
    },
    {
      id: 3,
      type: "follow",
      actor: {
        name: "Jennifer Winget",
        avatar: "https://picsum.photos/200?random=3",
      },
      time: "1h ago",
      isRead: true,
    },
    {
      id: 4,
      type: "mention",
      actor: { name: "Dev Team", avatar: "https://picsum.photos/200?random=4" },
      content: "mentioned you in a comment: @Safayet check this out!",
      postImage: "https://picsum.photos/200?random=12",
      time: "3h ago",
      isRead: true,
    },
    {
      id: 5,
      type: "like",
      actor: {
        name: "Mike Ross",
        avatar: "https://picsum.photos/200?random=5",
      },
      postImage: "https://picsum.photos/200?random=13",
      time: "5h ago",
      isRead: true,
    },
    {
      id: 6,
      type: "comment",
      actor: {
        name: "Rachel Green",
        avatar: "https://picsum.photos/200?random=6",
      },
      content: "Where is this place? Looks amazing! 😍",
      postImage: "https://picsum.photos/200?random=14",
      time: "1d ago",
      isRead: true,
    },
  ];

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.isRead);

  return (
    <div className='max-w-4xl mx-auto pb-10'>
      {/* 1. Header & Filters */}
      <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 mb-4 sticky top-20 z-30'>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Notifications
          </h1>
          <button className='text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1'>
            <Check className='w-4 h-4' />
            Mark all as read
          </button>
        </div>

        <div className='flex gap-2'>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* 2. Notification List */}
      <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-zinc-800'>
        {filteredNotifications.length > 0 ? (
          <div className='divide-y divide-gray-100 dark:divide-zinc-800'>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        ) : (
          <div className='p-12 text-center flex flex-col items-center'>
            <div className='w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4'>
              <Bell className='w-8 h-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>
              No notifications
            </h3>
            <p className='text-gray-500 dark:text-gray-400'>
              You are all caught up! Check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Helper Component: Notification Item ---
const NotificationItem = ({ notification }: { notification: Notification }) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "like":
        return (
          <div className='bg-red-500 p-1.5 rounded-full'>
            <Heart className='w-3.5 h-3.5 text-white fill-current' />
          </div>
        );
      case "comment":
        return (
          <div className='bg-blue-500 p-1.5 rounded-full'>
            <MessageCircle className='w-3.5 h-3.5 text-white fill-current' />
          </div>
        );
      case "follow":
        return (
          <div className='bg-green-500 p-1.5 rounded-full'>
            <UserPlus className='w-3.5 h-3.5 text-white' />
          </div>
        );
      case "mention":
        return (
          <div className='bg-orange-500 p-1.5 rounded-full'>
            <AtSign className='w-3.5 h-3.5 text-white' />
          </div>
        );
    }
  };

  const getText = (n: Notification) => {
    switch (n.type) {
      case "like":
        return <span>liked your post.</span>;
      case "comment":
        return (
          <span>
            commented on your post:{" "}
            <span className='text-gray-500 dark:text-gray-400 font-normal'>
              &quot;{n.content}&quot;
            </span>
          </span>
        );
      case "follow":
        return <span>started following you.</span>;
      case "mention":
        return <span>mentioned you in a comment.</span>;
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer relative group ${
        !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
      }`}
    >
      <div className='flex gap-4'>
        {/* Avatar + Type Icon */}
        <div className='relative shrink-0'>
          <img
            src={notification.actor.avatar}
            alt={notification.actor.name}
            className='w-14 h-14 rounded-full object-cover border border-gray-100 dark:border-zinc-800'
          />
          <div className='absolute -bottom-1 -right-1 border-2 border-white dark:border-black rounded-full shadow-sm'>
            {getIcon(notification.type)}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0 pr-8'>
          <p className='text-sm text-gray-900 dark:text-gray-100'>
            <span className='font-bold hover:underline'>
              {notification.actor.name}
            </span>{" "}
            <span className='text-gray-600 dark:text-gray-300'>
              {getText(notification)}
            </span>
          </p>
          <p className='text-xs text-blue-600 dark:text-blue-400 font-medium mt-1'>
            {notification.time}
          </p>
        </div>

        {/* Post Preview (if applicable) */}
        {notification.postImage && (
          <div className='shrink-0'>
            <img
              src={notification.postImage}
              alt='Post'
              className='w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-zinc-800'
            />
          </div>
        )}

        {/* Actions & Unread Indicator */}
        <div className='absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2'>
          {!notification.isRead && (
            <div className='w-3 h-3 bg-blue-600 rounded-full'></div>
          )}
          <button className='opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-all'>
            <MoreHorizontal className='w-5 h-5 text-gray-500' />
          </button>
        </div>
      </div>
    </div>
  );
};
