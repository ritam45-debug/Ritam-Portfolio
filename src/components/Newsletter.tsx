import { lazy, Suspense, useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, Clock, Link2, Mail, PenLine, X } from "lucide-react";
import { profile } from "../content/profile";
import { copyText } from "../lib/clipboard";
import { assetUrl, canPublishHere, displayHtml, excerpt, loadPublished, readingMinutes, type Post } from "../lib/newsletter";
import { SectionHeader } from "./ui";
import { spotMove } from "./work/shared";

const NewsletterEditor = lazy(() => import("./NewsletterEditor"));
const fmtDate = (t?: number) => (t ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

function authorFlag(): boolean {
  try {
    if (location.hash === "#write") { localStorage.setItem("rd-author", "1"); return true; }
    return localStorage.getItem("rd-author") === "1";
  } catch { return location.hash === "#write"; }
}

export function Newsletter({ onToast }: { onToast: (m: string) => void }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [author, setAuthor] = useState(false);
  const [editing, setEditing] = useState(false);
  const [filter, setFilter] = useState("All");

  const refresh = useCallback(async () => setPosts(await loadPublished()), []);

  useEffect(() => {
    refresh();
    setAuthor(authorFlag());
    canPublishHere().then((ok) => ok && setAuthor(true));
    const onHash = () => { if (location.hash === "#write") { setAuthor(true); setEditing(true); } };
    window.addEventListener("hashchange", onHash);
    if (location.hash === "#write") setEditing(true);
    return () => window.removeEventListener("hashchange", onHash);
  }, [refresh]);

  // Deep link: #issue-<slug>
  useEffect(() => {
    if (!posts) return;
    const m = location.hash.match(/^#issue-(.+)$/);
    if (m) {
      const i = posts.findIndex((p) => p.slug === m[1]);
      if (i >= 0) { setOpen(i); document.getElementById("newsletter")?.scrollIntoView(); }
    }
  }, [posts]);

  const cats = ["All", ...Array.from(new Set((posts ?? []).map((p) => p.category)))];
  const shown = (posts ?? []).filter((p) => filter === "All" || p.category === filter);
  const [lead, ...rest] = shown;

  return (
    <section id="newsletter" aria-labelledby="nl-h" className="relative overflow-hidden border-t border-line">
      <div className="ledger absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader id="nl-h" code="§ 06 · Newsletter" title="The Ledger Notes" lede="Short, plain-English notes on finance, markets, strategy and life in an MBA, written by Ritam. New issues appear here as soon as they're published." />
          {author && (
            <button type="button" onClick={() => setEditing(true)} className="mb-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 text-sm font-semibold text-accent-ink shadow-[0_10px_30px_-10px_var(--accent)] transition-transform hover:-translate-y-0.5 md:mb-14">
              <PenLine size={15} /> Write an issue
            </button>
          )}
        </div>

        {cats.length > 2 && (
          <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter issues by topic">
            {cats.map((c) => (
              <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${filter === c ? "border-accent bg-accent text-accent-ink" : "border-line text-muted hover:border-accent hover:text-fg"}`}>{c}</button>
            ))}
          </div>
        )}

        {posts === null ? (
          <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl border border-line bg-surface" />)}</div>
        ) : posts.length === 0 ? (
          <div className="reveal grid gap-6 rounded-3xl border border-dashed border-line bg-surface/60 p-8 md:grid-cols-[auto_1fr] md:items-center">
            <span className="float grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-accent-ink"><BookOpen size={26} /></span>
            <div>
              <p className="font-display text-2xl text-fg">The first issue is on its way.</p>
              <p className="mt-1 text-muted">Subscribe below and it will reach your inbox when it's out.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5">
            {lead && (
              <button type="button" data-tilt="3" onMouseMove={spotMove} onClick={() => setOpen(posts.indexOf(lead))}
                className="spot reveal group grid overflow-hidden rounded-3xl border border-line bg-surface text-left transition-all hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_30px_70px_-40px_var(--accent)] md:grid-cols-[1.2fr_1fr]">
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-2 md:aspect-auto md:min-h-[20rem]">
                  {lead.cover ? <img src={assetUrl(lead.cover)} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <CoverArt title={lead.title} />}
                  <span className="absolute left-4 top-4 rounded-full bg-bg/80 px-3 py-1 text-xs font-semibold text-fg backdrop-blur">Latest issue</span>
                </div>
                <div className="flex flex-col gap-3 p-6 sm:p-8">
                  <p className="ticker text-accent">{lead.category}</p>
                  <h3 className="font-display text-3xl leading-tight text-fg">{lead.title}</h3>
                  {lead.subtitle && <p className="text-muted">{lead.subtitle}</p>}
                  <p className="text-sm text-muted">{excerpt(lead.html, 220)}</p>
                  <p className="mt-auto flex items-center gap-3 pt-3 font-mono text-xs text-muted"><span>{fmtDate(lead.publishedAt)}</span><span className="inline-flex items-center gap-1"><Clock size={12} /> {readingMinutes(lead.html)} min read</span></p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">Read issue <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
                </div>
              </button>
            )}
            {rest.length > 0 && (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <li key={p.id}>
                    <button type="button" onMouseMove={spotMove} onClick={() => setOpen(posts.indexOf(p))}
                      className="spot reveal group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left transition-all hover:-translate-y-1 hover:border-accent/60">
                      <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
                        {p.cover ? <img src={assetUrl(p.cover)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <CoverArt title={p.title} />}
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <p className="ticker text-accent">{p.category}</p>
                        <h3 className="font-display text-xl leading-snug text-fg">{p.title}</h3>
                        <p className="text-sm text-muted">{excerpt(p.html, 120)}</p>
                        <p className="mt-auto pt-2 font-mono text-xs text-muted">{fmtDate(p.publishedAt)} · {readingMinutes(p.html)} min</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Subscribe />
      </div>

      {posts && open !== null && posts[open] && (
        <Reader posts={posts} index={open} onIndex={setOpen} onClose={() => { setOpen(null); try { history.replaceState(null, "", "#newsletter"); } catch { /* ignore */ } }} onToast={onToast} />
      )}

      {editing && (
        <Suspense fallback={<div className="fixed inset-0 z-[90] grid place-items-center bg-bg text-muted">Opening the editor…</div>}>
          <NewsletterEditor
            published={posts ?? []}
            onClose={() => { setEditing(false); if (location.hash === "#write") { try { history.replaceState(null, "", "#newsletter"); } catch { /* ignore */ } } }}
            onPublished={(next) => setPosts(next.filter((p) => p.status === "published").sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0)))}
            onToast={onToast}
            onExitAuthor={() => { try { localStorage.removeItem("rd-author"); } catch { /* ignore */ } setAuthor(false); setEditing(false); }}
          />
        </Suspense>
      )}
    </section>
  );
}

/** Generated cover for issues without a picture. */
export function CoverArt({ title }: { title: string }) {
  let h = 0;
  for (const c of title) h = (h * 31 + c.charCodeAt(0)) % 997;
  const bars = Array.from({ length: 9 }, (_, i) => 20 + ((h * (i + 3)) % 60));
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-accent/25 via-surface-2 to-accent-2/25">
      <svg viewBox="0 0 300 160" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-3/4 w-full opacity-70" aria-hidden>
        {bars.map((b, i) => <rect key={i} x={12 + i * 32} y={160 - b * 1.6} width="18" height={b * 1.6} rx="3" fill={i % 3 === 0 ? "var(--accent-2)" : "var(--accent)"} opacity={0.35 + (i / bars.length) * 0.5} />)}
      </svg>
      <span className="absolute right-4 top-4 font-display text-5xl italic text-fg/20">RD</span>
    </div>
  );
}

function Reader({ posts, index, onIndex, onClose, onToast }: { posts: Post[]; index: number; onIndex: (i: number) => void; onClose: () => void; onToast: (m: string) => void }) {
  const p = posts[index];
  useEffect(() => {
    try { history.replaceState(null, "", `#issue-${p.slug}`); } catch { /* ignore */ }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", onKey); };
  }, [p.slug, onClose]);

  const share = async () => onToast((await copyText(`${location.origin}${location.pathname}#issue-${p.slug}`)) ? "Link to this issue copied" : "Couldn't copy. Use the address bar instead.");

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="reader-title" className="fade-in fixed inset-0 z-[85] overflow-y-auto bg-bg" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur sm:px-6">
        <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><X size={16} /> Close</button>
        <p className="ticker hidden text-muted sm:block">The Ledger Notes</p>
        <button type="button" onClick={share} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-fg hover:border-accent"><Link2 size={14} /> Copy link</button>
      </div>
      <article className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
        <p className="ticker rise text-accent">{p.category}</p>
        <h1 id="reader-title" className="rise mt-3 font-display text-4xl leading-[1.08] text-fg sm:text-5xl">{p.title}</h1>
        {p.subtitle && <p className="rise mt-4 text-xl text-muted">{p.subtitle}</p>}
        <p className="mt-5 flex flex-wrap items-center gap-3 border-y border-line py-3 text-sm text-muted">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 font-mono text-xs font-semibold text-accent-ink">{profile.initials}</span>
          <span className="text-fg">{profile.name}</span><span>·</span><span>{fmtDate(p.publishedAt)}</span><span>·</span><span>{readingMinutes(p.html)} min read</span>
        </p>
        {p.cover && <img src={assetUrl(p.cover)} alt="" className="rise mt-8 w-full rounded-2xl border border-line" />}
        <div className="prose-nl mt-8" dangerouslySetInnerHTML={{ __html: displayHtml(p.html) }} />
        {p.tags.length > 0 && <ul className="mt-10 flex flex-wrap gap-2">{p.tags.map((t) => <li key={t} className="rounded-full border border-line px-3 py-1 text-xs text-muted">#{t}</li>)}</ul>}
        <div className="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
          {index < posts.length - 1 && <button type="button" onClick={() => onIndex(index + 1)} className="rounded-2xl border border-line p-4 text-left hover:border-accent"><span className="flex items-center gap-1 text-xs text-muted"><ChevronLeft size={12} /> Older</span><span className="mt-1 block font-semibold text-fg">{posts[index + 1].title}</span></button>}
          {index > 0 && <button type="button" onClick={() => onIndex(index - 1)} className="rounded-2xl border border-line p-4 text-right hover:border-accent sm:col-start-2"><span className="flex items-center justify-end gap-1 text-xs text-muted">Newer <ChevronRight size={12} /></span><span className="mt-1 block font-semibold text-fg">{posts[index - 1].title}</span></button>}
        </div>
      </article>
    </div>
  );
}

function Subscribe() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setErr("Enter a valid email, like name@example.com."); return; }
    setErr("");
    setState("sending");
    try {
      const res = await fetch(profile.consult.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim(), _replyto: email.trim(), _subject: "New newsletter subscriber", request: "Please add me to The Ledger Notes", _template: "table", _captcha: "false" }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: string | boolean };
      if (!(data.success === true || data.success === "true")) throw new Error();
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  };

  return (
    <form onSubmit={submit} noValidate className="reveal edge mt-10 grid gap-4 rounded-3xl p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="font-display text-2xl text-fg">Get new issues by email</p>
        <p className="text-sm text-muted">One email when a new issue is out. Your address goes only to Ritam.</p>
      </div>
      <div className="min-w-0">
        {state === "done" ? (
          <p className="inline-flex items-center gap-2 rounded-full border border-pos/60 px-4 py-2.5 text-sm text-fg"><Check size={15} className="text-pos" /> You're subscribed. Thank you!</p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="nl-email" className="sr-only">Your email</label>
            <input id="nl-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className={`min-w-0 rounded-full border bg-bg px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none sm:w-64 ${err ? "border-neg" : "border-line"}`} />
            <button type="submit" disabled={state === "sending"} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 text-sm font-semibold text-accent-ink disabled:opacity-60">
              <Mail size={14} /> {state === "sending" ? "Subscribing…" : "Subscribe"}
            </button>
          </div>
        )}
        {err && <p className="mt-1 text-xs text-neg">{err}</p>}
        {state === "error" && (
          <p className="mt-2 text-xs text-muted">
            That didn't go through from here. <a className="text-accent underline" href={`mailto:${profile.contact.email}?subject=${encodeURIComponent("Subscribe me to The Ledger Notes")}`}>Email Ritam to subscribe</a> instead.
          </p>
        )}
      </div>
    </form>
  );
}
