export type EngagementPhase =
  | "discovery"
  | "current_state"
  | "design"
  | "build"
  | "test"
  | "cutover";

export type DeliverableStatus =
  | "not_started"
  | "in_progress"
  | "in_review"
  | "complete"
  | "blocked";

export interface Deliverable {
  deliverable_id: string;
  name: string;
  status: DeliverableStatus;
  owner_agent?: "consulting_agent" | "gl_design_coach" | "functional_consultant";
  in_scope?: boolean; // undefined treated as true
}

export interface Workstream {
  workstream_id: string;
  name: string;
  deliverables: Deliverable[];
}

export interface Workplan {
  workplan_id: string;
  engagement_id: string;
  workstreams: Workstream[];
  created_at: string;
}

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
  workplan?: Workplan;
}

export interface AgentCard {
  agent_id: string;
  name: string;
  role: string;
  description: string;
  exclusive_tools: string[]; // tool names that can be locked
}

const ACME_WORKPLAN: Workplan = {
  workplan_id: "wp-001",
  engagement_id: "eng-001",
  created_at: "2026-01-15T09:00:00Z",
  workstreams: [
    {
      workstream_id: "ws-001",
      name: "Project Management & Governance",
      deliverables: [
        { deliverable_id: "d-001-01", name: "Project Charter", status: "complete", owner_agent: "consulting_agent" },
        { deliverable_id: "d-001-02", name: "Steering Committee Deck (template)", status: "complete", owner_agent: "consulting_agent" },
        { deliverable_id: "d-001-03", name: "RACI Matrix", status: "in_progress", owner_agent: "consulting_agent" },
        { deliverable_id: "d-001-04", name: "Risk & Issue Log (setup)", status: "in_progress", owner_agent: "consulting_agent" },
        { deliverable_id: "d-001-05", name: "Communication Plan", status: "not_started", owner_agent: "consulting_agent" },
      ],
    },
    {
      workstream_id: "ws-002",
      name: "Business Case & Scope",
      deliverables: [
        { deliverable_id: "d-002-01", name: "Business Case Document", status: "complete", owner_agent: "functional_consultant" },
        { deliverable_id: "d-002-02", name: "Scope Definition (in/out-of-scope inventory)", status: "complete", owner_agent: "functional_consultant" },
        { deliverable_id: "d-002-03", name: "Stakeholder Map", status: "in_review", owner_agent: "consulting_agent" },
        { deliverable_id: "d-002-04", name: "Benefits Realization Framework", status: "not_started", owner_agent: "functional_consultant" },
      ],
    },
    {
      workstream_id: "ws-003",
      name: "ERP Software Selection",
      deliverables: [
        { deliverable_id: "d-003-01", name: "ERP Selection Criteria & Scoring Model", status: "complete", owner_agent: "consulting_agent" },
        { deliverable_id: "d-003-02", name: "Vendor Demonstrations Script (P&C-specific scenarios)", status: "complete", owner_agent: "functional_consultant" },
        { deliverable_id: "d-003-03", name: "RFP / RFI Template", status: "complete", owner_agent: "consulting_agent" },
        { deliverable_id: "d-003-04", name: "Evaluation Summary & Recommendation", status: "complete", owner_agent: "consulting_agent" },
        { deliverable_id: "d-003-05", name: "Reference Site Visit Report", status: "not_started", owner_agent: "consulting_agent" },
      ],
    },
    {
      workstream_id: "ws-004",
      name: "Business Process Design",
      deliverables: [
        { deliverable_id: "d-004-01", name: "Process Inventory (R2R, P2P, FP&A, Financial Close, Treasury, Fixed Assets, Reinsurance Accounting, Claims Finance, Regulatory/Statutory Reporting, Tax)", status: "in_progress", owner_agent: "functional_consultant" },
        { deliverable_id: "d-004-02", name: "Current State Process Maps (BPMN / swim-lane)", status: "in_review", owner_agent: "functional_consultant" },
        { deliverable_id: "d-004-03", name: "Future State Process Maps", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-004-04", name: "Business Requirements by Process", status: "in_progress", owner_agent: "functional_consultant" },
        { deliverable_id: "d-004-05", name: "User Stories Backlog", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-004-06", name: "Process Gap Analysis", status: "not_started", owner_agent: "functional_consultant" },
      ],
    },
    {
      workstream_id: "ws-005",
      name: "COA & GL Design",
      deliverables: [
        { deliverable_id: "d-005-01", name: "Account Analysis Report (MJE detection, profiling)", status: "complete", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-005-02", name: "Chart of Accounts Design (code block, dimensions)", status: "in_progress", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-005-03", name: "Account Mapping: Legacy → New COA", status: "in_progress", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-005-04", name: "ACDOCA Dimension Design (profit center, segment, functional area)", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-005-05", name: "Document Splitting Configuration Spec", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-005-06", name: "P&C-Specific Account Groups (NAIC alignment, loss reserves, reinsurance)", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-005-07", name: "GL Open Items / Clearing Accounts Inventory", status: "blocked", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-005-08", name: "Multi-GAAP Ledger Design (IFRS 17, US GAAP, Stat)", status: "not_started", owner_agent: "gl_design_coach" },
      ],
    },
    {
      workstream_id: "ws-006",
      name: "Reporting & Analytics",
      deliverables: [
        { deliverable_id: "d-006-01", name: "Reporting Inventory (by user group and frequency)", status: "in_progress", owner_agent: "functional_consultant" },
        { deliverable_id: "d-006-02", name: "Management Reporting Blueprint (P&L, balance sheet)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-006-03", name: "Regulatory/Statutory Reporting Map (NAIC Annual Statement)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-006-04", name: "Analytics & Dashboard Requirements", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-006-05", name: "SAP Datasphere / BW4HANA Architecture (if in scope)", status: "not_started", owner_agent: "functional_consultant" },
      ],
    },
    {
      workstream_id: "ws-007",
      name: "Data & Integration",
      deliverables: [
        { deliverable_id: "d-007-01", name: "Data Migration Strategy", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-007-02", name: "Data Quality Assessment", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-007-03", name: "Integration Architecture Overview", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-007-04", name: "Interface Inventory (source systems → SAP)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-007-05", name: "Data Cleansing Rules", status: "not_started", owner_agent: "functional_consultant" },
      ],
    },
  ],
};

const BEACON_WORKPLAN: Workplan = {
  workplan_id: "wp-002",
  engagement_id: "eng-002",
  created_at: "2026-02-01T09:00:00Z",
  workstreams: [
    {
      workstream_id: "ws-b01",
      name: "Project Management & Governance",
      deliverables: [
        { deliverable_id: "d-b01-01", name: "Project Charter", status: "in_progress", owner_agent: "consulting_agent" },
        { deliverable_id: "d-b01-02", name: "Steering Committee Deck (template)", status: "not_started", owner_agent: "consulting_agent" },
        { deliverable_id: "d-b01-03", name: "RACI Matrix", status: "not_started", owner_agent: "consulting_agent" },
        { deliverable_id: "d-b01-04", name: "Risk & Issue Log (setup)", status: "not_started", owner_agent: "consulting_agent" },
        { deliverable_id: "d-b01-05", name: "Communication Plan", status: "not_started", owner_agent: "consulting_agent" },
      ],
    },
    {
      workstream_id: "ws-b02",
      name: "Business Case & Scope",
      deliverables: [
        { deliverable_id: "d-b02-01", name: "Business Case Document", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b02-02", name: "Scope Definition (in/out-of-scope inventory)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b02-03", name: "Stakeholder Map", status: "not_started", owner_agent: "consulting_agent" },
        { deliverable_id: "d-b02-04", name: "Benefits Realization Framework", status: "not_started", owner_agent: "functional_consultant" },
      ],
    },
    {
      workstream_id: "ws-b03",
      name: "ERP Software Selection",
      deliverables: [
        { deliverable_id: "d-b03-01", name: "ERP Selection Criteria & Scoring Model", status: "not_started", owner_agent: "consulting_agent" },
        { deliverable_id: "d-b03-02", name: "Vendor Demonstrations Script (P&C-specific scenarios)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b03-03", name: "RFP / RFI Template", status: "not_started", owner_agent: "consulting_agent" },
        { deliverable_id: "d-b03-04", name: "Evaluation Summary & Recommendation", status: "not_started", owner_agent: "consulting_agent" },
        { deliverable_id: "d-b03-05", name: "Reference Site Visit Report", status: "not_started", owner_agent: "consulting_agent" },
      ],
    },
    {
      workstream_id: "ws-b04",
      name: "Business Process Design",
      deliverables: [
        { deliverable_id: "d-b04-01", name: "Process Inventory (R2R, P2P, FP&A, Financial Close, Treasury, Fixed Assets, Reinsurance Accounting, Claims Finance, Regulatory/Statutory Reporting, Tax)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b04-02", name: "Current State Process Maps (BPMN / swim-lane)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b04-03", name: "Future State Process Maps", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b04-04", name: "Business Requirements by Process", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b04-05", name: "User Stories Backlog", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b04-06", name: "Process Gap Analysis", status: "not_started", owner_agent: "functional_consultant" },
      ],
    },
    {
      workstream_id: "ws-b05",
      name: "COA & GL Design",
      deliverables: [
        { deliverable_id: "d-b05-01", name: "Account Analysis Report (MJE detection, profiling)", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-b05-02", name: "Chart of Accounts Design (code block, dimensions)", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-b05-03", name: "Account Mapping: Legacy → New COA", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-b05-04", name: "ACDOCA Dimension Design (profit center, segment, functional area)", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-b05-05", name: "Document Splitting Configuration Spec", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-b05-06", name: "P&C-Specific Account Groups (NAIC alignment, loss reserves, reinsurance)", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-b05-07", name: "GL Open Items / Clearing Accounts Inventory", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-b05-08", name: "Multi-GAAP Ledger Design (IFRS 17, US GAAP, Stat)", status: "not_started", owner_agent: "gl_design_coach" },
      ],
    },
    {
      workstream_id: "ws-b06",
      name: "Reporting & Analytics",
      deliverables: [
        { deliverable_id: "d-b06-01", name: "Reporting Inventory (by user group and frequency)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b06-02", name: "Management Reporting Blueprint (P&L, balance sheet)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b06-03", name: "Regulatory/Statutory Reporting Map (NAIC Annual Statement)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b06-04", name: "Analytics & Dashboard Requirements", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b06-05", name: "SAP Datasphere / BW4HANA Architecture (if in scope)", status: "not_started", owner_agent: "functional_consultant" },
      ],
    },
    {
      workstream_id: "ws-b07",
      name: "Data & Integration",
      deliverables: [
        { deliverable_id: "d-b07-01", name: "Data Migration Strategy", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b07-02", name: "Data Quality Assessment", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b07-03", name: "Integration Architecture Overview", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b07-04", name: "Interface Inventory (source systems → SAP)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-b07-05", name: "Data Cleansing Rules", status: "not_started", owner_agent: "functional_consultant" },
      ],
    },
  ],
};

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
    workplan: ACME_WORKPLAN,
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
    workplan: BEACON_WORKPLAN,
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
