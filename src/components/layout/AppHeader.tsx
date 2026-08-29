'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import coreApi from '@/lib/coreApi';
import {
  Search,
  Bell,
  LogOut,
  User as UserIcon,
  Settings,
  Menu,
  ChevronDown,
  X,
  Home,
  FolderKanban,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  _id: string;
  name: string;
  code: string;
  status: string;
  country: string;
  sector: string;
}

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  user?: User | null;
}

export default function AppHeader({ onToggleSidebar, user }: AppHeaderProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const borderColor = isDark ? 'rgb(30, 30, 30)' : 'rgb(233, 238, 246)';
  const shadowColor = isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgb(233, 238, 246)';
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const currentUser = user || authUtils.getUser();

  // Inline search bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    authUtils.clearAuth();
    router.push('/login');
  };

  const userInitials = currentUser?.firstName?.[0] && currentUser?.lastName?.[0]
    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`
    : 'U';

  // Debounced search function
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.trim().length === 0) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await coreApi.get('/projects/search', { params: { q: value.trim() } });
        if (res.data.success) {
          setSearchResults(res.data.data);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleSearchSelect = (project: SearchResult) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    router.push(`/projects/${project._id}`);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  return (
    <>
      <div
        className="sticky top-0 z-40 bg-white dark:bg-black flex items-center justify-between"
        style={{
          paddingLeft: '1.0rem',
          paddingRight: '1.0rem',
          marginLeft: '5px',
          marginRight: '5px',
          borderRadius: '0px 0px 10px 10px',
          minHeight: '4rem',
          border: `1px solid ${borderColor}`,
          borderTop: 'none',
          boxShadow: `${shadowColor} 0px 2px 8px 1px`,
          fontFamily: 'Afacad, sans-serif',
        }}
      >
        {/* Left: Mobile hamburger + Search bar */}
        <div className="flex items-center gap-3 flex-1 min-w-0 py-2">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden h-10 w-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{
              border: `1px solid ${borderColor}`,
              boxShadow: `${shadowColor} 0px 0px 5px 1px`,
            }}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Home icon */}
          <button
            onClick={() => router.push('/dashboard')}
            className="hidden md:flex h-10 w-10 rounded-full items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{
              border: `1px solid ${borderColor}`,
              boxShadow: `${shadowColor} 0px 0px 5px 1px`,
            }}
            title="Home"
          >
            <Home className="h-5 w-5" />
          </button>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md relative" ref={searchContainerRef}>
            <div
              className="flex items-center w-full bg-white dark:bg-black"
              style={{
                borderBottom: `1px solid ${isDark ? 'rgb(40, 40, 40)' : 'rgb(240, 240, 240)'}`,
              }}
            >
              <Search className="h-4 w-4 text-gray-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search projects..."
                className="w-full h-10 pl-3 pr-8 bg-transparent outline-none text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
              />
              {searchQuery && (
                <button onClick={handleSearchClear} className="absolute right-0 top-0 h-full px-2 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[rgb(15,15,15)] border border-gray-200 dark:border-[rgb(30,30,30)] rounded-lg shadow-lg overflow-hidden z-50">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((project) => (
                      <button
                        key={project._id}
                        onClick={() => handleSearchSelect(project)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)] transition-colors text-left"
                      >
                        <div className="h-9 w-9 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
                          <FolderKanban className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{project.name}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{project.code}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{project.country}</span>
                            <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{project.sector}</span>
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                          project.status === 'active' && 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
                          project.status === 'completed' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                          project.status === 'on-hold' && 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                        )}>
                          {project.status === 'on-hold' ? 'On Hold' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.trim().length > 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No projects found</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications + User dropdown */}
        <div className="flex items-center gap-3 py-2">
          {/* Notification bell */}
          <div className="relative">
            <button
              className="relative h-10 w-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              style={{
                border: `1px solid ${borderColor}`,
                boxShadow: `${shadowColor} 0px 0px 5px 1px`,
              }}
              title="Notifications"
              onClick={() => {}}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                3
              </span>
            </button>
          </div>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 h-10 pl-1.5 pr-3 rounded-full cursor-pointer transition-colors"
              style={{
                border: `1px solid ${borderColor}`,
                boxShadow: `${shadowColor} 0px 0px 5px 1px`,
                background: isDark ? 'black' : 'white',
              }}
            >
              <div className="h-8 w-8 rounded-full bg-[#009A44] flex items-center justify-center text-white text-xs font-semibold select-none">
                {userInitials}
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200 leading-tight">
                {currentUser?.firstName || 'User'}
              </span>
              <ChevronDown className={cn(
                "h-3.5 w-3.5 text-gray-400 transition-transform duration-200 hidden lg:block",
                showUserMenu && "rotate-180"
              )} />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute top-full right-0 z-50 mt-2 w-60 rounded-xl bg-white dark:bg-[rgb(15,15,15)] border border-gray-200 dark:border-[rgb(30,30,30)] shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {currentUser?.email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { setShowUserMenu(false); router.push('/settings'); }}
                      className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      Profile
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); router.push('/settings'); }}
                      className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-400" />
                      Settings
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-700/50 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search overlay (Cmd+K) */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setShowSearch(false)}>
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg mx-4 rounded-xl bg-white dark:bg-[rgb(15,15,15)] border border-gray-200 dark:border-[rgb(30,30,30)] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 border-b border-gray-100 dark:border-gray-700/50">
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search anything..."
                className="w-full h-12 pl-3 pr-4 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
              />
              <button onClick={() => setShowSearch(false)} className="h-12 w-12 flex items-center justify-center text-gray-400 hover:text-gray-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
              Type to search projects, reports, team members...
            </div>
          </div>
        </div>
      )}
    </>
  );
}
