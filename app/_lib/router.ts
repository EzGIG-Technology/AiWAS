'use client';
import { useSyncExternalStore } from 'react';

/**
 * Hash routing. The static Vercel build has no server routes, so every
 * screen lives behind a fragment: #/um/overview, #/kpt/universities/um, ...
 * The server snapshot is the sign-in page, so SSR output is stable.
 */
function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

const read = () => window.location.hash.replace(/^#/, '') || '/';

export function useRoute() {
  const path = useSyncExternalStore(subscribe, read, () => '/');
  const parts = path.split('/').filter(Boolean);
  return { path, parts };
}

export function navigate(path: string) {
  if (typeof window === 'undefined') return;
  if (read() === path) return;
  window.location.hash = path;
  window.scrollTo({ top: 0 });
}
