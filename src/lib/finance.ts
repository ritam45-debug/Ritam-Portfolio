export interface DcfInput {
  baseRevenue: number;
  growth: number; // %
  ebitdaMargin: number; // %
  taxRate: number; // %
  reinvestmentRate: number; // % of NOPAT
  wacc: number; // %
  terminalGrowth: number; // %
  netDebt: number;
  shares: number;
}

export interface DcfYear {
  year: string;
  revenue: number;
  fcf: number;
  pv: number;
}

export interface DcfResult {
  years: DcfYear[];
  sumPv: number;
  terminalValue: number;
  pvTerminal: number;
  enterpriseValue: number;
  equityValue: number;
  perShare: number;
  terminalShare: number; // % of EV from terminal value
  valid: boolean;
  message?: string;
}

/**
 * Simple FCFF DCF. EBITDA is used as a proxy for EBIT (D&A is netted inside
 * the reinvestment rate) — fine for a teaching tool, stated on screen.
 */
export function runDcf(i: DcfInput, horizon = 5): DcfResult {
  const w = i.wacc / 100;
  const g = i.terminalGrowth / 100;
  if (w <= g) {
    return { years: [], sumPv: 0, terminalValue: 0, pvTerminal: 0, enterpriseValue: 0, equityValue: 0, perShare: 0, terminalShare: 0, valid: false, message: "WACC must be higher than terminal growth for the Gordon growth formula to work." };
  }
  const years: DcfYear[] = [];
  let revenue = i.baseRevenue;
  let lastFcf = 0;
  for (let t = 1; t <= horizon; t++) {
    revenue *= 1 + i.growth / 100;
    const nopat = revenue * (i.ebitdaMargin / 100) * (1 - i.taxRate / 100);
    const fcf = nopat * (1 - i.reinvestmentRate / 100);
    const pv = fcf / Math.pow(1 + w, t);
    years.push({ year: `Y${t}`, revenue, fcf, pv });
    lastFcf = fcf;
  }
  const sumPv = years.reduce((s, y) => s + y.pv, 0);
  const terminalValue = (lastFcf * (1 + g)) / (w - g);
  const pvTerminal = terminalValue / Math.pow(1 + w, horizon);
  const enterpriseValue = sumPv + pvTerminal;
  const equityValue = enterpriseValue - i.netDebt;
  const perShare = i.shares > 0 ? equityValue / i.shares : 0;
  return { years, sumPv, terminalValue, pvTerminal, enterpriseValue, equityValue, perShare, terminalShare: (pvTerminal / enterpriseValue) * 100, valid: true };
}

export function breakEven(price: number, variableCost: number, fixedCost: number) {
  const contribution = price - variableCost;
  if (contribution <= 0) return { units: Infinity, contribution, marginPct: 0 };
  return { units: fixedCost / contribution, contribution, marginPct: (contribution / price) * 100 };
}
