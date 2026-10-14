import { useCallback, useEffect, useMemo, useRef, useState, type ClipboardEvent, type CSSProperties, type DragEvent, type ReactNode } from "react";
import {
  ArrowLeft, Bold, Code, Eye, FilePlus2, Github, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, LogOut, Minus,
  Pilcrow, Quote, Redo2, RemoveFormatting, Save, Send, Strikethrough, Trash2, Underline, Undo2, Upload, X,
} from "lucide-react";
import {
  NL_CATEGORIES, assetUrl, canPublishHere, deleteDraft, displayHtml, extractImages, getGithub, imageToDataUrl, listDrafts, newId,
  publishPosts, readingMinutes, sanitize, saveDraft, setGithub, slugify, type GithubConfig, type Post,
} from "../lib/newsletter";
import { CoverArt } from "./Newsletter";

const blank = (): Post => ({
  id: newId(), slug: "", title: "", subtitle: "", category: "Finance", tags: [], cover: "", html: "", status: "draft",
  createdAt: Date.now(), updatedAt: Date.now(),
});

type Props = {
  published: Post[];
  onClose: () => void;
  onPublished: (all: Post[]) => void;
  onToast: (m: string) => void;
  onExitAuthor: () => void;
};

export default function NewsletterEditor({ published, onClose, onPublished, onToast, onExitAuthor }: Props) {
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [live, setLive] = useState<Post[]>(published);
  const [post, setPost] = useState<Post>(blank);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [hosted, setHosted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const loadedId = useRef<string>("");

  useEffect(() => {
    listDrafts().then(setDrafts);
    canPublishHere().then(setHosted);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, []);

  // Load a post's HTML into the editable area only when switching posts (keeps the caret stable while typing).
  useEffect(() => {
    if (bodyRef.current && loadedId.current !== post.id) {
      bodyRef.current.innerHTML = post.html ? displayHtml(post.html) : "";
      loadedId.current = post.id;
    }
  }, [post.id, post.html, preview]);

  // Autosave the draft two seconds after the last change.
  useEffect(() => {
    if (!post.title && !post.html) return;
    setSaved("saving");
    const t = window.setTimeout(async () => {
      await saveDraft({ ...post, status: "draft" });
      setSaved("saved");
      setDrafts(await listDrafts());
    }, 1500);
    return () => window.clearTimeout(t);
  }, [post]);

  const update = (patch: Partial<Post>) => setPost((p) => ({ ...p, ...patch, updatedAt: Date.now() }));
  // Image paths are stored relative; in the editor they render with the site's base URL.
  const readBody = () => (bodyRef.current ? bodyRef.current.innerHTML.replace(/src="[^"]*?(newsletter\/img\/[^"]+)"/g, 'src="$1"') : post.html);
  const syncBody = () => { if (bodyRef.current && !preview) update({ html: readBody() }); };

  const exec = (cmd: string, value?: string) => {
    bodyRef.current?.focus();
    document.execCommand(cmd, false, value);
    syncBody();
  };
  const block = (tag: string) => exec("formatBlock", tag);

  const insertImages = async (files: File[]) => {
    for (const f of files.filter((x) => x.type.startsWith("image/"))) {
      try {
        const data = await imageToDataUrl(f);
        bodyRef.current?.focus();
        document.execCommand("insertHTML", false, `<figure><img src="${data}" alt=""><figcaption>Caption (optional)</figcaption></figure><p><br></p>`);
      } catch (e) {
        setMsg({ kind: "error", text: e instanceof Error ? e.message : "That image couldn't be added." });
      }
    }
    syncBody();
  };

  const onPaste = async (e: ClipboardEvent<HTMLDivElement>) => {
    const imgs = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
    if (imgs.length) { e.preventDefault(); await insertImages(imgs); return; }
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      document.execCommand("insertHTML", false, sanitize(html));
      syncBody();
    }
  };
  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    const imgs = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (imgs.length) { e.preventDefault(); await insertImages(imgs); }
  };

  const addLink = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { setMsg({ kind: "error", text: "Select the words you want to turn into a link first." }); return; }
    setLinkOpen(true);
  };
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const savedRange = useRef<Range | null>(null);
  useEffect(() => {
    if (linkOpen) { const s = window.getSelection(); savedRange.current = s && s.rangeCount ? s.getRangeAt(0).cloneRange() : null; }
  }, [linkOpen]);
  const applyLink = () => {
    const s = window.getSelection();
    if (savedRange.current && s) { s.removeAllRanges(); s.addRange(savedRange.current); }
    if (/^(https?:\/\/|mailto:)/i.test(linkUrl.trim())) exec("createLink", linkUrl.trim());
    setLinkOpen(false);
    setLinkUrl("https://");
  };

  const setCover = async (f?: File | null) => {
    if (!f) return;
    try { update({ cover: await imageToDataUrl(f, 1800) }); } catch { setMsg({ kind: "error", text: "That cover image couldn't be read." }); }
  };

  const openPost = (p: Post) => {
    loadedId.current = "";
    setPost({ ...p });
    setPreview(false);
    setMsg(null);
    setConfirmDelete(false);
    setSideOpen(false);
  };
  const newPost = () => openPost(blank());

  const words = useMemo(() => post.html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length, [post.html]);

  const doPublish = async (unpublish = false) => {
    setMsg(null);
    const bodyWords = (preview ? post.html : readBody()).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    if (!unpublish) {
      if (post.title.trim().length < 4) { setMsg({ kind: "error", text: "Give the issue a title first." }); return; }
      if (bodyWords < 20) { setMsg({ kind: "error", text: "Write a little more before publishing (at least 20 words)." }); return; }
    }
    setBusy(true);
    try {
      const html = preview ? post.html : readBody();
      const prepared: Post = { ...post, html: sanitize(html), slug: post.slug || slugify(post.title), status: unpublish ? "draft" : "published", publishedAt: unpublish ? post.publishedAt : post.publishedAt ?? Date.now(), updatedAt: Date.now() };
      const { post: finalPost, files } = unpublish ? { post: prepared, files: {} } : extractImages(prepared);
      const others = live.filter((p) => p.id !== post.id);
      const next = unpublish ? others : [finalPost, ...others];
      const route = await publishPosts(next, files, unpublish ? `Unpublish "${post.title}"` : `"${post.title}"`);
      setLive(next);
      onPublished(next);
      if (unpublish) { await saveDraft({ ...prepared, status: "draft" }); }
      else { await deleteDraft(post.id); loadedId.current = ""; setPost(finalPost); }
      setDrafts(await listDrafts());
      setMsg({ kind: "ok", text: unpublish ? "Issue taken down and kept as a draft." : route === "github" ? "Published to GitHub. The live site updates in about two minutes." : "Published. Visitors see it now." });
      onToast(unpublish ? "Issue unpublished" : "Issue published");
    } catch (e) {
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "Publishing failed. Your draft is safe in this browser." });
    } finally {
      setBusy(false);
    }
  };

  const removeDraft = async () => {
    if (live.some((p) => p.id === post.id)) { await doPublish(true); }
    await deleteDraft(post.id);
    setDrafts(await listDrafts());
    newPost();
    setConfirmDelete(false);
    onToast("Draft deleted");
  };

  const isLive = live.some((p) => p.id === post.id);
  const sideList = [...drafts.filter((d) => !live.some((l) => l.id === d.id)), ...live];

  return (
    <div role="dialog" aria-modal="true" aria-label="Newsletter editor" className="fade-in fixed inset-0 z-[90] flex flex-col bg-bg" style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {/* Top bar */}
      <header className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2.5 sm:px-5">
        <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-fg"><ArrowLeft size={15} /> Back to site</button>
        <button type="button" onClick={() => setSideOpen((v) => !v)} className="rounded-full border border-line px-3 py-1.5 text-sm text-fg lg:hidden">Issues</button>
        <span className="hidden text-xs text-muted sm:inline">{saved === "saving" ? "Saving draft…" : saved === "saved" ? "Draft saved in this browser" : ""}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => { syncBody(); setPreview((v) => { if (v) loadedId.current = ""; return !v; }); }} aria-pressed={preview} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${preview ? "border-accent text-accent" : "border-line text-fg hover:border-accent"}`}><Eye size={14} /> {preview ? "Back to editing" : "Preview"}</button>
          <button type="button" onClick={async () => { syncBody(); await saveDraft({ ...post, status: "draft" }); setDrafts(await listDrafts()); onToast("Draft saved"); }} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-fg hover:border-accent"><Save size={14} /> Save draft</button>
          {isLive && <button type="button" disabled={busy} onClick={() => doPublish(true)} className="rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:border-neg hover:text-neg disabled:opacity-50">Unpublish</button>}
          <button type="button" disabled={busy} onClick={() => { syncBody(); doPublish(false); }} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-accent-2 px-4 py-1.5 text-sm font-semibold text-accent-ink disabled:opacity-60">
            <Send size={14} /> {busy ? "Publishing…" : isLive ? "Update issue" : "Publish"}
          </button>
        </div>
      </header>
      {msg && (
        <div className={`flex items-start gap-2 px-5 py-2 text-sm ${msg.kind === "ok" ? "bg-pos/10 text-fg" : "bg-neg/10 text-fg"}`} role="status">
          <span className="flex-1">{msg.text}</span>
          <button type="button" onClick={() => setMsg(null)} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className={`${sideOpen ? "flex" : "hidden"} absolute inset-y-0 left-0 z-20 mt-[3.25rem] w-72 flex-col border-r border-line bg-surface lg:static lg:mt-0 lg:flex`}>
          <div className="p-4">
            <button type="button" onClick={newPost} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-accent/60 px-3 py-2.5 text-sm font-semibold text-accent hover:bg-accent/10"><FilePlus2 size={15} /> New issue</button>
          </div>
          <p className="ticker px-4 text-muted">Your issues</p>
          <ul className="mt-2 flex-1 overflow-y-auto px-2">
            {sideList.length === 0 && <li className="px-2 py-3 text-sm text-muted">No issues yet. Start writing on the right.</li>}
            {sideList.map((p) => {
              const isPub = live.some((l) => l.id === p.id);
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => openPost(drafts.find((d) => d.id === p.id) ?? p)} className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ${p.id === post.id ? "bg-surface-2" : "hover:bg-surface-2/60"}`}>
                    <span className="block truncate text-sm font-medium text-fg">{p.title || "Untitled issue"}</span>
                    <span className={`mt-0.5 inline-flex items-center gap-1 text-[0.7rem] ${isPub ? "text-pos" : "text-muted"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isPub ? "bg-pos" : "bg-muted"}`} /> {isPub ? "Published" : "Draft"} · {new Date(p.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="grid gap-1 border-t border-line p-3 text-sm">
            <button type="button" onClick={() => setShowSettings(true)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-muted hover:bg-surface-2 hover:text-fg"><Github size={15} /> Publishing settings</button>
            <button type="button" onClick={onExitAuthor} className="flex items-center gap-2 rounded-lg px-2 py-2 text-muted hover:bg-surface-2 hover:text-fg"><LogOut size={15} /> Leave author mode</button>
          </div>
        </aside>

        {/* Canvas */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 pb-32 pt-6 sm:px-8">
            {preview ? (
              <article>
                <p className="ticker text-accent">{post.category}</p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-fg sm:text-5xl">{post.title || "Untitled issue"}</h1>
                {post.subtitle && <p className="mt-3 text-xl text-muted">{post.subtitle}</p>}
                {post.cover && <img src={assetUrl(post.cover)} alt="" className="mt-6 w-full rounded-2xl border border-line" />}
                <div className="prose-nl mt-8" dangerouslySetInnerHTML={{ __html: displayHtml(post.html) }} />
              </article>
            ) : (
              <>
                {/* Cover */}
                <div className="group relative mb-6 aspect-[21/9] overflow-hidden rounded-2xl border border-dashed border-line bg-surface"
                  onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setCover(e.dataTransfer.files[0]); }}>
                  {post.cover ? <img src={assetUrl(post.cover)} alt="" className="h-full w-full object-cover" /> : <CoverArt title={post.title || "New issue"} />}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-bg/40 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <button type="button" onClick={() => coverRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-full bg-bg/90 px-4 py-2 text-sm text-fg"><Upload size={14} /> {post.cover ? "Change cover" : "Add a cover image"}</button>
                    {post.cover && <button type="button" onClick={() => update({ cover: "" })} className="rounded-full bg-bg/90 px-3 py-2 text-sm text-muted">Remove</button>}
                  </div>
                  <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => { setCover(e.target.files?.[0]); e.target.value = ""; }} />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label htmlFor="nl-cat" className="sr-only">Category</label>
                  <select id="nl-cat" value={post.category} onChange={(e) => update({ category: e.target.value })} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-fg focus:border-accent focus:outline-none">
                    {NL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <span className="text-xs text-muted">{words} words · {readingMinutes(post.html)} min read</span>
                </div>
                <label htmlFor="nl-title" className="sr-only">Title</label>
                <textarea id="nl-title" rows={1} value={post.title} onChange={(e) => update({ title: e.target.value })} placeholder="Issue title"
                  className="mt-4 w-full resize-none bg-transparent font-display text-4xl leading-tight text-fg placeholder:text-muted/60 focus:outline-none sm:text-5xl" style={{ fieldSizing: "content" } as CSSProperties} />
                <label htmlFor="nl-sub" className="sr-only">Subtitle</label>
                <input id="nl-sub" value={post.subtitle} onChange={(e) => update({ subtitle: e.target.value })} placeholder="A one-line subtitle (optional)"
                  className="mt-2 w-full bg-transparent text-xl text-muted placeholder:text-muted/50 focus:outline-none" />

                {/* Toolbar */}
                <div role="toolbar" aria-label="Formatting" className="sticky top-0 z-10 mt-6 flex flex-wrap items-center gap-0.5 rounded-2xl border border-line bg-surface/95 p-1.5 shadow-lg backdrop-blur">
                  <Tb label="Paragraph" onClick={() => block("p")}><Pilcrow size={15} /></Tb>
                  <Tb label="Heading" onClick={() => block("h2")}><Heading2 size={15} /></Tb>
                  <Tb label="Subheading" onClick={() => block("h3")}><Heading3 size={15} /></Tb>
                  <Sep />
                  <Tb label="Bold (Ctrl+B)" onClick={() => exec("bold")}><Bold size={15} /></Tb>
                  <Tb label="Italic (Ctrl+I)" onClick={() => exec("italic")}><Italic size={15} /></Tb>
                  <Tb label="Underline (Ctrl+U)" onClick={() => exec("underline")}><Underline size={15} /></Tb>
                  <Tb label="Strikethrough" onClick={() => exec("strikeThrough")}><Strikethrough size={15} /></Tb>
                  <Sep />
                  <Tb label="Bulleted list" onClick={() => exec("insertUnorderedList")}><List size={15} /></Tb>
                  <Tb label="Numbered list" onClick={() => exec("insertOrderedList")}><ListOrdered size={15} /></Tb>
                  <Tb label="Quote" onClick={() => block("blockquote")}><Quote size={15} /></Tb>
                  <Tb label="Code block" onClick={() => block("pre")}><Code size={15} /></Tb>
                  <Tb label="Divider" onClick={() => exec("insertHorizontalRule")}><Minus size={15} /></Tb>
                  <Sep />
                  <Tb label="Link" onClick={addLink}><Link2 size={15} /></Tb>
                  <Tb label="Insert image" onClick={() => fileRef.current?.click()}><ImagePlus size={15} /></Tb>
                  <Tb label="Clear formatting" onClick={() => exec("removeFormat")}><RemoveFormatting size={15} /></Tb>
                  <Sep />
                  <Tb label="Undo" onClick={() => exec("undo")}><Undo2 size={15} /></Tb>
                  <Tb label="Redo" onClick={() => exec("redo")}><Redo2 size={15} /></Tb>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { insertImages(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
                </div>
                {linkOpen && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-2">
                    <label htmlFor="nl-link" className="text-xs text-muted">Link to</label>
                    <input id="nl-link" autoFocus value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyLink()} className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-2 py-1 text-sm text-fg focus:border-accent focus:outline-none" />
                    <button type="button" onClick={applyLink} className="rounded-lg bg-accent px-3 py-1 text-sm font-semibold text-accent-ink">Add link</button>
                    <button type="button" onClick={() => setLinkOpen(false)} className="text-sm text-muted">Cancel</button>
                  </div>
                )}

                <div
                  ref={bodyRef}
                  contentEditable
                  suppressContentEditableWarning
                  role="textbox"
                  aria-multiline="true"
                  aria-label="Issue body"
                  data-placeholder="Start writing… Paste text from Word or Google Docs, or paste and drop pictures straight in."
                  onInput={syncBody}
                  onBlur={syncBody}
                  onPaste={onPaste}
                  onDrop={onDrop}
                  className="prose-nl editor-body mt-6 min-h-[50vh] rounded-xl focus:outline-none"
                />

                <div className="mt-8 border-t border-line pt-4">
                  <label htmlFor="nl-tags" className="text-sm text-fg">Tags <span className="text-muted">(comma separated)</span></label>
                  <input id="nl-tags" value={post.tags.join(", ")} onChange={(e) => update({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8) })} placeholder="valuation, banking, case study"
                    className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none" />
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  {confirmDelete ? (
                    <span className="flex items-center gap-2 text-sm">
                      <span className="text-fg">{isLive ? "Unpublish and delete this issue?" : "Delete this draft?"}</span>
                      <button type="button" onClick={removeDraft} className="rounded-full bg-neg px-3 py-1 text-xs font-semibold text-bg">Delete</button>
                      <button type="button" onClick={() => setConfirmDelete(false)} className="text-xs text-muted">Keep it</button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-neg"><Trash2 size={14} /> Delete issue</button>
                  )}
                  <span className="text-xs text-muted">{hosted ? "Publishing route: this page" : getGithub() ? "Publishing route: GitHub" : "Set up publishing in the sidebar"}</span>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {showSettings && <Settings hosted={hosted} onClose={() => setShowSettings(false)} onToast={onToast} />}
    </div>
  );
}

function Tb({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg">
      {children}
    </button>
  );
}
const Sep = () => <span className="mx-1 h-5 w-px bg-line" aria-hidden />;

function Settings({ hosted, onClose, onToast }: { hosted: boolean; onClose: () => void; onToast: (m: string) => void }) {
  const cur = getGithub();
  const [cfg, setCfg] = useState<GithubConfig>(cur ?? { owner: "ritam45-debug", repo: "Ritam-Portfolio", branch: "main", token: "" });
  const [show, setShow] = useState(false);
  const save = useCallback(() => {
    if (!cfg.token.trim()) { setGithub(null); onToast("GitHub publishing disconnected"); onClose(); return; }
    setGithub({ ...cfg, token: cfg.token.trim() });
    onToast("GitHub publishing connected in this browser");
    onClose();
  }, [cfg, onClose, onToast]);

  const field = "mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none";
  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-bg/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="pub-h">
      <div className="fade-in w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="pub-h" className="font-display text-2xl text-fg">Publishing settings</h2>
          <button type="button" onClick={onClose} aria-label="Close"><X size={18} className="text-muted" /></button>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-muted">
          <p><span className="font-semibold text-fg">On the Claude-hosted page:</span> {hosted ? "you're signed in as an editor, so Publish saves straight to the page." : "open the page while signed in to Claude as its owner to publish from there."}</p>
          <p><span className="font-semibold text-fg">On GitHub Pages:</span> Publish commits the issue to your repo and the site rebuilds in about two minutes. Paste a fine-grained GitHub token with <em>Contents: Read and write</em> access to this repo only. It is stored only in this browser.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-muted sm:col-span-1">Owner<input className={field} value={cfg.owner} onChange={(e) => setCfg({ ...cfg, owner: e.target.value })} /></label>
          <label className="text-xs text-muted sm:col-span-1">Repository<input className={field} value={cfg.repo} onChange={(e) => setCfg({ ...cfg, repo: e.target.value })} /></label>
          <label className="text-xs text-muted sm:col-span-1">Branch<input className={field} value={cfg.branch} onChange={(e) => setCfg({ ...cfg, branch: e.target.value })} /></label>
        </div>
        <label className="mt-3 block text-xs text-muted">GitHub token
          <div className="flex gap-2">
            <input className={field} type={show ? "text" : "password"} autoComplete="off" value={cfg.token} onChange={(e) => setCfg({ ...cfg, token: e.target.value })} placeholder="github_pat_…" />
            <button type="button" onClick={() => setShow((v) => !v)} className="mt-1 rounded-lg border border-line px-3 text-xs text-fg">{show ? "Hide" : "Show"}</button>
          </div>
        </label>
        <p className="mt-2 text-xs text-muted">Create one at github.com → Settings → Developer settings → Fine-grained tokens → Only select repositories → {cfg.repo} → Contents: Read and write.</p>
        <div className="mt-5 flex justify-end gap-2">
          {cur && <button type="button" onClick={() => { setGithub(null); onToast("GitHub publishing disconnected"); onClose(); }} className="rounded-full border border-line px-4 py-2 text-sm text-muted">Disconnect</button>}
          <button type="button" onClick={save} className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-2 text-sm font-semibold text-accent-ink">Save</button>
        </div>
      </div>
    </div>
  );
}
