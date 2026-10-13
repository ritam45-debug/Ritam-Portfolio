// ─────────────────────────────────────────────────────────────
// ASK RITAM KNOWLEDGE — built automatically from the other content
// files, so the assistant always matches what the site shows.
// Used by the demo answers (browser) and the live AI backend (api/ask.ts).
// ─────────────────────────────────────────────────────────────
import { profile } from "./profile";
import { categories, projects } from "./projects";
import { journey } from "./journey";
import { interests } from "./interests";
import { articles } from "./articles";
import { playgroundMeta } from "./playground";

const realProjects = () => projects.filter((p) => !p.sample);
const sampleProjects = () => projects.filter((p) => p.sample);
const catLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

/** Plain-text knowledge base passed to the live model as its only source of truth. */
export function buildKnowledgeText(): string {
  const lines: string[] = [];
  lines.push(`NAME: ${profile.name}`);
  lines.push(`BRAND: ${profile.brandLine}`);
  lines.push(`INTRO: ${profile.intro}`);
  lines.push(`EDUCATION: ${profile.education.current}; undergraduate: ${profile.education.undergraduate}; academic record: ${profile.education.record}.`);
  lines.push(`ABOUT: ${profile.about.join(" ")}`);
  lines.push(`FOCUS AREAS: ${profile.focusAreas.join(", ")}`);
  lines.push(`TOOLS USED: ${profile.tools.map((t) => `${t.name} (${t.use})`).join("; ")}`);
  lines.push(`OPEN TO COLLABORATE ON: ${profile.contact.collaborationTopics.join("; ")}`);
  lines.push("PROJECTS:");
  for (const p of projects) {
    lines.push(
      `- ${p.title} [${catLabel(p.category)}] ${p.sample ? "(SAMPLE TEMPLATE — not completed work; do not describe results)" : "(completed project)"} | Problem: ${p.problem} | Tools: ${p.tools.join(", ")} | Method: ${p.methodology.join("; ")}${p.sample ? "" : ` | Findings: ${p.findings.join("; ")}`}`,
    );
  }
  lines.push("LEARNING JOURNEY:");
  for (const m of journey) lines.push(`- ${m.title} (${m.status}): ${m.detail}${m.tags ? ` [${m.tags.join(", ")}]` : ""}`);
  lines.push("INTERESTS:");
  for (const i of interests) lines.push(`- ${i.title}: ${i.story}`);
  lines.push("JOURNAL:");
  const published = articles.filter((a) => !a.sample);
  if (published.length === 0) lines.push("- No articles published yet.");
  for (const a of published) lines.push(`- ${a.title} (${a.category}, ${a.date}): ${a.summary}`);
  lines.push(`ANALYTICS PLAYGROUND: ratio explorer, DCF simulator and break-even simulator. ${playgroundMeta.illustrative ? playgroundMeta.sourceNote : ""}`);
  return lines.join("\n");
}

interface DemoEntry {
  id: string;
  keywords: string[];
  answer: () => string;
}

function projectsAnswer(): string {
  const real = realProjects();
  const cats = categories.map((c) => c.label).join(", ");
  if (real.length === 0) {
    return `Ritam's project library is organised into five areas: ${cats}. Right now the gallery holds sample templates that show how each project will be written up (problem, objectives, data, method, findings, limitations). Completed projects will replace them as they're published, so check back or open any card to see the structure.`;
  }
  return `Ritam has published ${real.length} project${real.length > 1 ? "s" : ""}: ${real.map((p) => `${p.title} (${catLabel(p.category)})`).join("; ")}. The gallery is organised into ${cats}.`;
}

export const demoEntries: DemoEntry[] = [
  {
    id: "projects",
    keywords: ["project", "projects", "work", "portfolio", "built", "explore"],
    answer: projectsAnswer,
  },
  {
    id: "analytics-project",
    keywords: ["analytics project", "dashboard project", "explain one", "explain a", "example project"],
    answer: () => {
      const real = realProjects().find((p) => p.category === "analytics");
      if (real) return `${real.title}: ${real.overview} Method: ${real.methodology.join("; ")}. Findings: ${real.findings.join(" ")}`;
      const s = sampleProjects().find((p) => p.category === "analytics");
      return `No analytics project has been published yet, so I can't describe results. The gallery's sample template, "${s?.title}", shows the intended approach: ${s?.methodology.join("; ").toLowerCase()}. Tools in that template: ${s?.tools.join(", ")}.`;
    },
  },
  {
    id: "approach",
    keywords: ["approach", "financial analysis", "how does he analyse", "how does he analyze", "method", "think"],
    answer: () =>
      `Ritam's starting point is a simple question: what does the data actually say, and what should we do about it? For financial analysis that means reading the three statements together, comparing ratios on a like-for-like basis, breaking returns into their drivers, and testing how sensitive any conclusion is to its assumptions. The DCF simulator in the Analytics Playground shows that last step in action.`,
  },
  {
    id: "tools",
    keywords: ["tool", "tools", "demonstrated", "software", "excel", "power bi", "tableau", "cognos", "skills"],
    answer: () =>
      `Tools Ritam has used: ${profile.tools.map((t) => `${t.name} (${t.use.toLowerCase()})`).join("; ")}. Project write-ups will list which tools each one used.`,
  },
  {
    id: "exploring",
    keywords: ["currently", "exploring", "studying", "learning", "topics", "interested", "interests in", "focus"],
    answer: () => {
      const now = journey.filter((m) => m.status === "ongoing" || m.status === "exploring").map((m) => m.title);
      const next = journey.filter((m) => m.status === "next").map((m) => m.title);
      return `Right now: ${now.join("; ")}. Next on the list: ${next.join("; ")}. His broader focus areas are ${profile.focusAreas.slice(0, 7).join(", ")}.`;
    },
  },
  {
    id: "dashboards",
    keywords: ["learn from", "dashboards", "playground", "interactive", "simulator", "charts"],
    answer: () =>
      `The Analytics Playground has three tools. The Ratio Explorer compares companies on growth, margins, returns, leverage and liquidity and writes a one-line insight for whatever you select. The DCF Simulator lets you move growth, margin and discount-rate sliders and watch the value per share respond. The Break-even Simulator shows how price and cost changes move the break-even point. ${playgroundMeta.illustrative ? "All three run on fictional, illustrative data for now." : ""}`,
  },
  {
    id: "education",
    keywords: ["education", "study", "college", "great lakes", "glim", "bba", "degree", "cgpa", "academic", "mba"],
    answer: () =>
      `Ritam is in the ${profile.education.current}. Before that he completed a ${profile.education.undergraduate}, with an academic record of ${profile.education.record}.`,
  },
  {
    id: "hobbies",
    keywords: ["hobby", "hobbies", "cricket", "movie", "movies", "film", "acting", "outside", "fun", "free time"],
    answer: () => `Outside academics: ${interests.map((i) => i.title.toLowerCase()).join(", ")}. ${interests[0].story}`,
  },
  {
    id: "contact",
    keywords: ["contact", "reach", "email", "linkedin", "hire", "collaborate", "connect"],
    answer: () =>
      `The Contact section at the bottom of the page is the best way to reach Ritam. He's open to collaborating on ${profile.contact.collaborationTopics.map((t) => t.toLowerCase()).join(", ")}.`,
  },
  {
    id: "journal",
    keywords: ["article", "articles", "journal", "blog", "writing", "insights"],
    answer: () => {
      const pub = articles.filter((a) => !a.sample);
      return pub.length
        ? `Published journal entries: ${pub.map((a) => a.title).join("; ")}.`
        : `The journal is set up for lessons from case studies, notes on finance and markets, data-viz experiments and reflections on AI. No articles have been published yet.`;
    },
  },
  {
    id: "who",
    keywords: ["who", "about", "ritam", "introduce", "tell me"],
    answer: () => profile.intro,
  },
];

/** Suggested questions shown in the chat, each pinned to the demo answer it should get. */
const suggested: [string, string][] = [
  ["What kinds of projects does Ritam explore?", "projects"],
  ["Explain one of his analytics projects.", "analytics-project"],
  ["What is his approach to financial analysis?", "approach"],
  ["Which tools are demonstrated in his projects?", "tools"],
  ["What topics is he currently exploring?", "exploring"],
  ["What can visitors learn from his interactive dashboards?", "dashboards"],
];
export const suggestedQuestions = suggested.map(([q]) => q);

/** Keyword-scoring demo responder. Returns null when nothing matches. */
export function demoAnswer(question: string): string | null {
  const q = question.toLowerCase().trim();
  const pinned = suggested.find(([s]) => s.toLowerCase() === q);
  if (pinned) return demoEntries.find((e) => e.id === pinned[1])?.answer() ?? null;
  let best: { score: number; entry: DemoEntry } | null = null;
  for (const entry of demoEntries) {
    let score = 0;
    for (const k of entry.keywords) if (q.includes(k)) score += k.split(" ").length * 2 + k.length / 10;
    if (score > 0 && (!best || score > best.score)) best = { score, entry };
  }
  return best ? best.entry.answer() : null;
}
