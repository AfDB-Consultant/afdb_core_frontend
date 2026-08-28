export default function AuthSkeleton() {
  return (
    <div className="min-h-screen flex bg-white dark:bg-black">
      {/* Left branding skeleton */}
      <div className="hidden lg:flex lg:w-1/2 bg-[radial-gradient(120%_100%_at_65%_60%,_rgb(0,60,30)_0%,_rgb(0,20,10)_50%)] items-center justify-center">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 animate-pulse" />
            <div>
              <div className="w-48 h-4 bg-white/10 rounded animate-pulse" />
              <div className="w-16 h-3 bg-white/10 rounded animate-pulse mt-2" />
            </div>
          </div>
          <div className="w-64 h-12 bg-white/10 rounded animate-pulse" />
          <div className="w-48 h-4 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Right form skeleton */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 bg-white dark:bg-black">
        <div className="w-full max-w-md space-y-6">
          <div className="w-40 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="w-56 h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />

          <div className="py-5 px-6 rounded-[20px] border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="flex justify-between">
              <div className="w-24 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              <div className="w-20 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
