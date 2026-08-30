'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useContext } from 'react';
import {
  HelpCircle,
  BookOpen,
  FileText,
} from 'lucide-react';

import ThemeToggle from '@/components/ui/ThemeToggle';
import SidebarContext from '@/context/SidebarContext';

const iconBtnClass =
  'h-8 w-8 rounded-md mb-2.5 mx-auto flex items-center justify-center cursor-pointer transition-all duration-200';

const LeftBar = () => {
  const router = useRouter();
  const { toggleMenuSidebar } = useContext(SidebarContext);
  const { resolvedTheme } = useTheme();

  return (
    <div
      className="w-14 bg-[#F1F4F9] dark:bg-black flex flex-col justify-between sticky top-0 h-screen transition-colors duration-200"
      style={{
        zIndex: 10,
        borderRight:
          resolvedTheme === 'dark'
            ? '1px solid rgb(30, 30, 30)'
            : '1px solid rgb(233, 238, 246)',
      }}
    >
      {/* Top section */}
      <div className="pt-2 mx-1.5">
        {/* Hamburger Icon - toggles Main Sidebar Menu */}
        <div
          className={`${iconBtnClass} bg-white dark:bg-[rgb(20,20,20)] hover:bg-gray-100 dark:hover:bg-[rgb(30,30,30)]`}
          style={{ marginTop: '5px' }}
          onClick={toggleMenuSidebar}
          title="Toggle sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            style={{ color: '#009A44' }}
          >
            <path
              fill="currentColor"
              d="M4 6a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 4 6Zm0 6a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 4 12Zm0 6a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 4 18Zm16.78-1.47a.75.75 0 0 1-1.061 0l-3.293-3.293a1.75 1.75 0 0 1 0-2.474L19.72 7.47a.75.75 0 0 1 1.06 1.06l-3.292 3.293a.25.25 0 0 0 0 .354l3.293 3.293a.75.75 0 0 1 0 1.06Z"
            />
          </svg>
        </div>

        {/* Theme Toggle */}
        <div className="mb-3">
          <ThemeToggle />
        </div>
      </div>

      {/* Bottom section */}
      <div className="pb-3 mx-1.5">
        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-[rgb(30,30,30)] mb-3 mx-1 transition-colors" />

        {/* Reports */}
        <div
          className={`${iconBtnClass} bg-white dark:bg-[rgb(20,20,20)] hover:bg-gray-100 dark:hover:bg-[rgb(30,30,30)]`}
          title="Reports"
          onClick={() => router.push('/reports')}
        >
          <FileText className="h-4 w-4" style={{ color: '#009A44' }} />
        </div>

        {/* API Documentation */}
        <div
          className={`${iconBtnClass} bg-white dark:bg-[rgb(20,20,20)] hover:bg-gray-100 dark:hover:bg-[rgb(30,30,30)]`}
          title="API Documentation"
          onClick={() => window.open('http://localhost:4000/api-docs', '_blank', 'noopener,noreferrer')}
        >
          <BookOpen className="h-4 w-4" style={{ color: '#d97706' }} />
        </div>

        {/* Help Center */}
        <div
          className={`${iconBtnClass} bg-white dark:bg-[rgb(20,20,20)] hover:bg-gray-100 dark:hover:bg-[rgb(30,30,30)]`}
          title="Help Center"
          onClick={() => window.open('https://www.afdb.org', '_blank', 'noopener,noreferrer')}
        >
          <HelpCircle className="h-4 w-4" style={{ color: '#2563eb' }} />
        </div>
      </div>
    </div>
  );
};

export default LeftBar;
