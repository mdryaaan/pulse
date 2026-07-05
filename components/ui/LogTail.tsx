'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Terminal } from 'lucide-react';

import { makeLogLine, seedLogs } from '@/lib/mockData';
import { makeRng } from '@/lib/simulate';
import { clockTime, cx } from '@/lib/utils';
import type { LogLine } from '@/lib/types';

const LEVEL_CLASS: Record<LogLine['level'], string> = {
  INFO: 'text-ok',
  DEBUG: 'text-fg-dim',
  WARN: 'text-warn',
  ERROR: 'text-crit',
};

const MAX_LINES = 200;

/**
 * A terminal-style log tail that streams simulated lines.
 *
 * Auto-scroll is conditional: it only sticks to the bottom while the reader is
 * already there. Scrolling up to read a line must not be yanked back down by
 * the next arrival — that is the single most irritating bug a log panel can
 * have, so the check is on scroll position rather than on hover.
 */
export default function LogTail({ clusterName }: { clusterName: string }) {
  const [lines, setLines] = useState<LogLine[]>(() => seedLogs(clusterName));
  const [paused, setPaused] = useState(false);
  const [pinned, setPinned] = useState(true);

  const boxRef = useRef<HTMLDivElement>(null);
  const rng = useRef(makeRng(clusterName.length * 977 + 13));

  useEffect(() => {
    setLines(seedLogs(clusterName));
  }, [clusterName]);

  useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(
      () => {
        setLines((previous) => {
          const next = makeLogLine(rng.current, Date.now(), clusterName);
          const appended = [...previous, next];
          return appended.length > MAX_LINES ? appended.slice(-MAX_LINES) : appended;
        });
      },
      1400 + Math.floor(rng.current() * 1600),
    );
    return () => window.clearInterval(id);
  }, [paused, clusterName]);

  useEffect(() => {
    if (!pinned) return;
    const box = boxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [lines, pinned]);

  const onScroll = () => {
    const box = boxRef.current;
    if (!box) return;
    // 24px of slack so a near-bottom position still counts as pinned.
    const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 24;
    setPinned(atBottom);
  };

  return (
    <section className="panel overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-edge px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Terminal className="h-3.5 w-3.5 shrink-0 text-fg-dim" aria-hidden="true" />
          <h2 className="truncate font-mono text-xs text-fg-muted">{clusterName} · kubelet</h2>
        </div>

        <div className="flex items-center gap-2">
          {!pinned && (
            <button
              type="button"
              onClick={() => setPinned(true)}
              className="rounded border border-edge px-1.5 py-0.5 font-mono text-2xs text-fg-dim transition-colors hover:text-fg"
            >
              Jump to latest
            </button>
          )}
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Resume log stream' : 'Pause log stream'}
            className="grid h-6 w-6 place-items-center rounded border border-edge text-fg-dim transition-colors hover:text-fg"
          >
            {paused ? (
              <Play className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Pause className="h-3 w-3" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      <div
        ref={boxRef}
        onScroll={onScroll}
        role="log"
        aria-live="off"
        aria-label={`Log output for ${clusterName}`}
        className="thin-scroll h-72 overflow-y-auto bg-base/60 px-3 py-2 font-mono text-2xs leading-relaxed"
      >
        {lines.map((line) => (
          <p key={line.id} className="animate-log-in whitespace-pre-wrap break-words">
            <span className="text-fg-dim">{clockTime(line.at)}</span>{' '}
            <span className={cx('font-semibold', LEVEL_CLASS[line.level])}>
              {line.level.padEnd(5)}
            </span>{' '}
            <span className="text-accent-300/80">{line.source}</span>{' '}
            <span className="text-fg-muted">{line.message}</span>
          </p>
        ))}
      </div>
    </section>
  );
}
