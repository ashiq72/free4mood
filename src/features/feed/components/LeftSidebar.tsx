import {
  Bookmark,
  Calendar,
  ChevronDown,
  Clock,
  Flag,
  Users,
  Video,
} from "lucide-react";

export const LeftSidebar = () => {
  const menuItems = [
    { icon: Users, label: "Friends", color: "text-blue-500" },
    { icon: Clock, label: "Memories", color: "text-blue-400" },
    { icon: Bookmark, label: "Saved", color: "text-purple-500" },
    { icon: Flag, label: "Pages", color: "text-orange-500" },
    { icon: Video, label: "Video", color: "text-blue-600" },
    { icon: Calendar, label: "Events", color: "text-red-500" },
  ];

  return (
    <div className="space-y-6 pr-4">
      {/* User Mini Profile */}
      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
        <img
          src="https://picsum.photos/200?random=41"
          alt="User"
          className="w-10 h-10 rounded-full"
        />
        <span className="font-semibold text-gray-900 dark:text-white">
          Safayet Hossain
        </span>
      </div>

      {/* Menu Items */}
      <div className="space-y-1">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer group"
          >
            <item.icon className={`w-6 h-6 ${item.color}`} />
            <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
              {item.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-zinc-700 flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            See More
          </span>
        </div>
      </div>

      <div className="border-b border-gray-300 dark:border-zinc-700 my-2"></div>

      {/* Shortcuts */}
      <div>
        <h3 className="text-gray-500 font-semibold px-3 mb-2">
          Your Shortcuts
        </h3>
        <div className="space-y-1">
          {["Web Design Community", "Next.js Developers", "React BD"].map(
            (group, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <img
                  src={`https://picsum.photos/100?random=${i + 10}`}
                  className="w-9 h-9 rounded-lg object-cover"
                  alt="Group"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {group}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
