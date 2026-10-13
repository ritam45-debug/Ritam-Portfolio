import type { CategoryId } from "../content/types";

/** Small generative illustration per category — no external images needed. */
export function ProjectPreview({ category, seed }: { category: CategoryId; seed: number }) {
  const r = (k: number) => {
    const v = Math.sin(seed * 97.3 + k * 13.7) * 10000;
    return v - Math.floor(v);
  };
  const W = 320, H = 150;
  if (category === "finance") {
    // Paired bars: two series compared
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" aria-hidden>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = 30 + r(i) * 80, b = 25 + r(i + 9) * 80;
          return (
            <g key={i}>
              <rect x={24 + i * 42} y={H - 16 - a} width="14" height={a} rx="2" fill="var(--accent)" />
              <rect x={40 + i * 42} y={H - 16 - b} width="14" height={b} rx="2" fill="var(--blue)" opacity="0.7" />
            </g>
          );
        })}
        <line x1="16" x2={W - 16} y1={H - 16} y2={H - 16} stroke="var(--line)" />
      </svg>
    );
  }
  if (category === "analytics") {
    // KPI tiles + sparkline
    const pts = Array.from({ length: 12 }, (_, i) => `${20 + i * 25},${110 - r(i) * 40 - i * 2}`).join(" ");
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" aria-hidden>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={20 + i * 98} y="14" width="86" height="38" rx="6" fill="var(--surface-2)" stroke="var(--line)" />
            <rect x={30 + i * 98} y="24" width={20 + r(i) * 30} height="6" rx="3" fill={i === 1 ? "var(--accent)" : "var(--muted)"} opacity="0.8" />
            <rect x={30 + i * 98} y="36" width="40" height="5" rx="2.5" fill="var(--line)" />
          </g>
        ))}
        <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (category === "valuation") {
    // Waterfall: FCF bars + terminal value
    let base = H - 18;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => {
          const h = i === 5 ? 52 : 10 + r(i) * 12;
          base -= h;
          return <rect key={i} x={28 + i * 46} y={base} width="30" height={h} rx="2" fill={i === 5 ? "var(--blue)" : "var(--accent)"} opacity={i === 5 ? 0.75 : 1} />;
        })}
        <line x1="20" x2={W - 20} y1={H - 18} y2={H - 18} stroke="var(--line)" />
        <text x={W - 24} y="20" textAnchor="end" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">EV = ΣPV + TV</text>
      </svg>
    );
  }
  if (category === "strategy") {
    // 2x2 positioning map
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" aria-hidden>
        <line x1={W / 2} x2={W / 2} y1="12" y2={H - 12} stroke="var(--line)" />
        <line x1="20" x2={W - 20} y1={H / 2} y2={H / 2} stroke="var(--line)" />
        {Array.from({ length: 6 }).map((_, i) => (
          <circle key={i} cx={40 + r(i) * (W - 80)} cy={22 + r(i + 4) * (H - 44)} r={6 + r(i + 2) * 10} fill="var(--muted)" opacity="0.35" />
        ))}
        <circle cx={W * 0.72} cy={H * 0.28} r="11" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx={W * 0.72} cy={H * 0.28} r="4" fill="var(--accent)" />
      </svg>
    );
  }
  // ai: node network
  const nodes = Array.from({ length: 9 }, (_, i) => ({ x: 30 + r(i) * (W - 60), y: 20 + r(i + 11) * (H - 40) }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" aria-hidden>
      {nodes.map((a, i) => nodes.slice(i + 1, i + 3).map((b, j) => (
        <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--line)" />
      )))}
      {nodes.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={i === 4 ? 7 : 4} fill={i === 4 ? "var(--accent)" : "var(--blue)"} opacity={i === 4 ? 1 : 0.7} />)}
    </svg>
  );
}
