import { useState } from "react";
import { ArrowRight, Download, ExternalLink, FileBarChart2, FileText, LayoutDashboard, Presentation } from "lucide-react";
import { blueStar, eternal, fadm } from "../content/work";
import summaryImg from "../assets/bluestar-summary.jpg";
import eternalImg from "../assets/eternal-summary.jpg";
import coverImg from "../assets/fadm/slide-06.jpg";
import { SectionHeader } from "./ui";
import { Segmented, spotMove } from "./work/shared";
import { BlueStarPanel } from "./work/BlueStarPanel";
import { FadmPanel } from "./work/FadmPanel";
import { EternalPanel } from "./work/EternalPanel";

const base = import.meta.env.BASE_URL;
const PROJECTS = [
  {
    id: blueStar.id, title: blueStar.title, kind: blueStar.kind, ownership: blueStar.ownership, blurb: blueStar.blurb,
    img: summaryImg, icon: FileBarChart2, imgPos: "object-top",
    pdf: `${base}files/Blue-Star-One-Page-Summary-Ritam-Dhara.pdf`, pdfLabel: "One-page summary · PDF · 77 KB", portrait: true,
  },
  {
    id: eternal.id, title: eternal.title, kind: eternal.kind, ownership: eternal.ownership, blurb: eternal.blurb,
    img: eternalImg, icon: FileBarChart2, imgPos: "object-top",
    pdf: `${base}files/Eternal-Company-Profile-Ritam-Dhara.pdf`, pdfLabel: "One-page summary · PDF · 69 KB", portrait: true,
  },
  {
    id: fadm.id, title: fadm.title, kind: fadm.kind, ownership: fadm.ownership, blurb: fadm.blurb,
    img: coverImg, icon: Presentation, imgPos: "object-left-top",
    pdf: `${base}files/FADM-Wires-and-Cables-Group4-Section3.pdf`, pdfLabel: "26-slide deck · PDF · 8.6 MB", portrait: false,
  },
];

type View = "dashboard" | "original";

export function Work() {
  const [active, setActive] = useState(0);
  const [view, setView] = useState<View>("dashboard");
  const p = PROJECTS[active];

  const pick = (i: number, v: View = "dashboard") => {
    setActive(i);
    setView(v);
  };

  return (
    <section id="projects" aria-labelledby="work-h" className="relative">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <SectionHeader
          id="work-h"
          code="§ 02 · Projects"
          title="Equity research and financial analysis"
          lede="Three pieces of work, each shown as a live dashboard alongside the original file. Pick a project, switch between the dashboard and the original, and hover any chart for exact figures."
        />

        <div role="tablist" aria-label="Projects" className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PROJECTS.map((proj, i) => {
            const on = i === active;
            const Icon = proj.icon;
            return (
              <div
                key={proj.id}
                data-tilt="5"
                onMouseMove={spotMove}
                className={`spot group reveal relative flex min-w-0 gap-4 overflow-hidden rounded-2xl p-4 transition-[box-shadow,border-color,transform] duration-300 will-change-transform sm:p-5 ${on ? "edge shadow-[0_24px_60px_-30px_var(--accent)]" : "border border-line bg-surface/60 hover:-translate-y-0.5 hover:border-accent/50"}`}
              >
                <button type="button" onClick={() => pick(i, "original")} className="relative z-10 hidden h-28 w-36 shrink-0 overflow-hidden rounded-lg border border-line sm:block" aria-label={`Open the original file for ${proj.title}`}>
                  <img src={proj.img} alt="" className={`h-full w-full object-cover ${proj.imgPos} transition-transform duration-700 group-hover:scale-110`} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="ticker flex items-center gap-2 text-accent"><Icon size={14} /> {proj.ownership}</p>
                  <button
                    type="button"
                    role="tab"
                    id={`tab-${proj.id}`}
                    aria-selected={on}
                    aria-controls={`panel-${proj.id}`}
                    onClick={() => pick(i)}
                    className="mt-1.5 block text-left font-display text-2xl leading-tight text-fg after:absolute after:inset-0 after:content-['']"
                  >
                    {proj.title}
                  </button>
                  <p className="mt-1 text-sm text-muted">{proj.kind}</p>
                  <div className="relative z-10 mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <button type="button" onClick={() => pick(i)} className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${on && view === "dashboard" ? "text-accent" : "text-fg hover:text-accent"}`}>
                      <LayoutDashboard size={14} /> Dashboard <ArrowRight size={13} />
                    </button>
                    <button type="button" onClick={() => pick(i, "original")} className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${on && view === "original" ? "text-accent" : "text-fg hover:text-accent"}`}>
                      <FileText size={14} /> Original file
                    </button>
                    <a href={proj.pdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
                      <ExternalLink size={13} /> Open PDF
                    </a>
                  </div>
                </div>
                {on && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-accent to-accent-2" aria-hidden />}
              </div>
            );
          })}
        </div>

        <div role="tabpanel" id={`panel-${p.id}`} aria-labelledby={`tab-${p.id}`} key={p.id} className="rise mt-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-[70ch] text-muted">{p.blurb}</p>
            <Segmented label="Show" value={view} onChange={setView} options={[{ id: "dashboard", label: "Interactive dashboard" }, { id: "original", label: "Original file" }]} />
          </div>

          {view === "dashboard" ? (
            active === 0 ? <BlueStarPanel /> : active === 1 ? <EternalPanel /> : <FadmPanel />
          ) : (
            <div className="fade-in grid gap-4">
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4">
                <FileText size={18} className="text-accent" />
                <p className="min-w-0 flex-1 text-sm text-fg">{p.title} <span className="text-muted">· {p.pdfLabel}</span></p>
                <a href={p.pdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-semibold text-accent-ink">
                  <ExternalLink size={14} /> Open in new tab
                </a>
                <a href={p.pdf} download className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-fg hover:border-accent">
                  <Download size={14} /> Download
                </a>
              </div>
              <div className={`overflow-hidden rounded-2xl border border-line bg-surface-2 ${p.portrait ? "h-[85vh]" : "h-[70vh]"}`}>
                <object data={`${p.pdf}#view=FitH`} type="application/pdf" className="h-full w-full" aria-label={`${p.title}, original PDF`}>
                  <div className="grid h-full place-items-center p-6 text-center">
                    <div className="max-w-sm">
                      <img src={p.img} alt="" className="mx-auto mb-4 max-h-56 rounded-lg border border-line" />
                      <p className="text-sm text-fg">This browser can't show the PDF inside the page.</p>
                      <a href={p.pdf} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent"><ExternalLink size={14} /> Open the PDF</a>
                    </div>
                  </div>
                </object>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
