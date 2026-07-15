'use client';

import { Moon, Sun } from 'lucide-react';

import { useAppState } from '@/components/layout/AppStateProvider';

/**
 * Quick theme switch for the top bar.
 *
 * A single button that flips between the two modes, rather than a segmented
 * control — this is the "I'm in a bright room" affordance, and the explicit
 * choice still lives in Settings.
 */
export default function ThemeToggle() {
  const { theme, setTheme, themeReady } = useAppState();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-control border border-edge bg-raised text-fg-muted transition-colors hover:border-edge-strong hover:text-fg"
    >
      {/* Before mount the stored choice is unknown; render the default icon so
          there is no flash of the wrong one. */}
      {themeReady && theme === 'light' ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
