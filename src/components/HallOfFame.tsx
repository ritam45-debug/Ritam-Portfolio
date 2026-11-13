import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Flag, Medal, Sparkles, Target, Trophy, Users, User } from "lucide-react";
import { RESULT_DEPTH, type Competition } from "../content/competitions";

/**
 * Podium moments — every top finish gets its own card and its own animation:
 *   Winner   → gold trophy, falling confetti, rotating gold rim
 *   2nd      → swinging silver medal with a sheen sweep
 *   3rd      → bronze coin spinning in 3D
 *   4th      → target with radar pings
 *   Ranked final (e.g. 13 of 430) → rank counts down from the field size
 *   Finals   → flag raised up the pole with a pulsing glow
 *   Semis    → orbiting stars
 * Reduced motion: everything renders in its final, still state.
 */

type Kind = "winner" | "silver" | "bronze" | "fourth" | "ranked" | "finals" | "semi";

export function kindOf(c: Competition): Kind | null {
  switch (c.result) {
    case "WINNER": return "winner";
    case "2ND": return "silver";
    case "3RD": return "bronze";
    case "4TH": return "fourth";
    case "FINALS": return c.place && c.field ? "ranked" : "finals";
    case "SEMI": return "semi";
    default: return null;
  }
}

const KIND_META: Record<Kind, { label: (c: Competition) => string; tone: string }> = {
  winner: { label: (c) => (c.field ? `Winners · 1st of ${c.field} teams` : "Winners"), tone: "var(--gold)" },
  silver: { label: (c) => (c.field ? `2nd of ${c.field} teams` : "2nd place"), tone: "var(--silver)" },
  bronze: { label: (c) => (c.field ? `3rd of ${c.field}` : "3rd place"), tone: "var(--bronze)" },
  fourth: { label: () => "4th place", tone: "var(--b3)" },
  ranked: { label: (c) => `${ordinal(c.place!)} of ${c.field} · Finals`, tone: "var(--accent)" },
  finals: { label: () => "Finalists", tone: "var(--b4)" },
  semi: { label: (c) => (c.place && c.field ? `${ordinal(c.place)} of ${c.field} · Semi-finals` : "Semi-finalists"), tone: "var(--accent-2)" },
};

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Short label used in pills and lists for a special finish. */
export function specialLabel(c: Competition): string | null {
  const k = kindOf(c);
  return k ? KIND_META[k].label(c) : null;
}

export function HallOfFame({ items }: { items: Competition[] }) {
  const list = items
    .filter((c) => kindOf(c))
    .sort((a, b) => RESULT_DEPTH[b.result] - RESULT_DEPTH[a.result] || (a.place && b.place ? a.place - b.place : 0) || a.id - b.id);
  if (!list.length) return null;
  return (
    <section className="hof reveal min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6" aria-labelledby="hof-h">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="hof-h" className="flex items-center gap-2 font-display text-xl text-fg"><Sparkles size={18} className="text-b4" /> Podium moments</h3>
          <p className="text-sm text-muted">Wins, podiums, finals and semi-finals — each finish has its own animation</p>
        </div>
        <p className="num font-mono text-xs text-muted">{list.length} standout finishes</p>
      </header>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c, i) => <HofCard key={c.id} c={c} kind={kindOf(c)!} index={i} />)}
      </ul>
    </section>
  );
}

function HofCard({ c, kind, index }: { c: Competition; kind: Kind; index: number }) {
  const meta = KIND_META[kind];
  return (
    <li className={`hof-card hof-${kind} relative min-w-0 overflow-hidden rounded-xl border bg-bg p-4`} style={{ "--tone": meta.tone, "--i": index } as CSSProperties}>
      {kind === "winner" && <Confetti />}
      <div className="relative flex items-start gap-4">
        <div className="hof-emblem relative grid h-20 w-20 shrink-0 place-items-center" aria-hidden>
          <Emblem kind={kind} c={c} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="hof-tag ticker" style={{ color: meta.tone }}>{meta.label(c)}</p>
          <p className="mt-1 font-display text-lg leading-tight text-fg">{c.name}</p>
          <p className="mt-1 truncate text-sm text-muted" title={c.organiser}>{c.organiser}{c.month ? ` · ${c.month}` : ""}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted">
            {c.team.length ? <Users size={12} /> : <User size={12} />}
            {c.team.length ? `with ${c.team.join(", ")}` : "Solo"}
          </p>
        </div>
      </div>
      {kind === "ranked" && <RankMeter place={c.place!} field={c.field!} />}
      {(kind === "silver" || kind === "semi" || kind === "winner") && c.field && <FieldBar place={c.place ?? 1} field={c.field} />}
    </li>
  );
}

function Emblem({ kind, c }: { kind: Kind; c: Competition }) {
  switch (kind) {
    case "winner":
      return (
        <>
          <span className="hof-rays absolute inset-0 rounded-full" />
          <span className="hof-trophy relative grid h-14 w-14 place-items-center rounded-full"><Trophy size={30} /></span>
        </>
      );
    case "silver":
      return (
        <span className="hof-swing relative flex flex-col items-center">
          <span className="block h-6 w-3 [clip-path:polygon(0_0,100%_0,70%_100%,30%_100%)]" style={{ background: "var(--accent)" }} />
          <span className="hof-medal grid h-12 w-12 place-items-center rounded-full font-display text-xl">2</span>
        </span>
      );
    case "bronze":
      return (
        <span className="hof-coin-wrap">
          <span className="hof-coin grid h-14 w-14 place-items-center rounded-full font-display text-2xl">3</span>
        </span>
      );
    case "fourth":
      return (
        <>
          <span className="hof-ping absolute inset-2 rounded-full border-2" />
          <span className="hof-ping absolute inset-2 rounded-full border-2" style={{ animationDelay: "-0.9s" }} />
          <span className="relative grid h-12 w-12 place-items-center rounded-full border-2" style={{ borderColor: "var(--tone)", color: "var(--tone)" }}><Target size={24} /></span>
        </>
      );
    case "ranked":
      return <RankBadge place={c.place!} field={c.field!} />;
    case "finals":
      return (
        <span className="relative block h-16 w-14">
          <span className="absolute bottom-0 left-2 top-0 w-1 rounded-full bg-muted/60" />
          <span className="hof-flag absolute left-3 grid h-7 w-10 place-items-center text-bg" style={{ background: "var(--tone)" }}><Flag size={14} /></span>
        </span>
      );
    case "semi":
      return (
        <>
          <span className="hof-orbit absolute inset-1">
            {[0, 1, 2].map((i) => <span key={i} className="absolute left-1/2 top-0 -ml-1 h-2 w-2 rounded-full" style={{ background: "var(--tone)", transform: `rotate(${i * 120}deg)`, transformOrigin: "4px 36px" }} />)}
          </span>
          <span className="relative grid h-12 w-12 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--tone) 18%, transparent)", color: "var(--tone)" }}><Medal size={24} /></span>
        </>
      );
  }
}

function Confetti() {
  const bits = Array.from({ length: 18 }, (_, i) => i);
  const colors = ["var(--gold)", "var(--pos)", "var(--accent)", "var(--accent-2)", "var(--neg)"];
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden>
      {bits.map((i) => (
        <span key={i} className="hof-confetti absolute top-0 block h-2.5 w-1.5 rounded-[1px]"
          style={{ left: `${(i * 53) % 100}%`, background: colors[i % colors.length], animationDelay: `${-(i * 0.37) % 3.2}s`, animationDuration: `${2.6 + ((i * 7) % 10) / 10}s` }} />
      ))}
    </span>
  );
}

/** Counts a number from `from` to `to` the first time it scrolls into view. */
function useCountTo(from: number, to: number, ms = 1800) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") return;
    let raf = 0;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        const eased = 1 - Math.pow(1 - t, 4);
        setV(Math.round(from + (to - from) * eased));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      setV(from);
      raf = requestAnimationFrame(step);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [from, to, ms]);
  return [ref, v] as const;
}

function RankBadge({ place, field }: { place: number; field: number }) {
  const [ref, v] = useCountTo(field, place);
  return (
    <span className="hof-rank relative grid h-16 w-16 place-items-center rounded-2xl border-2" style={{ borderColor: "var(--tone)" }}>
      <span className="ticker text-[10px] text-muted">rank</span>
      <span ref={ref} className="num -mt-2 font-display text-2xl" style={{ color: "var(--tone)" }}>#{v}</span>
    </span>
  );
}

function RankMeter({ place, field }: { place: number; field: number }) {
  const ahead = field - place;
  const pct = (ahead / field) * 100;
  return <Meter caption={`Finished ahead of ${ahead} of ${field} teams`} pct={pct} />;
}

function FieldBar({ place, field }: { place: number; field: number }) {
  const pct = ((field - place) / field) * 100;
  return <Meter caption={`Finished ahead of ${field - place} of ${field} teams`} pct={pct} />;
}

function Meter({ caption, pct }: { caption: ReactNode; pct: number }) {
  return (
    <div className="relative mt-4">
      <div className="flex justify-between text-xs text-muted"><span>{caption}</span><span className="num font-mono">{pct.toFixed(1)}%</span></div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="hof-fill h-full rounded-full" style={{ width: `${pct}%`, background: "var(--tone)" }} />
      </div>
    </div>
  );
}
