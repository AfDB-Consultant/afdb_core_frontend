'use client';
import React from 'react';
import AfDBLogo from '@/components/ui/AfDBLogo';
import LeftBranding from '@/components/ui/LeftBranding';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white dark:bg-[#000000]">
      {/* Left Side — Branding */}
      <LeftBranding />

      {/* Right Side — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-20 bg-white dark:bg-[#000000] min-h-screen">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <AfDBLogo size={48} className="mx-auto" />
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
