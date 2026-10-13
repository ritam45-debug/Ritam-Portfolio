export type Theme = "light" | "dark";

const KEY = "rd-theme";

export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* storage blocked — fall through */
  }
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore */
  }
}

export type Accent = "aurora" | "saffron" | "orchid";
export const ACCENTS: { id: Accent; label: string; swatch: [string, string] }[] = [
  { id: "aurora", label: "Aurora", swatch: ["#3ee6c8", "#7c9cff"] },
  { id: "saffron", label: "Saffron", swatch: ["#ffad5a", "#ff6f91"] },
  { id: "orchid", label: "Orchid", swatch: ["#c98bff", "#ff7ac6"] },
];
const AKEY = "rd-accent";

export function getInitialAccent(): Accent {
  try {
    const saved = localStorage.getItem(AKEY);
    if (saved === "aurora" || saved === "saffron" || saved === "orchid") return saved;
  } catch {
    /* ignore */
  }
  return "aurora";
}

export function applyAccent(accent: Accent) {
  document.documentElement.setAttribute("data-accent", accent);
  try {
    localStorage.setItem(AKEY, accent);
  } catch {
    /* ignore */
  }
}
