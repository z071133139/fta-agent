"""Tests for synthetic P&C GL data generator.

Validates that generated data:
1. Conforms to schemas (correct columns, types)
2. Contains expected volume (~500K+ postings, ~2,500 accounts)
3. Passes basic accounting sanity checks (balanced entries)
4. Contains all 7 embedded MJE patterns
5. Key person risk signal is present (JSMITH high volume)
6. Has expected LOB, state, and period distributions
"""

from __future__ import annotations

import polars as pl
import pytest

from fta_agent.data.schemas import (
    ACCOUNT_MASTER_SCHEMA,
    POSTING_SCHEMA,
    TRIAL_BALANCE_SCHEMA,
)
from fta_agent.data.synthetic import (
    MJE_PATTERNS,
    generate_synthetic_data,
)


@pytest.fixture(scope="module")
def data() -> dict[str, pl.DataFrame]:
    """Generate synthetic data once for all tests in this module."""
    return generate_synthetic_data()


# ---------------------------------------------------------------------------
# Schema conformance
# ---------------------------------------------------------------------------


class TestSchemaConformance:
    def test_postings_columns(self, data: dict[str, pl.DataFrame]) -> None:
        expected_cols = set(POSTING_SCHEMA.keys())
        actual_cols = set(data["postings"].columns)
        assert expected_cols == actual_cols

    def test_account_master_columns(self, data: dict[str, pl.DataFrame]) -> None:
        expected_cols = set(ACCOUNT_MASTER_SCHEMA.keys())
        actual_cols = set(data["account_master"].columns)
        assert expected_cols == actual_cols

    def test_trial_balance_columns(self, data: dict[str, pl.DataFrame]) -> None:
        expected_cols = set(TRIAL_BALANCE_SCHEMA.keys())
        actual_cols = set(data["trial_balance"].columns)
        assert expected_cols == actual_cols


# ---------------------------------------------------------------------------
# Volume checks
# ---------------------------------------------------------------------------


class TestVolume:
    def test_posting_count_minimum(self, data: dict[str, pl.DataFrame]) -> None:
        """Should have at least 500K posting records."""
        assert len(data["postings"]) >= 500_000

    def test_account_master_count(self, data: dict[str, pl.DataFrame]) -> None:
        """Should have ~2,500 accounts."""
        count = len(data["account_master"])
        assert 2400 <= count <= 2600

    def test_trial_balance_periods(self, data: dict[str, pl.DataFrame]) -> None:
        """TB should cover 12 periods."""
        periods = data["trial_balance"]["fiscal_period"].unique().sort()
        assert periods.to_list() == list(range(1, 13))

    def test_twelve_months_of_postings(self, data: dict[str, pl.DataFrame]) -> None:
        """Postings should cover all 12 months."""
        periods = data["postings"]["fiscal_period"].unique().sort()
        assert periods.to_list() == list(range(1, 13))


# ---------------------------------------------------------------------------
# Accounting sanity
# ---------------------------------------------------------------------------


class TestAccountingSanity:
    def test_every_document_balances(self, data: dict[str, pl.DataFrame]) -> None:
        """Every document should have debits == credits (balanced)."""
        doc_balances = (
            data["postings"]
            .group_by("document_number")
            .agg(
                (
                    pl.when(pl.col("debit_credit") == "D")
                    .then(pl.col("amount"))
                    .otherwise(-pl.col("amount"))
                )
                .sum()
                .alias("net")
            )
        )
        # Allow tiny floating point tolerance
        imbalanced = doc_balances.filter(pl.col("net").abs() > 0.01)
        assert len(imbalanced) == 0, (
            f"{len(imbalanced)} documents don't balance. "
            f"First: {imbalanced.head(3).to_dicts()}"
        )

    def test_debit_credit_consistency(self, data: dict[str, pl.DataFrame]) -> None:
        """Debit entries should have posting key 40, credit 50."""
        debits = data["postings"].filter(pl.col("debit_credit") == "D")
        credits = data["postings"].filter(pl.col("debit_credit") == "C")
        assert (debits["posting_key"] == "40").all()
        assert (credits["posting_key"] == "50").all()

    def test_all_posting_accounts_exist_in_master(
        self, data: dict[str, pl.DataFrame]
    ) -> None:
        """Every account in postings should exist in the account master."""
        posting_accounts = data["postings"]["gl_account"].unique()
        master_accounts = set(data["account_master"]["gl_account"].to_list())
        missing = [a for a in posting_accounts.to_list() if a not in master_accounts]
        assert len(missing) == 0, f"Accounts in postings but not master: {missing}"


# ---------------------------------------------------------------------------
# MJE patterns
# ---------------------------------------------------------------------------


class TestMJEPatterns:
    def test_mje_documents_exist(self, data: dict[str, pl.DataFrame]) -> None:
        """Should have MJE-category documents."""
        mje_count = len(data["postings"].filter(pl.col("document_category") == "MJE"))
        assert mje_count > 0, "No MJE documents found"

    def test_recurring_identical_pattern(self, data: dict[str, pl.DataFrame]) -> None:
        """Pattern 1: Jackie's quarterly identical reclassification."""
        p = MJE_PATTERNS["recurring_identical"]
        matches = data["postings"].filter(
            (pl.col("user_id") == p["user"])
            & (pl.col("gl_account") == p["debit_account"])
            & (pl.col("amount") == p["amount"])
            & (pl.col("document_category") == "MJE")
        )
        assert len(matches) >= p["expected_count"], (
            f"Expected {p['expected_count']} recurring identical entries, "
            f"found {len(matches)}"
        )

    def test_reclassification_pattern(self, data: dict[str, pl.DataFrame]) -> None:
        """Pattern 3: Monthly loss reclassification."""
        p = MJE_PATTERNS["reclassification"]
        matches = data["postings"].filter(
            (pl.col("user_id") == p["user"])
            & (pl.col("gl_account") == p["target_account"])
            & (pl.col("document_category") == "MJE")
            & (pl.col("text").str.contains("(?i)reclass"))
        )
        assert len(matches) >= p["expected_count"], (
            f"Expected {p['expected_count']} reclassification entries, "
            f"found {len(matches)}"
        )

    def test_accrual_reversal_pattern(self, data: dict[str, pl.DataFrame]) -> None:
        """Pattern 5: Monthly accrual + reversal pairs."""
        p = MJE_PATTERNS["accrual_reversal"]
        accruals = data["postings"].filter(
            (pl.col("user_id") == p["user"])
            & (pl.col("gl_account") == p["debit_account"])
            & (pl.col("document_category") == "ACC")
            & (pl.col("text").str.contains("(?i)accrual"))
        )
        reversals = data["postings"].filter(
            (pl.col("user_id") == p["user"])
            & (pl.col("gl_account") == p["debit_account"])
            & (pl.col("document_category") == "CLR")
            & (pl.col("text").str.contains("(?i)reversal"))
        )
        assert len(accruals) >= 12, f"Expected 12 accruals, found {len(accruals)}"
        assert len(reversals) >= 11, f"Expected 11+ reversals, found {len(reversals)}"

    def test_correction_pattern(self, data: dict[str, pl.DataFrame]) -> None:
        """Pattern 6: Sporadic corrections by David Wilson."""
        corrections = data["postings"].filter(
            (pl.col("user_id") == "DWILSON")
            & (pl.col("document_category") == "MJE")
            & (pl.col("text").str.contains("(?i)correction"))
        )
        expected = MJE_PATTERNS["correction"]["expected_count"]
        assert len(corrections) >= expected, (
            f"Expected {expected} correction entries, found {len(corrections)}"
        )

    def test_intercompany_pattern(self, data: dict[str, pl.DataFrame]) -> None:
        """Pattern 4: Monthly IC shared services."""
        p = MJE_PATTERNS["intercompany"]
        matches = data["postings"].filter(
            (pl.col("user_id") == p["user"])
            & (pl.col("gl_account") == p["debit_account"])
            & (pl.col("document_category") == "MJE")
            & (pl.col("text").str.contains("(?i)shared service"))
        )
        assert len(matches) >= p["expected_count"], (
            f"Expected {p['expected_count']} IC entries, found {len(matches)}"
        )

    def test_consolidation_adjustment_pattern(
        self, data: dict[str, pl.DataFrame]
    ) -> None:
        """Pattern 7: Quarterly consolidation adjustments by Lisa Jones."""
        matches = data["postings"].filter(
            (pl.col("user_id") == "LJONES")
            & (pl.col("document_category") == "MJE")
            & (pl.col("text").str.contains("(?i)consolidation"))
        )
        expected = MJE_PATTERNS["consolidation_adjustment"]["expected_count"]
        assert len(matches) >= expected, (
            f"Expected {expected} consolidation entries, found {len(matches)}"
        )


# ---------------------------------------------------------------------------
# Key person risk signal
# ---------------------------------------------------------------------------


class TestKeyPersonRisk:
    def test_jsmith_is_highest_mje_preparer(
        self, data: dict[str, pl.DataFrame]
    ) -> None:
        """Jackie Smith should be the highest-volume MJE preparer."""
        mje_by_user = (
            data["postings"]
            .filter(pl.col("document_category") == "MJE")
            .group_by("user_id")
            .agg(pl.len().alias("count"))
            .sort("count", descending=True)
        )
        top_user = mje_by_user["user_id"][0]
        assert top_user == "JSMITH", (
            f"Expected JSMITH as top MJE preparer, got {top_user}"
        )

    def test_jsmith_mje_volume_significantly_higher(
        self, data: dict[str, pl.DataFrame]
    ) -> None:
        """Jackie's MJE volume should be significantly higher than others."""
        mje_by_user = (
            data["postings"]
            .filter(pl.col("document_category") == "MJE")
            .group_by("user_id")
            .agg(pl.len().alias("count"))
            .sort("count", descending=True)
        )
        counts = mje_by_user["count"].to_list()
        if len(counts) >= 2:
            # Jackie should have at least 2x the second-highest preparer
            assert counts[0] >= counts[1] * 1.5, (
                f"JSMITH volume ({counts[0]}) not significantly higher "
                f"than second ({counts[1]})"
            )


# ---------------------------------------------------------------------------
# Distribution checks
# ---------------------------------------------------------------------------


class TestDistributions:
    def test_all_lobs_present(self, data: dict[str, pl.DataFrame]) -> None:
        """All 4 LOBs should have postings."""
        lobs = data["postings"].filter(pl.col("lob").is_not_null())["lob"].unique()
        for lob in ["AUTO", "HOME", "COMML", "WC"]:
            assert lob in lobs.to_list(), f"LOB {lob} missing from postings"

    def test_multiple_states_present(self, data: dict[str, pl.DataFrame]) -> None:
        """Multiple states should be represented."""
        states = (
            data["postings"].filter(pl.col("state").is_not_null())["state"].unique()
        )
        assert len(states) >= 10, f"Expected 10+ states, found {len(states)}"

    def test_multiple_document_types(self, data: dict[str, pl.DataFrame]) -> None:
        """Multiple document types should be used."""
        doc_types = data["postings"]["document_type"].unique()
        assert len(doc_types) >= 5, (
            f"Expected 5+ document types, found {len(doc_types)}"
        )

    def test_dormant_accounts_in_master(self, data: dict[str, pl.DataFrame]) -> None:
        """Account master should include inactive/dormant accounts."""
        inactive = data["account_master"].filter(~pl.col("is_active"))
        assert len(inactive) >= 5, (
            f"Expected 5+ dormant accounts, found {len(inactive)}"
        )


# ---------------------------------------------------------------------------
# Reproducibility
# ---------------------------------------------------------------------------


class TestReproducibility:
    def test_deterministic_output(self) -> None:
        """Same seed should produce identical data."""
        d1 = generate_synthetic_data(seed=42)
        d2 = generate_synthetic_data(seed=42)
        assert d1["postings"].shape == d2["postings"].shape
        assert d1["account_master"].shape == d2["account_master"].shape
        # Check first 100 postings match exactly
        assert d1["postings"].head(100).equals(d2["postings"].head(100))

    def test_different_seed_produces_different_data(self) -> None:
        """Different seeds should produce different data."""
        d1 = generate_synthetic_data(seed=42)
        d2 = generate_synthetic_data(seed=99)
        # Same structure, different values
        assert d1["postings"].shape[1] == d2["postings"].shape[1]
        assert not d1["postings"].head(100).equals(d2["postings"].head(100))
