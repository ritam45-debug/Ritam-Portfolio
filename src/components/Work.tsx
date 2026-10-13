import { useState } from "react";
import { ArrowRight, FileBarChart2, Presentation } from "lucide-react";
import { blueStar, fadm } from "../content/work";
import summaryImg from "../assets/bluestar-summary.jpg";
import coverImg from "../assets/fadm/slide-06.jpg";
import { SectionHeader } from "./ui";
import { spotMove } from "./work/shared";
import { BlueStarPanel } from "./work/BlueStarPanel";
import { FadmPanel } from "./work/FadmPanel";

const PROJECTS = [
  { id: blueStar.id, title: blueStar.title, kind: blueStar.kind, ownership: blueStar.ownership, blurb: blueStar.blurb, img: summaryImg, icon: FileBarChart2, imgPos: "object-top" },
  { id: fadm.id, title: fadm.title, kind: fadm.kind, ownership: fadm.ownership, blurb: fadm.blurb, img: coverImg, icon: Presentation, imgPos: "object-left-top" },
];

export function Work() {
  const [active, setActive] = useState(0);
  const p = PROJECTS[active];

  return (
    <section id="projects" aria-labelledby="work-h" className="relative">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <SectionHeader
          id="work-h"
          code="§ 02 · Projects"
          title="Equity research and financial analysis"
          lede="Two pieces of work, rebuilt as live dashboards. Pick a project, switch chart views and hover any point for the exact figure."
        />

        <div role="tablist" aria-label="Projects" className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
          {PROJECTS.map((proj, i) => {
            const on = i === active;
            const Icon = proj.icon;
            return (
              <button
                key={proj.id}
                role="tab"
                id={`tab-${proj.id}`}
                aria-selected={on}
                aria-controls={`panel-${proj.id}`}
                onClick={() => setActive(i)}
                onMouseMove={spotMove}
                className={`spot group reveal relative flex min-w-0 gap-4 overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 sm:p-5 ${on ? "edge shadow-[0_24px_60px_-30px_var(--accent)]" : "border border-line bg-surface/60 hover:-translate-y-0.5 hover:border-accent/50"}`}
              >
                <div className="relative hidden h-28 w-36 shrink-0 overflow-hidden rounded-lg border border-line sm:block">
                  <img src={proj.img} alt="" className={`h-full w-full object-cover ${proj.imgPos} transition-transform duration-700 group-hover:scale-110`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="ticker flex items-center gap-2 text-accent"><Icon size={14} /> {proj.ownership}</p>
                  <h3 className="mt-1.5 font-display text-2xl leading-tight text-fg">{proj.title}</h3>
                  <p className="mt-1 text-sm text-muted">{proj.kind}</p>
                  <span className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${on ? "text-accent" : "text-fg group-hover:text-accent"}`}>
                    {on ? "Viewing now" : "Open dashboard"} <ArrowRight size={14} className={`transition-transform ${on ? "" : "group-hover:translate-x-1"}`} />
                  </span>
                </div>
                {on && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-accent to-accent-2" aria-hidden />}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`panel-${p.id}`} aria-labelledby={`tab-${p.id}`} key={p.id} className="rise mt-8">
          <p className="mb-6 max-w-[70ch] text-muted">{p.blurb}</p>
          {active === 0 ? <BlueStarPanel /> : <FadmPanel />}
        </div>
      </div>
    </section>
  );
}
