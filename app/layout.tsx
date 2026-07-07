import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import AppShell from '@/components/layout/AppShell';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

// Numbers, identifiers and logs are all monospace — see the README design notes.
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Pulse — Real-time infrastructure monitoring',
  description:
    'A dense, dark-first monitoring dashboard for Kubernetes fleets: cluster health, deployments, alerts and live log tails. Runs on simulated data, entirely client-side.',
  applicationName: 'Pulse',
  authors: [{ name: 'Md Raiyan' }],
  keywords: ['kubernetes', 'monitoring', 'dashboard', 'devops', 'observability', 'sre'],
  openGraph: {
    title: 'Pulse — Real-time infrastructure monitoring',
    description: 'A dense, dark-first monitoring dashboard for Kubernetes fleets.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0e14',
};

/**
 * Applies the stored theme before first paint. Dark is the default, so this
 * only matters for the light-mode opt-in — but without it those users get a
 * dark flash on every load.
 */
const themeScript = `
(function () {
  try {
    if (localStorage.getItem('pulse.theme') === 'light') {
      document.documentElement.classList.add('light');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
