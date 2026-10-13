import { useState, type FormEvent } from "react";
import { Check, Copy, Linkedin, Mail, MessageCircle, Send } from "lucide-react";
import { profile } from "../content/profile";
import { copyText } from "../lib/clipboard";
import { addMine, publishNotice, sendQuestion } from "../lib/consult";
import { SectionHeader } from "./ui";
import { spotMove } from "./work/shared";

type Status = { kind: "idle" | "sending" | "sent" | "activation" | "error"; text?: string; mailto?: string };
const EMPTY = { name: "", email: "", topic: "", question: "", website: "" };

export const whatsappLink = (text = "Hi Ritam, I saw your portfolio and would like to connect.") =>
  `https://wa.me/${profile.contact.whatsapp}?text=${encodeURIComponent(text)}`;

export function Consult({ onToast }: { onToast: (m: string) => void }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const { email, whatsappDisplay, linkedin } = profile.contact;

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Enter a valid email so I can reply, e.g. name@example.com.";
    if (form.question.trim().length < 15) e.question = "Add a little more detail (at least 15 characters).";
    if (form.question.length > 3000) e.question = "Keep it under 3,000 characters.";
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    if (form.website) { setStatus({ kind: "sent", text: "Thanks." }); return; } // spam trap
    setStatus({ kind: "sending" });
    // Prefilled email to Ritam, offered whenever the automatic delivery can't be confirmed.
    const mailto = `mailto:${profile.contact.email}?subject=${encodeURIComponent(`Portfolio question: ${form.topic || "General"}`)}&body=${encodeURIComponent(`${form.question.trim()}\n\nFrom: ${form.name.trim()} (${form.email.trim()})`)}`;
    try {
      const result = await sendQuestion({ name: form.name.trim(), email: form.email.trim(), topic: form.topic, question: form.question.trim() });
      await publishNotice(form.topic);
      addMine({ topic: form.topic || "General", time: Math.floor(Date.now() / 1000), status: result });
      window.dispatchEvent(new Event("rd-notices-refresh"));
      if (result === "sent") setForm(EMPTY);
      setStatus(result === "sent"
        ? { kind: "sent", text: `Question sent. Ritam will reply to ${form.email.trim()} by email.` }
        : { kind: "activation", mailto, text: "The form reached the email service, but delivery to Ritam isn't switched on yet, so your question may not arrive. Send it by email with one click below, or on WhatsApp." });
    } catch {
      setStatus({ kind: "error", mailto, text: "Your question couldn't be sent automatically. Your text is still in the form; send it by email with one click, or use WhatsApp." });
    }
  };

  const field = "w-full rounded-xl border bg-bg px-3.5 py-2.5 text-fg placeholder:text-muted transition-colors focus:border-accent focus:outline-none";

  return (
    <section id="consult" aria-labelledby="consult-h" className="relative overflow-hidden border-t border-line">
      <div className="aurora opacity-60" aria-hidden><span /><span /></div>
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <SectionHeader
          id="consult-h"
          code="§ 06 · Consult"
          title="Ask me a question"
          lede="Working on a valuation, a dashboard or a case and want a second pair of eyes? Leave your question and email, or reach me directly on WhatsApp."
        />

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <form onSubmit={submit} noValidate onMouseMove={spotMove} className="spot edge reveal grid gap-4 rounded-2xl p-5 shadow-[0_30px_80px_-50px_var(--accent)] sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="q-name" className="mb-1.5 block text-sm text-fg">Your name</label>
                <input id="q-name" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "q-name-err" : undefined} className={`${field} ${errors.name ? "border-neg" : "border-line"}`} />
                {errors.name && <p id="q-name-err" className="mt-1 text-xs text-neg">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="q-email" className="mb-1.5 block text-sm text-fg">Your email</label>
                <input id="q-email" type="email" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "q-email-err" : undefined} className={`${field} ${errors.email ? "border-neg" : "border-line"}`} />
                {errors.email && <p id="q-email-err" className="mt-1 text-xs text-neg">{errors.email}</p>}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-sm text-fg" id="q-topic-label">What is it about?</span>
              <div role="radiogroup" aria-labelledby="q-topic-label" className="flex flex-wrap gap-2">
                {profile.consult.topics.map((t) => (
                  <button key={t} type="button" role="radio" aria-checked={form.topic === t} onClick={() => setForm((f) => ({ ...f, topic: f.topic === t ? "" : t }))}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-all ${form.topic === t ? "border-accent bg-accent text-accent-ink shadow-[0_0_16px_-4px_var(--accent)]" : "border-line text-muted hover:border-accent hover:text-fg"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor="q-question" className="text-sm text-fg">Your question</label>
                <span className={`num font-mono text-[0.7rem] ${form.question.length > 3000 ? "text-neg" : "text-muted"}`}>{form.question.length}/3000</span>
              </div>
              <textarea id="q-question" rows={5} value={form.question} onChange={set("question")} placeholder="e.g. How would you approach valuing a mid-cap consumer durables company?" aria-invalid={!!errors.question} aria-describedby={errors.question ? "q-question-err" : undefined} className={`${field} ${errors.question ? "border-neg" : "border-line"}`} />
              {errors.question && <p id="q-question-err" className="mt-1 text-xs text-neg">{errors.question}</p>}
            </div>
            <div className="hidden" aria-hidden>
              <label htmlFor="q-website">Website</label>
              <input id="q-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={status.kind === "sending"} className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-sm font-semibold text-accent-ink shadow-[0_10px_30px_-10px_var(--accent)] transition-all hover:-translate-y-0.5 disabled:opacity-60">
                <Send size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                {status.kind === "sending" ? "Sending…" : "Send question"}
              </button>
              <p className="text-xs text-muted">Your email is used only to reply to you.</p>
            </div>
            <div aria-live="polite">
              {status.text && (
                <p className={`fade-in flex gap-2 rounded-xl border p-3 text-sm ${status.kind === "sent" ? "border-pos/50 text-fg" : status.kind === "error" ? "border-neg/50 text-fg" : "border-amber/50 text-fg"}`}>
                  {status.kind === "sent" && <Check size={16} className="mt-0.5 shrink-0 text-pos" />}
                  <span>
                    {status.text}
                    {status.mailto && (
                      <a href={status.mailto} className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-accent-2 px-3.5 py-1.5 text-xs font-semibold text-accent-ink">
                        <Mail size={13} /> Email this question to Ritam
                      </a>
                    )}
                  </span>
                </p>
              )}
            </div>
          </form>

          <aside className="grid content-start gap-4">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" onMouseMove={spotMove}
              className="spot reveal group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-[#25D366]">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#25D366] text-[#05301a] shadow-[0_0_24px_-6px_#25D366]"><MessageCircle size={22} /></span>
              <span className="min-w-0">
                <span className="block font-semibold text-fg">Chat on WhatsApp</span>
                <span className="num block font-mono text-sm text-muted">{whatsappDisplay}</span>
              </span>
            </a>
            <div onMouseMove={spotMove} className="spot reveal flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-accent-ink"><Mail size={20} /></span>
              <span className="min-w-0 flex-1">
                <a href={`mailto:${email}`} className="block font-semibold text-fg hover:text-accent">Email</a>
                <span className="block select-all break-all font-mono text-sm text-muted">{email}</span>
              </span>
              <button type="button" onClick={async () => onToast((await copyText(email)) ? "Email address copied" : "Couldn't copy. Select the address instead.")}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-fg hover:border-accent">
                <Copy size={12} /> Copy
              </button>
            </div>
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" onMouseMove={spotMove} className="spot reveal flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-blue">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#0a66c2] text-white"><Linkedin size={20} /></span>
                <span><span className="block font-semibold text-fg">Connect on LinkedIn</span><span className="block text-sm text-muted">Ritam Dhara</span></span>
              </a>
            )}
            <p className="reveal text-xs leading-relaxed text-muted">Based in {profile.contact.location}. Open to conversations on finance and valuation, dashboards, case competitions and AI in business.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

/** Floating WhatsApp button, bottom-left on every screen. */
export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with Ritam on WhatsApp, ${profile.contact.whatsappDisplay}`}
      className="float group fixed left-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3 text-[#05301a] shadow-[0_10px_30px_-8px_#25D366] transition-all hover:pr-4"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <MessageCircle size={22} />
      <span className="hidden text-sm font-semibold group-hover:inline">WhatsApp</span>
    </a>
  );
}
