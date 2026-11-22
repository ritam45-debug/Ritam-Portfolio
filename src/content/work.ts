// ─────────────────────────────────────────────────────────────
// PROJECT WORK — figures copied from the two project PDFs.
//  • Blue Star Ltd one-page summary (individual work, Ritam Dhara)
//  • FADM Project Part 1: Wires & Cables (Group 4, Section 3)
// Anything marked `derived` is calculated on this site from those figures.
// ─────────────────────────────────────────────────────────────

/* ───────────────────────── Blue Star ───────────────────────── */

export const blueStar = {
  id: "blue-star",
  title: "Blue Star Ltd",
  kind: "Equity research · One-page company summary",
  ownership: "Individual work",
  blurb:
    "A one-page equity snapshot of Blue Star, India's largest after-sales service provider for air conditioning and commercial refrigeration: five years of financials and valuation ratios, ownership, management pay, capital structure and the latest corporate updates.",
  about:
    "Blue Star manufactures air purifiers, air coolers, water purifiers, cold storage and speciality products, offers turnkey MEP (mechanical, electrical, plumbing and fire-fighting) project solutions, and is the largest after-sales service provider for air conditioning and commercial refrigeration products in India.",
  years: ["FY22", "FY23", "FY24", "FY25", "FY26"],
  sales: [6064.08, 7977.32, 9685.36, 11967.65, 12401.99],
  salesGrowth: [42.23, 31.55, 21.41, 23.56, 3.63],
  grossProfit: [1272.45, 1703.91, 2187.54, 2747.42, 2700.22],
  grossMargin: [20.98, 21.36, 22.59, 22.96, 21.77],
  ebitdaMargin: [5.72, 6.26, 6.9, 7.35, 7.52],
  ebitMargin: [4.9, 7.65, 6.35, 6.97, 6.25],
  netMargin: [2.77, 5.02, 4.28, 4.94, 4.25],
  eps: [8.71, 20.79, 20.18, 28.76, 25.67],
  epsGrowth: [67.13, 138.78, -2.93, 42.48, -10.75],
  dps: [5, 6, 7, 9, 8.5],
  pe: [60.41, 33.17, 63.11, 74.29, 62.76],
  evEbitda: [30.01, 27.41, 38.97, 49.9, 35.93],
  evSales: [1.72, 1.72, 2.69, 3.67, 2.7],
  pb: [9.96, 9.98, 10.03, 14.33, 9.65],
  roe: [16.48, 30.1, 15.9, 19.29, 15.38],
  roce: [20.04, 34.24, 25.39, 26.47, 20.17],
  shareholding: [
    { name: "Promoters", pct: 36.49 },
    { name: "DIIs", pct: 28.24 },
    { name: "Public", pct: 22.49 },
    { name: "FIIs", pct: 12.75 },
  ],
  topHolders: [
    { name: "Ashok M Advani Family Trust", promoter: true, sharesCr: 2.39, pct: 11.63, valueCr: 3763.59 },
    { name: "SMA Family Trust", promoter: true, sharesCr: 1.56, pct: 7.57, valueCr: 2450.72 },
    { name: "Kotak Midcap Fund", promoter: false, sharesCr: 0.92, pct: 4.47, valueCr: 1448.24 },
    { name: "Axis Small Cap Fund", promoter: false, sharesCr: 0.73, pct: 3.56, valueCr: 1150.91 },
    { name: "Nippon India Small Cap Fund", promoter: false, sharesCr: 0.59, pct: 2.88, valueCr: 932.44 },
    { name: "ICICI Pru Multicap Fund", promoter: false, sharesCr: 0.48, pct: 2.31, valueCr: 748.75 },
    { name: "NSA Family Trust", promoter: true, sharesCr: 0.46, pct: 2.24, valueCr: 724.04 },
    { name: "SNA Family Trust", promoter: true, sharesCr: 0.46, pct: 2.24, valueCr: 724.04 },
    { name: "Rohina Lulla", promoter: true, sharesCr: 0.43, pct: 2.12, valueCr: 684.53 },
    { name: "Anissa Khanna", promoter: true, sharesCr: 0.43, pct: 2.07, valueCr: 671.47 },
  ],
  capital: {
    price: 1574,
    priceDate: "09-Oct-2026",
    sharesCr: 20.56,
    marketCap: 32363.77,
    cash: 402.07,
    debt: 809.99,
    minority: 2.45,
    ev: 32774.14,
  },
  pay: [
    { name: "Vir S Advani", role: "Chairman & Managing Director", crore: 15.43, xMedian: 126.96 },
    { name: "B Thiagarajan", role: "Managing Director", crore: 12.48, xMedian: 102.75 },
  ],
  q1fy27: { sales: 3377.92, salesYoY: 13.3, profit: 102.5, profitYoY: -15.3, opm: 5.2 },
  updates: [
    { date: "29 Oct 2026", text: "Board meeting to approve Q2 & H1 FY27 results; trading window closed 1–31 Oct." },
    { date: "Jun 2026", text: "Shareholding: DIIs up to 28.24% (from 27.78%), FIIs down to 12.75% (from 13.80%)." },
    { date: "16 Sep 2026", text: "Postal ballot to appoint Nikhilesh Panchal as Independent Director for 5 years." },
    { date: "15 Sep 2026", text: "WJT seeks annulment of an arbitration award in Blue Star's favour; Blue Star to respond in the Dubai Court of Appeal." },
    { date: "1 Apr 2026", text: "Vir S Advani re-appointed Chairman & Managing Director for 5 years (to 31 Mar 2031)." },
    { date: "29 Jan 2026", text: "M S Unnikrishnan appointed Independent Director." },
  ],
  sources: "Screener.in; Blue Star annual reports and FY26 Directors' Report; Trendlyne (shareholding); Simply Wall St (remuneration); Value Research (minority interest).",
};

/* ───────────────────────── FADM: Wires & Cables ───────────────────────── */

export type Co = "polycab" | "kei" | "rr";
export const COMPANIES: { id: Co; name: string; color: string }[] = [
  { id: "polycab", name: "Polycab India", color: "var(--c1)" },
  { id: "kei", name: "KEI Industries", color: "var(--c2)" },
  { id: "rr", name: "R R Kabel", color: "var(--c3)" },
];

export const fadm = {
  id: "fadm-wires-cables",
  title: "Wires & Cables: Polycab vs KEI vs R R Kabel",
  kind: "Financial statement analysis · 26-slide group project",
  ownership: "Group project · Group 4, Section 3",
  course: "Financial Accounting and Decision Making (FADM), Project Part 1",
  team: ["Krishna Bajaj", "Bhakti Sharma", "Ritam Dhara", "Abhishek Dasgupta", "Sneha Mammen"],
  blurb:
    "A comparative financial analysis of India's three listed wires-and-cables makers: growth, efficiency, profitability, cash flow, leverage, shareholding, M&A history and board commentary, built from five years of statements.",
  cagr: [
    { metric: "Sales", polycab: 26.4, kei: 23.5, rr: 29.4 },
    { metric: "Total assets", polycab: 18.4, kei: 24.5, rr: 19.7 },
    { metric: "Net profit", polycab: 23.3, kei: 26.8, rr: 23.2 },
    { metric: "Share price", polycab: 38.0, kei: 51.0, rr: 76.0 },
  ],
  efficiencyYears: ["FY21", "FY22", "FY23", "FY24", "FY25"],
  salesPerAsset: { polycab: [1.25, 1.65, 1.5, 1.49, 1.63], kei: [1.39, 1.62, 1.83, 1.74, 1.35], rr: [1.58, 2.14, 2.13, 2.3, 2.17] },
  salesPerEmployee: { polycab: [189.0, 275.4, 314.6, 372.5, 406.2], kei: [213.6, 313.1, 405.2, 439.2, 474.9], rr: [null, 172.2, 184.4, 212.1, 207.1] },
  /** FY22–FY24 source data (₹ Cr), slide 26 */
  source: {
    years: ["FY22", "FY23", "FY24"],
    polycab: { sales: [12203.76, 14107.78, 18039.44], profit: [917.28, 1283.09, 1802.92], ca: [5141.14, 6908.75, 8713.96], cl: [1741.33, 2620.49, 3594.14], assets: [7411.91, 9425.48, 12078.88], equity: [5543.74, 6637.21, 8187.13] },
    kei: { sales: [5726.55, 6908.17, 8120.73], profit: [376.02, 477.34, 580.73], ca: [2961.07, 3161.33, 3697.71], cl: [1332.66, 1117.55, 1431.34], assets: [3527.06, 3770.15, 4656.46], equity: [2135.53, 2589.18, 3148.26] },
    rr: { sales: [4385.94, 5599.2, 6594.57], profit: [213.93, 189.87, 298.13], ca: [1524.85, 1946.11, 1995.33], cl: [712.51, 1099.58, 942.18], assets: [2050.64, 2633.62, 2869.3], equity: [1250.3, 1419.69, 1828.5] },
  },
  deals: [
    { year: 2021, company: "Polycab", target: "Silvan Innovation Labs", type: "Acquisition", value: 18.2, status: "Disclosed" },
    { year: 2021, company: "Polycab", target: "Ryker Base Pvt. Ltd.", type: "Divestment / exit", value: 323.0, status: "Disclosed" },
    { year: 2022, company: "R R Kabel", target: "Luminous Home Electricals", type: "Segment carve-out", value: 0, status: "Value undisclosed" },
    { year: 2023, company: "KEI", target: "Gujarat expansion land", type: "Asset greenfield", value: 45.0, status: "Estimated" },
    { year: 2025, company: "KEI", target: "Rajasthan land parcel", type: "Asset brownfield", value: 93.58, status: "Disclosed" },
    { year: 2025, company: "KEI", target: "Sanand-II industrial plot", type: "Asset greenfield", value: 23.05, status: "Disclosed" },
    { year: 2026, company: "KEI", target: "Solarcraft Power India 24", type: "Captive utility (26%)", value: 5.9, status: "Disclosed" },
  ],
  takeaways: [
    "R R Kabel grew sales fastest (29.4% 5-year CAGR) and turns its assets over most often, above 2x sales per rupee of assets since FY22.",
    "KEI compounded net profit fastest (26.8% CAGR) and leads on sales per employee, reaching ₹474.9 lakh in FY25.",
    "Polycab is the scale leader, with FY24 sales of ₹18,039 Cr, about 2.2x KEI's and 2.7x R R Kabel's.",
    "All three keep borrowings low relative to net worth; growth was funded mainly from internal accruals and equity raises such as R R Kabel's 2023 IPO and KEI's 2024 QIP.",
  ],
  slides: [
    "Cover page", "Business overview", "Growth trends", "Efficiency ratio", "Comparative analysis", "Executive M&A dashboard",
    "Chronological M&A ledger", "Post-acquisition impact matrix", "Shareholding pattern", "Business segments", "Group structure & investments",
    "Sectoral index", "Financing & leverage shifts", "Balance sheet", "Income statement", "Major announcements", "Sources & assumptions",
    "Profit analysis", "Expense analysis", "Polycab cash flow", "R R Kabel cash flow", "KEI Industries cash flow", "Board of directors' report",
    "Inter-firm analysis", "Intra-firm analysis", "Source data",
  ],
};

/* ───────────────────────── Eternal (formerly Zomato) ───────────────────────── */
// Figures copied from "Eternal_Company_Profile.pdf" (individual work, Ritam Dhara).
// null = not meaningful (NM) in the source, e.g. P/E in a loss year.

export const eternal = {
  id: "eternal",
  title: "Eternal Ltd",
  kind: "Equity research · One-page company summary",
  ownership: "Individual work",
  blurb:
    "A one-page equity snapshot of Eternal (formerly Zomato): the turn from losses to profit, the jump in revenue after Blinkit moved to owning its inventory, ownership with no promoter group, leadership pay, capital structure and the latest quarter.",
  about:
    "Eternal Ltd (formerly Zomato Ltd, renamed in 2025) is a Gurugram-based consumer-internet group in the Nifty 50. It runs Zomato (food delivery), Blinkit (quick commerce), District (dining, movies, events) and Hyperpure (B2B supplies to restaurants).",
  businesses: [
    { name: "Zomato", what: "Food delivery" },
    { name: "Blinkit", what: "Quick commerce · 2,751 dark stores (Sep-2026), inventory-owned since FY26" },
    { name: "District", what: "Going out: dining, movies, events" },
    { name: "Hyperpure", what: "B2B supplies to restaurants · FY26 revenue ₹5,366 Cr" },
  ],
  years: ["FY22", "FY23", "FY24", "FY25", "FY26"],
  sales: [4192, 7079, 12114, 20243, 54364],
  salesGrowth: [110.23, 68.87, 71.13, 67.1, 168.56],
  ebitda: [-1851, -1211, 43, 637, 1208],
  ebitdaMargin: [-44.16, -17.11, 0.35, 3.15, 2.22],
  ebitMargin: [-28.82, -13.65, 3.0, 4.2, 1.85],
  netProfit: [-1222, -971, 351, 527, 366],
  netMargin: [-29.15, -13.72, 2.9, 2.6, 0.67],
  eps: [-1.54, -1.14, 0.4, 0.55, 0.38],
  pe: [null, null, 455.25, 366.73, 602.58] as (number | null)[],
  evEbitda: [null, null, 3676.3, 284.73, 176.74] as (number | null)[],
  evSales: [14.64, 5.95, 13.05, 8.96, 3.93],
  pb: [3.81, 2.19, 7.74, 6.03, 6.79],
  roe: [-10.12, -5.4, 1.76, 2.08, 1.19],
  roce: [-9.76, -5.29, 1.77, 3.18, 2.96],
  shareholding: [
    { name: "DIIs", pct: 36.22 },
    { name: "FIIs", pct: 33.01 },
    { name: "Public", pct: 26.26 },
    { name: "Others (ESOP trust)", pct: 4.53 },
    { name: "Promoters", pct: 0 },
  ],
  topHolders: [
    { name: "Info Edge (India) Ltd", pct: 12.38, valueCr: 38893.04 },
    { name: "Foodie Bay Employees ESOP Trust", pct: 4.53, valueCr: 14245.3 },
    { name: "Deepinder Goyal", pct: 4.4, valueCr: 13811.08 },
    { name: "HDFC Flexi Cap Fund", pct: 4.12, valueCr: 12955.22 },
    { name: "SBI Nifty 50 ETF", pct: 3.48, valueCr: 10934.63 },
    { name: "Kotak Flexicap Fund", pct: 2.59, valueCr: 8128.25 },
    { name: "ICICI Pru Balanced Advantage Fund", pct: 2.41, valueCr: 7562.07 },
    { name: "Nippon India ETF Nifty 50 BeES", pct: 2.28, valueCr: 7164.39 },
    { name: "UTI Flexi Cap Fund", pct: 2.07, valueCr: 6500.28 },
    { name: "NPS Trust – SBI Pension Fund (State Govt)", pct: 1.88, valueCr: 5894.49 },
  ],
  capital: { price: 325.55, priceDate: "26-Oct-2026", sharesCr: 965.04, marketCap: 314167.17, cash: 16475, debt: 5757, minority: 0, ev: 303449.17 },
  leadership: [
    { name: "Albinder S. Dhindsa", role: "CEO (from 1-Feb-2026)", pay: "Not disclosed in sources used" },
    { name: "Deepinder Goyal", role: "Vice Chairman & Non-Executive Director", pay: "Nil · salary waived to Mar-26" },
    { name: "Akshant Goyal", role: "CFO", pay: "Nil · salary forgone since Jan-22" },
    { name: "Kaushik Dutta", role: "Chairman & Independent Director", pay: "₹1.00 Cr p.a. + sitting fees" },
  ],
  q2fy27: { revenue: 24138, revenueYoY: 78, lfl: 58, profit: 125, profitYoY: 92, adjEbitda: 666, adjEbitdaYoY: 197 },
  updates: [
    { date: "21 Oct 2026", text: "Q2 FY27: revenue ₹24,138 Cr (+78% YoY, 58% like-for-like), net profit ₹125 Cr (+92%), Adj. EBITDA ₹666 Cr (+197%); profit missed street estimates and the stock fell ~3.5%." },
    { date: "21 Oct 2026", text: "Blinkit added 308 stores to reach 2,751; targets more than 3,500 by Mar-2027 and 5,000 by Mar-2028." },
    { date: "21 Oct 2026", text: "Board approved moving the India going-out business into a subsidiary, and an Adonmo–MyGate share swap (~₹156 Cr)." },
    { date: "Sep 2026", text: "Shareholding: FIIs up to 33.01% (from 29.09%), DIIs down to 36.22% (from 39.21%)." },
    { date: "26 Aug 2026", text: "16th AGM adopted FY26 accounts; Sanjeev Bikhchandani (Info Edge nominee) re-appointed." },
    { date: "1 Feb 2026", text: "Albinder S. Dhindsa (Blinkit CEO) became CEO of Eternal; Deepinder Goyal stepped down as MD & CEO." },
  ],
  sources: "Screener.in; Eternal annual reports (FY25, FY26 Board report); exchange shareholding filings and Q2 FY27 shareholders' letter; Yahoo Finance (price and volume).",
};

// ─────────────────────────────────────────────────────────────
// PIDILITE INDUSTRIES — DCF valuation by Ritam (PDF, data as on 12 Nov 2026).
// Every number below is copied from that PDF; derived figures are computed in the panel and labelled.
// ─────────────────────────────────────────────────────────────
export const pidilite = {
  id: "pidilite",
  title: "Pidilite Industries",
  kind: "Equity valuation · Discounted cash flow (FCFF) model",
  ownership: "Individual work",
  blurb:
    "A full DCF valuation of Pidilite (Fevicol, Dr. Fixit, Roff): WACC built from first principles, an eight-year FCFF forecast, a terminal value, the equity bridge, a WACC × growth sensitivity grid and a reverse-DCF check, read alongside the Q4 FY26 earnings call.",
  snapshot: {
    sector: "Specialty Chemicals", marketCap: 160008, price: 1571, high52: 1708, low52: 1259, pe: 59.6, bookValue: 110,
    divYield: 0.74, roce: 31.0, roe: 23.9, dataDate: "12 Nov 2026", source: "Screener.in, consolidated",
    business: "Adhesives, sealants, construction chemicals, craft & DIY products, polymer emulsions; flagship brand Fevicol",
  },
  wacc: { rf: 7.22, erp: 7.08, beta: 0.41, ke: 10.12, kdPre: 7.62, tax: 25, kdPost: 5.71, equity: 159988, debt: 417, eqWeight: 99.74, debtWeight: 0.26, wacc: 10.11 },
  // Mar-20 … Mar-26 actual, Mar-27 … Mar-34 forecast (₹ Cr)
  years: ["FY20", "FY21", "FY22", "FY23", "FY24", "FY25", "FY26", "FY27", "FY28", "FY29", "FY30", "FY31", "FY32", "FY33", "FY34"],
  actualCount: 7,
  growth: [null, null, null, null, null, null, null, 13.0, 12.0, 11.5, 11.0, 10.0, 9.0, 7.5, 6.5] as (number | null)[],
  revenue: [7294.47, 7292.71, 9920.96, 11799.1, 12382.99, 13140.3, 14601.0, 16499.13, 18479.03, 20604.11, 22870.57, 25157.62, 27421.81, 29478.44, 31394.54],
  ebitda: [1576.02, 1686.35, 1856.41, 1986.09, 2708.45, 3010.58, 3521.3, 3629.81, 4065.39, 4532.9, 5031.52, 5534.68, 6032.8, 6485.26, 6906.8],
  capex: [490, 356, 376, 513, 565, 456, 597, 723.81, 810.66, 903.89, 1003.32, 1103.65, 1202.98, 1293.2, 1377.26],
  fcff: [734.52, 767.01, 535.31, 780.07, 1909.59, 1744.56, 1776.65, 1798.44, 1963.48, 2205.71, 2466.74, 2754.44, 3047.89, 3351.63, 3624.09],
  pv: [null, null, null, null, null, null, null, 1713.9, 1699.4, 1733.79, 1760.97, 1785.84, 1794.68, 1792.36, 1760.14] as (number | null)[],
  periods: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5],
  terminal: { g: 5.5, fcfNext: 3823.42, tv: 82967.27, pvTv: 40295.36 },
  pvFcff: 14041.08,
  bridge: { ev: 54336.45, cash: 4218.73, otherAssets: 429.78, debt: 417.0, minority: 216.48, equity: 58351.48, shares: 101.78, perShare: 573.31, cmp: 1571.9, overBy: 174.2, dcfPctMcap: 36.5 },
  sensitivity: {
    wacc: [8.0, 9.0, 10.11, 11.0, 12.0],
    g: [3.5, 4.5, 5.5, 6.5, 7.5],
    grid: [
      [648.56, 534.28, 448.26, 397.65, 353.66],
      [785.65, 616.44, 499.63, 434.72, 380.4],
      [1032.41, 745.56, 573.31, 485.26, 415.36],
      [1608.18, 977.97, 687.82, 558.27, 463.04],
      [4487.05, 1520.26, 890.14, 672.99, 531.91],
    ],
  },
  wcMedian: 19.9,
  tgReasons: [
    { t: "Brand strength", d: "Fevicol, Dr. Fixit and Roff enjoy strong recognition and customer loyalty." },
    { t: "Long-term consumption", d: "Urbanisation, housing demand and infrastructure support adhesives and waterproofing." },
    { t: "Room to penetrate", d: "Opportunities remain in rural India and smaller towns." },
    { t: "Pricing power", d: "Strong brands can pass on part of raw-material cost increases." },
    { t: "Maturity", d: "An established company, so perpetual growth sits below near-term growth." },
  ],
  concall: [
    { k: "₹3,272 Cr", l: "Q4 FY26 standalone revenue, +15.3% YoY" },
    { k: "15.3%", l: "Q4 underlying volume growth (C&B 15.4%, B2B 14.8%)" },
    { k: "23.4%", l: "Q4 EBITDA margin, +280 bps YoY" },
    { k: "₹14,553 Cr", l: "FY26 consolidated revenue, +11.1%; PAT +17.9%" },
    { k: "40–50%", l: "peak raw-material basket inflation (West Asia conflict)" },
    { k: "11–13%", l: "blended price increase (calculated: 4–5% in April + 7–8% in early May)" },
    { k: "20–24%", l: "EBITDA margin corridor management reaffirmed" },
    { k: "~₹570 Cr", l: "FY26 capex; new West India Fevicol plant in Q1 FY27" },
  ],
  sources: [
    "Company data: Screener.in (consolidated), 12 Nov 2026",
    "Risk-free rate: 10-year Indian government bond yield",
    "Equity risk premium and cost of debt: Aswath Damodaran (NYU Stern)",
    "Beta: Investing.com",
    "Concall: Pidilite Q4 FY26 earnings call",
  ],
};
