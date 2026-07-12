'use client';

import Link from 'next/link';
import { Activity, Boxes, Cpu, MemoryStick, Server } from 'lucide-react';

import MetricChart from '@/components/charts/MetricChart';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useLiveMetrics } from '@/hooks/useLiveMetrics';
import { getAlerts, getDeployments } from '@/lib/mockData';
import { useSimulatedClock } from '@/hooks/useSimulatedClock';
import { makeSeries } from '@/lib/simulate';
import { cx, timeAgo } from '@/lib/utils';

export default function OverviewPage() {
  const { metrics } = useLiveMetrics();
  const now = useSimulatedClock();

  const alerts = getAlerts()
    .filter((a) => !a.resolved)
    .slice(0, 5);
  const deployments = [...getDeployments()]
    .sort((a, b) => b.deployedAt - a.deployedAt)
    .slice(0, 5);

  const uptimeSeries = makeSeries({
    seed: 'fleet:uptime',
    range: '24h',
    base: 99.95,
    amplitude: 0.03,
    volatility: 0.01,
    min: 99.7,
    max: 100,
    spikes: false,
  });
  const clusterSeries = makeSeries({
    seed: 'fleet:clusters',
    range: '24h',
    base: metrics.clusters,
    amplitude: 0.6,
    volatility: 0.3,
    min: 0,
    max: 30,
    spikes: false,
  });
  // Bounds are derived from the base rather than hard-coded: a fixed ceiling of
  // 2000 sat below the actual pod count, so every sample clamped to the rail and
  // the sparkline rendered as a flat line.
  const podSeries = makeSeries({
    seed: 'fleet:pods',
    range: '24h',
    base: metrics.pods,
    amplitude: metrics.pods * 0.04,
    volatility: metrics.pods * 0.012,
    min: metrics.pods * 0.8,
    max: metrics.pods * 1.2,
    spikes: false,
  });

  return (
    <div className="space-y-4">
      <section
        aria-label="Fleet summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        <StatCard
          label="Uptime"
          value={metrics.uptime}
          decimals={2}
          suffix="%"
          delta={metrics.deltas.uptime}
          series={uptimeSeries}
          icon={Activity}
          tone="ok"
        />
        <StatCard
          label="Active clusters"
          value={metrics.clusters}
          delta={metrics.deltas.clusters}
          series={clusterSeries}
          icon={Server}
        />
        <StatCard
          label="Active pods"
          value={metrics.pods}
          delta={metrics.deltas.pods}
          series={podSeries}
          icon={Boxes}
        />
        <StatCard
          label="CPU usage"
          value={metrics.cpu}
          decimals={1}
          suffix="%"
          delta={metrics.deltas.cpu}
          invertDelta
          series={metrics.series.cpu}
          icon={Cpu}
          tone="warn"
        />
        <StatCard
          label="Memory usage"
          value={metrics.memory}
          decimals={1}
          suffix="%"
          delta={metrics.deltas.memory}
          invertDelta
          series={metrics.series.memory}
          icon={MemoryStick}
          tone="accent"
        />
      </section>

      <MetricChart
        title="Fleet resource usage"
        subtitle="CPU, memory and network across all clusters · last 24 hours"
        series={[
          { key: 'cpu', label: 'CPU', color: '#3b82f6', data: metrics.series.cpu },
          { key: 'memory', label: 'Memory', color: '#8b5cf6', data: metrics.series.memory },
          {
            key: 'network',
            label: 'Network I/O',
            color: '#22c55e',
            data: metrics.series.network,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="panel">
          <header className="flex items-center justify-between border-b border-edge px-4 py-2.5">
            <h2 className="text-sm font-semibold text-fg">Recent alerts</h2>
            <Link href="/alerts" className="text-2xs text-accent-400 hover:text-accent-300">
              View all
            </Link>
          </header>
          <ul className="divide-y divide-edge/60">
            {alerts.map((alert) => (
              <li key={alert.id} className="flex items-start gap-3 px-4 py-2.5">
                <span
                  className={cx(
                    'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                    alert.severity === 'critical'
                      ? 'bg-crit'
                      : alert.severity === 'warning'
                        ? 'bg-warn'
                        : 'bg-info',
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-fg">{alert.title}</p>
                  <p className="truncate font-mono text-2xs text-fg-dim">
                    {alert.resource} · {alert.clusterName}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-2xs text-fg-dim">
                  {timeAgo(alert.at, now)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <header className="flex items-center justify-between border-b border-edge px-4 py-2.5">
            <h2 className="text-sm font-semibold text-fg">Recent deployments</h2>
            <Link
              href="/deployments"
              className="text-2xs text-accent-400 hover:text-accent-300"
            >
              View all
            </Link>
          </header>
          <ul className="divide-y divide-edge/60">
            {deployments.map((deployment) => (
              <li key={deployment.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-fg">{deployment.name}</p>
                  <p className="truncate font-mono text-2xs text-fg-dim">
                    {deployment.clusterName} · {deployment.tag}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-2xs text-fg-muted">
                  {deployment.replicasReady}/{deployment.replicasDesired}
                </span>
                <StatusBadge deploy={deployment.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
