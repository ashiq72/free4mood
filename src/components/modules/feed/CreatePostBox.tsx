"use client";

import { useState } from "react";
import { ImageIcon, Smile, Video } from "lucide-react";
import Image from "next/image";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { PopoverModule } from "./PopoverModule";

export const CreatePostBox = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 mb-2">
      <div className="flex gap-3 mb-4">
        <Image
          src="https://picsum.photos/200?random=41"
          alt="User"
          width={40}
          height={40}
          className="rounded-full object-cover"
        />

        {/* Popover Wrapper */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <input
              type="text"
              onFocus={() => setOpen(true)}
              placeholder="What's on your mind, Ashiq?"
              className="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-full px-5 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none dark:text-white"
            />
          </PopoverTrigger>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
            <PopoverModule />
          </div>
        </Popover>
      </div>

      {/* bottom buttons */}
      <div className="border-t border-gray-200 dark:border-zinc-800 pt-3 flex justify-between px-2">
        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <Video className="w-6 h-6 text-red-500" />
          <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
            Live Video
          </span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <ImageIcon className="w-6 h-6 text-green-500" />
          <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
            Photo/Video
          </span>
        </button>

        <button className="items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors hidden sm:flex">
          <Smile className="w-6 h-6 text-yellow-500" />
          <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
            Feeling/Activity
          </span>
        </button>
      </div>
    </div>
  );
};
