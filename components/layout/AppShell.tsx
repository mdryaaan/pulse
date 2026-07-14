'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

import { AppStateProvider } from './AppStateProvider';
import CommandPalette from './CommandPalette';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { cx } from '@/lib/utils';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Overview', subtitle: 'Fleet health across all regions' },
  '/clusters': { title: 'Clusters', subtitle: 'Kubernetes clusters under management' },
  '/deployments': { title: 'Deployments', subtitle: 'Rollout status by service' },
  '/alerts': { title: 'Alerts', subtitle: 'Firing and resolved alerts' },
  '/settings': { title: 'Settings', subtitle: 'Workspace preferences' },
};

function metaFor(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname]!;
  if (pathname.startsWith('/clusters/')) {
    return { title: 'Cluster detail', subtitle: pathname.split('/')[2] ?? '' };
  }
  return { title: 'Pulse', subtitle: '' };
}

/**
 * Persistent chrome: sidebar, top bar and the command palette.
 *
 * Route transitions animate the incoming page only — no AnimatePresence and no
 * exit animation. In the App Router the router swaps `children` while
 * `pathname` updates separately, so an exit-gated transition can be left
 * holding a stale element and never mount the replacement.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <Chrome>{children}</Chrome>
    </AppStateProvider>
  );
}

function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [live, setLive] = useState(false);
  const { open: paletteOpen, setOpen: setPaletteOpen } = useCommandPalette();

  useEffect(() => setLive(true), []);
  useEffect(() => setMobileNavOpen(false), [pathname]);

  const meta = metaFor(pathname);

  return (
    <div className="flex min-h-[100dvh] bg-base">
      {/* Desktop rail */}
      <aside
        className={cx(
          'hidden shrink-0 transition-[width] duration-200 lg:block',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <div className={cx('fixed inset-y-0 left-0', collapsed ? 'w-14' : 'w-56')}>
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
          />
          <div className="relative h-full w-60">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileNavOpen(false)}
              onNavigate={() => setMobileNavOpen(false)}
            />
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
              className="absolute -right-11 top-3 grid h-8 w-8 place-items-center rounded-control border border-edge bg-panel text-fg-muted"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          live={live}
          onOpenNav={() => setMobileNavOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0 flex-1 p-4"
        >
          {children}
        </motion.main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
