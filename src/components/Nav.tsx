import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { ACCENTS, type Accent, type Theme } from "../lib/theme";
import { profile } from "../content/profile";
import { Bell } from "./Bell";

export const NAV = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "competitions", label: "Competitions" },
  { id: "consult", label: "Consult" },
];

function AccentPicker({ accent, onAccent }: { accent: Accent; onAccent: (a: Accent) => void }) {
  return (
    <div role="radiogroup" aria-label="Colour theme" className="flex items-center gap-1 rounded-full border border-line bg-surface/70 p-1">
      {ACCENTS.map((a) => (
        <button
          key={a.id}
          type="button"
          role="radio"
          aria-checked={accent === a.id}
          aria-label={`${a.label} colours`}
          title={a.label}
          onClick={() => onAccent(a.id)}
          className={`h-6 w-6 rounded-full transition-transform hover:scale-110 ${accent === a.id ? "ring-2 ring-fg ring-offset-2 ring-offset-bg" : ""}`}
          style={{ background: `linear-gradient(135deg, ${a.swatch[0]}, ${a.swatch[1]})` }}
        />
      ))}
    </div>
  );
}

export function Nav({ theme, onToggleTheme, accent, onAccent }: { theme: Theme; onToggleTheme: () => void; accent: Accent; onAccent: (a: Accent) => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    NAV.forEach((n) => { const el = document.getElementById(n.id); if (el) obs.observe(el); });
    return () => { window.removeEventListener("scroll", onScroll); obs.disconnect(); };
  }, []);

  return (
    <header
      className={`sticky z-40 border-b transition-colors duration-300 ${scrolled ? "border-line bg-bg/80 backdrop-blur-xl" : "border-transparent bg-transparent"}`}
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6" aria-label="Main">
        <a href="#top" className="group flex items-center gap-2.5 font-display text-lg text-fg">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 font-mono text-xs font-semibold text-accent-ink shadow-[0_0_20px_-4px_var(--accent)] transition-transform group-hover:rotate-6">{profile.initials}</span>
          <span className="hidden sm:inline">{profile.name}</span>
        </a>
        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={active === n.id ? "true" : undefined}
                className={`relative rounded-full px-3.5 py-1.5 text-sm transition-colors ${active === n.id ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"}`}
              >
                {n.label}
                {active === n.id && <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-accent to-accent-2" aria-hidden />}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><AccentPicker accent={accent} onAccent={onAccent} /></div>
          <Bell />
          <button
            type="button"
            onClick={onToggleTheme}
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-fg"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>
      <div className="progress-bar absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-accent to-accent-2" aria-hidden />
      {open && (
        <ul id="mobile-nav" className="grid gap-1 border-t border-line bg-bg px-4 py-3 md:hidden">
          <li className="flex items-center justify-between px-3 py-2 sm:hidden"><span className="text-sm text-muted">Colours</span><AccentPicker accent={accent} onAccent={onAccent} /></li>
          {NAV.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-fg hover:bg-surface-2">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
