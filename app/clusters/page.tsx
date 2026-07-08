'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import DataTable, { type Column } from '@/components/ui/DataTable';
import FilterDropdown from '@/components/ui/FilterDropdown';
import SearchInput from '@/components/ui/SearchInput';
import StatusBadge from '@/components/ui/StatusBadge';
import { getClusters } from '@/lib/mockData';
import { EPOCH_ANCHOR } from '@/lib/simulate';
import { cx, timeAgo } from '@/lib/utils';
import type { Cluster } from '@/lib/types';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'degraded', label: 'Degraded' },
  { value: 'down', label: 'Down' },
];

/** A compact inline usage bar — cheaper to scan than a number alone. */
function UsageBar({ value }: { value: number }) {
  const tone = value > 85 ? 'bg-crit' : value > 70 ? 'bg-warn' : 'bg-accent-500';
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="hidden h-1 w-14 overflow-hidden rounded-full bg-edge sm:block">
        <div className={cx('h-full rounded-full', tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="font-mono text-xs text-fg-muted">{value.toFixed(1)}%</span>
    </div>
  );
}

export default function ClustersPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const [now, setNow] = useState(EPOCH_ANCHOR);
  useEffect(() => setNow(Date.now()), []);

  const clusters = getClusters();

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return clusters.filter((cluster) => {
      if (status !== 'all' && cluster.status !== status) return false;
      if (!needle) return true;
      return (
        cluster.name.toLowerCase().includes(needle) ||
        cluster.region.toLowerCase().includes(needle) ||
        cluster.provider.toLowerCase().includes(needle)
      );
    });
  }, [clusters, query, status]);

  const columns: Column<Cluster>[] = [
    {
      key: 'name',
      header: 'Cluster',
      sortValue: (c) => c.name,
      render: (c) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-sm text-fg">{c.name}</p>
          <p className="truncate font-mono text-2xs uppercase text-fg-dim">{c.provider}</p>
        </div>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      sortValue: (c) => c.region,
      render: (c) => <span className="font-mono text-xs text-fg-muted">{c.region}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (c) => c.status,
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: 'nodes',
      header: 'Nodes',
      align: 'right',
      sortValue: (c) => c.nodes,
      render: (c) => <span className="font-mono text-xs text-fg-muted">{c.nodes}</span>,
    },
    {
      key: 'pods',
      header: 'Pods',
      align: 'right',
      sortValue: (c) => c.pods,
      render: (c) => <span className="font-mono text-xs text-fg-muted">{c.pods}</span>,
    },
    {
      key: 'cpu',
      header: 'CPU',
      align: 'right',
      sortValue: (c) => c.cpu,
      render: (c) => <UsageBar value={c.cpu} />,
    },
    {
      key: 'memory',
      header: 'Memory',
      align: 'right',
      sortValue: (c) => c.memory,
      render: (c) => <UsageBar value={c.memory} />,
    },
    {
      key: 'updated',
      header: 'Last updated',
      align: 'right',
      sortValue: (c) => c.updatedAt,
      render: (c) => (
        <span className="font-mono text-2xs text-fg-dim">{timeAgo(c.updatedAt, now)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Search clusters"
          placeholder="Filter by name, region or provider…"
        />
        <FilterDropdown
          label="Status"
          value={status}
          options={STATUS_OPTIONS}
          onChange={setStatus}
        />
        <span className="ml-auto font-mono text-2xs text-fg-dim">
          {rows.length} of {clusters.length}
        </span>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(c) => c.id}
        onRowClick={(c) => router.push(`/clusters/${c.id}`)}
        resetKey={`${query}|${status}`}
        emptyMessage="No clusters match those filters."
      />
    </div>
  );
}
