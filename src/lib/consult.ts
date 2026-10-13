import { profile } from "../content/profile";

const { formEndpoint, notifyTopic } = profile.consult;
const NTFY = "https://ntfy.sh";

export interface ConsultInput {
  name: string;
  email: string;
  topic: string;
  question: string;
}

export interface SiteNotice {
  id: string;
  time: number; // unix seconds
  title: string;
  message: string;
}

/**
 * Sends the question to Ritam's inbox via FormSubmit.
 * Resolves to "sent", "activation" (first-ever submission: FormSubmit emails
 * the owner an activation link before it delivers anything) or throws.
 */
export async function sendQuestion(input: ConsultInput): Promise<"sent" | "activation"> {
  const res = await fetch(formEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      topic: input.topic || "Not specified",
      question: input.question,
      _replyto: input.email,
      _subject: `Portfolio consulting question: ${input.topic || "General"}`,
      _template: "table",
      _captcha: "false",
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
  const ok = data.success === true || data.success === "true";
  if (ok) return "sent";
  if (/activat/i.test(data.message ?? "")) return "activation";
  throw new Error(data.message || `The form service returned an error (${res.status}).`);
}

/** Posts a privacy-safe alert (topic + time only) for the bell and phone push. Never throws. */
export async function publishNotice(topic: string): Promise<void> {
  try {
    // Options go in the query string so the browser sends a simple request (no CORS preflight).
    await fetch(`${NTFY}/${notifyTopic}?title=${encodeURIComponent("New consulting question")}&tags=bell&priority=4`, {
      method: "POST",
      body: `Topic: ${topic || "General"}. Full details are in your email.`,
    });
  } catch {
    /* the email is the record; the alert is best-effort */
  }
}

/** Reads recent alerts. ntfy.sh keeps messages for a limited time (hours, not days). */
export async function fetchNotices(): Promise<SiteNotice[]> {
  const res = await fetch(`${NTFY}/${notifyTopic}/json?poll=1&since=all`);
  if (!res.ok) throw new Error(String(res.status));
  const text = await res.text();
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line) as { id: string; time: number; event: string; title?: string; message?: string }; } catch { return null; }
    })
    .filter((m): m is { id: string; time: number; event: string; title?: string; message?: string } => !!m && m.event === "message")
    .map((m) => ({ id: m.id, time: m.time, title: m.title ?? "New consulting question", message: m.message ?? "" }))
    .sort((a, b) => b.time - a.time);
}

export const ntfyTopicUrl = `${NTFY}/${notifyTopic}`;

/* ── per-visitor storage (best effort) ── */
const SEEN = "rd-notices-seen";
const MINE = "rd-my-questions";

export function getSeen(): string[] {
  try { return JSON.parse(localStorage.getItem(SEEN) ?? "[]"); } catch { return []; }
}
export function setSeen(ids: string[]) {
  try { localStorage.setItem(SEEN, JSON.stringify(ids.slice(0, 200))); } catch { /* ignore */ }
}
export interface MyQuestion { topic: string; time: number; status: "sent" | "activation" }
export function getMine(): MyQuestion[] {
  try { return JSON.parse(localStorage.getItem(MINE) ?? "[]"); } catch { return []; }
}
export function addMine(q: MyQuestion) {
  try { localStorage.setItem(MINE, JSON.stringify([q, ...getMine()].slice(0, 20))); } catch { /* ignore */ }
}

export function timeAgo(unixSeconds: number): string {
  const s = Math.max(0, Math.floor(Date.now() / 1000 - unixSeconds));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
