'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import '@ant-design/v5-patch-for-react-19';

import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import LeftBar from './LeftBar';
import MenuSidebar from './MenuSidebar';
import AppHeader from './AppHeader';
import PageProgressBar from '@/components/ui/PageProgressBar';
import PageLoader from '@/components/ui/PageLoader';
import SidebarContext from '@/context/SidebarContext';

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
  const [isLeftBarCollapsed, setIsLeftBarCollapsed] = useState(false);
  const [isMenuSidebarCollapsed, setIsMenuSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(authUtils.getUser());
  }, [router]);

  // Load saved sidebar state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedValue = localStorage.getItem('hideMainSidebar');
        if (savedValue !== null) {
          const parsedValue = JSON.parse(savedValue);
          setIsMenuSidebarCollapsed(parsedValue);
        }
      } catch (error) {
        console.error('Error reading hideMainSidebar from localStorage:', error);
      }
    }
  }, []);

  const toggleLeftBar = () => {
    setIsLeftBarCollapsed(!isLeftBarCollapsed);
  };

  const toggleMenuSidebar = () => {
    const newValue = !isMenuSidebarCollapsed;
    setIsMenuSidebarCollapsed(newValue);
    try {
      localStorage.setItem('hideMainSidebar', JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving hideMainSidebar to localStorage:', error);
    }
  };

  if (!user) {
    return <PageLoader />;
  }

  const sidebarContextValue = {
    isLeftBarCollapsed,
    isMenuSidebarCollapsed,
    toggleLeftBar,
    toggleMenuSidebar,
  };

  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#009A44',
            fontFamily: 'var(--font-primary, sans-serif)',
          },
          components: {
            Collapse: {
              headerBg: '#FFF',
            },
            Table: {
              headerBg: '#F0FFF0',
              headerBorderRadius: 0,
            },
          },
        }}
      >
        <SidebarContext.Provider value={sidebarContextValue}>
          <div className="flex h-screen overflow-hidden bg-[rgb(249_250_253)] dark:bg-black">
            <PageProgressBar />

            {/* Left Icon Bar */}
            <div className="hidden lg:block">
              <LeftBar />
            </div>

            {/* Main Navigation Sidebar */}
            <div className="hidden lg:block">
              <MenuSidebar />
            </div>

            {/* Mobile sidebar overlay */}
            {mobileSidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setMobileSidebarOpen(false)}
                />
                <div className="relative w-64 h-full">
                  <MenuSidebar />
                </div>
              </div>
            )}

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              <AppHeader
                onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                user={user}
              />

              <main className="flex-1 p-2 pb-6 lg:pb-3">
                <div className="max-w-screen-2xl mx-auto">
                  {/* Page header: breadcrumbs + title + actions */}
                  {(pageTitle || breadcrumbs) && (
                    <>
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

                      {/* Divider */}
                      <div className="h-px bg-gray-200 dark:bg-gray-700 mb-4" />
                    </>
                  )}

                  {/* Content card */}
                  <div className="bg-white dark:bg-[rgb(15,15,15)] shadow-sm p-5 border border-gray-200 dark:border-[rgb(30,30,30)] rounded-xl">
                    {children}
                  </div>
                </div>
              </main>

              {/* Footer */}
              <footer className="border-t border-gray-200 dark:border-[rgb(30,30,30)] py-4 px-6 bg-white dark:bg-[rgb(10,10,10)]">
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
        </SidebarContext.Provider>
      </ConfigProvider>
    </AntdRegistry>
  );
}
