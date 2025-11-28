export const Stories = () => {
  return (
    <div className="relative mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {/* Create Story Card */}
        <div className="min-w-[110px] h-[200px] rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm relative group cursor-pointer hover:opacity-90 transition-opacity">
          <img
            src="https://picsum.photos/200?random=41"
            className="h-[75%] w-full object-cover"
            alt="Me"
          />
          <div className="absolute bottom-0 w-full h-[25%] bg-white dark:bg-zinc-800 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold dark:text-white mt-3">
              Create Story
            </span>
          </div>
          <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white dark:border-zinc-800 flex items-center justify-center">
            <span className="text-white text-xl font-bold">+</span>
          </div>
        </div>

        {/* Friends Stories */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="min-w-[110px] h-[200px] rounded-xl overflow-hidden relative cursor-pointer group"
          >
            <img
              src={`https://picsum.photos/300?random=${i + 50}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              alt="Story"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            <div className="absolute top-3 left-3 w-9 h-9 rounded-full border-4 border-blue-600 overflow-hidden">
              <img
                src={`https://picsum.photos/100?random=${i + 20}`}
                className="w-full h-full object-cover"
                alt="User"
              />
            </div>
            <span className="absolute bottom-3 left-3 text-white text-xs font-semibold drop-shadow-md">
              User Name
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
