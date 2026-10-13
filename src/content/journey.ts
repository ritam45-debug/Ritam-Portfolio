import type { Milestone } from "./types";

// ─────────────────────────────────────────────────────────────
// LEARNING JOURNEY — add a milestone by copying an object below.
// Leave `when` empty rather than guessing a date.
// status: "completed" | "ongoing" | "exploring" | "next"
// ─────────────────────────────────────────────────────────────

export const journey: Milestone[] = [
  {
    id: "bba",
    title: "BBA",
    status: "completed",
    kind: "education",
    detail: "Undergraduate business degree that built the base in accounting, finance, marketing and management.",
    tags: ["CGPA 9.8/10", "93% undergraduate score"],
  },
  {
    id: "analytics-tools",
    title: "Analytics toolkit",
    status: "ongoing",
    kind: "tools",
    detail: "Working with Advanced Excel, Power BI, Tableau and IBM Cognos Analytics to clean data, build models and design dashboards.",
    tags: ["Advanced Excel", "Power BI", "Tableau", "IBM Cognos Analytics"],
  },
  {
    id: "glim",
    title: "Management programme, Great Lakes Chennai",
    status: "ongoing",
    kind: "education",
    detail: "Current programme at Great Lakes Institute of Management, Chennai, with a focus on finance, analytics and strategy.",
    tags: ["Finance", "Analytics", "Strategy"],
  },
  {
    id: "finance-topics",
    title: "Financial modelling, valuation & equity research",
    status: "exploring",
    kind: "topics",
    detail: "Studying how forecasts, discount rates and multiples come together into a view on what a business is worth.",
    tags: ["DCF", "Relative valuation", "Ratio analysis"],
  },
  {
    id: "portfolio-projects",
    title: "Projects and experiments",
    status: "exploring",
    kind: "projects",
    detail: "Building this portfolio's project library and analytics playground. Projects will be added here as they are completed.",
  },
  {
    id: "ai-in-business",
    title: "AI in business decision-making",
    status: "next",
    kind: "future",
    detail: "Exploring how AI tools change research, forecasting and the way analysts explore data.",
    tags: ["AI", "Decision support"],
  },
  {
    id: "banking",
    title: "Banking and capital markets",
    status: "next",
    kind: "future",
    detail: "An area of interest to go deeper into: how banks assess credit, manage risk and fund growth.",
    tags: ["Banking", "Credit", "Markets"],
  },
];
