"""Synthetic P&C insurance GL data generator.

Generates realistic posting data, account master, and trial balance for a
mid-size P&C carrier. All data is seeded for reproducibility.

Embedded MJE patterns (documented for later detection verification):
  1. Recurring identical -- same accounts, same amounts, quarterly
  2. Recurring template -- same accounts, varying amounts monthly
  3. Reclassification -- systematic balance moves A→B each period
  4. Intercompany -- manual IC entries between company codes
  5. Accrual/reversal -- month-end accrual + next-month reversal
  6. Correction entries -- fixes posted 1-5 days after originals
  7. Consolidation adjustments -- period-end group adjustments
"""

from __future__ import annotations

import hashlib
from datetime import date, timedelta
from pathlib import Path
from typing import Any

import polars as pl

from fta_agent.data.schemas import (
    ACCOUNT_MASTER_SCHEMA,
    POSTING_SCHEMA,
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SEED = 42
COMPANY_CODE = "1000"
IC_COMPANY_CODE = "2000"  # Intercompany partner
CURRENCY = "USD"
FISCAL_YEAR = 2025

# P&C lines of business
LOBS = ["AUTO", "HOME", "COMML", "WC"]

# US states (top 12 by premium volume)
STATES = ["CA", "FL", "TX", "NY", "PA", "IL", "OH", "NJ", "GA", "NC", "MI", "VA"]

# Functional areas (insurance-specific)
FUNCTIONAL_AREAS = ["CLM", "ACQ", "ADM", "INV", "LAE", "PHD"]

# Profit centers (one per LOB)
PROFIT_CENTERS = {
    "AUTO": "PC1000",
    "HOME": "PC2000",
    "COMML": "PC3000",
    "WC": "PC4000",
}

SEGMENTS = {"AUTO": "PC", "HOME": "PC", "COMML": "PC", "WC": "PC"}

# Cost centers
COST_CENTERS = [
    "CC1000",  # Claims Operations
    "CC1100",  # Claims Adjusting
    "CC2000",  # Underwriting
    "CC2100",  # Actuarial
    "CC3000",  # Finance
    "CC3100",  # Accounting
    "CC4000",  # IT
    "CC5000",  # Legal
    "CC6000",  # HR
    "CC7000",  # Executive
]

# Users / preparers for MJE analysis
USERS = {
    "SYSTEM": "SYSTEM",  # Automated postings
    "JSMITH": "JSMITH",  # Jackie Smith -- high MJE volume (key person risk)
    "MBROWN": "MBROWN",  # Mike Brown -- moderate volume
    "ACHEN": "ACHEN",  # Amy Chen -- low volume
    "DWILSON": "DWILSON",  # David Wilson -- occasional
    "LJONES": "LJONES",  # Lisa Jones -- manager, reviews only
    "RLOPEZ": "RLOPEZ",  # Interface postings
}

# Document types
DOC_TYPES = {
    "SA": "STD",  # Standard GL posting
    "AB": "STD",  # Accounting document
    "KR": "STD",  # Vendor invoice
    "KG": "STD",  # Vendor credit memo
    "DR": "STD",  # Customer invoice
    "DG": "STD",  # Customer credit memo
    "MJ": "MJE",  # Manual journal entry
    "AC": "ACC",  # Accrual
    "RE": "REC",  # Recurring entry
    "CL": "CLR",  # Clearing
    "IF": "INT",  # Interface posting
}


# ---------------------------------------------------------------------------
# Deterministic random number generator (no numpy dependency)
# ---------------------------------------------------------------------------


class SeededRNG:
    """Simple deterministic RNG based on hash mixing.

    Good enough for generating realistic synthetic data patterns.
    Not cryptographically secure -- not needed here.
    """

    def __init__(self, seed: int) -> None:
        self._state = seed

    def _next(self) -> int:
        self._state = int(
            hashlib.md5(str(self._state).encode()).hexdigest()[:8],
            16,
        ) % (2**31)
        return self._state

    def random(self) -> float:
        """Return float in [0, 1)."""
        return self._next() / (2**31)

    def randint(self, lo: int, hi: int) -> int:
        """Return int in [lo, hi] inclusive."""
        return lo + self._next() % (hi - lo + 1)

    def choice(self, seq: list[Any]) -> Any:
        """Pick one element."""
        return seq[self.randint(0, len(seq) - 1)]

    def gauss(self, mu: float, sigma: float) -> float:
        """Approximate gaussian using Box-Muller-ish approach."""
        import math

        u1 = max(self.random(), 1e-10)
        u2 = self.random()
        z = math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)
        return mu + sigma * z

    def sample(self, seq: list[Any], k: int) -> list[Any]:
        """Sample k unique elements."""
        pool = list(seq)
        result = []
        for _ in range(min(k, len(pool))):
            idx = self.randint(0, len(pool) - 1)
            result.append(pool.pop(idx))
        return result


# ---------------------------------------------------------------------------
# Account master generator
# ---------------------------------------------------------------------------


def _build_account_master() -> list[dict[str, Any]]:
    """Build a realistic P&C account master (~2,500 accounts)."""
    accounts: list[dict[str, Any]] = []

    def add(
        acct: str,
        desc: str,
        atype: str,
        group: str,
        *,
        recon: bool = False,
        oim: bool = False,
        stat_cat: str | None = None,
        fa: str | None = None,
        active: bool = True,
    ) -> None:
        accounts.append(
            {
                "gl_account": acct,
                "description": desc,
                "account_type": atype,
                "account_group": group,
                "is_reconciliation_account": recon,
                "open_item_management": oim,
                "line_item_display": True,
                "statutory_category": stat_cat,
                "functional_area_default": fa,
                "is_active": active,
            }
        )

    # ---- Assets (1xxxxx) ----
    # Cash and investments
    add("100000", "Cash - Operating", "A", "CASH", recon=True, oim=True)
    add("100100", "Cash - Claims", "A", "CASH", recon=True, oim=True)
    add("100200", "Cash - Payroll", "A", "CASH", recon=True, oim=True)
    add("101000", "Short-Term Investments", "A", "INVST")
    add("101100", "Fixed Maturity Securities", "A", "INVST")
    add("101200", "Equity Securities", "A", "INVST")
    add("101300", "Mortgage Loans", "A", "INVST")
    add("101400", "Real Estate Investments", "A", "INVST")
    add("101500", "Policy Loans", "A", "INVST")

    # Premiums receivable
    for lob in LOBS:
        add(
            f"110{LOBS.index(lob)}00",
            f"Premiums Receivable - {lob}",
            "A",
            "PREC",
            recon=True,
            oim=True,
            stat_cat="Premiums",
        )
        add(
            f"110{LOBS.index(lob)}10",
            f"Agents Balances - {lob}",
            "A",
            "PREC",
            recon=True,
            oim=True,
        )

    # Reinsurance recoverables
    add(
        "120000",
        "Reinsurance Recoverables - Paid Losses",
        "A",
        "REIN",
        stat_cat="Reinsurance",
    )
    add(
        "120100",
        "Reinsurance Recoverables - Case Reserves",
        "A",
        "REIN",
        stat_cat="Reinsurance",
    )
    add(
        "120200", "Reinsurance Recoverables - IBNR", "A", "REIN", stat_cat="Reinsurance"
    )
    add("120300", "Ceded Unearned Premium", "A", "REIN", stat_cat="Reinsurance")
    add("120400", "Reinsurance Recoverables - LAE", "A", "REIN", stat_cat="Reinsurance")

    # Deferred acquisition costs (DAC)
    for lob in LOBS:
        add(
            f"130{LOBS.index(lob)}00",
            f"Deferred Acquisition Costs - {lob}",
            "A",
            "DAC",
            stat_cat="DAC",
        )

    # Other assets
    add("140000", "Furniture and Equipment", "A", "FIXED")
    add("140100", "Accumulated Depreciation - F&E", "A", "FIXED")
    add("141000", "Software", "A", "FIXED")
    add("141100", "Accumulated Amortization - Software", "A", "FIXED")
    add("150000", "Prepaid Expenses", "A", "PREP")
    add("150100", "Prepaid Reinsurance", "A", "PREP")
    add("160000", "Intercompany Receivable", "A", "IC", recon=True, oim=True)
    add("170000", "Accrued Investment Income", "A", "AINC")
    add("180000", "Salvage and Subrogation Receivable", "A", "SALV", stat_cat="Salvage")

    # ---- Liabilities (2xxxxx) ----
    # Loss reserves (the core P&C complexity)
    for lob in LOBS:
        idx = LOBS.index(lob)
        add(
            f"200{idx}00",
            f"Case Reserves - {lob}",
            "L",
            "LRSV",
            stat_cat="Loss Reserves",
        )
        add(
            f"200{idx}10",
            f"IBNR Reserves - {lob}",
            "L",
            "LRSV",
            stat_cat="Loss Reserves",
        )
        add(
            f"200{idx}20", f"LAE Reserves - {lob}", "L", "LRSV", stat_cat="LAE Reserves"
        )
        add(
            f"200{idx}30",
            f"Salvage & Subrogation Reserve - {lob}",
            "L",
            "LRSV",
            stat_cat="Salvage",
        )

    # Unearned premium reserves
    for lob in LOBS:
        add(
            f"210{LOBS.index(lob)}00",
            f"Unearned Premium Reserve - {lob}",
            "L",
            "UPR",
            stat_cat="UPR",
        )

    # Other liabilities
    add("220000", "Accounts Payable", "L", "AP", recon=True, oim=True)
    add("220100", "Commissions Payable", "L", "AP", recon=True, oim=True)
    add("220200", "Premium Taxes Payable", "L", "TAX")
    add("220300", "Federal Income Tax Payable", "L", "TAX")
    add("220400", "Accrued Expenses", "L", "ACCR")
    add("220500", "Unearned Revenue - Other", "L", "ACCR")
    add(
        "230000",
        "Reinsurance Payable",
        "L",
        "REIN",
        recon=True,
        oim=True,
        stat_cat="Reinsurance",
    )
    add("240000", "Intercompany Payable", "L", "IC", recon=True, oim=True)
    add(
        "250000",
        "Funds Held Under Reinsurance Treaties",
        "L",
        "REIN",
        stat_cat="Reinsurance",
    )
    add(
        "260000",
        "Ceded Reinsurance Premiums Payable",
        "L",
        "REIN",
        stat_cat="Reinsurance",
    )

    # ---- Equity (3xxxxx) ----
    add("300000", "Common Stock", "E", "EQTY")
    add("300100", "Additional Paid-In Capital", "E", "EQTY")
    add("310000", "Retained Earnings", "E", "EQTY")
    add("320000", "Unrealized Gains/Losses - Investments", "E", "EQTY")
    add("330000", "Treasury Stock", "E", "EQTY")

    # ---- Revenue (4xxxxx) ----
    # Premiums
    for lob in LOBS:
        idx = LOBS.index(lob)
        add(
            f"400{idx}00",
            f"Direct Premiums Written - {lob}",
            "R",
            "PREM",
            stat_cat="Premiums Written",
        )
        add(
            f"400{idx}10",
            f"Direct Premiums Earned - {lob}",
            "R",
            "PREM",
            stat_cat="Premiums Earned",
        )
        add(
            f"400{idx}20",
            f"Ceded Premiums - {lob}",
            "R",
            "PREM",
            stat_cat="Ceded Premiums",
        )
        add(
            f"400{idx}30",
            f"Net Premiums Earned - {lob}",
            "R",
            "PREM",
            stat_cat="Net Premiums",
        )

    # Investment income
    add(
        "410000",
        "Net Investment Income",
        "R",
        "IINC",
        fa="INV",
        stat_cat="Investment Income",
    )
    add("410100", "Interest Income - Bonds", "R", "IINC", fa="INV")
    add("410200", "Dividend Income", "R", "IINC", fa="INV")
    add("410300", "Realized Capital Gains", "R", "IINC", fa="INV")
    add("410400", "Realized Capital Losses", "R", "IINC", fa="INV")
    add("410500", "Unrealized Gains - Trading", "R", "IINC", fa="INV")

    # Other revenue
    add("420000", "Fee Income", "R", "OREV")
    add("420100", "Service Revenue", "R", "OREV")

    # ---- Expenses (5xxxxx - 7xxxxx) ----
    # Losses and LAE (5xxxxx)
    for lob in LOBS:
        idx = LOBS.index(lob)
        add(
            f"500{idx}00",
            f"Losses Incurred - {lob}",
            "X",
            "LOSS",
            fa="LAE",
            stat_cat="Losses Incurred",
        )
        add(
            f"500{idx}10",
            f"Case Reserve Movement - {lob}",
            "X",
            "LOSS",
            fa="LAE",
            stat_cat="Losses Incurred",
        )
        add(
            f"500{idx}20",
            f"IBNR Reserve Movement - {lob}",
            "X",
            "LOSS",
            fa="LAE",
            stat_cat="Losses Incurred",
        )
        add(
            f"500{idx}30",
            f"Loss Adjustment Expense - {lob}",
            "X",
            "LOSS",
            fa="LAE",
            stat_cat="LAE",
        )
        add(
            f"500{idx}40",
            f"Salvage & Subrogation - {lob}",
            "X",
            "LOSS",
            fa="LAE",
            stat_cat="Salvage",
        )

    # Acquisition costs (6xxxxx)
    for lob in LOBS:
        idx = LOBS.index(lob)
        add(
            f"600{idx}00",
            f"Agent Commissions - {lob}",
            "X",
            "AQCST",
            fa="ACQ",
            stat_cat="Commissions",
        )
        add(f"600{idx}10", f"Broker Fees - {lob}", "X", "AQCST", fa="ACQ")
        add(f"600{idx}20", f"Policy Issuance Costs - {lob}", "X", "AQCST", fa="ACQ")
        add(
            f"600{idx}30",
            f"DAC Amortization - {lob}",
            "X",
            "AQCST",
            fa="ACQ",
            stat_cat="DAC Amort",
        )

    # Operating expenses (7xxxxx)
    # Claims operations
    add("700000", "Claims Salaries & Benefits", "X", "OPEX", fa="CLM")
    add("700100", "Claims Consulting & Professional", "X", "OPEX", fa="CLM")
    add("700200", "Claims Technology", "X", "OPEX", fa="CLM")
    add("700300", "Claims Travel", "X", "OPEX", fa="CLM")
    # Underwriting
    add("710000", "Underwriting Salaries & Benefits", "X", "OPEX", fa="ACQ")
    add("710100", "Underwriting Data & Analytics", "X", "OPEX", fa="ACQ")
    add("710200", "Marketing & Advertising", "X", "OPEX", fa="ACQ")
    # Administrative
    add("720000", "Admin Salaries & Benefits", "X", "OPEX", fa="ADM")
    add("720100", "Rent & Occupancy", "X", "OPEX", fa="ADM")
    add("720200", "Depreciation & Amortization", "X", "OPEX", fa="ADM")
    add("720300", "Professional Fees", "X", "OPEX", fa="ADM")
    add("720400", "Technology & Systems", "X", "OPEX", fa="ADM")
    add("720500", "Office Supplies", "X", "OPEX", fa="ADM")
    add("720600", "Telephone & Communications", "X", "OPEX", fa="ADM")
    add("720700", "Postage & Shipping", "X", "OPEX", fa="ADM")
    add("720800", "Insurance Expense", "X", "OPEX", fa="ADM")
    add("720900", "Miscellaneous Admin", "X", "OPEX", fa="ADM")
    # Investment expenses
    add("730000", "Investment Management Fees", "X", "OPEX", fa="INV")
    add("730100", "Custodian Fees", "X", "OPEX", fa="INV")
    # Taxes, licenses, fees
    add("740000", "State Premium Taxes", "X", "TAX", stat_cat="Taxes")
    add("740100", "Licenses & Fees", "X", "TAX", stat_cat="Taxes")
    add("740200", "Federal Income Tax", "X", "TAX", stat_cat="Taxes")
    add("740300", "Guaranty Fund Assessments", "X", "TAX", stat_cat="Taxes")
    # Reinsurance expense
    add("750000", "Reinsurance Ceding Commission", "X", "REIN", stat_cat="Reinsurance")
    add("750100", "Reinsurance Premium Expense", "X", "REIN", stat_cat="Reinsurance")
    # Policyholder dividends
    add(
        "760000",
        "Policyholder Dividends",
        "X",
        "PHDIV",
        fa="PHD",
        stat_cat="Policyholder Dividends",
    )

    # ---- Dormant / low-activity accounts ----
    # Historical accounts no longer actively used
    add("190000", "Legacy Suspense Account", "A", "SUSP", active=False)
    add("190100", "Prior Acquisition Receivable", "A", "MISC", active=False)
    add("290000", "Legacy Reserve - Discontinued LOB", "L", "LRSV", active=False)
    add("490000", "Discontinued Product Revenue", "R", "MISC", active=False)
    add("590000", "Discontinued LOB Losses", "X", "MISC", active=False)

    # Now bulk-generate additional accounts to reach ~2,500
    # These are sub-accounts and state-level detail accounts
    rng = SeededRNG(SEED + 1000)
    existing = {a["gl_account"] for a in accounts}
    # State-level premium and loss accounts per LOB
    for lob in LOBS:
        idx = LOBS.index(lob)
        for si, st in enumerate(STATES):
            acct_prem = f"40{idx}{si + 50:02d}"
            if acct_prem not in existing:
                add(acct_prem, f"Premium Written - {lob} - {st}", "R", "PREM")
                existing.add(acct_prem)
            acct_loss = f"50{idx}{si + 50:02d}"
            if acct_loss not in existing:
                add(acct_loss, f"Loss Incurred - {lob} - {st}", "X", "LOSS", fa="LAE")
                existing.add(acct_loss)

    # Generate filler accounts to get closer to 2,500
    categories = [
        ("15", "A", "Prepaid - Misc"),
        ("16", "A", "Receivable - Misc"),
        ("22", "L", "Payable - Misc"),
        ("72", "X", "Operating Expense - Misc"),
    ]
    target_total = 2500
    acct_num = 800000
    while len(accounts) < target_total:
        cat = categories[rng.randint(0, len(categories) - 1)]
        acct_str = str(acct_num)
        if acct_str not in existing:
            is_active = rng.random() > 0.15  # 15% dormant
            add(
                acct_str,
                f"{cat[2]} {acct_num - 800000 + 1:04d}",
                cat[1],
                "MISC",
                active=is_active,
            )
            existing.add(acct_str)
        acct_num += 1

    return accounts


# ---------------------------------------------------------------------------
# Posting data generator
# ---------------------------------------------------------------------------

# MJE pattern manifest -- documents what's embedded for later verification
MJE_PATTERNS: dict[str, dict[str, Any]] = {
    "recurring_identical": {
        "description": "Jackie Smith books identical reclassification every quarter",
        "user": "JSMITH",
        "doc_type": "MJ",
        "frequency": "quarterly",
        "debit_account": "720900",  # Misc Admin
        "credit_account": "720300",  # Professional Fees
        "amount": 15000.00,
        "months": [3, 6, 9, 12],
        "expected_count": 4,  # 4 occurrences (1 per quarter)
    },
    "recurring_template": {
        "description": "Monthly allocation of shared IT costs across LOBs",
        "user": "MBROWN",
        "doc_type": "MJ",
        "frequency": "monthly",
        "source_account": "720400",  # Technology & Systems
        "target_accounts": ["700200", "710100"],  # Claims Tech, UW Analytics
        "base_amount": 50000.00,
        "variance": 0.15,
        "expected_count": 12,  # 12 months
    },
    "reclassification": {
        "description": "Systematic reclass from generic loss to LOB-specific",
        "user": "JSMITH",
        "doc_type": "MJ",
        "frequency": "monthly",
        "source_account": "500000",  # Generic Losses Incurred - AUTO
        "target_account": "500010",  # Case Reserve Movement - AUTO
        "base_amount": 125000.00,
        "variance": 0.2,
        "expected_count": 12,
    },
    "intercompany": {
        "description": "Manual IC entries for shared service charges",
        "user": "ACHEN",
        "doc_type": "MJ",
        "frequency": "monthly",
        "debit_account": "160000",  # IC Receivable
        "credit_account": "720000",  # Admin Salaries
        "base_amount": 85000.00,
        "variance": 0.1,
        "expected_count": 12,
    },
    "accrual_reversal": {
        "description": "Month-end claims accrual with next-month reversal",
        "user": "JSMITH",
        "doc_type": "AC",
        "frequency": "monthly",
        "debit_account": "500030",  # LAE - AUTO
        "credit_account": "220400",  # Accrued Expenses
        "base_amount": 200000.00,
        "variance": 0.25,
        "expected_count": 24,  # 12 accruals + 12 reversals
    },
    "correction": {
        "description": "Corrections to fix wrong LOB postings (user error)",
        "user": "DWILSON",
        "doc_type": "MJ",
        "frequency": "sporadic",
        "corrections": [
            {"month": 2, "wrong": "500000", "right": "500100", "amount": 45000.0},
            {"month": 5, "wrong": "600000", "right": "600100", "amount": 12500.0},
            {"month": 7, "wrong": "500200", "right": "500300", "amount": 78000.0},
            {"month": 9, "wrong": "400000", "right": "400010", "amount": 95000.0},
            {"month": 11, "wrong": "500000", "right": "500100", "amount": 52000.0},
        ],
        "expected_count": 10,  # 5 corrections x 2 lines each
    },
    "consolidation_adjustment": {
        "description": "Quarter-end group consolidation adjustments",
        "user": "LJONES",
        "doc_type": "MJ",
        "frequency": "quarterly",
        "adjustments": [
            {"debit": "320000", "credit": "410500", "amount": 350000.0},
            {"debit": "310000", "credit": "300100", "amount": 500000.0},
        ],
        "months": [3, 6, 9, 12],
        "expected_count": 8,  # 2 adjustments x 4 quarters
    },
}


def _generate_postings(rng: SeededRNG) -> list[dict[str, Any]]:
    """Generate ~500K-750K posting records for 12 months."""
    postings: list[dict[str, Any]] = []
    doc_counter = 0

    def next_doc() -> str:
        nonlocal doc_counter
        doc_counter += 1
        return f"{doc_counter:010d}"

    def post(
        month: int,
        day: int,
        doc_type: str,
        lines: list[dict[str, Any]],
        user: str = "SYSTEM",
        *,
        entry_day_offset: int = 0,
    ) -> None:
        doc_num = next_doc()
        posting_dt = date(FISCAL_YEAR, month, min(day, 28))
        entry_dt = posting_dt + timedelta(days=entry_day_offset)
        cat = DOC_TYPES.get(doc_type, "STD")

        for i, line in enumerate(lines):
            dc = "D" if line["amount"] >= 0 else "C"
            pk = "40" if dc == "D" else "50"
            postings.append(
                {
                    "company_code": line.get("company_code", COMPANY_CODE),
                    "fiscal_year": FISCAL_YEAR,
                    "fiscal_period": month,
                    "document_number": doc_num,
                    "line_item": i + 1,
                    "document_type": doc_type,
                    "document_category": cat,
                    "posting_date": posting_dt,
                    "entry_date": entry_dt,
                    "posting_key": pk,
                    "debit_credit": dc,
                    "gl_account": line["account"],
                    "amount": abs(line["amount"]),
                    "currency": CURRENCY,
                    "profit_center": line.get("profit_center", "PC1000"),
                    "cost_center": line.get("cost_center"),
                    "functional_area": line.get("functional_area"),
                    "segment": line.get("segment", "PC"),
                    "business_area": None,
                    "trading_partner": line.get("trading_partner"),
                    "reference": line.get("reference"),
                    "text": line.get("text"),
                    "user_id": user,
                    "state": line.get("state"),
                    "lob": line.get("lob"),
                    "accident_year": line.get("accident_year"),
                }
            )

    # --- 1. Standard operational postings (bulk of volume) ---
    for month in range(1, 13):
        # Premium postings -- multiple per day per LOB per state
        for lob in LOBS:
            idx = LOBS.index(lob)
            pc = PROFIT_CENTERS[lob]
            base_prem = {
                "AUTO": 8_000_000,
                "HOME": 5_000_000,
                "COMML": 6_000_000,
                "WC": 3_000_000,
            }[lob]

            # ~3500-4200 premium transactions per LOB per month
            n_prem = rng.randint(3500, 4200)
            for _ in range(n_prem):
                day = rng.randint(1, 28)
                st = rng.choice(STATES)
                amt = round(base_prem / n_prem * (0.5 + rng.random()), 2)
                ay = rng.choice([2024, 2025])
                post(
                    month,
                    day,
                    "SA",
                    [
                        {
                            "account": f"110{idx}00",
                            "amount": amt,
                            "profit_center": pc,
                            "lob": lob,
                            "state": st,
                            "accident_year": ay,
                        },
                        {
                            "account": f"400{idx}00",
                            "amount": -amt,
                            "profit_center": pc,
                            "lob": lob,
                            "state": st,
                            "accident_year": ay,
                        },
                    ],
                )

            # Claims payments -- fewer but larger
            n_claims = rng.randint(600, 1000)
            for _ in range(n_claims):
                day = rng.randint(1, 28)
                st = rng.choice(STATES)
                amt = round(rng.gauss(15000, 8000), 2)
                if amt < 100:
                    amt = round(100 + rng.random() * 5000, 2)
                ay = rng.choice([2022, 2023, 2024, 2025])
                post(
                    month,
                    day,
                    "KR",
                    [
                        {
                            "account": f"500{idx}00",
                            "amount": amt,
                            "profit_center": pc,
                            "lob": lob,
                            "state": st,
                            "functional_area": "LAE",
                            "accident_year": ay,
                        },
                        {
                            "account": "100100",
                            "amount": -amt,
                            "profit_center": pc,
                            "lob": lob,
                            "state": st,
                        },
                    ],
                )

            # Commission payments
            n_comm = rng.randint(300, 500)
            for _ in range(n_comm):
                day = rng.randint(1, 28)
                amt = round(rng.gauss(3000, 1500), 2)
                if amt < 50:
                    amt = round(50 + rng.random() * 1000, 2)
                post(
                    month,
                    day,
                    "KR",
                    [
                        {
                            "account": f"600{idx}00",
                            "amount": amt,
                            "profit_center": pc,
                            "lob": lob,
                            "functional_area": "ACQ",
                        },
                        {
                            "account": "220100",
                            "amount": -amt,
                            "profit_center": pc,
                            "lob": lob,
                        },
                    ],
                )

            # Reserve movements (month-end)
            for res_suffix, _res_type in [("10", "Case"), ("20", "IBNR")]:
                amt = round(rng.gauss(500000, 200000), 2)
                post(
                    month,
                    28,
                    "IF",
                    [
                        {
                            "account": f"500{idx}{res_suffix}",
                            "amount": amt,
                            "profit_center": pc,
                            "lob": lob,
                            "functional_area": "LAE",
                        },
                        {
                            "account": f"200{idx}{res_suffix[0]}0",
                            "amount": -amt,
                            "profit_center": pc,
                            "lob": lob,
                        },
                    ],
                    user="RLOPEZ",
                )

            # UPR movement (month-end)
            upr_amt = round(base_prem * 0.4 * (0.8 + rng.random() * 0.4), 2)
            post(
                month,
                28,
                "IF",
                [
                    {
                        "account": f"400{idx}10",
                        "amount": upr_amt,
                        "profit_center": pc,
                        "lob": lob,
                    },
                    {
                        "account": f"210{LOBS.index(lob)}00",
                        "amount": -upr_amt,
                        "profit_center": pc,
                        "lob": lob,
                    },
                ],
                user="RLOPEZ",
            )

        # Operating expenses (spread across cost centers)
        for cc in COST_CENTERS:
            n_opex = rng.randint(80, 150)
            for _ in range(n_opex):
                day = rng.randint(1, 28)
                # Pick an opex account based on cost center
                if "CC1" in cc:
                    accts = ["700000", "700100", "700200", "700300"]
                    fa = "CLM"
                elif "CC2" in cc:
                    accts = ["710000", "710100", "710200"]
                    fa = "ACQ"
                else:
                    accts = ["720000", "720100", "720200", "720300", "720400", "720500"]
                    fa = "ADM"
                acct = rng.choice(accts)
                amt = round(rng.gauss(5000, 3000), 2)
                if amt < 100:
                    amt = round(100 + rng.random() * 2000, 2)
                post(
                    month,
                    day,
                    "KR",
                    [
                        {
                            "account": acct,
                            "amount": amt,
                            "cost_center": cc,
                            "functional_area": fa,
                        },
                        {"account": "220000", "amount": -amt},
                    ],
                )

        # Investment income (monthly)
        inv_amt = round(rng.gauss(2_000_000, 500_000), 2)
        post(
            month,
            28,
            "SA",
            [
                {"account": "170000", "amount": inv_amt, "functional_area": "INV"},
                {"account": "410000", "amount": -inv_amt, "functional_area": "INV"},
            ],
        )

        # Tax payments (monthly accrual)
        tax_amt = round(rng.gauss(800_000, 200_000), 2)
        post(
            month,
            28,
            "SA",
            [
                {"account": "740000", "amount": tax_amt},
                {"account": "220200", "amount": -tax_amt},
            ],
        )

    # --- 2. Embedded MJE patterns ---

    # Pattern 1: Recurring identical (quarterly, Jackie Smith)
    p = MJE_PATTERNS["recurring_identical"]
    for m in p["months"]:
        post(
            m,
            25,
            p["doc_type"],
            [
                {
                    "account": p["debit_account"],
                    "amount": p["amount"],
                    "text": "Quarterly professional fees reclass",
                },
                {
                    "account": p["credit_account"],
                    "amount": -p["amount"],
                    "text": "Quarterly professional fees reclass",
                },
            ],
            user=p["user"],
        )

    # Pattern 2: Recurring template (monthly, Mike Brown)
    p = MJE_PATTERNS["recurring_template"]
    for month in range(1, 13):
        var = 1.0 + (rng.random() - 0.5) * 2 * p["variance"]
        amt = round(p["base_amount"] * var, 2)
        split1 = round(amt * 0.6, 2)
        split2 = round(amt - split1, 2)
        post(
            month,
            20,
            p["doc_type"],
            [
                {
                    "account": p["source_account"],
                    "amount": -amt,
                    "text": "IT cost allocation",
                    "functional_area": "ADM",
                },
                {
                    "account": p["target_accounts"][0],
                    "amount": split1,
                    "text": "IT cost allocation - Claims",
                    "functional_area": "CLM",
                },
                {
                    "account": p["target_accounts"][1],
                    "amount": split2,
                    "text": "IT cost allocation - UW",
                    "functional_area": "ACQ",
                },
            ],
            user=p["user"],
        )

    # Pattern 3: Reclassification (monthly, Jackie Smith)
    p = MJE_PATTERNS["reclassification"]
    for month in range(1, 13):
        var = 1.0 + (rng.random() - 0.5) * 2 * p["variance"]
        amt = round(p["base_amount"] * var, 2)
        post(
            month,
            26,
            p["doc_type"],
            [
                {
                    "account": p["target_account"],
                    "amount": amt,
                    "text": "Loss reclass to case reserve movement",
                    "lob": "AUTO",
                    "functional_area": "LAE",
                },
                {
                    "account": p["source_account"],
                    "amount": -amt,
                    "text": "Loss reclass from generic",
                    "lob": "AUTO",
                    "functional_area": "LAE",
                },
            ],
            user=p["user"],
        )

    # Pattern 4: Intercompany (monthly, Amy Chen)
    p = MJE_PATTERNS["intercompany"]
    for month in range(1, 13):
        var = 1.0 + (rng.random() - 0.5) * 2 * p["variance"]
        amt = round(p["base_amount"] * var, 2)
        post(
            month,
            22,
            p["doc_type"],
            [
                {
                    "account": p["debit_account"],
                    "amount": amt,
                    "text": "IC shared services charge",
                    "trading_partner": IC_COMPANY_CODE,
                },
                {
                    "account": p["credit_account"],
                    "amount": -amt,
                    "text": "IC shared services charge",
                    "functional_area": "ADM",
                },
            ],
            user=p["user"],
        )

    # Pattern 5: Accrual/reversal (monthly, Jackie Smith)
    p = MJE_PATTERNS["accrual_reversal"]
    for month in range(1, 13):
        var = 1.0 + (rng.random() - 0.5) * 2 * p["variance"]
        amt = round(p["base_amount"] * var, 2)
        # Accrual on last day of month
        post(
            month,
            28,
            p["doc_type"],
            [
                {
                    "account": p["debit_account"],
                    "amount": amt,
                    "text": "Claims LAE accrual",
                    "lob": "AUTO",
                    "functional_area": "LAE",
                },
                {
                    "account": p["credit_account"],
                    "amount": -amt,
                    "text": "Claims LAE accrual",
                },
            ],
            user=p["user"],
        )
        # Reversal on first day of next month (or month 1 of next year)
        rev_month = month + 1 if month < 12 else 12
        rev_day = 1 if month < 12 else 28
        post(
            rev_month,
            rev_day,
            "CL",
            [
                {
                    "account": p["credit_account"],
                    "amount": amt,
                    "text": "Reversal - Claims LAE accrual",
                },
                {
                    "account": p["debit_account"],
                    "amount": -amt,
                    "text": "Reversal - Claims LAE accrual",
                    "lob": "AUTO",
                    "functional_area": "LAE",
                },
            ],
            user=p["user"],
        )

    # Pattern 6: Corrections (sporadic, David Wilson)
    p = MJE_PATTERNS["correction"]
    for corr in p["corrections"]:
        # Original wrong entry is already in standard postings
        # Correction: reverse wrong, post to right
        post(
            corr["month"],
            min(rng.randint(5, 15), 28),
            "MJ",
            [
                {
                    "account": corr["right"],
                    "amount": corr["amount"],
                    "text": f"Correction - repost from {corr['wrong']}",
                },
                {
                    "account": corr["wrong"],
                    "amount": -corr["amount"],
                    "text": f"Correction - reverse wrong posting to {corr['wrong']}",
                },
            ],
            user="DWILSON",
            entry_day_offset=rng.randint(1, 5),
        )

    # Pattern 7: Consolidation adjustments (quarterly, Lisa Jones)
    p = MJE_PATTERNS["consolidation_adjustment"]
    for m in p["months"]:
        for adj in p["adjustments"]:
            post(
                m,
                28,
                "MJ",
                [
                    {
                        "account": adj["debit"],
                        "amount": adj["amount"],
                        "text": "Consolidation adjustment",
                    },
                    {
                        "account": adj["credit"],
                        "amount": -adj["amount"],
                        "text": "Consolidation adjustment",
                    },
                ],
                user="LJONES",
            )

    # --- 3. Additional Jackie Smith MJEs for key-person-risk signal ---
    for month in range(1, 13):
        # Jackie books 3-5 additional misc MJEs per month
        n_extra = rng.randint(3, 5)
        for _ in range(n_extra):
            day = rng.randint(20, 28)
            amt = round(rng.gauss(25000, 10000), 2)
            if amt < 1000:
                amt = 1000.0
            acct_pairs = [
                ("720900", "720300"),
                ("720400", "720200"),
                ("700000", "700100"),
                ("710000", "720000"),
            ]
            pair = rng.choice(acct_pairs)
            post(
                month,
                day,
                "MJ",
                [
                    {"account": pair[0], "amount": amt, "text": "Month-end adjustment"},
                    {
                        "account": pair[1],
                        "amount": -amt,
                        "text": "Month-end adjustment",
                    },
                ],
                user="JSMITH",
            )

    return postings


# ---------------------------------------------------------------------------
# Trial balance generator
# ---------------------------------------------------------------------------


def _generate_trial_balance(
    postings_df: pl.DataFrame, accounts_df: pl.DataFrame
) -> pl.DataFrame:
    """Derive trial balance from posting data.

    Computes opening balance, period debits/credits, closing balance,
    and cumulative balance for each account and period.
    """
    # Compute period-level aggregates from postings
    period_agg = postings_df.group_by(["gl_account", "fiscal_period"]).agg(
        pl.col("amount")
        .filter(pl.col("debit_credit") == "D")
        .sum()
        .alias("period_debits"),
        pl.col("amount")
        .filter(pl.col("debit_credit") == "C")
        .sum()
        .alias("period_credits"),
    )

    # Fill nulls with 0
    period_agg = period_agg.with_columns(
        pl.col("period_debits").fill_null(0.0),
        pl.col("period_credits").fill_null(0.0),
    )

    # Get all account+period combinations
    all_accounts = accounts_df.select("gl_account").unique()
    all_periods = pl.DataFrame({"fiscal_period": list(range(1, 13))})
    all_combos = all_accounts.join(all_periods, how="cross")

    # Join actuals
    tb = all_combos.join(
        period_agg, on=["gl_account", "fiscal_period"], how="left"
    ).with_columns(
        pl.col("period_debits").fill_null(0.0),
        pl.col("period_credits").fill_null(0.0),
    )

    # Compute balances
    tb = tb.with_columns(
        pl.lit(COMPANY_CODE).alias("company_code"),
        pl.lit(FISCAL_YEAR).alias("fiscal_year"),
        pl.lit(CURRENCY).alias("currency"),
        pl.lit(0.0).alias("opening_balance"),
    )

    # Closing = opening + debits - credits
    tb = tb.with_columns(
        (
            pl.col("opening_balance")
            + pl.col("period_debits")
            - pl.col("period_credits")
        ).alias("closing_balance")
    )

    # Cumulative balance (sort by period, cumsum of net)
    tb = tb.sort(["gl_account", "fiscal_period"])
    tb = tb.with_columns(
        (pl.col("period_debits") - pl.col("period_credits"))
        .cum_sum()
        .over("gl_account")
        .alias("cumulative_balance")
    )

    return tb.select(
        "company_code",
        "fiscal_year",
        "fiscal_period",
        "gl_account",
        "currency",
        "opening_balance",
        "period_debits",
        "period_credits",
        "closing_balance",
        "cumulative_balance",
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def generate_synthetic_data(
    seed: int = SEED,
) -> dict[str, pl.DataFrame]:
    """Generate a full set of synthetic P&C GL data.

    Returns a dict with keys: "postings", "account_master", "trial_balance".
    All DataFrames are validated against the canonical schemas.
    """
    rng = SeededRNG(seed)

    # Account master
    accounts_raw = _build_account_master()
    accounts_df = pl.DataFrame(accounts_raw, schema=ACCOUNT_MASTER_SCHEMA)

    # Posting data
    postings_raw = _generate_postings(rng)
    postings_df = pl.DataFrame(postings_raw, schema=POSTING_SCHEMA)

    # Trial balance (derived from postings)
    tb_df = _generate_trial_balance(postings_df, accounts_df)

    return {
        "postings": postings_df,
        "account_master": accounts_df,
        "trial_balance": tb_df,
    }


def save_fixtures(
    output_dir: str | Path,
    seed: int = SEED,
    *,
    formats: tuple[str, ...] = ("csv", "parquet"),
) -> dict[str, Path]:
    """Generate and save synthetic data to disk.

    Returns paths to the generated files.
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    data = generate_synthetic_data(seed)
    paths: dict[str, Path] = {}

    for name, df in data.items():
        if "csv" in formats:
            csv_path = output_path / f"{name}.csv"
            df.write_csv(csv_path)
            paths[f"{name}_csv"] = csv_path
        if "parquet" in formats:
            parquet_path = output_path / f"{name}.parquet"
            df.write_parquet(parquet_path)
            paths[f"{name}_parquet"] = parquet_path

    # Write pattern manifest
    manifest_path = output_path / "mje_patterns.md"
    _write_pattern_manifest(manifest_path)
    paths["manifest"] = manifest_path

    return paths


def _write_pattern_manifest(path: Path) -> None:
    """Write documentation of embedded MJE patterns."""
    lines = [
        "# Embedded MJE Patterns in Synthetic Data",
        "",
        f"Generated with seed: {SEED}",
        f"Fiscal year: {FISCAL_YEAR}",
        "",
        "These patterns are deliberately embedded for detection verification.",
        "The evaluation framework checks that the data pipeline finds all of them.",
        "",
        "| # | Pattern | User | Frequency | Accounts | Expected Count |",
        "|---|---------|------|-----------|----------|---------------|",
    ]

    for i, (key, p) in enumerate(MJE_PATTERNS.items(), 1):
        desc = p["description"]
        user = p.get("user", "various")
        freq = p.get("frequency", "")
        expected = p.get("expected_count", "")

        if "debit_account" in p:
            accts = f"{p['debit_account']} / {p['credit_account']}"
        elif "source_account" in p:
            tgt = p.get(
                "target_account",
                ",".join(p.get("target_accounts", [])),
            )
            accts = f"{p['source_account']} / {tgt}"
        elif "corrections" in p:
            accts = "various (corrections)"
        elif "adjustments" in p:
            accts = "various (consolidation)"
        else:
            accts = "see code"

        lines.append(
            f"| {i} | **{key}**: {desc} | {user} | {freq} | {accts} | {expected} |"
        )

    lines.extend(
        [
            "",
            "## Key Person Risk Signal",
            "",
            "- **JSMITH (Jackie Smith)** is the highest-volume MJE preparer",
            "- Books: recurring identical, reclass, accrual/reversal, "
            "plus 3-5 misc MJEs/month",
            "- Expected to be flagged by preparer analysis as concentration risk",
            "",
            "## Account Activity Patterns",
            "",
            "- ~2,500 accounts total, ~85% active, ~15% dormant/low-activity",
            "- 5 explicitly inactive accounts (190000, 190100, 290000, 490000, 590000)",
            "- State-level detail accounts for premium and loss by LOB",
            "- 4 LOBs: AUTO, HOME, COMML, WC with different volume profiles",
        ]
    )

    path.write_text("\n".join(lines) + "\n")
