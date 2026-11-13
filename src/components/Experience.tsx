import { Award, GraduationCap, HeartHandshake, Landmark, Leaf, Megaphone, ShoppingBag, Trophy, Users } from "lucide-react";
import type { CSSProperties } from "react";
import { honours, internships, leadership, schooling, type Internship } from "../content/experience";
import { SectionHeader } from "./ui";
import { spotMove } from "./work/shared";

const KIND = {
  finance: { icon: Landmark, tone: "var(--accent)", tag: "Banking & finance" },
  sales: { icon: ShoppingBag, tone: "var(--accent-2)", tag: "Sales & market research" },
  impact: { icon: Leaf, tone: "var(--pos)", tag: "Research & impact writing" },
} as const;

const LEAD_ICONS = [Megaphone, Megaphone, Users, HeartHandshake];

export function Experience() {
  return (
    <section id="experience" aria-labelledby="exp-h" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <SectionHeader id="exp-h" code="§ 02 · Experience & leadership" title="Where the classroom met the field"
        lede="Internships in banking, FMCG sales and research writing, quizzes built from scratch for national audiences, and the roles that keep me busy on campus." />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Internship timeline */}
        <div className="min-w-0">
          <p className="ticker mb-5 text-muted">Internships</p>
          <ol className="exp-line relative grid gap-6 pl-8">
            {internships.map((it, i) => <InternCard key={it.org + it.when} it={it} i={i} />)}
          </ol>
        </div>

        {/* Education + honours */}
        <aside className="grid min-w-0 content-start gap-10">
          <div>
            <p className="ticker mb-4 flex items-center gap-2 text-muted"><GraduationCap size={14} /> Education</p>
            <ol className="grid gap-2">
              {schooling.map((s, i) => (
                <li key={s.level} className="reveal exp-step relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
                  style={{ "--d": `${i * 80}ms` } as CSSProperties}>
                  <div className="min-w-0">
                    <p className="font-semibold text-fg">{s.level}</p>
                    <p className="truncate text-sm text-muted" title={s.where}>{s.where}</p>
                  </div>
                  <div className="text-right">
                    <p className="num font-mono text-sm font-semibold text-accent">{s.score}</p>
                    <p className="num font-mono text-xs text-muted">{s.year}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="ticker mb-4 flex items-center gap-2 text-muted"><Award size={14} /> Honours beyond the case record</p>
            <ul className="grid gap-3">
              {honours.map((h, i) => (
                <li key={h.title} className="reveal flex gap-3" style={{ "--d": `${i * 70}ms` } as CSSProperties}>
                  <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${i === 0 ? "exp-crown" : "bg-surface-2"} text-b4`}>
                    <Trophy size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-fg">{h.title}{h.year && <span className="num ml-2 font-mono text-xs font-normal text-muted">{h.year}</span>}</p>
                    <p className="text-sm text-muted">{h.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Leadership */}
      <div className="mt-16">
        <p className="ticker mb-5 text-muted">Leadership & community</p>
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
          {leadership.map((l, i) => {
            const Icon = LEAD_ICONS[i] ?? Users;
            return (
              <li key={l.title} onMouseMove={spotMove} data-tilt
                className="spot reveal group min-w-0 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/60"
                style={{ "--d": `${i * 90}ms` } as CSSProperties}>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"><Icon size={18} /></span>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg leading-tight text-fg">{l.title}</h3>
                    <p className="text-sm text-muted">{l.where}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{l.detail}</p>
                {l.metrics && (
                  <dl className="mt-4 flex flex-wrap gap-2">
                    {l.metrics.map((m) => (
                      <div key={m.label} className="exp-metric rounded-lg border border-line bg-bg px-3 py-1.5">
                        <dt className="sr-only">{m.label}</dt>
                        <dd className="num font-mono text-base font-semibold text-fg">{m.value}</dd>
                        <dd className="text-[11px] text-muted" aria-hidden>{m.label}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function InternCard({ it, i }: { it: Internship; i: number }) {
  const k = KIND[it.kind];
  const Icon = k.icon;
  return (
    <li className="reveal relative min-w-0" style={{ "--d": `${i * 100}ms`, "--tone": k.tone } as CSSProperties}>
      <span className="exp-node absolute -left-8 top-5 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full border-2 bg-bg" style={{ borderColor: k.tone, color: k.tone, marginLeft: "1px" }} aria-hidden>
        <Icon size={12} />
      </span>
      <article onMouseMove={spotMove} className="spot rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-[color:var(--tone)]">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="ticker" style={{ color: k.tone }}>{k.tag}</p>
            <h3 className="mt-1 font-display text-xl leading-tight text-fg">{it.org}</h3>
            <p className="text-sm text-fg/80">{it.role}</p>
          </div>
          <p className="num shrink-0 rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">{it.when}</p>
        </header>
        {it.stat && (
          <p className="mt-4 flex items-baseline gap-2">
            <span className="exp-stat num font-display text-3xl" style={{ color: k.tone }}>{it.stat.value}</span>
            <span className="text-sm text-muted">{it.stat.label}</span>
          </p>
        )}
        <ul className="mt-3 grid gap-1.5 text-sm leading-relaxed text-muted">
          {it.points.map((p) => (
            <li key={p} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: k.tone }} aria-hidden />{p}</li>
          ))}
        </ul>
      </article>
    </li>
  );
}
