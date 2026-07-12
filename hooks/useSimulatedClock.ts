'use client';

import { useEffect, useState } from 'react';

import { EPOCH_ANCHOR } from '@/lib/simulate';

/**
 * The clock the dashboard renders against.
 *
 * All mock data is generated relative to a fixed anchor, so relative timestamps
 * have to be measured from that same anchor — comparing anchored data against
 * the real wall clock made every alert read "0s ago" whenever the two drifted
 * apart, which is what happens on any day that is not the anchor date.
 *
 * Time still moves: after mount the anchor advances by however long the tab has
 * been open, so "12m ago" becomes "13m ago" while you watch.
 */
export function useSimulatedClock(tickMs = 30_000): number {
  const [now, setNow] = useState(EPOCH_ANCHOR);

  useEffect(() => {
    const mountedAt = Date.now();
    const id = window.setInterval(() => {
      setNow(EPOCH_ANCHOR + (Date.now() - mountedAt));
    }, tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);

  return now;
}
