import { useEffect, useRef, useState } from "react";

/**
 * Counts from 0 to `target` the first time the element scrolls into view.
 * Renders the final value straight away when motion is reduced or
 * IntersectionObserver is unavailable, so the number is never missing.
 */
export function useCountUp<T extends HTMLElement>(target: number, duration = 1200) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState(target);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce || typeof IntersectionObserver === "undefined") { setValue(target); return; }
    if (done.current) { setValue(target); return; }
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return;
      done.current = true;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      setValue(0);
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return [ref, value] as const;
}
