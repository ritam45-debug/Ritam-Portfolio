import { useState, type CSSProperties } from "react";
import { ArrowUpRight, AudioWaveform, Check, ClipboardList, Code2, Globe2, Lock, Mic, Scale, ShieldCheck, Sparkles, Unlock } from "lucide-react";
import homeShot from "../assets/soundsense-home.jpg";
import appShot from "../assets/soundsense-app.jpg";
import { SectionHeader } from "./ui";
import { spotMove } from "./work/shared";

// Source for every claim below: the live site (ritam45-debug.github.io/soundsense)
// and the project README in github.com/ritam45-debug/soundsense.
const SITE = "https://ritam45-debug.github.io/soundsense/";
const APP = "https://ritam45-debug.github.io/soundsense/app/";
const CODE = "https://github.com/ritam45-debug/soundsense";

const STEPS = [
  { icon: ClipboardList, title: "Answer", text: "An adaptive questionnaire of about 10 minutes, with follow-ups that appear only when they matter." },
  { icon: Mic, title: "Check", text: "Optionally measure the room with your own microphone, plus a room calculator for a Sabine RT60 estimate." },
  { icon: Scale, title: "Understand", text: "The likely cause, the evidence behind it, a confidence level, and free fixes to try first." },
  { icon: Sparkles, title: "Decide", text: "Budget, recommended and premium options, a PDF report, or a session with a consultant." },
];

const STATS = [
  { value: "8", label: "possible diagnoses" },
  { value: "~10 min", label: "per assessment" },
  { value: "146", label: "automated tests (Lite)" },
  { value: "0", label: "audio uploaded: analysed on device" },
];

const EDITIONS = [
  {
    icon: Unlock, name: "SoundSense Lite", tag: "Live now · no sign-in",
    points: ["Runs fully in the browser; data stays on the device", "Diagnosis engine, PDF report, room calculator, learning centre", "SoundSense 2.0: live monitoring and alerts, room health scores, mitigation plans, before/after checks, room passports (QR), room maps, ROI"],
  },
  {
    icon: Lock, name: "Full platform", tag: "Accounts & consultants",
    points: ["Customer, consultant and admin roles with PostgreSQL row-level security", "Consultant bookings, case notes and final reports", "Admin dashboard, pricing and audit log; AI assistant with a rule-based fallback"],
  },
];

const PRINCIPLES = [
  "Browser readings are labelled relative or rough estimates, never certified decibels",
  "Causes are shown as hypotheses; low evidence means low confidence",
  "Free steps come before any purchase; prices are indicative, not quotes",
];

export function LiveProject() {
  const [shot, setShot] = useState<"home" | "app">("home");
  return (
    <section id="live-project" aria-labelledby="lp-h" className="relative overflow-hidden border-y border-line bg-surface/30">
      <div className="lp-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <SectionHeader id="lp-h" code="§ 04 · Live international project" title="SoundSense, built with Cal Poly students"
          lede="An international project with students from Cal Poly, run as a CPP International Project at Great Lakes Chennai. SoundSense is a live web app that works out why a room sounds bad before it recommends anything to buy." />

        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          {/* Story + CTAs */}
          <div className="reveal min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="lp-live inline-flex items-center gap-2 rounded-full border border-pos/50 bg-pos/10 px-3 py-1 text-xs font-semibold text-pos">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pos opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-pos" /></span>
                Live
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg/60 px-3 py-1 text-xs text-muted"><Globe2 size={13} /> International team · Cal Poly × GLIM</span>
            </div>
            <h3 className="mt-5 flex items-center gap-3 font-display text-3xl text-fg sm:text-4xl">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent"><AudioWaveform size={24} /></span>
              SoundSense
            </h3>
            <p className="mt-3 font-display text-xl text-fg/90">Diagnose first. <span className="text-accent">Recommend second.</span> <span className="text-b4">Sell last.</span></p>
            <p className="mt-4 max-w-[60ch] leading-relaxed text-muted">
              A new microphone will not fix a room that echoes. SoundSense is for conference rooms and hybrid meetings with echo,
              poor mic pickup or noise. It asks the right questions, checks the room with the visitor's own device, and says what is most likely
              wrong, and how sure it is, before it mentions a single product.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href={APP} target="_blank" rel="noreferrer" data-magnetic className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-ink shadow-[0_8px_30px_-8px_var(--accent)] transition-transform hover:-translate-y-0.5">
                Open the app <ArrowUpRight size={16} />
              </a>
              <a href={SITE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line bg-bg/60 px-5 py-2.5 font-semibold text-fg transition-colors hover:border-accent hover:text-accent">
                Visit the site <ArrowUpRight size={16} />
              </a>
              <a href={CODE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line bg-bg/60 px-5 py-2.5 font-semibold text-fg transition-colors hover:border-accent hover:text-accent">
                <Code2 size={16} /> Code on GitHub
              </a>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATS.map((s, i) => (
                <div key={s.label} className="lp-stat rounded-xl border border-line bg-bg/70 p-3" style={{ "--d": `${i * 90}ms` } as CSSProperties}>
                  <dd className="num font-display text-2xl text-accent">{s.value}</dd>
                  <dt className="mt-0.5 text-xs leading-snug text-muted">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Screens */}
          <div className="reveal min-w-0">
            <div className="lp-frame rounded-2xl border border-line bg-bg shadow-[0_30px_80px_-30px_rgba(0,0,0,.6)]">
              <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-neg/70" /><span className="h-2.5 w-2.5 rounded-full bg-b4/70" /><span className="h-2.5 w-2.5 rounded-full bg-pos/70" />
                <span className="ml-3 truncate rounded-md bg-surface px-2 py-0.5 font-mono text-[11px] text-muted">ritam45-debug.github.io/soundsense/{shot === "app" ? "app/" : ""}</span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-b-2xl">
                <img src={homeShot} alt="SoundSense home page: Diagnose first, recommend second, sell last, with an example room-acoustics readout" loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-700 ${shot === "home" ? "scale-100 opacity-100" : "scale-105 opacity-0"}`} />
                <img src={appShot} alt="SoundSense Lite app dashboard with rooms, alerts, assessments and a sidebar of monitoring and mitigation tools" loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-700 ${shot === "app" ? "scale-100 opacity-100" : "scale-105 opacity-0"}`} />
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="SoundSense screens">
              {(["home", "app"] as const).map((k) => (
                <button key={k} type="button" role="tab" aria-selected={shot === k} onClick={() => setShot(k)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${shot === k ? "border-accent bg-accent/15 text-accent" : "border-line text-muted hover:text-fg"}`}>
                  {k === "home" ? "Landing page" : "App dashboard"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <ol className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} onMouseMove={spotMove} className="spot reveal relative min-w-0 rounded-2xl border border-line bg-bg/70 p-5" style={{ "--d": `${i * 100}ms` } as CSSProperties}>
              <span className="num absolute right-4 top-3 font-display text-4xl text-line">{i + 1}</span>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent"><s.icon size={18} /></span>
              <h4 className="mt-3 font-display text-lg text-fg">{s.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>

        {/* Editions + principles */}
        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
          {EDITIONS.map((e) => (
            <article key={e.name} onMouseMove={spotMove} className="spot reveal min-w-0 rounded-2xl border border-line bg-bg/70 p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-2/15 text-accent-2"><e.icon size={17} /></span>
                <div><h4 className="font-semibold text-fg">{e.name}</h4><p className="text-xs text-muted">{e.tag}</p></div>
              </div>
              <ul className="mt-3 grid gap-1.5 text-sm text-muted">
                {e.points.map((p) => <li key={p} className="flex gap-2"><Check size={14} className="mt-1 shrink-0 text-accent" />{p}</li>)}
              </ul>
            </article>
          ))}
          <article className="reveal min-w-0 rounded-2xl border border-accent/40 bg-accent/5 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-accent"><ShieldCheck size={17} /></span>
              <div><h4 className="font-semibold text-fg">Honest by design</h4><p className="text-xs text-muted">The product's own promises</p></div>
            </div>
            <ul className="mt-3 grid gap-1.5 text-sm text-muted">
              {PRINCIPLES.map((p) => <li key={p} className="flex gap-2"><Check size={14} className="mt-1 shrink-0 text-accent" />{p}</li>)}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
