import Image from "next/image"

export const FriendsPreview = () => {
  return (
    <div>  <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Friends
                  </h2>
                  <p className="text-xs text-gray-500">1,245 friends</p>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  See all
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                      <Image
                        width={35}
                        height={35}
                        src={`https://picsum.photos/200?random=${i + 50}`}
                        alt="Friend"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      Friend Name
                    </p>
                  </div>
                ))}
              </div>
            </div></div>
  )
}
