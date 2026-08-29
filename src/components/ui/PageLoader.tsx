'use client';

import React from 'react';

export default function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      {/* Animated logo spinner */}
      <div className="relative w-20 h-20">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-[rgb(30,30,30)]" />
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#009A44] border-r-[#009A44] animate-spin" />
        {/* Inner pulsing ring */}
        <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-[#009A44]/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-[#009A44] animate-pulse" />
        </div>
      </div>

      {/* Text with dots */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-muted-foreground" style={{ fontFamily: 'Afacad, sans-serif' }}>Loading</span>
        <span className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-[#009A44] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 rounded-full bg-[#009A44] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 rounded-full bg-[#009A44] animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
}
