import { useRef, useState, type KeyboardEvent } from "react";
import { Info } from "lucide-react";
import { playgroundMeta } from "../content/playground";
import { SectionHeader } from "./ui";
import { RatioExplorer } from "./playground/RatioExplorer";
import { DcfSimulator } from "./playground/DcfSimulator";
import { BreakEven } from "./playground/BreakEven";

const TABS = [
  { id: "ratios", label: "Ratio explorer", blurb: "Compare three companies on five ratios.", El: RatioExplorer },
  { id: "dcf", label: "DCF simulator", blurb: "Move the assumptions, watch the value move.", El: DcfSimulator },
  { id: "breakeven", label: "Break-even", blurb: "How price and cost decide survival.", El: BreakEven },
];

export function Playground() {
  const [tab, setTab] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = (tab + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    setTab(next);
    refs.current[next]?.focus();
  };
  const Active = TABS[tab].El;

  return (
    <section id="playground" aria-labelledby="playground-h" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <SectionHeader
        id="playground-h"
        code="§ 03 · Analytics playground"
        title="Turn the dials, read the result"
        lede="Three small tools that show how numbers become a decision. Each one writes its own insight as you change the inputs."
      />
      {playgroundMeta.illustrative && (
        <p className="mb-6 inline-flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm text-muted">
          <Info size={14} className="text-amber" /> Illustrative data. {playgroundMeta.sourceNote}
        </p>
      )}
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div role="tablist" aria-label="Playground tools" className="grid grid-cols-1 border-b border-line sm:grid-cols-3" onKeyDown={onKey}>
          {TABS.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => { refs.current[i] = el; }}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === i}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === i ? 0 : -1}
              onClick={() => setTab(i)}
              className={`relative px-5 py-4 text-left transition-colors ${tab === i ? "bg-bg text-fg" : "text-muted hover:text-fg"} ${i > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""}`}
            >
              {tab === i && <span className="absolute inset-x-0 top-0 h-0.5 bg-accent" aria-hidden />}
              <span className="ticker block text-accent">0{i + 1}</span>
              <span className="mt-1 block font-semibold">{t.label}</span>
              <span className="mt-0.5 block text-sm text-muted">{t.blurb}</span>
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${TABS[tab].id}`} aria-labelledby={`tab-${TABS[tab].id}`} className="bg-bg p-5 sm:p-8">
          <Active />
        </div>
      </div>
    </section>
  );
}
