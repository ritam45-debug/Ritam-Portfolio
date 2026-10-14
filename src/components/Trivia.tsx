import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Flame, Megaphone, RefreshCw, TrendingUp, Trophy, X } from "lucide-react";
import { nextQuestion, triviaStats, type Deck, type TriviaQuestion } from "../content/trivia";
import { SectionHeader } from "./ui";
import { spotMove } from "./work/shared";

const LETTERS = ["A", "B", "C", "D"];
const RECENT_MAX = 30;

function loadBest(deck: Deck): number {
  try { return Number(localStorage.getItem(`rd-trivia-best-${deck}`)) || 0; } catch { return 0; }
}
function saveBest(deck: Deck, v: number) {
  try { localStorage.setItem(`rd-trivia-best-${deck}`, String(v)); } catch { /* ignore */ }
}

function TriviaCard({ deck }: { deck: Deck }) {
  const recent = useRef<string[]>([]);
  const fresh = useCallback(() => {
    const q = nextQuestion(deck, recent.current);
    recent.current = [q.key, ...recent.current].slice(0, RECENT_MAX);
    return q;
  }, [deck]);

  const [q, setQ] = useState<TriviaQuestion>(() => fresh());
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState({ right: 0, asked: 0, streak: 0 });
  const [best, setBest] = useState(() => loadBest(deck));
  const [n, setN] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);

  const answered = chosen !== null;
  const correct = answered && chosen === q.answer;
  const accent = "var(--accent)"; // marketing cards remap --accent to the second theme colour below

  const choose = useCallback((i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    const ok = i === q.answer;
    setScore((s) => {
      const streak = ok ? s.streak + 1 : 0;
      if (streak > best) { setBest(streak); saveBest(deck, streak); }
      return { right: s.right + (ok ? 1 : 0), asked: s.asked + 1, streak };
    });
  }, [chosen, q.answer, best, deck]);

  const next = useCallback(() => {
    setQ(fresh());
    setChosen(null);
    setN((v) => v + 1);
  }, [fresh]);

  // Keyboard: 1–4 or A–D to answer, Enter / N for next, while the pointer or focus is in this card.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = cardRef.current;
      if (!el || !(el.matches(":hover") || el.contains(document.activeElement))) return;
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      const idx = ["1", "2", "3", "4"].indexOf(k) >= 0 ? Number(k) - 1 : ["a", "b", "c", "d"].indexOf(k);
      if (idx >= 0 && !answered) { e.preventDefault(); choose(idx); }
      else if ((k === "enter" || k === "n") && answered) { e.preventDefault(); next(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [answered, choose, next]);

  const Icon = deck === "finance" ? TrendingUp : Megaphone;
  const stats = deck === "finance"
    ? `${triviaStats.finance.calcTemplates} number-crunching templates, ${triviaStats.finance.glossary} terms and ${triviaStats.finance.facts} facts`
    : `${triviaStats.marketing.calcTemplates} marketing-maths templates, ${triviaStats.marketing.glossary} terms and ${triviaStats.marketing.facts} facts`;

  return (
    <div ref={cardRef} data-tilt="2.5" onMouseMove={spotMove} className="spot edge reveal relative overflow-hidden rounded-3xl p-5 shadow-[0_40px_90px_-60px_var(--accent)] sm:p-8" style={deck === "marketing" ? { ["--accent" as string]: "var(--accent-2)" } : undefined}>
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-25 blur-3xl" style={{ background: accent }} aria-hidden />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl text-accent-ink shadow-[0_0_24px_-6px_var(--accent)]" style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 55%, var(--fg)))` }}>
            <Icon size={20} />
          </span>
          <div>
            <p className="font-display text-2xl leading-none text-fg">{deck === "finance" ? "Finance trivia" : "Marketing trivia"}</p>
            <p className="mt-1 text-xs text-muted">Question {n} · a new one every time</p>
          </div>
        </div>
        <dl className="num flex gap-2 font-mono text-xs">
          <div className="rounded-full border border-line bg-bg px-3 py-1.5"><dt className="sr-only">Score</dt><dd className="text-fg">{score.right}/{score.asked}</dd></div>
          <div className="flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-1.5" title="Current streak"><Flame size={12} className={score.streak ? "text-amber" : "text-muted"} /><dt className="sr-only">Streak</dt><dd className="text-fg">{score.streak}</dd></div>
          <div className="flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-1.5" title="Best streak on this device"><Trophy size={12} className="text-muted" /><dt className="sr-only">Best streak</dt><dd className="text-fg">{best}</dd></div>
        </dl>
      </div>

      <div key={q.key + n} className="rise relative mt-6">
        <p className="ticker" style={{ color: accent }}>{q.kind}</p>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-fg sm:text-xl">{q.prompt}</h3>

        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2" role="list">
          {q.options.map((opt, i) => {
            const isAnswer = i === q.answer;
            const isChosen = i === chosen;
            const state = !answered ? "idle" : isAnswer ? "right" : isChosen ? "wrong" : "dim";
            return (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => choose(i)}
                  disabled={answered}
                  aria-pressed={isChosen}
                  className={`group flex h-full w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-300 ${
                    state === "idle" ? "border-line bg-bg text-fg hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_12px_30px_-18px_var(--accent)]"
                      : state === "right" ? "border-pos bg-pos/10 text-fg shadow-[0_0_0_1px_var(--pos)]"
                        : state === "wrong" ? "border-neg bg-neg/10 text-fg [animation:shake_.4s_ease]"
                          : "border-line bg-bg text-muted opacity-60"
                  }`}
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-xs font-semibold transition-colors ${
                    state === "right" ? "bg-pos text-bg" : state === "wrong" ? "bg-neg text-bg" : "bg-surface-2 text-muted group-hover:bg-accent group-hover:text-accent-ink"
                  }`}>
                    {state === "right" ? <Check size={14} /> : state === "wrong" ? <X size={14} /> : LETTERS[i]}
                  </span>
                  <span className="pt-0.5">{opt}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div aria-live="polite" className="min-h-[1px]">
          {answered && (
            <div className="rise mt-5 flex flex-col gap-4 rounded-2xl border border-line bg-bg p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${correct ? "text-pos" : "text-neg"}`}>
                  {correct ? (score.streak > 2 ? `Correct, ${score.streak} in a row!` : "Correct!") : `Not quite. The answer is ${LETTERS[q.answer]}.`}
                </p>
                <p className="mt-1 text-sm text-muted">{q.explain}</p>
              </div>
              <button type="button" onClick={next} autoFocus className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5" style={{ background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 60%, var(--fg)))` }}>
                Next question <ArrowRight size={15} />
              </button>
            </div>
          )}
          {correct && <Burst color={accent} />}
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted">
        <span>Drawn from {stats}.</span>
        {!answered && (
          <button type="button" onClick={next} className="inline-flex items-center gap-1.5 hover:text-fg"><RefreshCw size={12} /> Skip</button>
        )}
      </div>
    </div>
  );
}

/** A small celebratory burst for correct answers (skipped under reduced motion). */
function Burst({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return (
          <span key={i} className="absolute h-1.5 w-1.5 rounded-full"
            style={{ background: i % 2 ? color : "var(--amber)", animation: "burst .8s ease-out forwards", ["--dx" as string]: `${Math.cos(a) * 140}px`, ["--dy" as string]: `${Math.sin(a) * 90}px` }} />
        );
      })}
    </div>
  );
}

export function Trivia() {
  return (
    <div id="trivia">
      <section id="finance-trivia" aria-labelledby="ft-h" className="relative overflow-hidden border-t border-line">
        <div className="ledger absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 md:py-24">
          <SectionHeader id="ft-h" code="§ 04 · Finance trivia" title="Think like an analyst" lede="Ratios, valuation maths, markets history and terms of the trade. Numbers are generated fresh each time, so no two rounds are the same. Press 1–4 to answer and Enter for the next one." />
          <TriviaCard deck="finance" />
        </div>
      </section>
      <section id="marketing-trivia" aria-labelledby="mt-h" className="relative overflow-hidden border-t border-line bg-surface/40">
        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 md:py-24">
          <SectionHeader id="mt-h" code="§ 05 · Marketing trivia" title="Think like a brand manager" lede="Frameworks, thinkers, unit economics, pricing and Indian retail vocabulary. Numbers are generated fresh, so you get a new question every time, with the reasoning behind each answer." />
          <TriviaCard deck="marketing" />
        </div>
      </section>
    </div>
  );
}
