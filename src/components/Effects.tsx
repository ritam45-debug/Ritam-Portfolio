import { useEffect, useRef } from "react";

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia?.("(pointer: fine)").matches;

/**
 * Site-wide pointer effects, attached once:
 *  • [data-tilt]     cards lean towards the pointer in 3D
 *  • [data-magnetic] buttons drift a few pixels towards the pointer
 * Both are skipped on touch screens and when the visitor prefers reduced motion.
 */
export function usePointerEffects() {
  useEffect(() => {
    if (reduced() || !finePointer()) return;
    let active: HTMLElement | null = null;
    const reset = (el: HTMLElement) => { el.style.transform = ""; };
    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest?.<HTMLElement>("[data-tilt],[data-magnetic]") ?? null;
      if (active && active !== target) reset(active);
      active = target;
      if (!target) return;
      const r = target.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      if (target.hasAttribute("data-tilt")) {
        const max = Number(target.dataset.tilt) || 6;
        target.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-2px)`;
      } else {
        target.style.transform = `translate(${(x * 10).toFixed(1)}px, ${(y * 8).toFixed(1)}px)`;
      }
    };
    const onLeave = () => { if (active) reset(active); active = null; };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerleave", onLeave); };
  }, []);
}

/** A soft glow that trails the pointer across the page (desktop only). */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !finePointer()) return;
    let x = -500, y = -500, cx = x, cy = y, raf = 0;
    const onMove = (e: PointerEvent) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(tick); };
    const tick = () => {
      cx += (x - cx) * 0.14;
      cy += (y - cy) * 0.14;
      el.style.transform = `translate(${cx - 200}px, ${cy - 200}px)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    el.style.opacity = "1";
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[1] h-[400px] w-[400px] rounded-full opacity-0 transition-opacity duration-700"
      style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 14%, transparent), transparent 65%)", mixBlendMode: "screen" }} />
  );
}

/** Slow-scrolling candlestick chart drawn behind the hero (decorative, not market data). */
export function CandleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, raf = 0, offset = 0, visible = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = 14, GAP = 8;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const candles: { o: number; c: number; hi: number; lo: number }[] = [];
    let last = 0.5;
    // Upward-biased random walk: more green candles than red, so the field keeps rising.
    const push = () => {
      const o = last;
      const c = o + (rnd() - 0.36) * 0.07;
      candles.push({ o, c, hi: Math.max(o, c) + rnd() * 0.03, lo: Math.min(o, c) - rnd() * 0.03 });
      last = c;
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      while (candles.length < w / (W + GAP) + 4) push();
    };
    const colors = () => {
      const cs = getComputedStyle(document.documentElement);
      return { up: cs.getPropertyValue("--accent").trim() || "#3ee6c8", down: cs.getPropertyValue("--accent-2").trim() || "#7c9cff" };
    };
    let pal = colors();
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const step = W + GAP;
      // Camera follows the trend: map the visible range to the canvas height.
      let lo = Infinity, hi = -Infinity;
      for (const k of candles) { lo = Math.min(lo, k.lo); hi = Math.max(hi, k.hi); }
      const span = Math.max(0.25, hi - lo);
      const norm = (v: number) => 0.08 + ((v - lo) / span) * 0.84;
      candles.forEach((k0, i) => {
        const k = { o: norm(k0.o), c: norm(k0.c), hi: norm(k0.hi), lo: norm(k0.lo) };
        const x = i * step - offset;
        if (x < -step || x > w + step) return;
        const up = k0.c >= k0.o;
        ctx.strokeStyle = ctx.fillStyle = up ? pal.up : pal.down;
        ctx.globalAlpha = 0.16 + 0.22 * (x / w);
        const y = (v: number) => h - v * h;
        ctx.beginPath(); ctx.moveTo(x + W / 2, y(k.hi)); ctx.lineTo(x + W / 2, y(k.lo)); ctx.lineWidth = 1.2; ctx.stroke();
        const top = y(Math.max(k.o, k.c)), bh = Math.max(2, Math.abs(y(k.o) - y(k.c)));
        ctx.beginPath(); ctx.roundRect?.(x, top, W, bh, 2) ?? ctx.rect(x, top, W, bh); ctx.fill();
      });
      ctx.globalAlpha = 1;
    };
    const tick = () => {
      offset += 0.35;
      if (offset >= W + GAP) { offset -= W + GAP; candles.shift(); push(); }
      draw();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    resize();
    draw();
    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(canvas);
    const mo = new MutationObserver(() => { pal = colors(); draw(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent"] });
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf && !reduced()) raf = requestAnimationFrame(tick); });
    io.observe(canvas);
    if (!reduced()) raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect(); io.disconnect(); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full [mask-image:linear-gradient(to_top,transparent,#000_30%,#000_70%,transparent)]" />;
}


/** A growth line that draws itself up and to the right behind the hero, with a pulsing arrowhead. */
export function RisingLine() {
  const pts = [[0, 300], [90, 285], [160, 292], [240, 250], [310, 262], [390, 214], [460, 228], [540, 176], [610, 190], [690, 140], [760, 152], [840, 98], [910, 108], [1000, 52]];
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const area = `${d} L1000 340 L0 340 Z`;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-35 sm:opacity-75">
      <svg viewBox="0 0 1040 340" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="riseStroke" x1="0" x2="1" y1="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.2" />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--pos)" />
          </linearGradient>
          <linearGradient id="riseFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="rise-area" d={area} fill="url(#riseFill)" />
        <path className="rise-line" d={d} fill="none" stroke="url(#riseStroke)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* Arrowhead in HTML so the stretched SVG doesn't distort it; sits on the line's last point (1000, 52). */}
      <span className="rise-head absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center" style={{ left: `${(1000 / 1040) * 100}%`, top: `${(52 / 340) * 100}%` }}>
        <span className="rise-ping absolute inset-0 rounded-full bg-pos/30" />
        <svg viewBox="-12 -12 24 24" className="relative h-5 w-5"><path d="M-8 6 L0 -9 L8 6 Z" fill="var(--pos)" transform="rotate(45)" /></svg>
      </span>
    </div>
  );
}

const RISERS = ["▲ Revenue", "▲ EPS", "▲ ROE", "▲ Alpha", "▲ Market cap", "▲ Margins", "▲ Dividends", "▲ Growth", "▲ Returns", "▲ Free cash flow"];

/** Small "up" tags that float upward and fade, like prices ticking higher. Decorative, no market data. */
export function RisingTickers() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {RISERS.map((t, i) => (
        <span key={t} className="riser absolute bottom-0 rounded-full border border-pos/40 bg-pos/10 px-2.5 py-1 font-mono text-[0.68rem] font-semibold text-pos backdrop-blur-sm"
          style={{ left: `${6 + ((i * 37) % 88)}%`, animationDelay: `${(i * 1.7) % 14}s`, animationDuration: `${11 + (i % 4) * 2}s` }}>
          {t}
        </span>
      ))}
    </div>
  );
}
