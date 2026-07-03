'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { getClusters } from '@/lib/mockData';
import { driftValue, makeRng, makeSeries, seriesDelta } from '@/lib/simulate';
import type { LiveMetrics } from '@/lib/types';

/** The deterministic starting point, identical on server and client. */
function initialMetrics(): LiveMetrics {
  const clusters = getClusters();
  const cpu = makeSeries({ seed: 'fleet:cpu', range: '24h', base: 58, amplitude: 14 });
  const memory = makeSeries({
    seed: 'fleet:mem',
    range: '24h',
    base: 66,
    amplitude: 9,
    volatility: 1.6,
  });
  const network = makeSeries({
    seed: 'fleet:net',
    range: '24h',
    base: 42,
    amplitude: 20,
    volatility: 3.4,
  });

  return {
    uptime: 99.96,
    clusters: clusters.length,
    pods: clusters.reduce((sum, c) => sum + c.pods, 0),
    cpu: cpu[cpu.length - 1]?.v ?? 58,
    memory: memory[memory.length - 1]?.v ?? 66,
    deltas: {
      uptime: 0.02,
      clusters: 0,
      pods: 2.4,
      cpu: seriesDelta(cpu),
      memory: seriesDelta(memory),
    },
    series: { cpu, memory, network },
  };
}

/**
 * Fleet metrics that drift over time.
 *
 * The first render — server and client alike — returns the seeded snapshot, so
 * the markup matches exactly. Mutation begins only after mount, which is what
 * makes the page feel live without risking a hydration mismatch.
 */
export function useLiveMetrics(intervalMs = 4000): { metrics: LiveMetrics; live: boolean } {
  const [metrics, setMetrics] = useState<LiveMetrics>(initialMetrics);
  const [live, setLive] = useState(false);
  const rng = useRef(makeRng(0xc0ffee));

  useEffect(() => {
    setLive(true);
    const next = rng.current;

    const id = window.setInterval(() => {
      setMetrics((previous) => {
        const cpu = driftValue(previous.cpu, next, { step: 2.2, min: 18, max: 94 });
        const memory = driftValue(previous.memory, next, { step: 1.3, min: 32, max: 92 });
        const stamp = (previous.series.cpu.at(-1)?.t ?? 0) + 15 * 60_000;

        // Keep the window fixed: append a point, drop the oldest.
        const shift = (series: typeof previous.series.cpu, value: number) => [
          ...series.slice(1),
          { t: stamp, v: value },
        ];

        return {
          ...previous,
          cpu,
          memory,
          pods: Math.max(0, previous.pods + (next() > 0.5 ? 1 : -1) * Math.round(next() * 3)),
          uptime: Number(Math.min(99.999, previous.uptime + (next() - 0.5) * 0.004).toFixed(3)),
          deltas: {
            ...previous.deltas,
            cpu: Number((cpu - previous.cpu).toFixed(1)),
            memory: Number((memory - previous.memory).toFixed(1)),
          },
          series: {
            cpu: shift(previous.series.cpu, cpu),
            memory: shift(previous.series.memory, memory),
            network: shift(
              previous.series.network,
              driftValue(previous.series.network.at(-1)?.v ?? 42, next, {
                step: 5,
                min: 8,
                max: 96,
              }),
            ),
          },
        };
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs]);

  return useMemo(() => ({ metrics, live }), [metrics, live]);
}
