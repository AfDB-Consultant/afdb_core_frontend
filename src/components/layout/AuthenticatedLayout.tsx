'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import PageProgressBar from '@/components/ui/PageProgressBar';
import { cn } from '@/lib/utils';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  pageActions?: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
  pageTitle,
  breadcrumbs,
  pageActions,
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(authUtils.getUser());
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(249_250_253)] dark:bg-[rgb(12_12_12)]">
      <PageProgressBar />

      {/* Desktop Sidebar */}
      <AppSidebar />

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 h-full">
            <AppSidebar />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AppHeader
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          user={user}
        />

        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-screen-2xl mx-auto">
            {/* Page header: breadcrumbs + title + actions */}
            {(pageTitle || breadcrumbs) && (
              <div className="flex items-center justify-between mb-4">
                <div>
                  {pageTitle && (
                    <h1
                      className="text-2xl font-bold text-gray-800 dark:text-gray-100"
                      style={{ fontFamily: 'Afacad, sans-serif', lineHeight: '1.5rem' }}
                    >
                      {pageTitle}
                    </h1>
                  )}
                  {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-1 mt-1 text-sm text-muted-foreground" style={{ fontFamily: 'Afacad, sans-serif' }}>
                      {breadcrumbs.map((crumb, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="mx-1">/</span>}
                          {crumb.href ? (
                            <span
                              className="hover:text-foreground cursor-pointer transition-colors"
                              onClick={() => crumb.href && router.push(crumb.href)}
                            >
                              {crumb.label}
                            </span>
                          ) : (
                            <span className="text-foreground font-medium">{crumb.label}</span>
                          )}
                        </React.Fragment>
                      ))}
                    </nav>
                  )}
                </div>
                {pageActions && <div className="flex items-center gap-2">{pageActions}</div>}
              </div>
            )}

            {/* Divider */}
            {(pageTitle || breadcrumbs) && (
              <div className="h-px bg-gray-200 dark:bg-gray-700 mb-4" />
            )}

            {/* Content card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 md:p-6">
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 py-4 px-6 bg-white dark:bg-[rgb(9_8_7)]">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-gray-500" style={{ fontFamily: 'Afacad, sans-serif' }}>
              &copy; {new Date().getFullYear()} African Development Bank Group. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500" style={{ fontFamily: 'Afacad, sans-serif' }}>
              Secure Portal v2.0
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
