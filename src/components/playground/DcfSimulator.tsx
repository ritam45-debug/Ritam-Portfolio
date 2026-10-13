import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RotateCcw } from "lucide-react";
import { dcfDefaults } from "../../content/playground";
import { runDcf, type DcfInput } from "../../lib/finance";
import { inr } from "../../lib/format";

const SLIDERS: { key: keyof DcfInput; label: string; min: number; max: number; step: number; unit: string }[] = [
  { key: "growth", label: "Revenue growth", min: -5, max: 30, step: 0.5, unit: "%" },
  { key: "ebitdaMargin", label: "EBITDA margin", min: 5, max: 40, step: 0.5, unit: "%" },
  { key: "reinvestmentRate", label: "Reinvestment rate", min: 0, max: 80, step: 1, unit: "%" },
  { key: "wacc", label: "WACC", min: 6, max: 18, step: 0.25, unit: "%" },
  { key: "terminalGrowth", label: "Terminal growth", min: 0, max: 8, step: 0.25, unit: "%" },
];

export function DcfSimulator() {
  const [input, setInput] = useState<DcfInput>({ ...dcfDefaults });
  const r = useMemo(() => runDcf(input), [input]);
  const base = useMemo(() => runDcf({ ...dcfDefaults }), []);

  const chart = r.valid
    ? [...r.years.map((y) => ({ name: y.year, pv: Math.round(y.pv) })), { name: "TV", pv: Math.round(r.pvTerminal) }]
    : [];

  const waccSteps = [-1, -0.5, 0, 0.5, 1].map((d) => +(input.wacc + d).toFixed(2));
  const gSteps = [-1, -0.5, 0, 0.5, 1].map((d) => +(input.terminalGrowth + d).toFixed(2));

  const delta = r.valid && base.valid ? ((r.perShare - base.perShare) / Math.abs(base.perShare)) * 100 : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <div className="grid content-start gap-5">
        {SLIDERS.map((s) => (
          <div key={s.key}>
            <div className="flex items-baseline justify-between">
              <label htmlFor={`dcf-${s.key}`} className="text-sm text-fg">{s.label}</label>
              <output htmlFor={`dcf-${s.key}`} className="num font-mono text-sm text-accent">{input[s.key]}{s.unit}</output>
            </div>
            <input
              id={`dcf-${s.key}`}
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={input[s.key]}
              onChange={(e) => setInput((p) => ({ ...p, [s.key]: Number(e.target.value) }))}
              className="mt-2"
            />
          </div>
        ))}
        <button type="button" onClick={() => setInput({ ...dcfDefaults })} className="inline-flex items-center gap-2 self-start rounded-md border border-line px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-fg">
          <RotateCcw size={14} /> Reset to base case
        </button>
        <p className="text-xs leading-relaxed text-muted">
          Base revenue {inr(dcfDefaults.baseRevenue)} cr · tax {dcfDefaults.taxRate}% · net debt {inr(dcfDefaults.netDebt)} cr · {dcfDefaults.shares} cr shares. Simplified FCFF model: EBITDA stands in for EBIT, with D&A netted inside the reinvestment rate.
        </p>
      </div>

      <div className="min-w-0">
        {!r.valid ? (
          <p className="rounded-lg border border-neg/50 bg-neg/10 p-4 text-fg" role="alert">{r.message}</p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-4">
              {[
                { k: "Value per share", v: `₹${r.perShare.toFixed(1)}`, hint: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% vs base` },
                { k: "Enterprise value", v: `${inr(r.enterpriseValue)} cr` },
                { k: "Equity value", v: `${inr(r.equityValue)} cr` },
                { k: "From terminal value", v: `${r.terminalShare.toFixed(0)}%` },
              ].map((t) => (
                <div key={t.k} className="bg-bg p-4">
                  <dt className="text-xs text-muted">{t.k}</dt>
                  <dd className="num mt-1 font-display text-2xl text-fg">{t.v}</dd>
                  {t.hint && <dd className={`num mt-0.5 font-mono text-xs ${delta >= 0 ? "text-accent" : "text-neg"}`}>{t.hint}</dd>}
                </div>
              ))}
            </dl>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
              <figure className="min-w-0">
                <figcaption className="ticker text-muted">Present value of cash flows (₹ cr)</figcaption>
                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                      <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
                      <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={52} />
                      <Tooltip cursor={{ fill: "var(--surface-2)" }} contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--fg)" }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")} cr`, "PV"]} />
                      <Bar dataKey="pv" radius={[3, 3, 0, 0]}>
                        {chart.map((d) => <Cell key={d.name} fill={d.name === "TV" ? "var(--blue)" : "var(--accent)"} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </figure>

              <div className="min-w-0">
                <p className="ticker text-muted">Sensitivity · ₹ per share</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="num w-full border-collapse font-mono text-xs">
                    <thead>
                      <tr>
                        <th className="p-1.5 text-left font-normal text-muted">WACC ↓ g →</th>
                        {gSteps.map((g) => <th key={g} className="p-1.5 text-right font-normal text-muted">{g}%</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {waccSteps.map((w) => (
                        <tr key={w} className="border-t border-line">
                          <th className="p-1.5 text-left font-normal text-muted">{w}%</th>
                          {gSteps.map((g) => {
                            const s = runDcf({ ...input, wacc: w, terminalGrowth: g });
                            const current = w === input.wacc && g === input.terminalGrowth;
                            return (
                              <td key={g} className={`p-1.5 text-right ${current ? "bg-accent font-semibold text-accent-ink" : "text-fg"}`}>
                                {s.valid ? s.perShare.toFixed(0) : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <p className="mt-6 border-l-2 border-accent pl-4 text-fg" aria-live="polite">
              <span className="ticker mr-2 text-accent">Insight</span>
              {r.terminalShare > 75
                ? `${r.terminalShare.toFixed(0)}% of the value sits in the terminal value, so the answer depends heavily on the long-run assumptions. Check how far the sensitivity table swings before trusting the point estimate.`
                : `${r.terminalShare.toFixed(0)}% of the value comes from the terminal value. The explicit forecast carries real weight here, so the growth and margin assumptions deserve the most scrutiny.`}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
