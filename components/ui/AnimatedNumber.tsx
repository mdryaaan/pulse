'use client';

import { useEffect, useState } from 'react';
import { animate, useMotionValue } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

/**
 * A number that eases to its new value instead of snapping.
 *
 * The displayed text is held in React state driven by a motion value, rather
 * than written straight to the DOM, so the server and the first client render
 * both produce the exact starting value — no hydration mismatch, and no flash
 * of "0" counting up on load.
 */
export default function AnimatedNumber({
  value,
  decimals = 0,
  suffix = '',
  className,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);
  const [display, setDisplay] = useState(() => value.toFixed(decimals));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(latest.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [value, decimals, motionValue]);

  return (
    <span className={className} data-metric>
      {display}
      {suffix}
    </span>
  );
}
