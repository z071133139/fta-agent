"""Tests for outcome schemas: Pydantic models + Polars schema dicts."""

from __future__ import annotations

import json
from datetime import date

import polars as pl
import pytest

from fta_agent.data.outcomes import (
    ACCOUNT_MAPPING_SCHEMA,
    ACCOUNT_PROFILE_SCHEMA,
    ANALYSIS_FINDING_SCHEMA,
    DIMENSIONAL_DECISION_SCHEMA,
    MJE_PATTERN_SCHEMA,
    RECONCILIATION_RESULT_SCHEMA,
    TARGET_ACCOUNT_SCHEMA,
    AccountMapping,
    AccountProfile,
    AnalysisFinding,
    DecisionStatus,
    DimensionalDecision,
    FindingCategory,
    FindingSeverity,
    MappingConfidence,
    MappingStatus,
    MJEPattern,
    MJEPatternType,
    OptimizationStatus,
    RecommendationCategory,
    ReconciliationResult,
    TargetAccount,
)

# ---------------------------------------------------------------------------
# Fixtures: valid sample data for each model
# ---------------------------------------------------------------------------


@pytest.fixture()
def sample_account_profile() -> dict[str, object]:
    return {
        "gl_account": "100100",
        "description": "Cash - Operating Account",
        "account_type": "A",
        "first_posting": date(2023, 1, 15),
        "last_posting": date(2024, 11, 30),
        "posting_count": 1250,
        "period_count": 23,
        "avg_monthly_volume": 54.3,
        "total_debit": 5_000_000.00,
        "total_credit": 4_800_000.00,
        "avg_balance": 200_000.00,
        "balance_direction": "D",
        "top_counterparties": json.dumps(["200100", "300200", "400100"]),
        "profit_centers_used": json.dumps(["PC-AUTO", "PC-HOME"]),
        "cost_centers_used": json.dumps(["CC-001"]),
        "segments_used": json.dumps(["SEG-PC"]),
        "has_seasonal_pattern": False,
        "is_mje_target": False,
        "configured_type": "A",
        "classification_match": True,
        "is_active": True,
    }


@pytest.fixture()
def sample_finding() -> dict[str, object]:
    return {
        "finding_id": "F-001",
        "category": FindingCategory.INACTIVE_ACCOUNT,
        "severity": FindingSeverity.MEDIUM,
        "title": "823 inactive accounts detected",
        "detail": "These accounts have no postings in 12+ months.",
        "affected_accounts": json.dumps(["100200", "100300"]),
        "affected_count": 823,
        "recommendation": "Review for deactivation or archival.",
        "recommendation_category": RecommendationCategory.WORTH_IT,
        "coa_design_link": None,
        "status": "open",
        "resolution": None,
    }


@pytest.fixture()
def sample_decision() -> dict[str, object]:
    return {
        "decision_id": "DIM-PC-001",
        "dimension": "profit_center",
        "acdoca_field": "PRCTR",
        "design_choice": "Profit center represents Line of Business",
        "rationale": "LOB is the primary P&L segmentation for P&C carriers.",
        "alternatives_considered": json.dumps(
            [
                {"option": "Region", "pros": "State reporting", "cons": "Too granular"},
                {
                    "option": "LOB+Region combo",
                    "pros": "Full view",
                    "cons": "Explosion",
                },
            ]
        ),
        "downstream_impacts": json.dumps(
            ["Segment derives from PC", "State must use COPA or custom field"]
        ),
        "status": DecisionStatus.PROPOSED,
        "decided_by": None,
        "decided_date": None,
        "revision_history": None,
    }


@pytest.fixture()
def sample_target_account() -> dict[str, object]:
    return {
        "gl_account": "210100",
        "description": "Loss Reserves - Case - Auto",
        "account_type": "L",
        "account_group": "RESV",
        "naic_line": "19.1",
        "statutory_category": "Losses",
        "functional_area": "CLAIMS",
        "design_rationale": "Separate case reserves by LOB per NAIC requirements.",
        "source_accounts": json.dumps(["2101", "2102"]),
        "is_new": False,
        "recommendation_category": RecommendationCategory.MUST_DO,
    }


@pytest.fixture()
def sample_mapping() -> dict[str, object]:
    return {
        "mapping_id": "MAP-001",
        "legacy_account": "2101",
        "legacy_description": "Loss Reserve - Auto Combined",
        "target_account": "210100",
        "target_description": "Loss Reserves - Case - Auto",
        "confidence": MappingConfidence.HIGH,
        "mapping_rationale": "Direct 1:1 mapping, same account purpose.",
        "is_split": False,
        "is_merge": False,
        "status": MappingStatus.AUTO_SUGGESTED,
        "validated_by": None,
    }


@pytest.fixture()
def sample_mje_pattern() -> dict[str, object]:
    return {
        "pattern_id": "MJE-001",
        "pattern_type": MJEPatternType.RECURRING_IDENTICAL,
        "title": "Monthly reserve reclassification",
        "detail": "Same debit/credit pair posted every month for reserve adjustments.",
        "accounts_involved": json.dumps(["210100", "210200"]),
        "frequency": "monthly",
        "preparer_ids": json.dumps(["JSMITH"]),
        "is_single_preparer": True,
        "avg_amount": 125_000.00,
        "annual_occurrences": 12,
        "annual_dollar_volume": 1_500_000.00,
        "root_cause": "Legacy system lacks automatic reserve reclassification.",
        "coa_design_link": "DIM-PC-001",
        "optimization_status": OptimizationStatus.ELIMINABLE,
        "estimated_entries_eliminated": 12,
    }


@pytest.fixture()
def sample_reconciliation() -> dict[str, object]:
    return {
        "legacy_account": "2101",
        "legacy_balance": 500_000.00,
        "target_account": "210100",
        "target_balance": 500_000.00,
        "difference": 0.00,
        "is_reconciled": True,
        "variance_explanation": None,
    }


# ---------------------------------------------------------------------------
# Test: Pydantic models instantiate with valid data
# ---------------------------------------------------------------------------


class TestPydanticInstantiation:
    def test_account_profile(
        self, sample_account_profile: dict[str, object]
    ) -> None:
        profile = AccountProfile(**sample_account_profile)
        assert profile.gl_account == "100100"
        assert profile.is_active is True

    def test_analysis_finding(self, sample_finding: dict[str, object]) -> None:
        finding = AnalysisFinding(**sample_finding)
        assert finding.finding_id == "F-001"
        assert finding.category == FindingCategory.INACTIVE_ACCOUNT

    def test_dimensional_decision(
        self, sample_decision: dict[str, object]
    ) -> None:
        decision = DimensionalDecision(**sample_decision)
        assert decision.decision_id == "DIM-PC-001"
        assert decision.status == DecisionStatus.PROPOSED

    def test_target_account(
        self, sample_target_account: dict[str, object]
    ) -> None:
        account = TargetAccount(**sample_target_account)
        assert account.gl_account == "210100"
        assert account.is_new is False

    def test_account_mapping(self, sample_mapping: dict[str, object]) -> None:
        mapping = AccountMapping(**sample_mapping)
        assert mapping.mapping_id == "MAP-001"
        assert mapping.confidence == MappingConfidence.HIGH

    def test_mje_pattern(self, sample_mje_pattern: dict[str, object]) -> None:
        pattern = MJEPattern(**sample_mje_pattern)
        assert pattern.pattern_id == "MJE-001"
        assert pattern.is_single_preparer is True

    def test_reconciliation_result(
        self, sample_reconciliation: dict[str, object]
    ) -> None:
        result = ReconciliationResult(**sample_reconciliation)
        assert result.is_reconciled is True
        assert result.difference == 0.00


# ---------------------------------------------------------------------------
# Test: Pydantic models reject invalid enum values
# ---------------------------------------------------------------------------


class TestEnumValidation:
    def test_finding_rejects_invalid_severity(
        self, sample_finding: dict[str, object]
    ) -> None:
        data = {**sample_finding, "severity": "INVALID"}
        with pytest.raises(Exception):  # noqa: B017
            AnalysisFinding(**data)

    def test_finding_rejects_invalid_category(
        self, sample_finding: dict[str, object]
    ) -> None:
        data = {**sample_finding, "category": "BOGUS"}
        with pytest.raises(Exception):  # noqa: B017
            AnalysisFinding(**data)

    def test_decision_rejects_invalid_status(
        self, sample_decision: dict[str, object]
    ) -> None:
        data = {**sample_decision, "status": "NOPE"}
        with pytest.raises(Exception):  # noqa: B017
            DimensionalDecision(**data)

    def test_mapping_rejects_invalid_confidence(
        self, sample_mapping: dict[str, object]
    ) -> None:
        data = {**sample_mapping, "confidence": "SUPER_HIGH"}
        with pytest.raises(Exception):  # noqa: B017
            AccountMapping(**data)

    def test_mapping_rejects_invalid_status(
        self, sample_mapping: dict[str, object]
    ) -> None:
        data = {**sample_mapping, "status": "UNKNOWN"}
        with pytest.raises(Exception):  # noqa: B017
            AccountMapping(**data)

    def test_mje_rejects_invalid_pattern_type(
        self, sample_mje_pattern: dict[str, object]
    ) -> None:
        data = {**sample_mje_pattern, "pattern_type": "RANDOM"}
        with pytest.raises(Exception):  # noqa: B017
            MJEPattern(**data)

    def test_mje_rejects_invalid_optimization_status(
        self, sample_mje_pattern: dict[str, object]
    ) -> None:
        data = {**sample_mje_pattern, "optimization_status": "MAGIC"}
        with pytest.raises(Exception):  # noqa: B017
            MJEPattern(**data)

    def test_target_rejects_invalid_recommendation(
        self, sample_target_account: dict[str, object]
    ) -> None:
        data = {**sample_target_account, "recommendation_category": "YOLO"}
        with pytest.raises(Exception):  # noqa: B017
            TargetAccount(**data)


# ---------------------------------------------------------------------------
# Test: Polars schemas construct valid empty DataFrames
# ---------------------------------------------------------------------------

ALL_SCHEMAS = [
    ("ACCOUNT_PROFILE_SCHEMA", ACCOUNT_PROFILE_SCHEMA),
    ("ANALYSIS_FINDING_SCHEMA", ANALYSIS_FINDING_SCHEMA),
    ("DIMENSIONAL_DECISION_SCHEMA", DIMENSIONAL_DECISION_SCHEMA),
    ("TARGET_ACCOUNT_SCHEMA", TARGET_ACCOUNT_SCHEMA),
    ("ACCOUNT_MAPPING_SCHEMA", ACCOUNT_MAPPING_SCHEMA),
    ("MJE_PATTERN_SCHEMA", MJE_PATTERN_SCHEMA),
    ("RECONCILIATION_RESULT_SCHEMA", RECONCILIATION_RESULT_SCHEMA),
]


class TestPolarsSchemas:
    @pytest.mark.parametrize(
        ("schema_name", "schema"),
        ALL_SCHEMAS,
        ids=[s[0] for s in ALL_SCHEMAS],
    )
    def test_empty_dataframe_constructs(
        self, schema_name: str, schema: dict[str, pl.DataType]
    ) -> None:
        df = pl.DataFrame(schema=schema)
        assert len(df) == 0
        assert set(df.columns) == set(schema.keys())


# ---------------------------------------------------------------------------
# Test: Polars schema field names match Pydantic model fields
# ---------------------------------------------------------------------------

MODEL_SCHEMA_PAIRS = [
    (AccountProfile, ACCOUNT_PROFILE_SCHEMA, "AccountProfile"),
    (AnalysisFinding, ANALYSIS_FINDING_SCHEMA, "AnalysisFinding"),
    (DimensionalDecision, DIMENSIONAL_DECISION_SCHEMA, "DimensionalDecision"),
    (TargetAccount, TARGET_ACCOUNT_SCHEMA, "TargetAccount"),
    (AccountMapping, ACCOUNT_MAPPING_SCHEMA, "AccountMapping"),
    (MJEPattern, MJE_PATTERN_SCHEMA, "MJEPattern"),
    (ReconciliationResult, RECONCILIATION_RESULT_SCHEMA, "ReconciliationResult"),
]


class TestSchemaFieldAlignment:
    @pytest.mark.parametrize(
        ("model", "schema", "name"),
        MODEL_SCHEMA_PAIRS,
        ids=[p[2] for p in MODEL_SCHEMA_PAIRS],
    )
    def test_fields_match(
        self,
        model: type,
        schema: dict[str, pl.DataType],
        name: str,
    ) -> None:
        pydantic_fields = set(model.model_fields.keys())
        polars_fields = set(schema.keys())
        assert pydantic_fields == polars_fields, (
            f"{name}: Pydantic fields {pydantic_fields - polars_fields} "
            f"missing from Polars schema; Polars fields "
            f"{polars_fields - pydantic_fields} missing from Pydantic model"
        )


# ---------------------------------------------------------------------------
# Test: JSON list fields round-trip correctly
# ---------------------------------------------------------------------------


class TestJsonRoundTrip:
    def test_account_profile_json_lists(
        self, sample_account_profile: dict[str, object]
    ) -> None:
        profile = AccountProfile(**sample_account_profile)
        counterparties = json.loads(profile.top_counterparties)
        assert isinstance(counterparties, list)
        assert len(counterparties) == 3
        assert "200100" in counterparties

    def test_finding_affected_accounts(
        self, sample_finding: dict[str, object]
    ) -> None:
        finding = AnalysisFinding(**sample_finding)
        accounts = json.loads(finding.affected_accounts)
        assert isinstance(accounts, list)
        assert "100200" in accounts

    def test_decision_alternatives(
        self, sample_decision: dict[str, object]
    ) -> None:
        decision = DimensionalDecision(**sample_decision)
        alternatives = json.loads(decision.alternatives_considered)
        assert isinstance(alternatives, list)
        assert len(alternatives) == 2
        assert alternatives[0]["option"] == "Region"

    def test_decision_downstream_impacts(
        self, sample_decision: dict[str, object]
    ) -> None:
        decision = DimensionalDecision(**sample_decision)
        impacts = json.loads(decision.downstream_impacts)
        assert isinstance(impacts, list)
        assert len(impacts) == 2

    def test_mje_accounts_and_preparers(
        self, sample_mje_pattern: dict[str, object]
    ) -> None:
        pattern = MJEPattern(**sample_mje_pattern)
        accounts = json.loads(pattern.accounts_involved)
        assert isinstance(accounts, list)
        assert "210100" in accounts
        preparers = json.loads(pattern.preparer_ids)
        assert preparers == ["JSMITH"]

    def test_target_account_source_accounts(
        self, sample_target_account: dict[str, object]
    ) -> None:
        account = TargetAccount(**sample_target_account)
        assert account.source_accounts is not None
        sources = json.loads(account.source_accounts)
        assert isinstance(sources, list)
        assert "2101" in sources
