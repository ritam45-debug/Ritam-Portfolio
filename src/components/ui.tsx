import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function SectionHeader({ code, title, lede, id }: { code: string; title: string; lede?: string; id: string }) {
  return (
    <header className="reveal mb-10 grid gap-3 md:mb-14">
      <p className="ticker flex items-center gap-2 text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" aria-hidden />
        {code}
        <span className="rule-draw h-px w-24 bg-gradient-to-r from-accent to-transparent" aria-hidden />
      </p>
      <h2 id={id} className="font-display text-4xl leading-[1.05] tracking-tight text-fg md:text-5xl">
        {title}
      </h2>
      {lede && <p className="max-w-[62ch] text-muted">{lede}</p>}
    </header>
  );
}

export function SampleBadge({ label = "Sample" }: { label?: string }) {
  return (
    <span className="ticker inline-flex items-center gap-1.5 rounded-full border border-amber/50 px-2 py-0.5 !text-[0.64rem] text-amber">
      <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden />
      {label}
    </span>
  );
}

export function Chip({ children, active, onClick, ...rest }: { children: ReactNode; active?: boolean; onClick?: () => void; "aria-pressed"?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      {...rest}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active ? "border-accent bg-accent text-accent-ink" : "border-line text-muted hover:border-accent hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

/** Accessible modal: focus trap, Escape to close, scroll lock, restores focus. */
export function Modal({ open, onClose, labelledBy, children, wide }: { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode; wide?: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])') ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const els = focusables();
        if (!els.length) return;
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`rise relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-surface shadow-2xl sm:rounded-2xl ${wide ? "max-w-4xl" : "max-w-2xl"}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="sticky top-3 z-10 float-right mr-3 mt-3 grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-muted hover:text-fg"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      {message && (
        <div className="rise rounded-full border border-line bg-surface-2 px-4 py-2 text-sm text-fg shadow-lg">{message}</div>
      )}
    </div>
  );
}
