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
  in_scope?: boolean;      // undefined treated as true
  agent_summary?: string;  // one-line output summary or blocker reason from the agent
  needs_input?: boolean;   // agent is waiting on consultant judgment/action
}

export interface Workstream {
  workstream_id: string;
  name: string;
  owner_agent?: "consulting_agent" | "gl_design_coach" | "functional_consultant";
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
      owner_agent: "consulting_agent",
      deliverables: [
        { deliverable_id: "d-001-01", name: "Project Charter", status: "complete", owner_agent: "consulting_agent", agent_summary: "Approved by steering committee · CFO sign-off received Jan 20" },
        { deliverable_id: "d-001-02", name: "Steering Committee Deck (template)", status: "complete", owner_agent: "consulting_agent", agent_summary: "Template approved · 14-slide format · Q1 cadence confirmed" },
        { deliverable_id: "d-001-03", name: "RACI Matrix", status: "in_progress", owner_agent: "consulting_agent", agent_summary: "8 of 12 roles mapped · 3 gaps in claims finance ownership need resolution", needs_input: true },
        { deliverable_id: "d-001-04", name: "Risk & Issue Log (setup)", status: "in_progress", owner_agent: "consulting_agent", agent_summary: "Setup complete · 4 risks logged · 1 high severity item open" },
        { deliverable_id: "d-001-05", name: "Communication Plan", status: "not_started", owner_agent: "consulting_agent" },
      ],
    },
    {
      workstream_id: "ws-002",
      name: "Business Case & Scope",
      owner_agent: "functional_consultant",
      deliverables: [
        { deliverable_id: "d-002-01", name: "Business Case Document", status: "complete", owner_agent: "functional_consultant", agent_summary: "Approved · $4.2M investment · 18-month payback · Board signed off" },
        { deliverable_id: "d-002-02", name: "Scope Definition (in/out-of-scope inventory)", status: "complete", owner_agent: "functional_consultant", agent_summary: "47 in-scope items confirmed · 12 explicitly excluded · Baseline locked" },
        { deliverable_id: "d-002-03", name: "Stakeholder Map", status: "in_review", owner_agent: "consulting_agent", agent_summary: "14 stakeholders mapped · CFO and CTO alignment still pending", needs_input: true },
        { deliverable_id: "d-002-04", name: "Benefits Realization Framework", status: "not_started", owner_agent: "functional_consultant" },
      ],
    },
    {
      workstream_id: "ws-003",
      name: "ERP Software Selection",
      owner_agent: "consulting_agent",
      deliverables: [
        { deliverable_id: "d-003-01", name: "ERP Selection Criteria & Scoring Model", status: "complete", owner_agent: "consulting_agent", agent_summary: "23 weighted criteria across 5 dimensions · Insurance-specific scenarios included" },
        { deliverable_id: "d-003-02", name: "Vendor Demonstrations Script (P&C-specific scenarios)", status: "complete", owner_agent: "functional_consultant", agent_summary: "18 P&C scenarios · Claims finance, reinsurance accounting, and statutory reporting covered" },
        { deliverable_id: "d-003-03", name: "RFP / RFI Template", status: "complete", owner_agent: "consulting_agent", agent_summary: "Issued to 3 vendors · All responses received and scored" },
        { deliverable_id: "d-003-04", name: "Evaluation Summary & Recommendation", status: "complete", owner_agent: "consulting_agent", agent_summary: "SAP S/4HANA selected · Highest score on insurance fit and reporting capability" },
        { deliverable_id: "d-003-05", name: "Reference Site Visit Report", status: "not_started", owner_agent: "consulting_agent" },
      ],
    },
    {
      workstream_id: "ws-004",
      name: "Business Process Design",
      owner_agent: "functional_consultant",
      deliverables: [
        { deliverable_id: "d-004-01", name: "Process Inventory (R2R, P2P, FP&A, Financial Close, Treasury, Fixed Assets, Reinsurance Accounting, Claims Finance, Regulatory/Statutory Reporting, Tax)", status: "in_progress", owner_agent: "functional_consultant", agent_summary: "R2R, P2P, and Financial Close complete · Claims Finance and Reinsurance in progress" },
        { deliverable_id: "d-004-02", name: "Current State Process Maps (BPMN / swim-lane)", status: "in_review", owner_agent: "functional_consultant", agent_summary: "8 of 10 processes documented · Ready for workshop validation with finance team", needs_input: true },
        { deliverable_id: "d-004-03", name: "Future State Process Maps", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-004-04", name: "Business Requirements by Process", status: "in_progress", owner_agent: "functional_consultant", agent_summary: "47 requirements captured · Structured, tagged, and linked to process steps" },
        { deliverable_id: "d-004-05", name: "User Stories Backlog", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-004-06", name: "Process Gap Analysis", status: "not_started", owner_agent: "functional_consultant" },
      ],
    },
    {
      workstream_id: "ws-005",
      name: "COA & GL Design",
      owner_agent: "gl_design_coach",
      deliverables: [
        { deliverable_id: "d-005-01", name: "Account Analysis Report (MJE detection, profiling)", status: "complete", owner_agent: "gl_design_coach", agent_summary: "68 accounts profiled · 7 MJE patterns detected · JSMITH flagged as key person risk" },
        { deliverable_id: "d-005-02", name: "Chart of Accounts Design (code block, dimensions)", status: "in_progress", owner_agent: "gl_design_coach", agent_summary: "Profit centre structure drafted · 2 design decisions pending your sign-off", needs_input: true },
        { deliverable_id: "d-005-03", name: "Account Mapping: Legacy → New COA", status: "in_progress", owner_agent: "gl_design_coach", agent_summary: "34 of 68 accounts mapped · 12 legacy accounts flagged for cleanup" },
        { deliverable_id: "d-005-04", name: "ACDOCA Dimension Design (profit center, segment, functional area)", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-005-05", name: "Document Splitting Configuration Spec", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-005-06", name: "P&C-Specific Account Groups (NAIC alignment, loss reserves, reinsurance)", status: "not_started", owner_agent: "gl_design_coach" },
        { deliverable_id: "d-005-07", name: "GL Open Items / Clearing Accounts Inventory", status: "blocked", owner_agent: "gl_design_coach", agent_summary: "Awaiting trial balance extract from client finance team", needs_input: true },
        { deliverable_id: "d-005-08", name: "Multi-GAAP Ledger Design (IFRS 17, US GAAP, Stat)", status: "not_started", owner_agent: "gl_design_coach" },
      ],
    },
    {
      workstream_id: "ws-006",
      name: "Reporting & Analytics",
      owner_agent: "functional_consultant",
      deliverables: [
        { deliverable_id: "d-006-01", name: "Reporting Inventory (by user group and frequency)", status: "in_progress", owner_agent: "functional_consultant", agent_summary: "23 reports identified · Prioritised by user group and close frequency" },
        { deliverable_id: "d-006-02", name: "Management Reporting Blueprint (P&L, balance sheet)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-006-03", name: "Regulatory/Statutory Reporting Map (NAIC Annual Statement)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-006-04", name: "Analytics & Dashboard Requirements", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-006-05", name: "SAP Datasphere / BW4HANA Architecture (if in scope)", status: "not_started", owner_agent: "functional_consultant" },
      ],
    },
    {
      workstream_id: "ws-007",
      name: "Data & Integration",
      owner_agent: "functional_consultant",
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
      owner_agent: "consulting_agent",
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
      owner_agent: "functional_consultant",
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
      owner_agent: "consulting_agent",
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
      owner_agent: "functional_consultant",
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
      owner_agent: "gl_design_coach",
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
      owner_agent: "functional_consultant",
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
      owner_agent: "functional_consultant",
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

export type AgentRunState = "preflight" | "running" | "awaiting_input" | "complete";
export type AgentKind = "data_grounded" | "knowledge_grounded";

export interface InsightCard {
  kind: "finding" | "risk" | "compliant" | "info";
  text: string;
}

export interface ArtifactColumn {
  key: string;
  label: string;
  width?: string;
}

export interface ArtifactRow {
  row_id: string;
  cells: Record<string, string>;
  flags?: string[];
  provenance?: string;
  needs_attention?: boolean;
}

export interface InlineInterruptData {
  question: string;
  context: string;
  options: { label: string; description: string }[];
  insert_after_row_id: string;
}

export interface ActivityEntry {
  step: number;
  label: string;
  detail?: string;
  status: "complete" | "active" | "pending";
  duration_ms?: number;
}

// ── Process graph types ─────────────────────────────────────────────────────

export type ProcessNodeType =
  | "task" | "gateway_exclusive" | "gateway_parallel" | "start" | "end" | "subprocess";

export type ProcessScopeStatus =
  | "in_scope" | "out_of_scope" | "in_progress" | "complete" | "deferred";

export type ProcessOverlayKind = "constraint" | "requirement" | "exception" | "risk";

export interface ProcessOverlay {
  id: string;
  node_id: string;
  kind: ProcessOverlayKind;
  text: string;
  source: "agent_elicited" | "gl_finding" | "consultant";
}

export interface ProcessFlowNode {
  id: string;
  type: ProcessNodeType;
  label: string;
  role?: string;
  system?: string;
  status?: "leading_practice" | "client_overlay" | "gap";
}

export interface ProcessFlowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
}

export interface ProcessFlowData {
  kind: "process_flow";
  name: string;
  swimlanes?: string[];
  nodes: ProcessFlowNode[];
  edges: ProcessFlowEdge[];
  overlays: ProcessOverlay[];
}

export interface ProcessInventoryNode {
  id: string;
  name: string;
  scope_status: ProcessScopeStatus;
  owner_agent?: string;
  sub_flow_count: number;
  process_area?: string;
  description?: string;
}

export interface ProcessInventoryEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ProcessInventoryData {
  kind: "process_inventory";
  nodes: ProcessInventoryNode[];
  edges: ProcessInventoryEdge[];
}

export type ProcessGraphData = ProcessFlowData | ProcessInventoryData;

// ── Workspace types ────────────────────────────────────────────────────────

export interface DeliverableWorkspace {
  deliverable_id: string;
  agent_kind: AgentKind;
  run_state: AgentRunState;
  preflight_title: string;
  preflight_bullets: string[];
  preflight_data_source?: string;
  columns: ArtifactColumn[];
  rows: ArtifactRow[];
  insight_cards?: InsightCard[];
  interrupt?: InlineInterruptData;
  activity: ActivityEntry[];
  graph?: ProcessGraphData;
}

export const MOCK_WORKSPACES: Record<string, DeliverableWorkspace> = {
  "d-005-01": {
    deliverable_id: "d-005-01",
    agent_kind: "data_grounded",
    run_state: "complete",
    preflight_title: "Account Analysis Report",
    preflight_bullets: [
      "68 GL accounts loaded from trial balance extract",
      "MJE pattern detection across 18-month posting history",
      "NAIC account group compliance check",
      "Key person risk analysis on journal entry volume",
      "Document splitting eligibility assessment",
    ],
    preflight_data_source: "Acme_TB_FY2025.xlsx · 512K posting lines",
    columns: [
      { key: "account", label: "Account", width: "90px" },
      { key: "name", label: "Name", width: "210px" },
      { key: "volume", label: "Volume", width: "90px" },
      { key: "behavior", label: "Behavior", width: "130px" },
      { key: "flags", label: "Flags", width: "160px" },
    ],
    rows: [
      { row_id: "r1", cells: { account: "1000", name: "Cash & Equivalents", volume: "12,450", behavior: "High frequency", flags: "" }, provenance: "Source: GL_EXTRACT_FY2025, rows 1–4,820" },
      { row_id: "r2", cells: { account: "1100", name: "Accounts Receivable — Premium", volume: "8,302", behavior: "Seasonal", flags: "DOC_SPLIT" }, flags: ["DOC_SPLIT"], needs_attention: true, provenance: "Document splitting detected · Source: GL_EXTRACT_FY2025, rows 4,821–13,122" },
      { row_id: "r3", cells: { account: "1200", name: "Reinsurance Recoverables", volume: "4,115", behavior: "Low frequency", flags: "" }, provenance: "Source: GL_EXTRACT_FY2025, rows 13,123–17,237" },
      { row_id: "r4", cells: { account: "2000", name: "Loss & LAE Reserve", volume: "22,891", behavior: "Actuarial-driven", flags: "KEY_PERSON" }, flags: ["KEY_PERSON"], needs_attention: true, provenance: "94% of entries posted by JSMITH · Source: MJE_ANALYSIS_2025" },
      { row_id: "r5", cells: { account: "2100", name: "Unearned Premium Reserve", volume: "6,730", behavior: "Monthly accrual", flags: "" }, provenance: "Source: GL_EXTRACT_FY2025, rows 17,238–23,967" },
      { row_id: "r6", cells: { account: "2200", name: "Ceded Reinsurance Payable", volume: "3,210", behavior: "Periodic", flags: "DOC_SPLIT" }, flags: ["DOC_SPLIT"], needs_attention: true, provenance: "Ceded flows detected · document splitting recommended" },
      { row_id: "r7", cells: { account: "4000", name: "Net Premiums Earned", volume: "31,540", behavior: "Monthly", flags: "" }, provenance: "Source: GL_EXTRACT_FY2025, rows 23,968–55,507" },
      { row_id: "r8", cells: { account: "4100", name: "Ceded Premiums", volume: "9,882", behavior: "Treaty-linked", flags: "" }, provenance: "Source: GL_EXTRACT_FY2025, rows 55,508–65,389" },
      { row_id: "r9", cells: { account: "6000", name: "Losses Incurred", volume: "18,774", behavior: "Claims-driven", flags: "KEY_PERSON" }, flags: ["KEY_PERSON"], needs_attention: true, provenance: "JSMITH posts 87% of entries · concentration risk flagged" },
      { row_id: "r10", cells: { account: "7000", name: "Operating Expenses", volume: "5,621", behavior: "Regular", flags: "" }, provenance: "Source: GL_EXTRACT_FY2025, rows 65,390–71,010" },
    ],
    insight_cards: [
      { kind: "info", text: "68 accounts profiled across 512K posting lines" },
      { kind: "risk", text: "Key person risk: JSMITH posts 91% of actuarial entries" },
      { kind: "finding", text: "4 accounts flagged for document splitting (DOC_SPLIT)" },
      { kind: "compliant", text: "NAIC account group structure: fully compliant" },
    ],
    activity: [
      { step: 1, label: "Loaded GL extract", detail: "512,041 posting lines · 68 accounts", status: "complete", duration_ms: 1240 },
      { step: 2, label: "Profiled account volumes", detail: "Frequency, seasonality, and behavior patterns", status: "complete", duration_ms: 3450 },
      { step: 3, label: "Ran MJE detection", detail: "7 patterns detected across 4 accounts", status: "complete", duration_ms: 8920 },
      { step: 4, label: "Assessed document splitting", detail: "4 accounts flagged for doc-split config", status: "complete", duration_ms: 2100 },
      { step: 5, label: "Checked NAIC alignment", detail: "All 68 accounts mapped to NAIC groups", status: "complete", duration_ms: 1870 },
      { step: 6, label: "Generated report", detail: "Account Analysis Report ready for review", status: "complete", duration_ms: 980 },
    ],
  },

  "d-005-03": {
    deliverable_id: "d-005-03",
    agent_kind: "data_grounded",
    run_state: "awaiting_input",
    preflight_title: "Account Mapping: Legacy → New COA",
    preflight_bullets: [
      "Map 68 legacy accounts to new S/4HANA COA structure",
      "Apply NAIC account group taxonomy",
      "Detect consolidation and split opportunities",
      "Flag reinsurance flow accounts for posting key design",
    ],
    preflight_data_source: "Account Analysis Report (d-005-01) · COA Draft v1.2",
    columns: [
      { key: "legacy_account", label: "Legacy", width: "80px" },
      { key: "legacy_name", label: "Legacy Name", width: "190px" },
      { key: "new_account", label: "New COA", width: "100px" },
      { key: "new_name", label: "New Name", width: "200px" },
      { key: "status", label: "Status", width: "110px" },
    ],
    rows: [
      { row_id: "m1", cells: { legacy_account: "1000", legacy_name: "Cash & Equivalents", new_account: "10000000", new_name: "Cash and Cash Equivalents", status: "Mapped" }, provenance: "Direct 1:1 mapping · confidence 0.99" },
      { row_id: "m2", cells: { legacy_account: "1100", legacy_name: "AR — Premium", new_account: "12000100", new_name: "Premiums Receivable", status: "Mapped" }, needs_attention: true, provenance: "Document splitting required · see DOC_SPLIT flag in analysis" },
      { row_id: "m3", cells: { legacy_account: "1200", legacy_name: "Reinsurance Recoverables", new_account: "12500000", new_name: "Reinsurance Assets", status: "Mapped" }, provenance: "IFRS 17 grouping applied · confidence 0.95" },
      { row_id: "m4", cells: { legacy_account: "2000", legacy_name: "Loss & LAE Reserve", new_account: "21000000", new_name: "Insurance Contract Liabilities", status: "Mapped" }, provenance: "IFRS 17 PAA model applied · confidence 0.97" },
      { row_id: "m5", cells: { legacy_account: "2100", legacy_name: "Unearned Premium Reserve", new_account: "21100000", new_name: "Liabilities for Remaining Coverage", status: "Mapped" }, provenance: "IFRS 17 LRC classification · confidence 0.96" },
      { row_id: "m6", cells: { legacy_account: "2200", legacy_name: "Ceded Reinsurance Payable", new_account: "22000000", new_name: "Reinsurance Payables", status: "Mapped" }, provenance: "Ceded flows confirmed · confidence 0.94" },
      { row_id: "m7", cells: { legacy_account: "4000", legacy_name: "Net Premiums Earned", new_account: "40000000", new_name: "Insurance Revenue", status: "Mapped" }, provenance: "IFRS 17 revenue recognition model · confidence 0.98" },
      { row_id: "m8", cells: { legacy_account: "2340", legacy_name: "Reinsurance Settlement Acct", new_account: "—", new_name: "Pending decision", status: "Needs input" }, needs_attention: true, provenance: "Account carries both ceded and assumed flows — split decision required" },
    ],
    interrupt: {
      question: "How should account 2340 be handled in the new COA?",
      context: "Account 2340 currently carries both ceded and assumed reinsurance settlement flows. In S/4HANA, these should be separated for clear reporting. Two options: split into two accounts, or use a single account with posting key differentiation.",
      options: [
        { label: "Split into two accounts", description: "Create 22001000 (Ceded Settlement) and 22002000 (Assumed Settlement) — cleaner reporting, aligns with NAIC schedule requirements." },
        { label: "Use posting key differentiation", description: "Single account 22000100 with debit/credit convention — simpler design, but reduces transparency in balance sheet line items." },
      ],
      insert_after_row_id: "m8",
    },
    activity: [
      { step: 1, label: "Loaded source data", detail: "Account Analysis Report + COA Draft v1.2", status: "complete", duration_ms: 890 },
      { step: 2, label: "Auto-mapped 34 accounts", detail: "Direct and semantic matching · avg confidence 0.96", status: "complete", duration_ms: 5640 },
      { step: 3, label: "Flagging complex accounts", detail: "Reinsurance flows, clearing, multi-use accounts", status: "active" },
    ],
  },

  "d-004-01": {
    deliverable_id: "d-004-01",
    agent_kind: "knowledge_grounded",
    run_state: "running",
    preflight_title: "Process Inventory",
    preflight_bullets: [
      "P&C insurance process library loaded — 13 process areas identified",
      "10 processes matched to P&C segment footprint for SAP S/4HANA transformation",
      "Scope status assigned from engagement scope definition",
      "Sub-flow counts from leading practice library",
      "Dependency mapping based on P&C finance process architecture",
    ],
    columns: [],
    rows: [],
    graph: {
      kind: "process_inventory",
      nodes: [
        // Core Finance
        { id: "premium-accounting", name: "Premium Accounting & Revenue Recognition", scope_status: "complete", sub_flow_count: 5, process_area: "Core Finance", description: "GWP capture, pro-rata UPR earning, mid-term endorsements and cancellations" },
        { id: "loss-reserving", name: "Loss & Expense Reserving", scope_status: "complete", sub_flow_count: 4, process_area: "Core Finance", description: "Case reserve establishment, IBNR calculation, ALAE/ULAE reserving, reserve true-ups" },
        { id: "claims-payment", name: "Claims Payment & Settlement Accounting", scope_status: "complete", sub_flow_count: 3, process_area: "Core Finance", description: "Indemnity disbursements, ALAE expense payments, salvage & subrogation recovery accounting" },
        { id: "financial-close", name: "Financial Close & Consolidation", scope_status: "in_progress", sub_flow_count: 4, process_area: "Core Finance", description: "Subledger lock & extract, actuarial true-up processing, allocations, intercompany elimination" },
        { id: "collections-disbursements", name: "Collections & Disbursements", scope_status: "in_scope", sub_flow_count: 4, process_area: "Core Finance", description: "Direct billing, agency/broker statement reconciliation, dunning, unallocated cash clearing" },
        { id: "investment-accounting", name: "Investment Accounting Integration", scope_status: "deferred", sub_flow_count: 2, process_area: "Core Finance", description: "Investment subledger ingestion (Clearwater), ALM data preparation" },
        // Insurance-Specific
        { id: "ceded-reinsurance", name: "Ceded Reinsurance Accounting", scope_status: "in_progress", sub_flow_count: 5, process_area: "Insurance-Specific", description: "Ceded premium calculation, recoverable on paid and unpaid losses, ceding commissions, Schedule F provisioning" },
        { id: "intercompany-coinsurance", name: "Intercompany & Coinsurance Accounting", scope_status: "in_scope", sub_flow_count: 3, process_area: "Insurance-Specific", description: "Intercompany reinsurance pooling, coinsurance settlements, intercompany eliminations" },
        { id: "statutory-reporting", name: "Statutory & Regulatory Reporting", scope_status: "in_scope", sub_flow_count: 3, process_area: "Insurance-Specific", description: "Multi-ledger STAT/GAAP parallel accounting, RBC calculation, NAIC Annual Statement preparation" },
        { id: "schedule-pf", name: "Schedule P & F Production", scope_status: "in_scope", sub_flow_count: 2, process_area: "Insurance-Specific", description: "10-year accident-year loss triangles (Schedule P), reinsurance recoverable aging for statutory penalty (Schedule F)" },
      ],
      edges: [
        { id: "e-close-premium", source: "financial-close", target: "premium-accounting", label: "premium data lock" },
        { id: "e-close-reserve", source: "financial-close", target: "loss-reserving", label: "IBNR true-up" },
        { id: "e-close-ceded", source: "financial-close", target: "ceded-reinsurance", label: "recoverable calc" },
        { id: "e-stat-close", source: "statutory-reporting", target: "financial-close", label: "closed trial balance" },
      ],
    } satisfies ProcessInventoryData,
    activity: [
      { step: 1, label: "Loaded P&C process library", detail: "13 process areas identified", status: "complete", duration_ms: 890 },
      { step: 2, label: "Matched processes to footprint", detail: "10 processes matched to P&C segment for SAP S/4HANA transformation", status: "complete", duration_ms: 1240 },
      { step: 3, label: "Awaiting scope confirmation", detail: "Investment Accounting Integration deferred to Phase 2", status: "active" },
    ],
  },

  "d-004-03": {
    deliverable_id: "d-004-03",
    agent_kind: "knowledge_grounded",
    run_state: "preflight",
    preflight_title: "Future State R2R Process Map",
    preflight_bullets: [
      "Process area: Record-to-Report (R2R)",
      "8 nodes across 3 swimlanes: GL Accountant, Finance Controller, SAP S/4HANA",
      "2 overlay suggestions pre-loaded from GL Design Coach account analysis",
      "Approval gateway identified — key person risk on Finance Controller lane",
      "Document splitting constraint flagged for ACDOCA posting configuration",
    ],
    columns: [],
    rows: [],
    graph: {
      kind: "process_flow",
      name: "R2R Future State — Journal Entry to ACDOCA",
      swimlanes: ["GL Accountant", "Finance Controller", "SAP S/4HANA"],
      nodes: [
        { id: "start", type: "start", label: "Start", role: "GL Accountant" },
        { id: "initiate-je", type: "task", label: "Initiate Journal Entry", role: "GL Accountant", system: "SAP S/4HANA", status: "leading_practice" },
        { id: "review-completeness", type: "task", label: "Review for Completeness", role: "GL Accountant", status: "leading_practice" },
        { id: "gateway-approval", type: "gateway_exclusive", label: "Approval required?", role: "GL Accountant" },
        { id: "fc-review", type: "task", label: "Finance Controller Review", role: "Finance Controller", status: "client_overlay" },
        { id: "post-acdoca", type: "task", label: "Post to ACDOCA", role: "SAP S/4HANA", system: "SAP S/4HANA", status: "leading_practice" },
        { id: "end", type: "end", label: "End", role: "SAP S/4HANA" },
      ],
      edges: [
        { id: "e-start-je", source: "start", target: "initiate-je" },
        { id: "e-je-review", source: "initiate-je", target: "review-completeness" },
        { id: "e-review-gw", source: "review-completeness", target: "gateway-approval" },
        { id: "e-gw-fc", source: "gateway-approval", target: "fc-review", condition: "Yes", label: "Yes" },
        { id: "e-gw-post", source: "gateway-approval", target: "post-acdoca", condition: "No", label: "No" },
        { id: "e-fc-post", source: "fc-review", target: "post-acdoca" },
        { id: "e-post-end", source: "post-acdoca", target: "end" },
      ],
      overlays: [
        { id: "ov-1", node_id: "fc-review", kind: "risk", text: "JSMITH currently approves 91% of actuarial JEs — key person concentration risk identified in account analysis", source: "gl_finding" },
        { id: "ov-2", node_id: "post-acdoca", kind: "constraint", text: "Document splitting required for 4 accounts — posting workflow must handle splitting configuration", source: "gl_finding" },
      ],
    } satisfies ProcessFlowData,
    activity: [],
  },

  "d-004-04": {
    deliverable_id: "d-004-04",
    agent_kind: "knowledge_grounded",
    run_state: "preflight",
    preflight_title: "Business Requirements by Process",
    preflight_bullets: [
      "47 standard requirements pre-populated from insurance finance library",
      "Process areas: R2R, P2P, Financial Close, Reinsurance Accounting",
      "Each requirement tagged to process step and RACI role",
      "SAP S/4HANA fit-gap indicators pre-filled",
      "Ready for workshop validation with client finance team",
    ],
    columns: [
      { key: "req_id", label: "ID", width: "70px" },
      { key: "process", label: "Process", width: "120px" },
      { key: "requirement", label: "Requirement", width: "320px" },
      { key: "priority", label: "Priority", width: "80px" },
      { key: "status", label: "Status", width: "100px" },
    ],
    rows: [],
    activity: [
      { step: 1, label: "Load leading practice library", detail: "47 requirements · Insurance Finance · SAP S/4HANA", status: "pending" },
      { step: 2, label: "Adapt to engagement context", detail: "Apply segment, ERP, and phase filters", status: "pending" },
      { step: 3, label: "Generate requirements draft", detail: "Structured, tagged, and linked to process steps", status: "pending" },
    ],
  },
};
