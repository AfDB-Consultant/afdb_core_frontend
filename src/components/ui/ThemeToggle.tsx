'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-muted p-1">
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
          theme === 'light' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Light mode"
      >
        <Sun className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Light</span>
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
          theme === 'dark' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Dark mode"
      >
        <Moon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Dark</span>
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
          theme === 'system' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
        }`}
        title="System theme"
      >
        <Monitor className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Auto</span>
      </button>
    </div>
  );
}
