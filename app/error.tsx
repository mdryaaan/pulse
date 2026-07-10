'use client';

import { useEffect } from 'react';
import { RotateCw } from 'lucide-react';

/** Keeps a render failure from blanking the dashboard with no way back. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Pulse screen error:', error);
  }, [error]);

  return (
    <div className="panel p-10 text-center">
      <h2 className="text-sm font-semibold text-fg">This view failed to render</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-fg-dim">
        The simulated data feed hit an unexpected state. Nothing is persisted, so retrying is
        safe.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex items-center gap-1.5 rounded-control bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-600"
      >
        <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
        Retry
      </button>
      {error.digest && (
        <p className="mt-4 font-mono text-2xs text-fg-dim">ref: {error.digest}</p>
      )}
    </div>
  );
}
