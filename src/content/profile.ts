// ─────────────────────────────────────────────────────────────
// PROFILE — edit this file to update your personal details.
// Everything here is shown on the site AND fed to "Ask Ritam".
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: "Ritam Dhara",
  initials: "RD",
  brandLine: "Where Finance Meets Data, Strategy & AI",
  headline: ["Curious about business.", "Driven by data.", "Inspired by possibilities."],
  intro:
    "I'm a management student at Great Lakes Institute of Management, Chennai, working at the point where financial analysis, data and business strategy meet. I like taking a business question apart, finding the numbers that matter, and turning them into a decision someone can act on.",

  education: {
    current: "Management programme, Great Lakes Institute of Management, Chennai",
    undergraduate: "BBA",
    record: "CGPA 9.8/10 and a 93% undergraduate score",
  },

  about: [
    "I studied for a BBA before joining the management programme at Great Lakes Institute of Management in Chennai. What keeps pulling me in is how much of a business can be read from its numbers: a balance sheet shows what a company owns and owes, and a handful of ratios show how well it is using both.",
    "Today my attention sits in two places. The first is finance: financial analysis, financial modelling, valuation, equity research and banking. The second is analytics: building dashboards and visual stories in Excel, Power BI, Tableau and IBM Cognos Analytics so that a decision-maker can see a trend in seconds instead of reading a table for minutes.",
    "The thread connecting them is a simple question I keep asking: what does the data actually say, and what should we do about it? Increasingly I'm also curious about how AI changes that question, from faster research to new ways of exploring a dataset.",
    "Outside the classroom you'll find me following cricket, watching films, acting, and generally poking at how businesses work.",
  ],

  focusAreas: [
    "Finance",
    "Business Analytics",
    "Financial Modelling",
    "Valuation",
    "Equity Research",
    "Banking",
    "Business Strategy",
    "Data Visualization",
    "AI",
    "Tech-driven decisions",
  ],

  tools: [
    { name: "Advanced Excel", use: "Modelling, scenario tables, data cleaning" },
    { name: "Power BI", use: "Interactive dashboards and KPI reporting" },
    { name: "Tableau", use: "Visual analysis and data storytelling" },
    { name: "IBM Cognos Analytics", use: "Business intelligence and reporting" },
  ],

  contact: {
    /** Add your professional email, e.g. "ritam@example.com". Leave "" to hide it. */
    email: "",
    /** Full LinkedIn URL, e.g. "https://www.linkedin.com/in/your-handle". Leave "" to hide it. */
    linkedin: "https://www.linkedin.com/in/ritam-dhara-7b6179272/",
    location: "Chennai, India",
    collaborationTopics: [
      "Finance and valuation case work",
      "Dashboards and data storytelling",
      "Case competitions and strategy problems",
      "Conversations about AI in business",
    ],
  },

  /** Public URL once deployed — used for share links and social previews. */
  siteUrl: "https://ritam45-debug.github.io/ritam-portfolio/",
} as const;
