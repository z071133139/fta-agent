"""Outcome schemas: the structured deliverables the agent produces.

Defines 6 key outcomes as Pydantic models (validation/serialization) and
Polars schema dicts (DataFrame/DuckDB storage). Each outcome represents a
concrete artifact of the COA design engagement.

Outcomes:
    1. Current State Analysis (AccountProfile + AnalysisFinding)
    2. Code Block Design (DimensionalDecision)
    3. Target COA (TargetAccount)
    4. Account Mapping (AccountMapping)
    5. MJE Analysis (MJEPattern)
    6. Validation (ReconciliationResult)
"""

from __future__ import annotations

from datetime import date
from enum import StrEnum

import polars as pl
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class FindingSeverity(StrEnum):
    """Impact level for analysis findings."""

    CRITICAL = "CRIT"  # Blocks design, regulatory risk
    HIGH = "HIGH"  # Significant impact, should address
    MEDIUM = "MED"  # Worth addressing, not blocking
    LOW = "LOW"  # Minor, cosmetic, or optional
    INFO = "INFO"  # Observation, no action needed


class FindingCategory(StrEnum):
    """Classification of analysis findings."""

    INACTIVE_ACCOUNT = "INACTIVE"
    DIMENSIONAL_GAP = "DIM_GAP"
    STRUCTURAL_ISSUE = "STRUCTURE"
    REGULATORY_GAP = "REG_GAP"
    CLASSIFICATION_MISMATCH = "CLASSIF"
    NAMING_INCONSISTENCY = "NAMING"
    DUPLICATE_ACCOUNT = "DUPLICATE"
    MJE_ROOT_CAUSE = "MJE_ROOT"


class DecisionStatus(StrEnum):
    """Status of a dimensional design decision."""

    PROPOSED = "PROPOSED"
    PENDING_BUSINESS = "PENDING"  # Waiting on client input
    DECIDED = "DECIDED"
    REVISED = "REVISED"


class MappingConfidence(StrEnum):
    """Confidence level for account mappings."""

    HIGH = "HIGH"  # Auto-mapped, high certainty
    MEDIUM = "MED"  # Likely match, needs validation
    LOW = "LOW"  # Uncertain, manual review needed


class MappingStatus(StrEnum):
    """Status of an account mapping."""

    AUTO_SUGGESTED = "AUTO"
    VALIDATED = "VALIDATED"
    REJECTED = "REJECTED"
    MANUAL = "MANUAL"


class MJEPatternType(StrEnum):
    """Classification of manual journal entry patterns."""

    RECURRING_IDENTICAL = "RECUR_ID"
    RECURRING_TEMPLATE = "RECUR_TPL"
    RECLASSIFICATION = "RECLASS"
    INTERCOMPANY = "IC"
    ACCRUAL_REVERSAL = "ACCREV"
    CORRECTION = "CORRECT"
    CONSOLIDATION = "CONSOL"


class OptimizationStatus(StrEnum):
    """Optimization potential for MJE patterns."""

    ELIMINABLE = "ELIM"  # COA redesign removes it
    AUTOMATABLE = "AUTO"  # Can be automated in target ERP
    RESIDUAL = "RESIDUAL"  # Legitimate, stays in new world


class RecommendationCategory(StrEnum):
    """Priority framework for recommendations."""

    MUST_DO = "MUST_DO"
    WORTH_IT = "WORTH_IT"
    PARK_IT = "PARK_IT"
    DONT_TOUCH = "DONT_TOUCH"


# ---------------------------------------------------------------------------
# Outcome 1: Current State Analysis
# ---------------------------------------------------------------------------


class AccountProfile(BaseModel):
    """Pre-computed profile for a single GL account."""

    gl_account: str
    description: str
    account_type: str  # A/L/E/R/X
    first_posting: date
    last_posting: date
    posting_count: int
    period_count: int
    avg_monthly_volume: float
    total_debit: float
    total_credit: float
    avg_balance: float
    balance_direction: str  # "D" / "C" / "MIXED"
    top_counterparties: str  # JSON list of top 5 offsetting accounts
    profit_centers_used: str  # JSON list of distinct PCs posted
    cost_centers_used: str  # JSON list of distinct CCs posted
    segments_used: str  # JSON list of distinct segments posted
    has_seasonal_pattern: bool
    is_mje_target: bool
    configured_type: str  # Account type from master
    classification_match: bool  # Configured type matches observed behavior
    is_active: bool


class AnalysisFinding(BaseModel):
    """Individual finding surfaced by current state analysis."""

    finding_id: str  # e.g., "F-001"
    category: FindingCategory
    severity: FindingSeverity
    title: str
    detail: str
    affected_accounts: str  # JSON list of GL account numbers
    affected_count: int
    recommendation: str
    recommendation_category: RecommendationCategory
    coa_design_link: str | None = None
    status: str  # "open" / "flagged" / "in_progress" / "resolved"
    resolution: str | None = None


# ---------------------------------------------------------------------------
# Outcome 2: Code Block Design
# ---------------------------------------------------------------------------


class DimensionalDecision(BaseModel):
    """Design decision for a single code block dimension."""

    decision_id: str  # e.g., "DIM-PC-001"
    dimension: str  # profit_center, segment, functional_area, etc.
    acdoca_field: str | None = None  # SAP field name (PRCTR, SEGMENT, etc.)
    design_choice: str
    rationale: str
    alternatives_considered: str  # JSON list of alternatives with pros/cons
    downstream_impacts: str  # JSON list of cascading effects
    status: DecisionStatus
    decided_by: str | None = None
    decided_date: date | None = None
    revision_history: str | None = None  # JSON list of prior decisions


# ---------------------------------------------------------------------------
# Outcome 3: Target COA
# ---------------------------------------------------------------------------


class TargetAccount(BaseModel):
    """Single account in the target chart of accounts."""

    gl_account: str
    description: str
    account_type: str  # A/L/E/R/X
    account_group: str
    naic_line: str | None = None
    statutory_category: str | None = None
    functional_area: str | None = None
    design_rationale: str | None = None
    source_accounts: str | None = None  # JSON list of legacy accounts
    is_new: bool
    recommendation_category: RecommendationCategory


# ---------------------------------------------------------------------------
# Outcome 4: Account Mapping
# ---------------------------------------------------------------------------


class AccountMapping(BaseModel):
    """Old-to-new account crosswalk entry."""

    mapping_id: str
    legacy_account: str
    legacy_description: str
    target_account: str
    target_description: str
    confidence: MappingConfidence
    mapping_rationale: str
    is_split: bool  # One legacy maps to multiple targets
    is_merge: bool  # Multiple legacy maps to one target
    status: MappingStatus
    validated_by: str | None = None


# ---------------------------------------------------------------------------
# Outcome 5: MJE Analysis
# ---------------------------------------------------------------------------


class MJEPattern(BaseModel):
    """Detected manual journal entry pattern."""

    pattern_id: str  # e.g., "MJE-001"
    pattern_type: MJEPatternType
    title: str
    detail: str
    accounts_involved: str  # JSON list of GL accounts
    frequency: str  # "monthly" / "quarterly" / "annual" / "irregular"
    preparer_ids: str  # JSON list of user IDs
    is_single_preparer: bool
    avg_amount: float
    annual_occurrences: int
    annual_dollar_volume: float
    root_cause: str
    coa_design_link: str | None = None
    optimization_status: OptimizationStatus
    estimated_entries_eliminated: int


# ---------------------------------------------------------------------------
# Outcome 6: Validation (schema only — not implemented in V1)
# ---------------------------------------------------------------------------


class ReconciliationResult(BaseModel):
    """Per-account OLD=NEW reconciliation proof."""

    legacy_account: str
    legacy_balance: float
    target_account: str
    target_balance: float
    difference: float
    is_reconciled: bool
    variance_explanation: str | None = None


# ---------------------------------------------------------------------------
# Polars schemas (for DataFrame construction and DuckDB storage)
# ---------------------------------------------------------------------------

ACCOUNT_PROFILE_SCHEMA = {
    "gl_account": pl.Utf8,
    "description": pl.Utf8,
    "account_type": pl.Utf8,
    "first_posting": pl.Date,
    "last_posting": pl.Date,
    "posting_count": pl.Int32,
    "period_count": pl.Int32,
    "avg_monthly_volume": pl.Float64,
    "total_debit": pl.Float64,
    "total_credit": pl.Float64,
    "avg_balance": pl.Float64,
    "balance_direction": pl.Utf8,
    "top_counterparties": pl.Utf8,
    "profit_centers_used": pl.Utf8,
    "cost_centers_used": pl.Utf8,
    "segments_used": pl.Utf8,
    "has_seasonal_pattern": pl.Boolean,
    "is_mje_target": pl.Boolean,
    "configured_type": pl.Utf8,
    "classification_match": pl.Boolean,
    "is_active": pl.Boolean,
}

ANALYSIS_FINDING_SCHEMA = {
    "finding_id": pl.Utf8,
    "category": pl.Utf8,
    "severity": pl.Utf8,
    "title": pl.Utf8,
    "detail": pl.Utf8,
    "affected_accounts": pl.Utf8,
    "affected_count": pl.Int32,
    "recommendation": pl.Utf8,
    "recommendation_category": pl.Utf8,
    "coa_design_link": pl.Utf8,
    "status": pl.Utf8,
    "resolution": pl.Utf8,
}

DIMENSIONAL_DECISION_SCHEMA = {
    "decision_id": pl.Utf8,
    "dimension": pl.Utf8,
    "acdoca_field": pl.Utf8,
    "design_choice": pl.Utf8,
    "rationale": pl.Utf8,
    "alternatives_considered": pl.Utf8,
    "downstream_impacts": pl.Utf8,
    "status": pl.Utf8,
    "decided_by": pl.Utf8,
    "decided_date": pl.Date,
    "revision_history": pl.Utf8,
}

TARGET_ACCOUNT_SCHEMA = {
    "gl_account": pl.Utf8,
    "description": pl.Utf8,
    "account_type": pl.Utf8,
    "account_group": pl.Utf8,
    "naic_line": pl.Utf8,
    "statutory_category": pl.Utf8,
    "functional_area": pl.Utf8,
    "design_rationale": pl.Utf8,
    "source_accounts": pl.Utf8,
    "is_new": pl.Boolean,
    "recommendation_category": pl.Utf8,
}

ACCOUNT_MAPPING_SCHEMA = {
    "mapping_id": pl.Utf8,
    "legacy_account": pl.Utf8,
    "legacy_description": pl.Utf8,
    "target_account": pl.Utf8,
    "target_description": pl.Utf8,
    "confidence": pl.Utf8,
    "mapping_rationale": pl.Utf8,
    "is_split": pl.Boolean,
    "is_merge": pl.Boolean,
    "status": pl.Utf8,
    "validated_by": pl.Utf8,
}

MJE_PATTERN_SCHEMA = {
    "pattern_id": pl.Utf8,
    "pattern_type": pl.Utf8,
    "title": pl.Utf8,
    "detail": pl.Utf8,
    "accounts_involved": pl.Utf8,
    "frequency": pl.Utf8,
    "preparer_ids": pl.Utf8,
    "is_single_preparer": pl.Boolean,
    "avg_amount": pl.Float64,
    "annual_occurrences": pl.Int32,
    "annual_dollar_volume": pl.Float64,
    "root_cause": pl.Utf8,
    "coa_design_link": pl.Utf8,
    "optimization_status": pl.Utf8,
    "estimated_entries_eliminated": pl.Int32,
}

RECONCILIATION_RESULT_SCHEMA = {
    "legacy_account": pl.Utf8,
    "legacy_balance": pl.Float64,
    "target_account": pl.Utf8,
    "target_balance": pl.Float64,
    "difference": pl.Float64,
    "is_reconciled": pl.Boolean,
    "variance_explanation": pl.Utf8,
}
