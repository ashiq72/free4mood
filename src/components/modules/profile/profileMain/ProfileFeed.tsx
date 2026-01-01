import { ImageIcon, Video } from "lucide-react"

import Image from "next/image"
import { Feed } from "../../feed/Feed"

export const ProfileFeed = () => {
  return (
    <div> <div className="lg:col-span-2 space-y-6">
            {/* Create Post Input */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-zinc-800">
              <div className="flex gap-4">
                <Image
                  width={35}
                  height={35}
                  src="https://picsum.photos/200?random=41"
                  alt="Me"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What's on your mind, Safayet?"
                    className="w-full h-10 px-4 bg-gray-100 dark:bg-zinc-800 rounded-full text-sm focus:outline-none hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                    <Video className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Live Video
                    </span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                    <ImageIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Photo/Video
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <Feed />
            
          </div>
        </div>
  )
}
