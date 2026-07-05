'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, Info, Link2, ShieldAlert } from 'lucide-react';

import StatusBadge from './StatusBadge';
import { cx, formatDateTime, timeAgo } from '@/lib/utils';
import type { Alert, Severity } from '@/lib/types';

const ICON: Record<Severity, typeof Info> = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
};

const ICON_CLASS: Record<Severity, string> = {
  critical: 'text-crit',
  warning: 'text-warn',
  info: 'text-info',
};

export default function AlertCard({
  alert,
  now,
  onToggleResolved,
}: {
  alert: Alert;
  now: number;
  onToggleResolved: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = ICON[alert.severity];

  return (
    <article
      className={cx(
        'panel transition-colors duration-200',
        alert.resolved ? 'opacity-60' : 'hover:border-edge-strong',
      )}
    >
      <div className="flex items-start gap-3 p-3.5">
        <Icon
          className={cx('mt-0.5 h-4 w-4 shrink-0', ICON_CLASS[alert.severity])}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cx(
                'text-sm font-semibold',
                alert.resolved ? 'text-fg-muted line-through' : 'text-fg',
              )}
            >
              {alert.title}
            </h3>
            <StatusBadge severity={alert.severity} />
            {alert.resolved && <StatusBadge tone="neutral" label="Resolved" />}
          </div>

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted">
            {alert.description}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-2xs text-fg-dim">
            <span className="text-accent-300/80">{alert.resource}</span>
            <span>{alert.clusterName}</span>
            <span>{timeAgo(alert.at, now)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            aria-expanded={open}
            aria-label={open ? 'Collapse alert detail' : 'Expand alert detail'}
            className="grid h-6 w-6 place-items-center rounded border border-edge text-fg-dim transition-colors hover:text-fg"
          >
            <ChevronDown
              className={cx('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-edge px-3.5 py-3">
          <p className="text-xs leading-relaxed text-fg-muted">{alert.description}</p>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-2xs sm:grid-cols-3">
            <Detail label="Resource" value={alert.resource} />
            <Detail label="Cluster" value={alert.clusterName} />
            <Detail label="Fired" value={formatDateTime(alert.at)} />
          </dl>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded border border-edge px-2 py-1 font-mono text-2xs text-fg-dim">
              <Link2 className="h-3 w-3" aria-hidden="true" />
              {alert.runbook}
            </span>
            <button
              type="button"
              onClick={() => onToggleResolved(alert.id)}
              className="rounded-control border border-edge bg-raised px-2.5 py-1 text-2xs font-semibold text-fg-muted transition-colors hover:border-accent-500 hover:text-fg"
            >
              {alert.resolved ? 'Reopen' : 'Mark resolved'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-fg-dim">{label}</dt>
      <dd className="truncate text-fg-muted">{value}</dd>
    </div>
  );
}
