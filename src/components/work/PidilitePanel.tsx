import { useMemo, useState, type CSSProperties } from "react";
import { Bar, CartesianGrid, Cell, ComposedChart, Legend, Line, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { pidilite as P } from "../../content/work";
import { Observation, Panel, Segmented, StatTile, axis, tip } from "./shared";

type View = "revenue" | "fcff" | "margin";
const VIEWS: { id: View; label: string }[] = [
  { id: "revenue", label: "Revenue" },
  { id: "fcff", label: "Free cash flow" },
  { id: "margin", label: "EBITDA margin" },
];

const B = P.bridge;
const inr = (v: number, d = 0) => v.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
const forecastFcff = P.fcff.slice(P.actualCount);

/** Value per share recomputed from the model's own FCFF, mid-year periods and equity bridge. */
function valuePerShare(waccPct: number, gPct: number) {
  const w = waccPct / 100, g = gPct / 100;
  if (w <= g + 0.002) return null;
  const pv = forecastFcff.reduce((s, f, i) => s + f / Math.pow(1 + w, P.periods[i]), 0);
  const tv = (forecastFcff[forecastFcff.length - 1] * (1 + g)) / (w - g);
  const pvTv = tv / Math.pow(1 + w, P.periods[P.periods.length - 1]);
  const equity = pv + pvTv + B.cash + B.otherAssets - B.debt - B.minority;
  return { pv, pvTv, equity, perShare: equity / B.shares };
}

export function PidilitePanel() {
  const [view, setView] = useState<View>("revenue");
  const [wacc, setWacc] = useState(P.wacc.wacc);
  const [g, setG] = useState(P.terminal.g);

  const rows = useMemo(() => P.years.map((y, i) => ({
    year: y, forecast: i >= P.actualCount,
    revenue: P.revenue[i], growth: P.growth[i] ?? (i > 0 ? +(((P.revenue[i] / P.revenue[i - 1]) - 1) * 100).toFixed(1) : null),
    fcff: P.fcff[i], pv: P.pv[i], capex: P.capex[i],
    margin: +((P.ebitda[i] / P.revenue[i]) * 100).toFixed(1),
  })), []);

  const live = valuePerShare(wacc, g);
  const gapPct = live ? (B.cmp / live.perShare - 1) * 100 : null;
  const tvShare = (P.terminal.pvTv / B.ev) * 100; // derived
  const legend = <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v: string) => <span style={{ color: "var(--muted)" }}>{v}</span>} />;
  const fcStart = P.years[P.actualCount], fcEnd = P.years[P.years.length - 1];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <dl className="reveal grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3 xl:grid-cols-5">
        <StatTile label="DCF value per share" prefix="₹" value={B.perShare} decimals={2} note="Base case: WACC 10.11%, g 5.5%" />
        <StatTile label="Market price" prefix="₹" value={B.cmp} decimals={2} note={`as on ${P.snapshot.dataDate}`} />
        <StatTile label="Price above DCF value" value={B.overBy} decimals={1} suffix="%" note="Model output (overvalued by)" tone="neg" />
        <StatTile label="WACC" value={P.wacc.wacc} decimals={2} suffix="%" note={`β ${P.wacc.beta} · 99.7% equity-funded`} />
        <StatTile label="DCF value as % of market cap" value={B.dcfPctMcap} decimals={1} suffix="%" note="Reverse-DCF check" />
      </dl>

      <div className="reveal grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Business", P.snapshot.business],
          ["Market cap", `₹${inr(P.snapshot.marketCap)} Cr · P/E ${P.snapshot.pe}`],
          ["ROCE / ROE", `${P.snapshot.roce}% / ${P.snapshot.roe}%`],
          ["52-week range", `₹${inr(P.snapshot.low52)} – ₹${inr(P.snapshot.high52)} · yield ${P.snapshot.divYield}%`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-line bg-surface p-4">
            <p className="ticker text-muted">{k}</p>
            <p className="mt-1 text-sm text-fg">{v}</p>
          </div>
        ))}
      </div>

      <Panel title="Seven years of actuals, eight years of forecast" sub={`₹ Cr · FY20–FY26 actual, ${fcStart}–${fcEnd} forecast (shaded)`} action={<Segmented label="Chart view" value={view} onChange={setView} options={VIEWS} />}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 12, right: 8, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="pdA" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--accent)" /><stop offset="100%" stopColor="var(--accent-2)" /></linearGradient>
              </defs>
              <ReferenceArea x1={fcStart} x2={fcEnd} fill="var(--accent)" fillOpacity={0.06} label={{ value: "Forecast", position: "insideTopRight", fill: "var(--muted)", fontSize: 11 }} />
              <CartesianGrid stroke="var(--line)" strokeDasharray="2 5" vertical={false} />
              <XAxis dataKey="year" {...axis} interval="preserveStartEnd" />
              {view === "margin" ? (
                <>
                  <YAxis {...axis} width={44} domain={[10, 30]} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip {...tip} formatter={(v: number) => [`${v}%`, "EBITDA margin (calculated)"]} />
                  <Bar dataKey="margin" name="EBITDA margin (calculated)" radius={[6, 6, 0, 0]} fill="url(#pdA)">
                    {rows.map((r) => <Cell key={r.year} fillOpacity={r.forecast ? 0.55 : 1} />)}
                  </Bar>
                </>
              ) : view === "revenue" ? (
                <>
                  <YAxis yAxisId="l" {...axis} width={60} tickFormatter={(v: number) => inr(v)} />
                  <YAxis yAxisId="r" orientation="right" {...axis} width={40} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip {...tip} formatter={(v: number, n: string) => (n === "Growth" ? [`${v}%`, n] : [`₹${inr(v, 0)} Cr`, n])} />
                  {legend}
                  <Bar yAxisId="l" dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} fill="url(#pdA)">
                    {rows.map((r) => <Cell key={r.year} fillOpacity={r.forecast ? 0.55 : 1} />)}
                  </Bar>
                  <Line yAxisId="r" dataKey="growth" name="Growth" stroke="var(--c3)" strokeWidth={2} dot={{ r: 3, fill: "var(--surface)", strokeWidth: 2 }} connectNulls />
                </>
              ) : (
                <>
                  <YAxis {...axis} width={60} tickFormatter={(v: number) => inr(v)} />
                  <Tooltip {...tip} formatter={(v: number, n: string) => [`₹${inr(v, 0)} Cr`, n]} />
                  {legend}
                  <Bar dataKey="fcff" name="FCFF" radius={[6, 6, 0, 0]} fill="var(--c1)">
                    {rows.map((r) => <Cell key={r.year} fillOpacity={r.forecast ? 0.55 : 1} />)}
                  </Bar>
                  <Bar dataKey="capex" name="Capex" radius={[6, 6, 0, 0]} fill="var(--c2)" fillOpacity={0.7} />
                  <Line dataKey="pv" name="Present value of FCFF" stroke="var(--c3)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--surface)", strokeWidth: 2 }} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-muted">
          Forecast growth steps down from 13% in FY27 to 6.5% in FY34. Working capital is held near its historical median of {P.wcMedian}% of sales.
          {view === "margin" && " Margin = EBITDA ÷ revenue, calculated from the model."}
        </p>
      </Panel>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Live calculator */}
        <Panel title="Try your own assumptions" sub="Move WACC and terminal growth; the value is recalculated from the model's cash flows">
          <div className="grid gap-5">
            <Slider label="WACC (discount rate)" value={wacc} min={8} max={12.5} step={0.01} onChange={setWacc} />
            <Slider label="Terminal growth rate" value={g} min={3} max={7.5} step={0.1} onChange={setG} />
            {live ? (
              <div className="grid gap-3 rounded-xl border border-line bg-bg p-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted">Value per share</p>
                    <p className="num font-display text-4xl text-accent">₹{inr(live.perShare, 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">Market price ₹{inr(B.cmp, 0)} is</p>
                    <p className={`num font-display text-2xl ${gapPct! > 0 ? "text-neg" : "text-pos"}`}>{gapPct! > 0 ? `${inr(gapPct!, 1)}% above` : `${inr(-gapPct!, 1)}% below`}</p>
                  </div>
                </div>
                <PriceBar value={live.perShare} price={B.cmp} />
                <p className="text-xs text-muted">
                  Terminal value is {inr((live.pvTv / (live.pv + live.pvTv)) * 100, 0)}% of enterprise value at these inputs.
                  <button type="button" onClick={() => { setWacc(P.wacc.wacc); setG(P.terminal.g); }} className="ml-2 font-semibold text-accent hover:underline">Reset to base case</button>
                </p>
              </div>
            ) : (
              <p className="rounded-xl border border-neg/40 bg-neg/10 p-4 text-sm text-fg">WACC must stay above terminal growth for the Gordon growth formula to work.</p>
            )}
            <p className="text-[11px] text-muted">Live figures can differ from the sheet by under ₹1 because of WACC rounding.</p>
          </div>
        </Panel>

        {/* Sensitivity heatmap */}
        <Panel title="Sensitivity grid" sub="Value per share (₹) from the sheet · base case outlined">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] border-separate border-spacing-1 text-center text-sm">
              <thead>
                <tr>
                  <th className="p-1 text-left text-[11px] font-normal text-muted">g ↓ / WACC →</th>
                  {P.sensitivity.wacc.map((w) => <th key={w} className="num p-1 font-mono text-xs font-semibold text-muted">{w}%</th>)}
                </tr>
              </thead>
              <tbody>
                {P.sensitivity.grid.map((row, ri) => (
                  <tr key={ri}>
                    <th className="num p-1 text-left font-mono text-xs font-semibold text-muted">{P.sensitivity.g[ri]}%</th>
                    {row.map((v, ci) => {
                      const base = ri === 2 && ci === 2;
                      const near = Math.abs(P.sensitivity.wacc[ci] - wacc) < 0.5 && Math.abs(P.sensitivity.g[ri] - g) < 0.5;
                      const t = Math.min(1, Math.log(v / 350) / Math.log(4500 / 350));
                      return (
                        <td key={ci} className={`num rounded-md px-1 py-2 font-mono text-xs transition-transform ${base ? "outline outline-2 outline-accent" : ""} ${near ? "scale-105 font-semibold" : ""}`}
                          style={{ background: `color-mix(in srgb, var(--accent) ${Math.round(6 + t * 42)}%, var(--surface))`, color: "var(--fg)", fontWeight: v >= B.cmp ? 700 : undefined } as CSSProperties}
                          title={`WACC ${P.sensitivity.wacc[ci]}%, g ${P.sensitivity.g[ri]}%: ₹${inr(v, 2)}`}>
                          {inr(v, 0)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">Only two cells reach today's price, both at an 8% WACC with 6.5–7.5% terminal growth, which shows how much growth the market is pricing in.</p>
        </Panel>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2">
        {/* Equity bridge */}
        <Panel title="From enterprise value to value per share" sub="₹ Cr · equity bridge from the model">
          <ul className="grid gap-2 text-sm">
            {[
              ["PV of FCFF, FY27–FY34", P.pvFcff, "+"],
              ["PV of terminal value", P.terminal.pvTv, "+"],
              ["Enterprise value", B.ev, "="],
              ["Cash", B.cash, "+"],
              ["Other non-operating assets", B.otherAssets, "+"],
              ["Debt", B.debt, "−"],
              ["Minority interest", B.minority, "−"],
              ["Equity value", B.equity, "="],
            ].map(([k, v, s]) => {
              const total = s === "=";
              return (
                <li key={k as string} className={`flex items-center gap-3 ${total ? "border-t border-line pt-2 font-semibold text-fg" : "text-muted"}`}>
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded font-mono text-xs ${s === "−" ? "bg-neg/15 text-neg" : s === "+" ? "bg-pos/15 text-pos" : "bg-accent/15 text-accent"}`}>{s}</span>
                  <span className="min-w-0 flex-1">{k}</span>
                  <span className="num font-mono">₹{inr(v as number, 2)}</span>
                </li>
              );
            })}
            <li className="mt-1 flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2 text-fg">
              <span>÷ {B.shares} Cr shares</span><span className="num font-display text-xl text-accent">₹{inr(B.perShare, 2)}</span>
            </li>
          </ul>
          <div className="mt-4">
            <div className="flex h-3 overflow-hidden rounded-full">
              <span className="bg-[var(--c1)]" style={{ width: `${100 - tvShare}%` }} />
              <span className="bg-[var(--c3)]" style={{ width: `${tvShare}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-muted">Terminal value is {inr(tvShare, 0)}% of enterprise value (calculated: ₹{inr(P.terminal.pvTv)} ÷ ₹{inr(B.ev)} Cr).</p>
          </div>
        </Panel>

        {/* WACC build */}
        <Panel title="Building the discount rate" sub="CAPM cost of equity, post-tax cost of debt, market-value weights">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
              <Chip v={`${P.wacc.rf}%`} l="risk-free" /><span className="text-muted">+</span>
              <Chip v={`${P.wacc.beta}`} l="beta" /><span className="text-muted">×</span>
              <Chip v={`${P.wacc.erp}%`} l="ERP" /><span className="text-muted">=</span>
              <Chip v={`${P.wacc.ke}%`} l="cost of equity" strong />
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
              <Chip v={`${P.wacc.kdPre}%`} l="pre-tax debt" /><span className="text-muted">× (1 −</span>
              <Chip v={`${P.wacc.tax}%`} l="tax" /><span className="text-muted">) =</span>
              <Chip v={`${P.wacc.kdPost}%`} l="cost of debt" strong />
            </div>
            <div>
              <div className="flex h-3 overflow-hidden rounded-full bg-surface-2">
                <span className="bg-accent" style={{ width: `${P.wacc.eqWeight}%` }} /><span className="bg-[var(--c3)]" style={{ width: `${P.wacc.debtWeight}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-muted">Equity ₹{inr(P.wacc.equity)} Cr ({P.wacc.eqWeight}%) · Debt ₹{inr(P.wacc.debt)} Cr ({P.wacc.debtWeight}%)</p>
            </div>
            <p className="rounded-xl bg-accent/10 px-4 py-3 text-fg">WACC <span className="num font-display text-2xl text-accent">{P.wacc.wacc}%</span></p>
            <p className="text-xs text-muted">A low beta of {P.wacc.beta} and almost no debt keep the discount rate close to the cost of equity.</p>
          </div>
        </Panel>
      </div>

      {/* Concall */}
      <Panel title="What management said · Q4 FY26 earnings call" sub="Read alongside the model to test its growth and margin assumptions">
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {P.concall.map((c, i) => (
            <li key={c.l} className="reveal rounded-xl border border-line bg-bg p-4" style={{ "--d": `${i * 60}ms` } as CSSProperties}>
              <p className="num font-display text-2xl text-accent">{c.k}</p>
              <p className="mt-1 text-xs leading-snug text-muted">{c.l}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel title="Why 5.5% terminal growth" sub="The reasoning in the model">
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {P.tgReasons.map((r) => (
              <li key={r.t} className="rounded-xl border border-line bg-bg p-3">
                <p className="text-sm font-semibold text-fg">{r.t}</p>
                <p className="mt-0.5 text-xs text-muted">{r.d}</p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Sources" sub="As listed in the model">
          <ul className="grid gap-1.5 text-sm text-muted">
            {P.sources.map((s) => <li key={s} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{s}</li>)}
          </ul>
        </Panel>
      </div>

      <Observation>
        The model values Pidilite at ₹{inr(B.perShare, 2)} a share against a market price of ₹{inr(B.cmp, 2)}, so the market price sits {B.overBy}% above the DCF value.
        Read the other way, today's price implies far more growth, or a longer runway, than the forecast assumes; every cell in the grid with a WACC of 9% or more stays below the price.
        This is a classroom valuation, not investment advice.
      </Observation>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="grid gap-1.5">
      <span className="flex justify-between text-sm"><span className="text-fg">{label}</span><span className="num font-mono font-semibold text-accent">{value.toFixed(2)}%</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="w-full accent-[var(--accent)]" />
    </label>
  );
}

function PriceBar({ value, price }: { value: number; price: number }) {
  const max = Math.max(value, price) * 1.1;
  return (
    <div className="grid gap-1.5 text-xs">
      {[["DCF value", value, "bg-accent"], ["Market price", price, "bg-neg"]].map(([l, v, c]) => (
        <div key={l as string} className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-2">
          <span className="text-muted">{l}</span>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-2"><div className={`h-full rounded-full ${c} transition-[width] duration-500`} style={{ width: `${((v as number) / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function Chip({ v, l, strong }: { v: string; l: string; strong?: boolean }) {
  return (
    <span className={`inline-flex flex-col rounded-lg border px-2.5 py-1 leading-tight ${strong ? "border-accent bg-accent/10" : "border-line bg-bg"}`}>
      <span className={strong ? "font-semibold text-accent" : "text-fg"}>{v}</span>
      <span className="font-sans text-[10px] text-muted">{l}</span>
    </span>
  );
}
