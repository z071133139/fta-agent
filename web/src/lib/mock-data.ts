export type EngagementPhase =
  | "discovery"
  | "current_state"
  | "design"
  | "build"
  | "test"
  | "cutover";

export interface EngagementConsultant {
  consultant_id: string;
  display_name: string;
  initials: string;
}

export interface EngagementStats {
  open_decisions: number;
  high_findings: number;
  requirements: number;
  unvalidated_reqs: number;
  blocked_items: number;
}

export interface Engagement {
  engagement_id: string;
  client_name: string;
  sub_segment: "P&C" | "Life" | "Reinsurance";
  erp_target: string;
  phase: EngagementPhase;
  last_active: string; // relative string e.g. "2h ago"
  consultants: EngagementConsultant[];
  stats: EngagementStats;
  is_active: boolean;
}

export interface AgentCard {
  agent_id: string;
  name: string;
  role: string;
  description: string;
  exclusive_tools: string[]; // tool names that can be locked
}

export const MOCK_ENGAGEMENTS: Engagement[] = [
  {
    engagement_id: "eng-001",
    client_name: "Acme Insurance",
    sub_segment: "P&C",
    erp_target: "SAP S/4HANA",
    phase: "design",
    last_active: "2h ago",
    consultants: [
      { consultant_id: "mock-001", display_name: "Sarah K.", initials: "SK" },
      { consultant_id: "mock-002", display_name: "Tom R.", initials: "TR" },
      { consultant_id: "mock-003", display_name: "Priya M.", initials: "PM" },
    ],
    stats: {
      open_decisions: 3,
      high_findings: 2,
      requirements: 12,
      unvalidated_reqs: 3,
      blocked_items: 1,
    },
    is_active: true,
  },
  {
    engagement_id: "eng-002",
    client_name: "Beacon Reinsurance",
    sub_segment: "Reinsurance",
    erp_target: "SAP S/4HANA",
    phase: "discovery",
    last_active: "3d ago",
    consultants: [
      { consultant_id: "mock-001", display_name: "Sarah K.", initials: "SK" },
    ],
    stats: {
      open_decisions: 0,
      high_findings: 0,
      requirements: 2,
      unvalidated_reqs: 2,
      blocked_items: 0,
    },
    is_active: true,
  },
];

export const AGENT_CARDS: AgentCard[] = [
  {
    agent_id: "gl_design_coach",
    name: "GL Design Coach",
    role: "P&C Insurance Specialist",
    description:
      "Account analysis, MJE detection, code block dimension design, and COA construction for SAP S/4HANA.",
    exclusive_tools: ["ingest_gl_data", "run_account_profiling", "run_mje_detection"],
  },
  {
    agent_id: "functional_consultant",
    name: "Functional Consultant",
    role: "Generalist",
    description:
      "Requirements extraction, process flow documentation, and deliverable generation.",
    exclusive_tools: [],
  },
  {
    agent_id: "consulting_agent",
    name: "Consulting Agent",
    role: "Engagement Lead & PMO",
    description:
      "Workplan, decision registry, open items, status synthesis, and cross-agent coordination.",
    exclusive_tools: [],
  },
];

export const PHASE_LABELS: Record<EngagementPhase, string> = {
  discovery: "Discovery",
  current_state: "Current State",
  design: "Design",
  build: "Build",
  test: "Test & Cutover",
  cutover: "Cutover",
};
