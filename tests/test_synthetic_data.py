"""Tests for synthetic P&C GL data generator.

Validates that generated data:
1. Conforms to schemas (correct columns, types)
2. Contains expected volume (~1M+ postings, ~3,000+ accounts)
3. Passes basic accounting sanity checks (balanced entries)
4. Contains all 7 embedded MJE patterns
5. Key person risk signal is present (JSMITH high volume)
6. Has expected LOB, state, and period distributions
7. Insurance-specific dimensions are populated
8. Seasonal patterns, backdating, multi-line JEs, opening balances
9. Historical complexity (multi-source, effective dates, inactive ratio)
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
    NAIC_LINES,
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

    def test_new_posting_columns_exist(self, data: dict[str, pl.DataFrame]) -> None:
        """Verify new insurance-specific columns are present."""
        for col in [
            "financial_product", "statutory_line", "treaty_id",
            "claim_type", "distribution_channel", "policy_year",
        ]:
            assert col in data["postings"].columns, f"Missing column: {col}"

    def test_new_account_master_columns_exist(
        self, data: dict[str, pl.DataFrame]
    ) -> None:
        """Verify new account master columns are present."""
        for col in ["effective_from", "source_system"]:
            assert col in data["account_master"].columns, f"Missing column: {col}"


# ---------------------------------------------------------------------------
# Volume checks
# ---------------------------------------------------------------------------


class TestVolume:
    def test_posting_count_minimum(self, data: dict[str, pl.DataFrame]) -> None:
        """Should have at least 1M posting records."""
        assert len(data["postings"]) >= 1_000_000

    def test_account_master_count(self, data: dict[str, pl.DataFrame]) -> None:
        """Should have ~2,800-3,500 accounts."""
        count = len(data["account_master"])
        assert 2800 <= count <= 3500, f"Account count: {count}"

    def test_inactive_ratio(self, data: dict[str, pl.DataFrame]) -> None:
        """20-30% of accounts should be inactive."""
        total = len(data["account_master"])
        inactive = len(data["account_master"].filter(~pl.col("is_active")))
        ratio = inactive / total
        assert 0.15 <= ratio <= 0.35, (
            f"Inactive ratio: {ratio:.2%} ({inactive}/{total})"
        )

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
# Insurance-specific dimensions
# ---------------------------------------------------------------------------


class TestInsuranceDimensions:
    def test_financial_product_populated(
        self, data: dict[str, pl.DataFrame]
    ) -> None:
        """financial_product should be set on >=60% of premium/loss postings."""
        prem_loss = data["postings"].filter(
            pl.col("gl_account").str.starts_with("400")
            | pl.col("gl_account").str.starts_with("500")
            | pl.col("gl_account").str.starts_with("110")
        )
        populated = prem_loss.filter(pl.col("financial_product").is_not_null())
        ratio = len(populated) / max(len(prem_loss), 1)
        assert ratio >= 0.60, (
            f"financial_product populated on {ratio:.1%} of prem/loss postings"
        )

    def test_statutory_line_populated(
        self, data: dict[str, pl.DataFrame]
    ) -> None:
        """statutory_line should be set on >=40% of premium/loss postings."""
        prem_loss = data["postings"].filter(
            pl.col("gl_account").str.starts_with("400")
            | pl.col("gl_account").str.starts_with("500")
        )
        populated = prem_loss.filter(pl.col("statutory_line").is_not_null())
        ratio = len(populated) / max(len(prem_loss), 1)
        assert ratio >= 0.40, (
            f"statutory_line populated on {ratio:.1%} of prem/loss postings"
        )

    def test_treaty_id_on_reinsurance_postings(
        self, data: dict[str, pl.DataFrame]
    ) -> None:
        """treaty_id should be set on reinsurance-related postings."""
        ri_postings = data["postings"].filter(
            pl.col("treaty_id").is_not_null()
        )
        assert len(ri_postings) > 0, "No postings have treaty_id set"
        # Verify they touch reinsurance-related accounts
        ri_accounts = ri_postings["gl_account"].unique().to_list()
        # Should include ceded premium (400x20), RI recoverables (120xxx), etc.
        has_ri_account = any(
            a.startswith("120") or a.endswith("20") or a.startswith("230")
            or a.startswith("250") or a.startswith("260") or a.startswith("750")
            for a in ri_accounts
        )
        assert has_ri_account, f"treaty_id postings don't touch RI accounts: {ri_accounts}"

    def test_naic_statutory_line_values_valid(
        self, data: dict[str, pl.DataFrame]
    ) -> None:
        """statutory_line values should be valid NAIC line numbers."""
        valid_lines = set(NAIC_LINES.keys())
        actual_lines = (
            data["postings"]
            .filter(pl.col("statutory_line").is_not_null())["statutory_line"]
            .unique()
            .to_list()
        )
        invalid = [l for l in actual_lines if l not in valid_lines]
        assert len(invalid) == 0, f"Invalid NAIC statutory lines: {invalid}"

    def test_claim_type_populated(self, data: dict[str, pl.DataFrame]) -> None:
        """claim_type should be set on claims postings."""
        claims_with_ct = data["postings"].filter(
            pl.col("claim_type").is_not_null()
        )
        assert len(claims_with_ct) > 0, "No postings have claim_type set"

    def test_distribution_channel_populated(
        self, data: dict[str, pl.DataFrame]
    ) -> None:
        """distribution_channel should be set on premium/commission postings."""
        with_channel = data["postings"].filter(
            pl.col("distribution_channel").is_not_null()
        )
        assert len(with_channel) > 0, "No postings have distribution_channel set"

    def test_mixed_product_encoding(self, data: dict[str, pl.DataFrame]) -> None:
        """Some postings use financial_product column, some use product-encoded accounts."""
        # Product-encoded accounts: 500x70, 500x80, 600x40, 600x50 (6-digit)
        product_encoded = data["postings"].filter(
            pl.col("gl_account").str.contains(r"^500\d[78]0$")
            | pl.col("gl_account").str.contains(r"^600\d[45]0$")
        )
        # Explicit financial_product
        explicit_fp = data["postings"].filter(
            pl.col("financial_product").is_not_null()
        )
        assert len(product_encoded) > 0, "No product-encoded account postings found"
        assert len(explicit_fp) > 0, "No explicit financial_product postings found"


# ---------------------------------------------------------------------------
# Seasonal and temporal patterns
# ---------------------------------------------------------------------------


class TestSeasonalPatterns:
    def test_cat_losses_concentrated_q2_q3(
        self, data: dict[str, pl.DataFrame]
    ) -> None:
        """Catastrophe losses should be concentrated in months 4-9."""
        cat_postings = data["postings"].filter(
            pl.col("gl_account").str.contains(r"^500\d50$")  # Cat loss accounts
        )
        assert len(cat_postings) > 0, "No catastrophe loss postings found"
        cat_by_month = cat_postings.group_by("fiscal_period").agg(
            pl.len().alias("count")
        )
        q2q3 = cat_by_month.filter(
            pl.col("fiscal_period").is_between(4, 9)
        )["count"].sum()
        total = cat_by_month["count"].sum()
        ratio = q2q3 / max(total, 1)
        assert ratio >= 0.80, (
            f"Only {ratio:.1%} of cat losses in months 4-9, expected >=80%"
        )

    def test_backdated_entries_exist(self, data: dict[str, pl.DataFrame]) -> None:
        """Some postings should have entry_date > posting_date."""
        backdated = data["postings"].filter(
            pl.col("entry_date") > pl.col("posting_date")
        )
        ratio = len(backdated) / len(data["postings"])
        assert ratio >= 0.01, (
            f"Only {ratio:.2%} backdated entries, expected >=1%"
        )

    def test_multi_line_jes_exist(self, data: dict[str, pl.DataFrame]) -> None:
        """Some documents should have >5 line items."""
        doc_lines = data["postings"].group_by("document_number").agg(
            pl.len().alias("n_lines")
        )
        large_docs = doc_lines.filter(pl.col("n_lines") > 5)
        assert len(large_docs) > 0, "No multi-line JEs (>5 lines) found"


# ---------------------------------------------------------------------------
# Opening balances
# ---------------------------------------------------------------------------


class TestOpeningBalances:
    def test_bs_accounts_have_opening_balance(
        self, data: dict[str, pl.DataFrame]
    ) -> None:
        """Balance sheet accounts should have non-zero period-1 opening balance."""
        tb = data["trial_balance"]
        am = data["account_master"]

        # Get BS account types
        bs_accounts = set(
            am.filter(
                pl.col("account_type").is_in(["A", "L", "E"])
                & pl.col("is_active")
            )["gl_account"].to_list()
        )

        p1 = tb.filter(
            (pl.col("fiscal_period") == 1)
            & pl.col("gl_account").is_in(list(bs_accounts))
        )
        nonzero_ob = p1.filter(pl.col("opening_balance") != 0.0)
        assert len(nonzero_ob) > 0, "No BS accounts have non-zero opening balance"
        ratio = len(nonzero_ob) / max(len(p1), 1)
        assert ratio >= 0.3, (
            f"Only {ratio:.1%} of BS accounts have non-zero OB, expected >=30%"
        )


# ---------------------------------------------------------------------------
# Historical complexity
# ---------------------------------------------------------------------------


class TestHistoricalComplexity:
    def test_multi_source_systems(self, data: dict[str, pl.DataFrame]) -> None:
        """Multiple source_system values should be present."""
        sources = (
            data["account_master"]
            .filter(pl.col("source_system").is_not_null())["source_system"]
            .unique()
            .to_list()
        )
        assert len(sources) >= 3, f"Only {len(sources)} source systems: {sources}"
        # Expect at least SAP, Legacy, MM-Acquired
        assert "SAP" in sources, "Missing SAP source system"
        assert "Legacy" in sources, "Missing Legacy source system"
        assert "MM-Acquired" in sources, "Missing MM-Acquired source system"

    def test_effective_dates_span(self, data: dict[str, pl.DataFrame]) -> None:
        """effective_from should span from 2006 to 2024."""
        eff_dates = data["account_master"].filter(
            pl.col("effective_from").is_not_null()
        )["effective_from"]
        min_year = eff_dates.min().year  # type: ignore[union-attr]
        max_year = eff_dates.max().year  # type: ignore[union-attr]
        assert min_year <= 2009, f"Earliest effective_from year: {min_year}"
        assert max_year >= 2020, f"Latest effective_from year: {max_year}"


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
