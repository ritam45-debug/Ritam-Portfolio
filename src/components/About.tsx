import { profile } from "../content/profile";
import { SectionHeader } from "./ui";
import { spotMove } from "./work/shared";

export function About() {
  return (
    <section id="about" aria-labelledby="about-h" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <SectionHeader id="about-h" code="§ 01 · About" title="Reading businesses through their numbers" />
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="reveal grid max-w-[64ch] gap-5 text-[1.05rem] leading-relaxed text-muted [&>p:first-child]:text-fg">
          {profile.about.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
        </div>
        <aside className="grid content-start gap-8">
          <dl className="reveal grid gap-4 border-l-2 border-accent/60 pl-5">
            <div>
              <dt className="ticker text-muted">Now</dt>
              <dd className="mt-1 text-fg">{profile.education.current}</dd>
            </div>
            <div>
              <dt className="ticker text-muted">Undergraduate</dt>
              <dd className="mt-1 text-fg">{profile.education.undergraduate}</dd>
            </div>
            <div>
              <dt className="ticker text-muted">Academic record</dt>
              <dd className="num mt-1 text-fg">{profile.education.record}</dd>
            </div>
          </dl>
          <div>
            <p className="ticker text-muted">Toolkit</p>
            <ul className="mt-3 grid gap-2">
              {profile.tools.map((t) => (
                <li key={t.name} onMouseMove={spotMove} className="spot flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 rounded-xl border border-line bg-surface px-4 py-2.5 transition-colors hover:border-accent/60">
                  <span className="font-semibold text-fg">{t.name}</span>
                  <span className="text-sm text-muted">{t.use}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="ticker text-muted">Focus areas</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {profile.focusAreas.map((f) => (
                <li key={f} className="rounded-full border border-line bg-surface/60 px-3 py-1 text-sm text-fg transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent">{f}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
