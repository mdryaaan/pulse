'use client';

import { Menu, Search } from 'lucide-react';

import StatusBadge from '@/components/ui/StatusBadge';

export default function TopBar({
  title,
  subtitle,
  onOpenNav,
  onOpenPalette,
  live,
}: {
  title: string;
  subtitle?: string;
  onOpenNav: () => void;
  onOpenPalette: () => void;
  live: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-edge bg-base/85 px-4 backdrop-blur">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-control border border-edge text-fg-muted transition-colors hover:text-fg lg:hidden"
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-fg">{title}</h1>
        {subtitle && <p className="truncate text-2xs text-fg-dim">{subtitle}</p>}
      </div>

      {/* Only meaningful after mount, when the simulation interval is running. */}
      <StatusBadge
        tone={live ? 'ok' : 'neutral'}
        label={live ? 'Live' : 'Connecting'}
        pulse={live}
        className="hidden sm:inline-flex"
      />

      <button
        type="button"
        onClick={onOpenPalette}
        className="flex shrink-0 items-center gap-2 rounded-control border border-edge bg-raised px-2.5 py-1.5 text-2xs text-fg-dim transition-colors hover:border-edge-strong hover:text-fg"
      >
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-edge px-1 font-mono md:inline">⌘K</kbd>
      </button>
    </header>
  );
}
