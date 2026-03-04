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
  | "value";

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

export type SlideData =
  | TitleSlideData
  | TwoColumnSlideData
  | ThreeColumnSlideData
  | StatsSlideData
  | Phase0SlideData
  | RoadmapSlideData
  | ValueSlideData;

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
    leftTitle: "Consultants Are Stuck Doing",
    leftItems: [
      "GL data profiling in Excel",
      "Dragging boxes in Visio",
      "Writing up notes after workshops",
      "Formatting deliverables",
      "Tracking open items in spreadsheets",
    ],
    rightTitle: "Consultants Should Be Doing",
    rightItems: [
      "Strategic advisory",
      "Design trade-offs",
      "Steering workshops",
      "Executive insight",
      "Client relationships",
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

  // ── Slide 6: Workshop Mode ─────────────────────────────────────────────
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
