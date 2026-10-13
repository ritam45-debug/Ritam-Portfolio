import { useMemo, useRef, useState } from "react";
import { ArrowDownRight, Linkedin } from "lucide-react";
import { profile } from "../content/profile";

// Deterministic "market" series so the hero looks the same on every load.
function series(n: number) {
  let s = 11;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts: number[] = [];
  let v = 40;
  for (let i = 0; i < n; i++) {
    v += (rand() - 0.42) * 7;
    v = Math.max(12, Math.min(88, v));
    pts.push(v);
  }
  return pts;
}

const STAGES = [
  { at: 0.12, label: "Data", note: "Collect, clean, question the source" },
  { at: 0.38, label: "Analysis", note: "Ratios, models, patterns" },
  { at: 0.64, label: "Insight", note: "What the numbers actually say" },
  { at: 0.9, label: "Decision", note: "What we should do about it" },
];

export function Hero() {
  const W = 640, H = 300, PAD = 24;
  const data = useMemo(() => series(64), []);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const x = (i: number) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (v / 100) * (H - PAD * 2);
  const path = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${path} L${x(data.length - 1)},${H - PAD} L${x(0)},${H - PAD} Z`;
  const stageIdx = STAGES.map((s) => Math.round(s.at * (data.length - 1)));
  const activeStage = hover === null ? -1 : stageIdx.reduce((best, si, k) => (Math.abs(si - hover) < Math.abs(stageIdx[best] - hover) ? k : best), 0);

  const move = (clientX: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const rel = ((clientX - r.left) / r.width) * W;
    const i = Math.round(((rel - PAD) / (W - PAD * 2)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <section id="top" className="ledger relative overflow-hidden border-b border-line">
      <div className="aurora" aria-hidden><span /><span /><span /></div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:pb-24">
        <div className="min-w-0">
          <p className="ticker rise text-accent">RD · FIN / DATA / STRATEGY / AI</p>
          <h1 className="rise mt-5 font-display text-[2.6rem] leading-[1.02] tracking-tight text-fg sm:text-6xl" style={{ animationDelay: "80ms" }}>
            {profile.headline.map((line, i) => (
              <span key={line} className={`block ${i === 1 ? "gradient-text italic pb-1" : ""}`}>{line}</span>
            ))}
          </h1>
          <p className="rise mt-6 max-w-[54ch] text-lg text-muted" style={{ animationDelay: "160ms" }}>
            <span className="text-fg">{profile.name}</span> — where finance meets data, strategy &amp; AI. {profile.intro}
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <a href="#projects" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-sm font-semibold text-accent-ink shadow-[0_10px_30px_-10px_var(--accent)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_var(--accent)]">
              Explore projects <ArrowDownRight size={16} className="transition-transform group-hover:rotate-[-45deg]" />
            </a>
            <a href="#competitions" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-5 py-3 text-sm font-semibold text-fg backdrop-blur-sm transition-colors hover:border-accent">
              Competition record
            </a>
            <a href="#about" className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-muted hover:text-fg">
              About me
            </a>
            {profile.contact.linkedin && (
              <a href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-3 py-3 text-sm font-semibold text-muted hover:text-fg">
                <Linkedin size={16} /> LinkedIn
              </a>
            )}
          </div>
        </div>

        <figure className="rise edge min-w-0 rounded-2xl p-4 shadow-[0_30px_80px_-40px_var(--accent)] sm:p-5" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between gap-3">
            <p className="ticker text-muted">From data to decision</p>
            <p className="ticker num text-muted">
              {hover === null ? "Hover the line" : `t+${hover} · ${data[hover].toFixed(1)}`}
            </p>
          </div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="mt-3 h-auto w-full touch-none select-none"
            role="img"
            aria-label="Decorative line chart with four stages: data, analysis, insight and decision"
            onMouseMove={(e) => move(e.clientX)}
            onMouseLeave={() => setHover(null)}
            onTouchMove={(e) => move(e.touches[0].clientX)}
            onTouchEnd={() => setHover(null)}
          >
            <defs>
              <linearGradient id="heroFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="heroStroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="var(--accent-2)" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1={PAD} x2={W - PAD} y1={y(g * 100)} y2={y(g * 100)} stroke="var(--line)" strokeDasharray="2 6" />
            ))}
            <path d={area} fill="url(#heroFill)" />
            <path d={path} fill="none" stroke="url(#heroStroke)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round"
              style={{ strokeDasharray: 2000, ["--len" as string]: 2000, animation: "draw 2.2s ease-out both" }} />
            {stageIdx.map((si, k) => (
              <g key={STAGES[k].label}>
                <line x1={x(si)} x2={x(si)} y1={y(data[si]) + 8} y2={H - PAD} stroke={activeStage === k ? "var(--accent)" : "var(--line)"} />
                <circle cx={x(si)} cy={y(data[si])} r={activeStage === k ? 6 : 4} fill={activeStage === k ? "var(--accent)" : "var(--bg)"} stroke="var(--accent)" strokeWidth="2" />
                <text x={x(si)} y={H - 6} textAnchor="middle" fill={activeStage === k ? "var(--fg)" : "var(--muted)"} fontSize="12" fontFamily="var(--font-mono)">
                  {STAGES[k].label.toUpperCase()}
                </text>
              </g>
            ))}
            {hover !== null && (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={PAD} y2={H - PAD} stroke="var(--fg)" strokeOpacity="0.35" />
                <circle cx={x(hover)} cy={y(data[hover])} r="4" fill="var(--fg)" />
              </g>
            )}
            <circle className="pulse-dot" cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="5" fill="var(--accent)" />
          </svg>
          <figcaption className="mt-2 min-h-[2.75rem] text-sm text-muted">
            {activeStage >= 0 ? (
              <><span className="font-semibold text-fg">{STAGES[activeStage].label}:</span> {STAGES[activeStage].note}</>
            ) : (
              "Every analysis follows the same path. Move across the chart to walk through it. (Decorative series, not market data.)"
            )}
          </figcaption>
        </figure>
      </div>
      <TickerTape />
    </section>
  );
}

const TAPE: { label: string; value: string; up?: boolean }[] = [
  { label: "BLUE STAR FY26 SALES", value: "₹12,402 Cr", up: true },
  { label: "BLUE STAR EBITDA MARGIN", value: "7.52%", up: true },
  { label: "BLUE STAR ROCE", value: "20.17%" },
  { label: "BLUE STAR P/E", value: "62.76x" },
  { label: "POLYCAB 5Y SALES CAGR", value: "26.4%", up: true },
  { label: "KEI 5Y PROFIT CAGR", value: "26.8%", up: true },
  { label: "R R KABEL ASSET TURNS FY25", value: "2.17x" },
  { label: "CASE COMPETITIONS", value: "60 entered" },
  { label: "FINALS & TOP PLACINGS", value: "4", up: true },
];

function TickerTape() {
  const items = [...TAPE, ...TAPE];
  return (
    <div className="relative border-t border-line bg-surface/70 backdrop-blur-sm" aria-label="Highlights from projects and competitions">
      <div className="overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="marquee gap-10 pr-10">
          {items.map((t, i) => (
            <li key={i} aria-hidden={i >= TAPE.length} className="flex shrink-0 items-center gap-2 whitespace-nowrap font-mono text-xs">
              <span className="text-muted">{t.label}</span>
              <span className="num font-semibold text-fg">{t.value}</span>
              {t.up && <span className="text-pos">▲</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
