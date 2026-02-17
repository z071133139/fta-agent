// ---------------------------------------------------------------------------
// Enums as string union types (matching Python StrEnum values)
// ---------------------------------------------------------------------------

export type FindingSeverity = "CRIT" | "HIGH" | "MED" | "LOW" | "INFO";

export type FindingCategory =
  | "INACTIVE"
  | "DIM_GAP"
  | "STRUCTURE"
  | "REG_GAP"
  | "CLASSIF"
  | "NAMING"
  | "DUPLICATE"
  | "MJE_ROOT";

export type DecisionStatus = "PROPOSED" | "PENDING" | "DECIDED" | "REVISED";

export type MappingConfidence = "HIGH" | "MED" | "LOW";

export type MappingStatus = "AUTO" | "VALIDATED" | "REJECTED" | "MANUAL";

export type MJEPatternType =
  | "RECUR_ID"
  | "RECUR_TPL"
  | "RECLASS"
  | "IC"
  | "ACCREV"
  | "CORRECT"
  | "CONSOL";

export type OptimizationStatus = "ELIM" | "AUTO" | "RESIDUAL";

export type RecommendationCategory =
  | "MUST_DO"
  | "WORTH_IT"
  | "PARK_IT"
  | "DONT_TOUCH";

export type FindingStatus = "open" | "flagged" | "in_progress" | "resolved";

// ---------------------------------------------------------------------------
// Outcome 1: Current State Analysis
// ---------------------------------------------------------------------------

export interface AccountProfile {
  gl_account: string;
  description: string;
  account_type: string; // A/L/E/R/X
  first_posting: string; // ISO date string
  last_posting: string; // ISO date string
  posting_count: number;
  period_count: number;
  avg_monthly_volume: number;
  total_debit: number;
  total_credit: number;
  avg_balance: number;
  balance_direction: string; // "D" / "C" / "MIXED"
  top_counterparties: string; // JSON list of top 5 offsetting accounts
  profit_centers_used: string; // JSON list of distinct PCs posted
  cost_centers_used: string; // JSON list of distinct CCs posted
  segments_used: string; // JSON list of distinct segments posted
  has_seasonal_pattern: boolean;
  is_mje_target: boolean;
  configured_type: string; // Account type from master
  classification_match: boolean; // Configured type matches observed behavior
  is_active: boolean;
}

export interface AnalysisFinding {
  finding_id: string; // e.g., "F-001"
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  detail: string;
  affected_accounts: string; // JSON list of GL account numbers
  affected_count: number;
  recommendation: string;
  recommendation_category: RecommendationCategory;
  coa_design_link: string | null;
  status: FindingStatus;
  resolution: string | null;
}

// ---------------------------------------------------------------------------
// Outcome 2: Code Block Design
// ---------------------------------------------------------------------------

export interface DimensionalDecision {
  decision_id: string; // e.g., "DIM-PC-001"
  dimension: string; // profit_center, segment, functional_area, etc.
  acdoca_field: string | null; // SAP field name (PRCTR, SEGMENT, etc.)
  design_choice: string;
  rationale: string;
  alternatives_considered: string; // JSON list of alternatives with pros/cons
  downstream_impacts: string; // JSON list of cascading effects
  status: DecisionStatus;
  decided_by: string | null;
  decided_date: string | null; // ISO date string
  revision_history: string | null; // JSON list of prior decisions
}

// ---------------------------------------------------------------------------
// Outcome 3: Target COA
// ---------------------------------------------------------------------------

export interface TargetAccount {
  gl_account: string;
  description: string;
  account_type: string; // A/L/E/R/X
  account_group: string;
  naic_line: string | null;
  statutory_category: string | null;
  functional_area: string | null;
  design_rationale: string | null;
  source_accounts: string | null; // JSON list of legacy accounts
  is_new: boolean;
  recommendation_category: RecommendationCategory;
}

// ---------------------------------------------------------------------------
// Outcome 4: Account Mapping
// ---------------------------------------------------------------------------

export interface AccountMapping {
  mapping_id: string;
  legacy_account: string;
  legacy_description: string;
  target_account: string;
  target_description: string;
  confidence: MappingConfidence;
  mapping_rationale: string;
  is_split: boolean; // One legacy maps to multiple targets
  is_merge: boolean; // Multiple legacy maps to one target
  status: MappingStatus;
  validated_by: string | null;
}

// ---------------------------------------------------------------------------
// Outcome 5: MJE Analysis
// ---------------------------------------------------------------------------

export interface MJEPattern {
  pattern_id: string; // e.g., "MJE-001"
  pattern_type: MJEPatternType;
  title: string;
  detail: string;
  accounts_involved: string; // JSON list of GL accounts
  frequency: string; // "monthly" / "quarterly" / "annual" / "irregular"
  preparer_ids: string; // JSON list of user IDs
  is_single_preparer: boolean;
  avg_amount: number;
  annual_occurrences: number;
  annual_dollar_volume: number;
  root_cause: string;
  coa_design_link: string | null;
  optimization_status: OptimizationStatus;
  estimated_entries_eliminated: number;
}

// ---------------------------------------------------------------------------
// Outcome 6: Validation
// ---------------------------------------------------------------------------

export interface ReconciliationResult {
  legacy_account: string;
  legacy_balance: number;
  target_account: string;
  target_balance: number;
  difference: number;
  is_reconciled: boolean;
  variance_explanation: string | null;
}
