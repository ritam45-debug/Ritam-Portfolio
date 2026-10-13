export const inr = (n: number, digits = 0) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits });

export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

export function readingTime(paragraphs: string[]): number {
  const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
