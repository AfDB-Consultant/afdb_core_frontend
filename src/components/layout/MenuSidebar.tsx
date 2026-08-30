'use client';

import {
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useContext } from 'react';

import SidebarContext from '@/context/SidebarContext';
import { authUtils } from '@/lib/auth';
import { getItem, type MenuItem } from '@/utils/menu';

const MenuSidebar = () => {
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const { isMenuSidebarCollapsed } = useContext(SidebarContext);
  const { theme, resolvedTheme } = useTheme();

  const pathname = usePathname();
  const router = useRouter();
  const user = authUtils.getUser();

  const navigationMap: Record<string, string> = {
    dashboard: '/dashboard',
    projects: '/projects',
    reports: '/reports',
    team: '/team',
    analytics: '/analytics',
    monitoring: '/monitoring',
    settings: '/settings',
    chat: '/chat',
  };

  const pathPatterns: Array<{ pattern: string[]; key: string }> = [
    { pattern: ['/dashboard'], key: 'dashboard' },
    { pattern: ['/projects'], key: 'projects' },
    { pattern: ['/reports'], key: 'reports' },
    { pattern: ['/team'], key: 'team' },
    { pattern: ['/analytics'], key: 'analytics' },
    { pattern: ['/monitoring'], key: 'monitoring' },
    { pattern: ['/settings'], key: 'settings' },
    { pattern: ['/chat'], key: 'chat' },
  ];

  const getActiveMenuKey = (): string => {
    for (const { pattern, key } of pathPatterns) {
      if (pattern.every(part => pathname?.includes(part))) {
        return key;
      }
    }
    return 'dashboard';
  };

  const activeMenuKey = getActiveMenuKey();

  const handleOpenChange: MenuProps['onOpenChange'] = keys => {
    setOpenKeys(keys as string[]);
  };

  const onClick: MenuProps['onClick'] = e => {
    const path = navigationMap[e.key as string];
    if (path) {
      router.push(path);
    }
  };

  const menuItems: (MenuItem | null)[] = [
    getItem(
      'Dashboard',
      'dashboard',
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="7" height="7" x="3" y="3" rx="1"></rect>
        <rect width="7" height="7" x="14" y="3" rx="1"></rect>
        <rect width="7" height="7" x="14" y="14" rx="1"></rect>
        <rect width="7" height="7" x="3" y="14" rx="1"></rect>
      </svg>
    ),
    getItem(
      'Monitoring',
      'monitoring',
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    ),
    getItem(
      'Projects & Reports',
      'projects',
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path>
      </svg>
    ),
    getItem(
      'User Management',
      'team',
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    getItem(
      'System Settings',
      'settings',
      <SettingOutlined />
    ),
    getItem(
      'Messages',
      'chat',
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    ),
  ];

  const userInitials = user?.firstName?.[0] && user?.lastName?.[0]
    ? `${user.firstName[0]}${user.lastName[0]}`
    : 'U';

  return (
    <div
      className={`${isMenuSidebarCollapsed ? 'w-64' : 'w-64'} bg-[#F8FAFD] dark:bg-black sticky top-0 h-screen flex flex-col`}
      style={{
        borderRight:
          resolvedTheme === 'dark'
            ? '1px solid rgb(30, 30, 30)'
            : '1px solid rgb(233, 238, 246)',
        boxSizing: 'border-box',
        marginLeft: '0.1rem',
        paddingRight: '0.1rem',
        minWidth: isMenuSidebarCollapsed ? '5rem' : '14rem',
        maxWidth: isMenuSidebarCollapsed ? '5rem' : '14rem',
      }}
    >
      {/* Logo area */}
      <div
        className="flex-shrink-0"
        style={{ minHeight: '4rem', paddingLeft: '1rem' }}
      >
        <div
          className="flex items-center h-full cursor-pointer"
          onClick={() => router.push('/dashboard')}
        >
          {isMenuSidebarCollapsed ? (
            <div className="h-9 w-9 flex items-center justify-center">
              {/* Light mode collapsed logo */}
              <img
                src="/images/afbd-main-logo.png"
                alt="AfDB logo"
                className="h-9 w-9 object-contain dark:hidden"
              />
              {/* Dark mode collapsed logo */}
              <img
                src="/images/afbd-main-logo.png"
                alt="AfDB logo"
                className="h-9 w-9 object-contain hidden dark:block"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
          ) : (
            <>
              {/* Light mode logo */}
              <img
                src="/images/afbd-main-logo.png"
                alt="AfDB logo"
                className="h-[4.5rem] w-auto dark:hidden"
              />
              {/* Dark mode logo - inverted */}
              <img
                src="/images/afbd-main-logo.png"
                alt="AfDB logo"
                className="h-[4.5rem] w-auto hidden dark:block"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </>
          )}
        </div>
      </div>

      {/* Menu navigation */}
      <div
        className={`flex-1 overflow-y-auto p-0 bg-[#F8FAFD] dark:bg-black scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[rgb(30,30,30)] scrollbar-track-transparent`}
        style={{ display: 'block' }}
      >
        <Menu
          mode="inline"
          openKeys={isMenuSidebarCollapsed ? [] : openKeys}
          selectedKeys={[activeMenuKey]}
          onOpenChange={handleOpenChange}
          onClick={onClick}
          items={menuItems.filter((item): item is MenuItem => item !== null)}
          className="custom-menu"
          inlineIndent={16}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            paddingLeft: isMenuSidebarCollapsed ? '0.3rem' : '0.5rem',
            paddingRight: '0.0rem',
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden',
          }}
        />
      </div>

      {/* User profile card at bottom */}
      <div
        className="flex-shrink-0"
        style={{
          backgroundColor: resolvedTheme === 'dark' ? 'rgb(15, 15, 15)' : 'rgb(249, 250, 251)',
          padding: '1rem',
          borderRadius: '10px',
          border: `1px solid ${resolvedTheme === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(229, 231, 235)'}`,
          boxShadow: resolvedTheme === 'dark'
            ? 'rgba(0, 0, 0, 0.5) 0px -2px 10px 1px'
            : 'rgb(220, 234, 255) 0px -2px 10px',
          marginLeft: isMenuSidebarCollapsed ? '0.3rem' : '10px',
          marginRight: isMenuSidebarCollapsed ? '0.3rem' : '10px',
          marginBottom: '12px',
          display: 'block',
        }}
      >
        {!isMenuSidebarCollapsed ? (
          <>
            <div
              className="mt-0 flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-[rgb(20,20,20)]"
              style={{
                backgroundColor: resolvedTheme === 'dark' ? 'rgb(20, 20, 20)' : 'white',
                boxShadow: resolvedTheme === 'dark'
                  ? 'rgba(0, 0, 0, 0.5) 0px -2px 10px 1px'
                  : 'rgb(220, 234, 255) 0px -2px 10px',
              }}
              onClick={() => router.push('/settings')}
            >
              <div className="flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    border: `1px solid ${resolvedTheme === 'dark' ? 'rgb(40, 40, 40)' : 'rgb(218, 229, 246)'}`,
                  }}
                >
                  <div
                    className="w-[calc(100%-4px)] h-[calc(100%-4px)] rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor:
                        resolvedTheme === 'dark'
                          ? 'rgb(10, 10, 10)'
                          : 'rgb(248, 250, 253)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: '#009A44',
                      }}
                    >
                      <span className="text-white text-sm font-semibold">
                        {userInitials}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                  {user?.firstName || 'User'} {user?.lastName || ''}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'User'}
                </div>
              </div>
            </div>

            <div
              className="mt-2 text-center text-xs"
              style={{ color: resolvedTheme === 'dark' ? '#94a3b8' : '#8094AE' }}
            >
              <span
                className="cursor-pointer hover:underline"
                style={{
                  color: resolvedTheme === 'dark' ? '#94a3b8' : '#8094AE',
                  textDecoration: 'none',
                }}
              >
                &copy; {new Date().getFullYear()} AfDB&trade; Secure Portal
              </span>
            </div>
          </>
        ) : (
          /* Collapsed state - show only avatar icon */
          <div
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => router.push('/settings')}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{
                border:
                  resolvedTheme === 'dark'
                    ? '1px solid rgb(40, 40, 40)'
                    : '1px solid rgb(218, 229, 246)',
                backgroundColor:
                  resolvedTheme === 'dark'
                    ? 'rgb(10, 10, 10)'
                    : 'rgb(248, 250, 253)',
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#009A44' }}
              >
                <span className="text-white text-xs font-semibold">
                  {userInitials}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        /* Ensure Afacad font is used everywhere */
        .custom-menu .ant-menu,
        .custom-menu .ant-menu * {
          font-family: var(--font-primary, sans-serif) !important;
        }

        /* Dark mode styles for Ant Design Menu */
        :root.dark .custom-menu .ant-menu-item,
        :root.dark .custom-menu .ant-menu-submenu-title {
          color: #94a3b8 !important;
        }

        :root.dark .custom-menu .ant-menu-item:hover,
        :root.dark .custom-menu .ant-menu-submenu-title:hover {
          background-color: #1f2937 !important;
          color: #cbd5e1 !important;
        }

        :root.dark .custom-menu .ant-menu-item-selected,
        :root.dark
          .custom-menu
          .ant-menu-submenu-selected
          > .ant-menu-submenu-title {
          background-color: #052914 !important;
          color: #86ee68 !important;
        }

        :root.dark .custom-menu .ant-menu-item-selected .anticon,
        :root.dark
          .custom-menu
          .ant-menu-submenu-selected
          > .ant-menu-submenu-title
          .anticon {
          background-color: rgba(20, 83, 45, 0) !important;
          color: #86ee68 !important;
        }

        :root.dark .custom-menu .ant-menu-submenu-arrow {
          color: #94a3b8 !important;
        }

        :root.dark
          .custom-menu
          .ant-menu-submenu-selected
          > .ant-menu-submenu-title
          > .ant-menu-submenu-arrow {
          color: #6ee7b7 !important;
        }

        :root.dark .custom-menu .ant-menu-sub {
          background-color: transparent !important;
        }

        :root.dark .custom-menu .ant-menu-sub > .ant-menu-item:hover,
        :root.dark
          .custom-menu
          .ant-menu-sub
          > .ant-menu-submenu:hover
          > .ant-menu-submenu-title {
          border-left-color: #86ee68 !important;
          color: #cbd5e1 !important;
          background: linear-gradient(
            to right,
            #0d0c0e,
            #1f2937,
            #0d0c0e
          ) !important;
        }

        :root.dark .custom-menu .ant-menu-sub > .ant-menu-item-selected {
          border-left-color: #86ee68 !important;
          color: #86ee68 !important;
          border-radius: 0 0px 0px 0 !important;
          background: linear-gradient(
            to right,
            #0d0c0e,
            #14532d,
            #0d0c0e
          ) !important;
        }

        ${isMenuSidebarCollapsed
          ? `
          :root.dark .custom-menu .ant-menu-item .anticon:hover,
          :root.dark .custom-menu .ant-menu-submenu-title .anticon:hover {
            background-color: #1f2937 !important;
          }
          
          :root.dark .custom-menu .ant-menu-item-selected .anticon,
          :root.dark .custom-menu .ant-menu-submenu-selected > .ant-menu-submenu-title .anticon {
            background-color: #052914 !important;
          }
        `
          : ''}

        ${isMenuSidebarCollapsed
          ? `
          .custom-menu .ant-menu-item-group:hover .ant-menu-item,
          .custom-menu .ant-menu-item-group:hover .ant-menu-submenu-title {
            display: flex !important;
            max-height: 500px !important;
            overflow: visible !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          .custom-menu .ant-menu-item-group:hover .ant-menu-sub {
            display: block !important;
            max-height: 500px !important;
            overflow: visible !important;
          }
          
          .custom-menu .ant-menu-item-group-title {
            display: none !important;
          }
          
          .custom-menu .ant-menu-item-group:hover .ant-menu-sub .ant-menu-item,
          .custom-menu .ant-menu-item-group:hover .ant-menu-sub .ant-menu-submenu-title {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            height: 36px !important;
            min-width: 200px !important;
            padding-left: 16px !important;
            background-color: white !important;
            border-radius: 8px !important;
            margin-left: 8px !important;
          }
          
          .custom-menu .ant-menu-item-group:hover .ant-menu-sub .ant-menu-item .anticon,
          .custom-menu .ant-menu-item-group:hover .ant-menu-sub .ant-menu-submenu-title .anticon {
            font-size: 1rem !important;
            margin-right: 8px !important;
            margin-bottom: 0 !important;
          }
          
          .custom-menu .ant-menu-item-group:hover .ant-menu-sub .ant-menu-item .ant-menu-title-content,
          .custom-menu .ant-menu-item-group:hover .ant-menu-sub .ant-menu-submenu-title .ant-menu-title-content {
            font-size: 14px !important;
            text-align: left !important;
            white-space: normal !important;
          }
        `
          : ''}

        .custom-menu .ant-menu-item,
        .custom-menu .ant-menu-submenu-title {
          border-radius: 9999px !important;
          margin-bottom: 5px !important;
          padding-left: 8px !important;
          padding-right: 12px !important;
          color: #7f95ad !important;
          font-weight: 450 !important;
          font-size: 17px !important;
          line-height: 35px !important;
          height: 35px !important;
          display: flex !important;
          align-items: center !important;
          position: relative !important;
          min-width: 200px !important;
        }

        .custom-menu .ant-menu-item .anticon,
        .custom-menu .ant-menu-submenu-title .anticon {
          font-size: 17px !important;
        }

        .custom-menu .ant-menu-item .anticon svg,
        .custom-menu .ant-menu-submenu-title .anticon svg {
          width: 1.15rem !important;
          height: 1.15rem !important;
        }

        ${isMenuSidebarCollapsed
          ? `
          .custom-menu .ant-menu-item .anticon:hover,
          .custom-menu .ant-menu-submenu-title .anticon:hover {
            background-color: #ffffff !important;
          }
          
          :root.dark .custom-menu .ant-menu-item .anticon:hover,
          :root.dark .custom-menu .ant-menu-submenu-title .anticon:hover {
            background-color: #1f2937 !important;
          }
          
          .custom-menu .ant-menu-item-selected .anticon,
          .custom-menu .ant-menu-submenu-selected > .ant-menu-submenu-title .anticon {
            background-color: #eafce5 !important;
          }
          
          :root.dark .custom-menu .ant-menu-item-selected .anticon,
          :root.dark .custom-menu .ant-menu-submenu-selected > .ant-menu-submenu-title .anticon {
            background-color: #052914 !important;
          }
        `
          : ''}

        ${isMenuSidebarCollapsed
          ? `
          .custom-menu .ant-menu-item,
          .custom-menu .ant-menu-submenu-title {
            flex-direction: column !important;
            justify-content: flex-start !important;
            align-items: center !important;
            padding-top: 6px !important;
            padding-bottom: 4px !important;
            padding-left: 0.2rem !important;
            padding-right: 0.2rem !important;
            min-width: auto !important;
            height: 52px !important;
            line-height: normal !important;
            background-color: transparent !important;
            border-radius: 8px !important;
          }
          
          .custom-menu .ant-menu-item .anticon,
          .custom-menu .ant-menu-submenu-title .anticon {
            margin: 0 !important;
            font-size: 1.1rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-bottom: 3px !important;
            width: 100% !important;
            height: 28px !important;
            border-radius: 6px !important;
            transition: all 0.2s ease !important;
          }
          
          .custom-menu .ant-menu-item:hover .anticon,
          .custom-menu .ant-menu-submenu-title:hover .anticon {
            background-color: #ffffff !important;
          }
          
          :root.dark .custom-menu .ant-menu-item:hover .anticon,
          :root.dark .custom-menu .ant-menu-submenu-title:hover .anticon {
            background-color: #1f2937 !important;
          }
          
          .custom-menu .ant-menu-item-selected .anticon,
          .custom-menu .ant-menu-submenu-selected > .ant-menu-submenu-title .anticon {
            background-color: #eafce5 !important;
          }
          
          :root.dark .custom-menu .ant-menu-item-selected .anticon,
          :root.dark .custom-menu .ant-menu-submenu-selected > .ant-menu-submenu-title .anticon {
            background-color: #052914 !important;
          }
          
          .custom-menu .ant-menu-item .ant-menu-title-content,
          .custom-menu .ant-menu-submenu-title .ant-menu-title-content {
            display: block !important;
            font-size: 9px !important;
            text-align: center !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 100% !important;
            line-height: 1.2 !important;
            margin-top: 0 !important;
            margin-left: auto !important;
            margin-right: auto !important;
            width: 100% !important;
            pointer-events: none !important;
          }
          
          .custom-menu .ant-menu-submenu-arrow {
            display: none !important;
          }
          
          .custom-menu .ant-menu-inline-collapsed-tooltip {
            display: none !important;
          }
        `
          : ''}

        .custom-menu .ant-menu-item:hover,
        .custom-menu .ant-menu-submenu-title:hover {
          background-color: #ffffff !important;
          color: #7f95ad !important;
          font-weight: 500 !important;
        }

        .custom-menu .ant-menu-item-selected,
        .custom-menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
          background-color: #eafce5 !important;
          color: #85ec68 !important;
          font-weight: 500 !important;
        }

        .custom-menu .ant-menu-submenu-arrow {
          color: #7f95ad !important;
        }

        .custom-menu
          .ant-menu-submenu-selected
          > .ant-menu-submenu-title
          > .ant-menu-submenu-arrow {
          color: #85ec68 !important;
        }

        .custom-menu .ant-menu-sub {
          background-color: transparent !important;
          padding-right: 0 !important;
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          margin-left: 22px !important;
          margin-right: 0 !important;
          padding-left: 0px !important;
          border-left: 1px solid hsl(220 13% 91%) !important;
        }

        :root.dark .custom-menu .ant-menu-sub {
          border-left-color: #374151 !important;
        }

        .custom-menu .ant-menu-sub > .ant-menu-item,
        .custom-menu
          .ant-menu-sub
          > .ant-menu-submenu
          > .ant-menu-submenu-title {
          margin-left: 0 !important;
          padding-left: 8px !important;
          padding-right: 8px !important;
          border: 0 !important;
          border-radius: 0 !important;
          background-color: transparent !important;
          height: 28px !important;
          line-height: 28px !important;
          font-size: 17px !important;
          color: #8095ae !important;
          margin-bottom: 2px !important;
          min-width: 0 !important;
        }

        .custom-menu .ant-menu-sub > .ant-menu-item .ant-menu-title-content,
        .custom-menu
          .ant-menu-sub
          > .ant-menu-submenu
          > .ant-menu-submenu-title
          .ant-menu-title-content {
          padding-left: 0 !important;
        }

        .custom-menu .ant-menu-sub > .ant-menu-item .anticon,
        .custom-menu
          .ant-menu-sub
          > .ant-menu-submenu
          > .ant-menu-submenu-title
          .anticon {
          display: none !important;
        }

        :root.dark .custom-menu .ant-menu-sub > .ant-menu-item,
        :root.dark
          .custom-menu
          .ant-menu-sub
          > .ant-menu-submenu
          > .ant-menu-submenu-title {
          border-left-color: #374151 !important;
        }

        .custom-menu .ant-menu-sub > .ant-menu-item:hover,
        .custom-menu
          .ant-menu-sub
          > .ant-menu-submenu:hover
          > .ant-menu-submenu-title {
          border: 0 !important;
          border-radius: 0 !important;
          color: #7f95ad !important;
          background-color: transparent !important;
          font-weight: 500 !important;
        }

        :root.dark .custom-menu .ant-menu-sub > .ant-menu-item:hover,
        :root.dark
          .custom-menu
          .ant-menu-sub
          > .ant-menu-submenu:hover
          > .ant-menu-submenu-title {
          border: 0 !important;
          border-radius: 0 !important;
          background-color: transparent !important;
          color: #cbd5e1 !important;
          font-weight: 500 !important;
        }

        .custom-menu .ant-menu-sub > .ant-menu-item-selected {
          border: 0 !important;
          border-radius: 0 !important;
          color: #85ec68 !important;
          background-color: transparent !important;
          font-weight: 500 !important;
        }

        :root.dark .custom-menu .ant-menu-sub > .ant-menu-item-selected {
          border: 0 !important;
          border-radius: 0 !important;
          color: #86ee68 !important;
          background-color: transparent !important;
          font-weight: 500 !important;
        }

        .custom-menu .ant-menu-item-group-title {
          color: #7f95ad !important;
          letter-spacing: 1px !important;
          border-bottom: 1px solid #e9eef6 !important;
          padding-bottom: 8px !important;
          margin: 12px 10px 22px 5px !important;
          font-size: 1.06rem !important;
          text-transform: uppercase !important;
          font-weight: bold !important;
          padding-left: 0.5rem !important;
        }

        :root.dark .custom-menu .ant-menu-item-group-title {
          border-bottom-color: #191e27 !important;
        }

        ${isMenuSidebarCollapsed
          ? `
          .custom-menu .ant-menu-item-group-title {
            display: block !important;
            height: auto !important;
            visibility: visible !important;
            opacity: 1 !important;
            font-size: 0.75rem !important;
            padding-left: 0.2rem !important;
            padding-right: 0.2rem !important;
            margin: 8px 0.3rem 12px 0.3rem !important;
            border-bottom: 1px solid #e9eef6 !important;
            text-align: center !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 100% !important;
          }
          
          :root.dark .custom-menu .ant-menu-item-group-title {
            border-bottom-color: #374151 !important;
          }
        `
          : ''}

        .custom-menu .ant-menu-inline .ant-menu-item::after,
        .custom-menu .ant-menu-inline .ant-menu-submenu-title::after {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default MenuSidebar;
