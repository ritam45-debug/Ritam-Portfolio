import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { interests } from "../content/interests";
import type { Interest } from "../content/types";
import { SectionHeader } from "./ui";

function Motif({ kind }: { kind: Interest["motif"] }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const };
  switch (kind) {
    case "cricket":
      return (
        <svg viewBox="0 0 80 48" className="h-12 w-20" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={6 + i * 12} y={40 - [8, 14, 6, 22, 18, 30][i]} width="7" height={[8, 14, 6, 22, 18, 30][i]} rx="1" fill="currentColor" opacity={i === 5 ? 1 : 0.35} />)}
          <circle cx="72" cy="6" r="3.5" {...common} />
        </svg>
      );
    case "film":
      return (
        <svg viewBox="0 0 80 48" className="h-12 w-20" aria-hidden>
          <rect x="4" y="8" width="72" height="32" rx="3" {...common} />
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={9 + i * 11.5} y="11" width="5" height="4" fill="currentColor" opacity="0.5" />)}
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={`b${i}`} x={9 + i * 11.5} y="33" width="5" height="4" fill="currentColor" opacity="0.5" />)}
          <path d="M34 19 L46 24 L34 29 Z" fill="currentColor" />
        </svg>
      );
    case "stage":
      return (
        <svg viewBox="0 0 80 48" className="h-12 w-20" aria-hidden>
          <path d="M4 6 Q20 26 4 44" {...common} /><path d="M76 6 Q60 26 76 44" {...common} />
          <path d="M28 44 L40 10 L52 44" fill="currentColor" opacity="0.18" />
          <circle cx="40" cy="30" r="5" fill="currentColor" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 80 48" className="h-12 w-20" aria-hidden>
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <line key={i} x1={40 + Math.cos(a) * 8} y1={24 + Math.sin(a) * 8} x2={40 + Math.cos(a) * (i % 2 ? 16 : 21)} y2={24 + Math.sin(a) * (i % 2 ? 16 : 21)} {...common} />;
          })}
          <circle cx="40" cy="24" r="3.5" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 80 48" className="h-12 w-20" aria-hidden>
          <path d="M6 24 H24 L32 10 H52 L58 24 H74" {...common} /><path d="M24 24 L32 38 H52" {...common} />
          {[[6, 24], [32, 10], [52, 10], [74, 24], [52, 38]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="currentColor" />)}
        </svg>
      );
  }
}

export function Interests() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section id="interests" aria-labelledby="interests-h" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <SectionHeader id="interests-h" code="§ 05 · Beyond the spreadsheet" title="The rest of the picture" lede="Interests that shape how I think, and occasionally how I present." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {interests.map((it, i) => {
          const isOpen = open === it.id;
          return (
            <li key={it.id} className={i === 0 ? "lg:row-span-2" : ""}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : it.id)}
                aria-expanded={isOpen}
                aria-controls={`interest-${it.id}`}
                className={`group flex h-full w-full flex-col gap-4 rounded-xl border p-6 text-left transition-colors ${isOpen ? "border-accent bg-surface" : "border-line hover:border-accent/60"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`transition-colors ${isOpen ? "text-accent" : "text-muted group-hover:text-accent"}`}><Motif kind={it.motif} /></span>
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-line text-muted">{isOpen ? <Minus size={14} /> : <Plus size={14} />}</span>
                </div>
                <h3 className={`font-display leading-tight text-fg ${i === 0 ? "text-4xl" : "text-2xl"}`}>{it.title}</h3>
                <p className="text-muted">{it.lens}</p>
                <p id={`interest-${it.id}`} hidden={!isOpen} className="rise border-t border-line pt-4 text-fg">{it.story}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
