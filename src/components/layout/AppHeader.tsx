'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import {
  Search,
  Bell,
  LogOut,
  User as UserIcon,
  Settings,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  user?: User | null;
}

export default function AppHeader({ onToggleSidebar, user }: AppHeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const currentUser = user || authUtils.getUser();

  const handleLogout = () => {
    authUtils.clearAuth();
    router.push('/login');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-6',
        'bg-white dark:bg-[rgb(9_8_7)]',
        'border-b border-[rgb(220,234,255)] dark:border-transparent',
        'shadow-[0_0_5px_1px_rgb(220,234,255)] dark:shadow-[rgba(0,0,0,0.5)_0px_0px_10px_2px]'
      )}
    >
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile hamburger */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden h-10 w-10 rounded-full flex items-center justify-center border border-border shadow-sm bg-white dark:bg-[rgb(9_8_7)] text-blue-600 dark:text-blue-400"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <div className="flex items-center py-1.5 bg-white dark:bg-[rgb(9_8_7)] rounded-full border border-[rgb(220,234,255)] dark:border-gray-700 shadow-[0_0_5px_1px_rgb(220,234,255)] dark:shadow-none">
              <Search className="h-4 w-4 text-gray-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search projects, reports..."
                className="bg-transparent flex-1 outline-none text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 px-3 border-0"
                style={{ fontFamily: 'Afacad, sans-serif' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live indicator + Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Live mode indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-sm font-medium">
          <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-green-500 to-lime-400 animate-pulse" />
          <span className="text-xs" style={{ fontFamily: 'Afacad, sans-serif' }}>Live</span>
        </div>

        {/* Notification bell */}
        <button className="relative h-10 w-10 rounded-full flex items-center justify-center bg-white dark:bg-[rgb(9_8_7)] text-blue-600 dark:text-blue-400 border border-[rgb(220,234,255)] dark:border-gray-700 shadow-[0_0_5px_1px_rgb(220,234,255)] dark:shadow-none">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            3
          </span>
        </button>

        {/* User avatar / dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="h-10 w-10 rounded-full flex items-center justify-center bg-white dark:bg-[rgb(9_8_7)] text-blue-600 dark:text-blue-400 border border-[rgb(220,234,255)] dark:border-gray-700 shadow-[0_0_5px_1px_rgb(220,234,255)] dark:shadow-none cursor-pointer"
          >
            <UserIcon className="h-5 w-5" />
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 z-50 mt-2 w-64 rounded-xl bg-white dark:bg-[rgb(12_12_13)] border border-gray-200 dark:border-gray-700 shadow-xl">
              {/* User info */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'Afacad, sans-serif' }}>
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5" style={{ fontFamily: 'Afacad, sans-serif' }}>
                  {currentUser?.email}
                </p>
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {currentUser?.role || 'User'}
                </span>
              </div>

              {/* Menu items */}
              <div className="p-2">
                <button className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-accent transition-colors">
                  <UserIcon className="h-4 w-4" />
                  <span style={{ fontFamily: 'Afacad, sans-serif' }}>My Profile</span>
                </button>
                <button className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-accent transition-colors">
                  <Settings className="h-4 w-4" />
                  <span style={{ fontFamily: 'Afacad, sans-serif' }}>Settings</span>
                </button>
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span style={{ fontFamily: 'Afacad, sans-serif' }}>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
