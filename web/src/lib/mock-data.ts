import { BUSINESS_REQUIREMENTS } from "./mock-requirements";

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
        { deliverable_id: "d-004-03", name: "Future State Process Maps", status: "not_started", owner_agent: "functional_consultant", agent_summary: "Future state swimlane designs across all process areas" },
        { deliverable_id: "d-004-04", name: "Business Requirements by Process", status: "in_progress", owner_agent: "functional_consultant", agent_summary: "314 requirements · 25 assessed with ERP Fit/Gap (PA-05 pilot) · Awaiting validation" },
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
        { deliverable_id: "d-006-01", name: "Reporting Inventory (by user group and frequency)", status: "complete", owner_agent: "functional_consultant", agent_summary: "28 reports cataloged · Dimension requirements cross-referenced against COA design · 5 AT RISK reports identified" },
        { deliverable_id: "d-006-02", name: "Management Reporting Blueprint (P&L, balance sheet)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-006-03", name: "Regulatory/Statutory Reporting Map (NAIC Annual Statement)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-006-04", name: "Analytics & Dashboard Requirements", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-006-05", name: "SAP Datasphere / BW4HANA Architecture (if in scope)", status: "not_started", owner_agent: "functional_consultant" },
        { deliverable_id: "d-006-06", name: "GAAP Income Statement (from GL posting data)", status: "not_started", owner_agent: "gl_design_coach", agent_summary: "Generate P&L from posting data with LOB breakdown" },
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
        { deliverable_id: "d-b04-02", name: "Future State Process Maps", status: "not_started", owner_agent: "functional_consultant" },
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

export type ProcessScope = "in_scope" | "deferred" | "out_of_scope";
export type ProcessWorkStatus = "not_started" | "in_progress" | "complete";

/** @deprecated use ProcessScope + ProcessWorkStatus */
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

export interface ProcessInventoryErpNotes {
  sap?: string;
  oracle?: string;
  workday?: string;
}

export interface ProcessSubFlow {
  id: string;   // e.g. "SP-01.1"
  name: string;
  deliverable_id?: string;  // if a future state process map exists for this SP
}

export type AgentLevel = "L0" | "L1" | "L2" | "L3" | "L4";
export type AgentPattern =
  | "reconciliation"
  | "posting"
  | "allocation"
  | "document_intelligence"
  | "close_orchestration"
  | "compliance_reporting";

export interface ProcessInventoryNode {
  id: string;
  pa_id?: string;
  name: string;
  scope: ProcessScope;
  work_status: ProcessWorkStatus;
  owner_agent?: string;
  sub_flow_count: number;
  process_area?: string;
  description?: string;
  erp_notes?: ProcessInventoryErpNotes;
  scoping_questions?: string[];
  sub_flows?: ProcessSubFlow[];
  // AI & Agentic Engineering Framework fields
  agent_wave?: 1 | 2 | 3 | 4;
  agent_level?: AgentLevel;
  agent_opportunity?: string;
  agent_pattern?: AgentPattern;
  agent_key_insight?: string;
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

// ── Business Requirements + Fit/Gap types ─────────────────────────────────

export type BRTag = "REG" | "FIN" | "OPS" | "CTL" | "INT";
export type BRSegment = "P&C" | "Life" | "Re" | "All";
export type BRStatus = "draft" | "validated" | "deferred" | "out_of_scope";

export type FitRating = "F1" | "F2" | "F3" | "F4" | "F5";
export type AgenticRating = "A0" | "A1" | "A2" | "A3";
export type EffortSize = "S" | "M" | "L" | "XL";

export interface ERPAssessment {
  platform: string;
  rating: FitRating;
  notes: string;
}

export interface FitGapAnalysis {
  erp_assessments: ERPAssessment[];
  gap_remediation?: string;
  gap_effort?: string;
  agentic_rating?: AgenticRating;
  agentic_bridge?: string;
  agentic_autonomy?: string;
}

export interface BusinessRequirement {
  id: string;
  pa_id: string;
  sp_id: string;
  tag: BRTag;
  segment: BRSegment;
  text: string;
  status: BRStatus;
  fit_gap?: FitGapAnalysis;
}

export interface BusinessRequirementsData {
  kind: "business_requirements";
  requirements: BusinessRequirement[];
}

export interface ProcessFlowIndexData {
  kind: "process_flow_index";
  flow_ids: string[];
}

export type ProcessGraphData = ProcessFlowData | ProcessInventoryData | BusinessRequirementsData | ProcessFlowIndexData;

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
  /** When set, workshop mode starts directly for this PA (no picker needed) */
  workshop_pa?: string;
  /** When true, workspace uses live agent streaming instead of mock data */
  agent_live?: boolean;
  /** Initial prompt sent to the agent when started in live mode */
  agent_prompt?: string;
}

export const MOCK_WORKSPACES: Record<string, DeliverableWorkspace> = {
  "d-005-01": {
    deliverable_id: "d-005-01",
    agent_kind: "data_grounded",
    run_state: "preflight",
    agent_live: true,
    agent_prompt: `Run these three tools in sequence, each exactly once:
1. profile_accounts(top_n=25) — get account usage profiles
2. detect_mje(min_occurrences=3, include_details=true) — find manual journal entry patterns
3. assess_dimensions() — check dimensional usage quality

After all three tools complete, synthesize a single Account Analysis Report with:
- Table of top accounts by posting volume (account, name, postings, MJE%, dimensions used)
- Key person risk flags (any user posting >80% of entries to an account)
- Document splitting candidates
- NAIC compliance status
Keep the report under 800 words. Use tables, not prose.`,
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

  "d-005-02": {
    deliverable_id: "d-005-02",
    agent_kind: "data_grounded",
    run_state: "preflight",
    agent_live: true,
    agent_prompt: `Do not narrate what you will do. Execute the tools, then produce output.

Run these tools in sequence, each exactly once:
1. profile_accounts(top_n=25) — get current account structure
2. compute_trial_balance() — get balances for code block sizing
3. assess_dimensions() — check current dimensional usage

After all three tools complete, produce TWO things:

1. A brief narrative summary (under 200 words) covering key findings, gaps, and critical issues.

2. Structured JSON inside <coa_design> tags with this exact schema:

<coa_design>
{
  "summary": "Your narrative summary here",
  "code_blocks": [
    { "range": "1XXX", "account_type": "Assets", "naic_alignment": "Balance Sheet Schedule", "count": 0 }
  ],
  "account_groups": [
    { "group_code": "CASH", "name": "Cash & Equivalents", "naic_schedule_line": "Assets Line 1", "account_count": 0, "notes": "" }
  ],
  "dimensions": [
    { "dimension": "Profit Center", "fill_rate": 100, "unique_values": 14, "mandatory": true, "key_values": "PC1000-PC4200", "reporting_purpose": "LOB + Region segmentation", "issues": "" }
  ],
  "decisions": [
    { "title": "Leading Ledger Basis", "context": "...", "recommendation": "...", "alternative": "...", "impact": "..." }
  ]
}
</coa_design>

Cover these 5 code block ranges: 1XXX (Assets), 2XXX (Liabilities), 3XXX (Equity), 4XXX (Revenue), 5XXX (Expenses).
Include account groups with NAIC schedule line mapping and gap flags.
Include dimensions: Profit Center, Segment, Functional Area, LOB, State.
Include 4 decisions: (1) leading ledger basis, (2) extension ledger strategy, (3) document splitting scope, (4) profit center hierarchy.

Ground every recommendation in the actual data.`,
    preflight_title: "Chart of Accounts Design",
    preflight_bullets: [
      "S/4HANA code block range design aligned to NAIC annual statement",
      "Account group taxonomy with regulatory schedule mapping",
      "ACDOCA dimension assignments (profit center, segment, functional area)",
      "Design decisions requiring consultant sign-off with alternatives and impact",
      "Grounded in Account Analysis findings — MJE patterns, doc splitting, key person flags",
    ],
    preflight_data_source: "Acme_TB_FY2025.xlsx · 512K posting lines",
    columns: [],
    rows: [],
    activity: [
      { step: 1, label: "Loaded GL extract", detail: "512,041 posting lines · 68 accounts", status: "complete", duration_ms: 1240 },
      { step: 2, label: "Analyzed account structure", detail: "Code block ranges, NAIC alignment check", status: "complete", duration_ms: 4200 },
      { step: 3, label: "Assessed dimensions", detail: "Profit center, segment, functional area usage", status: "complete", duration_ms: 3800 },
      { step: 4, label: "Evaluated ledger architecture", detail: "Leading/extension ledger options, doc splitting scope", status: "complete", duration_ms: 5100 },
      { step: 5, label: "Generated design recommendations", detail: "4 decisions requiring consultant approval", status: "complete", duration_ms: 2400 },
    ],
  },

  "d-005-03": {
    deliverable_id: "d-005-03",
    agent_kind: "data_grounded",
    run_state: "preflight",
    agent_live: true,
    agent_prompt: `Run these tools in sequence, each exactly once:
1. profile_accounts(top_n=50) — get all account profiles for mapping
2. compute_trial_balance() — get balances to assess account activity
3. assess_dimensions() — check dimensional attributes for mapping context

After all three tools complete, produce an Account Mapping report:

## Mapping Summary
Total accounts, auto-mapped count, needs-review count, obsolete count.

## Account Mapping Table
| Legacy # | Legacy Name | New # | New Name | Status | Confidence | Notes |
One row per account. Status: Mapped / Needs Review / Obsolete.

## Accounts Requiring Decision
For each needs-review account: issue, Option A, Option B, recommendation.

## Consolidation Opportunities
Legacy accounts that should merge in new COA.

## Obsolete Accounts
Zero-activity accounts — candidates for removal.

Keep under 1200 words. Use tables, not prose.`,
    preflight_title: "Account Mapping: Legacy → New COA",
    preflight_bullets: [
      "Map all legacy accounts to S/4HANA COA structure",
      "Apply NAIC account group taxonomy for insurance alignment",
      "Flag accounts requiring split, consolidation, or manual decision",
      "Identify obsolete accounts with zero posting activity",
    ],
    preflight_data_source: "DuckDB · ACME P&C GL · 68 accounts",
    columns: [],
    rows: [],
    activity: [],
  },

  "d-005-04": {
    deliverable_id: "d-005-04",
    agent_kind: "data_grounded",
    run_state: "preflight",
    agent_live: true,
    agent_prompt: `Run these tools in sequence, each exactly once:
1. assess_dimensions() — get current dimensional usage and quality
2. profile_accounts(top_n=50) — get account-level dimension fill rates

After both tools complete, produce an ACDOCA Dimension Design:

## Current Dimension Assessment
| Dimension | Fill Rate % | Unique Values | Quality Rating |
Assess each dimension present in the data.

## Profit Center Design
Proposed hierarchy with levels. Table: PC code, name, LOB alignment, NAIC schedule.
Rationale for structure.

## Segment Structure
IFRS 8 operating segments. Table: segment code, name, reporting use.

## Functional Area Configuration
Recommendation: nature-of-expense vs. cost-of-sales vs. hybrid.
Table: FA code, name, usage. Impact on P&L presentation.

## Design Decisions Requiring Approval
For each decision: context, recommendation, alternative, downstream impact.

Keep under 1000 words. Use tables, not prose.`,
    preflight_title: "ACDOCA Dimension Design",
    preflight_bullets: [
      "Assess current dimensional usage across all GL accounts",
      "Design profit center hierarchy aligned to insurance LOBs",
      "Propose segment structure for IFRS 8 reporting",
      "Configure functional area for P&L presentation method",
      "Identify dimension data quality gaps requiring remediation",
    ],
    preflight_data_source: "DuckDB · ACME P&C GL · 68 accounts · dimensional attributes",
    columns: [],
    rows: [],
    activity: [],
  },

  "d-004-01": {
    deliverable_id: "d-004-01",
    agent_kind: "knowledge_grounded",
    run_state: "running",
    preflight_title: "Process Inventory",
    preflight_bullets: [
      "Full P&C insurance process library loaded — 20 process areas across all finance domains",
      "17 processes matched to in-scope P&C footprint for SAP S/4HANA transformation",
      "2 processes deferred pending scope confirmation (Fixed Assets, Assumed Reinsurance)",
      "1 process out of scope — P&C carrier, no life or annuity products",
      "Sub-flow counts and descriptions from P&C leading practice library",
    ],
    columns: [],
    rows: [],
    graph: {
      kind: "process_inventory",
      nodes: [
        // Foundation
        {
          id: "pa-01", pa_id: "PA-01", name: "Chart of Accounts & Org Structure",
          scope: "in_scope", work_status: "complete", sub_flow_count: 4, process_area: "Foundation",
          description: "CoA design supporting STAT/GAAP parallel ledgers, company code hierarchy, profit center and segment structure, LOB dimensions, and statutory entity mapping for NAIC reporting.",
          erp_notes: {
            sap: "Multi-ledger via leading/extension ledgers in ACDOCA. Profit center and segment are core dimensions. Best Practice scope item J58 provides a starter P&C CoA requiring significant extension. FPSL available for high-volume posting scenarios.",
            oracle: "Primary/secondary ledger with SLA rules engine. Flexible CoA flexfield design. No insurance content pack — CoA must be built from scratch.",
            workday: "Single-ledger/worktag architecture. Multi-basis accounting requires workarounds. Not typically chosen for complex insurance multi-GAAP requirements.",
          },
          scoping_questions: [
            "How many statutory LOBs are you actively writing, and how do they map to your management LOBs?",
            "Do you have any intercompany pooling arrangements, and if so, what are the participation percentages and does membership change periodically?",
            "What is your approach to accident year / policy year tracking — in the GL or in sub-ledgers?",
            "Which accounting basis do you want as the leading ledger — STAT or GAAP?",
            "Are there any anticipated entity restructurings or pool changes in the next 3–5 years?",
            "Do you have any state-specific reporting requirements beyond the NAIC standard (e.g., NY Regulation 30, Texas Lloyd's)?",
          ],
          sub_flows: [
            { id: "SP-01.1", name: "CoA Design & Multi-Basis Structure" },
            { id: "SP-01.2", name: "Entity & Company Code Structure" },
            { id: "SP-01.3", name: "Profit Center / Segment / LOB Hierarchy" },
            { id: "SP-01.4", name: "Accounting Basis Configuration (Parallel Ledgers)" },
          ],
          agent_wave: 2,
          agent_level: "L1",
          agent_pattern: "document_intelligence",
          agent_opportunity: "AI-assisted CoA gap analysis comparing client chart against NAIC best practice taxonomy with remediation suggestions",
          agent_key_insight: "CoA is the architectural foundation — agent value is diagnostic analysis before design, not post-deployment automation",
        },
        {
          id: "pa-02", pa_id: "PA-02", name: "General Ledger & Multi-Basis Accounting",
          scope: "in_scope", work_status: "complete", sub_flow_count: 5, process_area: "Foundation",
          description: "Core GL with parallel ledgers for US STAT and US GAAP. Insurance-specific posting logic for premium, loss, and reserve entries with segment and LOB attribution across accounting bases.",
          erp_notes: {
            sap: "Universal Journal (ACDOCA) is the foundation. Extension ledgers handle STAT, GAAP, and IFRS 17 adjustment-only postings. Real-time consolidation via Group Reporting. Key decision: FPSL vs. direct GL posting — this is an irreversible architectural fork. Document splitting by profit center/segment is native.",
            oracle: "Primary/secondary ledger with SLA rules engine. No insurance-specific posting templates — must be configured via SLA rules. Strong journal approval workflows. Reporting currency ledgers for FX.",
            workday: "Single-ledger architecture — not recommended as primary GL for complex insurance multi-basis. Often used as holding company GL with insurance sub-ledgers feeding in.",
          },
          sub_flows: [
            { id: "SP-02.1", name: "Journal Entry Processing", deliverable_id: "d-004-03a" },
            { id: "SP-02.2", name: "Multi-Basis Posting & Adjustment Logic" },
            { id: "SP-02.3", name: "Period-End Accrual & Allocation Processing" },
            { id: "SP-02.4", name: "Currency & Foreign Exchange Processing" },
            { id: "SP-02.5", name: "GL Reconciliation & Control" },
          ],
          agent_wave: 2,
          agent_level: "L2",
          agent_pattern: "posting",
          agent_opportunity: "Automated multi-basis journal classification and dual-posting routing with exception escalation to controller",
          agent_key_insight: "ACDOCA's universal journal provides the data fidelity needed for supervised autonomous posting across STAT and GAAP bases",
        },
        // Insurance Operations
        {
          id: "pa-03", pa_id: "PA-03", name: "Premium Accounting & Revenue Recognition",
          scope: "in_scope", work_status: "complete", sub_flow_count: 5, process_area: "Insurance Operations",
          description: "GWP recording, earned/unearned premium calculation, UPR liability, retrospective rating adjustments, audit premium true-ups, and installment billing recognition.",
          erp_notes: {
            sap: "FS-CD is the SAP insurance sub-ledger for premium accounting — premium does NOT flow through standard FI-AR if FS-CD is in scope. High-cost, high-reward architectural decision that changes the engagement significantly. Best Practice J58 includes premium posting templates.",
            oracle: "No native premium module. Premium posts to GL via interface from PAS. AR module can be adapted for receivables but lacks earned premium calculation logic.",
            workday: "No premium accounting capability. Premium postings interface from PAS only.",
          },
          scoping_questions: [
            "Where does earned premium get calculated today — PAS, actuarial, data warehouse, or spreadsheets?",
            "What percentage is agency-bill vs. direct-bill, and are you planning to change that mix?",
            "Do you write any multi-year policies, and what is the earning methodology?",
            "How material are retrospective rating adjustments and audit premium?",
            "How many PAS systems feed premium data, and are they being consolidated?",
          ],
          sub_flows: [
            { id: "SP-03.1", name: "Gross Written Premium Recording", deliverable_id: "d-004-03b" },
            { id: "SP-03.2", name: "Earned Premium Calculation & UPR" },
            { id: "SP-03.3", name: "Retrospective Rating & Audit Premium" },
            { id: "SP-03.4", name: "Installment Billing & Premium Receivable" },
            { id: "SP-03.5", name: "Premium Deficiency Reserve" },
          ],
          agent_wave: 1,
          agent_level: "L2",
          agent_pattern: "posting",
          agent_opportunity: "PAS interface parsing, earned premium schedule automation, and auto-reconcile to policy system with exception flagging",
          agent_key_insight: "GWP volumes are high and rule-bound — near-term Wave 1 automation target with the fastest payback in the finance function",
        },
        {
          id: "pa-04", pa_id: "PA-04", name: "Loss & Claims Accounting",
          scope: "in_scope", work_status: "in_progress", sub_flow_count: 5, process_area: "Insurance Operations",
          description: "Paid losses, case reserves, IBNR/bulk reserves, LAE/ULAE, subrogation and salvage recoveries, and the actuarial-to-GL interface driving reserve postings by accident year and LOB.",
          scoping_questions: [
            "How frequently does actuarial deliver IBNR/bulk reserve updates — quarterly, monthly?",
            "At what granularity are actuarial reserve estimates posted — total company, by LOB, by LOB/accident year?",
            "Do your STAT and GAAP loss reserves differ for any LOBs, or are they currently identical?",
            "How is ULAE estimated and allocated to LOBs?",
            "Do you have asbestos, environmental, or latent liability reserves?",
            "What is your current actuarial-to-accounting reconciliation process, and what breaks most often?",
          ],
          sub_flows: [
            { id: "SP-04.1", name: "Paid Loss Recording" },
            { id: "SP-04.2", name: "Case Reserve Accounting" },
            { id: "SP-04.3", name: "IBNR & Bulk Reserve Posting" },
            { id: "SP-04.4", name: "LAE & ULAE Accounting" },
            { id: "SP-04.5", name: "Subrogation & Salvage Recoveries" },
          ],
          agent_wave: 2,
          agent_level: "L2",
          agent_pattern: "reconciliation",
          agent_opportunity: "Automated actuarial-to-GL variance reconciliation with IBNR reserve posting from structured actuarial output",
          agent_key_insight: "The actuarial handoff is the highest-friction interface in insurance finance — L2 reconciliation agent cuts close cycle by 1–2 days",
        },
        {
          id: "pa-05", pa_id: "PA-05", name: "Ceded Reinsurance Accounting",
          scope: "in_scope", work_status: "in_progress", sub_flow_count: 5, process_area: "Insurance Operations",
          description: "Ceded premium, ceded loss and reserve recovery, ceding commissions, sliding-scale profit commissions, Schedule F compliance, and reinsurer collateral tracking.",
          erp_notes: {
            sap: "FS-RI handles treaty setup, ceded premium/loss calculation, and reinsurer settlement. Without FS-RI, reinsurance stays in a dedicated external system (SOLIS, GENIUS, or similar) with net entries posted to GL.",
            oracle: "No native reinsurance module. Dedicated reinsurance system plus interface is the standard approach.",
            workday: "No reinsurance capability. Interface only.",
          },
          scoping_questions: [
            "How many treaties and facultative certificates are in force, and how many reinsurers do you work with?",
            "Do you use a dedicated reinsurance system, and is it being replaced?",
            "How complex are your sliding-scale and profit commission formulas, and how frequently are they recalculated?",
            "What is your current process for calculating ceded IBNR — separate actuarial estimate or factors applied to gross?",
            "Do you have finite or non-traditional reinsurance contracts requiring risk transfer testing (FAS 113 / SSAP 62R)?",
            "What is your unauthorized reinsurance exposure, and how do you currently manage collateral?",
          ],
          sub_flows: [
            { id: "SP-05.1", name: "Treaty & Facultative Setup" },
            { id: "SP-05.2", name: "Ceded Premium Accounting" },
            { id: "SP-05.3", name: "Ceded Loss & Reserve Recovery" },
            { id: "SP-05.4", name: "Ceding Commission Accounting" },
            { id: "SP-05.5", name: "Schedule F & Reinsurer Credit" },
          ],
          agent_wave: 2,
          agent_level: "L2",
          agent_pattern: "document_intelligence",
          agent_opportunity: "Treaty document parsing, bordereau ingestion, cession calculation, and Schedule F data assembly with reinsurer collateral tracking",
          agent_key_insight: "Reinsurance calculation rules are complex but deterministic once codified — document intelligence is the unlock that makes L2 viable",
        },
        // Financial Operations
        {
          id: "pa-09", pa_id: "PA-09", name: "Accounts Payable & Commission Payments",
          scope: "in_scope", work_status: "not_started", sub_flow_count: 4, process_area: "Financial Operations",
          description: "Agent and broker commission payments (new, renewal, contingent), MGA fee settlements, TPA payments, vendor invoice processing, and state premium tax payments.",
          sub_flows: [
            { id: "SP-09.1", name: "Vendor Invoice Processing", deliverable_id: "d-004-03c" },
            { id: "SP-09.2", name: "Agent/Broker Commission Payments" },
            { id: "SP-09.3", name: "TPA & MGA Settlements" },
            { id: "SP-09.4", name: "Premium Tax Payment" },
          ],
          agent_wave: 1,
          agent_level: "L2",
          agent_pattern: "document_intelligence",
          agent_opportunity: "Commission statement parsing, 3-way PO matching, and MGA settlement reconciliation with exception-only human review",
          agent_key_insight: "Agent/broker commission statements are semi-structured — document intelligence converts manual keying into supervised automation",
        },
        {
          id: "pa-10", pa_id: "PA-10", name: "Accounts Receivable & Premium Collections",
          scope: "in_scope", work_status: "not_started", sub_flow_count: 4, process_area: "Financial Operations",
          description: "Agent balance accounting, direct-bill premium collections, installment billing, premium receivable aging and bad debt provisioning, commission offset and netting.",
          sub_flows: [
            { id: "SP-10.1", name: "Agent Balance Accounting" },
            { id: "SP-10.2", name: "Direct Bill Collections" },
            { id: "SP-10.3", name: "Premium Receivable Aging & Bad Debt" },
            { id: "SP-10.4", name: "Reinsurance Receivable Management" },
          ],
          agent_wave: 1,
          agent_level: "L2",
          agent_pattern: "reconciliation",
          agent_opportunity: "Cash application agent with automated unapplied cash resolution and premium aging exception triage by agent/broker",
          agent_key_insight: "Remittance matching and aging exception handling are high-volume, low-judgment tasks — the strongest L2 candidate in the AR cycle",
        },
        {
          id: "pa-11", pa_id: "PA-11", name: "Intercompany & Pooling",
          scope: "in_scope", work_status: "not_started", sub_flow_count: 3, process_area: "Financial Operations",
          description: "Pool leader/member premium and loss settlements, intercompany service agreements, management fee allocations, and GAAP consolidation eliminations while preserving entity-level STAT.",
          sub_flows: [
            { id: "SP-11.1", name: "Pooling Arrangement Accounting" },
            { id: "SP-11.2", name: "Intercompany Service Agreements" },
            { id: "SP-11.3", name: "Intercompany Elimination" },
          ],
          agent_wave: 2,
          agent_level: "L3",
          agent_pattern: "reconciliation",
          agent_opportunity: "Autonomous pool settlement agent with real-time net position monitoring and automated elimination posting",
          agent_key_insight: "Pool arithmetic is fully deterministic once participation percentages are codified — L3 with minimal human oversight is achievable",
        },
        {
          id: "pa-12", pa_id: "PA-12", name: "Fixed Assets & Leases",
          scope: "deferred", work_status: "not_started", sub_flow_count: 3, process_area: "Financial Operations",
          description: "Asset capitalization and depreciation allocated to IEE expense categories, ASC 842/IFRS 16 lease accounting, and Schedule A real estate investment treatment. Standard ERP capability — defer to Phase 2.",
          sub_flows: [
            { id: "SP-12.1", name: "Fixed Asset Lifecycle" },
            { id: "SP-12.2", name: "Lease Accounting (ASC 842 / IFRS 16)" },
            { id: "SP-12.3", name: "Real Estate Investment Accounting" },
          ],
          agent_wave: 3,
          agent_level: "L2",
          agent_pattern: "allocation",
          agent_opportunity: "Asset lifecycle automation with depreciation scheduling and IEE expense category allocation",
          agent_key_insight: "Standard ERP capability — defer agent investment until Phase 2 to avoid scope creep on a non-differentiating process",
        },
        {
          id: "pa-13", pa_id: "PA-13", name: "Cash Management & Treasury",
          scope: "in_scope", work_status: "not_started", sub_flow_count: 4, process_area: "Financial Operations",
          description: "Cash positioning, bank reconciliation, claims payment funding and catastrophe liquidity planning, and reinsurance collateral management (LOCs, trust accounts, funds withheld).",
          sub_flows: [
            { id: "SP-13.1", name: "Cash Positioning & Bank Reconciliation", deliverable_id: "d-004-03d" },
            { id: "SP-13.2", name: "Claims Payment Funding" },
            { id: "SP-13.3", name: "Reinsurance Collateral Management" },
            { id: "SP-13.4", name: "Investment Cash Management" },
          ],
          agent_wave: 1,
          agent_level: "L3",
          agent_pattern: "reconciliation",
          agent_opportunity: "Autonomous bank reconciliation agent with claims payment funding monitoring and CAT liquidity alert generation",
          agent_key_insight: "Bank reconciliation is the canonical L3 finance automation use case — 24/7 operation, clear matching rules, zero tolerance for breaks",
        },
        // Close & Reporting
        {
          id: "pa-14", pa_id: "PA-14", name: "Expense Management & Cost Allocation",
          scope: "in_scope", work_status: "not_started", sub_flow_count: 4, process_area: "Close & Reporting",
          description: "Expense classification into LAE (DCC/A&O), underwriting, and investment categories. IEE (Exhibit 2) LOB allocation per NAIC methodology. DAC-eligible expense identification.",
          erp_notes: {
            sap: "CO-CCA (Cost Center Accounting), CO-PA (Profitability Analysis), and SAP Allocation Management. IEE expense allocation to LOB is always custom configuration — no standard template exists for insurance.",
            oracle: "Oracle PCM Cloud is a strong allocation engine that can be configured for IEE methodology. Requires a distinct licensing and implementation workstream.",
            workday: "Workday Allocations module is often insufficient for complex IEE requirements. Frequently supplemented with third-party allocation tools.",
          },
          sub_flows: [
            { id: "SP-14.1", name: "Expense Classification" },
            { id: "SP-14.2", name: "LOB & Segment Allocation" },
            { id: "SP-14.3", name: "DAC-Eligible Expense Identification" },
            { id: "SP-14.4", name: "IEE Production (Exhibit 2)" },
          ],
          agent_wave: 2,
          agent_level: "L2",
          agent_pattern: "allocation",
          agent_opportunity: "IEE allocation agent applying NAIC methodology to LOB/segment attribution with full audit trail for exam readiness",
          agent_key_insight: "IEE allocation is rules-based but computationally intensive — L2 handles the math; actuarial validates the results",
        },
        {
          id: "pa-15", pa_id: "PA-15", name: "Financial Close & Consolidation",
          scope: "in_scope", work_status: "in_progress", sub_flow_count: 6, process_area: "Close & Reporting",
          description: "Sub-ledger to GL reconciliation across all feeder systems, reserve true-up entries, multi-basis close sequence (STAT first, then GAAP overlay), consolidation, and pool eliminations.",
          erp_notes: {
            sap: "Financial Closing Cockpit for task management. Group Reporting for real-time GAAP consolidation. Advanced Financial Closing (AFC) for automated close workflows. Strong native support for multi-basis close sequencing.",
            oracle: "FCCS (Financial Consolidation and Close Service) for consolidation. Close Manager for task tracking. Account Reconciliation Cloud Service (ARCS) for sub-ledger reconciliation.",
            workday: "Basic close management capability. Typically supplemented with Workday Adaptive Planning or third-party close management tools for complex insurance requirements.",
          },
          scoping_questions: [
            "What is your current close timeline (business days), and what is the target?",
            "Which close activities are on the critical path?",
            "How many manual journal entries per close, and what percentage could be automated?",
            "Do you close STAT and GAAP sequentially or in parallel?",
            "How many sub-ledger reconciliations do you perform, and which break most often?",
            "Do pool settlements clear to zero within tolerance?",
          ],
          sub_flows: [
            { id: "SP-15.1", name: "Close Calendar & Task Management" },
            { id: "SP-15.2", name: "Sub-Ledger to GL Reconciliation" },
            { id: "SP-15.3", name: "Reserve True-Up & Actuarial Close Entries" },
            { id: "SP-15.4", name: "Multi-Basis Close Sequence" },
            { id: "SP-15.5", name: "Consolidation & Elimination" },
            { id: "SP-15.6", name: "Close Analytics & Continuous Close" },
          ],
          agent_wave: 3,
          agent_level: "L3",
          agent_pattern: "close_orchestration",
          agent_opportunity: "Close conductor agent orchestrating 40+ task dependencies, exception escalation, and real-time critical-path visibility",
          agent_key_insight: "Close orchestration is the L3 apex — when Wave 1–2 sub-ledger agents are operational, the close agent coordinates them autonomously",
        },
        {
          id: "pa-16", pa_id: "PA-16", name: "Statutory & Regulatory Reporting",
          scope: "in_scope", work_status: "not_started", sub_flow_count: 7, process_area: "Close & Reporting",
          description: "NAIC Annual Statement (Schedules A–T), Schedule P 10-year accident-year loss triangles, Schedule F reinsurance recoverables, RBC calculation, IRIS ratios, and multi-state filings.",
          erp_notes: {
            sap: "Does not natively produce NAIC Annual Statements. Specialized statutory reporting tools are required (WoltersKluwer Wdesk, Clearwater, or similar). SAP provides the underlying data but not the statutory output.",
            oracle: "No native NAIC reporting capability. Third-party statutory tools required — same tools as SAP.",
            workday: "No statutory reporting capability. Third-party required.",
          },
          scoping_questions: [
            "Which statutory reporting tool do you use today, and is it being replaced?",
            "How automated is Schedule P production — system-generated or manually compiled triangles?",
            "How many states do you file in, and do any have supplemental requirements?",
            "What is the data lineage from GL to each Annual Statement line item — is it documented?",
            "Do you file combined or entity basis, and does the group include non-insurance entities?",
          ],
          sub_flows: [
            { id: "SP-16.1", name: "Annual/Quarterly Statement Preparation" },
            { id: "SP-16.2", name: "Schedule P Production" },
            { id: "SP-16.3", name: "Schedule F Production" },
            { id: "SP-16.4", name: "Investment Schedule Production (A/B/BA/D/DA)" },
            { id: "SP-16.5", name: "Risk-Based Capital Calculation" },
            { id: "SP-16.6", name: "State Filing & UCAA" },
            { id: "SP-16.7", name: "Solvency II / International Regulatory" },
          ],
          agent_wave: 2,
          agent_level: "L2",
          agent_pattern: "compliance_reporting",
          agent_opportunity: "NAIC statement data assembly from closed GL with automated mapping validation and cross-schedule consistency checks",
          agent_key_insight: "NAIC mapping from GL is deterministic — L2 automation saves 80+ hours per quarter-end filing cycle with full auditability",
        },
        {
          id: "pa-17", pa_id: "PA-17", name: "GAAP/IFRS External Reporting",
          scope: "in_scope", work_status: "not_started", sub_flow_count: 4, process_area: "Close & Reporting",
          description: "10-K/10-Q GAAP financial statements with insurance-specific line items (UPR, loss reserves net of RI, RI recoverables), segment reporting (ASC 280), and AOCI disclosure.",
          sub_flows: [
            { id: "SP-17.1", name: "GAAP Financial Statement Production" },
            { id: "SP-17.2", name: "LDTI / IFRS 17 Disclosures" },
            { id: "SP-17.3", name: "Segment Reporting (ASC 280 / IFRS 8)" },
            { id: "SP-17.4", name: "EPS & Equity Roll-Forward" },
          ],
          agent_wave: 2,
          agent_level: "L2",
          agent_pattern: "compliance_reporting",
          agent_opportunity: "GAAP financial statement assembly plus AI-drafted MD&A, footnotes, and segment disclosure tables from structured data",
          agent_key_insight: "LLM footnote drafting from structured financial data is a high-visibility L2 capability — auditors can trace every sentence to source",
        },
        // Analytics & Tax
        {
          id: "pa-18", pa_id: "PA-18", name: "Tax Accounting & Compliance",
          scope: "in_scope", work_status: "not_started", sub_flow_count: 4, process_area: "Analytics & Tax",
          description: "Section 846 loss reserve discounting, Section 848 DAC tax, ASC 740 current and deferred tax provision, state premium tax by LOB with retaliatory provisions, Form 1120-PC data sourcing.",
          scoping_questions: [
            "What tax provision software do you use, and will it be retained?",
            "How do you currently calculate Section 846 loss reserve discounting — system-based or spreadsheet?",
            "What is your approach to Section 848 DAC tax — statutory line level calculation?",
            "Do you have tax-exempt investment income, and how is proration handled?",
            "Are there anticipated tax law changes that should influence the design?",
          ],
          sub_flows: [
            { id: "SP-18.1", name: "Current Tax Provision (ASC 740)" },
            { id: "SP-18.2", name: "Deferred Tax Calculation" },
            { id: "SP-18.3", name: "State Premium Tax" },
            { id: "SP-18.4", name: "Federal Tax Return Data Sourcing" },
          ],
          agent_wave: 2,
          agent_level: "L1",
          agent_pattern: "compliance_reporting",
          agent_opportunity: "Section 846 discounting calculation, premium tax computation by state with retaliatory provisions, and tax provision data assembly",
          agent_key_insight: "Regulatory constraint (Sections 841/846) and external audit scrutiny limit autonomy — L1 copilot is the appropriate ceiling for tax",
        },
        {
          id: "pa-19", pa_id: "PA-19", name: "Management Reporting & Analytics",
          scope: "in_scope", work_status: "not_started", sub_flow_count: 5, process_area: "Analytics & Tax",
          description: "Combined ratio and underwriting performance by LOB and accident year, reserve adequacy and development reporting, capital adequacy/surplus tracking, and investment performance dashboards.",
          sub_flows: [
            { id: "SP-19.1", name: "Combined Ratio & Underwriting Performance" },
            { id: "SP-19.2", name: "Reserve Adequacy & Development Reporting" },
            { id: "SP-19.3", name: "Capital Adequacy & Surplus Reporting" },
            { id: "SP-19.4", name: "Investment Performance Reporting" },
            { id: "SP-19.5", name: "Ad Hoc & Board Reporting" },
          ],
          agent_wave: 2,
          agent_level: "L3",
          agent_pattern: "compliance_reporting",
          agent_opportunity: "Combined ratio narrative generation, reserve adequacy commentary, and ad hoc query agent for CFO and board reporting packs",
          agent_key_insight: "Management reporting is where agents earn executive trust — narrative generation from structured data is the defining L3 showcase",
        },
        {
          id: "pa-20", pa_id: "PA-20", name: "Data Integration & Sub-Ledger Interfaces",
          scope: "in_scope", work_status: "not_started", sub_flow_count: 6, process_area: "Analytics & Tax",
          description: "Policy admin, claims, actuarial, investment, and reinsurance system interfaces via SAP Integration Suite. Historical data migration strategy including 10-year Schedule P triangles.",
          erp_notes: {
            sap: "SAP Integration Suite (cloud-native, replaces PI/PO) as primary middleware. FPSL can serve as an intermediate sub-ledger buffer for high-volume transactions. Native S/4HANA APIs available for real-time integration.",
            oracle: "Oracle Integration Cloud (OIC) as primary middleware. FBDI for bulk loads. SLA for GL posting rule transformation.",
            workday: "Workday Integration Cloud, Studio, and EIBs (Enterprise Interface Builder). Fewer insurance-specific pre-built connectors than SAP or Oracle.",
          },
          scoping_questions: [
            "How many source systems currently feed the GL, and which are being replaced vs. retained?",
            "What is the current interface technology, and what is the target architecture?",
            "Which interfaces currently require manual reconciliation or intervention, and how often do they break?",
            "What is the desired frequency for each interface — daily, weekly, monthly?",
            "Are there regulatory requirements around data lineage or auditability of interface data?",
            "What is the data conversion / historical data migration strategy?",
          ],
          sub_flows: [
            { id: "SP-20.1", name: "Policy Admin to GL Interface" },
            { id: "SP-20.2", name: "Claims to GL Interface" },
            { id: "SP-20.3", name: "Actuarial to GL Interface" },
            { id: "SP-20.4", name: "Investment to GL Interface" },
            { id: "SP-20.5", name: "Reinsurance System Interface" },
            { id: "SP-20.6", name: "Integration Architecture & Middleware" },
          ],
          agent_wave: 1,
          agent_level: "L3",
          agent_pattern: "reconciliation",
          agent_opportunity: "Always-on interface monitoring agent with automated exception triage, break resolution workflow, and SLA alerting",
          agent_key_insight: "Integration failures cascade into every downstream process — L3 monitoring agent is the highest-leverage infrastructure investment in Wave 1",
        },
        // Extended / Specialist
        {
          id: "pa-06", pa_id: "PA-06", name: "Assumed Reinsurance Accounting",
          scope: "deferred", work_status: "not_started", sub_flow_count: 4, process_area: "Extended / Specialist",
          description: "Bordereaux processing, assumed premium recognition, assumed reserve estimation, and funds withheld accounting. Deferred — confirm pool membership and assumed reinsurance book scope.",
          erp_notes: {
            sap: "FS-RI handles assumed treaty setup and bordereaux processing. Without FS-RI, a dedicated reinsurance system (SOLIS, GENIUS) with GL interface is standard.",
            oracle: "No native module. Dedicated reinsurance system plus interface is standard.",
            workday: "No capability. Interface only.",
          },
          sub_flows: [
            { id: "SP-06.1", name: "Bordereaux Processing & Reconciliation" },
            { id: "SP-06.2", name: "Assumed Premium Recognition" },
            { id: "SP-06.3", name: "Assumed Reserve Estimation" },
            { id: "SP-06.4", name: "Funds Held / Funds Withheld Accounting" },
          ],
          agent_wave: 4,
          agent_level: "L1",
          agent_pattern: "document_intelligence",
          agent_opportunity: "Bordereaux OCR and reconciliation automation against assumed treaty terms with exception flagging",
          agent_key_insight: "Deferred scope limits near-term investment — include in Wave 4 once assumed reinsurance book scope is confirmed with client",
        },
        {
          id: "pa-08", pa_id: "PA-08", name: "Investment Accounting Interface",
          scope: "in_scope", work_status: "not_started", sub_flow_count: 5, process_area: "Extended / Specialist",
          description: "Investment subledger (Clearwater) to GL interface for income accruals, realized/unrealized gains, bond amortization, STAT/GAAP dual-basis treatment, and NAIC investment schedule data.",
          sub_flows: [
            { id: "SP-08.1", name: "Investment Income Accrual" },
            { id: "SP-08.2", name: "Realized Gain / Loss" },
            { id: "SP-08.3", name: "Unrealized Gain / Loss & OTTI/CECL" },
            { id: "SP-08.4", name: "Bond Amortization" },
            { id: "SP-08.5", name: "Derivative & Hedge Accounting" },
          ],
          agent_wave: 1,
          agent_level: "L2",
          agent_pattern: "reconciliation",
          agent_opportunity: "Clearwater-to-GL reconciliation agent with automated exception resolution and dual-basis STAT/GAAP posting",
          agent_key_insight: "Clearwater output is highly structured — investment interface is the fastest L2 win with near-zero false-positive risk in Wave 1",
        },
        {
          id: "pa-07", pa_id: "PA-07", name: "Policyholder Liabilities & Reserves",
          scope: "out_of_scope", work_status: "not_started", sub_flow_count: 5, process_area: "Extended / Specialist",
          description: "LDTI policy reserves (LFPB, MRB), DAC/VOBA, and separate account accounting. Out of scope — P&C carrier with no life or annuity products. Applicable if life/health subsidiary added.",
          sub_flows: [
            { id: "SP-07.1", name: "Policy Reserve Calculation Interface" },
            { id: "SP-07.2", name: "DAC / VOBA / Unearned Revenue Accounting" },
            { id: "SP-07.3", name: "Guaranteed Minimum Benefits (GMxB)" },
            { id: "SP-07.4", name: "Policyholder Dividend Accounting" },
            { id: "SP-07.5", name: "Separate Account Accounting" },
          ],
          agent_wave: 4,
          agent_level: "L2",
          agent_pattern: "compliance_reporting",
          agent_opportunity: "LDTI cohort modeling assistance and LFPB/MRB posting automation with ASC 944 disclosure generation",
          agent_key_insight: "Out of scope for P&C — reassess agent investment if a life or health subsidiary is added to the engagement scope",
        },
      ],
      edges: [
        { id: "e-pa01-pa02", source: "pa-01", target: "pa-02", label: "CoA drives GL" },
        { id: "e-pa03-pa15", source: "pa-03", target: "pa-15", label: "premium data lock" },
        { id: "e-pa04-pa15", source: "pa-04", target: "pa-15", label: "IBNR true-up" },
        { id: "e-pa05-pa15", source: "pa-05", target: "pa-15", label: "ceded recoverable" },
        { id: "e-pa15-pa16", source: "pa-15", target: "pa-16", label: "closed trial balance" },
        { id: "e-pa15-pa17", source: "pa-15", target: "pa-17", label: "closed trial balance" },
      ],
    } satisfies ProcessInventoryData,
    activity: [
      { step: 1, label: "Loaded P&C process library", detail: "20 process areas · Insurance Finance · SAP S/4HANA", status: "complete", duration_ms: 890 },
      { step: 2, label: "Matched processes to P&C footprint", detail: "17 in scope · 2 deferred · 1 out of scope", status: "complete", duration_ms: 1240 },
      { step: 3, label: "Awaiting scope confirmation", detail: "Fixed Assets and Assumed Reinsurance marked deferred — confirm with client", status: "active" },
    ],
  },

  "d-004-03": {
    deliverable_id: "d-004-03",
    agent_kind: "knowledge_grounded",
    run_state: "running",
    preflight_title: "Future State Process Maps",
    preflight_bullets: [],
    columns: [],
    rows: [],
    graph: {
      kind: "process_flow_index",
      flow_ids: ["d-004-03a", "d-004-03b", "d-004-03c", "d-004-03d"],
    } satisfies ProcessFlowIndexData,
    activity: [],
  },

  "d-004-03a": {
    deliverable_id: "d-004-03a",
    agent_kind: "knowledge_grounded",
    run_state: "preflight",
    workshop_pa: "PA-02",
    preflight_title: "SP-02.1 · Journal Entry Processing",
    preflight_bullets: [
      "PA-02 General Ledger & Multi-Basis Accounting · sub-flow 1 of 5",
      "8 nodes across 3 swimlanes: GL Accountant, Finance Controller, SAP S/4HANA",
      "2 overlay suggestions pre-loaded from GL Design Coach account analysis",
      "Approval gateway identified — key person risk on Finance Controller lane",
      "Document splitting constraint flagged for GL posting configuration",
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
        { id: "post-acdoca", type: "task", label: "Post to General Ledger", role: "SAP S/4HANA", system: "SAP S/4HANA", status: "leading_practice" },
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
        { id: "ov-2", node_id: "post-acdoca", kind: "constraint", text: "Document splitting required for 4 accounts — GL posting workflow must handle splitting configuration", source: "gl_finding" },
      ],
    } satisfies ProcessFlowData,
    activity: [],
  },

  "d-004-03b": {
    deliverable_id: "d-004-03b",
    agent_kind: "knowledge_grounded",
    run_state: "preflight",
    workshop_pa: "PA-03",
    preflight_title: "SP-03.1 · Gross Written Premium Recording",
    preflight_bullets: [
      "PA-03 Premium Accounting & Revenue Recognition · sub-flow 1 of 5",
      "9 nodes across 3 swimlanes: Premium Accountant, Reinsurance Accountant, SAP FS-CD / S4HANA",
      "2 overlay findings: bordereau cadence lag on ceded premium, GL traceability loss at aggregate posting",
      "Multi-currency gateway identified — FX translation required for international programs",
      "FS-CD architectural decision drives subledger-to-GL posting pattern",
    ],
    columns: [],
    rows: [],
    graph: {
      kind: "process_flow",
      name: "Premium Ops Future State — Gross Written Premium to GL",
      swimlanes: ["Premium Accountant", "Reinsurance Accountant", "SAP FS-CD / S4HANA"],
      nodes: [
        { id: "start", type: "start", label: "Start", role: "Premium Accountant" },
        { id: "receive-bind", type: "task", label: "Receive Policy Bind from PAS", role: "Premium Accountant", system: "Guidewire", status: "leading_practice" },
        { id: "gen-schedule", type: "task", label: "Generate Installment Schedule", role: "Premium Accountant", system: "SAP FS-CD", status: "leading_practice" },
        { id: "post-subledger", type: "task", label: "Post to Premium Subledger", role: "Premium Accountant", system: "SAP FS-CD", status: "leading_practice" },
        { id: "calc-cession", type: "task", label: "Calculate Reinsurance Cession", role: "Reinsurance Accountant", system: "SAP FS-RI", status: "client_overlay" },
        { id: "gw-fx", type: "gateway_exclusive", label: "Multi-currency?", role: "Premium Accountant" },
        { id: "translate-fx", type: "task", label: "Apply Currency Translation", role: "Premium Accountant", system: "SAP FS-CD", status: "client_overlay" },
        { id: "post-gl", type: "task", label: "Aggregate & Post to GL", role: "SAP FS-CD / S4HANA", system: "SAP S/4HANA", status: "leading_practice" },
        { id: "end", type: "end", label: "End", role: "SAP FS-CD / S4HANA" },
      ],
      edges: [
        { id: "e-start-bind", source: "start", target: "receive-bind" },
        { id: "e-bind-sched", source: "receive-bind", target: "gen-schedule" },
        { id: "e-sched-sub", source: "gen-schedule", target: "post-subledger" },
        { id: "e-sub-cession", source: "post-subledger", target: "calc-cession" },
        { id: "e-cession-gw", source: "calc-cession", target: "gw-fx" },
        { id: "e-gw-fx", source: "gw-fx", target: "translate-fx", condition: "Yes", label: "Yes" },
        { id: "e-fx-gl", source: "translate-fx", target: "post-gl" },
        { id: "e-gw-gl", source: "gw-fx", target: "post-gl", condition: "No", label: "No" },
        { id: "e-gl-end", source: "post-gl", target: "end" },
      ],
      overlays: [
        { id: "ov-b1", node_id: "calc-cession", kind: "risk", text: "Quarterly bordereau cadence creates 30–90 day lag between gross and net premium — manual accruals required monthly", source: "gl_finding" },
        { id: "ov-b2", node_id: "post-gl", kind: "constraint", text: "FS-CD posts aggregated entries to GL — individual policy traceability lost at GL level, reconciliation breaks require subledger drill-back", source: "gl_finding" },
      ],
    } satisfies ProcessFlowData,
    activity: [],
  },

  "d-004-03c": {
    deliverable_id: "d-004-03c",
    agent_kind: "knowledge_grounded",
    run_state: "preflight",
    workshop_pa: "PA-09",
    preflight_title: "SP-09.1 · Vendor Invoice Processing",
    preflight_bullets: [
      "PA-09 Accounts Payable & Commission Payments · sub-flow 1 of 4",
      "9 nodes across 3 swimlanes: AP Clerk, Claims Adjuster / Finance Manager, SAP S/4HANA",
      "2 overlay findings: insurance-specific 3-way match logic, CAT event exception spike",
      "Match exception gateway — 10–30% failure rate drives resolution workload",
      "Claims vendor panel violations during CAT events are the largest exception category",
    ],
    columns: [],
    rows: [],
    graph: {
      kind: "process_flow",
      name: "P2P Future State — Vendor Invoice to Payment",
      swimlanes: ["AP Clerk", "Claims Adjuster / Finance Manager", "SAP S/4HANA"],
      nodes: [
        { id: "start", type: "start", label: "Start", role: "AP Clerk" },
        { id: "capture-invoice", type: "task", label: "Capture & Digitize Invoice", role: "AP Clerk", system: "SAP IDP", status: "leading_practice" },
        { id: "validate-vendor", type: "task", label: "Validate Vendor & Panel Status", role: "AP Clerk", system: "SAP BP", status: "leading_practice" },
        { id: "categorize", type: "task", label: "Categorize: Claims / TPA / MGA", role: "AP Clerk", status: "leading_practice" },
        { id: "three-way-match", type: "task", label: "Insurance 3-Way Match", role: "AP Clerk", system: "SAP FI-AP", status: "client_overlay" },
        { id: "gw-match", type: "gateway_exclusive", label: "Match OK?", role: "AP Clerk" },
        { id: "exception-resolve", type: "task", label: "Resolve Match Exceptions", role: "Claims Adjuster / Finance Manager", status: "gap" },
        { id: "schedule-payment", type: "task", label: "Approve & Schedule Payment", role: "Claims Adjuster / Finance Manager", system: "SAP F110", status: "leading_practice" },
        { id: "end", type: "end", label: "End", role: "SAP S/4HANA" },
      ],
      edges: [
        { id: "e-start-cap", source: "start", target: "capture-invoice" },
        { id: "e-cap-val", source: "capture-invoice", target: "validate-vendor" },
        { id: "e-val-cat", source: "validate-vendor", target: "categorize" },
        { id: "e-cat-match", source: "categorize", target: "three-way-match" },
        { id: "e-match-gw", source: "three-way-match", target: "gw-match" },
        { id: "e-gw-exc", source: "gw-match", target: "exception-resolve", condition: "No", label: "No" },
        { id: "e-exc-pay", source: "exception-resolve", target: "schedule-payment" },
        { id: "e-gw-pay", source: "gw-match", target: "schedule-payment", condition: "Yes", label: "Yes" },
        { id: "e-pay-end", source: "schedule-payment", target: "end" },
      ],
      overlays: [
        { id: "ov-c1", node_id: "three-way-match", kind: "exception", text: "Insurance 3-way match differs by stream: Claims = Invoice + Claim reserve + Panel auth; TPA = Invoice + Contract rate + Activity report; MGA = Invoice + Bordereau + Commission rate", source: "agent_elicited" },
        { id: "ov-c2", node_id: "exception-resolve", kind: "risk", text: "10–30% of invoices fail auto-match — claims vendor panel violations during CAT events are the largest exception category", source: "gl_finding" },
      ],
    } satisfies ProcessFlowData,
    activity: [],
  },

  "d-004-03d": {
    deliverable_id: "d-004-03d",
    agent_kind: "knowledge_grounded",
    run_state: "preflight",
    workshop_pa: "PA-13",
    preflight_title: "SP-13.1 · Cash Positioning & Bank Reconciliation",
    preflight_bullets: [
      "PA-13 Cash Management & Treasury · sub-flow 1 of 4",
      "9 nodes across 3 swimlanes: Treasury Analyst, Treasury Manager, Banking System / SAP TRM",
      "2 overlay findings: premium receipt auto-match rate 60–75%, claims funding sequencing risk",
      "Exception gateway — unmatched bank transactions drive investigation workload",
      "Claims payment batch timing creates critical funding authorization window before 08:00",
    ],
    columns: [],
    rows: [],
    graph: {
      kind: "process_flow",
      name: "Treasury Future State — Cash Positioning & Bank Reconciliation",
      swimlanes: ["Treasury Analyst", "Treasury Manager", "Banking System / SAP TRM"],
      nodes: [
        { id: "start", type: "start", label: "Start", role: "Treasury Analyst" },
        { id: "ingest-statements", type: "task", label: "Import Prior-Day Bank Statements", role: "Treasury Analyst", system: "SAP TRM", status: "leading_practice" },
        { id: "consolidate-position", type: "task", label: "Consolidate Cash Position by Entity", role: "Treasury Analyst", system: "Kyriba", status: "leading_practice" },
        { id: "load-expected", type: "task", label: "Load Expected Cash Flows", role: "Treasury Analyst", system: "SAP TRM", status: "leading_practice" },
        { id: "auto-match", type: "task", label: "Auto-Match Bank Transactions", role: "Banking System / SAP TRM", system: "SAP TRM", status: "leading_practice" },
        { id: "gw-exceptions", type: "gateway_exclusive", label: "Unmatched items?", role: "Treasury Analyst" },
        { id: "resolve-exceptions", type: "task", label: "Investigate & Resolve Exceptions", role: "Treasury Analyst", status: "client_overlay" },
        { id: "authorize-funding", type: "task", label: "Authorize Claims Payment Funding", role: "Treasury Manager", status: "client_overlay" },
        { id: "end", type: "end", label: "End", role: "Banking System / SAP TRM" },
      ],
      edges: [
        { id: "e-start-ingest", source: "start", target: "ingest-statements" },
        { id: "e-ingest-consol", source: "ingest-statements", target: "consolidate-position" },
        { id: "e-consol-load", source: "consolidate-position", target: "load-expected" },
        { id: "e-load-match", source: "load-expected", target: "auto-match" },
        { id: "e-match-gw", source: "auto-match", target: "gw-exceptions" },
        { id: "e-gw-resolve", source: "gw-exceptions", target: "resolve-exceptions", condition: "Yes", label: "Yes" },
        { id: "e-resolve-fund", source: "resolve-exceptions", target: "authorize-funding" },
        { id: "e-gw-fund", source: "gw-exceptions", target: "authorize-funding", condition: "No", label: "No" },
        { id: "e-fund-end", source: "authorize-funding", target: "end" },
      ],
      overlays: [
        { id: "ov-d1", node_id: "auto-match", kind: "risk", text: "Premium receipt auto-match rate typically 60–75% — policyholders omit policy number on personal checks and billpay, creating large manual exception queue", source: "gl_finding" },
        { id: "ov-d2", node_id: "authorize-funding", kind: "constraint", text: "Claims payment batch released overnight; treasury must confirm funding by 08:00 — sequencing breaks when batch runs late or funding shortfall identified after bank cutoff", source: "gl_finding" },
      ],
    } satisfies ProcessFlowData,
    activity: [],
  },

  // ── WS-001: PM & Governance ──────────────────────────────────────────────

  "d-001-03": {
    deliverable_id: "d-001-03",
    agent_kind: "knowledge_grounded",
    run_state: "complete",
    preflight_title: "RACI Matrix",
    preflight_bullets: [
      "12 key roles mapped across 7 workstreams and 35 deliverables",
      "Standard consulting RACI applied from leading practice library",
      "3 ownership gaps identified requiring client resolution",
      "Cross-workstream dependencies highlighted for steering committee",
    ],
    columns: [
      { key: "deliverable", label: "Deliverable", width: "220px" },
      { key: "workstream", label: "Workstream", width: "140px" },
      { key: "engagement_lead", label: "Eng. Lead", width: "80px" },
      { key: "cfo", label: "CFO", width: "60px" },
      { key: "controller", label: "Controller", width: "80px" },
      { key: "gl_manager", label: "GL Mgr", width: "70px" },
      { key: "claims_finance", label: "Claims Fin.", width: "80px" },
      { key: "it_lead", label: "IT Lead", width: "70px" },
      { key: "actuary", label: "Actuary", width: "70px" },
      { key: "erp_vendor", label: "ERP Vendor", width: "80px" },
    ],
    rows: [
      { row_id: "raci-01", cells: { deliverable: "Project Charter", workstream: "PM & Governance", engagement_lead: "R", cfo: "A", controller: "C", gl_manager: "I", claims_finance: "I", it_lead: "C", actuary: "I", erp_vendor: "I" }, provenance: "Standard PMO template · Leading Practice Library" },
      { row_id: "raci-02", cells: { deliverable: "RACI Matrix", workstream: "PM & Governance", engagement_lead: "R", cfo: "I", controller: "A", gl_manager: "C", claims_finance: "C", it_lead: "C", actuary: "I", erp_vendor: "I" }, provenance: "Standard PMO template · Leading Practice Library" },
      { row_id: "raci-03", cells: { deliverable: "Risk & Issue Log", workstream: "PM & Governance", engagement_lead: "R", cfo: "I", controller: "C", gl_manager: "C", claims_finance: "C", it_lead: "C", actuary: "I", erp_vendor: "I" }, provenance: "Standard PMO template · Leading Practice Library" },
      { row_id: "raci-04", cells: { deliverable: "Scope Definition", workstream: "Business Case", engagement_lead: "R", cfo: "A", controller: "C", gl_manager: "C", claims_finance: "C", it_lead: "C", actuary: "C", erp_vendor: "I" }, provenance: "Scope confirmed at steering committee Jan 28" },
      { row_id: "raci-05", cells: { deliverable: "Process Inventory", workstream: "Business Process", engagement_lead: "C", cfo: "I", controller: "A", gl_manager: "R", claims_finance: "R", it_lead: "C", actuary: "C", erp_vendor: "I" }, provenance: "Dual R ownership — GL + Claims co-lead process mapping" },
      { row_id: "raci-06", cells: { deliverable: "Business Requirements", workstream: "Business Process", engagement_lead: "C", cfo: "I", controller: "A", gl_manager: "R", claims_finance: "R", it_lead: "C", actuary: "C", erp_vendor: "C" }, provenance: "Workshop-driven — client finance team validates" },
      { row_id: "raci-07", cells: { deliverable: "Account Analysis Report", workstream: "COA & GL", engagement_lead: "C", cfo: "I", controller: "A", gl_manager: "R", claims_finance: "I", it_lead: "I", actuary: "I", erp_vendor: "I" }, provenance: "Agent-powered · GL Design Coach runs analysis" },
      { row_id: "raci-08", cells: { deliverable: "Chart of Accounts Design", workstream: "COA & GL", engagement_lead: "C", cfo: "A", controller: "R", gl_manager: "R", claims_finance: "C", it_lead: "C", actuary: "I", erp_vendor: "C" }, provenance: "COA design requires CFO sign-off" },
      { row_id: "raci-09", cells: { deliverable: "ERP Evaluation Summary", workstream: "ERP Selection", engagement_lead: "R", cfo: "A", controller: "C", gl_manager: "C", claims_finance: "C", it_lead: "R", actuary: "I", erp_vendor: "I" }, provenance: "Joint ownership — Engagement Lead + IT Lead" },
      { row_id: "raci-10", cells: { deliverable: "Reporting Inventory", workstream: "Reporting", engagement_lead: "C", cfo: "I", controller: "A", gl_manager: "C", claims_finance: "C", it_lead: "C", actuary: "C", erp_vendor: "I" }, needs_attention: true, provenance: "⚠ No R assigned — ownership gap needs resolution" },
      { row_id: "raci-11", cells: { deliverable: "Data Migration Strategy", workstream: "Data & Integration", engagement_lead: "C", cfo: "I", controller: "I", gl_manager: "C", claims_finance: "I", it_lead: "R", actuary: "I", erp_vendor: "C" }, provenance: "IT Lead owns data strategy" },
      { row_id: "raci-12", cells: { deliverable: "Interface Inventory", workstream: "Data & Integration", engagement_lead: "C", cfo: "I", controller: "I", gl_manager: "C", claims_finance: "C", it_lead: "R", actuary: "I", erp_vendor: "C" }, needs_attention: true, provenance: "⚠ Claims Finance involvement unclear — confirm at next workshop" },
    ],
    insight_cards: [
      { kind: "info", text: "12 roles mapped across 35 deliverables" },
      { kind: "risk", text: "3 deliverables have no Responsible (R) owner assigned" },
      { kind: "finding", text: "Claims Finance listed as R on 2 deliverables — validate capacity" },
    ],
    activity: [
      { step: 1, label: "Loaded RACI template", detail: "Standard PMO · 12 roles · 7 workstreams", status: "complete", duration_ms: 420 },
      { step: 2, label: "Applied engagement context", detail: "Acme Insurance · P&C · Design phase", status: "complete", duration_ms: 680 },
      { step: 3, label: "Identified ownership gaps", detail: "3 deliverables missing Responsible (R) assignment", status: "complete", duration_ms: 340 },
    ],
  },

  "d-001-04": {
    deliverable_id: "d-001-04",
    agent_kind: "knowledge_grounded",
    run_state: "complete",
    preflight_title: "Risk & Issue Log",
    preflight_bullets: [
      "Active risk and issue tracking for engagement lifecycle",
      "4 risks and 3 issues logged from discovery and design phases",
      "1 high-severity item requires immediate escalation",
      "Risk scoring based on likelihood × impact matrix",
    ],
    columns: [
      { key: "id", label: "ID", width: "60px" },
      { key: "type", label: "Type", width: "70px" },
      { key: "severity", label: "Severity", width: "80px" },
      { key: "title", label: "Title", width: "240px" },
      { key: "owner", label: "Owner", width: "100px" },
      { key: "status", label: "Status", width: "90px" },
      { key: "due_date", label: "Due", width: "90px" },
    ],
    rows: [
      { row_id: "ri-01", cells: { id: "R-001", type: "Risk", severity: "High", title: "Key person dependency on JSMITH for actuarial JEs", owner: "Controller", status: "Open", due_date: "2026-03-15" }, flags: ["HIGH"], needs_attention: true, provenance: "Detected by GL Design Coach · 91% of actuarial entries posted by single user" },
      { row_id: "ri-02", cells: { id: "R-002", type: "Risk", severity: "Medium", title: "FS-RI scope decision may delay ceded reinsurance design", owner: "Eng. Lead", status: "Open", due_date: "2026-03-01" }, flags: ["MEDIUM"], provenance: "Identified in ERP evaluation · SAP with/without FS-RI is an architectural fork" },
      { row_id: "ri-03", cells: { id: "R-003", type: "Risk", severity: "Medium", title: "Client data team resource constraints for GL extract", owner: "IT Lead", status: "Mitigating", due_date: "2026-02-28" }, flags: ["MEDIUM"], provenance: "d-005-07 GL Open Items blocked pending data extract" },
      { row_id: "ri-04", cells: { id: "R-004", type: "Risk", severity: "Low", title: "Schedule P historical data quality for 10-year triangles", owner: "Actuary", status: "Open", due_date: "2026-04-15" }, provenance: "Data quality unknown — assessment deferred to Phase 2 data migration" },
      { row_id: "ri-05", cells: { id: "I-001", type: "Issue", severity: "High", title: "Claims finance RACI ownership unresolved — blocks requirements", owner: "Controller", status: "Open", due_date: "2026-02-25" }, flags: ["HIGH"], needs_attention: true, provenance: "Cross-reference: RACI Matrix gaps for Claims Finance role" },
      { row_id: "ri-06", cells: { id: "I-002", type: "Issue", severity: "Medium", title: "CFO/CTO alignment on ERP selection timing not confirmed", owner: "Eng. Lead", status: "In Progress", due_date: "2026-02-28" }, flags: ["MEDIUM"], provenance: "Stakeholder Map (d-002-03) flagged alignment gap" },
      { row_id: "ri-07", cells: { id: "I-003", type: "Issue", severity: "Low", title: "Workshop scheduling conflict — Claims team availability Q1", owner: "Eng. Lead", status: "Open", due_date: "2026-03-10" }, provenance: "Logistics — not blocking critical path deliverables yet" },
    ],
    insight_cards: [
      { kind: "risk", text: "2 high-severity items require immediate attention" },
      { kind: "info", text: "4 risks, 3 issues tracked · 1 item actively mitigating" },
      { kind: "finding", text: "Key person risk (R-001) cross-referenced from GL Account Analysis" },
    ],
    activity: [
      { step: 1, label: "Initialized risk register", detail: "Standard PMO risk template · 5×5 likelihood×impact", status: "complete", duration_ms: 380 },
      { step: 2, label: "Imported cross-workstream findings", detail: "GL analysis key person risk + ERP evaluation flags", status: "complete", duration_ms: 920 },
      { step: 3, label: "Set escalation triggers", detail: "High severity → steering committee agenda item", status: "complete", duration_ms: 240 },
    ],
  },

  // ── WS-002: Business Case & Scope ─────────────────────────────────────────

  "d-002-02": {
    deliverable_id: "d-002-02",
    agent_kind: "knowledge_grounded",
    run_state: "complete",
    preflight_title: "Scope Definition",
    preflight_bullets: [
      "In-scope and out-of-scope inventory for the transformation",
      "47 items confirmed in scope · 12 explicitly excluded",
      "Scope baseline locked at steering committee Jan 28",
      "Change control process active for any scope modifications",
    ],
    columns: [
      { key: "id", label: "ID", width: "60px" },
      { key: "category", label: "Category", width: "130px" },
      { key: "item", label: "Scope Item", width: "280px" },
      { key: "scope_status", label: "Status", width: "90px" },
      { key: "rationale", label: "Rationale", width: "200px" },
    ],
    rows: [
      { row_id: "sc-01", cells: { id: "S-001", category: "GL & COA", item: "Chart of Accounts redesign — NAIC-aligned code block structure", scope_status: "In Scope", rationale: "Core transformation deliverable" }, provenance: "Confirmed at scoping workshop Jan 15 · CFO sponsor" },
      { row_id: "sc-02", cells: { id: "S-002", category: "GL & COA", item: "Multi-GAAP ledger design (US STAT + US GAAP)", scope_status: "In Scope", rationale: "Required for dual-basis reporting" }, provenance: "ACDOCA extension ledger approach selected" },
      { row_id: "sc-03", cells: { id: "S-003", category: "GL & COA", item: "Document splitting configuration (profit center, segment)", scope_status: "In Scope", rationale: "4 accounts flagged for doc-split in GL analysis" }, provenance: "Cross-reference: Account Analysis (d-005-01)" },
      { row_id: "sc-04", cells: { id: "S-004", category: "Business Process", item: "R2R, P2P, Financial Close — future state process maps", scope_status: "In Scope", rationale: "Core finance processes" }, provenance: "20 process areas assessed · 17 in scope" },
      { row_id: "sc-05", cells: { id: "S-005", category: "Business Process", item: "Claims Finance process design", scope_status: "In Scope", rationale: "P&C-specific — high complexity, high impact" }, provenance: "PA-04 Loss & Claims Accounting — in progress" },
      { row_id: "sc-06", cells: { id: "S-006", category: "Reinsurance", item: "Ceded reinsurance accounting (treaty, fac, settlements)", scope_status: "In Scope", rationale: "Critical P&C process — Schedule F compliance" }, provenance: "PA-05 — 25 requirements assessed with Fit/Gap" },
      { row_id: "sc-07", cells: { id: "S-007", category: "Reporting", item: "NAIC Annual Statement reporting map", scope_status: "In Scope", rationale: "Regulatory requirement" }, provenance: "Schedule A–T mapping to GL line items" },
      { row_id: "sc-08", cells: { id: "S-008", category: "Reporting", item: "Management reporting — combined ratio by LOB", scope_status: "In Scope", rationale: "CFO priority — daily visibility requested" }, provenance: "CFO asked for LOB-level combined ratio dashboard" },
      { row_id: "sc-09", cells: { id: "S-009", category: "Data & Integration", item: "Policy admin to GL interface design", scope_status: "In Scope", rationale: "Primary data feed — high volume" }, provenance: "PA-20 Data Integration — 6 interfaces in scope" },
      { row_id: "sc-10", cells: { id: "S-010", category: "ERP Platform", item: "SAP S/4HANA Finance module (FI, CO, Group Reporting)", scope_status: "In Scope", rationale: "Selected via ERP evaluation process" }, provenance: "ERP Evaluation Summary (d-003-04) recommendation" },
      { row_id: "sc-11", cells: { id: "X-001", category: "ERP Platform", item: "SAP FS-RI (reinsurance sub-ledger)", scope_status: "Excluded", rationale: "Cost/complexity — retain external RI system" }, flags: ["EXCLUDED"], provenance: "Decision pending final confirmation · Risk R-002 logged" },
      { row_id: "sc-12", cells: { id: "X-002", category: "Business Process", item: "Fixed Assets & Leases (PA-12)", scope_status: "Deferred", rationale: "Standard ERP capability — defer to Phase 2" }, flags: ["DEFERRED"], provenance: "Low insurance-specific complexity" },
      { row_id: "sc-13", cells: { id: "X-003", category: "Business Process", item: "Assumed Reinsurance Accounting (PA-06)", scope_status: "Deferred", rationale: "Confirm assumed book scope with client" }, flags: ["DEFERRED"], provenance: "Pending client confirmation of pool membership" },
      { row_id: "sc-14", cells: { id: "X-004", category: "Business Process", item: "Policyholder Liabilities & Reserves (PA-07)", scope_status: "Excluded", rationale: "P&C carrier — no life/annuity products" }, flags: ["EXCLUDED"], provenance: "Out of scope — segment does not apply" },
      { row_id: "sc-15", cells: { id: "X-005", category: "Data & Integration", item: "Historical data migration beyond 3-year lookback", scope_status: "Excluded", rationale: "Cost/benefit — archive older data separately" }, flags: ["EXCLUDED"], provenance: "Exception: Schedule P requires 10-year triangle data (R-004)" },
    ],
    insight_cards: [
      { kind: "info", text: "47 items in scope · 12 excluded · Baseline locked Jan 28" },
      { kind: "finding", text: "2 items deferred pending client confirmation (Fixed Assets, Assumed RI)" },
      { kind: "risk", text: "FS-RI exclusion may impact ceded reinsurance design — Risk R-002" },
    ],
    activity: [
      { step: 1, label: "Loaded scope template", detail: "Insurance finance transformation · 7 categories", status: "complete", duration_ms: 510 },
      { step: 2, label: "Applied engagement decisions", detail: "Scoping workshop Jan 15 · Steering committee Jan 28", status: "complete", duration_ms: 780 },
      { step: 3, label: "Baseline locked", detail: "Change control process activated", status: "complete", duration_ms: 180 },
    ],
  },

  // ── WS-003: ERP Software Selection ────────────────────────────────────────

  "d-003-04": {
    deliverable_id: "d-003-04",
    agent_kind: "knowledge_grounded",
    run_state: "complete",
    preflight_title: "ERP Evaluation Summary & Recommendation",
    preflight_bullets: [
      "3 ERP platforms evaluated against 23 weighted criteria",
      "5 scoring dimensions: insurance fit, financial close, reporting, integration, TCO",
      "P&C-specific scenarios scored from vendor demonstrations",
      "SAP S/4HANA recommended — highest insurance fit score",
    ],
    columns: [
      { key: "dimension", label: "Dimension", width: "180px" },
      { key: "weight", label: "Weight", width: "70px" },
      { key: "sap", label: "SAP S/4HANA", width: "100px" },
      { key: "oracle", label: "Oracle Cloud", width: "100px" },
      { key: "workday", label: "Workday Fin.", width: "100px" },
    ],
    rows: [
      { row_id: "erp-01", cells: { dimension: "Insurance Fit", weight: "30%", sap: "4.2 / 5.0", oracle: "3.4 / 5.0", workday: "2.1 / 5.0" }, provenance: "P&C-specific: multi-basis ledger, NAIC alignment, FS-CD/FS-RI availability, loss reserve posting" },
      { row_id: "erp-02", cells: { dimension: "Financial Close Capability", weight: "25%", sap: "4.5 / 5.0", oracle: "4.0 / 5.0", workday: "2.8 / 5.0" }, provenance: "Close orchestration, sub-ledger reconciliation, multi-basis close sequence, continuous close features" },
      { row_id: "erp-03", cells: { dimension: "Reporting & Analytics", weight: "20%", sap: "3.8 / 5.0", oracle: "4.2 / 5.0", workday: "3.5 / 5.0" }, provenance: "NAIC statutory reporting requires third-party tool for all platforms. Oracle FCCS scores highest on consolidation." },
      { row_id: "erp-04", cells: { dimension: "Integration Architecture", weight: "15%", sap: "4.0 / 5.0", oracle: "3.8 / 5.0", workday: "3.2 / 5.0" }, provenance: "SAP Integration Suite vs Oracle OIC vs Workday Integration Cloud. SAP has deepest insurance ecosystem." },
      { row_id: "erp-05", cells: { dimension: "Total Cost of Ownership", weight: "10%", sap: "3.0 / 5.0", oracle: "3.5 / 5.0", workday: "4.0 / 5.0" }, provenance: "SAP highest TCO due to insurance sub-ledger licensing. Workday lowest but requires significant supplementation." },
      { row_id: "erp-06", cells: { dimension: "Weighted Total", weight: "100%", sap: "4.05", oracle: "3.77", workday: "2.88" }, flags: ["RECOMMENDED"], provenance: "SAP S/4HANA recommended · Strongest insurance fit and close capability · TCO premium justified by reduced customization" },
    ],
    insight_cards: [
      { kind: "compliant", text: "SAP S/4HANA selected — highest weighted score (4.05 / 5.0)" },
      { kind: "finding", text: "Oracle Cloud scored highest on Reporting & Analytics (4.2) — consider for analytics layer" },
      { kind: "info", text: "All platforms require third-party tool for NAIC statutory reporting" },
      { kind: "risk", text: "SAP has highest TCO (3.0 / 5.0) — FS-RI and FS-CD licensing drives premium" },
    ],
    activity: [
      { step: 1, label: "Loaded evaluation framework", detail: "23 criteria across 5 dimensions · Insurance-weighted", status: "complete", duration_ms: 620 },
      { step: 2, label: "Scored vendor demonstrations", detail: "18 P&C scenarios · 3 platforms · 2 independent reviewers", status: "complete", duration_ms: 3840 },
      { step: 3, label: "Calculated weighted totals", detail: "SAP 4.05 · Oracle 3.77 · Workday 2.88", status: "complete", duration_ms: 450 },
      { step: 4, label: "Generated recommendation", detail: "SAP S/4HANA recommended with risk notes on TCO", status: "complete", duration_ms: 380 },
    ],
  },

  "d-004-04": {
    deliverable_id: "d-004-04",
    agent_kind: "knowledge_grounded",
    run_state: "running",
    preflight_title: "Business Requirements by Process",
    preflight_bullets: [
      "314 requirements across 20 process areas from insurance finance library",
      "25 requirements assessed with ERP Fit/Gap analysis (PA-05 pilot)",
      "4 ERP platforms assessed: SAP with/without FS-RI, Oracle Cloud, Workday",
      "Agentic gap closure ratings applied to all assessed requirements",
      "Ready for workshop validation with client finance team",
    ],
    columns: [],
    rows: [],
    graph: BUSINESS_REQUIREMENTS,
    activity: [
      { step: 1, label: "Loaded leading practice library", detail: "314 requirements · 20 process areas · Insurance Finance", status: "complete", duration_ms: 1120 },
      { step: 2, label: "Applied engagement context", detail: "P&C segment · SAP S/4HANA · Design phase", status: "complete", duration_ms: 890 },
      { step: 3, label: "Ran ERP Fit/Gap pilot", detail: "PA-05 Ceded Reinsurance · 25 requirements · 4 platforms", status: "complete", duration_ms: 4320 },
      { step: 4, label: "Applied agentic gap closure", detail: "A1–A3 ratings with autonomy levels", status: "complete", duration_ms: 2150 },
      { step: 5, label: "Awaiting validation", detail: "Workshop with client finance team", status: "active" },
    ],
  },

  "d-006-01": {
    deliverable_id: "d-006-01",
    agent_kind: "knowledge_grounded",
    run_state: "complete",
    preflight_title: "Reporting Inventory",
    preflight_bullets: [
      "28 reports cataloged across 3 categories (Statutory/SEC, Management, Operational)",
      "Dimension requirements mapped per report — cross-referenced against COA design",
      "Transformation risk assessment: 5 reports ranked high-risk for migration",
      "Sub-segment coverage: P&C, Life/Annuity, Reinsurance-specific reports included",
    ],
    columns: [
      { key: "id", label: "ID", width: "70px" },
      { key: "report", label: "Report", width: "220px" },
      { key: "category", label: "Category", width: "110px" },
      { key: "sub_segment", label: "Segment", width: "90px" },
      { key: "user_group", label: "User Group", width: "130px" },
      { key: "frequency", label: "Frequency", width: "90px" },
      { key: "required_dimensions", label: "Required Dimensions", width: "200px" },
      { key: "risk_rank", label: "Risk", width: "60px" },
      { key: "status", label: "Status", width: "100px" },
    ],
    rows: [
      // ── Regulatory/Statutory/SEC (14) ──
      { row_id: "rpt-01", cells: { id: "R-01", report: "Balance Sheet (Pages 2-4)", category: "Statutory", sub_segment: "All", user_group: "Statutory Reporting", frequency: "Annual", required_dimensions: "Legal Entity, Ledger (STAT), Admitted/Non-admitted", risk_rank: "", status: "Confirmed" }, provenance: "NAIC Annual Statement Instructions · Cross-ref: COA Dimensions (d-005-08)" },
      { row_id: "rpt-02", cells: { id: "R-02", report: "Statement of Income", category: "Statutory", sub_segment: "All", user_group: "Statutory Reporting", frequency: "Annual", required_dimensions: "LOB, NAIC Line, Direct/Assumed/Ceded, Ledger (STAT)", risk_rank: "", status: "Confirmed" }, provenance: "NAIC Annual Statement Instructions · Cross-ref: COA Dimensions (d-005-08)" },
      { row_id: "rpt-03", cells: { id: "R-03", report: "Schedule P — Loss Development", category: "Statutory", sub_segment: "P&C", user_group: "Actuarial / Statutory", frequency: "Annual", required_dimensions: "Accident Year (10yr), LOB, NAIC Line, Paid/Incurred, DCC/A&O", risk_rank: "#1", status: "Gap Identified" }, flags: ["MANUAL", "AT RISK", "COA GAP"], needs_attention: true, provenance: "NAIC Annual Statement Instructions · Cross-ref: COA Dimensions (d-005-08) · Accident Year dimension not on current code block" },
      { row_id: "rpt-04", cells: { id: "R-04", report: "Schedule F — Reinsurance", category: "Statutory", sub_segment: "All", user_group: "Reinsurance Mgr", frequency: "Annual", required_dimensions: "Treaty ID, Reinsurer Entity, LOB, Authorized/Unauthorized", risk_rank: "#4", status: "Needs Input" }, flags: ["AT RISK"], needs_attention: true, provenance: "NAIC Annual Statement Instructions · Cross-ref: COA Dimensions (d-005-08)" },
      { row_id: "rpt-05", cells: { id: "R-08", report: "Schedule T — Premiums by State", category: "Statutory", sub_segment: "P&C", user_group: "Statutory Reporting", frequency: "Annual", required_dimensions: "State (54 jurisdictions), LOB, NAIC Line", risk_rank: "#6", status: "Gap Identified" }, flags: ["MANUAL", "COA GAP"], needs_attention: true, provenance: "NAIC Annual Statement Instructions · Cross-ref: COA Dimensions (d-005-08) · State dimension not on current code block" },
      { row_id: "rpt-06", cells: { id: "R-09", report: "Insurance Expense Exhibit", category: "Statutory", sub_segment: "P&C", user_group: "Statutory Reporting", frequency: "Annual", required_dimensions: "LOB, Functional Area, Cost Center, NAIC Line", risk_rank: "#3", status: "Needs Input" }, flags: ["MANUAL", "AT RISK"], needs_attention: true, provenance: "NAIC Annual Statement Instructions · Cross-ref: COA Dimensions (d-005-08)" },
      { row_id: "rpt-07", cells: { id: "R-12", report: "Risk-Based Capital", category: "Statutory", sub_segment: "All", user_group: "Capital Management", frequency: "Annual", required_dimensions: "Legal Entity, Risk Category, All feeder schedule dims", risk_rank: "", status: "Confirmed" }, provenance: "NAIC Annual Statement Instructions · Cross-ref: COA Dimensions (d-005-08)" },
      { row_id: "rpt-08", cells: { id: "R-17", report: "SEC 10-K/10-Q", category: "SEC", sub_segment: "All", user_group: "External Reporting", frequency: "Quarterly", required_dimensions: "GAAP Segment, Legal Entity, IC Partner, Consolidation", risk_rank: "", status: "Confirmed" }, provenance: "NAIC Annual Statement Instructions · Cross-ref: COA Dimensions (d-005-08)" },
      { row_id: "rpt-08a", cells: { id: "R-14", report: "GAAP Balance Sheet", category: "SEC", sub_segment: "All", user_group: "External Reporting", frequency: "Quarterly", required_dimensions: "GAAP Segment, Legal Entity, IC Partner, Consolidation, Currency", risk_rank: "", status: "Confirmed" }, provenance: "US GAAP ASC 944 · Cross-ref: COA Design (d-005-02) · Multi-basis ledger required for STAT/GAAP parallel" },
      { row_id: "rpt-08b", cells: { id: "R-15", report: "GAAP Income Statement", category: "SEC", sub_segment: "All", user_group: "External Reporting", frequency: "Quarterly", required_dimensions: "GAAP Segment, LOB, Revenue Type, IC Elimination, Consolidation", risk_rank: "", status: "Confirmed" }, provenance: "US GAAP ASC 944 · Cross-ref: COA Design (d-005-02) · Segment reporting per ASC 280 requires LOB-to-segment mapping" },
      { row_id: "rpt-08c", cells: { id: "R-16", report: "GAAP Cash Flow Statement", category: "SEC", sub_segment: "All", user_group: "External Reporting", frequency: "Quarterly", required_dimensions: "Cash Flow Category, Legal Entity, Direct/Indirect Method, Consolidation", risk_rank: "", status: "Needs Input" }, provenance: "US GAAP ASC 230 · Cross-ref: COA Design (d-005-02) · Direct vs. indirect method is a COA design decision — account structure must support operating/investing/financing classification" },
      { row_id: "rpt-08d", cells: { id: "R-19", report: "GAAP Comprehensive Income", category: "SEC", sub_segment: "All", user_group: "External Reporting", frequency: "Quarterly", required_dimensions: "OCI Component, Investment Category, Legal Entity, Consolidation", risk_rank: "", status: "Confirmed" }, provenance: "US GAAP ASC 220 / ASC 944-325 · Cross-ref: COA Design (d-005-02) · Unrealized investment gains material for insurance carriers" },
      { row_id: "rpt-09", cells: { id: "R-18", report: "LDTI Disclosures", category: "SEC", sub_segment: "Life", user_group: "External Reporting", frequency: "Quarterly", required_dimensions: "Issue Year Cohort, Product Group, Liability Type, DAC/VOBA", risk_rank: "#2", status: "Needs Input" }, flags: ["AT RISK"], needs_attention: true, provenance: "NAIC Annual Statement Instructions · Cross-ref: COA Dimensions (d-005-08)" },
      { row_id: "rpt-10", cells: { id: "R-20", report: "IRS Form 1120-PC/L", category: "IRS", sub_segment: "All", user_group: "Tax", frequency: "Annual", required_dimensions: "Tax Entity, LOB, Loss Reserve Discount, S.848 Categories", risk_rank: "", status: "Confirmed" }, provenance: "NAIC Annual Statement Instructions · Cross-ref: COA Dimensions (d-005-08)" },

      // ── Management (10) ──
      { row_id: "rpt-11", cells: { id: "M-01", report: "CFO Scorecard", category: "Management", sub_segment: "All", user_group: "CFO / Board", frequency: "Monthly", required_dimensions: "Reporting Basis, Segment, Legal Entity, Budget/Actual/PY", risk_rank: "", status: "Confirmed" }, provenance: "Workshop W3 — Controller interview · Cross-ref: COA Design (d-005-02)" },
      { row_id: "rpt-12", cells: { id: "M-02", report: "Combined Ratio by LOB", category: "Management", sub_segment: "P&C", user_group: "CFO / Underwriting", frequency: "Monthly", required_dimensions: "LOB (NAIC + internal), Accident Year, Gross/Net", risk_rank: "#9", status: "Confirmed" }, provenance: "Workshop W3 — Controller interview · Cross-ref: COA Design (d-005-02)" },
      { row_id: "rpt-13", cells: { id: "M-07", report: "Multi-Basis Trial Balance", category: "Management", sub_segment: "All", user_group: "Controller", frequency: "Monthly", required_dimensions: "Reporting Basis, Legal Entity, Cost Center, IC indicator", risk_rank: "#7", status: "Confirmed" }, flags: ["MANUAL"], provenance: "Workshop W3 — Controller interview · Cross-ref: COA Design (d-005-02)" },
      { row_id: "rpt-14", cells: { id: "M-08", report: "Written & Earned Premium", category: "Management", sub_segment: "All", user_group: "Controller", frequency: "Monthly", required_dimensions: "LOB, Written/Earned/Unearned, Direct/Assumed/Ceded", risk_rank: "", status: "Confirmed" }, provenance: "Workshop W3 — Controller interview · Cross-ref: COA Design (d-005-02)" },
      { row_id: "rpt-15", cells: { id: "M-09", report: "Loss & LAE Reserve Summary", category: "Management", sub_segment: "P&C", user_group: "Controller", frequency: "Monthly", required_dimensions: "Reserve Type, LOB, Accident Year, DCC/ALAE/ULAE", risk_rank: "", status: "Needs Input" }, provenance: "Workshop W3 — Controller interview · Cross-ref: COA Design (d-005-02)" },
      { row_id: "rpt-16", cells: { id: "M-12", report: "Loss Development Triangles", category: "Management", sub_segment: "P&C", user_group: "Actuarial", frequency: "Quarterly", required_dimensions: "Accident Year (10+), LOB, Paid/Incurred, DCC/A&O", risk_rank: "", status: "Gap Identified" }, flags: ["MANUAL", "COA GAP"], needs_attention: true, provenance: "Workshop W3 — Controller interview · Cross-ref: COA Design (d-005-02) · Accident Year granularity exceeds current code block design" },
      { row_id: "rpt-17", cells: { id: "M-16", report: "Budget vs. Actual Variance", category: "Management", sub_segment: "All", user_group: "FP&A", frequency: "Monthly", required_dimensions: "Budget Version, Segment, LOB, Cost Center, Variance Type", risk_rank: "", status: "Confirmed" }, provenance: "Workshop W3 — Controller interview · Cross-ref: COA Design (d-005-02)" },
      { row_id: "rpt-18", cells: { id: "M-17", report: "Expense Allocation", category: "Management", sub_segment: "All", user_group: "Controller", frequency: "Quarterly", required_dimensions: "Natural Expense, Cost Center, LOB, Functional Area, Direct/Allocated", risk_rank: "", status: "Needs Input" }, flags: ["MANUAL"], provenance: "Workshop W3 — Controller interview · Cross-ref: COA Design (d-005-02)" },
      { row_id: "rpt-19", cells: { id: "M-19", report: "Ceded/Assumed Reinsurance", category: "Management", sub_segment: "Reins", user_group: "Reinsurance Mgr", frequency: "Monthly", required_dimensions: "Treaty, Reinsurer, Treaty Type, LOB, Contract Year", risk_rank: "", status: "Confirmed" }, provenance: "Workshop W3 — Controller interview · Cross-ref: COA Design (d-005-02)" },
      { row_id: "rpt-20", cells: { id: "M-22", report: "Intercompany Activity", category: "Management", sub_segment: "All", user_group: "Controller", frequency: "Monthly", required_dimensions: "Legal Entity, IC Partner, Transaction Type", risk_rank: "", status: "Confirmed" }, provenance: "Workshop W3 — Controller interview · Cross-ref: COA Design (d-005-02)" },

      // ── Operational (4) ──
      { row_id: "rpt-21", cells: { id: "O-01", report: "Subledger-to-GL Reconciliation", category: "Operational", sub_segment: "All", user_group: "Accounting", frequency: "Monthly", required_dimensions: "Subledger Source, Account, Entity, Reconciling Item", risk_rank: "#5", status: "Needs Input" }, flags: ["MANUAL", "AT RISK"], needs_attention: true, provenance: "Close process walkthrough · Cross-ref: Account Analysis (d-005-01)" },
      { row_id: "rpt-22", cells: { id: "O-03", report: "IC Reconciliation", category: "Operational", sub_segment: "All", user_group: "Accounting", frequency: "Monthly", required_dimensions: "Originating Entity, Partner Entity, IC Account", risk_rank: "", status: "Confirmed" }, provenance: "Close process walkthrough · Cross-ref: Account Analysis (d-005-01)" },
      { row_id: "rpt-23", cells: { id: "O-06", report: "Manual Journal Entry Report", category: "Operational", sub_segment: "All", user_group: "Controller", frequency: "Monthly", required_dimensions: "Preparer, Account, Recurring/Non-recurring, SOX ref", risk_rank: "", status: "Confirmed" }, provenance: "Close process walkthrough · Cross-ref: Account Analysis (d-005-01)" },
      { row_id: "rpt-24", cells: { id: "O-09", report: "Financial Close Checklist", category: "Operational", sub_segment: "All", user_group: "Accounting", frequency: "Monthly", required_dimensions: "Close Period, Task Category, Owner, SLA, Automation Status", risk_rank: "", status: "Confirmed" }, provenance: "Close process walkthrough · Cross-ref: Account Analysis (d-005-01)" },
    ],
    insight_cards: [
      { kind: "risk", text: "6 of 28 reports (21%) rely on manual/spreadsheet processes — transformation priority" },
      { kind: "finding", text: "3 reports require dimensions not on current code block (Accident Year, State, NAIC Line)" },
      { kind: "info", text: "28 reports cataloged across Statutory/SEC (14), Management (10), Operational (4)" },
      { kind: "risk", text: "Top 3 transformation risks: Schedule P (#1), LDTI Disclosures (#2), Insurance Expense Exhibit (#3)" },
    ],
    activity: [
      { step: 1, label: "Loaded reporting inventory", detail: "28 reports · 3 categories · Statutory/SEC, Management, Operational", status: "complete", duration_ms: 380 },
      { step: 2, label: "Classified by sub-segment", detail: "P&C (9), All Lines (16), Life (1), Reinsurance (2)", status: "complete", duration_ms: 520 },
      { step: 3, label: "Mapped dimension requirements", detail: "Cross-referenced against 42 COA dimensions · 7 hierarchies", status: "complete", duration_ms: 1840 },
      { step: 4, label: "Assessed transformation risk", detail: "5 AT RISK reports identified · 3 COA dimension gaps flagged", status: "complete", duration_ms: 960 },
    ],
  },

  "d-006-06": {
    deliverable_id: "d-006-06",
    agent_kind: "data_grounded",
    run_state: "preflight",
    agent_live: true,
    agent_prompt: "Generate a GAAP income statement from the GL posting data for the full fiscal year (periods 1-12). Break it down by line of business. Show total revenue, total expenses, and net income. Then analyze the loss ratio by LOB and highlight any unusual patterns or areas of concern for the finance transformation.",
    preflight_title: "GAAP Income Statement",
    preflight_bullets: [
      "Generate P&L from 1M+ GL posting lines across 12 fiscal periods",
      "Revenue and expense classification by account group",
      "Line of business breakdown (AUTO, HOME, COMML, WC)",
      "Loss ratio analysis and pattern detection",
      "Dimensional quality assessment for reporting readiness",
    ],
    preflight_data_source: "DuckDB · 1,064,838 posting lines · FY2025",
    columns: [],
    rows: [],
    insight_cards: [],
    activity: [],
  },
};

// ── Process areas for workshop PA picker ──────────────────────────

export interface ProcessArea {
  pa_id: string;
  name: string;
  process_area: string;
}

export const PROCESS_AREAS: ProcessArea[] = [
  { pa_id: "PA-01", name: "Chart of Accounts & Org Structure", process_area: "Foundation" },
  { pa_id: "PA-02", name: "General Ledger & Multi-Basis Accounting", process_area: "Foundation" },
  { pa_id: "PA-03", name: "Premium Accounting & Revenue Recognition", process_area: "Insurance Core" },
  { pa_id: "PA-04", name: "Loss & Claims Accounting", process_area: "Insurance Core" },
  { pa_id: "PA-05", name: "Ceded Reinsurance Accounting", process_area: "Insurance Core" },
  { pa_id: "PA-06", name: "Assumed Reinsurance Accounting", process_area: "Insurance Core" },
  { pa_id: "PA-07", name: "Policyholder Liabilities & Reserves", process_area: "Insurance Core" },
  { pa_id: "PA-08", name: "Investment Accounting Interface", process_area: "Insurance Core" },
  { pa_id: "PA-09", name: "Accounts Payable & Commission Payments", process_area: "Operational Finance" },
  { pa_id: "PA-10", name: "Accounts Receivable & Premium Collections", process_area: "Operational Finance" },
  { pa_id: "PA-11", name: "Intercompany & Pooling", process_area: "Operational Finance" },
  { pa_id: "PA-12", name: "Fixed Assets & Leases", process_area: "Operational Finance" },
  { pa_id: "PA-13", name: "Cash Management & Treasury", process_area: "Operational Finance" },
  { pa_id: "PA-14", name: "Expense Management & Cost Allocation", process_area: "Operational Finance" },
  { pa_id: "PA-15", name: "Financial Close & Consolidation", process_area: "Close & Reporting" },
  { pa_id: "PA-16", name: "Statutory & Regulatory Reporting", process_area: "Close & Reporting" },
  { pa_id: "PA-17", name: "GAAP/IFRS External Reporting", process_area: "Close & Reporting" },
  { pa_id: "PA-18", name: "Tax Accounting & Compliance", process_area: "Close & Reporting" },
  { pa_id: "PA-19", name: "Management Reporting & Analytics", process_area: "Close & Reporting" },
  { pa_id: "PA-20", name: "Data Integration & Sub-Ledger Interfaces", process_area: "Foundation" },
];

/** Workshop eligibility: any deliverable in ws-004 (Requirements & Design) */
export function isWorkshopEligible(deliverableId: string): boolean {
  return deliverableId.startsWith("d-004-");
}
