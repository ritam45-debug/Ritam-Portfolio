import { useState } from "react";
import { journey } from "../content/journey";
import type { MilestoneStatus } from "../content/types";
import { Chip, SectionHeader } from "./ui";

const STATUS: Record<MilestoneStatus, { label: string; cls: string; dot: string }> = {
  completed: { label: "Completed", cls: "text-fg border-line", dot: "bg-fg" },
  ongoing: { label: "Ongoing", cls: "text-accent border-accent/50", dot: "bg-accent" },
  exploring: { label: "Exploring", cls: "text-blue border-blue/50", dot: "bg-blue" },
  next: { label: "Next", cls: "text-muted border-line border-dashed", dot: "bg-transparent border border-muted" },
};

export function Journey() {
  const [filter, setFilter] = useState<MilestoneStatus | "all">("all");
  const items = journey.filter((m) => filter === "all" || m.status === filter);

  return (
    <section id="journey" aria-labelledby="journey-h" className="border-y border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <SectionHeader id="journey-h" code="§ 04 · Learning journey" title="Where I've been, where I'm heading" lede="Ordered from foundation to future. Dates are left off on purpose: what matters here is the direction." />
        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter milestones">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
          {(Object.keys(STATUS) as MilestoneStatus[]).map((s) => (
            <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>{STATUS[s].label}</Chip>
          ))}
        </div>
        <ol className="relative grid gap-0">
          <span className="absolute bottom-2 left-[7px] top-2 w-px bg-line md:left-[calc(30%+7px)]" aria-hidden />
          {items.map((m) => (
            <li key={m.id} className="rise relative grid gap-2 pb-10 pl-9 md:grid-cols-[30%_1fr] md:gap-10 md:pl-0">
              <span className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-[3px] border-bg ${STATUS[m.status].dot} md:left-[30%]`} aria-hidden />
              <div className="md:pr-10 md:text-right">
                <span className={`ticker inline-block rounded-full border px-2 py-0.5 !text-[0.64rem] ${STATUS[m.status].cls}`}>{STATUS[m.status].label}</span>
                {m.when && <p className="num mt-1 font-mono text-xs text-muted">{m.when}</p>}
                <p className="ticker mt-1 text-muted">{m.kind}</p>
              </div>
              <div className="min-w-0 md:pl-8">
                <h3 className="font-display text-2xl leading-snug text-fg">{m.title}</h3>
                <p className="mt-1.5 max-w-[60ch] text-muted">{m.detail}</p>
                {m.tags && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {m.tags.map((t) => <li key={t} className="num rounded border border-line px-2 py-0.5 font-mono text-xs text-fg">{t}</li>)}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
