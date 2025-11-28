import { MoreHorizontal, Search } from "lucide-react";

export const RightSidebar = () => {
  return (
    <div className="pl-4 space-y-6">
      {/* Sponsored */}
      <div>
        <h3 className="text-gray-500 font-semibold mb-3 text-sm">Sponsored</h3>
        <div className="flex items-center gap-3 p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer group">
          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop"
            alt="Ad"
            className="w-28 h-28 rounded-lg object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:underline">
              Nike Shoes
            </p>
            <p className="text-xs text-gray-500">nike.com</p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 dark:border-zinc-700 my-2"></div>

      {/* Friend Requests */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-gray-500 font-semibold text-sm">
            Friend Requests
          </h3>
          <span className="text-blue-500 text-sm cursor-pointer hover:underline">
            See All
          </span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-sm mb-2">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="https://picsum.photos/200?random=88"
              className="w-12 h-12 rounded-full object-cover"
              alt="Requester"
            />
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                Kabir Singh
              </p>
              <p className="text-xs text-gray-500">12 mutual friends</p>
            </div>
            <span className="ml-auto text-xs text-gray-400">2d</span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 rounded-lg transition-colors">
              Confirm
            </button>
            <button className="flex-1 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-white text-sm font-medium py-1.5 rounded-lg transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 dark:border-zinc-700 my-2"></div>

      {/* Contacts / Online Friends */}
      <div>
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className="text-gray-500 font-semibold text-sm">Contacts</h3>
          <div className="flex gap-2 text-gray-500">
            <Search className="w-4 h-4 cursor-pointer hover:text-gray-700" />
            <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-gray-700" />
          </div>
        </div>
        <div className="space-y-1">
          {[
            "Rakibul Hasan",
            "Mazharul Islam",
            "Sajeeb Ahmed",
            "Rahim Uddin",
          ].map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative"
            >
              <div className="relative">
                <img
                  src={`https://picsum.photos/100?random=${i + 90}`}
                  className="w-9 h-9 rounded-full object-cover"
                  alt="Friend"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
