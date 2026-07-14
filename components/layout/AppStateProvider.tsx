'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { useTheme, type ThemeChoice } from '@/hooks/useTheme';

const PROFILE_KEY = 'pulse.profile';

const DEFAULT_PROFILE = {
  name: 'Demo Operator',
  role: 'platform-engineering · admin',
};

interface AppState {
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
  themeReady: boolean;
  profileName: string;
  setProfileName: (name: string) => void;
  profileRole: string;
}

const AppStateContext = createContext<AppState | null>(null);

/**
 * Holds the one instance of the app's cross-screen state.
 *
 * Theme in particular has to live here: the top bar and the settings panel both
 * expose a toggle, and calling `useTheme()` in each would give them independent
 * React state — flipping one would leave the other showing the wrong selection
 * until it happened to remount.
 */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, mounted } = useTheme();
  const [profileName, setName] = useState(DEFAULT_PROFILE.name);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PROFILE_KEY);
      if (stored) setName(stored);
    } catch {
      /* storage unavailable — the default persona is fine */
    }
  }, []);

  const setProfileName = useCallback((next: string) => {
    const trimmed = next.trim().slice(0, 32) || DEFAULT_PROFILE.name;
    setName(trimmed);
    try {
      window.localStorage.setItem(PROFILE_KEY, trimmed);
    } catch {
      /* storage unavailable — in-memory state is still correct */
    }
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        theme,
        setTheme,
        themeReady: mounted,
        profileName,
        setProfileName,
        profileRole: DEFAULT_PROFILE.role,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}

/** "Ada Lovelace" -> "AL". Falls back to the first character. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

export { DEFAULT_PROFILE };
