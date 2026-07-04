'use client';

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import AnimatedNumber from './AnimatedNumber';
import Sparkline from './Sparkline';
import { cx } from '@/lib/utils';
import type { Point } from '@/lib/types';

interface StatCardProps {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  delta: number;
  /** For metrics where a rise is bad (CPU, memory) rather than good. */
  invertDelta?: boolean;
  series: Point[];
  icon: LucideIcon;
  tone?: 'accent' | 'ok' | 'warn' | 'crit';
}

export default function StatCard({
  label,
  value,
  decimals = 0,
  suffix = '',
  delta,
  invertDelta = false,
  series,
  icon: Icon,
  tone = 'accent',
}: StatCardProps) {
  const flat = Math.abs(delta) < 0.05;
  const rising = delta > 0;
  // "Good" is direction-dependent: more pods is fine, more CPU is not.
  const good = flat ? null : invertDelta ? !rising : rising;

  const DeltaIcon = flat ? Minus : rising ? ArrowUpRight : ArrowDownRight;

  return (
    <article className="panel flex flex-col gap-3 p-4 transition-colors duration-200 hover:border-edge-strong">
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xs font-semibold uppercase tracking-[0.09em] text-fg-dim">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 shrink-0 text-fg-dim" aria-hidden="true" />
      </div>

      <div className="flex items-baseline gap-2">
        <AnimatedNumber
          value={value}
          decimals={decimals}
          suffix={suffix}
          className="font-mono text-2xl font-semibold leading-none tracking-tight text-fg"
        />
        <span
          className={cx(
            'inline-flex items-center gap-0.5 font-mono text-2xs font-semibold',
            good === null ? 'text-fg-dim' : good ? 'text-ok' : 'text-crit',
          )}
        >
          <DeltaIcon className="h-3 w-3" aria-hidden="true" />
          {Math.abs(delta).toFixed(1)}%
          <span className="sr-only">
            {flat ? 'unchanged' : rising ? 'increase' : 'decrease'} versus the previous window
          </span>
        </span>
      </div>

      <Sparkline data={series} tone={tone} />
    </article>
  );
}
