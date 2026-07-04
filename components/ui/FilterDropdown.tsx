'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { cx } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
}

export default function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape — a dropdown that traps you is worse
  // than no dropdown.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as globalThis.Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = options.find((option) => option.value === value) ?? options[0]!;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-control border border-edge bg-raised px-2.5 py-1.5 text-sm text-fg-muted transition-colors hover:border-edge-strong hover:text-fg"
      >
        <span className="text-fg-dim">{label}:</span>
        <span className="font-medium text-fg">{current.label}</span>
        <ChevronDown
          className={cx('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-30 mt-1 min-w-[10rem] overflow-hidden rounded-panel border border-edge bg-raised py-1 shadow-pop"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-panel hover:text-fg"
              >
                {option.label}
                {option.value === value && (
                  <Check className="h-3.5 w-3.5 text-accent-400" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
