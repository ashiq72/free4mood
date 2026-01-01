import { Calendar, LinkIcon, MapPin } from "lucide-react"
interface IUserInfo {
  name: string;
  bio: string;
  about: string;
  title: string;
  description: string;
  image?: string;
}
interface ProfileHeaderProps {
  userInfo: IUserInfo | null;
  loading: boolean;
}

export const IntroCard = ({ userInfo, loading }: ProfileHeaderProps) => {
  return (
    <div>
           <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-zinc-800">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Intro
                      </h2>
                      <div className="space-y-4">
                        <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                         {userInfo?.about}
                        </p>
                        <div className="border-t border-gray-100 dark:border-zinc-800 my-4"></div>
        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>
                              Lives in{" "}
                              <strong className="text-gray-900 dark:text-white">
                                Dhaka, Bangladesh
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <LinkIcon className="w-5 h-5 text-gray-400" />
                            <a href="#" className="text-blue-600 hover:underline">
                              safayet.design
                            </a>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span>Joined October 2023</span>
                          </div>
                        </div>
                      </div>
                    </div>
    </div>
  )
}
