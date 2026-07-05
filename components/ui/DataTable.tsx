'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import Pagination from './Pagination';
import { cx } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  /** Value used for sorting; omit to make the column unsortable. */
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyMessage?: string;
  /**
   * Any value that should send the table back to page 1 when it changes —
   * typically the active search term and filters.
   */
  resetKey?: string;
}

type SortState = { key: string; direction: 'asc' | 'desc' } | null;

export default function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  pageSize = 10,
  emptyMessage = 'Nothing to show.',
  resetKey = '',
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;

    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));

  // Sorting or filtering can leave the current page out of range — showing an
  // empty table on page 4 of 2 is the classic version of this bug.
  const safePage = Math.min(page, pageCount);
  const sortSignature = sort ? `${sort.key}:${sort.direction}` : 'none';
  const signature = `${resetKey}|${sortSignature}|${sorted.length}`;
  const [lastSignature, setLastSignature] = useState(signature);
  if (signature !== lastSignature) {
    setLastSignature(signature);
    if (page !== 1) setPage(1);
  }

  const visible = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: string) => {
    setSort((previous) => {
      if (!previous || previous.key !== key) return { key, direction: 'asc' };
      if (previous.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  return (
    <div className="panel overflow-hidden">
      <div className="thin-scroll overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse">
          <thead className="border-b border-edge bg-raised/50">
            <tr>
              {columns.map((column) => {
                const sortable = Boolean(column.sortValue);
                const active = sort?.key === column.key;
                const Icon = !active
                  ? ChevronsUpDown
                  : sort!.direction === 'asc'
                    ? ArrowUp
                    : ArrowDown;

                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={cx(
                      'th',
                      column.align === 'right' && 'text-right',
                      column.className,
                    )}
                    aria-sort={
                      active ? (sort!.direction === 'asc' ? 'ascending' : 'descending') : 'none'
                    }
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cx(
                          'inline-flex items-center gap-1 transition-colors hover:text-fg',
                          column.align === 'right' && 'flex-row-reverse',
                          active && 'text-fg',
                        )}
                      >
                        {column.header}
                        <Icon
                          className={cx(
                            'h-3 w-3',
                            active ? 'text-accent-400' : 'text-fg-dim/60',
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {visible.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={cx(
                  'border-b border-edge/60 transition-colors last:border-b-0',
                  onRowClick &&
                    'cursor-pointer hover:bg-raised focus:bg-raised focus:outline-none',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cx(
                      'cell',
                      column.align === 'right' && 'text-right',
                      column.className,
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}

            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-sm text-fg-dim"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={safePage}
        pageCount={pageCount}
        total={sorted.length}
        pageSize={pageSize}
        onChange={setPage}
      />
    </div>
  );
}
