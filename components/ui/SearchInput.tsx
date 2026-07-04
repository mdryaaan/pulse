'use client';

import { Search, X } from 'lucide-react';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
}) {
  return (
    <label className="relative flex min-w-0 flex-1 items-center sm:max-w-xs">
      <span className="sr-only">{label}</span>
      <Search
        className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-fg-dim"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-control border border-edge bg-raised py-1.5 pl-8 pr-8 text-sm text-fg placeholder:text-fg-dim focus:border-accent-500 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 grid h-4 w-4 place-items-center rounded text-fg-dim hover:text-fg"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </label>
  );
}
