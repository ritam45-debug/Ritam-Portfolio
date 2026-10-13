import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Link2, Search } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { categories, projects } from "../content/projects";
import type { CategoryId, Project } from "../content/types";
import { copyText } from "../lib/clipboard";
import { Chip, Modal, SampleBadge, SectionHeader } from "./ui";
import { ProjectPreview } from "./ProjectPreview";

const catShort = (id: CategoryId) => categories.find((c) => c.id === id)?.short ?? id;
const catLabel = (id: CategoryId) => categories.find((c) => c.id === id)?.label ?? id;

export function Projects({ onToast, openId, setOpenId }: { onToast: (m: string) => void; openId: string | null; setOpenId: (id: string | null) => void }) {
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!q) return true;
      return [p.title, p.problem, p.tools.join(" "), catLabel(p.category)].join(" ").toLowerCase().includes(q);
    });
  }, [cat, query]);

  const open = projects.find((p) => p.id === openId) ?? null;
  const allSample = projects.every((p) => p.sample);

  return (
    <section id="projects" aria-labelledby="projects-h" className="border-y border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <SectionHeader
          id="projects-h"
          code="§ 02 · Projects"
          title="Problems worth taking apart"
          lede="Each project is written up the same way: the business question, the data, the method, what it found and what it couldn't answer."
        />

        {allSample && (
          <div className="mb-8 flex flex-wrap items-start gap-3 rounded-lg border border-amber/40 bg-amber/5 p-4 text-sm text-fg">
            <SampleBadge label="Templates" />
            <p className="min-w-0 flex-1">
              These cards are sample templates that show the write-up structure. They are not completed work. Real projects will replace them as they're published.
            </p>
          </div>
        )}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <Chip active={cat === "all"} onClick={() => setCat("all")}>All</Chip>
            {categories.map((c) => (
              <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.short}</Chip>
            ))}
          </div>
          <label className="relative block md:w-72">
            <span className="sr-only">Search projects</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="project-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by topic or tool"
              className="w-full rounded-md border border-line bg-bg py-2.5 pl-9 pr-3 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-10 text-center text-muted">
            No projects match “{query}”.{" "}
            <button type="button" className="text-accent underline underline-offset-4" onClick={() => { setQuery(""); setCat("all"); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <li key={p.id}>
                <ProjectCard project={p} index={projects.indexOf(p)} delay={i * 60} onOpen={() => setOpenId(p.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={!!open} onClose={() => setOpenId(null)} labelledBy="project-modal-title" wide>
        {open && <ProjectDetail project={open} onToast={onToast} />}
      </Modal>
    </section>
  );
}

function ProjectCard({ project: p, index, delay, onOpen }: { project: Project; index: number; delay: number; onOpen: () => void }) {
  return (
    <article
      className="rise group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-bg transition-all duration-300 hover:-translate-y-1 hover:border-accent/60"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="ledger relative aspect-[32/15] max-w-full border-b border-line bg-surface p-3">
        <div className="h-full transition-transform duration-500 group-hover:scale-[1.03]">
          <ProjectPreview category={p.category} seed={index + 1} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="ticker text-accent">{catShort(p.category)}</p>
          {p.sample && <SampleBadge />}
        </div>
        <h3 className="font-display text-xl leading-snug text-fg">{p.title}</h3>
        <p className="text-sm text-muted">{p.problem}</p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Tools">
          {p.tools.map((t) => (
            <li key={t} className="rounded border border-line px-2 py-0.5 font-mono text-[0.7rem] text-muted">{t}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onOpen}
          className="mt-2 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-fg underline-offset-4 hover:text-accent hover:underline"
          aria-label={`Explore project: ${p.title}`}
        >
          Explore project <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}

function ProjectDetail({ project: p, onToast }: { project: Project; onToast: (m: string) => void }) {
  useEffect(() => {
    try { history.replaceState(null, "", `#${p.id}`); } catch { /* sandboxed */ }
    return () => { try { history.replaceState(null, "", "#projects"); } catch { /* ignore */ } };
  }, [p.id]);

  const share = async () => {
    const url = `${location.origin}${location.pathname}#${p.id}`;
    onToast((await copyText(url)) ? "Project link copied" : "Couldn't copy. Copy the address bar instead.");
  };

  const sections: { n: string; title: string; body: string[] | string }[] = [
    { n: "01", title: "Overview", body: p.overview },
    { n: "02", title: "Business problem", body: p.problem },
    { n: "03", title: "Objectives", body: p.objectives },
    { n: "04", title: "Data sources & assumptions", body: p.dataAndAssumptions },
    { n: "05", title: "Methodology", body: p.methodology },
  ];
  const tail: { n: string; title: string; body: string[] }[] = [
    { n: "07", title: "Findings & recommendations", body: p.findings },
    { n: "08", title: "Limitations & learning", body: [...p.limitations, ...p.learning] },
  ];

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-center gap-3 pr-12">
        <p className="ticker text-accent">{catLabel(p.category)}</p>
        {p.sample && <SampleBadge label="Sample template" />}
      </div>
      <h3 id="project-modal-title" className="mt-3 max-w-[30ch] font-display text-3xl leading-tight text-fg sm:text-4xl">{p.title}</h3>
      {p.sample && (
        <p className="mt-4 rounded-md border border-amber/40 bg-amber/5 p-3 text-sm text-fg">
          This is a template showing how a project will be documented. It is not completed work, and the chart uses sample numbers.
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        {p.tools.map((t) => <span key={t} className="rounded border border-line px-2 py-0.5 font-mono text-xs text-muted">{t}</span>)}
        <button type="button" onClick={share} className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm text-fg hover:border-accent">
          <Link2 size={14} /> Copy link
        </button>
      </div>

      <div className="mt-8 grid gap-7">
        {sections.map((s) => <DetailBlock key={s.n} {...s} />)}

        <section>
          <h4 className="ticker flex gap-3 text-muted"><span className="text-accent">06</span> Visualisations & metrics</h4>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            {p.metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-line bg-bg p-3">
                <dt className="text-xs text-muted">{m.label}</dt>
                <dd className="num mt-1 text-sm font-semibold text-fg">{m.value}</dd>
              </div>
            ))}
          </dl>
          {p.chart && (
            <figure className="mt-4 rounded-lg border border-line bg-bg p-4">
              <figcaption className="mb-2 text-xs text-muted">{p.chart.label}</figcaption>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={p.chart.points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`g-${p.id}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} unit={p.chart.unit} />
                    <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--fg)" }} labelStyle={{ color: "var(--muted)" }} />
                    <Area type="monotone" dataKey="value" name="Sample value" stroke="var(--accent)" strokeWidth={2} fill={`url(#g-${p.id})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </figure>
          )}
        </section>

        {tail.map((s) => <DetailBlock key={s.n} {...s} />)}
      </div>
    </div>
  );
}

function DetailBlock({ n, title, body }: { n: string; title: string; body: string[] | string }) {
  return (
    <section>
      <h4 className="ticker flex gap-3 text-muted"><span className="text-accent">{n}</span> {title}</h4>
      {typeof body === "string" ? (
        <p className="mt-2 max-w-[65ch] text-fg">{body}</p>
      ) : (
        <ul className="mt-2 grid max-w-[65ch] gap-1.5">
          {body.map((b) => (
            <li key={b} className="flex gap-3 text-fg"><span className="mt-2.5 h-1 w-3 shrink-0 bg-line" aria-hidden />{b}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
