import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCountUp } from "../../lib/useCountUp";

export const tip = {
  contentStyle: { background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 10, color: "var(--fg)", fontSize: 13, boxShadow: "0 12px 30px rgba(0,0,0,.25)" },
  labelStyle: { color: "var(--fg)", fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: "var(--fg)", padding: 0 },
  cursor: { fill: "var(--surface-2)", opacity: 0.5 },
};
export const axis = { tick: { fill: "var(--muted)", fontSize: 12 }, axisLine: false as const, tickLine: false as const };

/** Mouse-following glow for any card with the `spot` class. */
export function spotMove(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export function Panel({ title, sub, children, className = "", action }: { title: string; sub?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section onMouseMove={spotMove} className={`spot reveal min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6 ${className}`}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-display text-xl text-fg">{title}</h4>
          {sub && <p className="text-sm text-muted">{sub}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function StatTile({ label, value, decimals = 0, prefix = "", suffix = "", note, tone }: { label: string; value: number; decimals?: number; prefix?: string; suffix?: string; note?: ReactNode; tone?: "pos" | "neg" }) {
  const [ref, v] = useCountUp<HTMLDivElement>(value);
  return (
    <div ref={ref} onMouseMove={spotMove} className="spot flex flex-col gap-1 bg-surface p-4 sm:p-5">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="num font-display text-3xl leading-none text-fg sm:text-4xl">
        {prefix}{v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
      </dd>
      {note && <dd className={`text-xs ${tone === "pos" ? "text-pos" : tone === "neg" ? "text-neg" : "text-muted"}`}>{note}</dd>}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-bg p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${value === o.id ? "bg-accent text-accent-ink shadow-[0_0_18px_-4px_var(--accent)]" : "text-muted hover:text-fg"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Full-screen image viewer with arrows, keyboard and swipe-free buttons. */
export function Lightbox({ images, index, onIndex, onClose }: { images: { src: string; caption: string }[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const go = useCallback((d: number) => { if (index !== null) onIndex((index + d + images.length) % images.length); }, [index, images.length, onIndex]);

  useEffect(() => {
    if (index === null) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; prev?.focus?.(); };
  }, [index, go, onClose]);

  if (index === null) return null;
  const img = images[index];
  const multi = images.length > 1;
  return (
    <div role="dialog" aria-modal="true" aria-label={img.caption} className="fade-in fixed inset-0 z-[80] flex flex-col bg-bg/95 backdrop-blur-md" style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="min-w-0 truncate text-sm text-fg">
          {multi && <span className="num mr-2 font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")} / {images.length}</span>}
          {img.caption}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close viewer" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-fg hover:border-accent">
          <X size={18} />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <img key={img.src} src={img.src} alt={img.caption} className="fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
        {multi && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-fg hover:border-accent"><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next slide" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-fg hover:border-accent"><ChevronRight size={20} /></button>
          </>
        )}
      </div>
    </div>
  );
}

export function Observation({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-fg">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" aria-hidden />
      <span>{children}</span>
    </li>
  );
}
