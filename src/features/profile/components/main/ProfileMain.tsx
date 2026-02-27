import type { IUserInfo } from "@/features/profile/types";
import type { ProfileTabKey } from "@/features/profile/types";
import type { FollowUser } from "@/lib/api/social";
import { formatDate } from "@/shared/lib/utils";
import { Calendar, Link2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FriendsPreview } from "./FriendsPreview";
import { IntroCard } from "./IntroCard";
import { PhotosGrid } from "./PhotosGrid";
import { ProfileFeed } from "./ProfileFeed";

interface ProfileHeaderProps {
  userInfo: IUserInfo | null;
  loading: boolean;
  friends: FollowUser[];
  photos: string[];
  videos?: string[];
  feedScope?: "my" | "user";
  profileUserId?: string;
  activeTab: ProfileTabKey;
}

export const ProfileMain = ({
  userInfo,
  loading,
  friends,
  photos,
  videos = [],
  feedScope = "my",
  profileUserId,
  activeTab,
}: ProfileHeaderProps) => {
  const website = userInfo?.website?.trim();
  const websiteHref = website
    ? /^https?:\/\//i.test(website)
      ? website
      : `https://${website}`
    : "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {activeTab === "posts" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <aside className="space-y-6 xl:col-span-4 xl:sticky xl:top-24 self-start">
            <IntroCard userInfo={userInfo} loading={loading} />
            <PhotosGrid photos={photos} loading={loading} />
            <FriendsPreview friends={friends} loading={loading} />
          </aside>
          <section className="xl:col-span-8">
            <ProfileFeed scope={feedScope} targetUserId={profileUserId} />
          </section>
        </div>
      )}

      {activeTab === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IntroCard userInfo={userInfo} loading={loading} />
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Profile Details
            </h2>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Location
                  </p>
                  <p>{userInfo?.location || "Not added yet"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Link2 className="h-4 w-4 mt-0.5 text-gray-400" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Website
                  </p>
                  {websiteHref ? (
                    <a
                      href={websiteHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {website}
                    </a>
                  ) : (
                    <p>Not added yet</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-0.5 text-gray-400" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Joined
                  </p>
                  <p>
                    {userInfo?.createdAt
                      ? formatDate(userInfo.createdAt)
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "friends" && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Friends ({friends.length})
            </h2>
            <Link href="/friends" className="text-sm text-blue-600 hover:underline">
              Manage friends
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading friends...</p>
          ) : friends.length === 0 ? (
            <EmptyPanel message="No friends available yet." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {friends.map((friend) => (
                <Link
                  key={friend._id}
                  href={`/profile/${friend._id}`}
                  className="group rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 dark:bg-zinc-800">
                    <Image
                      width={280}
                      height={280}
                      src={friend.image || "https://picsum.photos/200?random=51"}
                      alt={friend.name || "Friend"}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {friend.name || "Unknown"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                      {friend.bio || "No bio"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "photos" && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Photos ({photos.length})
            </h2>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading photos...</p>
          ) : photos.length === 0 ? (
            <EmptyPanel message="No photos uploaded yet." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo, index) => (
                <div
                  key={`${photo}-${index}`}
                  className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800"
                >
                  <Image
                    width={360}
                    height={360}
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "videos" && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Videos ({videos.length})
            </h2>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading videos...</p>
          ) : videos.length === 0 ? (
            <EmptyPanel message="No videos uploaded yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((videoUrl, index) => (
                <video
                  key={`${videoUrl}-${index}`}
                  controls
                  preload="metadata"
                  className="w-full rounded-xl bg-black aspect-video"
                  src={videoUrl}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EmptyPanel = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/40 p-8 text-center text-sm text-gray-500 dark:text-gray-300">
    {message}
  </div>
);
