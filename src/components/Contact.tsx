import { useState, type FormEvent } from "react";
import { Copy, Linkedin, Mail, Send } from "lucide-react";
import { profile } from "../content/profile";
import { copyText } from "../lib/clipboard";
import { SectionHeader } from "./ui";

const ENDPOINT = (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined)?.trim() ?? "";
type Status = { kind: "idle" | "sending" | "ok" | "error" | "unconfigured"; text?: string };

export function Contact({ onToast }: { onToast: (m: string) => void }) {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "", company: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const { email, linkedin, collaborationTopics } = profile.contact;

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Enter a valid email address, like name@example.com.";
    if (form.message.trim().length < 10) e.message = "Write at least 10 characters so I know what it's about.";
    if (form.message.length > 2000) e.message = "Keep the message under 2,000 characters.";
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { setStatus({ kind: "idle" }); return; }
    if (form.company) { setStatus({ kind: "ok", text: "Thanks." }); return; } // honeypot
    if (!ENDPOINT) {
      setStatus({ kind: "unconfigured", text: "Your message was not sent: the contact form isn't connected to a delivery service yet." + (email ? " Please email directly using the address on the right." : " Please reach out on LinkedIn or try again later.") });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), topic: form.topic, message: form.message.trim() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus({ kind: "ok", text: "Message sent. Thanks for reaching out; I'll reply by email." });
      setForm({ name: "", email: "", topic: "", message: "", company: "" });
    } catch {
      setStatus({ kind: "error", text: "The message couldn't be sent. Check your connection and try again." });
    }
  };

  const field = "w-full rounded-md border bg-bg px-3 py-2.5 text-fg placeholder:text-muted focus:border-accent focus:outline-none";
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <section id="contact" aria-labelledby="contact-h" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <SectionHeader id="contact-h" code="§ 08 · Contact" title="Let's work on something" lede="Questions about a project, a case to crack together, or a conversation about finance, data and AI." />
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <form onSubmit={submit} noValidate className="grid gap-4 rounded-xl border border-line bg-surface p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="c-name" className="mb-1.5 block text-sm text-fg">Name</label>
              <input id="c-name" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "c-name-err" : undefined} className={`${field} ${errors.name ? "border-neg" : "border-line"}`} />
              {errors.name && <p id="c-name-err" className="mt-1 text-xs text-neg">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="c-email" className="mb-1.5 block text-sm text-fg">Email</label>
              <input id="c-email" type="email" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "c-email-err" : undefined} className={`${field} ${errors.email ? "border-neg" : "border-line"}`} />
              {errors.email && <p id="c-email-err" className="mt-1 text-xs text-neg">{errors.email}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="c-topic" className="mb-1.5 block text-sm text-fg">Topic <span className="text-muted">(optional)</span></label>
            <select id="c-topic" value={form.topic} onChange={set("topic")} className={`${field} border-line`}>
              <option value="">Choose a topic</option>
              {collaborationTopics.map((t) => <option key={t}>{t}</option>)}
              <option>Something else</option>
            </select>
          </div>
          <div>
            <label htmlFor="c-message" className="mb-1.5 block text-sm text-fg">Message</label>
            <textarea id="c-message" rows={5} value={form.message} onChange={set("message")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "c-message-err" : undefined} className={`${field} ${errors.message ? "border-neg" : "border-line"}`} />
            {errors.message && <p id="c-message-err" className="mt-1 text-xs text-neg">{errors.message}</p>}
          </div>
          <div className="hidden" aria-hidden>
            <label htmlFor="c-company">Company</label>
            <input id="c-company" tabIndex={-1} autoComplete="off" value={form.company} onChange={set("company")} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={status.kind === "sending"} className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink disabled:opacity-50">
              <Send size={15} /> {status.kind === "sending" ? "Sending…" : "Send message"}
            </button>
            {!ENDPOINT && <p className="text-xs text-muted">Form delivery not configured yet</p>}
          </div>
          <div aria-live="polite">
            {status.text && (
              <p className={`rounded-md border p-3 text-sm ${status.kind === "ok" ? "border-accent/50 text-fg" : status.kind === "error" ? "border-neg/50 text-neg" : "border-amber/50 text-fg"}`}>{status.text}</p>
            )}
          </div>
        </form>

        <aside className="grid content-start gap-6">
          <div className="grid gap-3">
            <p className="ticker text-muted">Direct</p>
            {email ? (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-4">
                <Mail size={18} className="text-accent" />
                <span className="min-w-0 select-all break-all text-fg">{email}</span>
                <button type="button" onClick={async () => onToast((await copyText(email)) ? "Email copied" : "Couldn't copy. Select the address instead.")} className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-fg">
                  <Copy size={12} /> Copy
                </button>
              </div>
            ) : (
              <p className="flex items-center gap-3 rounded-lg border border-dashed border-line p-4 text-sm text-muted"><Mail size={18} /> Professional email coming soon</p>
            )}
            {linkedin ? (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-line p-4 text-fg hover:border-accent">
                <Linkedin size={18} className="text-accent" /> Connect on LinkedIn
              </a>
            ) : (
              <p className="flex items-center gap-3 rounded-lg border border-dashed border-line p-4 text-sm text-muted"><Linkedin size={18} /> LinkedIn profile link coming soon</p>
            )}
          </div>
          <div>
            <p className="ticker text-muted">Open to</p>
            <ul className="mt-3 grid gap-2">
              {collaborationTopics.map((t) => <li key={t} className="flex gap-3 text-fg"><span className="mt-2.5 h-1 w-3 shrink-0 bg-accent" aria-hidden />{t}</li>)}
            </ul>
          </div>
          <p className="ticker text-muted">Based in {profile.contact.location}</p>
        </aside>
      </div>
    </section>
  );
}
