'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Boxes, Cpu, MemoryStick, Server } from 'lucide-react';

import MetricChart from '@/components/charts/MetricChart';
import DataTable, { type Column } from '@/components/ui/DataTable';
import LogTail from '@/components/ui/LogTail';
import StatusBadge from '@/components/ui/StatusBadge';
import TimeRangeSelector from '@/components/ui/TimeRangeSelector';
import { getCluster } from '@/lib/mockData';
import { EPOCH_ANCHOR, makeSeries } from '@/lib/simulate';
import { cx, formatDateTime } from '@/lib/utils';
import type { Node, TimeRange } from '@/lib/types';

export default function ClusterDetailPage() {
  const params = useParams<{ id: string }>();
  const [range, setRange] = useState<TimeRange>('24h');
  const [now, setNow] = useState(EPOCH_ANCHOR);
  useEffect(() => setNow(Date.now()), []);

  const id = decodeURIComponent(params.id ?? '');
  const cluster = getCluster(id);

  const series = useMemo(() => {
    if (!cluster) return null;
    return {
      cpu: makeSeries({ seed: `${cluster.id}:cpu`, range, base: cluster.cpu, amplitude: 13 }),
      memory: makeSeries({
        seed: `${cluster.id}:mem`,
        range,
        base: cluster.memory,
        amplitude: 8,
        volatility: 1.5,
      }),
      network: makeSeries({
        seed: `${cluster.id}:net`,
        range,
        base: 38,
        amplitude: 22,
        volatility: 4,
      }),
    };
  }, [cluster, range]);

  if (!cluster || !series) {
    return (
      <div className="panel p-10 text-center">
        <h2 className="text-sm font-semibold text-fg">Cluster not found</h2>
        <p className="mt-1 font-mono text-xs text-fg-dim">{id}</p>
        <Link
          href="/clusters"
          className="mt-5 inline-block rounded-control bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Back to clusters
        </Link>
      </div>
    );
  }

  const nodeColumns: Column<Node>[] = [
    {
      key: 'name',
      header: 'Node',
      sortValue: (n) => n.name,
      render: (n) => <span className="font-mono text-xs text-fg">{n.name}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (n) => n.status,
      render: (n) => <StatusBadge status={n.status} />,
    },
    {
      key: 'kubelet',
      header: 'Kubelet',
      sortValue: (n) => n.kubelet,
      render: (n) => <span className="font-mono text-xs text-fg-muted">{n.kubelet}</span>,
    },
    {
      key: 'cpu',
      header: 'CPU',
      align: 'right',
      sortValue: (n) => n.cpu,
      render: (n) => (
        <span className="font-mono text-xs text-fg-muted">{n.cpu.toFixed(1)}%</span>
      ),
    },
    {
      key: 'memory',
      header: 'Memory',
      align: 'right',
      sortValue: (n) => n.memory,
      render: (n) => (
        <span className="font-mono text-xs text-fg-muted">{n.memory.toFixed(1)}%</span>
      ),
    },
    {
      key: 'pods',
      header: 'Pods',
      align: 'right',
      sortValue: (n) => n.pods,
      render: (n) => <span className="font-mono text-xs text-fg-muted">{n.pods}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            href="/clusters"
            aria-label="Back to clusters"
            className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-control border border-edge text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-mono text-lg font-semibold text-fg">
                {cluster.name}
              </h2>
              <StatusBadge status={cluster.status} />
            </div>
            <p className="mt-0.5 font-mono text-2xs text-fg-dim">
              {cluster.provider.toUpperCase()} · {cluster.region} · {cluster.version} · updated{' '}
              {formatDateTime(cluster.updatedAt)}
            </p>
          </div>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Meta icon={Server} label="Nodes" value={String(cluster.nodes)} />
        <Meta icon={Boxes} label="Pods" value={String(cluster.pods)} />
        <Meta
          icon={Cpu}
          label="CPU"
          value={`${cluster.cpu.toFixed(1)}%`}
          tone={cluster.cpu > 80 ? 'warn' : undefined}
        />
        <Meta
          icon={MemoryStick}
          label="Memory"
          value={`${cluster.memory.toFixed(1)}%`}
          tone={cluster.memory > 80 ? 'warn' : undefined}
        />
      </section>

      <MetricChart
        title="Resource usage"
        subtitle={`CPU, memory and network · last ${range}`}
        series={[
          { key: 'cpu', label: 'CPU', color: '#3b82f6', data: series.cpu },
          { key: 'memory', label: 'Memory', color: '#8b5cf6', data: series.memory },
          { key: 'network', label: 'Network I/O', color: '#22c55e', data: series.network },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-fg">
            Nodes{' '}
            <span className="font-mono text-2xs text-fg-dim">({cluster.nodeList.length})</span>
          </h3>
          <DataTable
            rows={cluster.nodeList}
            columns={nodeColumns}
            rowKey={(n) => n.id}
            pageSize={8}
            emptyMessage="No nodes reporting."
          />
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-fg">Live logs</h3>
          <LogTail clusterName={cluster.name} />
          <p className="font-mono text-2xs text-fg-dim">
            Simulated stream · {new Date(now).getUTCFullYear()} · scroll up to pause auto-follow
          </p>
        </section>
      </div>
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Server;
  label: string;
  value: string;
  tone?: 'warn';
}) {
  return (
    <div className="panel flex items-center gap-3 p-3">
      <Icon className="h-4 w-4 shrink-0 text-fg-dim" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-2xs uppercase tracking-[0.09em] text-fg-dim">{label}</p>
        <p
          className={cx(
            'font-mono text-base font-semibold',
            tone === 'warn' ? 'text-warn' : 'text-fg',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
