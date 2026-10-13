import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { companies, ratioDefs, years, type RatioKey } from "../../content/playground";
import { Chip } from "../ui";

const COLORS = ["var(--accent)", "var(--blue)", "var(--amber)"];

export function RatioExplorer() {
  const [ratio, setRatio] = useState<RatioKey>("roe");
  const [shown, setShown] = useState<string[]>(companies.map((c) => c.id));
  const def = ratioDefs[ratio];

  const data = useMemo(
    () => years.map((y, i) => Object.fromEntries([["year", y], ...companies.map((c) => [c.id, c.data[ratio][i]])])),
    [ratio],
  );

  const insight = useMemo(() => {
    const active = companies.filter((c) => shown.includes(c.id));
    if (!active.length) return "Select at least one company to compare.";
    const last = years.length - 1;
    const ranked = [...active].sort((a, b) => (def.higherIsBetter ? b.data[ratio][last] - a.data[ratio][last] : a.data[ratio][last] - b.data[ratio][last]));
    const best = ranked[0];
    const moves = active.map((c) => ({ c, d: c.data[ratio][last] - c.data[ratio][0] }));
    const mover = moves.sort((a, b) => Math.abs(b.d) - Math.abs(a.d))[0];
    const fmt = (v: number) => (def.unit === "%" ? `${v.toFixed(1)}%` : `${v.toFixed(2)}x`);
    const change = def.unit === "%" ? `${mover.d > 0 ? "+" : ""}${mover.d.toFixed(1)} pts` : `${mover.d > 0 ? "+" : ""}${mover.d.toFixed(2)}x`;
    return `${best.name} leads on ${def.label.toLowerCase()} in ${years[last]} at ${fmt(best.data[ratio][last])}${def.higherIsBetter ? "" : " (lower is safer)"}. The biggest shift over five years is ${mover.c.name} (${change}), consistent with its "${mover.c.profile.toLowerCase()}" profile.`;
  }, [ratio, shown, def]);

  const toggle = (id: string) => setShown((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
      <div className="grid content-start gap-6">
        <fieldset>
          <legend className="ticker text-muted">Ratio</legend>
          <div className="mt-3 grid gap-1.5">
            {(Object.keys(ratioDefs) as RatioKey[]).map((k) => (
              <label key={k} className={`flex cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm ${ratio === k ? "border-accent text-fg" : "border-line text-muted hover:text-fg"}`}>
                <span className="flex items-center gap-2">
                  <input type="radio" name="ratio" id={`ratio-${k}`} value={k} checked={ratio === k} onChange={() => setRatio(k)} className="accent-[var(--accent)]" />
                  {ratioDefs[k].label}
                </span>
                <span className="font-mono text-xs">{ratioDefs[k].unit}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <p className="ticker text-muted">Companies</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {companies.map((c) => (
              <Chip key={c.id} active={shown.includes(c.id)} onClick={() => toggle(c.id)}>{c.name}</Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="font-display text-2xl text-fg">{def.label}</h4>
          <p className="font-mono text-xs text-muted">{def.formula}</p>
        </div>
        <p className="mt-1 text-sm text-muted">{def.meaning}</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} unit={def.unit} width={48} />
              <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--fg)" }} labelStyle={{ color: "var(--muted)" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted)" }} />
              {companies.map((c, i) =>
                shown.includes(c.id) ? (
                  <Line key={c.id} type="monotone" dataKey={c.id} name={c.name} stroke={COLORS[i % COLORS.length]} strokeWidth={2.2} dot={{ r: 3, fill: "var(--bg)", strokeWidth: 2 }} activeDot={{ r: 5 }} />
                ) : null,
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 border-l-2 border-accent pl-4 text-fg" aria-live="polite">
          <span className="ticker mr-2 text-accent">Insight</span>{insight}
        </p>
      </div>
    </div>
  );
}
