import { useCallback, useEffect, useRef, useState } from "react";
import { Bell as BellIcon, BellRing, Smartphone } from "lucide-react";
import { fetchNotices, getMine, getSeen, setSeen, timeAgo, type MyQuestion, type SiteNotice } from "../lib/consult";

export function Bell() {
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<SiteNotice[]>([]);
  const [seen, setSeenState] = useState<string[]>(() => getSeen());
  const [mine, setMine] = useState<MyQuestion[]>(() => getMine());
  const [state, setState] = useState<"loading" | "ok" | "offline">("loading");
  const wrap = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setMine(getMine());
    try {
      setNotices(await fetchNotices());
      setState("ok");
    } catch {
      setState("offline");
    }
  }, []);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 60_000);
    const refresh = () => load();
    window.addEventListener("rd-notices-refresh", refresh);
    return () => { window.clearInterval(t); window.removeEventListener("rd-notices-refresh", refresh); };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const unread = notices.filter((n) => !seen.includes(n.id)).length;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread) {
      const ids = [...notices.map((n) => n.id), ...seen];
      setSeen(ids);
      window.setTimeout(() => setSeenState(ids), 1800); // let the "new" dots show briefly
    }
  };

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="notice-panel"
        aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
        className="relative grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-fg"
      >
        {unread ? <BellRing size={16} className="text-accent [animation:pulse-dot_1.4s_ease-in-out_infinite]" /> : <BellIcon size={16} />}
        {unread > 0 && (
          <span className="num absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gradient-to-r from-accent to-accent-2 px-1 text-[0.6rem] font-bold text-accent-ink">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div id="notice-panel" role="dialog" aria-label="Notifications" className="fade-in fixed inset-x-4 top-[4.25rem] z-50 overflow-hidden sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[22rem] rounded-2xl border border-line bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-semibold text-fg">Notifications</p>
            <a href="#consult" onClick={() => setOpen(false)} className="text-xs text-accent hover:underline">Ask a question</a>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {mine.length > 0 && (
              <div className="border-b border-line px-4 py-3">
                <p className="ticker mb-2 text-muted">Your questions</p>
                <ul className="grid gap-2">
                  {mine.slice(0, 3).map((q) => (
                    <li key={q.time} className="text-sm text-fg">
                      {q.topic} <span className="text-xs text-muted">· {timeAgo(q.time)} · {q.status === "sent" ? "sent, reply comes by email" : "may not have arrived"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="px-4 py-3">
              <p className="ticker mb-2 text-muted">Recent activity</p>
              {state === "loading" && <p className="text-sm text-muted">Checking…</p>}
              {state === "offline" && <p className="text-sm text-muted">Recent activity couldn't be loaded right now.</p>}
              {state === "ok" && notices.length === 0 && <p className="text-sm text-muted">No new questions in the last few hours.</p>}
              {state === "ok" && notices.length > 0 && (
                <ul className="grid gap-2.5">
                  {notices.slice(0, 12).map((n) => (
                    <li key={n.id} className="flex gap-3">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${seen.includes(n.id) ? "bg-line" : "bg-accent shadow-[0_0_8px_var(--accent)]"}`} aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-sm text-fg">{n.title}</span>
                        <span className="block text-xs text-muted">{n.message} · {timeAgo(n.time)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <p className="flex gap-2 border-t border-line bg-bg px-4 py-2.5 text-[0.7rem] leading-snug text-muted">
            <Smartphone size={13} className="mt-0.5 shrink-0" /> Shows question topics and times only. Names and emails are never shown here.
          </p>
        </div>
      )}
    </div>
  );
}
