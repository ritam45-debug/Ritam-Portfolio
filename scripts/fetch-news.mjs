// Collects recent headlines from public RSS feeds into public/news/news.json.
// Runs in GitHub Actions before each build (every 3 hours) — see .github/workflows/deploy.yml.
// Run locally with: node scripts/fetch-news.mjs
// Only headline, link, source, time and a short snippet are kept; every item links to the original article.
import { writeFile, mkdir } from "node:fs/promises";

const FEEDS = {
  markets: [
    ["CNBC", "https://www.cnbc.com/id/100727362/device/rss/rss.html"],
    ["Economic Times", "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms"],
    ["Livemint", "https://www.livemint.com/rss/markets"],
  ],
  finance: [
    ["CNBC", "https://www.cnbc.com/id/10000664/device/rss/rss.html"],
    ["Economic Times", "https://economictimes.indiatimes.com/industry/banking/finance/rssfeeds/13358259.cms"],
    ["Moneycontrol", "https://www.moneycontrol.com/rss/business.xml"],
  ],
  economy: [
    ["CNBC", "https://www.cnbc.com/id/20910258/device/rss/rss.html"],
    ["Economic Times", "https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms"],
    ["The Guardian", "https://www.theguardian.com/business/economics/rss"],
  ],
  geopolitics: [
    ["BBC", "https://feeds.bbci.co.uk/news/world/rss.xml"],
    ["Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml"],
    ["The Guardian", "https://www.theguardian.com/world/rss"],
  ],
};

const decode = (s = "") =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ").trim();
const tag = (xml, name) => (xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i")) || [])[1] || "";

async function readFeed(source, url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (portfolio news digest)" } });
    if (!res.ok) throw new Error(String(res.status));
    const xml = await res.text();
    const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
    return items.slice(0, 15).map((it) => {
      const title = decode(tag(it, "title"));
      const link = decode(tag(it, "link")) || decode(tag(it, "guid"));
      const date = Date.parse(decode(tag(it, "pubDate")) || decode(tag(it, "dc:date"))) || null;
      let snippet = decode(tag(it, "description"));
      if (snippet.length > 220) snippet = snippet.slice(0, 220).replace(/\s\S*$/, "") + "…";
      return { title, link, source, date, snippet };
    }).filter((i) => i.title && /^https?:\/\//.test(i.link));
  } catch (e) {
    console.warn(`  ! ${source} (${url}): ${e.message}`);
    return [];
  } finally {
    clearTimeout(t);
  }
}

const out = { updatedAt: Date.now(), categories: {} };
for (const [cat, feeds] of Object.entries(FEEDS)) {
  const lists = await Promise.all(feeds.map(([s, u]) => readFeed(s, u)));
  const seen = new Set();
  const all = lists.flat().filter((i) => (seen.has(i.link) || seen.has(i.title) ? false : (seen.add(i.link), seen.add(i.title), true)));
  all.sort((a, b) => (b.date ?? 0) - (a.date ?? 0));
  out.categories[cat] = all.slice(0, 18);
  console.log(`${cat}: ${out.categories[cat].length} items`);
}
await mkdir("public/news", { recursive: true });
await writeFile("public/news/news.json", JSON.stringify(out));
console.log("wrote public/news/news.json");
