'use client';

import { Moon, Sun } from '@repo/ui/icons';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const buttonClass =
    'rounded-full border border-border bg-muted p-1.5 shadow-sm transition-colors duration-200 hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  if (!mounted) {
    return (
      <button aria-label="theme toggle" className={buttonClass}>
        <div className="h-5 w-5" />
      </button>
    );
  }

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <button onClick={toggle} aria-label="theme toggle" className={buttonClass}>
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
