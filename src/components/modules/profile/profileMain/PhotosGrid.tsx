import Image from "next/image"

export const PhotosGrid = () => {
  return (
    <div>
         <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-zinc-800">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                          Photos
                        </h2>
                        <a href="#" className="text-sm text-blue-600 hover:underline">
                          See all
                        </a>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                          >
                            <Image
                              width={35}
                              height={35}
                              src={`https://picsum.photos/300?random=${i + 10}`}
                              alt="Gallery"
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
    </div>
  )
}
