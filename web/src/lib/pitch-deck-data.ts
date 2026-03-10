// ── Pitch Deck Slide Data ─────────────────────────────────────────────────
// Structured content for the 11-slide pitch deck.
// Each slide has a type discriminant that determines which component renders it.

export type SlideType =
  | "title"
  | "two-column"
  | "three-column"
  | "stats"
  | "phase0"
  | "roadmap"
  | "value"
  | "showcase";

export interface BulletItem {
  label: string;
  detail?: string;
}

export interface ColumnCard {
  title: string;
  subtitle?: string;
  accent: "blue" | "amber" | "green" | "red" | "cyan";
  bullets: string[];
  valueLine?: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface RoadmapPhase {
  title: string;
  timing: string;
  accent: "blue" | "amber" | "green";
  bullets: string[];
}

export interface TitleSlideData {
  type: "title";
  heading: string;
  subheading: string;
  subtitle: string;
  footer: string;
}

export interface TwoColumnSlideData {
  type: "two-column";
  title: string;
  subtitle?: string;
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
  takeaway: string;
  demoRoute?: string;
  demoLabel?: string;
}

export interface ThreeColumnSlideData {
  type: "three-column";
  title: string;
  subtitle?: string;
  cards: [ColumnCard, ColumnCard, ColumnCard];
  takeaway?: string;
}

export interface StatsSlideData {
  type: "stats";
  title: string;
  subtitle?: string;
  stats: StatItem[];
  footer?: string;
}

export interface TimelineRow {
  weeks: string;
  label: string;
  color: "red" | "amber" | "green" | "blue" | "purple";
  widthPercent: number; // 0-100, how wide the bar renders
}

export interface CostStat {
  value: string;
  label: string;
  color: "red" | "amber" | "purple" | "cyan" | "muted";
}

export interface Phase0SlideData {
  type: "phase0";
  title: string;
  subtitle: string;
  timeline: TimelineRow[];
  costs: CostStat[];
  takeaway: string;
}

export interface RoadmapSlideData {
  type: "roadmap";
  title: string;
  subtitle?: string;
  phases: [RoadmapPhase, RoadmapPhase, RoadmapPhase];
  footer?: string;
}

export interface ValueSlideData {
  type: "value";
  title: string;
  subtitle?: string;
  cards: ColumnCard[];
  takeaway?: string;
}

export interface ShowcaseSlideData {
  type: "showcase";
  title: string;
  subtitle: string;
  image: string;
  agentDoes: string;
  consultantDoes: string;
  takeaway: string;
}

export type SlideData =
  | TitleSlideData
  | TwoColumnSlideData
  | ThreeColumnSlideData
  | StatsSlideData
  | Phase0SlideData
  | RoadmapSlideData
  | ValueSlideData
  | ShowcaseSlideData;

// ── Feature Showcase Slides (shared between decks) ──────────────────────
const SHOWCASE_SLIDES: ShowcaseSlideData[] = [
  {
    type: "showcase",
    title: "Engagement Dashboard",
    subtitle: "One screen. Full situational awareness.",
    image: "/slides/dashboard.png",
    agentDoes: "Tracks 34 deliverables across three agents, surfaces blocked items, computes progress automatically, and flags decisions waiting for consultant input.",
    consultantDoes: "Opens the dashboard, sees exactly what needs attention, and spends time on the three items that matter — not hunting through spreadsheets for status.",
    takeaway: "The agent assembles status. The consultant makes decisions.",
  },
  {
    type: "showcase",
    title: "Scope Summary Dashboard",
    subtitle: "20 process areas. Scoped in minutes, not days.",
    image: "/slides/scope-summary.png",
    agentDoes: "Pre-loads 20 insurance-specific process areas organized by theme, tracks scope decisions across all three agents, and maintains the living scope definition as workshops progress.",
    consultantDoes: "Walks the client through process areas on the projector, makes in/out/defer decisions in real time, and leaves the room with a locked scope — no follow-up email needed.",
    takeaway: "The agent organizes the complexity. The consultant drives the conversation.",
  },
  {
    type: "showcase",
    title: "Process Inventory",
    subtitle: "324 requirements. 20 process areas. Pre-loaded.",
    image: "/slides/process-inventory.png",
    agentDoes: "Maintains the full process taxonomy with sub-flows, tracks scope status, wave assignments, and ERP mapping for every process area. Expands to L3 sub-processes on demand.",
    consultantDoes: "Reviews the pre-built inventory with the client, customizes scope and wave assignments per process area, and focuses on design decisions — not building the list from scratch.",
    takeaway: "The agent assembles the inventory. The consultant tailors it to the client.",
  },
  {
    type: "showcase",
    title: "Process Flow Builder",
    subtitle: "Describe it, don't draw it.",
    image: "/slides/process-flow.png",
    agentDoes: "Generates future-state swimlane process flows from natural language descriptions, identifies agentic automation opportunities within each flow, and links requirements to process steps.",
    consultantDoes: "Describes the process in business language, reviews the generated flow with the client, and focuses on design trade-offs — not dragging boxes in Visio.",
    takeaway: "The agent draws the flow. The consultant designs the process.",
  },
  {
    type: "showcase",
    title: "COA Design Workbench",
    subtitle: "Eight tabs. Seeded from actual GL data.",
    image: "/slides/coa-workbench.png",
    agentDoes: "Ingests 500K+ GL posting lines, profiles every dimension (fill rates, key values, issues), detects data quality problems, and seeds the workbench with findings the consultant can act on.",
    consultantDoes: "Reviews agent-identified issues like the Functional Area gap shown here, makes design decisions with full data context, and resolves issues with the client — not pivoting in Excel.",
    takeaway: "The agent analyzes the data. The consultant makes the design decisions.",
  },
  {
    type: "showcase",
    title: "Reporting Inventory",
    subtitle: "Every report cataloged. Risks surfaced automatically.",
    image: "/slides/reporting-inventory.png",
    agentDoes: "Catalogs 28+ reports across statutory, management, and operational categories. Flags risks (manual processes, missing dimensions), identifies gaps, and links required dimensions to the COA design.",
    consultantDoes: "Reviews the risk findings with the client, prioritizes transformation targets, and connects reporting requirements to the COA workbench — not building the inventory from a blank spreadsheet.",
    takeaway: "The agent catalogs and flags risks. The consultant prioritizes and advises.",
  },
];

// ── 3-Slide Executive Pitch Deck ──────────────────────────────────────────
// Tight framing for 30-min exec meetings: 5-10 min slides, then 20 min demo.
// Route: /pitch?deck=exec
export const EXEC_PITCH_SLIDES: SlideData[] = [
  // ── Slide 1: Title ──────────────────────────────────────────────────────
  {
    type: "title",
    heading: "FT Agent",
    subheading: "Agentic Consulting for Insurance\nFinance Transformation",
    subtitle:
      "An agentic consulting framework to reimagine how we sell and deliver Phase 0 of Finance Transformations in Insurance.",
    footer: "March 2026 | Confidential",
  },

  // ── Slide 2: The Problem ────────────────────────────────────────────────
  {
    type: "phase0",
    title: "Phase 0 Today: The Problem",
    subtitle:
      "Every insurance finance transformation starts with a similar 12–18 week Phase 0 engagement. We have to reimagine how we pitch and deliver Phase 0 in the AI era to capture a bigger share of upcoming programs. Clients expect strategic advisory and faster value creation.",
    timeline: [
      { weeks: "Wk 1-4", label: "Data assembly & access setup", color: "red", widthPercent: 65 },
      { weeks: "Wk 3-6", label: "Workshops & manual capture", color: "amber", widthPercent: 55 },
      { weeks: "Wk 6-12", label: "Decisions & deliverables", color: "red", widthPercent: 40 },
    ],
    costs: [
      { value: "60%", label: "of time on coordination and assembly, not advisory", color: "red" },
      { value: "35+", label: "deliverables rebuilt from scratch — expertise manually assembled from similar engagements", color: "purple" },
      { value: "4-6 wks", label: "before clients see strategic insight", color: "amber" },
    ],
    takeaway:
      "We're billing premium rates for work that doesn't require premium judgment.",
  },

  // ── Slide 3: The Shift ─────────────────────────────────────────────────
  {
    type: "two-column",
    title: "The Shift",
    subtitle:
      "Agents replace the work. Consultants keep the judgment.",
    leftTitle: "Consultants Stop Doing Labor Intensive, Low Value Assembly Work",
    leftItems: [
      "GL data profiling in Excel",
      "Dragging boxes in Visio to create process flows",
      "Extracting requirements from workshop notes",
      "Creating and formatting deliverables by using templates from other projects",
      "Tracking open items in spreadsheets",
    ],
    rightTitle: "Consultants Focus the Majority of Time on High Value Work",
    rightItems: [
      "Strategic advisory",
      "Design trade-offs",
      "Steering workshops",
      "Executive insight",
      "Client relationships",
      "Selecting the best technology to get the job done",
      "Change management",
      "Transforming processes",
    ],
    takeaway:
      "FTA moves the left column to agents so consultants live in the right column.",
  },

  // ── The Product ───────────────────────────────────────────────────────
  {
    type: "three-column",
    title: "Finance Transformation Agent",
    subtitle:
      "We have channeled our expertise into an agentic consulting framework to elevate our consulting teams. We will free up consultants for strategic advisory and value creation and have fit-for-purpose Agents assemble Phase 0 deliverables.",
    cards: [
      {
        title: "Engagement Lead",
        subtitle: "Project manager",
        accent: "green",
        bullets: [
          "Workplan generation and tracking",
          "Decision registry with audit trail",
          "Attention queue — blocked items first",
          "ERP Vendor Selection",
        ],
        valueLine: "Nothing gets dropped",
      },
      {
        title: "Business Analyst",
        subtitle: "Functional consultant",
        accent: "amber",
        bullets: [
          "200+ insurance-specific finance processes L1–L3 for client-specific customization",
          "300+ standardized business requirements for client adoption",
          "FIT/GAP against major ERP platforms",
          "Identification of agentic potential",
        ],
        valueLine: "Assembly → advisory",
      },
      {
        title: "GL Design Coach",
        subtitle: "Accounting specialist",
        accent: "blue",
        bullets: [
          "GL design grounded in GL data from the current solution",
          "17-step chart of accounts simplification",
          "Seeds COA and code block design from actual data",
          "Three-tier audit-ready hierarchy classification",
        ],
        valueLine: "Weeks of GL work → hours",
      },
    ],
    takeaway:
      "The consulting framework is the product. The AI agents are capabilities inside it.",
  },

  // ── Technical Architecture ────────────────────────────────────────────
  {
    type: "three-column",
    title: "Technical Architecture",
    subtitle: "Production-grade. Strict TypeScript. Strict MyPy. Not a prototype.",
    cards: [
      {
        title: "Frontend",
        subtitle: "Next.js 15 + App Router",
        accent: "blue",
        bullets: [
          "Tailwind + Shadcn/ui",
          "Zustand + TanStack Query",
          "React Flow for process graphs",
          "SSE streaming for agent output",
          "Framer Motion for agent states",
        ],
      },
      {
        title: "Agent Layer",
        subtitle: "LangGraph orchestration",
        accent: "amber",
        bullets: [
          "Claude Opus / Sonnet / Haiku",
          "LiteLLM multi-provider routing",
          "Decision registry with interrupts",
          "Structured logging + LangSmith",
          "Tool-level locking per engagement",
        ],
      },
      {
        title: "Data Layer",
        subtitle: "Python FastAPI + DuckDB",
        accent: "green",
        bullets: [
          "DuckDB for 500K+ row analysis",
          "Polars for DataFrame operations",
          "Supabase (Postgres + pgvector)",
          "Row-level security isolation",
          "Async-first, SSE streaming",
        ],
      },
    ],
  },

  // ── Transition: Capabilities ──────────────────────────────────────────
  {
    type: "title",
    heading: "See It Working",
    subheading: "Six capabilities.\nBuilt and running.",
    subtitle:
      "Every screen you're about to see is a production workspace — not a mockup. On each one, notice the same pattern: the agent does the assembly, the consultant makes the judgment call.",
    footer: "",
  },

  // ── Feature Showcase Slides ───────────────────────────────────────────
  ...SHOWCASE_SLIDES,
];

// ── Full 11-Slide Pitch Deck ──────────────────────────────────────────────
export const PITCH_SLIDES: SlideData[] = [
  // ── Slide 1: Title ──────────────────────────────────────────────────────
  {
    type: "title",
    heading: "FT Agent",
    subheading: "Agentic Consulting for Insurance\nFinance Transformation",
    subtitle:
      "A consulting framework with embedded AI agents that produces all Phase 0 deliverables.",
    footer: "March 2026 | Confidential",
  },

  // ── Slide 2: Phase 0 Today ──────────────────────────────────────────────
  {
    type: "phase0",
    title: "Phase 0 Today: Where Our Time Goes",
    subtitle:
      "Phase 0 of every insurance finance transformation follows the same pattern and creates the same deliverables — and most of our time isn't spent on strategic advisory and creating value for the clients.",
    timeline: [
      { weeks: "Wk 1-3", label: "Data requests, GL extracts, access setup", color: "red", widthPercent: 65 },
      { weeks: "Wk 3-5", label: "Requirement workshops + manual capture", color: "amber", widthPercent: 55 },
      { weeks: "Wk 5-6", label: "Process mapping in Visio / Reporting", color: "amber", widthPercent: 45 },
      { weeks: "Wk 5-8", label: "COA analysis + dimension review", color: "red", widthPercent: 40 },
      { weeks: "Wk 8-12", label: "Consolidation + leadership readout", color: "green", widthPercent: 30 },
    ],
    costs: [
      { value: "60%", label: "of consultant time on assembly, not advisory", color: "red" },
      { value: "4-6 wks", label: "before clients see any strategic insight", color: "amber" },
      { value: "35+", label: "Phase 0 deliverables rebuilt from scratch for each engagement", color: "purple" },
      { value: "324+", label: "requirements captured manually across 20 process areas for each engagement", color: "cyan" },
      { value: "COA", label: "COA & code block analysis — fully Excel-based, manual", color: "purple" },
      { value: "Rpts", label: "Reporting rationalization — fully manual process", color: "red" },
    ],
    takeaway:
      "We're billing premium rates for work that doesn't require premium judgment. Our clients have noticed.",
  },

  // ── Slide 3: The Shift ──────────────────────────────────────────────────
  {
    type: "two-column",
    title: "The Shift",
    subtitle:
      "Agents replace the work. Consultants keep the judgment.",
    leftTitle: "Consultants Stop Doing Labor Intensive, Low Value Assembly Work",
    leftItems: [
      "GL data profiling in Excel",
      "Dragging boxes in Visio to create process flows",
      "Extracting requirements from workshop notes",
      "Creating and formatting deliverables by using templates from other projects",
      "Tracking open items in spreadsheets",
    ],
    rightTitle: "Consultants Focus the Majority of Time on High Value Work",
    rightItems: [
      "Strategic advisory",
      "Design trade-offs",
      "Steering workshops",
      "Executive insight",
      "Client relationships",
      "Selecting the best technology to get the job done",
      "Change management",
      "Transforming processes",
    ],
    takeaway:
      "FTA moves the left column to agents so consultants live in the right column.",
  },

  // ── Slide 4: What Is FTA ───────────────────────────────────────────────
  {
    type: "three-column",
    title: "Finance Transformation Agent",
    subtitle:
      "A consulting framework with embedded AI agents that produces all Phase 0 deliverables.",
    cards: [
      {
        title: "Purpose-Built",
        subtitle: "Not a generic AI tool",
        accent: "blue",
        bullets: [
          "Insurance finance domain knowledge",
          "324 leading-practice requirements",
          "20 process area taxonomies",
          "NAIC, GAAP, IFRS 17 alignment",
        ],
        valueLine: "Domain AI, not generic AI",
      },
      {
        title: "Connected",
        subtitle: "Not a standalone tool",
        accent: "amber",
        bullets: [
          "Three specialized agents collaborate",
          "Cross-deliverable references",
          "Real-time workshop capture",
          "Living artifacts, not static files",
        ],
        valueLine: "The framework is the product",
      },
      {
        title: "Workspace-Native",
        subtitle: "Not a chatbot",
        accent: "green",
        bullets: [
          "Deliverable workspaces, not chat windows",
          "Inline editing on agent output",
          "Source attribution on every finding",
          "Audit trail on every decision",
        ],
        valueLine: "Consultants steer, agents execute",
      },
    ],
    takeaway:
      "The consulting framework is the product. The AI agents are capabilities inside it.",
  },

  // ── Slide 5: Three Agents ──────────────────────────────────────────────
  {
    type: "three-column",
    title: "Three Agents, One Platform",
    subtitle:
      "Each agent is a specialist. Together they cover all Phase 0 workflows.",
    cards: [
      {
        title: "GL Design Coach",
        subtitle: "Accounting specialist",
        accent: "blue",
        bullets: [
          "Ingests 500K+ GL posting lines",
          "Runs 5 DuckDB analysis tools",
          "Detects MJE patterns automatically",
          "Seeds COA Design Workbench",
          "Three-tier audit-ready classification",
        ],
        valueLine: "Weeks of GL work → hours",
      },
      {
        title: "Functional Consultant",
        subtitle: "Business analyst",
        accent: "amber",
        bullets: [
          "324 requirements across 20 process areas",
          "NLP-powered process flow builder",
          "Cross-process-area impact analysis",
          "Gap-to-requirement conversion",
          "Session prep and deliverable drafting",
        ],
        valueLine: "Assembly time → advisory time",
      },
      {
        title: "Consulting Agent",
        subtitle: "Project manager",
        accent: "green",
        bullets: [
          "Workplan generation and tracking",
          "Decision registry with audit trail",
          "Attention queue — blocked items first",
          "Presence awareness across team",
          "Status and progress reporting",
        ],
        valueLine: "No dropped items, no status meetings",
      },
    ],
  },

  // ── Feature Showcase Slides ───────────────────────────────────────────
  ...SHOWCASE_SLIDES,

  // ── Workshop Mode ─────────────────────────────────────────────────────
  {
    type: "two-column",
    title: "Workshop Mode",
    subtitle: "Live client sessions, structured output.",
    leftTitle: "The Old Way",
    leftItems: [
      "Consultant takes notes in Word",
      'Blank page — "what are your requirements?"',
      "2–3 hours of cleanup after every session",
      "Half the context lost in translation",
    ],
    rightTitle: "The FTA Way",
    rightItems: [
      "Consultant opens FTA on the projector",
      "Leading-practice requirements already loaded — client reacts",
      "Structured output walks out of the room",
      "Every capture is agent-normalized in real time",
    ],
    takeaway:
      "Keyboard-first. R = capture requirement. G = flag a gap. N = add a step. Auto-save. The post-workshop cleanup is eliminated.",
    demoRoute: "/eng-001/deliverables/d-004-04",
    demoLabel: "See Workshop Mode live",
  },

  // ── Slide 7: Process Design ────────────────────────────────────────────
  {
    type: "two-column",
    title: "Describe It, Don't Draw It",
    subtitle: "Process design becomes a business conversation.",
    leftTitle: "The Old Way",
    leftItems: [
      "4–6 hours in Visio per flow",
      "Revision = redraw from scratch",
      "Consultant skill = graphic design",
    ],
    rightTitle: "The FTA Way",
    rightItems: [
      "Describe the flow in conversation",
      "Revision = one sentence",
      "Consultant skill = insurance finance",
    ],
    takeaway:
      "Split screen. Left: chat with the agent. Right: live swimlane preview. Minutes, not hours.",
    demoRoute: "/eng-001/deliverables/d-004-03",
    demoLabel: "See Process Builder live",
  },

  // ── Slide 8: GL Analysis & COA Design ──────────────────────────────────
  {
    type: "two-column",
    title: "Domain AI, Not Generic AI",
    subtitle: "GL analysis and COA design, purpose-built for insurance.",
    leftTitle: "The Old Way",
    leftItems: [
      "Export GL to Excel, write VLOOKUPs",
      "Days of manual pivoting",
      "COA design in spreadsheets, emailed around",
      "Generic data tools, no insurance context",
      "Manually build and maintain FSV hierarchies",
    ],
    rightTitle: "The FTA Way",
    rightItems: [
      "Agent ingests 500K+ posting lines, runs 5 analysis tools",
      "Minutes — account profiling, MJE detection, trial balance",
      "Eight-tab collaborative workbench — agent-seeded, consultant-refined",
      "Insurance-specific: NAIC, statutory mapping, loss reserve patterns",
      "Agent computes roll-ups dynamically — hierarchy is a view",
    ],
    takeaway:
      "Weeks 1–4 of GL work compressed to hours. Every recommendation grounded in the client's actual data.",
    demoRoute: "/eng-001/deliverables/d-005-02",
    demoLabel: "See COA Workbench live",
  },

  // ── Slide 9: What Clients Get ──────────────────────────────────────────
  {
    type: "value",
    title: "What Clients Get",
    subtitle: "Every deliverable is a living artifact, not a file to be emailed.",
    cards: [
      {
        title: "Speed",
        accent: "blue",
        bullets: [
          "Phase 0 insights in days, not weeks",
          "Workshop output is deliverable-ready",
          "Process flows in minutes, not hours",
        ],
        valueLine: "4–6 weeks → days",
      },
      {
        title: "Quality",
        accent: "green",
        bullets: [
          "324 leading-practice requirements",
          "Source attribution on every finding",
          "Audit-ready classification trails",
        ],
        valueLine: "Higher quality, lower cost",
      },
      {
        title: "Transparency",
        accent: "amber",
        bullets: [
          "Three-level trace on every agent action",
          "Preflight → execution → decision interrupts",
          "Every output editable and overridable",
        ],
        valueLine: "Trust through visibility",
      },
      {
        title: "Continuity",
        accent: "cyan",
        bullets: [
          "Living artifacts across phases",
          "No context lost between sessions",
          "Full engagement history searchable",
        ],
        valueLine: "Nothing gets dropped",
      },
    ],
    takeaway:
      "The consultant's expertise is amplified, not replaced.",
  },

  // ── Slide 10: Technical Architecture ───────────────────────────────────
  {
    type: "three-column",
    title: "Technical Architecture",
    subtitle: "Production-grade. Strict TypeScript. Strict MyPy. Not a prototype.",
    cards: [
      {
        title: "Frontend",
        subtitle: "Next.js 15 + App Router",
        accent: "blue",
        bullets: [
          "Tailwind + Shadcn/ui",
          "Zustand + TanStack Query",
          "React Flow for process graphs",
          "SSE streaming for agent output",
          "Framer Motion for agent states",
        ],
      },
      {
        title: "Agent Layer",
        subtitle: "LangGraph orchestration",
        accent: "amber",
        bullets: [
          "Claude Opus / Sonnet / Haiku",
          "LiteLLM multi-provider routing",
          "Decision registry with interrupts",
          "Structured logging + LangSmith",
          "Tool-level locking per engagement",
        ],
      },
      {
        title: "Data Layer",
        subtitle: "Python FastAPI + DuckDB",
        accent: "green",
        bullets: [
          "DuckDB for 500K+ row analysis",
          "Polars for DataFrame operations",
          "Supabase (Postgres + pgvector)",
          "Row-level security isolation",
          "Async-first, SSE streaming",
        ],
      },
    ],
  },

  // ── Slide 11: Vision & Roadmap ─────────────────────────────────────────
  {
    type: "roadmap",
    title: "Vision & Roadmap",
    phases: [
      {
        title: "Pitch Demo MVP",
        timing: "Now",
        accent: "blue",
        bullets: [
          "Core workflows operational",
          "7 workstreams, 35 deliverables",
          "GL analysis tools live",
          "End-to-end agent flows",
        ],
      },
      {
        title: "Personal Use",
        timing: "Next",
        accent: "amber",
        bullets: [
          "Battle-tested on real engagements",
          "Cloud deployment (GCP)",
          "Feedback-driven refinement",
          "Full agent autonomy on routine tasks",
        ],
      },
      {
        title: "Practice Pilots",
        timing: "Vision",
        accent: "green",
        bullets: [
          "3–5 senior consultants",
          "Multi-user cloud infrastructure",
          "Adjacent industries",
          "Competitive differentiator in pursuit",
        ],
      },
    ],
    footer: "Let me prove it on one engagement.",
  },
];
