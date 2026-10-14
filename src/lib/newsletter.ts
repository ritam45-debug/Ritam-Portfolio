// ─────────────────────────────────────────────────────────────
// NEWSLETTER STORE
// Published issues live in a plain data file next to the page:
//   newsletter/posts.json   — every published issue
//   newsletter/img/<id>.jpg — pictures used in issues
// Drafts live only in the author's own browser (IndexedDB) until published.
//
// Publishing has two routes, picked automatically:
//   1. Claude-hosted page: the page saves its own files (artifact capability),
//      available to the owner while the page is not shared publicly.
//   2. GitHub Pages: the editor commits the files to the repo with the
//      author's own GitHub token (kept only in that browser); the site
//      redeploys in about two minutes.
// ─────────────────────────────────────────────────────────────

export const NL_CATEGORIES = ["Finance", "Markets", "Valuation", "Strategy", "Marketing", "Careers", "Case notes", "MBA life"] as const;

export interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  cover: string; // relative path or data URL while drafting
  html: string; // sanitised article body
  status: "draft" | "published";
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

export interface PostsFile {
  version: 1;
  posts: Post[];
}

const BASE = import.meta.env.BASE_URL;
export const POSTS_PATH = "newsletter/posts.json";
export const IMG_DIR = "newsletter/img/";

/* ───────── reading ───────── */
export async function loadPublished(): Promise<Post[]> {
  try {
    const res = await fetch(`${BASE}${POSTS_PATH}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as PostsFile;
    return (data.posts ?? []).filter((p) => p && p.status === "published").sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
  } catch {
    return [];
  }
}

export const assetUrl = (src: string) => (src.startsWith("data:") || /^https?:/.test(src) ? src : `${BASE}${src.replace(/^\.?\//, "")}`);

export function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
export function excerpt(html: string, n = 180): string {
  const t = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n).replace(/\s\S*$/, "") + "…" : t;
}
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "issue";
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ───────── sanitising (published content is shared data: treat it as untrusted) ───────── */
const ALLOWED: Record<string, string[]> = {
  P: [], H2: [], H3: [], H4: [], STRONG: [], B: [], EM: [], I: [], U: [], S: [], STRIKE: [], BR: [], HR: [],
  UL: [], OL: [], LI: [], BLOCKQUOTE: [], PRE: [], CODE: [], A: ["href"], IMG: ["src", "alt"], FIGURE: [], FIGCAPTION: [],
  TABLE: [], THEAD: [], TBODY: [], TR: [], TH: [], TD: [], SPAN: [], DIV: [], SUB: [], SUP: [], MARK: [],
};
const RENAME: Record<string, string> = { B: "strong", I: "em", STRIKE: "s", DIV: "p", H1: "h2" };

function safeUrl(url: string, kind: "href" | "src"): string | null {
  const u = url.trim();
  if (kind === "href") return /^(https?:|mailto:|#)/i.test(u) ? u : null;
  if (/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(u)) return u;
  if (/^https:\/\//i.test(u)) return u;
  if (/^(\.\/)?newsletter\/img\/[\w.-]+$/.test(u)) return u.replace(/^\.\//, "");
  return null;
}

export function sanitize(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const out = document.createElement("div");
  const walk = (src: Node, dest: Node) => {
    src.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) { dest.appendChild(document.createTextNode(node.textContent ?? "")); return; }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as HTMLElement;
      let tag = el.tagName === "H1" ? "H2" : el.tagName;
      if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "META", "LINK", "NOSCRIPT", "TEMPLATE"].includes(tag)) return;
      if (!(tag in ALLOWED) && tag !== "H1") { walk(el, dest); return; } // unwrap unknown tags, keep their text
      const name = (RENAME[tag] ?? tag).toLowerCase();
      tag = name.toUpperCase();
      const clean = document.createElement(name);
      for (const attr of ALLOWED[tag] ?? []) {
        const v = el.getAttribute(attr);
        if (v == null) continue;
        if (attr === "href" || attr === "src") {
          const ok = safeUrl(v, attr);
          if (ok) clean.setAttribute(attr, ok);
        } else clean.setAttribute(attr, v.slice(0, 300));
      }
      if (name === "a") { clean.setAttribute("target", "_blank"); clean.setAttribute("rel", "noopener noreferrer nofollow"); }
      if (name === "img" && !clean.getAttribute("src")) return;
      if (name === "img") clean.setAttribute("loading", "lazy");
      walk(el, clean);
      dest.appendChild(clean);
    });
  };
  walk(doc.body, out);
  return out.innerHTML;
}

/** Rewrites stored relative image paths to loadable URLs for display. */
export function displayHtml(html: string): string {
  return sanitize(html).replace(/(<img[^>]+src=")(newsletter\/img\/[^"]+)"/g, (_m, a, p) => `${a}${assetUrl(p)}"`);
}

/* ───────── images ───────── */
/** Downscales an image file to a web-friendly JPEG data URL (max 1600px wide). */
export async function imageToDataUrl(file: Blob, maxW = 1600): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("This image couldn't be read."));
      i.src = url;
    });
    const scale = Math.min(1, maxW / img.naturalWidth);
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function dataUrlToBlob(d: string): Blob {
  const [head, b64] = d.split(",");
  const type = head.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type });
}

/** Moves inline data-URL images out into files; returns the rewritten post and the files to write. */
export function extractImages(post: Post): { post: Post; files: Record<string, Blob> } {
  const files: Record<string, Blob> = {};
  const take = (d: string) => {
    const path = `${IMG_DIR}${post.id}-${newId()}.jpg`;
    files[path] = dataUrlToBlob(d);
    return path;
  };
  const html = post.html.replace(/src="(data:image\/[^"]+)"/g, (_m, d) => `src="${take(d)}"`);
  const cover = post.cover.startsWith("data:") ? take(post.cover) : post.cover;
  return { post: { ...post, html, cover }, files };
}

/* ───────── drafts (author's browser only) ───────── */
const DB = "rd-newsletter";
function idb(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("drafts", { keyPath: "id" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
export async function listDrafts(): Promise<Post[]> {
  try {
    const db = await idb();
    return await new Promise((res) => {
      const q = db.transaction("drafts").objectStore("drafts").getAll();
      q.onsuccess = () => res((q.result as Post[]).sort((a, b) => b.updatedAt - a.updatedAt));
      q.onerror = () => res([]);
    });
  } catch { return []; }
}
export async function saveDraft(p: Post): Promise<boolean> {
  try {
    const db = await idb();
    return await new Promise((res) => {
      const tx = db.transaction("drafts", "readwrite");
      tx.objectStore("drafts").put(p);
      tx.oncomplete = () => res(true);
      tx.onerror = () => res(false);
    });
  } catch { return false; }
}
export async function deleteDraft(id: string): Promise<void> {
  try {
    const db = await idb();
    db.transaction("drafts", "readwrite").objectStore("drafts").delete(id);
  } catch { /* ignore */ }
}

/* ───────── publishing ───────── */
type ArtifactNs = { publish: (files: Record<string, unknown>) => Promise<unknown> };
type UserNs = { isOwner: () => Promise<boolean>; canEdit: () => Promise<boolean> };

async function useCap<T>(name: string): Promise<T | null> {
  const c = (window as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
  if (!c?.use) return null;
  try { return (await c.use(name)) as T | null; } catch { return null; }
}

/** True when this viewer may publish from inside a Claude-hosted page. */
export async function canPublishHere(): Promise<boolean> {
  const user = await useCap<UserNs>("user");
  if (!user) return false;
  try { return (await user.canEdit()) || (await user.isOwner()); } catch { return false; }
}

export interface GithubConfig { owner: string; repo: string; branch: string; token: string }
const GH_KEY = "rd-gh-config";
export function getGithub(): GithubConfig | null {
  try { const v = JSON.parse(localStorage.getItem(GH_KEY) ?? "null"); return v?.token ? v : null; } catch { return null; }
}
export function setGithub(c: GithubConfig | null) {
  try { if (c) localStorage.setItem(GH_KEY, JSON.stringify(c)); else localStorage.removeItem(GH_KEY); } catch { /* ignore */ }
}

async function blobToBase64(b: Blob): Promise<string> {
  const buf = new Uint8Array(await b.arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}

async function githubPut(cfg: GithubConfig, path: string, content: Blob | string, message: string) {
  const api = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/public/${path}`;
  const headers = { Authorization: `Bearer ${cfg.token}`, Accept: "application/vnd.github+json" };
  let sha: string | undefined;
  const head = await fetch(`${api}?ref=${encodeURIComponent(cfg.branch)}`, { headers });
  if (head.ok) sha = ((await head.json()) as { sha?: string }).sha;
  else if (head.status === 401 || head.status === 403) throw new Error("GitHub refused the token. Check it has Contents: read and write access to this repo.");
  const b64 = typeof content === "string" ? await blobToBase64(new Blob([content], { type: "application/json" })) : await blobToBase64(content);
  const res = await fetch(api, { method: "PUT", headers, body: JSON.stringify({ message, content: b64, branch: cfg.branch, ...(sha ? { sha } : {}) }) });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(`GitHub: ${err.message ?? res.status}`);
  }
}

export type PublishRoute = "artifact" | "github";

/**
 * Writes the full posts file plus any new images.
 * Tries the Claude-hosted route first, then GitHub. Throws with a readable message if neither works.
 */
export async function publishPosts(all: Post[], images: Record<string, Blob>, note: string): Promise<PublishRoute> {
  const body: PostsFile = { version: 1, posts: all.filter((p) => p.status === "published") };
  const json = JSON.stringify(body, null, 1);

  const art = await useCap<ArtifactNs>("artifact");
  if (art) {
    try {
      await art.publish({ [POSTS_PATH]: { content: json, contentType: "application/json" }, ...images });
      return "artifact";
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === "conflict") throw new Error("Someone else saved the page a moment ago. It will reload; publish again after it does.");
      if (!getGithub()) {
        if (code === "capability_disabled") throw new Error("Saving from the page is switched off while the page is shared publicly. Turn off public sharing for a moment, publish, then share again, or connect GitHub below.");
        if (code === "not_writer" || code === "not_granted") throw new Error("Only the site owner can publish issues.");
        throw new Error("The page couldn't save just now. Try again in a minute.");
      }
    }
  }

  const gh = getGithub();
  if (gh) {
    for (const [path, blob] of Object.entries(images)) await githubPut(gh, path, blob, `Newsletter image for ${note}`);
    await githubPut(gh, POSTS_PATH, json, `Newsletter: ${note}`);
    return "github";
  }
  throw new Error("No publishing route is set up in this browser. Connect GitHub in the editor's Publishing settings.");
}
