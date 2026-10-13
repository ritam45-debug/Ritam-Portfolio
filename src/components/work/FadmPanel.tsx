import { useMemo, useState } from "react";
import { Expand, Layers, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COMPANIES, fadm as F, type Co } from "../../content/work";
import { Lightbox, Observation, Panel, Segmented, StatTile, axis, spotMove, tip } from "./shared";

const slideModules = import.meta.glob("../../assets/fadm/slide-*.jpg", { eager: true, import: "default" }) as Record<string, string>;
const SLIDES = Object.keys(slideModules).sort().map((k, i) => ({ src: slideModules[k], caption: `${F.slides[i] ?? `Slide ${i + 1}`}` }));

type Eff = "assets" | "employees";
const dealTotal = F.deals.reduce((s, d) => s + d.value, 0);

export function FadmPanel() {
  const [eff, setEff] = useState<Eff>("assets");
  const [shown, setShown] = useState<Co[]>(["polycab", "kei", "rr"]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const effRows = useMemo(() => {
    const src = eff === "assets" ? F.salesPerAsset : F.salesPerEmployee;
    return F.efficiencyYears.map((y, i) => ({ year: y, polycab: src.polycab[i], kei: src.kei[i], rr: src.rr[i] }));
  }, [eff]);

  // Derived FY24 scorecard from the deck's source-data slide.
  const score = useMemo(() => {
    const i = 2;
    const calc = (c: Co) => {
      const d = F.source[c];
      return {
        netMargin: (d.profit[i] / d.sales[i]) * 100,
        roe: (d.profit[i] / d.equity[i]) * 100,
        currentRatio: d.ca[i] / d.cl[i],
        assetTurn: d.sales[i] / d.assets[i],
        salesGrowth: (d.sales[i] / d.sales[0] - 1) * 100,
      };
    };
    return { polycab: calc("polycab"), kei: calc("kei"), rr: calc("rr") };
  }, []);
  const METRICS: { key: keyof typeof score.polycab; label: string; fmt: (v: number) => string }[] = [
    { key: "salesGrowth", label: "Sales growth, FY22→FY24", fmt: (v) => `${v.toFixed(1)}%` },
    { key: "netMargin", label: "Net profit margin", fmt: (v) => `${v.toFixed(2)}%` },
    { key: "roe", label: "Return on equity", fmt: (v) => `${v.toFixed(1)}%` },
    { key: "assetTurn", label: "Asset turnover", fmt: (v) => `${v.toFixed(2)}x` },
    { key: "currentRatio", label: "Current ratio", fmt: (v) => `${v.toFixed(2)}x` },
  ];

  const salesRows = F.source.years.map((y, i) => ({ year: y, polycab: F.source.polycab.sales[i], kei: F.source.kei.sales[i], rr: F.source.rr.sales[i] }));
  const toggle = (c: Co) => setShown((s) => (s.includes(c) ? (s.length > 1 ? s.filter((x) => x !== c) : s) : [...s, c]));
  const visibleSlides = showAll ? SLIDES : SLIDES.slice(0, 8);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <dl className="reveal grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
        <StatTile label="Companies compared" value={3} note="Polycab · KEI · R R Kabel" />
        <StatTile label="Slides of analysis" value={26} note="18 analysis modules" />
        <StatTile label="Fastest 5-yr sales CAGR" value={29.4} decimals={1} suffix="%" note="R R Kabel, FY21→FY25" tone="pos" />
        <StatTile label="M&A and asset deals tracked" prefix="₹" value={dealTotal} decimals={2} suffix=" Cr" note={`${F.deals.length} transactions, 2021–2026`} />
      </dl>

      <div className="reveal flex flex-wrap items-center gap-2" role="group" aria-label="Companies shown in charts">
        <span className="mr-1 text-xs text-muted">Show:</span>
        {COMPANIES.map((c) => {
          const on = shown.includes(c.id);
          return (
            <button key={c.id} type="button" aria-pressed={on} onClick={() => toggle(c.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all ${on ? "border-line bg-surface text-fg" : "border-dashed border-line text-muted opacity-60"}`}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color, boxShadow: on ? `0 0 10px ${c.color}` : "none" }} />
              {c.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Five-year growth (CAGR)" sub="FY21 → FY25 · R R Kabel's share price is since its Sept 2023 listing, so not like-for-like">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={F.cagr} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barGap={3} barCategoryGap="22%">
                <CartesianGrid stroke="var(--line)" strokeDasharray="2 5" vertical={false} />
                <XAxis dataKey="metric" {...axis} />
                <YAxis {...axis} unit="%" />
                <Tooltip {...tip} formatter={(v: number, n: string) => [`${v}%`, n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v: string) => <span style={{ color: "var(--muted)" }}>{v}</span>} />
                {COMPANIES.filter((c) => shown.includes(c.id)).map((c) => (
                  <Bar key={c.id} dataKey={c.id} name={c.name} fill={c.color} radius={[5, 5, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Efficiency over time" sub={eff === "assets" ? "Sales per rupee of total assets (x)" : "Sales per employee (₹ lakh) · R R Kabel FY21 not available"}
          action={<Segmented label="Efficiency measure" value={eff} onChange={setEff} options={[{ id: "assets", label: "Per ₹ of assets" }, { id: "employees", label: "Per employee" }]} />}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={effRows} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="2 5" vertical={false} />
                <XAxis dataKey="year" {...axis} />
                <YAxis {...axis} tickFormatter={(v: number) => (eff === "assets" ? `${v}x` : `${v}`)} />
                <Tooltip {...tip} formatter={(v: number, n: string) => [eff === "assets" ? `${v.toFixed(2)}x` : `₹${v} lakh`, n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v: string) => <span style={{ color: "var(--muted)" }}>{v}</span>} />
                {COMPANIES.filter((c) => shown.includes(c.id)).map((c) => (
                  <Line key={c.id} dataKey={c.id} name={c.name} stroke={c.color} strokeWidth={2.4} connectNulls={false} dot={{ r: 3.5, fill: "var(--surface)", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Panel title="Revenue, FY22 to FY24" sub="Revenue from operations, ₹ Cr (from the deck's source-data slide)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesRows} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barGap={3}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="2 5" vertical={false} />
                <XAxis dataKey="year" {...axis} />
                <YAxis {...axis} width={56} tickFormatter={(v: number) => v.toLocaleString("en-IN")} />
                <Tooltip {...tip} formatter={(v: number, n: string) => [`₹${v.toLocaleString("en-IN")} Cr`, n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v: string) => <span style={{ color: "var(--muted)" }}>{v}</span>} />
                {COMPANIES.filter((c) => shown.includes(c.id)).map((c) => (
                  <Bar key={c.id} dataKey={c.id} name={c.name} fill={c.color} radius={[5, 5, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="FY24 scorecard" sub="Calculated on this site from the deck's FY22–FY24 source data · best in each row highlighted">
          <div className="overflow-x-auto">
            <table className="num w-full min-w-[26rem] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="py-2 font-medium">Metric</th>
                  {COMPANIES.map((c) => <th key={c.id} className="py-2 text-right font-medium"><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: c.color }} />{c.name.replace(" India", "").replace(" Industries", "")}</th>)}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((m) => {
                  const vals = COMPANIES.map((c) => score[c.id][m.key]);
                  const best = Math.max(...vals);
                  return (
                    <tr key={m.key} className="border-t border-line">
                      <td className="py-2.5 pr-3 text-fg">{m.label}</td>
                      {vals.map((v, i) => (
                        <td key={i} className="py-2.5 text-right font-mono">
                          <span className={v === best ? "rounded-md bg-accent/15 px-1.5 py-0.5 font-semibold text-accent" : "text-fg"}>{m.fmt(v)}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">ROE uses year-end equity attributable to owners; current ratio is current assets ÷ current liabilities.</p>
        </Panel>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Panel title="M&A and asset ledger" sub={`${F.deals.length} transactions, 2021–2026 · ₹${dealTotal.toFixed(2)} Cr in total`}>
          <ol className="relative grid gap-3 border-l border-line pl-5">
            {F.deals.map((d) => {
              const color = d.company === "Polycab" ? "var(--c1)" : d.company === "KEI" ? "var(--c2)" : "var(--c3)";
              return (
                <li key={d.target} className="relative">
                  <span className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border-2 border-surface" style={{ background: color }} aria-hidden />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-sm text-fg"><span className="num mr-2 font-mono text-xs text-muted">{d.year}</span><span className="font-semibold">{d.company}</span> · {d.target}</p>
                    <p className="num font-mono text-sm text-fg">{d.value ? `₹${d.value.toFixed(2)} Cr` : "Undisclosed"}</p>
                  </div>
                  <p className="text-xs text-muted">{d.type} · {d.status}</p>
                </li>
              );
            })}
          </ol>
        </Panel>
        <Panel title="Key takeaways" sub="Drawn from the project's comparative analysis">
          <ul className="grid gap-3">{F.takeaways.map((t) => <Observation key={t}>{t}</Observation>)}</ul>
          <div className="mt-6 border-t border-line pt-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-fg"><Users size={15} className="text-accent" /> Team · {F.ownership}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {F.team.map((m) => <li key={m} className={`rounded-full border px-2.5 py-0.5 text-xs ${m === "Ritam Dhara" ? "border-accent text-accent" : "border-line text-muted"}`}>{m}</li>)}
            </ul>
            <p className="mt-2 text-xs text-muted">{F.course}, Great Lakes Institute of Management</p>
          </div>
        </Panel>
      </div>

      <Panel title="Inside the deck" sub="All 26 slides · click any slide to open it full screen, then use the arrow keys"
        action={<span className="inline-flex items-center gap-1.5 text-xs text-muted"><Layers size={14} /> {SLIDES.length} slides</span>}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleSlides.map((s, i) => (
            <li key={s.src}>
              <button type="button" onMouseMove={spotMove} onClick={() => setLightbox(i)} className="spot group block w-full overflow-hidden rounded-xl border border-line bg-bg text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_18px_40px_-20px_var(--accent)]">
                <div className="relative aspect-video overflow-hidden">
                  <img src={s.src} alt="" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 grid place-items-center bg-bg/50 opacity-0 transition-opacity group-hover:opacity-100"><Expand size={18} className="text-fg" /></span>
                </div>
                <p className="flex items-baseline gap-2 px-3 py-2 text-xs text-fg">
                  <span className="num font-mono text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate">{s.caption}</span>
                </p>
              </button>
            </li>
          ))}
        </ul>
        {SLIDES.length > 8 && (
          <button type="button" onClick={() => setShowAll((v) => !v)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-fg hover:border-accent">
            {showAll ? "Show fewer slides" : `Show all ${SLIDES.length} slides`}
          </button>
        )}
      </Panel>

      <Lightbox images={SLIDES} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
