export type CategoryId = "finance" | "analytics" | "valuation" | "strategy" | "ai";

export interface Category {
  id: CategoryId;
  label: string;
  short: string;
}

export interface Metric {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  category: CategoryId;
  /** true = editable placeholder, shown with a "Sample" label. Set to false once it is your real work. */
  sample: boolean;
  problem: string;
  tools: string[];
  overview: string;
  objectives: string[];
  dataAndAssumptions: string[];
  methodology: string[];
  /** Small chart shown in the detail view. Replace with your real series. */
  chart?: { label: string; unit?: string; points: { name: string; value: number }[] };
  metrics: Metric[];
  findings: string[];
  limitations: string[];
  learning: string[];
  links?: { label: string; href: string }[];
}

export type MilestoneStatus = "completed" | "ongoing" | "exploring" | "next";

export interface Milestone {
  id: string;
  title: string;
  /** Leave empty rather than guessing a date. */
  when?: string;
  status: MilestoneStatus;
  kind: "education" | "tools" | "topics" | "projects" | "future";
  detail: string;
  tags?: string[];
}

export interface Interest {
  id: string;
  title: string;
  lens: string;
  story: string;
  motif: "cricket" | "film" | "stage" | "spark" | "circuit";
}

export interface Article {
  id: string;
  title: string;
  category: string;
  /** ISO date, e.g. "2026-10-11" */
  date: string;
  sample: boolean;
  summary: string;
  body: string[];
  relatedProjects?: string[];
}
