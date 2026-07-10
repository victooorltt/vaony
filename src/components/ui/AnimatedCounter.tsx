"use client";

import { useEffect, useRef, useState } from "react";

/** Counts up when scrolled into view. Rendered in mono as a "measured value". */
export function AnimatedCounter({
  target,
  suffix = "",
  label,
  notation,
}: {
  target: number;
  suffix?: string;
  label: string;
  notation: string; // e.g. "∑ students"
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        if (reduced) {
          setValue(target);
          return;
        }
        const duration = 1600;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-mono text-xs text-vaony-blue/70">{notation}</p>
      <p className="mt-1 font-display text-4xl font-bold text-vaony-ink sm:text-5xl">
        {value.toLocaleString("en-US")}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-vaony-ink/60">{label}</p>
    </div>
  );
}
