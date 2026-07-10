import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="panel p-12 text-center">
      <p className="font-mono text-3xl font-semibold text-accent-400">404</p>
      <h2 className="mt-3 text-sm font-semibold text-fg">No such view</h2>
      <p className="mt-1 text-xs text-fg-dim">That route does not exist in Pulse.</p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-control bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white no-underline transition-colors hover:bg-accent-600"
      >
        Back to overview
      </Link>
    </div>
  );
}
