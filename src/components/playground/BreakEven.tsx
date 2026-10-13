import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { breakEvenDefaults } from "../../content/playground";
import { breakEven } from "../../lib/finance";
import { inr } from "../../lib/format";

type Key = keyof typeof breakEvenDefaults;
const FIELDS: { key: Key; label: string; min: number; max: number; step: number; prefix?: string; suffix?: string }[] = [
  { key: "price", label: "Selling price per unit", min: 50, max: 600, step: 5, prefix: "₹" },
  { key: "variableCost", label: "Variable cost per unit", min: 10, max: 500, step: 5, prefix: "₹" },
  { key: "fixedCost", label: "Fixed costs", min: 100000, max: 2000000, step: 25000, prefix: "₹" },
  { key: "expectedUnits", label: "Expected units sold", min: 500, max: 20000, step: 250, suffix: " units" },
];

export function BreakEven() {
  const [v, setV] = useState({ ...breakEvenDefaults });
  const be = breakEven(v.price, v.variableCost, v.fixedCost);
  const feasible = Number.isFinite(be.units);
  const profit = (v.price - v.variableCost) * v.expectedUnits - v.fixedCost;
  const safety = feasible ? ((v.expectedUnits - be.units) / v.expectedUnits) * 100 : -100;

  const data = useMemo(() => {
    const maxU = Math.max(v.expectedUnits, feasible ? be.units : 0) * 1.35;
    return Array.from({ length: 11 }, (_, i) => {
      const u = Math.round((maxU * i) / 10);
      return { units: u, revenue: u * v.price, cost: v.fixedCost + u * v.variableCost };
    });
  }, [v, be.units, feasible]);

  const lakh = (n: number) => `${(n / 100000).toFixed(1)}L`;

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <div className="grid content-start gap-5">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor={`be-${f.key}`} className="text-sm text-fg">{f.label}</label>
              <output htmlFor={`be-${f.key}`} className="num font-mono text-sm text-accent">
                {f.prefix}{v[f.key].toLocaleString("en-IN")}{f.suffix}
              </output>
            </div>
            <input id={`be-${f.key}`} type="range" min={f.min} max={f.max} step={f.step} value={v[f.key]} onChange={(e) => setV((p) => ({ ...p, [f.key]: Number(e.target.value) }))} className="mt-2" />
          </div>
        ))}
      </div>

      <div className="min-w-0">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-4">
          {[
            { k: "Break-even units", v: feasible ? Math.ceil(be.units).toLocaleString("en-IN") : "Never" },
            { k: "Contribution / unit", v: inr(be.contribution) },
            { k: "Profit at expected volume", v: inr(profit), tone: profit >= 0 ? "text-accent" : "text-neg" },
            { k: "Margin of safety", v: feasible ? `${safety.toFixed(0)}%` : "—", tone: safety >= 0 ? "text-accent" : "text-neg" },
          ].map((t) => (
            <div key={t.k} className="bg-bg p-4">
              <dt className="text-xs text-muted">{t.k}</dt>
              <dd className={`num mt-1 font-display text-2xl ${t.tone ?? "text-fg"}`}>{t.v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="units" type="number" domain={[0, "dataMax"]} tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} tickFormatter={(u: number) => u.toLocaleString("en-IN")} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={lakh} width={52} />
              <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--fg)" }} labelFormatter={(u: number) => `${u.toLocaleString("en-IN")} units`} formatter={(n: number, name: string) => [inr(n), name]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="revenue" name="Revenue" stroke="var(--accent)" strokeWidth={2.2} dot={false} />
              <Line dataKey="cost" name="Total cost" stroke="var(--amber)" strokeWidth={2.2} dot={false} />
              <ReferenceLine x={v.expectedUnits} stroke="var(--muted)" strokeDasharray="4 4" label={{ value: "Expected", fill: "var(--muted)", fontSize: 11, position: "insideTopRight" }} />
              {feasible && <ReferenceDot x={be.units} y={be.units * v.price} r={5} fill="var(--fg)" stroke="var(--bg)" />}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 border-l-2 border-accent pl-4 text-fg" aria-live="polite">
          <span className="ticker mr-2 text-accent">Insight</span>
          {!feasible
            ? "The variable cost is at or above the price, so every extra unit loses money. No volume breaks even until price rises or unit cost falls."
            : safety >= 0
              ? `Sales could fall ${safety.toFixed(0)}% below the expected volume before the business makes a loss. Each unit contributes ${inr(be.contribution)} (${be.marginPct.toFixed(0)}% of price) towards fixed costs.`
              : `Expected volume is ${Math.abs(safety).toFixed(0)}% short of break-even. Raising price by ${inr(Math.max(0, v.fixedCost / v.expectedUnits - be.contribution))} per unit would close the gap at this volume.`}
        </p>
      </div>
    </div>
  );
}
