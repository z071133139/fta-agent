"""GL analysis tools — LangChain tools that query DuckDB via DataEngine.

Five tools for the GL Design Coach:
  1. profile_accounts — compute usage profiles for GL accounts
  2. detect_mje — detect manual journal entry patterns
  3. compute_trial_balance — retrieve/compute trial balance summaries
  4. generate_income_statement — build a GAAP P&L from posting data
  5. assess_dimensions — analyze dimensional usage and quality
"""

from __future__ import annotations

import json
import logging
from typing import Any

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from fta_agent.data.engine import DataEngine

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Tool input schemas
# ---------------------------------------------------------------------------


class ProfileAccountsInput(BaseModel):
    """Input for profile_accounts tool."""

    account_filter: str | None = Field(
        default=None,
        description=(
            "Optional SQL WHERE clause fragment to filter accounts. "
            "E.g. \"gl_account LIKE '4%'\" for revenue accounts, "
            "or \"account_type = 'X'\" for expense accounts. "
            "Omit to profile all accounts."
        ),
    )
    top_n: int = Field(
        default=25,
        description="Max number of accounts to return, ordered by posting count desc.",
    )


class DetectMJEInput(BaseModel):
    """Input for detect_mje tool."""

    min_occurrences: int = Field(
        default=3,
        description="Minimum occurrences to qualify as a pattern.",
    )
    include_details: bool = Field(
        default=False,
        description="If true, include sample document numbers for each pattern.",
    )


class TrialBalanceInput(BaseModel):
    """Input for compute_trial_balance tool."""

    fiscal_period: int | None = Field(
        default=None,
        description="Specific period (1-12). Omit for full-year summary.",
    )
    account_type_filter: str | None = Field(
        default=None,
        description="Filter by account type: 'A' asset, 'L' liability, 'E' equity, 'R' revenue, 'X' expense.",
    )


class IncomeStatementInput(BaseModel):
    """Input for generate_income_statement tool."""

    period_from: int = Field(
        default=1,
        description="Starting fiscal period (1-12).",
    )
    period_to: int = Field(
        default=12,
        description="Ending fiscal period (1-12).",
    )
    by_lob: bool = Field(
        default=False,
        description="If true, break down by line of business.",
    )


class AssessDimensionsInput(BaseModel):
    """Input for assess_dimensions tool."""

    dimensions: list[str] = Field(
        default_factory=lambda: [
            "profit_center",
            "cost_center",
            "functional_area",
            "segment",
            "lob",
            "state",
        ],
        description="Which dimensions to analyze. Defaults to all standard dimensions.",
    )


# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------


def _profile_accounts(engine: DataEngine, account_filter: str | None = None, top_n: int = 25) -> str:
    """Profile GL accounts by posting activity, balance behavior, and dimensions used."""
    where = f"WHERE {account_filter}" if account_filter else ""

    sql = f"""
    WITH posting_stats AS (
        SELECT
            p.gl_account,
            COUNT(*) as posting_count,
            COUNT(DISTINCT fiscal_period) as period_count,
            MIN(posting_date) as first_posting,
            MAX(posting_date) as last_posting,
            SUM(CASE WHEN debit_credit = 'D' THEN amount ELSE 0 END) as total_debit,
            SUM(CASE WHEN debit_credit = 'C' THEN amount ELSE 0 END) as total_credit,
            ROUND(AVG(amount), 2) as avg_amount,
            COUNT(DISTINCT profit_center) as pc_count,
            COUNT(DISTINCT cost_center) as cc_count,
            COUNT(DISTINCT functional_area) as fa_count,
            COUNT(DISTINCT lob) as lob_count,
            COUNT(DISTINCT state) as state_count,
            SUM(CASE WHEN document_category = 'MJE' THEN 1 ELSE 0 END) as mje_count,
            ROUND(
                SUM(CASE WHEN document_category = 'MJE' THEN 1 ELSE 0 END) * 100.0
                / COUNT(*), 1
            ) as mje_pct
        FROM postings p
        {where}
        GROUP BY p.gl_account
    )
    SELECT
        ps.*,
        am.description,
        am.account_type,
        am.account_group,
        am.statutory_category,
        am.is_active
    FROM posting_stats ps
    LEFT JOIN account_master am ON ps.gl_account = am.gl_account
    ORDER BY ps.posting_count DESC
    LIMIT {top_n}
    """

    df = engine.query_polars(sql)

    if df.is_empty():
        return json.dumps({"accounts": [], "summary": "No accounts match the filter."})

    # Build summary stats
    total_accounts = len(df)
    total_postings = df["posting_count"].sum()
    inactive = df.filter(df["is_active"] == False)  # noqa: E712
    high_mje = df.filter(df["mje_pct"] > 10)

    summary = {
        "accounts_profiled": total_accounts,
        "total_postings": int(total_postings),
        "inactive_accounts": len(inactive),
        "high_mje_accounts": len(high_mje),
        "accounts": df.to_dicts(),
    }
    return json.dumps(summary, default=str)


def _detect_mje(engine: DataEngine, min_occurrences: int = 3, include_details: bool = False) -> str:
    """Detect manual journal entry patterns in posting data."""

    # Pattern 1: Recurring identical entries (same accounts, same amounts)
    recurring_identical_sql = f"""
    SELECT
        'RECURRING_IDENTICAL' as pattern_type,
        gl_account,
        amount,
        COUNT(*) as occurrences,
        COUNT(DISTINCT fiscal_period) as periods_seen,
        STRING_AGG(DISTINCT user_id, ', ') as preparers,
        MIN(posting_date) as first_seen,
        MAX(posting_date) as last_seen
    FROM postings
    WHERE document_category = 'MJE'
    GROUP BY gl_account, amount
    HAVING COUNT(*) >= {min_occurrences}
    ORDER BY occurrences DESC
    LIMIT 20
    """

    # Pattern 2: Accounts with high MJE concentration
    mje_concentration_sql = f"""
    SELECT
        'HIGH_MJE_CONCENTRATION' as pattern_type,
        p.gl_account,
        am.description,
        COUNT(*) as total_postings,
        SUM(CASE WHEN document_category = 'MJE' THEN 1 ELSE 0 END) as mje_count,
        ROUND(
            SUM(CASE WHEN document_category = 'MJE' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1
        ) as mje_pct,
        ROUND(SUM(CASE WHEN document_category = 'MJE' THEN ABS(amount) ELSE 0 END), 2) as mje_dollar_volume,
        COUNT(DISTINCT CASE WHEN document_category = 'MJE' THEN user_id END) as distinct_preparers
    FROM postings p
    LEFT JOIN account_master am ON p.gl_account = am.gl_account
    GROUP BY p.gl_account, am.description
    HAVING SUM(CASE WHEN p.document_category = 'MJE' THEN 1 ELSE 0 END) >= {min_occurrences}
       AND ROUND(SUM(CASE WHEN p.document_category = 'MJE' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) > 5
    ORDER BY mje_pct DESC
    LIMIT 20
    """

    # Pattern 3: Accrual/reversal pairs
    accrual_reversal_sql = """
    SELECT
        'ACCRUAL_REVERSAL' as pattern_type,
        gl_account,
        fiscal_period,
        SUM(CASE WHEN document_category = 'ACC' THEN amount ELSE 0 END) as accrual_amount,
        SUM(CASE WHEN document_category = 'CLR' THEN amount ELSE 0 END) as reversal_amount,
        COUNT(CASE WHEN document_category = 'ACC' THEN 1 END) as accrual_count,
        COUNT(CASE WHEN document_category = 'CLR' THEN 1 END) as reversal_count
    FROM postings
    WHERE document_category IN ('ACC', 'CLR')
    GROUP BY gl_account, fiscal_period
    HAVING COUNT(CASE WHEN document_category = 'ACC' THEN 1 END) > 0
       AND COUNT(CASE WHEN document_category = 'CLR' THEN 1 END) > 0
    ORDER BY gl_account, fiscal_period
    LIMIT 30
    """

    # Pattern 4: Intercompany entries
    intercompany_sql = """
    SELECT
        'INTERCOMPANY' as pattern_type,
        gl_account,
        trading_partner,
        COUNT(*) as entry_count,
        ROUND(SUM(ABS(amount)), 2) as total_volume,
        COUNT(DISTINCT fiscal_period) as periods_active,
        COUNT(DISTINCT user_id) as preparers
    FROM postings
    WHERE trading_partner IS NOT NULL
      AND document_category = 'MJE'
    GROUP BY gl_account, trading_partner
    ORDER BY total_volume DESC
    LIMIT 20
    """

    results: dict[str, Any] = {}

    for name, sql in [
        ("recurring_identical", recurring_identical_sql),
        ("mje_concentration", mje_concentration_sql),
        ("accrual_reversal", accrual_reversal_sql),
        ("intercompany", intercompany_sql),
    ]:
        df = engine.query_polars(sql)
        results[name] = {
            "count": len(df),
            "patterns": df.to_dicts(),
        }

    # Overall MJE summary
    summary_df = engine.query_polars("""
        SELECT
            document_category,
            COUNT(*) as count,
            ROUND(SUM(ABS(amount)), 2) as dollar_volume,
            COUNT(DISTINCT gl_account) as distinct_accounts,
            COUNT(DISTINCT user_id) as distinct_preparers
        FROM postings
        GROUP BY document_category
        ORDER BY count DESC
    """)
    results["overall_summary"] = summary_df.to_dicts()

    return json.dumps(results, default=str)


def _compute_trial_balance(
    engine: DataEngine,
    fiscal_period: int | None = None,
    account_type_filter: str | None = None,
) -> str:
    """Retrieve or compute trial balance data."""
    conditions = []
    if fiscal_period is not None:
        conditions.append(f"tb.fiscal_period = {fiscal_period}")
    if account_type_filter:
        conditions.append(f"am.account_type = '{account_type_filter}'")

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    sql = f"""
    SELECT
        tb.gl_account,
        am.description,
        am.account_type,
        am.account_group,
        tb.fiscal_period,
        ROUND(tb.opening_balance, 2) as opening_balance,
        ROUND(tb.period_debits, 2) as period_debits,
        ROUND(tb.period_credits, 2) as period_credits,
        ROUND(tb.closing_balance, 2) as closing_balance,
        ROUND(tb.cumulative_balance, 2) as cumulative_balance
    FROM trial_balance tb
    LEFT JOIN account_master am ON tb.gl_account = am.gl_account
    {where}
    ORDER BY tb.gl_account, tb.fiscal_period
    """

    df = engine.query_polars(sql)

    if df.is_empty():
        return json.dumps({"rows": [], "summary": "No trial balance data found."})

    # Aggregated summary
    summary_sql = f"""
    SELECT
        am.account_type,
        COUNT(DISTINCT tb.gl_account) as account_count,
        ROUND(SUM(tb.period_debits), 2) as total_debits,
        ROUND(SUM(tb.period_credits), 2) as total_credits,
        ROUND(SUM(tb.closing_balance), 2) as net_balance
    FROM trial_balance tb
    LEFT JOIN account_master am ON tb.gl_account = am.gl_account
    {where}
    GROUP BY am.account_type
    ORDER BY am.account_type
    """
    summary_df = engine.query_polars(summary_sql)

    result = {
        "row_count": len(df),
        "by_account_type": summary_df.to_dicts(),
        "rows": df.to_dicts() if len(df) <= 200 else df.head(200).to_dicts(),
        "truncated": len(df) > 200,
    }
    return json.dumps(result, default=str)


def _generate_income_statement(
    engine: DataEngine,
    period_from: int = 1,
    period_to: int = 12,
    by_lob: bool = False,
) -> str:
    """Generate a GAAP-style income statement from posting data."""
    lob_select = ", p.lob" if by_lob else ""
    lob_group = ", p.lob" if by_lob else ""

    sql = f"""
    WITH is_data AS (
        SELECT
            am.account_group,
            am.account_type,
            am.statutory_category,
            p.gl_account,
            am.description
            {lob_select},
            SUM(CASE WHEN p.debit_credit = 'D' THEN p.amount ELSE 0 END) as debits,
            SUM(CASE WHEN p.debit_credit = 'C' THEN p.amount ELSE 0 END) as credits,
            SUM(
                CASE WHEN p.debit_credit = 'D' THEN p.amount
                     ELSE -p.amount END
            ) as net_amount
        FROM postings p
        JOIN account_master am ON p.gl_account = am.gl_account
        WHERE am.account_type IN ('R', 'X')
          AND p.fiscal_period BETWEEN {period_from} AND {period_to}
        GROUP BY am.account_group, am.account_type, am.statutory_category,
                 p.gl_account, am.description {lob_group}
    )
    SELECT * FROM is_data
    ORDER BY account_type DESC, account_group, gl_account
    """

    df = engine.query_polars(sql)

    if df.is_empty():
        return json.dumps({"line_items": [], "summary": "No P&L data found for the period."})

    # Build category summaries
    category_sql = f"""
    SELECT
        am.account_type,
        am.account_group,
        COUNT(DISTINCT p.gl_account) as account_count,
        ROUND(SUM(
            CASE WHEN p.debit_credit = 'D' THEN p.amount ELSE -p.amount END
        ), 2) as net_amount
    FROM postings p
    JOIN account_master am ON p.gl_account = am.gl_account
    WHERE am.account_type IN ('R', 'X')
      AND p.fiscal_period BETWEEN {period_from} AND {period_to}
    GROUP BY am.account_type, am.account_group
    ORDER BY am.account_type DESC, am.account_group
    """
    categories_df = engine.query_polars(category_sql)

    # Revenue and expense totals
    totals_sql = f"""
    SELECT
        am.account_type,
        ROUND(SUM(
            CASE WHEN p.debit_credit = 'D' THEN p.amount ELSE -p.amount END
        ), 2) as net_amount
    FROM postings p
    JOIN account_master am ON p.gl_account = am.gl_account
    WHERE am.account_type IN ('R', 'X')
      AND p.fiscal_period BETWEEN {period_from} AND {period_to}
    GROUP BY am.account_type
    """
    totals_df = engine.query_polars(totals_sql)
    totals = {row["account_type"]: row["net_amount"] for row in totals_df.to_dicts()}

    revenue = totals.get("R", 0)
    expenses = totals.get("X", 0)
    # Revenue is typically credit (negative in debit-positive convention)
    net_income = -revenue - expenses  # flip revenue sign

    result = {
        "period": f"{period_from}-{period_to}",
        "total_revenue": round(-revenue, 2),  # flip to positive
        "total_expenses": round(expenses, 2),
        "net_income": round(net_income, 2),
        "by_category": categories_df.to_dicts(),
        "line_items": df.to_dicts() if len(df) <= 200 else df.head(200).to_dicts(),
        "truncated": len(df) > 200,
    }
    return json.dumps(result, default=str)


def _assess_dimensions(
    engine: DataEngine,
    dimensions: list[str] | None = None,
) -> str:
    """Analyze dimensional usage and quality across posting data."""
    dims = dimensions or [
        "profit_center", "cost_center", "functional_area",
        "segment", "lob", "state",
    ]

    results: dict[str, Any] = {}
    total_postings = engine.query_polars("SELECT COUNT(*) as cnt FROM postings")["cnt"][0]

    for dim in dims:
        # Usage stats
        stats_sql = f"""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN {dim} IS NOT NULL THEN 1 ELSE 0 END) as populated,
            COUNT(DISTINCT {dim}) as distinct_values,
            ROUND(
                SUM(CASE WHEN {dim} IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1
            ) as fill_rate_pct
        FROM postings
        """
        stats = engine.query_polars(stats_sql).to_dicts()[0]

        # Value distribution (top 15)
        dist_sql = f"""
        SELECT
            COALESCE({dim}, '(null)') as value,
            COUNT(*) as posting_count,
            ROUND(COUNT(*) * 100.0 / {total_postings}, 1) as pct
        FROM postings
        GROUP BY {dim}
        ORDER BY posting_count DESC
        LIMIT 15
        """
        dist = engine.query_polars(dist_sql).to_dicts()

        # Cross-dimension: which account types use this dim
        cross_sql = f"""
        SELECT
            am.account_type,
            COUNT(*) as total_postings,
            SUM(CASE WHEN p.{dim} IS NOT NULL THEN 1 ELSE 0 END) as populated,
            ROUND(
                SUM(CASE WHEN p.{dim} IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1
            ) as fill_rate_pct
        FROM postings p
        LEFT JOIN account_master am ON p.gl_account = am.gl_account
        GROUP BY am.account_type
        ORDER BY am.account_type
        """
        cross = engine.query_polars(cross_sql).to_dicts()

        results[dim] = {
            "fill_rate_pct": stats["fill_rate_pct"],
            "distinct_values": int(stats["distinct_values"]),
            "populated": int(stats["populated"]),
            "total": int(stats["total"]),
            "value_distribution": dist,
            "by_account_type": cross,
        }

    return json.dumps(results, default=str)


# ---------------------------------------------------------------------------
# Tool factory — creates bound LangChain tools for a given DataEngine
# ---------------------------------------------------------------------------


def create_gl_tools(engine: DataEngine) -> list[StructuredTool]:
    """Create LangChain tools bound to the given DataEngine instance.

    Returns a list of StructuredTool objects ready for LLM tool-binding.
    """
    return [
        StructuredTool.from_function(
            func=lambda account_filter=None, top_n=25: _profile_accounts(engine, account_filter, top_n),
            name="profile_accounts",
            description=(
                "Profile GL accounts by posting activity, balance behavior, and dimensional usage. "
                "Returns account-level statistics including posting counts, debit/credit totals, "
                "MJE concentration, and which dimensions (profit center, LOB, state) are used. "
                "Use this first to understand the current chart of accounts."
            ),
            args_schema=ProfileAccountsInput,
        ),
        StructuredTool.from_function(
            func=lambda min_occurrences=3, include_details=False: _detect_mje(engine, min_occurrences, include_details),
            name="detect_mje",
            description=(
                "Detect manual journal entry (MJE) patterns in the GL posting data. "
                "Identifies recurring identical entries, high MJE concentration accounts, "
                "accrual/reversal pairs, and intercompany patterns. "
                "Use this to find automation opportunities and COA design improvements."
            ),
            args_schema=DetectMJEInput,
        ),
        StructuredTool.from_function(
            func=lambda fiscal_period=None, account_type_filter=None: _compute_trial_balance(
                engine, fiscal_period, account_type_filter
            ),
            name="compute_trial_balance",
            description=(
                "Retrieve the trial balance with opening/closing balances, period debits/credits. "
                "Can filter by fiscal period and account type. "
                "Returns both detail rows and summary by account type."
            ),
            args_schema=TrialBalanceInput,
        ),
        StructuredTool.from_function(
            func=lambda period_from=1, period_to=12, by_lob=False: _generate_income_statement(
                engine, period_from, period_to, by_lob
            ),
            name="generate_income_statement",
            description=(
                "Generate a GAAP-style income statement from GL posting data. "
                "Shows revenue and expense categories with net amounts. "
                "Can break down by line of business. Returns total revenue, "
                "total expenses, net income, and line-item detail."
            ),
            args_schema=IncomeStatementInput,
        ),
        StructuredTool.from_function(
            func=lambda dimensions=None: _assess_dimensions(engine, dimensions),
            name="assess_dimensions",
            description=(
                "Analyze the quality and usage of dimensional fields (profit center, "
                "cost center, functional area, segment, LOB, state) in posting data. "
                "Returns fill rates, distinct value counts, value distributions, "
                "and cross-analysis by account type. Use this to identify dimensional "
                "gaps and inform code block design decisions."
            ),
            args_schema=AssessDimensionsInput,
        ),
    ]
