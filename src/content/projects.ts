import type { Category, Project } from "./types";

// ─────────────────────────────────────────────────────────────
// PROJECTS — every entry below is a SAMPLE TEMPLATE (sample: true).
// They show visitors the structure of a project write-up and are
// labelled "Sample" everywhere on the site. Replace each one with a
// real project and set `sample: false`, or delete it.
// ─────────────────────────────────────────────────────────────

export const categories: Category[] = [
  { id: "finance", label: "Finance & Financial Analysis", short: "Finance" },
  { id: "analytics", label: "Business Analytics & Dashboards", short: "Analytics" },
  { id: "valuation", label: "Valuation & Equity Research", short: "Valuation" },
  { id: "strategy", label: "Business Strategy & Market Research", short: "Strategy" },
  { id: "ai", label: "AI & Technology", short: "AI & Tech" },
];

const PLACEHOLDER = "Add once the project is complete";

export const projects: Project[] = [
  {
    id: "peer-ratio-analysis",
    title: "Peer ratio analysis of three listed companies",
    category: "finance",
    sample: true,
    problem:
      "How do three companies in the same industry compare on profitability, efficiency and leverage, and what explains the gaps?",
    tools: ["Advanced Excel"],
    overview:
      "Template for a comparative financial analysis. Pick one industry, three listed peers and five years of annual reports, then compare them on a consistent set of ratios.",
    objectives: [
      "Compute profitability, liquidity, efficiency and leverage ratios on a like-for-like basis",
      "Identify which company converts revenue into cash most effectively",
      "Explain the drivers behind the largest gaps between peers",
    ],
    dataAndAssumptions: [
      "Source: audited annual reports (balance sheet, P&L, cash flow statement)",
      "State the fiscal years covered and any restatements",
      "Note how one-off items were treated",
    ],
    methodology: [
      "Standardise line items across the three companies",
      "Build ratio tables with formulas linked to source sheets",
      "Use DuPont analysis to break ROE into margin, turnover and leverage",
      "Chart trends and annotate turning points",
    ],
    chart: {
      label: "Illustrative ROE trend (sample numbers)",
      unit: "%",
      points: [
        { name: "Y1", value: 14 },
        { name: "Y2", value: 16 },
        { name: "Y3", value: 13 },
        { name: "Y4", value: 18 },
        { name: "Y5", value: 19 },
      ],
    },
    metrics: [
      { label: "Companies compared", value: "3" },
      { label: "Years analysed", value: "5" },
      { label: "Key finding", value: PLACEHOLDER },
    ],
    findings: [PLACEHOLDER],
    limitations: ["List data gaps, accounting differences between peers and anything you could not verify"],
    learning: ["Note what you learned about reading financial statements side by side"],
  },
  {
    id: "kpi-dashboard",
    title: "Sales performance KPI dashboard",
    category: "analytics",
    sample: true,
    problem:
      "Which regions, products and months drive revenue, and where is performance slipping against target?",
    tools: ["Power BI", "Advanced Excel"],
    overview:
      "Template for a dashboard project. Start from a raw transactional dataset, clean it, model it and design a one-page view a manager could use in a weekly review.",
    objectives: [
      "Define 4–6 KPIs that answer the business question",
      "Give users filters for region, product and period",
      "Surface variance against target at a glance",
    ],
    dataAndAssumptions: [
      "Name the dataset, its source and its time range",
      "Describe cleaning steps (duplicates, missing values, outliers)",
      "State how targets were set",
    ],
    methodology: [
      "Clean and shape data in Power Query",
      "Build a star-schema data model",
      "Write measures for revenue, growth, margin and target variance",
      "Design layout: summary first, detail on drill-down",
    ],
    chart: {
      label: "Illustrative monthly revenue (sample numbers, ₹ lakh)",
      points: [
        { name: "Apr", value: 42 },
        { name: "May", value: 47 },
        { name: "Jun", value: 45 },
        { name: "Jul", value: 53 },
        { name: "Aug", value: 58 },
        { name: "Sep", value: 55 },
      ],
    },
    metrics: [
      { label: "KPIs tracked", value: "4–6" },
      { label: "Filters", value: "Region · Product · Period" },
      { label: "Key insight", value: PLACEHOLDER },
    ],
    findings: [PLACEHOLDER],
    limitations: ["Describe data quality issues and what the dashboard cannot answer"],
    learning: ["Note design decisions you would change next time"],
  },
  {
    id: "dcf-valuation",
    title: "DCF valuation of a listed company",
    category: "valuation",
    sample: true,
    problem:
      "What is the intrinsic value per share of a chosen company, and how sensitive is it to growth and discount-rate assumptions?",
    tools: ["Advanced Excel"],
    overview:
      "Template for an equity research style valuation: forecast free cash flows, discount them at WACC, add a terminal value and compare the result with the market price.",
    objectives: [
      "Build a 5-year revenue and margin forecast with stated drivers",
      "Estimate WACC from cost of equity and cost of debt",
      "Produce a sensitivity table for WACC and terminal growth",
    ],
    dataAndAssumptions: [
      "Historical financials from annual reports",
      "Risk-free rate, beta and market risk premium with sources",
      "Every forecast assumption written next to its rationale",
    ],
    methodology: [
      "Forecast revenue, EBITDA, capex and working capital",
      "Derive free cash flow to firm",
      "Discount at WACC; compute terminal value with the Gordon growth method",
      "Bridge enterprise value to equity value per share",
    ],
    chart: {
      label: "Illustrative free cash flow forecast (sample numbers, ₹ crore)",
      points: [
        { name: "FY1", value: 120 },
        { name: "FY2", value: 138 },
        { name: "FY3", value: 155 },
        { name: "FY4", value: 171 },
        { name: "FY5", value: 186 },
      ],
    },
    metrics: [
      { label: "Forecast horizon", value: "5 years" },
      { label: "Method", value: "FCFF · Gordon growth" },
      { label: "Value per share", value: PLACEHOLDER },
    ],
    findings: [PLACEHOLDER],
    limitations: ["Valuation depends on assumptions; list the ones you are least sure of"],
    learning: ["Note which assumption moved the value most"],
  },
  {
    id: "market-entry",
    title: "Market entry assessment",
    category: "strategy",
    sample: true,
    problem:
      "Should a company enter a new market or segment, and if so, how and in what sequence?",
    tools: ["Advanced Excel", "Tableau"],
    overview:
      "Template for a strategy project: size the market, map competitors, test options against criteria and land on a recommendation with a plan.",
    objectives: [
      "Estimate addressable market size with a transparent build-up",
      "Map competitors on the dimensions customers care about",
      "Recommend an entry option with risks and milestones",
    ],
    dataAndAssumptions: [
      "Industry reports, company filings and any primary research",
      "Separate researched figures from estimates",
    ],
    methodology: [
      "Top-down and bottom-up market sizing",
      "Competitor positioning map",
      "Option scoring against weighted criteria",
      "Phased implementation roadmap",
    ],
    metrics: [
      { label: "Options evaluated", value: PLACEHOLDER },
      { label: "Recommendation", value: PLACEHOLDER },
    ],
    findings: [PLACEHOLDER],
    limitations: ["List the estimates the recommendation relies on"],
    learning: ["Note how the analysis changed your initial hypothesis"],
  },
  {
    id: "ai-research-assistant",
    title: "AI-assisted financial research workflow",
    category: "ai",
    sample: true,
    problem:
      "Can an AI tool speed up first-pass company research without lowering accuracy?",
    tools: ["AI tools", "Advanced Excel"],
    overview:
      "Template for an experiment: compare a manual research process with an AI-assisted one on the same companies, and measure time spent and errors found.",
    objectives: [
      "Define a repeatable research checklist",
      "Run it manually and with AI assistance",
      "Compare time, coverage and error rate",
    ],
    dataAndAssumptions: [
      "Which companies, which questions, which AI tool and version",
      "How accuracy was checked against primary sources",
    ],
    methodology: [
      "Design the checklist and scoring rubric",
      "Time both workflows",
      "Verify every AI-produced figure against the source document",
    ],
    metrics: [
      { label: "Time saved", value: PLACEHOLDER },
      { label: "Errors caught", value: PLACEHOLDER },
    ],
    findings: [PLACEHOLDER],
    limitations: ["Small sample; results may not generalise"],
    learning: ["Note where AI helped and where it needed checking"],
  },
];
