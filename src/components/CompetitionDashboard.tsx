import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Award, Building2, Flag, RotateCcw, Search, Trophy, User, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  BAND_LABELS, BAND_OF, HOST_LABELS, MONTHS, RESULT_DEPTH, RESULT_LABELS, TYPE_LABELS, competitions,
  type Band, type Competition, type EventType, type Host, type Month,
} from "../content/competitions";
import { SectionHeader } from "./ui";
import { spotMove } from "./work/shared";

const BANDS: Band[] = ["r1", "r2", "deep", "top"];
const BAND_COLOR: Record<Band, string> = { r1: "var(--b1)", r2: "var(--b2)", deep: "var(--b3)", top: "var(--b4)" };
const HOSTS = Object.keys(HOST_LABELS) as Host[];
const TYPES = Object.keys(TYPE_LABELS) as EventType[];

const tooltipStyle = {
  contentStyle: { background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--fg)", fontSize: 13 },
  labelStyle: { color: "var(--fg)", fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: "var(--fg)", padding: 0 },
  cursor: { fill: "var(--surface-2)", opacity: 0.6 },
};

type SortKey = "id" | "name" | "result" | "month";

export function CompetitionDashboard() {
  const [month, setMonth] = useState<Month | "all">("all");
  const [host, setHost] = useState<Host | "all">("all");
  const [band, setBand] = useState<Band | "all">("all");
  const [type, setType] = useState<EventType | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "result", dir: -1 });

  const filtersActive = month !== "all" || host !== "all" || band !== "all" || type !== "all" || query.trim() !== "";
  const reset = () => { setMonth("all"); setHost("all"); setBand("all"); setType("all"); setQuery(""); };

  // Charts respond to the dropdown filters; the text search narrows the table only.
  const scoped = useMemo(
    () => competitions.filter((c) =>
      (month === "all" || c.month === month) &&
      (host === "all" || c.host === host) &&
      (band === "all" || BAND_OF[c.result] === band) &&
      (type === "all" || c.type === type)),
    [month, host, band, type],
  );

  const stats = useMemo(() => {
    const n = scoped.length;
    const advanced = scoped.filter((c) => RESULT_DEPTH[c.result] >= 2).length;
    const top = scoped.filter((c) => BAND_OF[c.result] === "top").length;
    const organisers = new Set(scoped.map((c) => c.organiser.toLowerCase())).size;
    const solo = scoped.filter((c) => c.team.length === 0).length;
    const funnel = [
      { label: "Entered", count: n, band: "r1" as Band },
      { label: "Cleared Round 1", count: advanced, band: "r2" as Band },
      { label: "Reached Round 3 or semis", count: scoped.filter((c) => RESULT_DEPTH[c.result] >= 3).length, band: "deep" as Band },
      { label: "Finals or top placing", count: top, band: "top" as Band },
    ];
    const byMonth = [...MONTHS, null].map((m) => {
      const rows = scoped.filter((c) => c.month === m);
      return { name: m ?? "Undated", total: rows.length, ...Object.fromEntries(BANDS.map((b) => [b, rows.filter((c) => BAND_OF[c.result] === b).length])) };
    }).filter((r) => r.total > 0);
    const byHost = HOSTS.map((h) => {
      const rows = scoped.filter((c) => c.host === h);
      return { name: HOST_LABELS[h], total: rows.length, ...Object.fromEntries(BANDS.map((b) => [b, rows.filter((c) => BAND_OF[c.result] === b).length])) };
    }).filter((r) => r.total > 0).sort((a, b) => b.total - a.total);
    const best = [...scoped].filter((c) => RESULT_DEPTH[c.result] >= 3).sort((a, b) => RESULT_DEPTH[b.result] - RESULT_DEPTH[a.result] || a.id - b.id);
    const corporates = [...new Set(scoped.filter((c) => c.host === "corporate").map((c) => c.organiser))];
    const institutes = [...new Set(scoped.filter((c) => c.host === "premier").map((c) => c.organiser.replace(/ \(.*\)$/, "")))];
    return { n, advanced, top, organisers, solo, funnel, byMonth, byHost, best, corporates, institutes };
  }, [scoped]);

  const tableRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q ? scoped.filter((c) => [c.name, c.organiser, c.team.join(" "), RESULT_LABELS[c.result]].join(" ").toLowerCase().includes(q)) : scoped;
    const val = (c: Competition): string | number =>
      sort.key === "name" ? c.name.toLowerCase() : sort.key === "result" ? RESULT_DEPTH[c.result] * 1000 - c.id : sort.key === "month" ? (c.month ? MONTHS.indexOf(c.month) : 99) * 1000 + c.id : c.id;
    return [...rows].sort((a, b) => (val(a) < val(b) ? -1 : val(a) > val(b) ? 1 : 0) * sort.dir);
  }, [scoped, query, sort]);

  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: key === "result" ? -1 : 1 }));
  const pctAdvanced = stats.n ? Math.round((stats.advanced / stats.n) * 100) : 0;

  return (
    <section id="competitions" aria-labelledby="comp-h" className="border-y border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <SectionHeader
          id="comp-h"
          code="§ 03 · Competition record"
          title={`${competitions.length} competitions, May to September 2026`}
          lede="Case competitions, quizzes and business challenges hosted by IIMs, IITs, B-schools and companies. Use the filters to slice the record; every chart and the table below update together."
        />

        {/* Filters */}
        <div className="z-30 -mx-4 mb-6 border-y lg:sticky border-line bg-bg/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-lg sm:border lg:bg-bg/90" style={{ top: "calc(env(safe-area-inset-top, 0px) + 4rem)" }}>
          <div className="flex flex-wrap items-end gap-3">
            <FilterSelect id="f-month" label="Month" value={month} onChange={(v) => setMonth(v as Month | "all")} options={MONTHS.map((m) => [m, m])} />
            <FilterSelect id="f-host" label="Organiser" value={host} onChange={(v) => setHost(v as Host | "all")} options={HOSTS.map((h) => [h, HOST_LABELS[h]])} />
            <FilterSelect id="f-band" label="Result" value={band} onChange={(v) => setBand(v as Band | "all")} options={BANDS.map((b) => [b, BAND_LABELS[b]])} />
            <FilterSelect id="f-type" label="Type" value={type} onChange={(v) => setType(v as EventType | "all")} options={TYPES.map((t) => [t, TYPE_LABELS[t]])} />
            <button type="button" onClick={reset} disabled={!filtersActive} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line px-3 text-sm text-muted hover:border-accent hover:text-fg disabled:opacity-40">
              <RotateCcw size={14} /> Reset
            </button>
            <p className="num ml-auto self-center font-mono text-xs text-muted" aria-live="polite">
              Showing {stats.n} of {competitions.length}
            </p>
          </div>
        </div>

        {stats.n === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
            No competitions match these filters.{" "}
            <button type="button" onClick={reset} className="text-accent underline underline-offset-4">Reset filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
            {/* KPI strip */}
            <dl className="reveal grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
              <Kpi icon={<Flag size={16} />} label="Competitions entered" value={String(stats.n)} note={`${stats.solo} solo · ${stats.n - stats.solo} as a team`} />
              <Kpi icon={<ArrowUp size={16} />} label="Cleared Round 1" value={`${stats.advanced}`} note={`${pctAdvanced}% of entries`} meter={pctAdvanced} />
              <Kpi icon={<Trophy size={16} />} label="Finals & top placings" value={String(stats.top)} note={stats.top ? topNote(stats.best) : "None in this view"} highlight />
              <Kpi icon={<Building2 size={16} />} label="Distinct organisers" value={String(stats.organisers)} note={`${stats.corporates.length} companies · ${stats.institutes.length} IIM/IIT/NIT/BITS`} />
            </dl>

            {/* Best finishes + funnel */}
            <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
              <Panel title="Best finishes" sub="Every entry that went beyond Round 2">
                {stats.best.length === 0 ? (
                  <p className="text-sm text-muted">No entries past Round 2 in this view.</p>
                ) : (
                  <ol className="grid grid-cols-[minmax(0,1fr)] gap-2.5">
                    {stats.best.map((c) => (
                      <li key={c.id} className="flex min-w-0 items-center gap-3 rounded-lg sm:gap-4 border border-line bg-bg px-4 py-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${BAND_COLOR[BAND_OF[c.result]]} 18%, transparent)`, color: BAND_COLOR[BAND_OF[c.result]] }} aria-hidden>
                          {BAND_OF[c.result] === "top" ? <Award size={18} /> : <ArrowUp size={18} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-fg" title={c.name}>{c.name}</p>
                          <p className="truncate text-sm text-muted">{c.organiser}{c.month ? ` · ${c.month}` : ""} · {c.team.length ? `Team of ${c.team.length + 1}` : "Solo"}</p>
                        </div>
                        <ResultPill result={c.result} />
                      </li>
                    ))}
                  </ol>
                )}
              </Panel>

              <Panel title="Progression" sub="How far entries went, as a share of all entries">
                <ul className="grid gap-4">
                  {stats.funnel.map((f) => {
                    const pct = stats.n ? (f.count / stats.n) * 100 : 0;
                    return (
                      <li key={f.label} title={`${f.label}: ${f.count} of ${stats.n} (${pct.toFixed(0)}%)`}>
                        <div className="flex items-baseline justify-between gap-2 text-sm">
                          <span className="text-fg">{f.label}</span>
                          <span className="num font-mono text-muted"><span className="text-fg">{f.count}</span> · {pct.toFixed(0)}%</span>
                        </div>
                        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-surface-2">
                          <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.max(pct, f.count ? 1.5 : 0)}%`, background: BAND_COLOR[f.band] }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
                  Round labels follow each organiser's own format, so "Round 2" can mean a shortlist at one event and a semi-final pool at another.
                </p>
              </Panel>
            </div>

            {/* Monthly + host mix */}
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel title="Activity by month" sub="Entries per month, coloured by how far each went">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byMonth} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barCategoryGap="28%">
                      <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} tickFormatter={(m: string) => (m === "Undated" ? "Undated" : m.slice(0, 3))} />
                      <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(v: string) => <span style={{ color: "var(--muted)" }}>{v}</span>} />
                      {BANDS.map((b, i) => (
                        <Bar key={b} dataKey={b} name={BAND_LABELS[b]} stackId="m" fill={BAND_COLOR[b]} stroke="var(--surface)" strokeWidth={2} radius={i === BANDS.length - 1 ? [4, 4, 0, 0] : 0} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="Who organised them" sub="Entries by organiser type, coloured by result">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byHost} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }} barCategoryGap="26%">
                      <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fill: "var(--fg)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(v: string) => <span style={{ color: "var(--muted)" }}>{v}</span>} />
                      {BANDS.map((b, i) => (
                        <Bar key={b} dataKey={b} name={BAND_LABELS[b]} stackId="h" fill={BAND_COLOR[b]} stroke="var(--surface)" strokeWidth={2} radius={i === BANDS.length - 1 ? [0, 4, 4, 0] : 0} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            {/* Organiser wall */}
            {(stats.corporates.length > 0 || stats.institutes.length > 0) && (
              <Panel title="Competed at" sub="Companies and premier institutes that hosted these competitions">
                <div className="grid gap-5 md:grid-cols-2">
                  <NameWall label="Companies" names={stats.corporates} />
                  <NameWall label="IIMs, IITs, NIT & BITS" names={stats.institutes} />
                </div>
              </Panel>
            )}

            {/* Table */}
            <Panel title="Full record" sub="Search by competition, organiser or teammate. Click a column heading to sort.">
              <label className="relative mb-4 block sm:max-w-xs">
                <span className="sr-only">Search competitions</span>
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input id="comp-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="w-full rounded-md border border-line bg-bg py-2 pl-9 pr-3 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none" />
              </label>
              <div className="max-h-[32rem] overflow-auto rounded-lg border border-line">
                <table className="w-full min-w-[40rem] border-collapse text-sm">
                  <thead className="sticky top-0 z-10 bg-surface-2">
                    <tr className="text-left">
                      <Th label="#" k="id" sort={sort} onSort={toggleSort} className="w-12" />
                      <Th label="Competition" k="name" sort={sort} onSort={toggleSort} />
                      <Th label="Result" k="result" sort={sort} onSort={toggleSort} />
                      <Th label="Month" k="month" sort={sort} onSort={toggleSort} />
                      <th scope="col" className="px-3 py-2.5 font-medium text-muted">Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((c) => (
                      <tr key={c.id} className="border-t border-line align-top hover:bg-surface">
                        <td className="num px-3 py-2.5 font-mono text-xs text-muted">{c.id}</td>
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-fg">{c.name}</p>
                          <p className="text-xs text-muted">{c.organiser}</p>
                        </td>
                        <td className="px-3 py-2.5"><ResultPill result={c.result} /></td>
                        <td className="px-3 py-2.5 text-muted">{c.month ?? "—"}</td>
                        <td className="px-3 py-2.5 text-muted">
                          <span className="inline-flex items-center gap-1.5 text-fg">
                            {c.team.length ? <Users size={13} /> : <User size={13} />}
                            {c.team.length ? `Team of ${c.team.length + 1}` : "Solo"}
                          </span>
                          {c.team.length > 0 && <p className="text-xs">with {c.team.join(", ")}</p>}
                        </td>
                      </tr>
                    ))}
                    {tableRows.length === 0 && (
                      <tr><td colSpan={5} className="px-3 py-8 text-center text-muted">No rows match “{query}”.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted">
                Source: personal competition tracker. Organiser type and event type are categories added for this dashboard; results are as recorded.
              </p>
            </Panel>
          </div>
        )}
      </div>
    </section>
  );
}

function topNote(best: Competition[]) {
  const top = best.filter((c) => BAND_OF[c.result] === "top");
  const finals = top.filter((c) => c.result === "FINALS").length;
  const parts = [];
  if (finals) parts.push(`${finals} final${finals > 1 ? "s" : ""}`);
  if (top.some((c) => c.result === "WINNER")) parts.push("1 win");
  if (top.some((c) => c.result === "4TH")) parts.push("1 fourth place");
  return parts.join(" · ");
}

function Kpi({ icon, label, value, note, meter, highlight }: { icon: ReactNode; label: string; value: string; note: string; meter?: number; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1 bg-bg p-4 sm:p-5">
      <dt className="flex items-center gap-2 text-xs text-muted">
        <span className={highlight ? "text-b4" : "text-accent"}>{icon}</span>{label}
      </dt>
      <dd className={`num font-display text-4xl leading-none sm:text-5xl ${highlight ? "text-b4" : "text-fg"}`}>{value}</dd>
      <dd className="text-xs text-muted">{note}</dd>
      {meter !== undefined && (
        <dd className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
          <div className="h-full rounded-full bg-b2" style={{ width: `${meter}%` }} />
        </dd>
      )}
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section onMouseMove={spotMove} className="spot reveal min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <header className="mb-4">
        <h3 className="font-display text-xl text-fg">{title}</h3>
        {sub && <p className="text-sm text-muted">{sub}</p>}
      </header>
      {children}
    </section>
  );
}

function ResultPill({ result }: { result: Competition["result"] }) {
  const b = BAND_OF[result];
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold text-fg"
      style={{ borderColor: `color-mix(in srgb, ${BAND_COLOR[b]} 55%, transparent)`, background: `color-mix(in srgb, ${BAND_COLOR[b]} 12%, transparent)` }}>
      <span className="h-2 w-2 rounded-full" style={{ background: BAND_COLOR[b] }} aria-hidden />
      {RESULT_LABELS[result]}
    </span>
  );
}

function NameWall({ label, names }: { label: string; names: string[] }) {
  if (!names.length) return null;
  return (
    <div>
      <p className="ticker text-muted">{label} · {names.length}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {names.map((n) => <li key={n} className="rounded-md border border-line bg-bg px-3 py-1.5 text-sm font-medium text-fg">{n}</li>)}
      </ul>
    </div>
  );
}

function FilterSelect({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="min-w-[8.5rem] flex-1 sm:flex-none">
      <label htmlFor={id} className="mb-1 block text-xs text-muted">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className={`h-9 w-full rounded-md border bg-bg px-2.5 text-sm text-fg focus:border-accent focus:outline-none ${value !== "all" ? "border-accent" : "border-line"}`}>
        <option value="all">All</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function Th({ label, k, sort, onSort, className = "" }: { label: string; k: SortKey; sort: { key: SortKey; dir: 1 | -1 }; onSort: (k: SortKey) => void; className?: string }) {
  const active = sort.key === k;
  return (
    <th scope="col" className={`px-3 py-2.5 font-medium ${className}`} aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => onSort(k)} className={`inline-flex items-center gap-1 ${active ? "text-fg" : "text-muted hover:text-fg"}`}>
        {label}
        {active && (sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
      </button>
    </th>
  );
}
