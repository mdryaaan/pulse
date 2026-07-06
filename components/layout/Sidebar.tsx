'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Bell,
  ChevronLeft,
  LayoutDashboard,
  Rocket,
  Server,
  Settings,
} from 'lucide-react';

import { cx } from '@/lib/utils';

export const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/clusters', label: 'Clusters', icon: Server },
  { href: '/deployments', label: 'Deployments', icon: Rocket },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

/**
 * Matches nested routes to their section.
 *
 * `/clusters/production-us-east` has to light up "Clusters", and the root route
 * must not match everything — a naive `startsWith` would leave Overview
 * permanently active.
 */
export function isActiveRoute(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-r border-edge bg-panel">
      <div
        className={cx(
          'flex h-14 shrink-0 items-center border-b border-edge',
          collapsed ? 'justify-center px-2' : 'justify-between px-3',
        )}
      >
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2 text-fg"
          aria-label="Pulse home"
        >
          <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-control bg-accent-500/15">
            <Activity
              className="h-4 w-4 text-accent-400"
              strokeWidth={2.4}
              aria-hidden="true"
            />
          </span>
          {!collapsed && (
            <span className="truncate text-sm font-semibold tracking-tight">Pulse</span>
          )}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="hidden h-6 w-6 place-items-center rounded border border-edge text-fg-dim transition-colors hover:text-fg lg:grid"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Primary">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(item.href, pathname);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cx(
                    'relative flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm transition-colors',
                    collapsed && 'justify-center px-0',
                    active
                      ? 'bg-accent-500/10 text-accent-300'
                      : 'text-fg-muted hover:bg-raised hover:text-fg',
                  )}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r bg-accent-400"
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cx('shrink-0 border-t border-edge p-2', collapsed && 'px-1')}>
        {collapsed ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="grid h-8 w-full place-items-center rounded-control text-fg-dim transition-colors hover:bg-raised hover:text-fg"
          >
            <ChevronLeft className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 rounded-control px-1.5 py-1.5">
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-500 text-2xs font-bold text-white"
              aria-hidden="true"
            >
              MR
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-fg">Md Raiyan</p>
              <p className="flex items-center gap-1.5 truncate text-2xs text-fg-dim">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ok" aria-hidden="true" />
                All systems operational
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
