import type { Status, Severity, DeployStatus } from './types';

/** Tailwind class joiner that drops falsy values. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Relative time, rendered from a fixed "now" the caller supplies.
 *
 * Callers pass `now` explicitly rather than reading the clock here so the same
 * timestamp renders identically on the server and on the client — reading
 * `Date.now()` inside a render is the usual source of hydration mismatches.
 */
export function timeAgo(at: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

const CLOCK = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'UTC',
});

/** HH:MM:SS in UTC — stable across server and client. */
export function clockTime(at: number): string {
  return CLOCK.format(new Date(at));
}

const DATETIME = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});

export function formatDateTime(at: number): string {
  return `${DATETIME.format(new Date(at))} UTC`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatCompact(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(Math.round(value));
}

export const STATUS_LABEL: Record<Status, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  warning: 'Warning',
  info: 'Info',
};

export const DEPLOY_LABEL: Record<DeployStatus, string> = {
  succeeded: 'Succeeded',
  deploying: 'Deploying',
  failed: 'Failed',
  'rolled-back': 'Rolled back',
};
