'use client';

import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Bell, CornerDownLeft, Rocket, Search, Server } from 'lucide-react';

import { NAV_ITEMS } from './Sidebar';
import { getClusters, getDeployments } from '@/lib/mockData';
import { cx } from '@/lib/utils';

/**
 * Cmd+K navigation.
 *
 * Pages come first, then jump-to-resource actions built from the same mock data
 * the tables render — so anything visible in the app is reachable by typing its
 * name, which is the whole point of the pattern.
 */
export default function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const clusters = useMemo(() => getClusters().slice(0, 12), []);
  const deployments = useMemo(() => getDeployments().slice(0, 10), []);

  // Lock background scroll while the overlay is up.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close command palette"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
      />

      <Command
        label="Command palette"
        loop
        className="relative w-full max-w-xl overflow-hidden rounded-panel border border-edge-strong bg-panel shadow-pop"
      >
        <div className="flex items-center gap-2 border-b border-edge px-3">
          <Search className="h-4 w-4 shrink-0 text-fg-dim" aria-hidden="true" />
          <Command.Input
            autoFocus
            placeholder="Search pages, clusters, deployments…"
            className="w-full bg-transparent py-3 text-sm text-fg outline-none placeholder:text-fg-dim"
          />
          <kbd className="hidden shrink-0 rounded border border-edge px-1.5 py-0.5 font-mono text-2xs text-fg-dim sm:block">
            ESC
          </kbd>
        </div>

        <Command.List className="thin-scroll max-h-[52vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-fg-dim">
            No results.
          </Command.Empty>

          <Group heading="Pages">
            {NAV_ITEMS.map((item) => (
              <Item key={item.href} onSelect={() => go(item.href)}>
                <item.icon className="h-3.5 w-3.5 text-fg-dim" aria-hidden="true" />
                {item.label}
              </Item>
            ))}
          </Group>

          <Group heading="Clusters">
            {clusters.map((cluster) => (
              <Item
                key={cluster.id}
                value={`cluster ${cluster.name} ${cluster.region}`}
                onSelect={() => go(`/clusters/${cluster.id}`)}
              >
                <Server className="h-3.5 w-3.5 text-fg-dim" aria-hidden="true" />
                <span className="font-mono">{cluster.name}</span>
                <span className="ml-auto font-mono text-2xs text-fg-dim">{cluster.region}</span>
              </Item>
            ))}
          </Group>

          <Group heading="Deployments">
            {deployments.map((deployment) => (
              <Item
                key={deployment.id}
                value={`deployment ${deployment.name} ${deployment.clusterName}`}
                onSelect={() => go('/deployments')}
              >
                <Rocket className="h-3.5 w-3.5 text-fg-dim" aria-hidden="true" />
                <span className="font-mono">{deployment.name}</span>
                <span className="ml-auto font-mono text-2xs text-fg-dim">
                  {deployment.clusterName}
                </span>
              </Item>
            ))}
          </Group>

          <Group heading="Actions">
            <Item value="view recent alerts" onSelect={() => go('/alerts')}>
              <Bell className="h-3.5 w-3.5 text-fg-dim" aria-hidden="true" />
              View recent alerts
            </Item>
          </Group>
        </Command.List>

        <footer className="flex items-center justify-between border-t border-edge px-3 py-2 font-mono text-2xs text-fg-dim">
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" aria-hidden="true" /> to select
          </span>
          <span>↑↓ to navigate</span>
        </footer>
      </Command>
    </div>
  );
}

function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group heading={heading} className="cmdk-group mb-1">
      {children}
    </Command.Group>
  );
}

function Item({
  children,
  onSelect,
  value,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  value?: string;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className={cx(
        'flex cursor-pointer items-center gap-2.5 rounded-control px-2.5 py-2 text-sm text-fg-muted',
        'data-[selected=true]:bg-accent-500/12 data-[selected=true]:text-fg',
      )}
    >
      {children}
    </Command.Item>
  );
}
