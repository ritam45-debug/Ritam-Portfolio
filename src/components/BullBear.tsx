import { useEffect, useRef, useState } from "react";
import type { ArenaHandle, RoundInfo, Side } from "./bullbear/arena";

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

/**
 * 3D Bulls vs Bears arena. three.js loads only when the section nears the
 * viewport; without WebGL the 2D version below is shown instead.
 */
export function BullBear() {
  const host = useRef<HTMLDivElement>(null);
  const arena = useRef<ArenaHandle | null>(null);
  const [mode, setMode] = useState<"pending" | "3d" | "2d">("pending");
  const [info, setInfo] = useState<RoundInfo | null>(null);
  const [backing, setBacking] = useState<Side | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (!webglOK()) { setMode("2d"); return; }
    let cancelled = false;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      try {
        const { createArena } = await import("./bullbear/arena");
        if (cancelled || !host.current) return;
        arena.current = createArena(host.current, setInfo, reduced);
        if (location.search.includes("debug-arena")) (window as unknown as { __arena: ArenaHandle }).__arena = arena.current;
        setMode("3d");
      } catch {
        if (!cancelled) setMode("2d");
      }
    }, { rootMargin: "400px 0px" });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); arena.current?.dispose(); arena.current = null; };
  }, []);

  const back = (s: Side) => { const next = backing === s ? null : s; setBacking(next); arena.current?.back(next); };

  if (mode === "2d") return <BullBear2D />;

  const total = info ? info.bulls + info.bears : 0;
  const bullShare = total ? (info!.bulls / total) * 100 : 50;

  return (
    <section aria-label="Bulls versus bears, a 3D animation" className="relative overflow-hidden border-b border-line bg-surface/40">
      <div className="pointer-events-none absolute inset-0" aria-hidden style={{ background: "radial-gradient(60% 70% at 50% 75%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 70%)" }} />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div ref={host} className="bb3d relative h-[360px] w-full touch-pan-y sm:h-[460px]" role="img"
          aria-label="A 3D bull and bear fight on a round trading floor; each round prints a green or red candle on the chart wall behind them.">
          {mode === "pending" && <p className="absolute inset-0 grid place-items-center font-mono text-xs text-muted">Loading the arena…</p>}
        </div>

        {/* Scoreboard */}
        <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-col items-center gap-2 sm:inset-x-6">
          <p className="ticker text-muted">The trading floor · <span className="text-pos">Bulls</span> vs <span className="text-neg">Bears</span></p>
          <div className="flex items-center gap-3 rounded-full border border-line bg-bg/75 px-4 py-1.5 font-mono text-sm backdrop-blur-md" aria-live="polite">
            <span className="font-semibold text-pos">BULLS {info?.bulls ?? 0}</span>
            <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-neg/70 sm:w-36" aria-hidden>
              <span className="absolute inset-y-0 left-0 rounded-full bg-pos transition-[width] duration-700" style={{ width: `${bullShare}%` }} />
            </span>
            <span className="font-semibold text-neg">{info?.bears ?? 0} BEARS</span>
          </div>
          <p key={info?.round ?? 0} className="bb3d-caption min-h-[1.25rem] text-center text-xs text-muted">
            {info ? (info.winner === "bull"
              ? <>Round {info.round}: the bull tosses the bear, <span className="text-pos">green candle printed</span></>
              : <>Round {info.round}: the bear slams the bull down, <span className="text-neg">red candle printed</span></>)
              : "Every clash prints a candle on the wall behind them"}
          </p>
        </div>

        {/* Pick a side */}
        <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-center gap-2 sm:inset-x-6">
          <span className="text-xs text-muted">Back a side:</span>
          <button type="button" onClick={() => back("bull")} aria-pressed={backing === "bull"}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${backing === "bull" ? "border-pos bg-pos text-bg" : "border-pos/60 bg-bg/70 text-pos hover:bg-pos/15"}`}>▲ Bulls</button>
          <button type="button" onClick={() => back("bear")} aria-pressed={backing === "bear"}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${backing === "bear" ? "border-neg bg-neg text-bg" : "border-neg/60 bg-bg/70 text-neg hover:bg-neg/15"}`}>▼ Bears</button>
          {backing && <span className="text-xs text-muted">Your side wins more of the next rounds.</span>}
        </div>
      </div>
    </section>
  );
}

/**
 * "Bulls vs Bears" — a looping tribute to the market's eternal tug-of-war.
 * A bull charges from the left, a bear from the right; they clash in the
 * middle with a burst of sparks while a meter swings between them.
 * All motion is CSS keyframes; under reduced motion they simply face off.
 */
export function BullBear2D() {
  return (
    <section aria-label="Bulls versus bears" className="relative overflow-hidden border-b border-line bg-surface/40">
      <div className="bb-stage relative mx-auto h-[220px] max-w-6xl px-4 sm:h-[260px] sm:px-6">
        {/* price line that flips colour with the momentum */}
        <svg viewBox="0 0 1200 260" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <path className="bb-line" d="M0 170 L80 150 L150 165 L230 120 L300 140 L380 95 L450 130 L520 110 L600 150 L680 100 L760 135 L840 80 L920 120 L1000 90 L1080 140 L1200 100"
            fill="none" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <line x1="0" x2="1200" y1="215" y2="215" stroke="var(--line)" strokeDasharray="3 8" />
        </svg>

        <p className="bb-title ticker absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-muted">Every trading day · <span className="text-pos">Bulls</span> vs <span className="text-neg">Bears</span></p>

        {/* Bull — charging right */}
        <div className="bb-bull absolute bottom-6 right-1/2 w-[150px] sm:w-[200px]">
          <svg viewBox="0 0 200 140" className="w-full" aria-hidden>
            <g fill="var(--pos)">
              <path d="M30 70 C18 64 10 74 14 88" fill="none" stroke="var(--pos)" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="88" cy="80" rx="56" ry="30" />
              <ellipse cx="72" cy="60" rx="34" ry="20" />
              <path d="M128 58 L170 68 L178 90 L160 100 L136 96 Z" />
              <g className="bb-legs-bull">
                <rect x="46" y="98" width="11" height="34" rx="4" />
                <rect x="64" y="100" width="11" height="32" rx="4" />
                <rect x="108" y="98" width="11" height="34" rx="4" />
                <rect x="126" y="100" width="11" height="32" rx="4" />
              </g>
            </g>
            <path d="M150 64 C156 40 176 34 188 44" fill="none" stroke="var(--fg)" strokeWidth="6" strokeLinecap="round" />
            <path d="M140 62 C140 44 154 36 164 38" fill="none" stroke="var(--fg)" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
            <circle cx="160" cy="76" r="3.5" fill="var(--bg)" />
            <circle cx="174" cy="90" r="2.5" fill="var(--bg)" />
          </svg>
          <p className="mt-1 text-center font-mono text-xs font-semibold text-pos">BULLS ▲</p>
        </div>

        {/* Bear — charging left */}
        <div className="bb-bear absolute bottom-6 left-1/2 w-[150px] sm:w-[200px]">
          <svg viewBox="0 0 200 140" className="w-full" aria-hidden>
            <g fill="var(--neg)">
              <ellipse cx="112" cy="82" rx="60" ry="36" />
              <circle cx="52" cy="66" r="24" />
              <circle cx="40" cy="44" r="8" />
              <circle cx="64" cy="42" r="8" />
              <ellipse cx="32" cy="74" rx="14" ry="10" />
              <g className="bb-legs-bear">
                <rect x="70" y="104" width="14" height="28" rx="6" />
                <rect x="94" y="106" width="14" height="26" rx="6" />
                <rect x="132" y="104" width="14" height="28" rx="6" />
                <rect x="154" y="106" width="14" height="26" rx="6" />
              </g>
              <path className="bb-paw" d="M64 84 C46 86 34 96 30 108 C38 112 46 108 52 100 C58 96 66 94 72 94 Z" />
            </g>
            <circle cx="48" cy="62" r="3.5" fill="var(--bg)" />
            <circle cx="22" cy="72" r="3" fill="var(--bg)" />
          </svg>
          <p className="mt-1 text-center font-mono text-xs font-semibold text-neg">▼ BEARS</p>
        </div>

        {/* Clash burst */}
        <div className="bb-burst pointer-events-none absolute bottom-[96px] left-1/2 sm:bottom-[118px]" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <span key={i} className="absolute h-1.5 w-5 rounded-full" style={{ background: i % 2 ? "var(--amber)" : "var(--fg)", transform: `rotate(${a}rad) translateX(18px)`, transformOrigin: "0 50%" }} />;
          })}
          <span className="absolute -left-6 -top-6 h-12 w-12 rounded-full" style={{ background: "radial-gradient(circle, var(--amber), transparent 70%)" }} />
        </div>

        {/* Tug-of-war meter */}
        <div className="absolute bottom-2 left-1/2 w-[min(420px,80%)] -translate-x-1/2" aria-hidden>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-neg/70">
            <div className="bb-meter absolute inset-y-0 left-0 rounded-full bg-pos" />
          </div>
        </div>
      </div>
    </section>
  );
}
