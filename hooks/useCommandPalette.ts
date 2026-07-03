'use client';

import { useEffect, useState } from 'react';

/**
 * Cmd+K / Ctrl+K open state.
 *
 * The listener is attached once at the app shell rather than per-page, so the
 * shortcut works everywhere and there is only ever one palette in the tree.
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return { open, setOpen };
}
