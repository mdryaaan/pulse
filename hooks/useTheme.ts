'use client';

import { useCallback, useEffect, useState } from 'react';

export type ThemeChoice = 'dark' | 'light';

const THEME_KEY = 'pulse.theme';

function apply(choice: ThemeChoice): void {
  document.documentElement.classList.toggle('light', choice === 'light');
}

/**
 * Theme state. Dark is the product's default — this is a monitoring tool people
 * keep open on a wall display — so light is opt-in rather than system-derived.
 * A blocking script in the layout applies the stored value before first paint.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeChoice>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    const initial: ThemeChoice = stored === 'light' ? 'light' : 'dark';
    setThemeState(initial);
    apply(initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    apply(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage unavailable — the class is still applied for this session */
    }
  }, []);

  return { theme, setTheme, mounted };
}

export { THEME_KEY };
