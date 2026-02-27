import { Calendar, LinkIcon, MapPin } from "lucide-react";
import type { IUserInfo } from "@/features/profile/types";
import { formatDate } from "@/shared/lib/utils";

interface ProfileHeaderProps {
  userInfo: IUserInfo | null;
  loading: boolean;
}

export const IntroCard = ({ userInfo, loading }: ProfileHeaderProps) => {
  const website = userInfo?.website?.trim();
  const websiteHref = website
    ? /^https?:\/\//i.test(website)
      ? website
      : `https://${website}`
    : "";

  return (
    <div>
      {loading ? (
        <div>Loading....</div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Intro
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-center text-gray-600 dark:text-gray-300">
              {userInfo?.about || "No intro added yet."}
            </p>
            <div className="border-t border-gray-100 dark:border-zinc-800 my-4"></div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>
                  Lives in{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {userInfo?.location || "Unknown"}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <LinkIcon className="w-5 h-5 text-gray-400" />
                {website ? (
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {website}
                  </a>
                ) : (
                  <span>No website</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>
                  {userInfo?.dateOfBirth
                    ? formatDate(userInfo.dateOfBirth)
                    : "Birthday not set"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
