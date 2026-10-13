// ─────────────────────────────────────────────────────────────
// TRIVIA — Finance and Marketing.
// Every question is generated fresh from three sources:
//   1. Calculation templates with random numbers (finance) — effectively endless
//   2. Glossary matching: a definition plus 3 random wrong terms — thousands of combinations
//   3. A fact bank of stable, well-documented facts
// Options are shuffled every time and recently seen questions are skipped.
// To add questions, append to the FACTS or GLOSSARY lists below.
// ─────────────────────────────────────────────────────────────

export type Deck = "finance" | "marketing";

export interface TriviaQuestion {
  key: string; // used to avoid repeats
  kind: string; // label shown on the card
  prompt: string;
  options: string[]; // exactly 4, shuffled
  answer: number; // index into options
  explain: string;
}

/* ───────────── helpers ───────────── */
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
const inr = (n: number, d = 0) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d })}`;

/** Builds a question from a correct answer and distractors; drops duplicates and tops up if needed. */
function build(key: string, kind: string, prompt: string, correct: string, distractors: string[], explain: string, filler: () => string): TriviaQuestion {
  const wrong: string[] = [];
  for (const d of distractors) if (d !== correct && !wrong.includes(d)) wrong.push(d);
  let guard = 0;
  while (wrong.length < 3 && guard++ < 50) {
    const f = filler();
    if (f !== correct && !wrong.includes(f)) wrong.push(f);
  }
  const options = shuffle([correct, ...wrong.slice(0, 3)]);
  return { key, kind, prompt, options, answer: options.indexOf(correct), explain };
}

/* ───────────── 1. finance calculations ───────────── */
type Gen = () => TriviaQuestion;

const financeCalcs: Gen[] = [
  () => {
    const eps = rand(8, 60), pe = rand(10, 45), price = eps * pe;
    const f = (v: number) => `${v.toFixed(1)}x`;
    return build(`pe-${eps}-${price}`, "Valuation maths", `A company's share trades at ${inr(price)} and its earnings per share are ${inr(eps)}. What is its P/E ratio?`,
      f(pe), [f(pe * 1.25), f(pe * 0.8), f(eps / price * 100)], `P/E = Price ÷ EPS = ${inr(price)} ÷ ${inr(eps)} = ${pe.toFixed(1)}x.`, () => f(pe + rand(-9, 9) || pe + 3));
  },
  () => {
    const r = pick([4, 6, 8, 9, 12, 18]), y = 72 / r;
    const f = (v: number) => `About ${Number.isInteger(v) ? v : v.toFixed(1)} years`;
    return build(`r72-${r}`, "Rule of 72", `Using the Rule of 72, roughly how long does money take to double at ${r}% a year, compounded annually?`,
      f(y), [f(100 / r), f(r * 2), f(y * 2)], `Rule of 72: years to double ≈ 72 ÷ rate = 72 ÷ ${r} = ${Number.isInteger(y) ? y : y.toFixed(1)}.`, () => f(rand(2, 30)));
  },
  () => {
    const p = pick([10000, 20000, 25000, 50000, 100000]), r = pick([5, 8, 10, 12]), n = pick([2, 3]);
    const fv = p * Math.pow(1 + r / 100, n), si = p * (1 + (r * n) / 100);
    return build(`ci-${p}-${r}-${n}`, "Time value of money", `${inr(p)} is invested at ${r}% a year, compounded annually. What is it worth after ${n} years?`,
      inr(fv), [inr(si), inr(p * (1 + r / 100)), inr(fv * (1 + r / 100))], `FV = P × (1 + r)ⁿ = ${inr(p)} × ${(1 + r / 100).toFixed(2)}^${n} = ${inr(fv)}. ${inr(si)} would be simple interest.`, () => inr(fv + rand(-5, 5) * p * 0.01));
  },
  () => {
    const cl = rand(20, 90) * 10, ratio = pick([0.8, 1.2, 1.5, 1.8, 2.0, 2.5]), ca = Math.round(cl * ratio);
    const f = (v: number) => `${v.toFixed(2)}x`;
    return build(`cr-${ca}-${cl}`, "Liquidity ratio", `Current assets are ${inr(ca)} Cr and current liabilities are ${inr(cl)} Cr. What is the current ratio?`,
      f(ca / cl), [f(cl / ca), f((ca - cl) / cl), f(ca / cl + 0.5)], `Current ratio = Current assets ÷ Current liabilities = ${f(ca / cl)}.`, () => f(rand(5, 30) / 10));
  },
  () => {
    const sales = rand(20, 120) * 100, m = pick([4, 6, 8, 10, 12, 15]), np = (sales * m) / 100;
    const f = (v: number) => `${v.toFixed(1)}%`;
    return build(`nm-${sales}-${np}`, "Profitability", `Revenue is ${inr(sales)} Cr and net profit is ${inr(np)} Cr. What is the net profit margin?`,
      f(m), [f(m * 2), f(m / 2), f((sales / np))], `Net margin = Net profit ÷ Revenue = ${inr(np)} ÷ ${inr(sales)} = ${m.toFixed(1)}%.`, () => f(rand(2, 30)));
  },
  () => {
    const eq = rand(10, 80) * 100, roe = pick([8, 12, 15, 18, 20, 25]), np = (eq * roe) / 100;
    const f = (v: number) => `${v.toFixed(1)}%`;
    return build(`roe-${eq}-${np}`, "Returns", `Net profit is ${inr(np)} Cr and shareholders' equity is ${inr(eq)} Cr. What is the return on equity?`,
      f(roe), [f(roe * 1.5), f(roe / 2), f(100 - roe)], `ROE = Net profit ÷ Shareholders' equity = ${roe.toFixed(1)}%.`, () => f(rand(3, 40)));
  },
  () => {
    const price = pick([200, 250, 400, 500, 800, 1000]), y = pick([1, 1.5, 2, 2.5, 3, 4]), dps = (price * y) / 100;
    const f = (v: number) => `${v.toFixed(1)}%`;
    return build(`dy-${price}-${dps}`, "Investor returns", `A share priced at ${inr(price)} pays an annual dividend of ${inr(dps, 2)}. What is its dividend yield?`,
      f(y), [f(y * 10), f(y / 2), f(y + 2)], `Dividend yield = DPS ÷ Price = ${inr(dps, 2)} ÷ ${inr(price)} = ${y.toFixed(1)}%.`, () => f(rand(1, 9) + 0.5));
  },
  () => {
    const mcap = rand(20, 90) * 100, debt = rand(2, 20) * 100, cash = rand(1, 10) * 100, ev = mcap + debt - cash;
    return build(`ev-${mcap}-${debt}-${cash}`, "Enterprise value", `Market cap ${inr(mcap)} Cr, total debt ${inr(debt)} Cr, cash ${inr(cash)} Cr. What is the enterprise value (ignoring minority interest)?`,
      `${inr(ev)} Cr`, [`${inr(mcap + debt + cash)} Cr`, `${inr(mcap - debt + cash)} Cr`, `${inr(mcap - debt - cash)} Cr`], `EV = Market cap + Debt − Cash = ${inr(ev)} Cr.`, () => `${inr(ev + rand(-8, 8) * 100)} Cr`);
  },
  () => {
    const eq = rand(10, 60) * 100, de = pick([0.25, 0.5, 0.8, 1.2, 1.5, 2]), debt = Math.round(eq * de);
    const f = (v: number) => `${v.toFixed(2)}x`;
    return build(`de-${debt}-${eq}`, "Leverage", `Total debt is ${inr(debt)} Cr and shareholders' equity is ${inr(eq)} Cr. What is the debt-to-equity ratio?`,
      f(debt / eq), [f(eq / debt), f(debt / (debt + eq)), f(debt / eq + 1)], `D/E = Debt ÷ Equity = ${f(debt / eq)}.`, () => f(rand(1, 30) / 10));
  },
  () => {
    const begin = pick([100, 200, 500, 1000]), mult = pick([[2, 5, 14.9], [3, 5, 24.6], [2, 4, 18.9], [1.5, 3, 14.5], [2, 3, 26.0]] as const);
    const end = begin * mult[0];
    const f = (v: number) => `${v.toFixed(1)}%`;
    const simple = ((mult[0] - 1) / mult[1]) * 100;
    return build(`cagr-${begin}-${mult[0]}-${mult[1]}`, "Growth maths", `Revenue grew from ${inr(begin)} Cr to ${inr(end)} Cr over ${mult[1]} years. What is the CAGR (to one decimal)?`,
      f(mult[2]), [f(simple), f((mult[0] - 1) * 100), f(mult[2] * 1.6)], `CAGR = (End ÷ Begin)^(1/n) − 1 = ${mult[0]}^(1/${mult[1]}) − 1 ≈ ${mult[2].toFixed(1)}%. ${simple.toFixed(1)}% is the simple average, which overstates compounding.`, () => f(rand(8, 40)));
  },
  () => {
    const p = pick([150, 200, 250, 300, 400]), v = Math.round(p * pick([0.4, 0.5, 0.6, 0.7])), fc = (p - v) * pick([1000, 2000, 2500, 4000, 5000]);
    const u = fc / (p - v);
    const f = (n: number) => `${Math.round(n).toLocaleString("en-IN")} units`;
    return build(`be-${p}-${v}-${fc}`, "Break-even", `Price ${inr(p)} per unit, variable cost ${inr(v)} per unit, fixed costs ${inr(fc)}. How many units to break even?`,
      f(u), [f(fc / p), f(fc / v), f(u * 2)], `Break-even = Fixed costs ÷ (Price − Variable cost) = ${inr(fc)} ÷ ${inr(p - v)} = ${f(u)}.`, () => f(u + rand(-5, 5) * 100 || u + 300));
  },
  () => {
    const sales = rand(30, 150) * 100, gm = pick([20, 25, 30, 35, 40, 45]), cogs = sales * (1 - gm / 100);
    const f = (v: number) => `${v.toFixed(1)}%`;
    return build(`gm-${sales}-${cogs}`, "Profitability", `Sales are ${inr(sales)} Cr and cost of goods sold is ${inr(cogs)} Cr. What is the gross margin?`,
      f(gm), [f(100 - gm), f((cogs / sales) * 50), f(gm / 2)], `Gross margin = (Sales − COGS) ÷ Sales = ${gm.toFixed(1)}%.`, () => f(rand(10, 60)));
  },
];


/* ───────────── marketing maths ───────────── */
const marketingCalcs: Gen[] = [
  () => {
    const visitors = pick([2000, 4000, 5000, 8000, 10000]), rate = pick([1.5, 2, 2.5, 3, 4, 5]), buyers = Math.round((visitors * rate) / 100);
    const f = (v: number) => `${v.toFixed(1)}%`;
    return build(`conv-${visitors}-${buyers}`, "Funnel maths", `A landing page gets ${visitors.toLocaleString("en-IN")} visitors and ${buyers.toLocaleString("en-IN")} of them buy. What is the conversion rate?`,
      f(rate), [f(rate * 10), f(rate / 2), f(100 - rate)], `Conversion rate = Buyers ÷ Visitors = ${buyers} ÷ ${visitors} = ${rate.toFixed(1)}%.`, () => f(rand(1, 12) + 0.5));
  },
  () => {
    const imp = pick([50000, 80000, 100000, 200000]), ctr = pick([0.5, 0.8, 1, 1.2, 2, 2.5]), clicks = Math.round((imp * ctr) / 100);
    const f = (v: number) => `${v.toFixed(1)}%`;
    return build(`ctr-${imp}-${clicks}`, "Digital metrics", `An ad was shown ${imp.toLocaleString("en-IN")} times and clicked ${clicks.toLocaleString("en-IN")} times. What is its click-through rate?`,
      f(ctr), [f(ctr * 10), f(ctr / 2), f(ctr + 1)], `CTR = Clicks ÷ Impressions = ${ctr.toFixed(1)}%.`, () => f(rand(1, 9) / 2));
  },
  () => {
    const spend = pick([50000, 100000, 200000, 300000]), cust = pick([50, 80, 100, 125, 200, 250]), cac = spend / cust;
    return build(`cac-${spend}-${cust}`, "Unit economics", `A brand spends ${inr(spend)} on marketing in a month and wins ${cust} new customers. What is its customer acquisition cost?`,
      inr(cac), [inr(cac * 2), inr(cac / 2), inr(spend / (cust * 10))], `CAC = Marketing spend ÷ New customers = ${inr(spend)} ÷ ${cust} = ${inr(cac)}.`, () => inr(cac + rand(-5, 5) * 100 || cac + 250));
  },
  () => {
    const order = pick([400, 500, 600, 800, 1000]), freq = pick([4, 6, 8, 10, 12]), yrs = pick([2, 3, 4, 5]), margin = pick([20, 25, 30, 40]);
    const clv = (order * freq * yrs * margin) / 100;
    return build(`clv-${order}-${freq}-${yrs}-${margin}`, "Unit economics", `A customer orders ${freq} times a year at ${inr(order)} per order, stays ${yrs} years, and each order earns a ${margin}% margin. What is their lifetime value in profit?`,
      inr(clv), [inr(order * freq * yrs), inr(clv / yrs), inr(order * freq * margin / 100)], `CLV = ${inr(order)} × ${freq} × ${yrs} × ${margin}% = ${inr(clv)}. Revenue alone would be ${inr(order * freq * yrs)}.`, () => inr(clv + rand(-6, 6) * 500 || clv + 1000));
  },
  () => {
    const prom = pick([40, 45, 50, 55, 60, 65, 70]), det = pick([10, 15, 20, 25]), nps = prom - det;
    return build(`nps-${prom}-${det}`, "Customer metrics", `In a survey, ${prom}% are promoters (9–10), ${det}% are detractors (0–6) and the rest are passives. What is the Net Promoter Score?`,
      `${nps}`, [`${prom}`, `${prom + det}`, `${100 - det}`], `NPS = % promoters − % detractors = ${prom} − ${det} = ${nps}. Passives are ignored.`, () => `${nps + rand(-15, 15) || nps + 7}`);
  },
  () => {
    const brand = pick([120, 150, 200, 240, 300]), total = pick([1000, 1200, 1500, 2000]), share = (brand / total) * 100;
    const f = (v: number) => `${v.toFixed(1)}%`;
    return build(`ms-${brand}-${total}`, "Market share", `A brand sells ${inr(brand)} Cr in a category worth ${inr(total)} Cr. What is its market share?`,
      f(share), [f(share * 2), f(100 - share), f(share / 2)], `Market share = Brand sales ÷ Category sales = ${f(share)}.`, () => f(rand(4, 40)));
  },
  () => {
    const pct = pick([5, 10, 20]), e = pick([0.5, 1.5, 2, 2.5]), q = pct * e;
    const f = (v: number) => `${v.toFixed(1)}%`;
    return build(`ped-${pct}-${e}`, "Pricing", `Price elasticity of demand is −${e}. If the price is cut by ${pct}%, by roughly how much does quantity demanded rise?`,
      f(q), [f(pct / e), f(pct), f(q * 2)], `% change in quantity ≈ elasticity × % change in price = ${e} × ${pct}% = ${q.toFixed(1)}%. ${e > 1 ? "Demand is elastic, so revenue rises." : "Demand is inelastic, so revenue falls."}`, () => f(rand(2, 40)));
  },
  () => {
    const cost = pick([200, 300, 400, 500, 800]), mu = pick([20, 25, 40, 50, 60]), price = cost * (1 + mu / 100), margin = (mu / (100 + mu)) * 100;
    const f = (v: number) => `${v.toFixed(1)}%`;
    return build(`mu-${cost}-${mu}`, "Pricing", `A retailer buys at ${inr(cost)} and sells at ${inr(price)}. What is its margin on the selling price?`,
      f(margin), [f(mu), f(100 - margin), f(margin / 2)], `Margin = (Price − Cost) ÷ Price = ${inr(price - cost)} ÷ ${inr(price)} = ${f(margin)}. ${mu}% is the markup on cost.`, () => f(rand(10, 50)));
  },
];

/* ───────────── 2. glossaries ───────────── */
const FIN_GLOSSARY: [string, string][] = [
  ["EBITDA", "Earnings before interest, taxes, depreciation and amortisation"],
  ["Free cash flow", "Operating cash flow minus capital expenditure"],
  ["Working capital", "Current assets minus current liabilities"],
  ["WACC", "The blended cost of a firm's debt and equity, weighted by their share of capital"],
  ["Beta", "A measure of a stock's sensitivity to movements in the overall market"],
  ["Terminal value", "The value of a business's cash flows beyond the explicit forecast period in a DCF"],
  ["Book value", "Total assets minus total liabilities as recorded on the balance sheet"],
  ["Market capitalisation", "Share price multiplied by the number of shares outstanding"],
  ["Dividend payout ratio", "The share of net profit paid out to shareholders as dividends"],
  ["Coupon", "The periodic interest payment a bond makes to its holder"],
  ["Yield to maturity", "The total annual return on a bond if held until it matures"],
  ["Liquidity", "How quickly an asset can be converted into cash without a big loss in value"],
  ["Hedging", "Taking an offsetting position to reduce the risk of an existing exposure"],
  ["Arbitrage", "Profiting from a price difference for the same asset in different markets"],
  ["IPO", "A company's first sale of shares to the public"],
  ["Qualified institutional placement", "An Indian route for listed companies to raise equity from institutional buyers"],
  ["Rights issue", "An offer letting existing shareholders buy new shares in proportion to their holding"],
  ["Stock split", "Dividing each existing share into several shares, lowering the price per share"],
  ["Goodwill", "The premium paid in an acquisition over the fair value of identifiable net assets"],
  ["Depreciation", "Spreading the cost of a tangible asset over its useful life"],
  ["Amortisation", "Spreading the cost of an intangible asset over its useful life"],
  ["Leverage", "Using borrowed money to increase the potential return on equity"],
  ["Diversification", "Spreading investments across assets to reduce unsystematic risk"],
  ["Net present value", "The present value of future cash flows minus the initial investment"],
  ["Internal rate of return", "The discount rate at which a project's NPV equals zero"],
  ["Contribution margin", "Selling price per unit minus variable cost per unit"],
  ["Operating leverage", "The degree to which fixed costs amplify changes in sales into changes in operating profit"],
  ["Accounts receivable", "Money owed to a company by customers who bought on credit"],
  ["Inventory turnover", "Cost of goods sold divided by average inventory"],
  ["Promoter holding", "The share of an Indian company's equity held by its founders or controlling group"],
];

const MKT_GLOSSARY: [string, string][] = [
  ["Segmentation", "Dividing a market into distinct groups of buyers with different needs or behaviours"],
  ["Targeting", "Choosing which market segments to serve"],
  ["Positioning", "Designing an offer and image to occupy a distinct place in the target customer's mind"],
  ["Brand equity", "The added value a brand name gives a product beyond its functional benefits"],
  ["Customer lifetime value", "The total profit a business expects from a customer over the whole relationship"],
  ["Customer acquisition cost", "The total sales and marketing spend needed to win one new customer"],
  ["Churn rate", "The percentage of customers who stop buying or cancel in a given period"],
  ["Net Promoter Score", "A loyalty metric: % promoters minus % detractors on a 0–10 'would you recommend' scale"],
  ["Market penetration", "Growing by selling more of existing products to existing markets"],
  ["Market development", "Growing by taking existing products into new markets"],
  ["Product development", "Growing by creating new products for existing markets"],
  ["Diversification (Ansoff)", "Growing with new products in new markets"],
  ["Penetration pricing", "Launching at a low price to win market share quickly"],
  ["Price skimming", "Launching at a high price and lowering it over time"],
  ["Cannibalisation", "When a company's new product takes sales from its own existing products"],
  ["Brand extension", "Using an established brand name to launch a product in a new category"],
  ["Line extension", "Adding new variants such as flavours or sizes within the same category under one brand"],
  ["Point of purchase", "Marketing material placed where the customer makes the buying decision"],
  ["General trade", "India's traditional retail channel of kirana and neighbourhood stores"],
  ["Modern trade", "Organised retail such as supermarkets and hypermarket chains"],
  ["Quick commerce", "Retail promising delivery within minutes from nearby dark stores"],
  ["Share of voice", "A brand's share of total advertising in its category"],
  ["Conversion rate", "The share of visitors or leads who complete a desired action such as a purchase"],
  ["Click-through rate", "Clicks on an ad divided by the number of times it was shown"],
  ["Unique selling proposition", "The single benefit that sets a product apart from competitors"],
  ["Pull strategy", "Building consumer demand so customers ask retailers for the product"],
  ["Push strategy", "Using trade promotions and the sales force to push the product through channels"],
  ["Psychographic segmentation", "Grouping customers by lifestyle, values and personality"],
  ["Word-of-mouth marketing", "Customers sharing recommendations with each other, often encouraged by the brand"],
  ["Loss leader", "A product sold below cost to attract customers who then buy other items"],
];

function glossaryGen(list: [string, string][], deck: Deck): TriviaQuestion {
  const [term, def] = pick(list);
  if (Math.random() < 0.5) {
    // Reverse: show the term, pick the right definition.
    const wrongDefs = shuffle(list.filter(([t]) => t !== term)).slice(0, 3).map(([, d]) => d);
    return build(`${deck}-gr-${term}`, "What does it mean?", `What does "${term}" mean?`, def, wrongDefs, `${term}: ${def.charAt(0).toLowerCase() + def.slice(1)}.`, () => pick(list)[1]);
  }
  const others = shuffle(list.filter(([t]) => t !== term)).slice(0, 3).map(([t]) => t);
  return build(`${deck}-g-${term}`, "Name the term", `Which term matches this definition? "${def}."`, term, others, `${term}: ${def.charAt(0).toLowerCase() + def.slice(1)}.`, () => pick(list)[0]);
}

/* ───────────── 3. fact banks (stable, well-documented facts) ───────────── */
type Fact = { q: string; a: string; wrong: [string, string, string]; why: string; kind: string };

const FIN_FACTS: Fact[] = [
  { kind: "Markets history", q: "In which year was the Bombay Stock Exchange founded, making it Asia's oldest stock exchange?", a: "1875", wrong: ["1925", "1947", "1992"], why: "The BSE traces its origin to 1875, as the Native Share & Stock Brokers' Association." },
  { kind: "Indian institutions", q: "When was the Reserve Bank of India established?", a: "1 April 1935", wrong: ["15 August 1947", "26 January 1950", "1 April 1969"], why: "The RBI began operations on 1 April 1935 under the RBI Act, 1934; it was nationalised in 1949." },
  { kind: "Indian institutions", q: "SEBI was set up in 1988. In which year did it get statutory powers through an Act of Parliament?", a: "1992", wrong: ["1988", "1996", "2002"], why: "The SEBI Act, 1992 gave the regulator statutory status." },
  { kind: "Indices", q: "What is the base year of the S&P BSE Sensex?", a: "1978-79", wrong: ["1947-48", "1991-92", "2000-01"], why: "The Sensex has a base of 100 in 1978-79." },
  { kind: "Indices", q: "How many stocks make up the BSE Sensex?", a: "30", wrong: ["50", "100", "500"], why: "The Sensex tracks 30 large, liquid BSE-listed companies; the Nifty tracks 50 on the NSE." },
  { kind: "Theory", q: "The theory that, in perfect markets, a firm's value does not depend on its capital structure is named after…", a: "Modigliani and Miller", wrong: ["Black and Scholes", "Fama and French", "Markowitz and Sharpe"], why: "Franco Modigliani and Merton Miller published the capital structure irrelevance proposition in 1958." },
  { kind: "Theory", q: "Which model prices European options using volatility, time, strike price and the risk-free rate?", a: "Black–Scholes model", wrong: ["Gordon growth model", "CAPM", "DuPont model"], why: "Fischer Black and Myron Scholes published it in 1973; Robert Merton extended it." },
  { kind: "Theory", q: "Who introduced Modern Portfolio Theory and the efficient frontier in 1952?", a: "Harry Markowitz", wrong: ["Warren Buffett", "John Maynard Keynes", "Eugene Fama"], why: "Markowitz's 1952 paper 'Portfolio Selection' founded Modern Portfolio Theory." },
  { kind: "Ratios", q: "The DuPont analysis breaks Return on Equity into which three parts?", a: "Net margin × Asset turnover × Equity multiplier", wrong: ["Gross margin × Current ratio × Beta", "EPS × P/E × Dividend yield", "EBITDA × WACC × Tax rate"], why: "ROE = (Net income/Sales) × (Sales/Assets) × (Assets/Equity)." },
  { kind: "Ratios", q: "The Sharpe ratio measures…", a: "Excess return per unit of total risk (standard deviation)", wrong: ["Return per unit of market risk (beta)", "Profit per employee", "Dividends per share"], why: "Sharpe = (Portfolio return − Risk-free rate) ÷ Standard deviation. Return per unit of beta is the Treynor ratio." },
  { kind: "Valuation", q: "In the Gordon growth model, the value of a stock equals next year's dividend divided by…", a: "Cost of equity minus the dividend growth rate", wrong: ["Cost of debt plus inflation", "Dividend growth rate minus cost of equity", "The risk-free rate"], why: "P₀ = D₁ ÷ (k − g), valid only when k > g." },
  { kind: "Valuation", q: "In CAPM, a stock's expected return is the risk-free rate plus…", a: "Beta × market risk premium", wrong: ["Beta × risk-free rate", "Dividend yield × growth", "Standard deviation × market return"], why: "E(R) = Rf + β × (Rm − Rf)." },
  { kind: "Accounting", q: "Which financial statement shows a company's position at a single point in time?", a: "Balance sheet", wrong: ["Income statement", "Cash flow statement", "Statement of changes in equity"], why: "The balance sheet is a snapshot on a date; the others cover a period." },
  { kind: "Accounting", q: "Under the indirect method, depreciation is added back to net profit in the cash flow statement because it is…", a: "A non-cash expense", wrong: ["A source of financing", "A tax refund", "An investing inflow"], why: "Depreciation reduces profit but no cash leaves the business, so it is added back." },
  { kind: "Banking", q: "The rate at which the RBI lends short-term funds to commercial banks against government securities is the…", a: "Repo rate", wrong: ["Reverse repo rate", "Bank rate", "Cash reserve ratio"], why: "Repo = repurchase agreement; banks borrow from the RBI by selling securities with an agreement to buy them back." },
  { kind: "Banking", q: "The share of deposits banks must keep with the RBI as cash, earning no interest, is the…", a: "Cash Reserve Ratio (CRR)", wrong: ["Statutory Liquidity Ratio (SLR)", "Capital Adequacy Ratio", "Repo rate"], why: "CRR is held with the RBI; SLR is held by the bank itself in liquid assets such as government securities." },
  { kind: "Markets", q: "A market in which prices are falling by 20% or more from a recent high is commonly called a…", a: "Bear market", wrong: ["Bull market", "Sideways market", "Primary market"], why: "A bear market is conventionally a fall of 20% or more from a peak." },
  { kind: "Markets", q: "What does 'T+1' settlement, adopted for Indian equities, mean?", a: "Trades settle one business day after the trade date", wrong: ["Trades settle within one hour", "Tax is paid one day later", "Shares can be sold one day after purchase only"], why: "India completed its move to T+1 settlement for equities in January 2023." },
  { kind: "Bonds", q: "When market interest rates rise, the prices of existing fixed-rate bonds usually…", a: "Fall", wrong: ["Rise", "Stay the same", "Double"], why: "Bond prices and yields move in opposite directions." },
  { kind: "Corporate finance", q: "A company buying back its own shares from the market usually…", a: "Reduces the number of shares outstanding and can raise EPS", wrong: ["Increases its debt-to-equity to zero", "Issues new shares to the public", "Has no effect on EPS"], why: "Fewer shares outstanding spread the same profit over fewer shares." },
];

const MKT_FACTS: Fact[] = [
  { kind: "Frameworks", q: "Who proposed the 4Ps of marketing (Product, Price, Place, Promotion) in 1960?", a: "E. Jerome McCarthy", wrong: ["Philip Kotler", "Peter Drucker", "Michael Porter"], why: "McCarthy grouped Neil Borden's 'marketing mix' into the 4Ps in 1960." },
  { kind: "Thinkers", q: "Who wrote 'Marketing Myopia' (Harvard Business Review, 1960)?", a: "Theodore Levitt", wrong: ["Philip Kotler", "Simon Sinek", "Seth Godin"], why: "Levitt argued firms should define themselves by customer needs, not products: railroads were in transportation." },
  { kind: "Thinkers", q: "'Start With Why' and the Golden Circle (Why, How, What) come from…", a: "Simon Sinek", wrong: ["Theodore Levitt", "Al Ries", "Malcolm Gladwell"], why: "Sinek's 2009 TED talk and book popularised the Golden Circle." },
  { kind: "Thinkers", q: "Who wrote 'Positioning: The Battle for Your Mind'?", a: "Al Ries and Jack Trout", wrong: ["Kotler and Keller", "Kim and Mauborgne", "Chip and Dan Heath"], why: "Ries and Trout popularised positioning in the 1970s; the book appeared in 1981." },
  { kind: "Frameworks", q: "The Ansoff Matrix maps growth options using which two dimensions?", a: "Products and markets (existing vs new)", wrong: ["Market share and market growth", "Price and quality", "Cost and differentiation"], why: "Igor Ansoff (1957): penetration, market development, product development, diversification." },
  { kind: "Frameworks", q: "The BCG matrix classifies businesses by…", a: "Relative market share and market growth rate", wrong: ["Price and promotion", "Products and markets", "Cost and differentiation"], why: "Stars, Cash cows, Question marks and Dogs, from the Boston Consulting Group." },
  { kind: "Frameworks", q: "In the BCG matrix, a business with high market share in a low-growth market is a…", a: "Cash cow", wrong: ["Star", "Question mark", "Dog"], why: "Cash cows generate more cash than they need to hold position." },
  { kind: "Frameworks", q: "What does AIDA stand for?", a: "Attention, Interest, Desire, Action", wrong: ["Awareness, Intent, Demand, Adoption", "Advertising, Influence, Distribution, Analysis", "Audience, Insight, Design, Activation"], why: "AIDA is attributed to advertising pioneer E. St. Elmo Lewis around 1898." },
  { kind: "Frameworks", q: "The 7Ps of services marketing add which three to the original 4Ps?", a: "People, Process, Physical evidence", wrong: ["Packaging, Positioning, Profit", "Partners, Platform, Purpose", "Personalisation, Privacy, Performance"], why: "Booms and Bitner extended the mix for services in 1981." },
  { kind: "Strategy", q: "Porter's generic strategies are cost leadership, differentiation and…", a: "Focus", wrong: ["Diversification", "Penetration", "Integration"], why: "Michael Porter, Competitive Strategy (1980)." },
  { kind: "Strategy", q: "'Blue Ocean Strategy' encourages firms to…", a: "Create uncontested market space instead of fighting rivals", wrong: ["Cut prices below competitors", "Expand only into overseas markets", "Copy the market leader"], why: "W. Chan Kim and Renée Mauborgne, 2005." },
  { kind: "Consumer behaviour", q: "Maslow's hierarchy places which need at the top?", a: "Self-actualisation", wrong: ["Esteem", "Safety", "Belonging"], why: "Physiological → safety → love/belonging → esteem → self-actualisation." },
  { kind: "Consumer behaviour", q: "The doubt a buyer feels just after a big purchase is called…", a: "Post-purchase (cognitive) dissonance", wrong: ["Brand recall", "Impulse buying", "Price elasticity"], why: "Reassurance through after-sales contact and reviews helps reduce it." },
  { kind: "Product", q: "The product life cycle stages, in order, are…", a: "Introduction, Growth, Maturity, Decline", wrong: ["Growth, Introduction, Decline, Maturity", "Launch, Peak, Plateau, Exit", "Awareness, Trial, Repeat, Loyalty"], why: "Sales usually peak in maturity, where competition is most intense." },
  { kind: "Product", q: "In Rogers' diffusion of innovations, the first group to adopt a new product is…", a: "Innovators", wrong: ["Early adopters", "Early majority", "Laggards"], why: "Innovators (~2.5%), early adopters (~13.5%), early majority, late majority, laggards." },
  { kind: "Pricing", q: "Setting a price at ₹499 instead of ₹500 is an example of…", a: "Psychological (charm) pricing", wrong: ["Cost-plus pricing", "Price skimming", "Predatory pricing"], why: "Prices ending in 9 are perceived as noticeably cheaper than the round number." },
  { kind: "Pricing", q: "If demand is price-elastic, a price cut will usually…", a: "Increase total revenue", wrong: ["Decrease total revenue", "Leave revenue unchanged", "Reduce quantity sold"], why: "With elastic demand the % rise in quantity exceeds the % fall in price." },
  { kind: "Research", q: "Studying how people use a product in their daily lives by observing them is called…", a: "Ethnographic research", wrong: ["Conjoint analysis", "A/B testing", "Secondary research"], why: "Ethnography uncovers needs people may not state in surveys." },
  { kind: "Digital", q: "Testing two versions of a web page with different users to see which performs better is…", a: "A/B testing", wrong: ["SEO", "Retargeting", "Affiliate marketing"], why: "Traffic is split at random so the difference can be attributed to the change." },
  { kind: "Digital", q: "Showing ads to people who previously visited your website is called…", a: "Retargeting", wrong: ["Native advertising", "Influencer marketing", "Content syndication"], why: "Also called remarketing; it targets warm audiences who already know the brand." },
];

function factGen(list: Fact[], deck: Deck): TriviaQuestion {
  const f = pick(list);
  return build(`${deck}-f-${f.q}`, f.kind, f.q, f.a, f.wrong, f.why, () => f.wrong[0]);
}

/* ───────────── public API ───────────── */
export function nextQuestion(deck: Deck, recent: string[]): TriviaQuestion {
  let q: TriviaQuestion;
  let guard = 0;
  do {
    const roll = Math.random();
    if (deck === "finance") q = roll < 0.4 ? pick(financeCalcs)() : roll < 0.7 ? glossaryGen(FIN_GLOSSARY, deck) : factGen(FIN_FACTS, deck);
    else q = roll < 0.35 ? pick(marketingCalcs)() : roll < 0.7 ? glossaryGen(MKT_GLOSSARY, deck) : factGen(MKT_FACTS, deck);
  } while (recent.includes(q.key) && guard++ < 40);
  return q;
}

export const triviaStats = {
  finance: { calcTemplates: financeCalcs.length, glossary: FIN_GLOSSARY.length, facts: FIN_FACTS.length },
  marketing: { calcTemplates: marketingCalcs.length, glossary: MKT_GLOSSARY.length, facts: MKT_FACTS.length },
};
