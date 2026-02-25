export const FeedSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow animate-pulse"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
            <div className="flex-1">
              <div className="h-3 w-32 rounded bg-zinc-300 dark:bg-zinc-700"></div>
              <div className="h-3 mt-2 w-20 rounded bg-zinc-200 dark:bg-zinc-800"></div>
            </div>
          </div>

          {/* Content lines */}
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-zinc-300 dark:bg-zinc-700"></div>
            <div className="h-3 w-[80%] rounded bg-zinc-300 dark:bg-zinc-700"></div>
            <div className="h-3 w-[60%] rounded bg-zinc-300 dark:bg-zinc-700"></div>
          </div>

          {/* Image placeholder */}
          <div className="mt-4 h-48 w-full rounded-xl bg-zinc-300 dark:bg-zinc-700"></div>
        </div>
      ))}
    </div>
  );
};
