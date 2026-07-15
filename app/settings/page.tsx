'use client';

import { useState } from 'react';
import { Check, Copy, Eye, EyeOff, Moon, Pencil, Sun } from 'lucide-react';

import { initialsOf, useAppState } from '@/components/layout/AppStateProvider';
import { cx } from '@/lib/utils';

// Obviously fake, and deliberately so — a demo should never look like it is
// showing a real credential.
const DEMO_TOKEN = 'plse_demo_9f4c7a2e13b8d05e6f1a4c8b2d7e0359';

const NOTIFICATIONS = [
  { id: 'critical', label: 'Critical alerts', hint: 'Page on-call immediately', default: true },
  {
    id: 'warning',
    label: 'Warning alerts',
    hint: 'Batch into a 15 minute digest',
    default: true,
  },
  {
    id: 'deploys',
    label: 'Deployment events',
    hint: 'Post to #deploys on completion',
    default: false,
  },
  {
    id: 'weekly',
    label: 'Weekly summary',
    hint: 'Fleet report every Monday 09:00 UTC',
    default: true,
  },
];

export default function SettingsPage() {
  const { theme, setTheme, themeReady, profileName, setProfileName, profileRole } =
    useAppState();
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(profileName);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.default])),
  );

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_TOKEN);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard is blocked in some embedded contexts; the token is visible
      // on screen either way, so there is nothing useful to surface.
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      <Section
        title="Profile"
        description="A local display name for this browser. Pulse has no accounts — this is stored on your device and shown in the sidebar."
      >
        <div className="flex items-center gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-500 text-sm font-bold text-white"
            aria-hidden="true"
          >
            {initialsOf(profileName)}
          </span>

          <div className="min-w-0 flex-1">
            {editingName ? (
              <input
                autoFocus
                value={draftName}
                maxLength={32}
                aria-label="Display name"
                onChange={(event) => setDraftName(event.target.value)}
                onBlur={() => {
                  setProfileName(draftName);
                  setEditingName(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setProfileName(draftName);
                    setEditingName(false);
                  }
                  if (event.key === 'Escape') {
                    setDraftName(profileName);
                    setEditingName(false);
                  }
                }}
                className="w-full rounded-control border border-accent-500 bg-base px-2.5 py-1.5 text-sm text-fg outline-none"
              />
            ) : (
              <>
                <p className="truncate text-sm font-medium text-fg">{profileName}</p>
                <p className="truncate font-mono text-2xs text-fg-dim">{profileRole}</p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (editingName) {
                setProfileName(draftName);
                setEditingName(false);
              } else {
                setDraftName(profileName);
                setEditingName(true);
              }
            }}
            aria-label={editingName ? 'Save display name' : 'Edit display name'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-control border border-edge text-fg-muted transition-colors hover:text-fg"
          >
            {editingName ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </Section>

      <Section
        title="Appearance"
        description="Pulse is designed dark-first for long sessions on a wall display. Light mode is supported for bright rooms — there is also a quick toggle in the top bar."
      >
        <div role="radiogroup" aria-label="Theme" className="flex gap-2">
          {[
            { value: 'dark' as const, label: 'Dark', icon: Moon },
            { value: 'light' as const, label: 'Light', icon: Sun },
          ].map((option) => {
            const active = themeReady && theme === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(option.value)}
                className={cx(
                  'flex flex-1 items-center justify-center gap-2 rounded-control border px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-accent-500 bg-accent-500/10 text-accent-300'
                    : 'border-edge bg-raised text-fg-muted hover:text-fg',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Notifications">
        <ul className="divide-y divide-edge/60">
          {NOTIFICATIONS.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-fg">{item.label}</p>
                <p className="truncate text-2xs text-fg-dim">{item.hint}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={toggles[item.id]}
                aria-label={item.label}
                onClick={() => setToggles((t) => ({ ...t, [item.id]: !t[item.id] }))}
                className={cx(
                  'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                  toggles[item.id] ? 'bg-accent-500' : 'bg-edge-strong',
                )}
              >
                <span
                  className={cx(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                    toggles[item.id] ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="API token"
        description="Read-only token for the Pulse API. This is a demo value and grants nothing."
      >
        <div className="flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-control border border-edge bg-base px-3 py-2 font-mono text-xs text-fg-muted">
            {revealed ? DEMO_TOKEN : `${DEMO_TOKEN.slice(0, 10)}${'•'.repeat(22)}`}
          </code>
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Hide token' : 'Reveal token'}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-control border border-edge text-fg-muted transition-colors hover:text-fg"
          >
            {revealed ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={copyToken}
            className="flex shrink-0 items-center gap-1.5 rounded-control border border-edge bg-raised px-3 py-2 text-xs font-semibold text-fg-muted transition-colors hover:border-accent-500 hover:text-fg"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copy
              </>
            )}
          </button>
        </div>
      </Section>

      <Section title="About">
        <p className="text-xs leading-relaxed text-fg-muted">
          Pulse is a design portfolio piece. Every cluster, deployment, alert and log line is
          generated client-side from a seeded simulator — there is no backend, no database and
          no real infrastructure behind it. Metrics drift on an interval so the dashboard
          behaves like a live tool.
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-4">
      <h2 className="text-sm font-semibold text-fg">{title}</h2>
      {description && <p className="mt-1 text-xs leading-relaxed text-fg-dim">{description}</p>}
      <div className="mt-3.5">{children}</div>
    </section>
  );
}
