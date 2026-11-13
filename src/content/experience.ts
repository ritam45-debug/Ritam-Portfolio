// ─────────────────────────────────────────────────────────────
// EXPERIENCE & LEADERSHIP — source: Ritam's CV and Skynet CV points (Nov 2026).
// Every figure here was supplied by Ritam; nothing is estimated.
// ─────────────────────────────────────────────────────────────

export interface Internship {
  org: string;
  role: string;
  when: string;
  kind: "finance" | "sales" | "impact";
  points: string[];
  /** One headline number for the card, if there is one. */
  stat?: { value: string; label: string };
}

export const internships: Internship[] = [
  {
    org: "India Post Payments Bank",
    role: "Finance Intern",
    when: "Jun – Aug 2025",
    kind: "finance",
    stat: { value: "+7%", label: "customer feedback ratings" },
    points: [
      "Lifted customer feedback ratings by 7% through issue resolution, client relationship management and customer-journey improvements at the branch.",
      "Streamlined customer-servicing processes across bank channels to strengthen customer experience and service quality.",
      "Executed banking operations in line with policies, compliance standards and process SOPs.",
    ],
  },
  {
    org: "PepsiCo × Internshala",
    role: "Sales Intern · Team Lead, Sales Star programme",
    when: "Jun – Jul 2025",
    kind: "sales",
    stat: { value: "19", label: "interns led across 4 regions" },
    points: [
      "Led a team of 19 interns as team lead in the Sales Star programme.",
      "Ran field market research across 4 regions, mapping consumer behaviour, customer segments, retail merchandising and on-ground sales execution.",
      "Benchmarked competitors' retail presence and market penetration to find demand-generation and distribution gaps, and turned the findings into sales recommendations.",
    ],
  },
  {
    org: "Inamigos Foundation",
    role: "Content Writing Intern",
    when: "Apr – May 2026",
    kind: "impact",
    points: [
      "Produced research-driven content on ESG, climate risk and sustainability using secondary research and data synthesis.",
      "Strengthened digital outreach and stakeholder communication.",
    ],
  },
  {
    org: "Kshitiksha Foundation",
    role: "Content Writing Intern",
    when: "Apr – May 2025",
    kind: "impact",
    points: [
      "Produced research-driven content on ESG, climate risk and sustainability using secondary research and data synthesis.",
      "Strengthened digital outreach and stakeholder communication.",
    ],
  },
];

export interface Lead {
  title: string;
  where: string;
  detail: string;
  metrics?: { value: string; label: string }[];
}

export const leadership: Lead[] = [
  {
    title: "Quizzozzat — founder & host",
    where: "National online cricket quiz on Unstop",
    detail: "Conceived and organised the quiz independently: event planning, digital marketing and end-to-end execution.",
    metrics: [
      { value: "239+", label: "participants" },
      { value: "215+", label: "teams" },
      { value: "26.9K+", label: "event views" },
      { value: "54", label: "verified reviews" },
    ],
  },
  {
    title: "National finance quiz — founder & host",
    where: "Unstop",
    detail: "Owned strategy, branding, outreach and execution end to end.",
    metrics: [
      { value: "168", label: "registrations" },
      { value: "18.9K+", label: "impressions" },
      { value: "4.3/5", label: "rating (41 reviews)" },
    ],
  },
  {
    title: "Karma Yoga Committee member",
    where: "Great Lakes Institute of Management, Chennai",
    detail: "Mobilises and coordinates student volunteer teams across community initiatives, driving participation, on-ground execution and stakeholder engagement.",
  },
  {
    title: "Fundraiser & campaigner",
    where: "Pawzz Foundation",
    detail: "Ran marketing and awareness campaigns for dog and animal welfare, and raised funds through donor outreach and digital communication.",
    metrics: [{ value: "₹1,000", label: "raised for stray-dog care" }],
  },
];

export const honours: { title: string; detail: string; year: string }[] = [
  { title: "UG Topper", detail: "Ranked 1st of 250 students, BBA (Finance), Brainware University", year: "2026" },
  { title: "Winner, Future Leaders Challenge", detail: "Brainstar business strategy simulation — led a cross-functional team to 1st place", year: "2025" },
  { title: "2nd Runner-Up, Brainstar Business Quiz", detail: "Brainware University — two years running", year: "2024 & 2025" },
  { title: "McKinsey.org Forward Program", detail: "Certification", year: "" },
  { title: "Analytics Club member", detail: "Great Lakes Institute of Management, Chennai", year: "2026" },
];

export const schooling = [
  { level: "PGDM (MBA)", where: "Great Lakes Institute of Management, Chennai", score: "Pursuing", year: "2026–28" },
  { level: "BBA (Finance)", where: "Brainware University", score: "CGPA 9.8/10", year: "2026" },
  { level: "Class XII (PCMB)", where: "Techno India Group Public School, Balurghat", score: "77.6%", year: "2023" },
  { level: "Class X", where: "Techno India Group Public School, Balurghat", score: "95%", year: "2021" },
];
