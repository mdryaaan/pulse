'use client';

import TimeSeriesChart from './TimeSeriesChart';
import type { SeriesSpec } from './TimeSeriesChart';

/**
 * A titled panel wrapper around TimeSeriesChart, so pages do not each
 * reinvent the header/border scaffolding around a graph.
 */
export default function MetricChart({
  title,
  subtitle,
  series,
  actions,
  height,
  unit,
  domain,
}: {
  title: string;
  subtitle?: string;
  series: SeriesSpec[];
  actions?: React.ReactNode;
  height?: number;
  unit?: string;
  domain?: [number, number];
}) {
  return (
    <section className="panel p-4">
      <header className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-fg">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-fg-dim">{subtitle}</p>}
        </div>
        {actions}
      </header>
      <TimeSeriesChart series={series} height={height} unit={unit} domain={domain} />
    </section>
  );
}
