#!/usr/bin/env python3
"""Seed sample outcome data into DuckDB for dashboard development.

Generates realistic-looking outcome records from the synthetic dataset
and loads them into DuckDB tables that the outcomes API serves.

Usage:
    python scripts/seed_outcomes.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import polars as pl

# Ensure src is importable when running as a script
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from fta_agent.data.engine import DataEngine
from fta_agent.data.outcomes import (
    ACCOUNT_MAPPING_SCHEMA,
    ACCOUNT_PROFILE_SCHEMA,
    ANALYSIS_FINDING_SCHEMA,
    DIMENSIONAL_DECISION_SCHEMA,
    MJE_PATTERN_SCHEMA,
    RECONCILIATION_RESULT_SCHEMA,
    TARGET_ACCOUNT_SCHEMA,
)
from fta_agent.data.synthetic import generate_synthetic_data


def _build_account_profiles(
    postings: pl.DataFrame,
    account_master: pl.DataFrame,
) -> pl.DataFrame:
    """Build account profiles from postings and account master data."""
    profiles: list[dict[str, object]] = []

    acct_info = {
        row["gl_account"]: row for row in account_master.to_dicts()
    }

    # Group postings by gl_account
    grouped = postings.group_by("gl_account").agg(
        pl.col("posting_date").min().alias("first_posting"),
        pl.col("posting_date").max().alias("last_posting"),
        pl.len().alias("posting_count"),
        pl.col("fiscal_period").n_unique().alias("period_count"),
        pl.col("amount")
        .filter(pl.col("debit_credit") == "D")
        .sum()
        .alias("total_debit"),
        pl.col("amount")
        .filter(pl.col("debit_credit") == "C")
        .sum()
        .alias("total_credit"),
        pl.col("profit_center").drop_nulls().unique().alias("pcs"),
        pl.col("cost_center").drop_nulls().unique().alias("ccs"),
        pl.col("segment").drop_nulls().unique().alias("segs"),
        pl.col("document_category").eq("MJE").any().alias("is_mje_target"),
    )

    for row in grouped.to_dicts():
        acct = row["gl_account"]
        master = acct_info.get(acct, {})
        total_d = float(row["total_debit"] or 0)
        total_c = abs(float(row["total_credit"] or 0))
        posting_count = int(row["posting_count"])
        period_count = int(row["period_count"])
        avg_monthly = posting_count / max(period_count, 1)

        if total_d > total_c * 1.1:
            direction = "D"
        elif total_c > total_d * 1.1:
            direction = "C"
        else:
            direction = "MIXED"

        acct_type = str(master.get("account_type", "X"))
        configured_type = acct_type
        is_active = bool(master.get("is_active", True))

        profiles.append(
            {
                "gl_account": acct,
                "description": str(master.get("description", "")),
                "account_type": acct_type,
                "first_posting": row["first_posting"],
                "last_posting": row["last_posting"],
                "posting_count": posting_count,
                "period_count": period_count,
                "avg_monthly_volume": round(avg_monthly, 1),
                "total_debit": round(total_d, 2),
                "total_credit": round(total_c, 2),
                "avg_balance": round((total_d - total_c) / max(period_count, 1), 2),
                "balance_direction": direction,
                "top_counterparties": json.dumps([]),
                "profit_centers_used": json.dumps(
                    row["pcs"][:5] if row["pcs"] else []
                ),
                "cost_centers_used": json.dumps(
                    row["ccs"][:5] if row["ccs"] else []
                ),
                "segments_used": json.dumps(
                    row["segs"][:5] if row["segs"] else []
                ),
                "has_seasonal_pattern": False,
                "is_mje_target": bool(row["is_mje_target"]),
                "configured_type": configured_type,
                "classification_match": True,
                "is_active": is_active,
            }
        )

    return pl.DataFrame(profiles, schema=ACCOUNT_PROFILE_SCHEMA)


def _build_findings(account_profiles: pl.DataFrame) -> pl.DataFrame:
    """Generate sample findings from account profile data."""
    findings: list[dict[str, object]] = []

    # Finding: Inactive accounts
    inactive = account_profiles.filter(pl.col("is_active").not_())
    if len(inactive) > 0:
        accts = inactive["gl_account"].to_list()
        findings.append(
            {
                "finding_id": "F-001",
                "category": "INACTIVE",
                "severity": "MED",
                "title": f"{len(accts)} inactive accounts in account master",
                "detail": (
                    "These accounts are marked inactive in the master data. "
                    "Review for deactivation or archival in target COA."
                ),
                "affected_accounts": json.dumps(accts[:20]),
                "affected_count": len(accts),
                "recommendation": "Review and confirm deactivation for target COA.",
                "recommendation_category": "WORTH_IT",
                "coa_design_link": None,
                "status": "open",
                "resolution": None,
            }
        )

    # Finding: MJE-heavy accounts
    mje_targets = account_profiles.filter(pl.col("is_mje_target"))
    if len(mje_targets) > 0:
        accts = mje_targets["gl_account"].to_list()
        findings.append(
            {
                "finding_id": "F-002",
                "category": "MJE_ROOT",
                "severity": "HIGH",
                "title": f"{len(accts)} accounts receive manual journal entries",
                "detail": (
                    "These accounts are targets for MJEs. Root cause analysis "
                    "needed to determine if COA redesign can eliminate them."
                ),
                "affected_accounts": json.dumps(accts[:20]),
                "affected_count": len(accts),
                "recommendation": "Perform MJE root cause analysis per account.",
                "recommendation_category": "MUST_DO",
                "coa_design_link": None,
                "status": "open",
                "resolution": None,
            }
        )

    # Finding: Mixed balance direction
    mixed = account_profiles.filter(pl.col("balance_direction") == "MIXED")
    if len(mixed) > 0:
        accts = mixed["gl_account"].to_list()
        findings.append(
            {
                "finding_id": "F-003",
                "category": "CLASSIF",
                "severity": "LOW",
                "title": f"{len(accts)} accounts with mixed debit/credit balance",
                "detail": (
                    "These accounts show roughly equal debit and credit activity, "
                    "suggesting possible misclassification or dual-purpose use."
                ),
                "affected_accounts": json.dumps(accts[:20]),
                "affected_count": len(accts),
                "recommendation": "Review account purpose and posting patterns.",
                "recommendation_category": "PARK_IT",
                "coa_design_link": None,
                "status": "open",
                "resolution": None,
            }
        )

    # Finding: Dimensional gaps (accounts with no profit center)
    no_pc = account_profiles.filter(
        pl.col("profit_centers_used") == "[]"
    )
    if len(no_pc) > 0:
        accts = no_pc["gl_account"].to_list()
        findings.append(
            {
                "finding_id": "F-004",
                "category": "DIM_GAP",
                "severity": "HIGH",
                "title": f"{len(accts)} accounts with no profit center assignment",
                "detail": (
                    "Postings to these accounts lack profit center, which means "
                    "they cannot be attributed to any LOB or business unit."
                ),
                "affected_accounts": json.dumps(accts[:20]),
                "affected_count": len(accts),
                "recommendation": (
                    "Define default profit center derivation rules or "
                    "require profit center on these account groups."
                ),
                "recommendation_category": "MUST_DO",
                "coa_design_link": "DIM-PC-001",
                "status": "open",
                "resolution": None,
            }
        )

    # Finding: Low-activity accounts
    low_activity = account_profiles.filter(
        (pl.col("posting_count") < 10) & pl.col("is_active")
    )
    if len(low_activity) > 0:
        accts = low_activity["gl_account"].to_list()
        findings.append(
            {
                "finding_id": "F-005",
                "category": "INACTIVE",
                "severity": "LOW",
                "title": f"{len(accts)} active accounts with fewer than 10 postings",
                "detail": (
                    "These accounts are marked active but have very low posting "
                    "volume. They may be candidates for consolidation or removal."
                ),
                "affected_accounts": json.dumps(accts[:20]),
                "affected_count": len(accts),
                "recommendation": "Evaluate for consolidation into related accounts.",
                "recommendation_category": "WORTH_IT",
                "coa_design_link": None,
                "status": "open",
                "resolution": None,
            }
        )

    if not findings:
        findings.append(
            {
                "finding_id": "F-000",
                "category": "INACTIVE",
                "severity": "INFO",
                "title": "No significant findings detected",
                "detail": "Initial scan completed with no actionable findings.",
                "affected_accounts": "[]",
                "affected_count": 0,
                "recommendation": "Proceed to design phase.",
                "recommendation_category": "DONT_TOUCH",
                "coa_design_link": None,
                "status": "open",
                "resolution": None,
            }
        )

    return pl.DataFrame(findings, schema=ANALYSIS_FINDING_SCHEMA)


def _build_dimensional_decisions() -> pl.DataFrame:
    """Generate sample dimensional decisions."""
    decisions = [
        {
            "decision_id": "DIM-PC-001",
            "dimension": "profit_center",
            "acdoca_field": "PRCTR",
            "design_choice": "Profit center represents Line of Business (LOB)",
            "rationale": (
                "LOB is the primary P&L segmentation for P&C carriers. "
                "Auto, Homeowners, Commercial, and WC each get a profit center."
            ),
            "alternatives_considered": json.dumps([
                {
                    "option": "Region/State",
                    "pros": "Direct state-level reporting",
                    "cons": "Too granular, explosion of PCs",
                },
                {
                    "option": "LOB x Region combo",
                    "pros": "Full dimensional view",
                    "cons": "Combinatorial explosion, maintenance burden",
                },
            ]),
            "downstream_impacts": json.dumps([
                "Segment derives from PC — will be at P&C level",
                "State reporting must use COPA or custom field",
                "Do not duplicate LOB in COPA characteristics",
            ]),
            "status": "PROPOSED",
            "decided_by": None,
            "decided_date": None,
            "revision_history": None,
        },
        {
            "decision_id": "DIM-SEG-001",
            "dimension": "segment",
            "acdoca_field": "SEGMENT",
            "design_choice": "Single segment: P&C Insurance",
            "rationale": (
                "With profit center = LOB, segment derives at the entity level. "
                "Only one reporting segment unless Life/Non-Life split needed."
            ),
            "alternatives_considered": json.dumps([
                {
                    "option": "LOB-level segments",
                    "pros": "Segment-level balance sheet by LOB",
                    "cons": "Requires document splitting by LOB — complex",
                },
            ]),
            "downstream_impacts": json.dumps([
                "Document splitting activated on segment",
                "Balance sheet will have single segment column",
            ]),
            "status": "PROPOSED",
            "decided_by": None,
            "decided_date": None,
            "revision_history": None,
        },
        {
            "decision_id": "DIM-FA-001",
            "dimension": "functional_area",
            "acdoca_field": "RFAREA",
            "design_choice": (
                "6 insurance functional areas: CLAIMS, ACQUIS, ADMIN, "
                "INVEST, TAX, OTHER"
            ),
            "rationale": (
                "Statutory and GAAP expense classification by function. "
                "Derives from cost center or account for most postings."
            ),
            "alternatives_considered": json.dumps([
                {
                    "option": "Standard SAP functional areas",
                    "pros": "Out-of-box config",
                    "cons": "Manufacturing-oriented, not insurance-relevant",
                },
            ]),
            "downstream_impacts": json.dumps([
                "All P&L accounts must have functional area derivation rule",
                "Cost center master must carry functional area default",
            ]),
            "status": "PROPOSED",
            "decided_by": None,
            "decided_date": None,
            "revision_history": None,
        },
        {
            "decision_id": "DIM-CC-001",
            "dimension": "cost_center",
            "acdoca_field": "RCNTR",
            "design_choice": "Cost centers represent departments/functions",
            "rationale": (
                "Claims operations, underwriting, actuarial, IT, finance, "
                "HR — standard departmental structure."
            ),
            "alternatives_considered": json.dumps([]),
            "downstream_impacts": json.dumps([
                "Functional area derives from cost center for overhead expenses",
            ]),
            "status": "PROPOSED",
            "decided_by": None,
            "decided_date": None,
            "revision_history": None,
        },
        {
            "decision_id": "DIM-BA-001",
            "dimension": "business_area",
            "acdoca_field": "RBUSA",
            "design_choice": "Not used — recommend removal",
            "rationale": (
                "Business area is a legacy SAP concept. With profit center "
                "and segment in use, business area adds no reporting value."
            ),
            "alternatives_considered": json.dumps([
                {
                    "option": "Use for legal entity grouping",
                    "pros": "Additional grouping dimension",
                    "cons": "Redundant with company code",
                },
            ]),
            "downstream_impacts": json.dumps([
                "Suppress business area field in all account groups",
            ]),
            "status": "PROPOSED",
            "decided_by": None,
            "decided_date": None,
            "revision_history": None,
        },
        {
            "decision_id": "DIM-TP-001",
            "dimension": "trading_partner",
            "acdoca_field": "RASSC",
            "design_choice": "Required on all intercompany transactions",
            "rationale": (
                "Enables IC elimination in consolidation. Required for "
                "reinsurance affiliate transactions."
            ),
            "alternatives_considered": json.dumps([]),
            "downstream_impacts": json.dumps([
                "IC account groups must require trading partner",
                "Reinsurance postings must carry treaty partner",
            ]),
            "status": "PROPOSED",
            "decided_by": None,
            "decided_date": None,
            "revision_history": None,
        },
        {
            "decision_id": "DIM-STATE-001",
            "dimension": "state",
            "acdoca_field": None,
            "design_choice": "Custom field via CI_COBL (ZZ_STATE)",
            "rationale": (
                "SAP has no native state field. Custom extension required "
                "for state-level premium, loss, and tax reporting."
            ),
            "alternatives_considered": json.dumps([
                {
                    "option": "COPA characteristic only",
                    "pros": "No code block extension needed",
                    "cons": "Not on balance sheet, not in ACDOCA",
                },
                {
                    "option": "Profit center = state",
                    "pros": "Native dimension, document splitting",
                    "cons": "Sacrifices LOB as profit center",
                },
            ]),
            "downstream_impacts": json.dumps([
                "Requires BAdI for derivation and validation",
                "Consider document splitting on state if state-level BS needed",
            ]),
            "status": "PENDING",
            "decided_by": None,
            "decided_date": None,
            "revision_history": None,
        },
    ]
    return pl.DataFrame(decisions, schema=DIMENSIONAL_DECISION_SCHEMA)


def _build_target_accounts() -> pl.DataFrame:
    """Generate a sample target COA structure."""
    accounts = [
        # Assets
        {
            "gl_account": "100100",
            "description": "Cash - Operating",
            "account_type": "A",
            "account_group": "CASH",
            "naic_line": None,
            "statutory_category": "Cash",
            "functional_area": None,
            "design_rationale": "Primary operating account",
            "source_accounts": json.dumps(["1001", "1002"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "110100",
            "description": "Investment Securities - Bonds",
            "account_type": "A",
            "account_group": "INVEST",
            "naic_line": "Schedule D",
            "statutory_category": "Bonds",
            "functional_area": "INVEST",
            "design_rationale": "Bond portfolio per NAIC Schedule D",
            "source_accounts": json.dumps(["1101"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "120100",
            "description": "Premium Receivable - Direct",
            "account_type": "A",
            "account_group": "PREM",
            "naic_line": None,
            "statutory_category": "Agents Balances",
            "functional_area": None,
            "design_rationale": "Direct written premium receivable",
            "source_accounts": json.dumps(["1201", "1202"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "130100",
            "description": "Reinsurance Recoverable - Paid Losses",
            "account_type": "A",
            "account_group": "REINS",
            "naic_line": "Schedule F",
            "statutory_category": "Reinsurance",
            "functional_area": None,
            "design_rationale": (
                "Recoverables on paid losses per Schedule F"
            ),
            "source_accounts": json.dumps(["1301"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "130200",
            "description": "Reinsurance Recoverable - Unpaid Losses",
            "account_type": "A",
            "account_group": "REINS",
            "naic_line": "Schedule F",
            "statutory_category": "Reinsurance",
            "functional_area": None,
            "design_rationale": (
                "Recoverables on case + IBNR reserves"
            ),
            "source_accounts": json.dumps(["1302"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        # Liabilities
        {
            "gl_account": "210100",
            "description": "Loss Reserves - Case - Auto",
            "account_type": "L",
            "account_group": "RESV",
            "naic_line": "19.1",
            "statutory_category": "Losses",
            "functional_area": "CLAIMS",
            "design_rationale": "Case reserves by LOB per NAIC",
            "source_accounts": json.dumps(["2101"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "210200",
            "description": "Loss Reserves - IBNR - Auto",
            "account_type": "L",
            "account_group": "RESV",
            "naic_line": "19.1",
            "statutory_category": "Losses",
            "functional_area": "CLAIMS",
            "design_rationale": "IBNR by LOB for Schedule P",
            "source_accounts": json.dumps(["2102"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "210300",
            "description": "Loss Reserves - LAE - Auto",
            "account_type": "L",
            "account_group": "RESV",
            "naic_line": "19.1",
            "statutory_category": "LAE",
            "functional_area": "CLAIMS",
            "design_rationale": (
                "LAE reserves (ALAE + ULAE) by LOB"
            ),
            "source_accounts": json.dumps(["2103"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "220100",
            "description": "Unearned Premium - Auto",
            "account_type": "L",
            "account_group": "UPR",
            "naic_line": "9",
            "statutory_category": "UPR",
            "functional_area": None,
            "design_rationale": "UPR by LOB",
            "source_accounts": json.dumps(["2201"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "230100",
            "description": "Ceded Unearned Premium",
            "account_type": "L",
            "account_group": "REINS",
            "naic_line": "Schedule F",
            "statutory_category": "Reinsurance",
            "functional_area": None,
            "design_rationale": (
                "Ceded UPR for reinsurance accounting"
            ),
            "source_accounts": json.dumps(["2301"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        # Revenue
        {
            "gl_account": "400100",
            "description": "Direct Written Premium - Auto",
            "account_type": "R",
            "account_group": "PREM_REV",
            "naic_line": "1",
            "statutory_category": "Premium",
            "functional_area": "ACQUIS",
            "design_rationale": "DWP by LOB",
            "source_accounts": json.dumps(["4001"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "400200",
            "description": "Earned Premium - Auto",
            "account_type": "R",
            "account_group": "PREM_REV",
            "naic_line": "1",
            "statutory_category": "Premium",
            "functional_area": "ACQUIS",
            "design_rationale": (
                "Earned portion of written premium"
            ),
            "source_accounts": json.dumps(["4002"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "410100",
            "description": "Ceded Premium - Auto",
            "account_type": "R",
            "account_group": "PREM_REV",
            "naic_line": "2",
            "statutory_category": "Premium",
            "functional_area": "ACQUIS",
            "design_rationale": (
                "Ceded premium by LOB and treaty"
            ),
            "source_accounts": json.dumps(["4101"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "420100",
            "description": "Net Investment Income",
            "account_type": "R",
            "account_group": "PREM_REV",
            "naic_line": "Schedule D",
            "statutory_category": "Investment",
            "functional_area": "INVEST",
            "design_rationale": "Investment portfolio income",
            "source_accounts": json.dumps(["4201"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        # Expenses
        {
            "gl_account": "500100",
            "description": "Loss Paid - Auto - BI",
            "account_type": "X",
            "account_group": "LOSS",
            "naic_line": "19.1",
            "statutory_category": "Losses",
            "functional_area": "CLAIMS",
            "design_rationale": (
                "Paid losses by LOB and claim type"
            ),
            "source_accounts": json.dumps(["5001"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "500200",
            "description": "Loss Paid - Auto - PD",
            "account_type": "X",
            "account_group": "LOSS",
            "naic_line": "19.1",
            "statutory_category": "Losses",
            "functional_area": "CLAIMS",
            "design_rationale": (
                "Paid losses by LOB and claim type"
            ),
            "source_accounts": json.dumps(["5002"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "510100",
            "description": "LAE Expense - Auto",
            "account_type": "X",
            "account_group": "LOSS",
            "naic_line": "19.1",
            "statutory_category": "LAE",
            "functional_area": "CLAIMS",
            "design_rationale": "LAE by LOB",
            "source_accounts": json.dumps(["5101"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "520100",
            "description": "Commission Expense - Auto",
            "account_type": "X",
            "account_group": "COMM",
            "naic_line": "25",
            "statutory_category": "Acquisition",
            "functional_area": "ACQUIS",
            "design_rationale": (
                "Agent/broker commissions by LOB"
            ),
            "source_accounts": json.dumps(["5201"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "530100",
            "description": "Underwriting Expense",
            "account_type": "X",
            "account_group": "OPEX",
            "naic_line": "26",
            "statutory_category": "Operating",
            "functional_area": "ACQUIS",
            "design_rationale": (
                "Underwriting department operating costs"
            ),
            "source_accounts": json.dumps(["5301"]),
            "is_new": False,
            "recommendation_category": "WORTH_IT",
        },
        {
            "gl_account": "540100",
            "description": "Claims Adjusting Expense",
            "account_type": "X",
            "account_group": "OPEX",
            "naic_line": "26",
            "statutory_category": "Operating",
            "functional_area": "CLAIMS",
            "design_rationale": (
                "Claims department salaries and overhead"
            ),
            "source_accounts": json.dumps(["5401"]),
            "is_new": False,
            "recommendation_category": "WORTH_IT",
        },
        {
            "gl_account": "550100",
            "description": "IT Operating Expense",
            "account_type": "X",
            "account_group": "OPEX",
            "naic_line": "26",
            "statutory_category": "Operating",
            "functional_area": "ADMIN",
            "design_rationale": (
                "Technology infrastructure and support"
            ),
            "source_accounts": json.dumps(["5501"]),
            "is_new": False,
            "recommendation_category": "WORTH_IT",
        },
        {
            "gl_account": "560100",
            "description": "Premium Tax Expense",
            "account_type": "X",
            "account_group": "OPEX",
            "naic_line": "24",
            "statutory_category": "Taxes",
            "functional_area": "TAX",
            "design_rationale": (
                "State premium taxes by jurisdiction"
            ),
            "source_accounts": None,
            "is_new": True,
            "recommendation_category": "MUST_DO",
        },
        {
            "gl_account": "570100",
            "description": "Salvage & Subrogation Recovery",
            "account_type": "X",
            "account_group": "LOSS",
            "naic_line": "19.1",
            "statutory_category": "Losses",
            "functional_area": "CLAIMS",
            "design_rationale": (
                "Recoveries that offset loss costs"
            ),
            "source_accounts": json.dumps(["5701"]),
            "is_new": False,
            "recommendation_category": "MUST_DO",
        },
    ]
    return pl.DataFrame(accounts, schema=TARGET_ACCOUNT_SCHEMA)


def _build_account_mappings(
    target_coa: pl.DataFrame,
) -> pl.DataFrame:
    """Generate account mappings from target COA source_accounts."""
    mappings: list[dict[str, object]] = []
    idx = 1
    for row in target_coa.to_dicts():
        sources_raw = row.get("source_accounts")
        if not sources_raw:
            continue
        sources = json.loads(sources_raw)
        is_merge = len(sources) > 1
        for src in sources:
            mappings.append(
                {
                    "mapping_id": f"MAP-{idx:03d}",
                    "legacy_account": src,
                    "legacy_description": f"Legacy account {src}",
                    "target_account": row["gl_account"],
                    "target_description": row["description"],
                    "confidence": "HIGH" if not is_merge else "MED",
                    "mapping_rationale": (
                        f"Direct mapping to {row['gl_account']}"
                    ),
                    "is_split": False,
                    "is_merge": is_merge,
                    "status": "AUTO",
                    "validated_by": None,
                }
            )
            idx += 1
    return pl.DataFrame(mappings, schema=ACCOUNT_MAPPING_SCHEMA)


def _build_mje_patterns() -> pl.DataFrame:
    """Generate sample MJE patterns."""
    patterns = [
        {
            "pattern_id": "MJE-001",
            "pattern_type": "RECUR_ID",
            "title": "Monthly reserve reclassification - Auto",
            "detail": (
                "Identical debit/credit pair posted every month to "
                "reclassify reserves between case and IBNR for Auto LOB. "
                "Same amount, same accounts, same preparer."
            ),
            "accounts_involved": json.dumps(["210100", "210200"]),
            "frequency": "monthly",
            "preparer_ids": json.dumps(["JSMITH"]),
            "is_single_preparer": True,
            "avg_amount": 125000.00,
            "annual_occurrences": 12,
            "annual_dollar_volume": 1500000.00,
            "root_cause": (
                "Legacy system lacks automatic reserve reclassification. "
                "Target COA can eliminate by structuring reserves correctly."
            ),
            "coa_design_link": "DIM-PC-001",
            "optimization_status": "ELIM",
            "estimated_entries_eliminated": 12,
        },
        {
            "pattern_id": "MJE-002",
            "pattern_type": "RECLASS",
            "title": "Quarterly functional area correction",
            "detail": (
                "Expenses posted to wrong functional area during the quarter, "
                "then reclassified at quarter-end. Root cause: no derivation "
                "rule for functional area on expense postings."
            ),
            "accounts_involved": json.dumps(["530100", "540100", "550100"]),
            "frequency": "quarterly",
            "preparer_ids": json.dumps(["MJONES", "KLEE"]),
            "is_single_preparer": False,
            "avg_amount": 85000.00,
            "annual_occurrences": 4,
            "annual_dollar_volume": 340000.00,
            "root_cause": (
                "Missing functional area derivation rules. Target design "
                "includes automatic derivation from cost center."
            ),
            "coa_design_link": "DIM-FA-001",
            "optimization_status": "ELIM",
            "estimated_entries_eliminated": 4,
        },
        {
            "pattern_id": "MJE-003",
            "pattern_type": "IC",
            "title": "Intercompany premium allocation",
            "detail": (
                "Manual allocation of premium between legal entities "
                "for intercompany pool. Should be automated via IC "
                "settlement process."
            ),
            "accounts_involved": json.dumps(["400100", "410100"]),
            "frequency": "monthly",
            "preparer_ids": json.dumps(["DWILSON"]),
            "is_single_preparer": True,
            "avg_amount": 450000.00,
            "annual_occurrences": 12,
            "annual_dollar_volume": 5400000.00,
            "root_cause": (
                "No automated IC settlement. S/4HANA IC process can "
                "automate this entirely."
            ),
            "coa_design_link": "DIM-TP-001",
            "optimization_status": "AUTO",
            "estimated_entries_eliminated": 12,
        },
        {
            "pattern_id": "MJE-004",
            "pattern_type": "ACCREV",
            "title": "Monthly premium accrual and reversal",
            "detail": (
                "Premium accrual at month-end, reversed at start of "
                "next month. Standard accrual process that should use "
                "recurring entries."
            ),
            "accounts_involved": json.dumps(["400100", "120100"]),
            "frequency": "monthly",
            "preparer_ids": json.dumps(["JSMITH"]),
            "is_single_preparer": True,
            "avg_amount": 200000.00,
            "annual_occurrences": 12,
            "annual_dollar_volume": 2400000.00,
            "root_cause": (
                "Manual accrual process. S/4HANA recurring entry "
                "functionality can automate."
            ),
            "coa_design_link": None,
            "optimization_status": "AUTO",
            "estimated_entries_eliminated": 24,
        },
        {
            "pattern_id": "MJE-005",
            "pattern_type": "CORRECT",
            "title": "State code corrections on premium postings",
            "detail": (
                "Corrections to state attribution on premium postings. "
                "Usually caught in month-end reconciliation."
            ),
            "accounts_involved": json.dumps(["400100", "400200"]),
            "frequency": "monthly",
            "preparer_ids": json.dumps(["KLEE"]),
            "is_single_preparer": True,
            "avg_amount": 35000.00,
            "annual_occurrences": 12,
            "annual_dollar_volume": 420000.00,
            "root_cause": (
                "No validation on state code at posting time. Target "
                "design includes BAdI validation on ZZ_STATE field."
            ),
            "coa_design_link": "DIM-STATE-001",
            "optimization_status": "ELIM",
            "estimated_entries_eliminated": 12,
        },
        {
            "pattern_id": "MJE-006",
            "pattern_type": "CONSOL",
            "title": "Annual statutory adjustment entries",
            "detail": (
                "Year-end adjustments for statutory vs. GAAP differences. "
                "Legitimate entries that will persist."
            ),
            "accounts_involved": json.dumps(["210100", "210200", "220100"]),
            "frequency": "annual",
            "preparer_ids": json.dumps(["LJONES"]),
            "is_single_preparer": True,
            "avg_amount": 750000.00,
            "annual_occurrences": 1,
            "annual_dollar_volume": 750000.00,
            "root_cause": (
                "GAAP/statutory differences require adjustment entries. "
                "Parallel ledger approach in S/4 can partially address."
            ),
            "coa_design_link": None,
            "optimization_status": "RESIDUAL",
            "estimated_entries_eliminated": 0,
        },
    ]
    return pl.DataFrame(patterns, schema=MJE_PATTERN_SCHEMA)


def _build_reconciliation() -> pl.DataFrame:
    """Return an empty reconciliation table (V2 placeholder)."""
    return pl.DataFrame(schema=RECONCILIATION_RESULT_SCHEMA)


def main() -> None:
    """Generate and seed all outcome data."""
    print("Generating synthetic data...")
    data = generate_synthetic_data(seed=42)
    postings = data["postings"]
    account_master = data["account_master"]
    print(
        f"  Postings: {len(postings):,} rows, "
        f"Accounts: {len(account_master):,} rows"
    )

    print("Building account profiles...")
    profiles = _build_account_profiles(postings, account_master)
    print(f"  {len(profiles):,} account profiles")

    print("Building findings...")
    findings = _build_findings(profiles)
    print(f"  {len(findings)} findings")

    print("Building dimensional decisions...")
    decisions = _build_dimensional_decisions()
    print(f"  {len(decisions)} decisions")

    print("Building target COA...")
    target_coa = _build_target_accounts()
    print(f"  {len(target_coa)} target accounts")

    print("Building account mappings...")
    mappings = _build_account_mappings(target_coa)
    print(f"  {len(mappings)} mappings")

    print("Building MJE patterns...")
    mje_patterns = _build_mje_patterns()
    print(f"  {len(mje_patterns)} patterns")

    print("Building reconciliation placeholder...")
    reconciliation = _build_reconciliation()

    # Load into DuckDB
    db_path = "fta_outcomes.duckdb"
    print(f"\nLoading into DuckDB ({db_path})...")
    engine = DataEngine(db_path)

    tables = {
        "account_profiles": profiles,
        "analysis_findings": findings,
        "dimensional_decisions": decisions,
        "target_accounts": target_coa,
        "account_mappings": mappings,
        "mje_patterns": mje_patterns,
        "reconciliation_results": reconciliation,
    }

    for table_name, table_df in tables.items():
        # Create actual tables (not views) so PATCH updates work
        engine.execute(f"DROP TABLE IF EXISTS {table_name}")
        engine.load_polars(table_df, f"_tmp_{table_name}")
        engine.execute(
            f"CREATE TABLE {table_name} AS "
            f"SELECT * FROM _tmp_{table_name}"
        )
        count = engine.execute(
            f"SELECT COUNT(*) FROM {table_name}"
        ).fetchone()
        row_count = count[0] if count else 0
        print(f"  {table_name}: {row_count} rows")

    engine.close()
    print(f"\nDone. Database written to: {db_path}")
    print("Start the API with:")
    print(
        f"  FTA_DUCKDB_PATH={db_path!r} "
        "uvicorn fta_agent.api.app:create_app --factory"
    )


if __name__ == "__main__":
    main()
