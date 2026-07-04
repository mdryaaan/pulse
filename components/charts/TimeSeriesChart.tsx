'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { clockTime } from '@/lib/utils';
import type { Point } from '@/lib/types';

export interface SeriesSpec {
  key: string;
  label: string;
  color: string;
  data: Point[];
}

/**
 * The main multi-series chart.
 *
 * Series arrive as independent arrays and are zipped on a shared timestamp
 * axis — Recharts needs one row per x value, and merging by index would
 * silently misalign series of different lengths.
 */
export default function TimeSeriesChart({
  series,
  height = 260,
  unit = '%',
  domain = [0, 100],
}: {
  series: SeriesSpec[];
  height?: number;
  unit?: string;
  domain?: [number, number];
}) {
  const byTime = new Map<number, Record<string, number>>();
  for (const spec of series) {
    for (const point of spec.data) {
      const row = byTime.get(point.t) ?? {};
      row[spec.key] = point.v;
      byTime.set(point.t, row);
    }
  }

  const rows = [...byTime.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([t, values]) => ({ t, ...values }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            {series.map((spec) => (
              <linearGradient
                key={spec.key}
                id={`fill-${spec.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={spec.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={spec.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid stroke="rgb(var(--grid))" strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="t"
            tickFormatter={(t: number) => clockTime(t).slice(0, 5)}
            tickLine={false}
            axisLine={false}
            minTickGap={44}
            tick={{ fontSize: 11, fill: 'rgb(var(--fg-dim))', fontFamily: 'var(--font-mono)' }}
          />
          <YAxis
            domain={domain}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v: number) => `${v}${unit}`}
            tick={{ fontSize: 11, fill: 'rgb(var(--fg-dim))', fontFamily: 'var(--font-mono)' }}
          />

          <Tooltip
            cursor={{ stroke: 'rgb(var(--edge-strong))', strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 10,
              border: '1px solid rgb(var(--edge))',
              background: 'rgb(var(--raised))',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'rgb(var(--fg))',
              boxShadow: '0 16px 48px -12px rgb(0 0 0 / 0.6)',
            }}
            labelFormatter={(t: number) => `${clockTime(t)} UTC`}
            formatter={(value: number, name) => [`${Number(value).toFixed(1)}${unit}`, name]}
          />

          <Legend
            verticalAlign="top"
            align="right"
            height={28}
            iconType="plainline"
            iconSize={14}
            wrapperStyle={{ fontSize: 11, color: 'rgb(var(--fg-muted))', paddingBottom: 4 }}
          />

          {series.map((spec) => (
            <Area
              key={spec.key}
              type="monotone"
              dataKey={spec.key}
              name={spec.label}
              stroke={spec.color}
              strokeWidth={1.8}
              fill={`url(#fill-${spec.key})`}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
