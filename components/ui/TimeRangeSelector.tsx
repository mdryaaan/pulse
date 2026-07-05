'use client';

import { cx } from '@/lib/utils';
import type { TimeRange } from '@/lib/types';

const RANGES: TimeRange[] = ['1h', '6h', '24h', '7d'];

export default function TimeRangeSelector({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Time range"
      className="inline-flex rounded-control border border-edge bg-raised p-0.5"
    >
      {RANGES.map((range) => {
        const active = range === value;
        return (
          <button
            key={range}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(range)}
            className={cx(
              'rounded-[6px] px-2.5 py-1 font-mono text-2xs font-semibold transition-colors',
              active ? 'bg-accent-500 text-white' : 'text-fg-dim hover:text-fg',
            )}
          >
            {range}
          </button>
        );
      })}
    </div>
  );
}
