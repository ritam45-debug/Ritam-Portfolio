import { useEffect, useState } from "react";
import { ArrowUp, Linkedin, Mail, MessageCircle } from "lucide-react";
import { profile } from "../content/profile";
import { NAV } from "./Nav";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xl text-fg">{profile.name}</p>
          <p className="text-sm text-muted">{profile.brandLine}</p>
          {profile.contact.linkedin && (
            <a href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
              <Linkedin size={14} /> LinkedIn
            </a>
          )}
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a href={`https://wa.me/${profile.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-fg"><MessageCircle size={14} /> {profile.contact.whatsappDisplay}</a>
            <a href={`mailto:${profile.contact.email}`} className="inline-flex items-center gap-1.5 text-muted hover:text-fg"><Mail size={14} /> {profile.contact.email}</a>
          </div>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {NAV.map((n) => <li key={n.id}><a href={`#${n.id}`} className="text-muted hover:text-fg">{n.label}</a></li>)}
        </ul>
        <p className="font-mono text-xs text-muted">© {new Date().getFullYear()} {profile.name}</p>
      </div>
    </footer>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      className="rise fixed right-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-fg shadow-lg hover:border-accent"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}
