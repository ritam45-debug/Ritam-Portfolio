import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, RotateCcw, Sparkles } from "lucide-react";
import { suggestedQuestions } from "../content/knowledge";
import { MAX_QUESTION_LENGTH, answerInDemo, askLive, checkLive, validateQuestion, type ChatMessage } from "../lib/assistant";
import { SectionHeader } from "./ui";

const GREETING: ChatMessage = {
  role: "assistant",
  source: "system",
  content: "Hi, I'm Ask Ritam. I answer questions about Ritam's projects, tools, interests and what he's exploring, using only what's on this site.",
};

export function AskRitam() {
  const [live, setLive] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => { checkLive().then(setLive); }, []);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const ask = async (q: string) => {
    const problem = validateQuestion(q);
    if (problem) { setError(problem); return; }
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: q.trim() }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      if (live) {
        const answer = await askLive(next);
        setMessages((m) => [...m, { role: "assistant", content: answer, source: "live" }]);
      } else {
        await new Promise((r) => setTimeout(r, 450));
        setMessages((m) => [...m, { role: "assistant", content: answerInDemo(q), source: "demo" }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setMessages((m) => m.slice(0, -1));
      setInput(q);
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => { e.preventDefault(); if (!busy) ask(input); };

  return (
    <section id="ask" aria-labelledby="ask-h" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <SectionHeader id="ask-h" code="§ 06 · Ask Ritam" title="Ask the portfolio a question" lede="A conversational way to explore the site. Answers come only from the content you can see here, so it won't make things up about me." />

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-accent-ink"><Sparkles size={16} /></span>
              <div>
                <p className="text-sm font-semibold text-fg">Ask Ritam</p>
                <p className="text-xs text-muted">
                  {live === null ? "Checking connection…" : live ? "Live AI · answers grounded in site content" : "Demo mode · predefined answers"}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => { setMessages([GREETING]); setError(null); }} className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-fg" aria-label="Clear chat history">
              <RotateCcw size={12} /> Clear
            </button>
          </div>

          {live === false && (
            <p className="border-b border-line bg-amber/5 px-4 py-2 text-xs text-fg">
              Live AI isn't configured on this deployment. You're talking to a demo that answers from a fixed set of topics.
            </p>
          )}

          <div ref={logRef} role="log" aria-live="polite" aria-label="Conversation" className="flex h-[24rem] flex-col gap-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed ${m.role === "user" ? "self-end rounded-br-sm bg-accent text-accent-ink" : "self-start rounded-bl-sm border border-line bg-bg text-fg"}`}>
                <span className="sr-only">{m.role === "user" ? "You: " : "Ask Ritam: "}</span>
                {m.content}
                {m.source === "demo" && <span className="mt-1.5 block font-mono text-[0.65rem] uppercase tracking-wider text-muted">Demo answer</span>}
              </div>
            ))}
            {busy && (
              <div className="self-start rounded-2xl rounded-bl-sm border border-line bg-bg px-4 py-3" aria-label="Thinking">
                {[0, 1, 2].map((d) => <span key={d} className="mx-0.5 inline-block h-1.5 w-1.5 rounded-full bg-muted" style={{ animation: `blink 1.2s ${d * 0.2}s infinite` }} />)}
              </div>
            )}
          </div>

          <form onSubmit={submit} className="border-t border-line p-3">
            {error && <p className="mb-2 text-sm text-neg" role="alert">{error}</p>}
            <div className="flex items-end gap-2">
              <label htmlFor="ask-input" className="sr-only">Your question</label>
              <textarea
                id="ask-input"
                rows={1}
                value={input}
                maxLength={MAX_QUESTION_LENGTH + 50}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!busy) ask(input); } }}
                placeholder="Ask about projects, tools, interests…"
                className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-md border border-line bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <button type="submit" disabled={busy || !input.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent text-accent-ink disabled:opacity-40" aria-label="Send question">
                <ArrowUp size={18} />
              </button>
            </div>
            <p className={`mt-1 text-right font-mono text-[0.65rem] ${input.length > MAX_QUESTION_LENGTH ? "text-neg" : "text-muted"}`}>{input.length}/{MAX_QUESTION_LENGTH}</p>
          </form>
        </div>

        <aside>
          <p className="ticker text-muted">Try asking</p>
          <ul className="mt-3 grid gap-2">
            {suggestedQuestions.map((q) => (
              <li key={q}>
                <button type="button" disabled={busy} onClick={() => ask(q)} className="w-full rounded-md border border-line px-3 py-2.5 text-left text-sm text-fg transition-colors hover:border-accent hover:bg-surface disabled:opacity-50">
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
