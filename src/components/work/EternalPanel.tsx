import { useMemo, useState } from "react";
import { Equal, Expand, Minus, Plus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { eternal as E } from "../../content/work";
import summaryImg from "../../assets/eternal-summary.jpg";
import { Lightbox, Observation, Panel, Segmented, StatTile, axis, tip } from "./shared";

type View = "sales" | "profit" | "margins" | "returns" | "valuation";
const VIEWS: { id: View; label: string }[] = [
  { id: "sales", label: "Sales" },
  { id: "profit", label: "Profit (₹ Cr)" },
  { id: "margins", label: "Margins" },
  { id: "returns", label: "Returns" },
  { id: "valuation", label: "Valuation" },
];
const S1 = "var(--c1)", S2 = "var(--c2)", S3 = "var(--c3)";
const last = E.years.length - 1;
const salesCagr = (Math.pow(E.sales[last] / E.sales[0], 1 / last) - 1) * 100; // derived
const netCash = E.capital.cash - E.capital.debt; // derived
const dot = { r: 3.5, fill: "var(--surface)", strokeWidth: 2 };

export function EternalPanel() {
  const [view, setView] = useState<View>("sales");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const rows = useMemo(() => E.years.map((y, i) => ({
    year: y, sales: E.sales[i], growth: E.salesGrowth[i], ebitda: E.ebitda[i], net: E.netProfit[i],
    ebitdaM: E.ebitdaMargin[i], ebitM: E.ebitMargin[i], netM: E.netMargin[i], roe: E.roe[i], roce: E.roce[i], evSales: E.evSales[i], pb: E.pb[i],
  })), []);
  const legend = <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v: string) => <span style={{ color: "var(--muted)" }}>{v}</span>} />;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <dl className="reveal grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3 xl:grid-cols-5">
        <StatTile label="FY26 sales" prefix="₹" value={E.sales[last]} suffix=" Cr" note={`▲ ${E.salesGrowth[last]}% YoY`} tone="pos" />
        <StatTile label="4-year sales CAGR" value={salesCagr} decimals={1} suffix="%" note="FY22 → FY26 (calculated)" tone="pos" />
        <StatTile label="FY26 net profit" prefix="₹" value={E.netProfit[last]} suffix=" Cr" note={`Net margin ${E.netMargin[last]}%`} />
        <StatTile label="Market cap" prefix="₹" value={E.capital.marketCap} suffix=" Cr" note={`at ₹${E.capital.price} on ${E.capital.priceDate}`} />
        <StatTile label="Net cash" prefix="₹" value={netCash} suffix=" Cr" note="Cash ₹16,475 Cr − debt ₹5,757 Cr" tone="pos" />
      </dl>

      <div className="reveal grid grid-cols-2 gap-3 md:grid-cols-4">
        {E.businesses.map((b) => (
          <div key={b.name} className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-display text-lg text-fg">{b.name}</p>
            <p className="mt-1 text-xs text-muted">{b.what}</p>
          </div>
        ))}
      </div>

      <Panel title="From losses to profit" sub="FY22 to FY26 (March year-end) · switch views to follow the turnaround" action={<Segmented label="Chart view" value={view} onChange={setView} options={VIEWS} />}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {view === "sales" ? (
              <BarChart data={rows} margin={{ top: 24, right: 8, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="etBar" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--accent)" /><stop offset="100%" stopColor="var(--accent-2)" /></linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" strokeDasharray="2 5" vertical={false} />
                <XAxis dataKey="year" {...axis} />
                <YAxis {...axis} width={60} tickFormatter={(v: number) => v.toLocaleString("en-IN")} />
                <Tooltip {...tip} formatter={(v: number, _n, p) => [`₹${v.toLocaleString("en-IN")} Cr · +${p.payload.growth}% YoY`, "Total sales"]} />
                <Bar dataKey="sales" fill="url(#etBar)" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="growth" position="top" formatter={(v: number) => `+${v}%`} style={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }} />
                </Bar>
              </BarChart>
            ) : view === "profit" ? (
              <BarChart data={rows} margin={{ top: 10, right: 8, left: 4, bottom: 0 }} barGap={4}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="2 5" vertical={false} />
                <XAxis dataKey="year" {...axis} />
                <YAxis {...axis} width={60} tickFormatter={(v: number) => v.toLocaleString("en-IN")} />
                <ReferenceLine y={0} stroke="var(--muted)" />
                <Tooltip {...tip} formatter={(v: number, n: string) => [`₹${v.toLocaleString("en-IN")} Cr`, n]} />
                {legend}
                <Bar dataKey="ebitda" name="EBITDA" fill={S1} radius={4}>{rows.map((r) => <Cell key={r.year} fill={r.ebitda < 0 ? "var(--neg)" : S1} />)}</Bar>
                <Bar dataKey="net" name="Net profit" fill={S2} radius={4}>{rows.map((r) => <Cell key={r.year} fill={r.net < 0 ? "var(--neg)" : S2} fillOpacity={r.net < 0 ? 0.6 : 1} />)}</Bar>
              </BarChart>
            ) : (
              <LineChart data={rows} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="2 5" vertical={false} />
                <XAxis dataKey="year" {...axis} />
                <YAxis {...axis} tickFormatter={(v: number) => (view === "valuation" ? `${v}x` : `${v}%`)} />
                <ReferenceLine y={0} stroke="var(--muted)" strokeDasharray="3 3" />
                <Tooltip {...tip} formatter={(v: number, n: string) => [view === "valuation" ? `${v.toFixed(2)}x` : `${v.toFixed(2)}%`, n]} />
                {legend}
                {view === "margins" && <>
                  <Line dataKey="ebitdaM" name="EBITDA margin" stroke={S1} strokeWidth={2.4} dot={dot} />
                  <Line dataKey="ebitM" name="EBIT margin" stroke={S2} strokeWidth={2.4} dot={dot} />
                  <Line dataKey="netM" name="Net margin" stroke={S3} strokeWidth={2.4} dot={dot} />
                </>}
                {view === "returns" && <>
                  <Line dataKey="roce" name="ROCE" stroke={S1} strokeWidth={2.4} dot={dot} />
                  <Line dataKey="roe" name="ROE" stroke={S2} strokeWidth={2.4} dot={dot} />
                </>}
                {view === "valuation" && <>
                  <Line dataKey="evSales" name="EV/Sales" stroke={S1} strokeWidth={2.4} dot={dot} />
                  <Line dataKey="pb" name="P/B" stroke={S2} strokeWidth={2.4} dot={dot} />
                </>}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        {view === "valuation" && (
          <p className="mt-3 text-xs text-muted">P/E and EV/EBITDA aren't charted: they were not meaningful in the loss years and very high afterwards (P/E {E.pe.slice(2).map((v) => `${v}x`).join(" → ")}; EV/EBITDA {E.evEbitda.slice(2).map((v) => `${v}x`).join(" → ")}).</p>
        )}
      </Panel>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Who owns Eternal" sub="Shareholding pattern, Sep-2026 quarter · no promoter group">
          <ul className="grid gap-3">
            {E.shareholding.map((s, i) => (
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
                {E.topHolders.map((h) => (
                  <tr key={h.name} className="border-t border-line">
                    <td className="py-1.5 pr-2 text-fg">{h.name}</td>
                    <td className="py-1.5 text-right font-mono text-fg">{h.pct}%</td>
                    <td className="py-1.5 text-right font-mono text-muted">{h.valueCr.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="From market cap to enterprise value" sub={`Capital structure, ₹ Cr · ${E.capital.sharesCr} Cr shares × ₹${E.capital.price}`}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" margin={{ top: 0, right: 76, left: 0, bottom: 0 }}
                data={[
                  { name: "Market cap", base: 0, v: E.capital.marketCap, kind: "total" },
                  { name: "Less: cash", base: E.capital.marketCap - E.capital.cash, v: E.capital.cash, kind: "neg" },
                  { name: "Add: debt", base: E.capital.marketCap - E.capital.cash, v: E.capital.debt, kind: "pos" },
                  { name: "Enterprise value", base: 0, v: E.capital.ev, kind: "total" },
                ]}>
                <XAxis type="number" hide domain={[290000, 316000]} allowDataOverflow />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: "var(--fg)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...tip} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")} Cr`, "Amount"]} />
                <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} tooltipType="none" />
                <Bar dataKey="v" stackId="w" radius={4}>
                  {["total", "neg", "pos", "total"].map((k, i) => <Cell key={i} fill={k === "total" ? "var(--accent)" : k === "neg" ? "var(--neg)" : "var(--blue)"} />)}
                  <LabelList dataKey="v" position="right" formatter={(v: number) => v.toLocaleString("en-IN")} style={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-xs text-muted">Axis starts at ₹2,90,000 Cr so the adjustments are visible. Minority interest taken as nil, as in the source.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
            <span className="rounded-md border border-line px-2 py-1 text-fg">3,14,167.17</span><Minus size={12} />
            <span className="rounded-md border border-line px-2 py-1">16,475</span><Plus size={12} />
            <span className="rounded-md border border-line px-2 py-1">5,757</span><Equal size={12} />
            <span className="rounded-md border border-accent px-2 py-1 text-accent">3,03,449.17</span>
          </div>
          <ul className="mt-5 grid gap-2 border-t border-line pt-4 sm:grid-cols-2">
            {E.leadership.map((p) => (
              <li key={p.name}>
                <p className="text-sm font-semibold text-fg">{p.name}</p>
                <p className="text-xs text-muted">{p.role}</p>
                <p className="text-xs text-fg">{p.pay}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Panel title="Reading the numbers" sub="Observations calculated on this site from the summary's figures">
          <ul className="grid gap-3">
            <Observation>Sales grew about 13x in four years, from ₹{E.sales[0].toLocaleString("en-IN")} Cr to ₹{E.sales[last].toLocaleString("en-IN")} Cr, a {salesCagr.toFixed(1)}% CAGR. Part of FY26's {E.salesGrowth[last]}% jump comes from Blinkit's move to owning inventory, which books the full value of goods sold as revenue.</Observation>
            <Observation>EBITDA swung from a ₹{Math.abs(E.ebitda[0]).toLocaleString("en-IN")} Cr loss in FY22 to a ₹{E.ebitda[last].toLocaleString("en-IN")} Cr profit in FY26, but the EBITDA margin dipped to {E.ebitdaMargin[last]}% as revenue grew faster than profit.</Observation>
            <Observation>Net margin is thin at {E.netMargin[last]}%, so the stock trades at {E.pe[last]}x earnings: investors are paying for future scale, not today's profit.</Observation>
            <Observation>Cash of ₹16,475 Cr exceeds debt of ₹5,757 Cr, so enterprise value (₹{E.capital.ev.toLocaleString("en-IN")} Cr) sits below market cap.</Observation>
            <Observation>Q2 FY27 revenue rose {E.q2fy27.revenueYoY}% to ₹{E.q2fy27.revenue.toLocaleString("en-IN")} Cr ({E.q2fy27.lfl}% like-for-like) and net profit rose {E.q2fy27.profitYoY}% to ₹{E.q2fy27.profit} Cr, though profit missed street estimates.</Observation>
          </ul>
        </Panel>
        <Panel title="Recent updates" sub="Corporate announcements, 2026">
          <ol className="relative grid gap-4 border-l border-line pl-5">
            {E.updates.map((u) => (
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
          <p className="text-sm text-muted">Prepared by Ritam Dhara. Sources: {E.sources}</p>
        </div>
        <button type="button" onClick={() => setLightbox(0)} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"><Expand size={14} /> View full page</button>
      </div>

      <Lightbox images={[{ src: summaryImg, caption: "Eternal Ltd: one-page company summary" }]} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
