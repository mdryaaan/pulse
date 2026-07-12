import type { Point, TimeRange } from './types';
import { clamp } from './utils';

/**
 * Deterministic pseudo-random number generator (mulberry32).
 *
 * Every mock value in Pulse comes from a seeded generator rather than
 * `Math.random()`. That is not a stylistic choice: this app is server-rendered,
 * so unseeded randomness would produce different HTML on the server and the
 * client and trigger a hydration mismatch on the very first paint. A fixed seed
 * means both sides compute byte-identical data, and the "live" behaviour is
 * layered on afterwards by an interval that only ever runs in the browser.
 */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable 32-bit hash, so a name can seed its own generator. */
export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

/**
 * Anchor timestamp for every generated series.
 *
 * Fixed rather than `Date.now()` for the same hydration reason as the RNG, and
 * rounded to the minute so charts line up. Screens that want a live clock read
 * it after mount.
 */
export const EPOCH_ANCHOR = Date.UTC(2026, 7, 18, 12, 0, 0);

const RANGE_CONFIG: Record<TimeRange, { points: number; stepMs: number }> = {
  '1h': { points: 60, stepMs: 60_000 },
  '6h': { points: 72, stepMs: 5 * 60_000 },
  '24h': { points: 96, stepMs: 15 * 60_000 },
  '7d': { points: 84, stepMs: 2 * 60 * 60_000 },
};

/**
 * A metric series that looks like a real one.
 *
 * Pure noise reads as static and a smooth curve reads as fake, so this layers
 * three things the way real telemetry does: a slow sinusoidal duty cycle (the
 * working day), a random walk for drift, and small per-sample jitter. Occasional
 * spikes are seeded too, because flat graphs are what fake dashboards look like.
 */
export function makeSeries(options: {
  seed: string;
  range: TimeRange;
  base: number;
  amplitude?: number;
  volatility?: number;
  min?: number;
  max?: number;
  spikes?: boolean;
  endAt?: number;
}): Point[] {
  const {
    seed,
    range,
    base,
    amplitude = 12,
    volatility = 2.4,
    min = 0,
    max = 100,
    spikes = true,
    endAt = EPOCH_ANCHOR,
  } = options;

  const { points, stepMs } = RANGE_CONFIG[range];
  const rng = makeRng(hashSeed(`${seed}:${range}`));

  // A base outside [min, max] clamps every sample to a rail and produces a dead
  // straight line, which is easy to introduce and hard to spot. Widen instead.
  const lo = Math.min(min, base - amplitude);
  const hi = Math.max(max, base + amplitude);

  let drift = 0;
  const series: Point[] = [];

  for (let i = 0; i < points; i += 1) {
    const progress = i / points;

    // Duty cycle: two gentle humps across the window, phase-shifted per series.
    const cycle = Math.sin(progress * Math.PI * 2 + rng() * 0.001) * amplitude;

    // Random walk, pulled back toward zero so it cannot run away.
    drift += (rng() - 0.5) * volatility;
    drift *= 0.94;

    const jitter = (rng() - 0.5) * volatility * 1.6;

    let value = base + cycle + drift + jitter;

    // A rare spike, decaying over the following few samples.
    if (spikes && rng() > 0.975) {
      value += (hi - base) * (0.35 + rng() * 0.4);
    }

    series.push({
      t: endAt - (points - 1 - i) * stepMs,
      v: Number(clamp(value, lo, hi).toFixed(2)),
    });
  }

  return series;
}

/** Nudges a live value by a small amount, staying inside bounds. */
export function driftValue(
  current: number,
  rng: () => number,
  options: { step?: number; min?: number; max?: number } = {},
): number {
  const { step = 1.6, min = 0, max = 100 } = options;
  // Pull gently toward the middle so a long-running page does not park at a rail.
  const centre = (min + max) / 2;
  const pull = (centre - current) * 0.015;
  const next = current + (rng() - 0.5) * step * 2 + pull;
  return Number(clamp(next, min, max).toFixed(2));
}

export function seriesDelta(series: Point[]): number {
  if (series.length < 2) return 0;
  const half = Math.floor(series.length / 2);
  const older = series.slice(0, half);
  const newer = series.slice(half);
  const mean = (arr: Point[]) => arr.reduce((sum, p) => sum + p.v, 0) / arr.length;
  const a = mean(older);
  const b = mean(newer);
  if (a === 0) return 0;
  return Number((((b - a) / a) * 100).toFixed(1));
}
