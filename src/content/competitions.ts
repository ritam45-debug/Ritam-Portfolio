// ─────────────────────────────────────────────────────────────
// COMPETITION RECORD — source: CASE_COMPS.xlsx (Sheet1), 60 entries.
// Names, teammates, results, organisers and months are copied from the sheet
// (capitalisation tidied only). `host` and `type` are CLASSIFICATIONS added for
// the dashboard, not columns in the sheet; change any that are wrong.
//
// To add a competition: append a row. `result` must be one of the keys in
// RESULT_LABELS. Leave `month` as null if unknown.
// ─────────────────────────────────────────────────────────────

export type Result = "R1" | "R2" | "R3" | "SEMI" | "FINALS" | "4TH" | "WINNER";
export type Host = "premier" | "bschool" | "corporate" | "platform" | "campus";
export type EventType = "case" | "quiz" | "other";
export type Month = "May" | "June" | "July" | "August" | "September";

export interface Competition {
  id: number;
  name: string;
  organiser: string;
  result: Result;
  month: Month | null;
  /** Teammates as listed in the sheet; empty array = solo / individual entry. */
  team: string[];
  host: Host;
  type: EventType;
}

export const RESULT_LABELS: Record<Result, string> = {
  R1: "Round 1",
  R2: "Round 2",
  R3: "Round 3",
  SEMI: "Semi-finals",
  FINALS: "Finals",
  "4TH": "4th place",
  WINNER: "Winners",
};

/** How far the entry progressed. Used for sorting and the progression funnel. */
export const RESULT_DEPTH: Record<Result, number> = { R1: 1, R2: 2, R3: 3, SEMI: 4, FINALS: 5, "4TH": 5, WINNER: 6 };

/** Four outcome bands used for colour. */
export type Band = "r1" | "r2" | "deep" | "top";
export const BAND_OF: Record<Result, Band> = { R1: "r1", R2: "r2", R3: "deep", SEMI: "deep", FINALS: "top", "4TH": "top", WINNER: "top" };
export const BAND_LABELS: Record<Band, string> = { r1: "Round 1", r2: "Round 2", deep: "Round 3 / Semis", top: "Finals & placings" };

export const HOST_LABELS: Record<Host, string> = {
  premier: "IIMs, IITs, NIT & BITS",
  bschool: "Other B-schools & institutes",
  corporate: "Corporates",
  platform: "Case platforms",
  campus: "GLIM Chennai clubs",
};

export const TYPE_LABELS: Record<EventType, string> = { case: "Case & business", quiz: "Quiz", other: "Other events" };

export const MONTHS: Month[] = ["May", "June", "July", "August", "September"];

const t = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const SOLO: string[] = [];

export const competitions: Competition[] = [
  { id: 1, name: "Launchpad '26", organiser: "BTribe", result: "R1", month: "May", team: t("Debdeep, Saikat, Rio"), host: "platform", type: "case" },
  { id: 2, name: "Consultathon 2026", organiser: "BITS Pilani Goa", result: "R2", month: "June", team: t("Arkaprava, Saikat"), host: "premier", type: "case" },
  { id: 3, name: "Straits 2026", organiser: "IIM Ahmedabad (Dubai campus)", result: "R1", month: "July", team: t("Arkaprava, Debdeep"), host: "premier", type: "case" },
  { id: 4, name: "Ascend 2026", organiser: "Delhi University", result: "R1", month: "July", team: t("Arkaprava, Debdeep, Saikat"), host: "bschool", type: "case" },
  { id: 5, name: "MSME Launchpad 2.0", organiser: "MBA Partner", result: "SEMI", month: "August", team: t("Arkaprava, Saikat"), host: "platform", type: "case" },
  { id: 6, name: "Apex MBA Consulting", organiser: "GradNext", result: "R1", month: "August", team: t("Saikat, Debdeep"), host: "platform", type: "case" },
  { id: 7, name: "Launch Lab", organiser: "IIM Kozhikode Alumni", result: "R2", month: "August", team: t("Romit, Debdeep"), host: "premier", type: "case" },
  { id: 8, name: "Storepreneur Case Comp", organiser: "Store K", result: "R1", month: "August", team: t("Romit, Mayur, Sahil"), host: "corporate", type: "case" },
  { id: 9, name: "The Consultants", organiser: "Thrive MBA", result: "FINALS", month: "August", team: t("Arkaprava, Debdeep"), host: "platform", type: "case" },
  { id: 10, name: "Coca-Cola Mantra Challenge 2026", organiser: "Coca-Cola", result: "R1", month: "August", team: SOLO, host: "corporate", type: "case" },
  { id: 11, name: "Vittarth 2.0", organiser: "IIT Roorkee, Kharagpur, Delhi, Guwahati & Bombay", result: "R2", month: "August", team: t("Mayur, Romit"), host: "premier", type: "case" },
  { id: 12, name: "Learnous Case Comp", organiser: "Learnous", result: "R1", month: "August", team: t("Romit, Chaitanya, Manoj"), host: "platform", type: "case" },
  { id: 13, name: "Axis Moves", organiser: "Axis Bank", result: "R1", month: "August", team: t("Sreejith"), host: "corporate", type: "case" },
  { id: 14, name: "BPR Quiz Event", organiser: "BPR Committee, GLIM Chennai", result: "R2", month: "August", team: t("Sri Neyenther, Rushikesh"), host: "campus", type: "quiz" },
  { id: 15, name: "Spectra", organiser: "IIM Bangalore", result: "R1", month: "August", team: t("Romit, Ayan"), host: "premier", type: "case" },
  { id: 16, name: "NIT Rourkela Case Comp", organiser: "NIT Rourkela", result: "R2", month: "August", team: t("Romit, Ayan, Rushikesh"), host: "premier", type: "case" },
  { id: 17, name: "Strategize", organiser: "GLIM", result: "R1", month: "August", team: t("Subham Adhikari, Ameen Zehra, Kunal"), host: "campus", type: "case" },
  { id: 18, name: "Ideathon 2026", organiser: "GLIM Chennai", result: "R1", month: "August", team: t("Rushikesh, Vijayalaxmi, Sri Neyenther, Ameen"), host: "campus", type: "case" },
  { id: 19, name: "Prod Roast", organiser: "Product Management Club, GLIM Chennai", result: "R1", month: "August", team: t("Yusuf, Dheyey"), host: "campus", type: "case" },
  { id: 20, name: "IIM Ranchi Case Comp", organiser: "IIM Ranchi", result: "R1", month: "August", team: t("Aditya Ranjith, Akshay"), host: "premier", type: "case" },
  { id: 21, name: "National Case Study Challenge", organiser: "National Case Study", result: "R2", month: "August", team: t("Priyal, Sahil, Abhishek, Chandra"), host: "platform", type: "case" },
  { id: 22, name: "Reenithi", organiser: "Analytics Club, GLIM", result: "R1", month: "August", team: t("Ayan Ray, Ayan Sinha, Romit"), host: "campus", type: "case" },
  { id: 23, name: "Mocha Trades Market Makers", organiser: "MochaTrades", result: "R1", month: "August", team: t("Sukriti, Uddhav"), host: "platform", type: "other" },
  { id: 24, name: "The Fifth Move: A Strategy Case", organiser: "IIM Bangalore", result: "R1", month: "August", team: t("Deepak, Viraj"), host: "premier", type: "case" },
  { id: 25, name: "Product Innovation", organiser: "Prodigies, GLIM", result: "R1", month: "August", team: t("Rani, Anant, Sreenithi"), host: "campus", type: "case" },
  { id: 26, name: "Quizessence", organiser: "IRC Committee, GLIM Chennai", result: "R1", month: "August", team: t("Sukriti, Ishaan"), host: "campus", type: "quiz" },
  { id: 27, name: "Prod-a-thon", organiser: "IIM Bangalore", result: "R1", month: "August", team: t("Manavendra, Sreyas Chaturvedi"), host: "premier", type: "case" },
  { id: 28, name: "PwC AC Challenge", organiser: "PwC AC", result: "R1", month: "August", team: t("Manavendra, Sreyas Chaturvedi, Oindrella"), host: "corporate", type: "case" },
  { id: 29, name: "Galderma Case Comp", organiser: "Galderma", result: "R1", month: "August", team: t("Aditya Dhar, Samruddhi"), host: "corporate", type: "case" },
  { id: 30, name: "Marico Case Comp", organiser: "Marico", result: "R1", month: "August", team: t("Aditya Dhar, Rhea Jaikumar"), host: "corporate", type: "case" },
  { id: 31, name: "AWC", organiser: "AWC", result: "R1", month: "August", team: t("Rushikesh, Asish Ranjan, Shreyas"), host: "platform", type: "case" },
  { id: 32, name: "Finance Quiz + Debate", organiser: "FinCom, GLIM Chennai", result: "R1", month: "August", team: t("Sri Neyenther"), host: "campus", type: "quiz" },
  { id: 33, name: "BPR Committee Event", organiser: "BPR Committee, GLIM Chennai", result: "R2", month: "August", team: t("Shlok, Sahil"), host: "campus", type: "other" },
  { id: 34, name: "Flipkart WiRED", organiser: "Flipkart", result: "R1", month: "August", team: t("Dhanush, Ankan"), host: "corporate", type: "case" },
  { id: 35, name: "JPMorgan Chase Case Comp", organiser: "JPMorgan Chase", result: "R1", month: "August", team: t("Romit"), host: "corporate", type: "case" },
  { id: 36, name: "Takshak Marketing Case Comp", organiser: "MANAGE Hyderabad", result: "R2", month: "August", team: t("Anant, Eshaan"), host: "bschool", type: "case" },
  { id: 37, name: "Abhinayak Case Comp", organiser: "MANAGE Hyderabad", result: "R1", month: "August", team: SOLO, host: "bschool", type: "case" },
  { id: 38, name: "Neetiyudh", organiser: "MANAGE Hyderabad", result: "R2", month: "August", team: t("Anant"), host: "bschool", type: "case" },
  { id: 39, name: "India Quiz", organiser: "Quiz Club, GLIM Chennai", result: "4TH", month: "August", team: t("Abhishek, Pooja Karwa"), host: "campus", type: "quiz" },
  { id: 40, name: "Saregama Case Comp", organiser: "Sanjeev Goenka", result: "R2", month: "September", team: t("Safi, Deepak, Suchit"), host: "corporate", type: "case" },
  { id: 41, name: "ITC Case Study", organiser: "ITC", result: "FINALS", month: "September", team: SOLO, host: "corporate", type: "case" },
  { id: 42, name: "Digital Leaders Summit 2026", organiser: "Analytics Club, GLIM", result: "R1", month: "September", team: t("Ishan, Sukriti"), host: "campus", type: "case" },
  { id: 43, name: "TVS Credit 2026 – Strategy", organiser: "TVS Credit", result: "R1", month: "September", team: t("Romit, Yash"), host: "corporate", type: "case" },
  { id: 44, name: "Case-o-Nova", organiser: "IIM Bangalore", result: "R2", month: "September", team: t("Samriddhi, Pooja Karwa"), host: "premier", type: "case" },
  { id: 45, name: "Yukti", organiser: "SIBM Nagpur", result: "R1", month: "September", team: t("Rishita, Ankan"), host: "bschool", type: "case" },
  { id: 46, name: "Dabur Case Comp", organiser: "Dabur", result: "R1", month: "September", team: t("Shubham Tanwar, Asish Ranjan"), host: "corporate", type: "case" },
  { id: 47, name: "GLIM Gurgaon Consulting Case Comp", organiser: "GLIM Gurgaon", result: "R1", month: "September", team: t("Viraj, Anant, Pooja Karwa"), host: "bschool", type: "case" },
  { id: 48, name: "FinCom Treasure Hunt", organiser: "FinCom", result: "WINNER", month: "September", team: t("Anant, Akshit"), host: "campus", type: "other" },
  { id: 49, name: "Dr. Reddy's Laboratories Case Comp", organiser: "Dr. Reddy's", result: "R1", month: "September", team: SOLO, host: "corporate", type: "case" },
  { id: 50, name: "GLIM Gurgaon Finance Case Comp", organiser: "GLIM Gurgaon", result: "R2", month: "September", team: t("Akshit, Anant"), host: "bschool", type: "case" },
  { id: 51, name: "SIMS Pune Case Comp", organiser: "SIMS Pune", result: "R2", month: "September", team: t("Anant"), host: "bschool", type: "case" },
  { id: 52, name: "Metamorph 2026", organiser: "SIMC Pune", result: "R1", month: "September", team: t("Anant, Pooja Chandrekar, Parneet Kaur, Herold"), host: "bschool", type: "case" },
  { id: 53, name: "Adhishtatha: The Best Manager Competition", organiser: "NAARM Hyderabad", result: "R3", month: "September", team: SOLO, host: "bschool", type: "case" },
  { id: 54, name: "Samarthya: The Marketing Challenge", organiser: "NAARM Hyderabad", result: "R1", month: "September", team: t("Vishnu, Jyotieswaran"), host: "bschool", type: "case" },
  { id: 55, name: "Arthmanthan", organiser: "NAARM Hyderabad", result: "R2", month: "September", team: t("Rahin, Safi"), host: "bschool", type: "case" },
  { id: 56, name: "Wonderla Case Comp", organiser: "Wonderla", result: "R2", month: "September", team: t("Krishna, Yashodhan"), host: "corporate", type: "case" },
  { id: 57, name: "Armageddon: Strategy Case Competition", organiser: "IIM Ahmedabad", result: "R1", month: "September", team: t("Pooja Karwa, Pooja Chandrakar"), host: "premier", type: "case" },
  { id: 58, name: "Yukti: The Social Impact Case Competition", organiser: "IIM Ahmedabad", result: "R1", month: "September", team: t("Pooja Karwa, Pooja Chandrakar"), host: "premier", type: "case" },
  { id: 59, name: "Maverhrick 4.0", organiser: "IIM Visakhapatnam", result: "R2", month: null, team: t("Pooja Karwa"), host: "premier", type: "case" },
  { id: 60, name: "IRC Quiz", organiser: "GLIM Chennai", result: "R1", month: "September", team: t("Pooja Karwa"), host: "campus", type: "quiz" },
];
