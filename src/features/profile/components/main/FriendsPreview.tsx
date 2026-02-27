import Link from "next/link";
import Image from "next/image";
import type { FollowUser } from "@/lib/api/social";

interface FriendsPreviewProps {
  friends: FollowUser[];
  loading?: boolean;
}

export const FriendsPreview = ({ friends, loading }: FriendsPreviewProps) => {
  const preview = friends.slice(0, 6);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-zinc-800">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Friends
          </h2>
          <p className="text-xs text-gray-500">{friends.length} friends</p>
        </div>
        <Link href="/friends" className="text-sm text-blue-600 hover:underline">
          See all
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading friends...</div>
      ) : preview.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {preview.map((friend) => (
            <div key={friend._id} className="text-center">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                <Image
                  width={120}
                  height={120}
                  src={friend.image || "https://picsum.photos/200?random=77"}
                  alt={friend.name || "Friend"}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {friend.name || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No friends yet.</p>
      )}
    </div>
  );
};
