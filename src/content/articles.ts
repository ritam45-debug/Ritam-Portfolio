import type { Article } from "./types";

// ─────────────────────────────────────────────────────────────
// JOURNAL — publish an article by adding an object below.
// `body` is an array of paragraphs. Lines starting with "## " become sub-headings.
// Reading time is calculated automatically.
// The single entry below is a SAMPLE showing the layout; delete it
// when you publish your first real piece.
// ─────────────────────────────────────────────────────────────

export const journalCategories = [
  "Case study lessons",
  "Finance & markets",
  "Data viz experiments",
  "AI & business",
  "Management education",
];

export const articles: Article[] = [
  {
    id: "sample-how-to-write-an-entry",
    title: "Sample entry: how a journal post on this site is laid out",
    category: "Data viz experiments",
    date: "2026-10-11",
    sample: true,
    summary:
      "A placeholder that shows the article layout. It is not a published piece of writing.",
    body: [
      "This is a sample entry. It exists so you can see how a journal post looks before the first real one is published.",
      "## Structure that works",
      "Open with the question you were trying to answer. Follow with what you looked at, what you found, and what you would do differently. Short paragraphs read best on a phone.",
      "## Linking to projects",
      "Each entry can link to related projects using their id. Visitors can jump from the article straight into the project's detail view.",
    ],
    relatedProjects: ["kpi-dashboard"],
  },
];
