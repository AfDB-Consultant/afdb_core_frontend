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
        'bg-[rgb(249_250_253)] dark:bg-[rgb(12_12_13)]',
        'border-[rgb(233,238,246)] dark:border-[rgb(27,30,35)]',
        collapsed ? 'w-[5rem]' : 'w-64'
      )}
    >
      {/* Logo area */}
      <div className="flex items-center h-16 px-4 border-b border-inherit">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center">
            <AfDBLogo size={40} />
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <AfDBLogo size={28} />
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
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
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
                <Icon className="h-5 w-5 flex-shrink-0" />
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
            <Moon className="h-5 w-5 flex-shrink-0" />
          ) : mounted && theme === 'system' ? (
            <Monitor className="h-5 w-5 flex-shrink-0" />
          ) : (
            <Sun className="h-5 w-5 flex-shrink-0" />
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
            <ChevronRight className="h-5 w-5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
