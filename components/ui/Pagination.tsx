'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cx } from '@/lib/utils';

export default function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  if (total === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-2 border-t border-edge px-3 py-2"
    >
      <p className="font-mono text-2xs text-fg-dim">
        {first}–{last} of {total}
      </p>

      <div className="flex items-center gap-1">
        <PageButton
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </PageButton>

        <span className="px-2 font-mono text-2xs text-fg-muted">
          {page} / {pageCount}
        </span>

        <PageButton
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </PageButton>
      </div>
    </nav>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cx(
        'grid h-7 w-7 place-items-center rounded-control border border-edge transition-colors',
        disabled
          ? 'cursor-not-allowed text-fg-dim opacity-40'
          : 'text-fg-muted hover:border-edge-strong hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}
