'use client';

import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';

import type { Point } from '@/lib/types';

/**
 * A bare trend line for stat cards — no axes, no grid, no tooltip.
 *
 * The Y domain is padded as a fraction of the series' own range rather than by
 * a fixed amount. A constant pad works for CPU but flattens uptime, whose whole
 * span is a few hundredths of a percent — those cards rendered as dead straight
 * lines until the padding became relative.
 */
export default function Sparkline({
  data,
  tone = 'accent',
  height = 36,
}: {
  data: Point[];
  tone?: 'accent' | 'ok' | 'warn' | 'crit';
  height?: number;
}) {
  const stroke = {
    accent: '#3b82f6',
    ok: '#22c55e',
    warn: '#f59e0b',
    crit: '#ef4444',
  }[tone];

  const id = `spark-${tone}`;

  const values = data.map((point) => point.v);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const pad = Math.max((max - min) * 0.18, 0.0001);

  return (
    <div style={{ height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min - pad, max + pad]} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={1.6}
            fill={`url(#${id})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
