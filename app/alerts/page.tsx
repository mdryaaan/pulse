'use client';

import { useEffect, useMemo, useState } from 'react';
import { EyeOff } from 'lucide-react';

import AlertCard from '@/components/ui/AlertCard';
import { getAlerts } from '@/lib/mockData';
import { EPOCH_ANCHOR } from '@/lib/simulate';
import { cx } from '@/lib/utils';
import type { Severity } from '@/lib/types';

type Tab = 'all' | Severity;

const TABS: { value: Tab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

export default function AlertsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [showResolved, setShowResolved] = useState(false);

  // Resolved state is per-session, layered over the seeded data rather than
  // mutating it, so a reload returns to a known baseline.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const [now, setNow] = useState(EPOCH_ANCHOR);
  useEffect(() => setNow(Date.now()), []);

  const base = getAlerts();
  const alerts = useMemo(
    () => base.map((alert) => ({ ...alert, resolved: overrides[alert.id] ?? alert.resolved })),
    [base, overrides],
  );

  const counts = useMemo(() => {
    const open = alerts.filter((a) => !a.resolved);
    return {
      all: open.length,
      critical: open.filter((a) => a.severity === 'critical').length,
      warning: open.filter((a) => a.severity === 'warning').length,
      info: open.filter((a) => a.severity === 'info').length,
    };
  }, [alerts]);

  const visible = alerts.filter((alert) => {
    if (!showResolved && alert.resolved) return false;
    if (tab !== 'all' && alert.severity !== tab) return false;
    return true;
  });

  const toggleResolved = (id: string) =>
    setOverrides((previous) => {
      const current = alerts.find((a) => a.id === id)?.resolved ?? false;
      return { ...previous, [id]: !current };
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label="Filter by severity"
          className="flex rounded-control border border-edge bg-raised p-0.5"
        >
          {TABS.map((option) => {
            const active = tab === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(option.value)}
                className={cx(
                  'flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-xs font-semibold transition-colors',
                  active ? 'bg-accent-500 text-white' : 'text-fg-dim hover:text-fg',
                )}
              >
                {option.label}
                <span
                  className={cx('font-mono text-2xs', active ? 'text-white/80' : 'text-fg-dim')}
                >
                  {counts[option.value]}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowResolved((s) => !s)}
          aria-pressed={showResolved}
          className={cx(
            'flex items-center gap-1.5 rounded-control border px-2.5 py-1.5 text-xs font-medium transition-colors',
            showResolved
              ? 'border-accent-500 bg-accent-500/10 text-accent-300'
              : 'border-edge bg-raised text-fg-dim hover:text-fg',
          )}
        >
          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
          {showResolved ? 'Hiding nothing' : 'Show resolved'}
        </button>

        <span className="ml-auto font-mono text-2xs text-fg-dim">{visible.length} shown</span>
      </div>

      <div className="space-y-2">
        {visible.map((alert) => (
          <AlertCard key={alert.id} alert={alert} now={now} onToggleResolved={toggleResolved} />
        ))}

        {visible.length === 0 && (
          <div className="panel p-10 text-center">
            <p className="text-sm text-fg-muted">No alerts match those filters.</p>
            <p className="mt-1 font-mono text-2xs text-fg-dim">
              {showResolved ? 'Nothing here at all.' : 'Try enabling “Show resolved”.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
