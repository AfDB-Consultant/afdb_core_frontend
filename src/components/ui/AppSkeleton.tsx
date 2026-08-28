export default function AppSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(249_250_253)] dark:bg-[rgb(12_12_12)]">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex flex-col w-64 h-screen border-r border-gray-200 dark:border-gray-700 bg-[rgb(249_250_253)] dark:bg-[rgb(12_12_13)]">
        <div className="h-16 px-4 flex items-center border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div>
              <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1.5" />
            </div>
          </div>
        </div>
        <div className="flex-1 py-4 px-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Main area skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header skeleton */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[rgb(9_8_7)]">
          <div className="w-80 h-9 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-20 h-7 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 p-6">
          <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="w-64 h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-6" />
          <div className="h-px bg-gray-200 dark:bg-gray-700 mb-6" />

          {/* Stats cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between mb-4">
                  <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
                <div className="w-16 h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="w-24 h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Content area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div>
                    <div className="w-40 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1.5" />
                    <div className="w-56 h-2 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-16 h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
