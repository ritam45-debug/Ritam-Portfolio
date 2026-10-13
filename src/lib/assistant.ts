import { demoAnswer } from "../content/knowledge";

export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
  source?: "demo" | "live" | "system";
}

export const MAX_QUESTION_LENGTH = 500;

/** Checks whether the server-side AI endpoint is configured. Never throws. */
export async function checkLive(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch("/api/health", { signal: ctrl.signal, headers: { Accept: "application/json" } });
    clearTimeout(timer);
    if (!res.ok) return false;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("application/json")) return false;
    const data = (await res.json()) as { live?: boolean };
    return data.live === true;
  } catch {
    return false;
  }
}

export function validateQuestion(q: string): string | null {
  const trimmed = q.trim();
  if (!trimmed) return "Type a question first.";
  if (trimmed.length > MAX_QUESTION_LENGTH) return `Keep questions under ${MAX_QUESTION_LENGTH} characters.`;
  return null;
}

export function answerInDemo(q: string): string {
  return (
    demoAnswer(q) ??
    "I'm running in demo mode, so I can only answer from a fixed set of topics: Ritam's projects, tools, approach to financial analysis, what he's exploring, the analytics playground, education, interests and how to get in touch. Try one of the suggested questions."
  );
}

export async function askLive(history: ChatMessage[]): Promise<string> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: history.filter((m) => m.source !== "system").slice(-10).map(({ role, content }) => ({ role, content })),
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
  if (!res.ok || !data.answer) throw new Error(data.error ?? `The assistant returned an error (${res.status}).`);
  return data.answer;
}
