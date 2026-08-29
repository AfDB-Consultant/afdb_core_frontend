'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [currentMode, setCurrentMode] = useState<'light' | 'dark' | 'auto'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      if (savedTheme === 'light') {
        setCurrentMode('light');
        setTheme('light');
      } else if (savedTheme === 'dark') {
        setCurrentMode('dark');
        setTheme('dark');
      } else {
        setCurrentMode('auto');
        setTheme('system');
      }
    } else {
      setCurrentMode('light');
      setTheme('light');
    }
  }, []);

  const btnClass =
    'h-8 w-8 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 bg-white dark:bg-[rgb(20_22_23)] hover:bg-gray-100 dark:hover:bg-[rgb(30_32_33)]';

  return (
    <div className="flex flex-col gap-2 items-center">
      {/* Light/Dark Mode Toggle */}
      <div
        className={btnClass}
        title={currentMode === 'auto' ? 'Auto Mode' : theme === 'light' ? 'Light Mode' : 'Dark Mode'}
        onClick={() => {
          if (currentMode === 'light') {
            setCurrentMode('dark');
            setTheme('dark');
            localStorage.setItem('theme', 'dark');
          } else {
            setCurrentMode('light');
            setTheme('light');
            localStorage.setItem('theme', 'light');
          }
        }}
      >
        {theme === 'light' ? (
          <Sun className="h-4 w-4" style={{ color: '#eab308' }} />
        ) : (
          <Moon className="h-4 w-4" style={{ color: '#a78bfa' }} />
        )}
      </div>

      {/* System Auto Mode */}
      <div
        className={btnClass}
        title="Auto Mode"
        onClick={() => {
          setCurrentMode('auto');
          setTheme('system');
        }}
      >
        <Monitor className="h-4 w-4" style={{ color: '#6366f1' }} />
      </div>
    </div>
  );
};

export default ThemeToggle;
