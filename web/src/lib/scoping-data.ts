/**
 * Scoping Canvas Data — 7 executive themes assembled from ProcessInventoryNodes.
 *
 * Each theme groups related process areas and provides executive-language
 * scoping questions for the first CFO/Controller meeting.
 */

import { MOCK_WORKSPACES, type ProcessInventoryNode } from "./mock-data";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ScopingQuestion {
  id: string;          // e.g. "t1-q1"
  text: string;
  source_pa?: string;  // PA-xx if derived from an existing PA scoping question
  section?: string;    // grouping label within a theme (used by context tile)
}

export interface ScopingTheme {
  id: string;          // e.g. "theme-1"
  index: number;       // 1-7 for keyboard shortcuts
  name: string;
  color: string;       // tailwind color token (e.g. "blue")
  colorHex: string;    // hex for inline styles
  icon: string;        // emoji glyph for now
  paIds: string[];     // PA-xx codes included
  executiveQuestion: string;
  description: string; // 2-3 sentence executive overview
  questions: ScopingQuestion[];
  processAreas: { paId: string; name: string; subFlowCount: number }[];
}

export type ScopingMode = "rapid" | "deep";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Pull all ProcessInventoryNodes from the d-004-01 workspace graph */
function getProcessNodes(): ProcessInventoryNode[] {
  const ws = MOCK_WORKSPACES["d-004-01"];
  if (!ws?.graph || ws.graph.kind !== "process_inventory") return [];
  return ws.graph.nodes;
}

function findPA(nodes: ProcessInventoryNode[], paId: string): ProcessInventoryNode | undefined {
  return nodes.find((n) => n.pa_id === paId);
}

function buildDescription(nodes: ProcessInventoryNode[], paIds: string[]): string {
  return paIds
    .map((id) => findPA(nodes, id)?.description)
    .filter(Boolean)
    .slice(0, 3)
    .join(" ")
    .slice(0, 400);
}

function buildProcessAreas(
  nodes: ProcessInventoryNode[],
  paIds: string[],
): ScopingTheme["processAreas"] {
  return paIds
    .map((id) => {
      const pa = findPA(nodes, id);
      return pa
        ? { paId: id, name: pa.name, subFlowCount: pa.sub_flow_count }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

// ── Context Tile — "Why Transform?" ──────────────────────────────────────────

export function buildContextTile(): ScopingTheme {
  return {
    id: "context",
    index: 0,
    name: "Why Transform?",
    color: "cyan",
    colorHex: "#06B6D4",
    icon: "\u{1F3AF}",  // 🎯
    paIds: [],
    executiveQuestion: "Help us understand what's driving this initiative and what success looks like.",
    description: "The first 15–30 minutes of a scoping session establish the strategic context: what's forcing the transformation, where the pain is, what the organization looks like, and how they think about technology and AI. This shapes everything that follows.",
    processAreas: [],
    questions: [
      // ── Drivers
      { id: "ctx-d1", section: "Transformation Drivers", text: "What's the catalyst for this initiative — what changed in the last 12–18 months that made this a priority?" },
      { id: "ctx-d2", section: "Transformation Drivers", text: "Is this driven by a regulatory event (LDTI, IFRS 17, state exam finding), a system event (vendor sunset, end-of-support), or a business event (M&A, growth, new lines)?" },
      { id: "ctx-d3", section: "Transformation Drivers", text: "Has the board or audit committee specifically flagged finance modernization?" },
      { id: "ctx-d4", section: "Transformation Drivers", text: "Have you attempted this before? What happened?" },
      // ── Pain
      { id: "ctx-p1", section: "Current Pain Points", text: "If you could fix one thing about your finance operation tomorrow, what would it be?" },
      { id: "ctx-p2", section: "Current Pain Points", text: "How many business days is your quarterly close, and how does that compare to where you want to be?" },
      { id: "ctx-p3", section: "Current Pain Points", text: "Where are you most dependent on spreadsheets or manual processes?" },
      { id: "ctx-p4", section: "Current Pain Points", text: "What keeps your Controller up at night during close?" },
      { id: "ctx-p5", section: "Current Pain Points", text: "Have you had any restatements, audit adjustments, or regulatory findings in the last 3 years?" },
      { id: "ctx-p6", section: "Current Pain Points", text: "Where do you have key-person risk — processes that only one or two people can run?" },
      // ── Business Context
      { id: "ctx-b1", section: "Business Context", text: "What's your direct written premium, and across how many legal entities and states?" },
      { id: "ctx-b2", section: "Business Context", text: "How is the finance function organized — centralized, shared services, or distributed by entity/LOB?" },
      { id: "ctx-b3", section: "Business Context", text: "How many FTEs in finance and accounting?" },
      { id: "ctx-b4", section: "Business Context", text: "Any M&A activity planned or recently completed?" },
      { id: "ctx-b5", section: "Business Context", text: "Are you growing into new lines of business or geographies?" },
      // ── Technology
      { id: "ctx-t1", section: "Technology Landscape", text: "What is your current GL/ERP system, and how old is the implementation?" },
      { id: "ctx-t2", section: "Technology Landscape", text: "How many systems feed the general ledger today?" },
      { id: "ctx-t3", section: "Technology Landscape", text: "Are you cloud, on-premise, or hybrid?" },
      { id: "ctx-t4", section: "Technology Landscape", text: "Have you already selected a target ERP, or is that part of this engagement?" },
      { id: "ctx-t5", section: "Technology Landscape", text: "What's the state of your data — do you trust your trial balance on day one of close?" },
      // ── Vision & Success
      { id: "ctx-v1", section: "Vision & Success", text: "When this is done, what does the CFO want to be true that isn't true today?" },
      { id: "ctx-v2", section: "Vision & Success", text: "Who is the executive sponsor, and how is the go/no-go decision made?" },
      { id: "ctx-v3", section: "Vision & Success", text: "Is there a budget envelope or investment thesis already approved?" },
      { id: "ctx-v4", section: "Vision & Success", text: "What would make you say this engagement failed?" },
      // ── Timeline
      { id: "ctx-tl1", section: "Timeline & Constraints", text: "What's the target go-live date, and what's driving that date (contract expiry, fiscal year, regulatory deadline)?" },
      { id: "ctx-tl2", section: "Timeline & Constraints", text: "Is there a hard deadline — e.g., current system being decommissioned — or is the timeline aspirational?" },
      { id: "ctx-tl3", section: "Timeline & Constraints", text: "Are you planning a big-bang cutover or a phased rollout?" },
      { id: "ctx-tl4", section: "Timeline & Constraints", text: "What internal milestones or board dates need to be hit along the way?" },
      { id: "ctx-tl5", section: "Timeline & Constraints", text: "What is your resource availability — will this be staffed with dedicated internal team members or shared with BAU?" },
      // ── AI Appetite
      { id: "ctx-a1", section: "AI & Automation", text: "How is your team using AI or automation today, if at all?" },
      { id: "ctx-a2", section: "AI & Automation", text: "Are there specific processes where you'd welcome autonomous operation, or is everything human-in-the-loop for now?" },
      { id: "ctx-a3", section: "AI & Automation", text: "What's your board's posture on AI in financial reporting — enthusiastic, cautious, or haven't discussed it?" },
      { id: "ctx-a4", section: "AI & Automation", text: "Would you be open to an AI agent handling routine reconciliations and posting, with human review of exceptions only?" },
    ],
  };
}

/** Singleton-cached context tile */
let _contextTile: ScopingTheme | null = null;
export function getContextTile(): ScopingTheme {
  if (!_contextTile) _contextTile = buildContextTile();
  return _contextTile;
}

/** Get unique section labels from a theme's questions, in order */
export function getQuestionSections(theme: ScopingTheme): string[] {
  const seen = new Set<string>();
  const sections: string[] = [];
  for (const q of theme.questions) {
    if (q.section && !seen.has(q.section)) {
      seen.add(q.section);
      sections.push(q.section);
    }
  }
  return sections;
}

const RAPID_QUESTIONS_BY_THEME: Record<string, ScopingQuestion[]> = {
  context: [
    {
      id: "rq-ctx-1",
      section: "Rapid Scope",
      text: "What is the primary trigger for this transformation right now?",
    },
    {
      id: "rq-ctx-2",
      section: "Rapid Scope",
      text: "What business outcomes must be true in 12-18 months?",
    },
  ],
  "theme-1": [
    {
      id: "rq-t1-1",
      section: "Rapid Scope",
      text: "How is your chart of accounts structured today, and where does it break?",
    },
    {
      id: "rq-t1-2",
      section: "Rapid Scope",
      text: "Do you run STAT and GAAP in parallel today, and what is painful?",
    },
  ],
  "theme-2": [
    {
      id: "rq-t2-1",
      section: "Rapid Scope",
      text: "Where are the biggest pain points in premium, claims, or reinsurance accounting?",
    },
    {
      id: "rq-t2-2",
      section: "Rapid Scope",
      text: "What is the current state of actuarial-to-accounting reconciliation?",
    },
  ],
  "theme-3": [
    {
      id: "rq-t3-1",
      section: "Rapid Scope",
      text: "What causes the most manual effort in AP, AR, treasury, or intercompany?",
    },
  ],
  "theme-4": [
    {
      id: "rq-t4-1",
      section: "Rapid Scope",
      text: "What is your close duration today, and what target has leadership set?",
    },
  ],
  "theme-5": [
    {
      id: "rq-t5-1",
      section: "Rapid Scope",
      text: "Where are your highest compliance/reporting risks (NAIC, LDTI, IFRS 17, SEC)?",
    },
    {
      id: "rq-t5-2",
      section: "Rapid Scope",
      text: "How traceable is your reporting lineage from GL to disclosures today?",
    },
  ],
  "theme-6": [
    {
      id: "rq-t6-1",
      section: "Rapid Scope",
      text: "Which executive analytics are missing or too slow for decisions today?",
    },
  ],
  "theme-7": [
    {
      id: "rq-t7-1",
      section: "Rapid Scope",
      text: "Which source systems and interfaces create the biggest reliability issues?",
    },
  ],
};

export function getQuestionsForMode(
  theme: ScopingTheme,
  mode: ScopingMode,
): ScopingQuestion[] {
  if (mode === "deep") return theme.questions;
  return RAPID_QUESTIONS_BY_THEME[theme.id] ?? theme.questions.slice(0, 1);
}

// ── Theme Definitions ────────────────────────────────────────────────────────

export function buildScopingThemes(): ScopingTheme[] {
  const nodes = getProcessNodes();

  return [
    {
      id: "theme-1",
      index: 1,
      name: "Accounting Foundation",
      color: "blue",
      colorHex: "#3B82F6",
      icon: "\u{1F3DB}",  // 🏛
      paIds: ["PA-01", "PA-02"],
      executiveQuestion: "How is your GL and chart of accounts structured today?",
      description: buildDescription(nodes, ["PA-01", "PA-02"]),
      processAreas: buildProcessAreas(nodes, ["PA-01", "PA-02"]),
      questions: [
        // PA-01 existing
        { id: "t1-q1", text: "How many statutory LOBs are you actively writing, and how do they map to your management LOBs?", source_pa: "PA-01" },
        { id: "t1-q2", text: "Do you have any intercompany pooling arrangements, and if so, what are the participation percentages?", source_pa: "PA-01" },
        { id: "t1-q3", text: "Which accounting basis do you want as the leading ledger — STAT or GAAP?", source_pa: "PA-01" },
        { id: "t1-q4", text: "Are there any anticipated entity restructurings or pool changes in the next 3–5 years?", source_pa: "PA-01" },
        // PA-02 derived
        { id: "t1-q5", text: "How many manual journal entries does your team process each month, and what drives them?", source_pa: "PA-02" },
        { id: "t1-q6", text: "What is your current approach to multi-basis posting — parallel entries, adjustment layers, or separate ledgers?", source_pa: "PA-02" },
      ],
    },
    {
      id: "theme-2",
      index: 2,
      name: "Insurance Operations",
      color: "teal",
      colorHex: "#14B8A6",
      icon: "\u{1F4CB}",  // 📋
      paIds: ["PA-03", "PA-04", "PA-05", "PA-06"],
      executiveQuestion: "Walk me through premium, claims, and reinsurance accounting.",
      description: buildDescription(nodes, ["PA-03", "PA-04", "PA-05"]),
      processAreas: buildProcessAreas(nodes, ["PA-03", "PA-04", "PA-05", "PA-06"]),
      questions: [
        // PA-03
        { id: "t2-q1", text: "Where does earned premium get calculated today — PAS, actuarial, data warehouse, or spreadsheets?", source_pa: "PA-03" },
        { id: "t2-q2", text: "How many PAS systems feed premium data, and are they being consolidated?", source_pa: "PA-03" },
        // PA-04
        { id: "t2-q3", text: "How frequently does actuarial deliver IBNR/bulk reserve updates — quarterly, monthly?", source_pa: "PA-04" },
        { id: "t2-q4", text: "At what granularity are actuarial reserve estimates posted — total company, by LOB, by LOB/accident year?", source_pa: "PA-04" },
        { id: "t2-q5", text: "What is your current actuarial-to-accounting reconciliation process, and what breaks most often?", source_pa: "PA-04" },
        // PA-05
        { id: "t2-q6", text: "How many treaties and facultative certificates are in force, and how many reinsurers do you work with?", source_pa: "PA-05" },
        { id: "t2-q7", text: "Do you use a dedicated reinsurance system, and is it being replaced?", source_pa: "PA-05" },
      ],
    },
    {
      id: "theme-3",
      index: 3,
      name: "Financial Operations",
      color: "purple",
      colorHex: "#A855F7",
      icon: "\u{1F4B0}",  // 💰
      paIds: ["PA-09", "PA-10", "PA-11", "PA-12", "PA-13"],
      executiveQuestion: "How do AP, AR, treasury, and intercompany work today?",
      description: buildDescription(nodes, ["PA-09", "PA-10", "PA-13"]),
      processAreas: buildProcessAreas(nodes, ["PA-09", "PA-10", "PA-11", "PA-12", "PA-13"]),
      questions: [
        // PA-09 (new)
        { id: "t3-q1", text: "How are agent and broker commissions calculated and paid — what systems and manual steps are involved?", source_pa: "PA-09" },
        { id: "t3-q2", text: "What is your invoice processing volume, and what percentage is still paper-based?", source_pa: "PA-09" },
        // PA-10 (new)
        { id: "t3-q3", text: "What is the aged premium receivable balance, and how much is over 90 days?", source_pa: "PA-10" },
        { id: "t3-q4", text: "How automated is cash application — what percentage is straight-through vs. manual matching?", source_pa: "PA-10" },
        // PA-11 (new)
        { id: "t3-q5", text: "How many intercompany entities are in the group, and what is the settlement frequency?", source_pa: "PA-11" },
        // PA-13 (new)
        { id: "t3-q6", text: "How many bank accounts do you manage, and what is your bank reconciliation process?", source_pa: "PA-13" },
        { id: "t3-q7", text: "Do you have catastrophe liquidity plans, and how is claims payment funding managed?", source_pa: "PA-13" },
      ],
    },
    {
      id: "theme-4",
      index: 4,
      name: "Close & Consolidation",
      color: "amber",
      colorHex: "#F59E0B",
      icon: "\u{23F0}",  // ⏰
      paIds: ["PA-14", "PA-15"],
      executiveQuestion: "What does your close cycle look like?",
      description: buildDescription(nodes, ["PA-14", "PA-15"]),
      processAreas: buildProcessAreas(nodes, ["PA-14", "PA-15"]),
      questions: [
        // PA-14 (new)
        { id: "t4-q1", text: "How do you classify expenses into LAE, underwriting, and investment categories today?", source_pa: "PA-14" },
        { id: "t4-q2", text: "How is your IEE (Exhibit 2) allocation to LOBs performed — system-driven or spreadsheets?", source_pa: "PA-14" },
        // PA-15 existing
        { id: "t4-q3", text: "What is your current close timeline in business days, and what is the target?", source_pa: "PA-15" },
        { id: "t4-q4", text: "Which close activities are on the critical path?", source_pa: "PA-15" },
        { id: "t4-q5", text: "How many manual journal entries per close, and what percentage could be automated?", source_pa: "PA-15" },
        { id: "t4-q6", text: "Do you close STAT and GAAP sequentially or in parallel?", source_pa: "PA-15" },
      ],
    },
    {
      id: "theme-5",
      index: 5,
      name: "Reporting & Compliance",
      color: "emerald",
      colorHex: "#10B981",
      icon: "\u{1F4CA}",  // 📊
      paIds: ["PA-16", "PA-17", "PA-18"],
      executiveQuestion: "How do you produce NAIC statements and GAAP filings?",
      description: buildDescription(nodes, ["PA-16", "PA-17", "PA-18"]),
      processAreas: buildProcessAreas(nodes, ["PA-16", "PA-17", "PA-18"]),
      questions: [
        // PA-16 existing
        { id: "t5-q1", text: "Which statutory reporting tool do you use today, and is it being replaced?", source_pa: "PA-16" },
        { id: "t5-q2", text: "How automated is Schedule P production — system-generated or manually compiled triangles?", source_pa: "PA-16" },
        { id: "t5-q3", text: "What is the data lineage from GL to each Annual Statement line item — is it documented?", source_pa: "PA-16" },
        // PA-17 (new)
        { id: "t5-q4", text: "Who prepares the 10-K/10-Q, and how much is manual drafting vs. system-generated?", source_pa: "PA-17" },
        { id: "t5-q5", text: "Do you have LDTI or IFRS 17 disclosure requirements, and how are they produced?", source_pa: "PA-17" },
        // PA-18 existing
        { id: "t5-q6", text: "What tax provision software do you use, and will it be retained?", source_pa: "PA-18" },
        { id: "t5-q7", text: "How do you currently calculate Section 846 loss reserve discounting?", source_pa: "PA-18" },
      ],
    },
    {
      id: "theme-6",
      index: 6,
      name: "Analytics & Planning",
      color: "rose",
      colorHex: "#F43F5E",
      icon: "\u{1F4C8}",  // 📈
      paIds: ["PA-19"],
      executiveQuestion: "What management reporting and analytics do you have?",
      description: buildDescription(nodes, ["PA-19"]),
      processAreas: buildProcessAreas(nodes, ["PA-19"]),
      questions: [
        // PA-19 (new)
        { id: "t6-q1", text: "What management reports does the CFO and board receive, and how are they produced?", source_pa: "PA-19" },
        { id: "t6-q2", text: "How do you track combined ratio and underwriting performance by LOB?", source_pa: "PA-19" },
        { id: "t6-q3", text: "What reserve adequacy and development reporting exists for the board?", source_pa: "PA-19" },
        { id: "t6-q4", text: "Do you have ad hoc analytics capability, or does every request go to IT?", source_pa: "PA-19" },
        { id: "t6-q5", text: "What is your FP&A process — do you budget at the LOB level?", source_pa: "PA-19" },
      ],
    },
    {
      id: "theme-7",
      index: 7,
      name: "Data & Integration",
      color: "slate",
      colorHex: "#64748B",
      icon: "\u{1F517}",  // 🔗
      paIds: ["PA-20", "PA-08"],
      executiveQuestion: "How many systems feed the GL, and what breaks?",
      description: buildDescription(nodes, ["PA-20", "PA-08"]),
      processAreas: buildProcessAreas(nodes, ["PA-20", "PA-08"]),
      questions: [
        // PA-20 existing
        { id: "t7-q1", text: "How many source systems currently feed the GL, and which are being replaced vs. retained?", source_pa: "PA-20" },
        { id: "t7-q2", text: "Which interfaces currently require manual reconciliation or intervention, and how often do they break?", source_pa: "PA-20" },
        { id: "t7-q3", text: "What is the desired frequency for each interface — daily, weekly, monthly?", source_pa: "PA-20" },
        { id: "t7-q4", text: "Are there regulatory requirements around data lineage or auditability of interface data?", source_pa: "PA-20" },
        // PA-08 (new)
        { id: "t7-q5", text: "What investment accounting system do you use (Clearwater, etc.), and how does it feed the GL?", source_pa: "PA-08" },
        { id: "t7-q6", text: "How is the STAT/GAAP dual-basis investment posting handled — automated or manual adjustment?", source_pa: "PA-08" },
      ],
    },
  ];
}

/** Singleton-cached themes */
let _themes: ScopingTheme[] | null = null;
export function getScopingThemes(): ScopingTheme[] {
  if (!_themes) _themes = buildScopingThemes();
  return _themes;
}
