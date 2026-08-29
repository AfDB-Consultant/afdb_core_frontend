'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  BarChart3,
  Settings,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AfDBLogo from '@/components/ui/AfDBLogo';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Projects', href: '/projects', icon: FolderKanban },
  { title: 'Reports', href: '/reports', icon: FileText },
  { title: 'Team', href: '/team', icon: Users },
  { title: 'Analytics', href: '/analytics', icon: BarChart3 },
  { title: 'Settings', href: '/settings', icon: Settings },
];

const helpItems: NavItem[] = [
  { title: 'Help Center', href: '#', icon: HelpCircle },
  { title: 'Documentation', href: '#', icon: BookOpen },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 border-r transition-all duration-300 ease-in-out',
        'bg-[rgb(249_250_253)] dark:bg-black',
        'border-[rgb(233,238,246)] dark:border-[rgb(30,30,30)]',
        collapsed ? 'w-[5rem]' : 'w-64'
      )}
    >
      {/* Logo area */}
      <div className="flex items-center h-16 px-4 border-b border-inherit">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center">
            <AfDBLogo size={40} width={80} className="dark:hidden" />
            <AfDBLogo size={40} width={80} className="hidden dark:block" light />
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <AfDBLogo size={28} className="dark:hidden" />
            <AfDBLogo size={28} className="hidden dark:block" light />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
              Main Menu
            </p>
          )}
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                title={collapsed ? item.title : undefined}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center border transition-colors',
                  isActive
                    ? 'bg-primary/10 border-primary/20 dark:border-primary/30'
                    : 'bg-gray-50 dark:bg-[rgb(20,20,20)] border-gray-200 dark:border-[rgb(35,35,35)]'
                )}>
                  <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400')} />
                </div>
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {/* Help section */}
        <div className="mt-8 space-y-1">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
              Support
            </p>
          )}
          {helpItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.title : undefined}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-[rgb(20,20,20)] border border-gray-200 dark:border-[rgb(35,35,35)]">
                  <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom controls */}
      <div className="border-t border-inherit p-3 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all w-full',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? `Theme: ${theme}` : undefined}
        >
          {mounted && theme === 'dark' ? (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-[rgb(20,20,20)] border border-gray-200 dark:border-[rgb(35,35,35)]">
              <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          ) : mounted && theme === 'system' ? (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-[rgb(20,20,20)] border border-gray-200 dark:border-[rgb(35,35,35)]">
              <Monitor className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-[rgb(20,20,20)] border border-gray-200 dark:border-[rgb(35,35,35)]">
              <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          {!collapsed && (
            <span>{mounted ? (theme === 'dark' ? 'Dark Mode' : theme === 'system' ? 'Auto Mode' : 'Light Mode') : 'Theme'}</span>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all w-full"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-[rgb(20,20,20)] border border-gray-200 dark:border-[rgb(35,35,35)]">
              <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          ) : (
            <>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-[rgb(20,20,20)] border border-gray-200 dark:border-[rgb(35,35,35)]">
                <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
