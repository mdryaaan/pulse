'use client';

/** Root-layout failures, where the app shell and its CSS are unavailable. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (typeof window !== 'undefined') {
    console.error('Pulse failed to start:', error);
  }

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#0a0e14',
          color: '#e2eaf5',
          fontFamily: 'ui-monospace, monospace',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1rem', margin: 0 }}>Pulse could not start</h1>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.25rem',
              borderRadius: 8,
              border: 0,
              background: '#3b82f6',
              color: '#fff',
              padding: '0.6rem 1.1rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
