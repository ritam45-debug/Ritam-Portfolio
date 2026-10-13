// ─────────────────────────────────────────────────────────────
// ANALYTICS PLAYGROUND DATA — ILLUSTRATIVE ONLY.
// "Alpha", "Beta" and "Gamma" are fictional companies with made-up numbers.
// To use real data, replace `companies` and `years` below; the charts and
// insight text update automatically. Keep `illustrative: true` until then.
// ─────────────────────────────────────────────────────────────

export const playgroundMeta = {
  illustrative: true,
  sourceNote: "Fictional companies, made-up numbers. For demonstration only.",
};

export const years = ["FY22", "FY23", "FY24", "FY25", "FY26"];

export type RatioKey = "revenueGrowth" | "ebitdaMargin" | "roe" | "debtEquity" | "currentRatio";

export const ratioDefs: Record<RatioKey, { label: string; unit: "%" | "x"; higherIsBetter: boolean; formula: string; meaning: string }> = {
  revenueGrowth: { label: "Revenue growth", unit: "%", higherIsBetter: true, formula: "(Revenueₜ − Revenueₜ₋₁) ÷ Revenueₜ₋₁", meaning: "How fast the top line is expanding." },
  ebitdaMargin: { label: "EBITDA margin", unit: "%", higherIsBetter: true, formula: "EBITDA ÷ Revenue", meaning: "Operating profit kept from each rupee of sales." },
  roe: { label: "Return on equity", unit: "%", higherIsBetter: true, formula: "Net profit ÷ Shareholders' equity", meaning: "Profit generated on the owners' capital." },
  debtEquity: { label: "Debt to equity", unit: "x", higherIsBetter: false, formula: "Total debt ÷ Shareholders' equity", meaning: "How much the business leans on borrowing." },
  currentRatio: { label: "Current ratio", unit: "x", higherIsBetter: true, formula: "Current assets ÷ Current liabilities", meaning: "Ability to meet short-term obligations." },
};

export const companies: { id: string; name: string; profile: string; data: Record<RatioKey, number[]> }[] = [
  {
    id: "alpha",
    name: "Alpha Co.",
    profile: "Fast-growing, debt-funded",
    data: {
      revenueGrowth: [18, 24, 21, 16, 14],
      ebitdaMargin: [12.5, 13.1, 14.0, 14.8, 15.2],
      roe: [15, 17, 19, 18, 17],
      debtEquity: [1.1, 1.3, 1.4, 1.2, 1.0],
      currentRatio: [1.1, 1.0, 1.05, 1.15, 1.2],
    },
  },
  {
    id: "beta",
    name: "Beta Ltd.",
    profile: "Mature, cash-rich",
    data: {
      revenueGrowth: [7, 8, 6, 9, 8],
      ebitdaMargin: [21.0, 20.4, 21.8, 22.5, 22.1],
      roe: [22, 21, 23, 24, 24],
      debtEquity: [0.15, 0.12, 0.1, 0.08, 0.05],
      currentRatio: [2.1, 2.3, 2.2, 2.4, 2.5],
    },
  },
  {
    id: "gamma",
    name: "Gamma Inds.",
    profile: "Turnaround story",
    data: {
      revenueGrowth: [-4, 2, 9, 13, 15],
      ebitdaMargin: [6.0, 7.5, 9.8, 11.4, 12.6],
      roe: [3, 6, 10, 13, 15],
      debtEquity: [1.8, 1.6, 1.2, 0.9, 0.7],
      currentRatio: [0.9, 1.0, 1.2, 1.3, 1.4],
    },
  },
];

/** Defaults for the DCF simulator (₹ crore, illustrative). */
export const dcfDefaults = {
  baseRevenue: 1000,
  growth: 12,
  ebitdaMargin: 18,
  taxRate: 25,
  reinvestmentRate: 35, // % of NOPAT reinvested (capex + working capital − D&A)
  wacc: 11,
  terminalGrowth: 5,
  netDebt: 300,
  shares: 50, // crore shares
};

/** Defaults for the break-even simulator (illustrative). */
export const breakEvenDefaults = {
  price: 250,
  variableCost: 140,
  fixedCost: 550000,
  expectedUnits: 6000,
};
