import { cx, DEPLOY_LABEL, SEVERITY_LABEL, STATUS_LABEL } from '@/lib/utils';
import type { DeployStatus, Severity, Status } from '@/lib/types';

type Tone = 'ok' | 'warn' | 'crit' | 'info' | 'neutral';

const TONE_CLASS: Record<Tone, string> = {
  ok: 'border-ok/30 bg-ok/10 text-ok',
  warn: 'border-warn/30 bg-warn/10 text-warn',
  crit: 'border-crit/30 bg-crit/10 text-crit',
  info: 'border-info/30 bg-info/10 text-info',
  neutral: 'border-edge-strong bg-raised text-fg-muted',
};

const DOT_CLASS: Record<Tone, string> = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  crit: 'bg-crit',
  info: 'bg-info',
  neutral: 'bg-fg-dim',
};

const STATUS_TONE: Record<Status, Tone> = {
  healthy: 'ok',
  degraded: 'warn',
  down: 'crit',
};

const SEVERITY_TONE: Record<Severity, Tone> = {
  critical: 'crit',
  warning: 'warn',
  info: 'info',
};

const DEPLOY_TONE: Record<DeployStatus, Tone> = {
  succeeded: 'ok',
  deploying: 'info',
  failed: 'crit',
  'rolled-back': 'warn',
};

interface BadgeProps {
  status?: Status;
  severity?: Severity;
  deploy?: DeployStatus;
  label?: string;
  tone?: Tone;
  /** Pulses the dot — used for states that are actively in motion. */
  pulse?: boolean;
  className?: string;
}

export default function StatusBadge({
  status,
  severity,
  deploy,
  label,
  tone,
  pulse,
  className,
}: BadgeProps) {
  const resolvedTone: Tone =
    tone ??
    (status
      ? STATUS_TONE[status]
      : severity
        ? SEVERITY_TONE[severity]
        : deploy
          ? DEPLOY_TONE[deploy]
          : 'neutral');

  const text =
    label ??
    (status
      ? STATUS_LABEL[status]
      : severity
        ? SEVERITY_LABEL[severity]
        : deploy
          ? DEPLOY_LABEL[deploy]
          : '');

  const isPulsing = pulse ?? deploy === 'deploying';

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5',
        'text-2xs font-semibold',
        TONE_CLASS[resolvedTone],
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {isPulsing && (
          <span
            className={cx(
              'absolute inset-0 rounded-full',
              DOT_CLASS[resolvedTone],
              'animate-pulse-ring',
            )}
            aria-hidden="true"
          />
        )}
        <span className={cx('relative h-1.5 w-1.5 rounded-full', DOT_CLASS[resolvedTone])} />
      </span>
      {text}
    </span>
  );
}
