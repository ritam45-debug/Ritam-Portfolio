import { useMemo, useState } from "react";
import { Expand, Minus, Plus, Equal } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { blueStar as B } from "../../content/work";
import summaryImg from "../../assets/bluestar-summary.jpg";
import { Lightbox, Observation, Panel, Segmented, StatTile, axis, tip } from "./shared";

type View = "growth" | "margins" | "returns" | "valuation" | "payout";
const VIEWS: { id: View; label: string }[] = [
  { id: "growth", label: "Sales" },
  { id: "margins", label: "Margins" },
  { id: "returns", label: "Returns" },
  { id: "valuation", label: "Valuation" },
  { id: "payout", label: "EPS & DPS" },
];

const S1 = "var(--c1)", S2 = "var(--c2)", S3 = "var(--c3)";
const last = B.years.length - 1;
const salesCagr = (Math.pow(B.sales[last] / B.sales[0], 1 / last) - 1) * 100; // derived
const ebitdaBps = Math.round((B.ebitdaMargin[last] - B.ebitdaMargin[0]) * 100); // derived

export function BlueStarPanel() {
  const [view, setView] = useState<View>("growth");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const rows = useMemo(
    () => B.years.map((y, i) => ({
      year: y, sales: B.sales[i], growth: B.salesGrowth[i], gross: B.grossMargin[i], ebitda: B.ebitdaMargin[i], ebit: B.ebitMargin[i], net: B.netMargin[i],
      roe: B.roe[i], roce: B.roce[i], pe: B.pe[i], evEbitda: B.evEbitda[i], pb: B.pb[i], eps: B.eps[i], dps: B.dps[i],
    })),
    [],
  );

  const pct = (v: number) => `${v.toFixed(2)}%`;
  const x = (v: number) => `${v.toFixed(2)}x`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <dl className="reveal grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3 xl:grid-cols-5">
        <StatTile label="FY26 sales" prefix="₹" value={B.sales[last]} suffix=" Cr" note={`▲ ${B.salesGrowth[last]}% YoY`} tone="pos" />
        <StatTile label="EBITDA margin" value={B.ebitdaMargin[last]} decimals={2} suffix="%" note={`+${ebitdaBps} bps since FY22`} tone="pos" />
        <StatTile label="Return on capital employed" value={B.roce[last]} decimals={2} suffix="%" note={`ROE ${B.roe[last]}%`} />
        <StatTile label="Price to earnings" value={B.pe[last]} decimals={1} suffix="x" note={`P/B ${B.pb[last]}x`} />
        <StatTile label="Enterprise value" prefix="₹" value={B.capital.ev} suffix=" Cr" note={`at ₹${B.capital.price.toLocaleString("en-IN")} on ${B.capital.priceDate}`} />
      </dl>

      <Panel
        title="Five-year financials"
        sub="FY22 to FY26 (March year-end) · switch views to read growth, margins, returns, valuation and payout"
        action={<Segmented label="Chart view" value={view} onChange={setView} options={VIEWS} />}
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {view === "growth" ? (
              <BarChart data={rows} margin={{ top: 24, right: 8, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="bsBar" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" />
                    <stop offset="100%" stopColor="var(--accent-2)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" strokeDasharray="2 5" vertical={false} />
                <XAxis dataKey="year" {...axis} />
                <YAxis {...axis} width={56} tickFormatter={(v: number) => v.toLocaleString("en-IN")} />
                <Tooltip {...tip} formatter={(v: number, _n, p) => [`₹${v.toLocaleString("en-IN")} Cr · ${p.payload.growth}% YoY`, "Total sales"]} />
                <Bar dataKey="sales" name="Total sales (₹ Cr)" fill="url(#bsBar)" radius={[6, 6, 0, 0]} animationDuration={900}>
                  <LabelList dataKey="growth" position="top" formatter={(v: number) => `+${v}%`} style={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }} />
                </Bar>
              </BarChart>
            ) : view === "payout" ? (
              <BarChart data={rows} margin={{ top: 10, right: 8, left: -12, bottom: 0 }} barGap={4}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="2 5" vertical={false} />
                <XAxis dataKey="year" {...axis} />
                <YAxis {...axis} tickFormatter={(v: number) => `₹${v}`} />
                <Tooltip {...tip} formatter={(v: number, n: string) => [`₹${v}`, n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v: string) => <span style={{ color: "var(--muted)" }}>{v}</span>} />
                <Bar dataKey="eps" name="EPS (₹/share)" fill={S1} radius={[5, 5, 0, 0]} />
                <Bar dataKey="dps" name="DPS (₹/share)" fill={S2} radius={[5, 5, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={rows} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="2 5" vertical={false} />
                <XAxis dataKey="year" {...axis} />
                <YAxis {...axis} tickFormatter={(v: number) => (view === "valuation" ? `${v}x` : `${v}%`)} />
                <Tooltip {...tip} formatter={(v: number, n: string) => [view === "valuation" ? x(v) : pct(v), n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v: string) => <span style={{ color: "var(--muted)" }}>{v}</span>} />
                {view === "margins" && <>
                  <Line dataKey="gross" name="Gross margin" stroke={S1} strokeWidth={2.4} dot={{ r: 3.5, fill: "var(--surface)", strokeWidth: 2 }} />
                  <Line dataKey="ebitda" name="EBITDA margin" stroke={S2} strokeWidth={2.4} dot={{ r: 3.5, fill: "var(--surface)", strokeWidth: 2 }} />
                  <Line dataKey="net" name="Net margin" stroke={S3} strokeWidth={2.4} dot={{ r: 3.5, fill: "var(--surface)", strokeWidth: 2 }} />
                </>}
                {view === "returns" && <>
                  <Line dataKey="roce" name="ROCE" stroke={S1} strokeWidth={2.4} dot={{ r: 3.5, fill: "var(--surface)", strokeWidth: 2 }} />
                  <Line dataKey="roe" name="ROE" stroke={S2} strokeWidth={2.4} dot={{ r: 3.5, fill: "var(--surface)", strokeWidth: 2 }} />
                </>}
                {view === "valuation" && <>
                  <Line dataKey="pe" name="P/E" stroke={S1} strokeWidth={2.4} dot={{ r: 3.5, fill: "var(--surface)", strokeWidth: 2 }} />
                  <Line dataKey="evEbitda" name="EV/EBITDA" stroke={S2} strokeWidth={2.4} dot={{ r: 3.5, fill: "var(--surface)", strokeWidth: 2 }} />
                  <Line dataKey="pb" name="P/B" stroke={S3} strokeWidth={2.4} dot={{ r: 3.5, fill: "var(--surface)", strokeWidth: 2 }} />
                </>}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Who owns Blue Star" sub="Shareholding pattern, June 2026 quarter">
          <ul className="grid gap-3">
            {B.shareholding.map((s, i) => (
              <li key={s.name}>
                <div className="flex justify-between text-sm"><span className="text-fg">{s.name}</span><span className="num font-mono text-fg">{s.pct.toFixed(2)}%</span></div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full" style={{ width: `${(s.pct / 40) * 100}%`, background: i === 0 ? "linear-gradient(90deg, var(--accent), var(--accent-2))" : "var(--muted)", opacity: i === 0 ? 1 : 0.55 }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="ticker mt-6 text-muted">Top shareholders</p>
          <div className="mt-2 max-h-56 overflow-auto">
            <table className="num w-full text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="py-1.5 font-medium">Holder</th><th className="py-1.5 text-right font-medium">Holding</th><th className="py-1.5 text-right font-medium">Value (₹ Cr)</th></tr></thead>
              <tbody>
                {B.topHolders.map((h) => (
                  <tr key={h.name} className="border-t border-line">
                    <td className="py-1.5 pr-2 text-fg">{h.name}{h.promoter && <span className="ml-1.5 rounded border border-line px-1 text-[0.65rem] text-muted">Promoter</span>}</td>
                    <td className="py-1.5 text-right font-mono text-fg">{h.pct}%</td>
                    <td className="py-1.5 text-right font-mono text-muted">{h.valueCr.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="From market cap to enterprise value" sub={`Capital structure, ₹ Cr · ${B.capital.sharesCr} Cr shares × ₹${B.capital.price.toLocaleString("en-IN")}`}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
                data={[
                  { name: "Market cap", base: 0, v: B.capital.marketCap, kind: "total" },
                  { name: "Less: cash", base: B.capital.marketCap - B.capital.cash, v: B.capital.cash, kind: "neg" },
                  { name: "Add: debt", base: B.capital.marketCap - B.capital.cash, v: B.capital.debt, kind: "pos" },
                  { name: "Add: minority", base: B.capital.ev - B.capital.minority, v: B.capital.minority, kind: "pos" },
                  { name: "Enterprise value", base: 0, v: B.capital.ev, kind: "total" },
                ]}
              >
                <XAxis type="number" hide domain={[30000, 33200]} allowDataOverflow />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: "var(--fg)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...tip} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")} Cr`, "Amount"]} />
                <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} tooltipType="none" />
                <Bar dataKey="v" stackId="w" radius={4}>
                  {["total", "neg", "pos", "pos", "total"].map((k, i) => <Cell key={i} fill={k === "total" ? "var(--accent)" : k === "neg" ? "var(--neg)" : "var(--blue)"} />)}
                  <LabelList dataKey="v" position="right" formatter={(v: number) => v.toLocaleString("en-IN")} style={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-xs text-muted">Axis starts at ₹30,000 Cr so the small adjustments are visible.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
            <span className="rounded-md border border-line px-2 py-1 text-fg">32,363.77</span><Minus size={12} />
            <span className="rounded-md border border-line px-2 py-1">402.07</span><Plus size={12} />
            <span className="rounded-md border border-line px-2 py-1">809.99</span><Plus size={12} />
            <span className="rounded-md border border-line px-2 py-1">2.45</span><Equal size={12} />
            <span className="rounded-md border border-accent px-2 py-1 text-accent">32,774.14</span>
          </div>
          <div className="mt-5 grid gap-2 border-t border-line pt-4 sm:grid-cols-2">
            {B.pay.map((p) => (
              <div key={p.name}>
                <p className="text-sm font-semibold text-fg">{p.name}</p>
                <p className="text-xs text-muted">{p.role}</p>
                <p className="num mt-1 font-mono text-sm text-fg">₹{p.crore} Cr · <span className="text-accent">{p.xMedian}x</span> median pay</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Panel title="Reading the numbers" sub="Observations calculated on this site from the summary's figures">
          <ul className="grid gap-3">
            <Observation>Sales roughly doubled from ₹{B.sales[0].toLocaleString("en-IN")} Cr to ₹{B.sales[last].toLocaleString("en-IN")} Cr, a {salesCagr.toFixed(1)}% four-year CAGR, but growth slowed to {B.salesGrowth[last]}% in FY26.</Observation>
            <Observation>EBITDA margin widened every year, from {B.ebitdaMargin[0]}% to {B.ebitdaMargin[last]}%, while gross margin slipped to {B.grossMargin[last]}% in FY26.</Observation>
            <Observation>EPS fell {Math.abs(B.epsGrowth[last])}% in FY26 to ₹{B.eps[last]}, and the dividend was trimmed from ₹9 to ₹8.5.</Observation>
            <Observation>ROE of {B.roe[last]}% is half its FY23 peak of {B.roe[1]}%, yet the stock trades at {B.pe[last]}x earnings and {B.pb[last]}x book: the market is paying for future growth.</Observation>
            <Observation>Q1 FY27 sales rose {B.q1fy27.salesYoY}% to ₹{B.q1fy27.sales.toLocaleString("en-IN")} Cr while net profit fell {Math.abs(B.q1fy27.profitYoY)}%, with operating margin at {B.q1fy27.opm}%.</Observation>
          </ul>
        </Panel>
        <Panel title="Recent updates" sub="Corporate announcements, 2026">
          <ol className="relative grid gap-4 border-l border-line pl-5">
            {B.updates.map((u) => (
              <li key={u.text} className="relative">
                <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-accent" aria-hidden />
                <p className="num font-mono text-xs text-accent">{u.date}</p>
                <p className="text-sm text-fg">{u.text}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="reveal flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center">
        <button type="button" onClick={() => setLightbox(0)} className="group relative h-28 w-20 shrink-0 overflow-hidden rounded-md border border-line" aria-label="View the original one-page summary">
          <img src={summaryImg} alt="" className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
          <span className="absolute inset-0 grid place-items-center bg-bg/40 opacity-0 transition-opacity group-hover:opacity-100"><Expand size={18} className="text-fg" /></span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-fg">The original one-page summary</p>
          <p className="text-sm text-muted">Prepared by Ritam Dhara. Sources: {B.sources}</p>
        </div>
        <button type="button" onClick={() => setLightbox(0)} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink">
          <Expand size={14} /> View full page
        </button>
      </div>

      <Lightbox images={[{ src: summaryImg, caption: "Blue Star Ltd: one-page company summary" }]} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
