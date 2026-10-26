'use client';
import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Theme = 'light' | 'dark' | 'system';
const KEY = 'ezvision-theme';

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* storage blocked: follow the system */
  }
  return 'system';
}

/** Applies shadcn's `.dark` class; "system" follows prefers-color-scheme. */
export function useThemeSync() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    mq.addEventListener('change', apply);
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      /* the class is applied for this session regardless */
    }
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
  return [theme, setTheme] as const;
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useThemeSync();
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" className={className} />}
      >
        <Icon />
        <span className="sr-only">Colour theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {(
          [
            ['light', 'Light', Sun],
            ['dark', 'Dark', Moon],
            ['system', 'System', Monitor],
          ] as const
        ).map(([id, label, I]) => (
          <DropdownMenuItem key={id} onClick={() => setTheme(id)}>
            <I />
            {label}
            {theme === id && (
              <span className="ml-auto text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
