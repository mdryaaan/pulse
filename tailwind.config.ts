import type { Config } from 'tailwindcss';

/**
 * Pulse's design system.
 *
 * Dark is the primary theme, not an afterthought: the token values below are
 * authored for the dark surface first, and the light theme is a re-mapping of
 * the same semantic names in globals.css. Components never branch on theme.
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic surfaces, driven by CSS variables.
        base: 'rgb(var(--base) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        raised: 'rgb(var(--raised) / <alpha-value>)',
        edge: 'rgb(var(--edge) / <alpha-value>)',
        'edge-strong': 'rgb(var(--edge-strong) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--fg-muted) / <alpha-value>)',
        'fg-dim': 'rgb(var(--fg-dim) / <alpha-value>)',

        // One vivid accent, reserved for interactive state and highlights.
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // Status palette — the only other colours allowed to carry meaning.
        ok: { DEFAULT: '#22c55e', dim: '#16a34a', wash: 'rgb(34 197 94 / 0.12)' },
        warn: { DEFAULT: '#f59e0b', dim: '#d97706', wash: 'rgb(245 158 11 / 0.12)' },
        crit: { DEFAULT: '#ef4444', dim: '#dc2626', wash: 'rgb(239 68 68 / 0.12)' },
        info: { DEFAULT: '#38bdf8', dim: '#0ea5e9', wash: 'rgb(56 189 248 / 0.12)' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // Numbers, metrics, identifiers and logs — anything you scan or compare.
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        panel: '10px',
        control: '8px',
      },
      boxShadow: {
        panel: '0 1px 2px rgb(0 0 0 / 0.25)',
        pop: '0 16px 48px -12px rgb(0 0 0 / 0.6)',
        glow: '0 0 0 1px rgb(59 130 246 / 0.4), 0 0 24px -6px rgb(59 130 246 / 0.45)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'log-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'log-in': 'log-in 180ms ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
