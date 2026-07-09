'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import FilterDropdown from '@/components/ui/FilterDropdown';
import Pagination from '@/components/ui/Pagination';
import SearchInput from '@/components/ui/SearchInput';
import StatusBadge from '@/components/ui/StatusBadge';
import { getDeployments } from '@/lib/mockData';
import { EPOCH_ANCHOR } from '@/lib/simulate';
import { cx, formatDateTime, timeAgo } from '@/lib/utils';
import type { PodInstance } from '@/lib/types';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'deploying', label: 'Deploying' },
  { value: 'failed', label: 'Failed' },
  { value: 'rolled-back', label: 'Rolled back' },
];

const POD_TONE: Record<PodInstance['status'], string> = {
  Running: 'text-ok',
  Pending: 'text-warn',
  CrashLoopBackOff: 'text-crit',
  Terminating: 'text-fg-dim',
};

const PAGE_SIZE = 10;

/**
 * Rows expand in place rather than navigating away — a rollout is usually
 * checked in the context of its neighbours, so losing the list would cost more
 * than the detail gains.
 */
export default function DeploymentsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [now, setNow] = useState(EPOCH_ANCHOR);
  useEffect(() => setNow(Date.now()), []);

  const all = getDeployments();

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return all.filter((d) => {
      if (status !== 'all' && d.status !== status) return false;
      if (!needle) return true;
      return (
        d.name.toLowerCase().includes(needle) ||
        d.clusterName.toLowerCase().includes(needle) ||
        d.tag.toLowerCase().includes(needle)
      );
    });
  }, [all, query, status]);

  // Filtering can strand the reader on a page that no longer exists.
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const signature = `${query}|${status}`;
  const [lastSignature, setLastSignature] = useState(signature);
  if (signature !== lastSignature) {
    setLastSignature(signature);
    if (page !== 1) setPage(1);
    if (expanded) setExpanded(null);
  }

  const visible = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Search deployments"
          placeholder="Filter by service, cluster or tag…"
        />
        <FilterDropdown
          label="Status"
          value={status}
          options={STATUS_OPTIONS}
          onChange={setStatus}
        />
        <span className="ml-auto font-mono text-2xs text-fg-dim">
          {rows.length} of {all.length}
        </span>
      </div>

      <div className="panel overflow-hidden">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse">
            <thead className="border-b border-edge bg-raised/50">
              <tr>
                <th scope="col" className="th w-8" />
                <th scope="col" className="th">
                  Deployment
                </th>
                <th scope="col" className="th">
                  Cluster
                </th>
                <th scope="col" className="th">
                  Status
                </th>
                <th scope="col" className="th text-right">
                  Replicas
                </th>
                <th scope="col" className="th">
                  Image tag
                </th>
                <th scope="col" className="th text-right">
                  Last deployed
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((deployment) => {
                const open = expanded === deployment.id;
                return (
                  <Fragment key={deployment.id}>
                    <tr
                      onClick={() => setExpanded(open ? null : deployment.id)}
                      className="cursor-pointer border-b border-edge/60 transition-colors hover:bg-raised"
                    >
                      <td className="cell">
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-label={
                            open ? `Collapse ${deployment.name}` : `Expand ${deployment.name}`
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            setExpanded(open ? null : deployment.id);
                          }}
                          className="grid h-5 w-5 place-items-center rounded text-fg-dim transition-colors hover:text-fg"
                        >
                          <ChevronDown
                            className={cx(
                              'h-3.5 w-3.5 transition-transform',
                              open && 'rotate-180',
                            )}
                            aria-hidden="true"
                          />
                        </button>
                      </td>
                      <td className="cell font-mono text-fg">{deployment.name}</td>
                      <td className="cell font-mono text-xs text-fg-muted">
                        {deployment.clusterName}
                      </td>
                      <td className="cell">
                        <StatusBadge deploy={deployment.status} />
                      </td>
                      <td className="cell text-right">
                        <span
                          className={cx(
                            'font-mono text-xs',
                            deployment.replicasReady === deployment.replicasDesired
                              ? 'text-fg-muted'
                              : 'text-warn',
                          )}
                        >
                          {deployment.replicasReady}/{deployment.replicasDesired}
                        </span>
                      </td>
                      <td className="cell font-mono text-xs text-accent-300/80">
                        {deployment.tag}
                      </td>
                      <td className="cell text-right font-mono text-2xs text-fg-dim">
                        {timeAgo(deployment.deployedAt, now)}
                      </td>
                    </tr>

                    {open && (
                      <tr
                        key={`${deployment.id}-detail`}
                        className="border-b border-edge/60 bg-base/40"
                      >
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <div>
                              <h3 className="mb-2 text-2xs font-semibold uppercase tracking-[0.09em] text-fg-dim">
                                Rollout history
                              </h3>
                              <ul className="space-y-1.5">
                                {deployment.history.map((event) => (
                                  <li
                                    key={event.revision}
                                    className="flex flex-wrap items-center gap-2 font-mono text-2xs"
                                  >
                                    <span className="w-8 shrink-0 text-fg-dim">
                                      #{event.revision}
                                    </span>
                                    <StatusBadge deploy={event.status} />
                                    <span className="truncate text-fg-muted">
                                      {event.image}
                                    </span>
                                    <span className="ml-auto text-fg-dim">
                                      {event.by} · {formatDateTime(event.at)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h3 className="mb-2 text-2xs font-semibold uppercase tracking-[0.09em] text-fg-dim">
                                Pods ({deployment.pods.length})
                              </h3>
                              <ul className="space-y-1.5">
                                {deployment.pods.map((pod) => (
                                  <li
                                    key={pod.name}
                                    className="flex items-center gap-2 font-mono text-2xs"
                                  >
                                    <span className="min-w-0 flex-1 truncate text-fg-muted">
                                      {pod.name}
                                    </span>
                                    <span className={cx('shrink-0', POD_TONE[pod.status])}>
                                      {pod.status}
                                    </span>
                                    <span className="w-14 shrink-0 text-right text-fg-dim">
                                      {pod.restarts}r · {pod.age}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-sm text-fg-dim">
                    No deployments match those filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={rows.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>
    </div>
  );
}
