import type { ReactNode } from 'react';

import { getClusters } from '@/lib/mockData';

/**
 * Every cluster id is known at build time because the dataset is generated from
 * a fixed seed — so each detail page can be prerendered as static HTML instead
 * of being rendered on demand. This lives in a layout because the page itself
 * is a client component and cannot export server-only functions.
 */
export function generateStaticParams() {
  return getClusters().map((cluster) => ({ id: cluster.id }));
}

export const dynamicParams = false;

export default function ClusterLayout({ children }: { children: ReactNode }) {
  return children;
}
