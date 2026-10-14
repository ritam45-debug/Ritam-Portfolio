import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Globe2, Landmark, LineChart, Newspaper, RefreshCw, TrendingUp } from "lucide-react";
import { SectionHeader } from "./ui";
import { spotMove } from "./work/shared";

type Item = { title: string; link: string; source: string; date: number | null; snippet: string };
type NewsFile = { updatedAt: number; categories: Record<string, Item[]> };

const TABS = [
  { id: "all", label: "Top stories", icon: Newspaper },
  { id: "markets", label: "Global markets", icon: LineChart },
  { id: "finance", label: "Financial world", icon: Landmark },
  { id: "economy", label: "Economics", icon: TrendingUp },
  { id: "geopolitics", label: "Geopolitics", icon: Globe2 },
] as const;
type Tab = (typeof TABS)[number]["id"];

const SOURCES = [
  { name: "Economic Times Markets", url: "https://economictimes.indiatimes.com/markets" },
  { name: "Moneycontrol", url: "https://www.moneycontrol.com/news/business/markets/" },
  { name: "Livemint Markets", url: "https://www.livemint.com/market" },
  { name: "CNBC World Markets", url: "https://www.cnbc.com/world-markets/" },
  { name: "Reuters Business", url: "https://www.reuters.com/business/" },
  { name: "BBC World", url: "https://www.bbc.com/news/world" },
  { name: "Al Jazeera Economy", url: "https://www.aljazeera.com/economy/" },
  { name: "RBI Press Releases", url: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx" },
];

const ago = (t: number | null) => {
  if (!t) return "";
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
};
const LABEL: Record<string, string> = { markets: "Global markets", finance: "Financial world", economy: "Economics", geopolitics: "Geopolitics" };

export function News() {
  const [data, setData] = useState<NewsFile | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "empty">("loading");
  const [tab, setTab] = useState<Tab>("all");

  const load = async () => {
    setState("loading");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}news/news.json?t=${Date.now()}`, { cache: "no-store" });
      const d = (await res.json()) as NewsFile;
      const count = Object.values(d.categories ?? {}).reduce((n, l) => n + l.length, 0);
      setData(d);
      setState(count ? "ok" : "empty");
    } catch {
      setState("empty");
    }
  };
  useEffect(() => { load(); }, []);

  const items = useMemo(() => {
    if (!data) return [] as (Item & { cat: string })[];
    if (tab !== "all") return (data.categories[tab] ?? []).map((i) => ({ ...i, cat: tab }));
    // Top stories: interleave the newest from each topic.
    const lists = Object.entries(data.categories).map(([cat, l]) => l.slice(0, 5).map((i) => ({ ...i, cat })));
    const mixed: (Item & { cat: string })[] = [];
    for (let r = 0; r < 5; r++) for (const l of lists) if (l[r]) mixed.push(l[r]);
    return mixed;
  }, [data, tab]);

  const [lead, ...rest] = items;

  return (
    <section id="news" aria-labelledby="news-h" className="relative border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader id="news-h" code="§ 07 · Newsroom" title="What's moving the world today" lede="Headlines on markets, finance, the economy and geopolitics, gathered from leading news outlets every three hours. Every story links to the original report." />
          {data?.updatedAt ? (
            <p className="mb-10 flex items-center gap-2 font-mono text-xs text-muted md:mb-14">
              <span className="pulse-dot h-2 w-2 rounded-full bg-pos" aria-hidden /> Updated {ago(data.updatedAt)}
              <button type="button" onClick={load} aria-label="Reload headlines" className="ml-1 rounded-full border border-line p-1.5 hover:border-accent hover:text-fg"><RefreshCw size={12} /></button>
            </p>
          ) : null}
        </div>

        <div role="tablist" aria-label="News topics" className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button key={t.id} type="button" role="tab" aria-selected={on} onClick={() => setTab(t.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-all ${on ? "border-accent bg-accent text-accent-ink shadow-[0_0_18px_-6px_var(--accent)]" : "border-line text-muted hover:border-accent hover:text-fg"}`}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {state === "loading" && (
          <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl border border-line bg-surface" />)}</div>
        )}

        {state === "empty" && (
          <div className="reveal rounded-3xl border border-dashed border-line bg-surface p-6 sm:p-8">
            <p className="font-display text-2xl text-fg">Live headlines appear on the published site.</p>
            <p className="mt-1 max-w-[65ch] text-sm text-muted">The newsroom refreshes automatically every three hours once the site is live on GitHub Pages. Until then, these are the sources it draws on:</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {SOURCES.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-2 rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-fg hover:border-accent">
                    {s.name} <ArrowUpRight size={14} className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {state === "ok" && items.length === 0 && <p className="text-muted">No stories in this topic right now. Try another tab.</p>}

        {state === "ok" && lead && (
          <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
            <a href={lead.link} target="_blank" rel="noopener noreferrer" data-tilt="2" onMouseMove={spotMove}
              className="spot reveal group relative flex min-h-[18rem] flex-col justify-end overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-accent/20 via-surface to-accent-2/20 p-6 sm:p-8">
              <span className="absolute right-6 top-6 font-display text-7xl italic text-fg/10" aria-hidden>“</span>
              <p className="ticker text-accent">{LABEL[lead.cat]} · {lead.source}</p>
              <h3 className="mt-3 font-display text-3xl leading-tight text-fg group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">{lead.title}</h3>
              {lead.snippet && <p className="mt-3 text-sm text-muted">{lead.snippet}</p>}
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-fg">Read on {lead.source} <ArrowUpRight size={14} /> <span className="ml-2 font-mono text-xs font-normal text-muted">{ago(lead.date)}</span></p>
            </a>
            <ul className="grid gap-2.5">
              {rest.slice(0, 5).map((n) => <NewsRow key={n.link} n={n} />)}
            </ul>
            {rest.length > 5 && (
              <ul className="grid gap-2.5 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
                {rest.slice(5, 17).map((n) => <NewsRow key={n.link} n={n} compact />)}
              </ul>
            )}
          </div>
        )}

        <p className="mt-6 text-xs text-muted">Headlines and snippets belong to their publishers and link to the original stories. Collected automatically; not edited or endorsed by Ritam.</p>
      </div>
    </section>
  );
}

function NewsRow({ n, compact }: { n: Item & { cat: string }; compact?: boolean }) {
  return (
    <li>
      <a href={n.link} target="_blank" rel="noopener noreferrer" onMouseMove={spotMove}
        className="spot reveal group flex h-full flex-col gap-1.5 rounded-2xl border border-line bg-bg p-4 transition-all hover:-translate-y-0.5 hover:border-accent/60">
        <p className="flex items-center justify-between gap-2 font-mono text-[0.68rem] uppercase tracking-wider text-muted">
          <span className="truncate"><span className="text-accent">{LABEL[n.cat]}</span> · {n.source}</span>
          <span className="shrink-0">{ago(n.date)}</span>
        </p>
        <p className={`font-semibold leading-snug text-fg group-hover:text-accent ${compact ? "text-sm" : ""}`}>{n.title}</p>
      </a>
    </li>
  );
}
