'use client';
import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';
const KEY = 'aiwas-theme';
const OPTIONS: [Theme, string, typeof Sun][] = [
  ['light', 'Light', Sun],
  ['dark', 'Dark', Moon],
  ['system', 'System', Monitor],
];

/**
 * Theme control.
 *
 * "System" is the default and stamps no attribute, so the palette follows
 * prefers-color-scheme. Choosing light or dark stamps data-theme on the root,
 * which the token layer treats as the explicit override. The choice is stored
 * per browser; storage can throw in a private window, so every access is
 * guarded and the control still works without it.
 */
/** Read the stored choice. Returns 'system' during server rendering. */
function readTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* private window or blocked storage: follow the system */
  }
  return 'system';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  // Sync the choice out to the document and to storage. Both are external
  // systems, which is what an effect is for; no state is set here.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      /* the attribute is already applied for this session */
    }
  }, [theme]);

  return (
    <fieldset className="theme-toggle">
      <legend className="sr-only">Colour theme</legend>
      {OPTIONS.map(([id, label, Icon]) => (
        <button
          key={id}
          type="button"
          className={theme === id ? 'current' : ''}
          aria-pressed={theme === id}
          title={`${label} theme`}
          onClick={() => setTheme(id)}
        >
          <Icon size={14} />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </fieldset>
  );
}
