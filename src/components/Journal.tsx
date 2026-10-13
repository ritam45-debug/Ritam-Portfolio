import { useMemo, useState } from "react";
import { ArrowUpRight, NotebookPen } from "lucide-react";
import { articles, journalCategories } from "../content/articles";
import { projects } from "../content/projects";
import { formatDate, readingTime } from "../lib/format";
import { Chip, Modal, SampleBadge, SectionHeader } from "./ui";

export function Journal({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  const [cat, setCat] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const sorted = useMemo(() => [...articles].sort((a, b) => b.date.localeCompare(a.date)), []);
  const shown = sorted.filter((a) => cat === "all" || a.category === cat);
  const published = articles.filter((a) => !a.sample).length;
  const open = articles.find((a) => a.id === openId);

  return (
    <section id="journal" aria-labelledby="journal-h" className="border-y border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <SectionHeader id="journal-h" code="§ 07 · Journal" title="Notes from the work" lede="Lessons from case studies, observations on markets, data-viz experiments and reflections on AI in business." />

        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <Chip active={cat === "all"} onClick={() => setCat("all")}>All</Chip>
          {journalCategories.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
        </div>

        {published === 0 && (
          <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-dashed border-line p-8 sm:flex-row sm:items-center">
            <NotebookPen className="shrink-0 text-accent" />
            <div>
              <p className="font-semibold text-fg">The first entry is being written.</p>
              <p className="text-sm text-muted">Nothing has been published yet. The card below is a sample that shows the article layout.</p>
            </div>
          </div>
        )}

        {shown.length === 0 ? (
          <p className="text-muted">No entries in “{cat}” yet.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {shown.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => setOpenId(a.id)} className="group flex h-full w-full flex-col gap-3 rounded-xl border border-line bg-bg p-6 text-left hover:border-accent/60">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
                    <span className="text-accent">{a.category}</span>
                    <span>{formatDate(a.date)}</span>
                    <span>{readingTime(a.body)} min read</span>
                    {a.sample && <SampleBadge />}
                  </div>
                  <h3 className="font-display text-2xl leading-snug text-fg group-hover:text-accent">{a.title}</h3>
                  <p className="text-muted">{a.summary}</p>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-fg">Read <ArrowUpRight size={14} /></span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={!!open} onClose={() => setOpenId(null)} labelledBy="article-title">
        {open && (
          <article className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pr-12 font-mono text-xs text-muted">
              <span className="text-accent">{open.category}</span>
              <span>{formatDate(open.date)}</span>
              <span>{readingTime(open.body)} min read</span>
              {open.sample && <SampleBadge />}
            </div>
            <h3 id="article-title" className="mt-3 font-display text-3xl leading-tight text-fg sm:text-4xl">{open.title}</h3>
            <div className="mt-6 grid max-w-[65ch] gap-4 text-[1.05rem] leading-relaxed text-fg">
              {open.body.map((para) =>
                para.startsWith("## ") ? (
                  <h4 key={para} className="mt-2 font-display text-xl text-fg">{para.slice(3)}</h4>
                ) : (
                  <p key={para} className="text-muted">{para}</p>
                ),
              )}
            </div>
            {open.relatedProjects?.length ? (
              <div className="mt-8 border-t border-line pt-5">
                <p className="ticker text-muted">Related projects</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {open.relatedProjects.map((id) => {
                    const p = projects.find((x) => x.id === id);
                    return p ? (
                      <li key={id}>
                        <button type="button" onClick={() => { setOpenId(null); setTimeout(() => onOpenProject(id), 50); }} className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm text-fg hover:border-accent">
                          {p.title} <ArrowUpRight size={14} />
                        </button>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            ) : null}
          </article>
        )}
      </Modal>
    </section>
  );
}
