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

# States with COMML detail (only 6 major states)
COMML_STATES = ["CA", "FL", "TX", "NY", "PA", "IL"]

# Functional areas (insurance-specific)
FUNCTIONAL_AREAS = ["CLM", "ACQ", "ADM", "INV", "LAE", "PHD"]

# Profit centers — expanded hierarchy with product-level detail
PROFIT_CENTERS = {
    "AUTO": "PC1000",
    "HOME": "PC2000",
    "COMML": "PC3000",
    "WC": "PC4000",
}

# Product-level profit centers
PRODUCT_PROFIT_CENTERS: dict[str, str] = {
    "PPA": "PC1100",
    "MOTO": "PC1200",
    "HO3": "PC2100",
    "HO5": "PC2200",
    "HO4": "PC2300",
    "BOP": "PC3100",
    "CGL": "PC3200",
    "CPP": "PC3300",
    "WC-GC": "PC4100",
    "WC-LD": "PC4200",
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
# Insurance-specific dimension mappings
# ---------------------------------------------------------------------------

# LOB → financial products
LOB_PRODUCTS: dict[str, list[str]] = {
    "AUTO": ["PPA", "PPA-NF", "PPA-LI", "PPA-PD", "MOTO"],
    "HOME": ["HO3", "HO5", "HO4"],
    "COMML": ["BOP", "CGL", "CPP", "CAL", "CAPD"],
    "WC": ["WC", "WC-GC", "WC-LD"],
}

# LOB → distribution channels (weighted probabilities via ordering)
LOB_CHANNELS: dict[str, list[str]] = {
    "AUTO": ["EA", "DIRECT", "DIGITAL", "IA"],
    "HOME": ["EA", "IA", "DIRECT", "DIGITAL"],
    "COMML": ["IA", "EA", "DIRECT"],
    "WC": ["IA", "EA"],
}

# LOB → claim types
LOB_CLAIM_TYPES: dict[str, list[str]] = {
    "AUTO": ["BI", "PD", "COMP", "COLL", "MED"],
    "HOME": ["PD", "LIAB", "COMP"],
    "COMML": ["BI", "PD", "LIAB"],
    "WC": ["BI", "MED"],
}

# NAIC Annual Statement line mapping
NAIC_LINES: dict[str, dict[str, str]] = {
    "1": {"description": "Fire", "lob": "HOME"},
    "2": {"description": "Allied Lines", "lob": "HOME"},
    "2.1": {"description": "Federal Flood", "lob": "HOME"},
    "4": {"description": "Homeowners Multi Peril", "lob": "HOME"},
    "5.1": {"description": "Commercial Auto Liability", "lob": "COMML"},
    "5.2": {"description": "Commercial Auto Physical Damage", "lob": "COMML"},
    "6": {"description": "Workers Compensation", "lob": "WC"},
    "12": {"description": "Earthquake", "lob": "HOME"},
    "17": {"description": "Other Liability", "lob": "COMML"},
    "19.1": {"description": "Private Passenger Auto No-Fault", "lob": "AUTO"},
    "19.2": {"description": "Other Private Passenger Auto Liability", "lob": "AUTO"},
    "19.3": {"description": "Private Passenger Auto Physical Damage", "lob": "AUTO"},
    "21.1": {"description": "Commercial Multi Peril (Non-Liability)", "lob": "COMML"},
    "21.2": {"description": "Commercial Multi Peril (Liability)", "lob": "COMML"},
}

# LOB → primary NAIC lines for posting generation
LOB_STATUTORY_LINES: dict[str, list[str]] = {
    "AUTO": ["19.1", "19.2", "19.3"],
    "HOME": ["1", "2", "4", "12"],
    "COMML": ["5.1", "5.2", "17", "21.1", "21.2"],
    "WC": ["6"],
}

# Reinsurance treaties
TREATIES = ["QS-2025-01", "XOL-2025-01", "QS-2025-02", "CAT-2025-01"]

# Opening balance ranges for BS accounts (type → (lo, hi))
OPENING_BALANCE_RANGES: dict[str, tuple[float, float]] = {
    "CASH": (50_000_000.0, 200_000_000.0),
    "INVST": (100_000_000.0, 500_000_000.0),
    "PREC": (20_000_000.0, 80_000_000.0),
    "REIN": (10_000_000.0, 50_000_000.0),
    "DAC": (5_000_000.0, 20_000_000.0),
    "FIXED": (1_000_000.0, 10_000_000.0),
    "PREP": (500_000.0, 5_000_000.0),
    "IC": (2_000_000.0, 15_000_000.0),
    "AINC": (1_000_000.0, 8_000_000.0),
    "SALV": (500_000.0, 3_000_000.0),
    "INTANG": (5_000_000.0, 30_000_000.0),
    "DTAX": (2_000_000.0, 15_000_000.0),
    "MISC_A": (100_000.0, 1_000_000.0),
    "LRSV": (-80_000_000.0, -20_000_000.0),
    "UPR": (-40_000_000.0, -10_000_000.0),
    "AP": (-5_000_000.0, -1_000_000.0),
    "TAX": (-3_000_000.0, -500_000.0),
    "ACCR": (-2_000_000.0, -500_000.0),
    "DEBT": (-50_000_000.0, -10_000_000.0),
    "MISC_L": (-1_000_000.0, -100_000.0),
    "EQTY": (-100_000_000.0, -20_000_000.0),
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
    """Build a realistic P&C account master (~3,000+ accounts).

    Includes 20 years of accumulated structural complexity:
    - Core operational accounts (SAP, 2010+)
    - Acquisition block (Midwest Mutual, 2014)
    - Discontinued LOB (Professional Liability, exited 2018)
    - Legacy numbering (pre-2010)
    - System migration duplicates (2012)
    - Regulatory-driven additions (2020+)
    - Product-encoded accounts
    """
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
        effective_from: date | None = None,
        source_system: str | None = None,
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
                "effective_from": effective_from,
                "source_system": source_system,
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
    add("101600", "LP Interests", "A", "INVST", source_system="SAP",
        effective_from=date(2015, 1, 1))
    add("101700", "Other Investments", "A", "INVST", source_system="SAP",
        effective_from=date(2012, 1, 1))

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

    add("111000", "Allowance for Doubtful Accounts", "A", "PREC",
        recon=True, source_system="SAP", effective_from=date(2012, 1, 1))

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
    add("142000", "Goodwill", "A", "INTANG", source_system="SAP",
        effective_from=date(2014, 7, 1))
    add("142100", "Purchased Intangibles", "A", "INTANG", source_system="SAP",
        effective_from=date(2014, 7, 1))
    add("142200", "Accum Amort - Intangibles", "A", "INTANG", source_system="SAP",
        effective_from=date(2014, 7, 1))
    add("150000", "Prepaid Expenses", "A", "PREP")
    add("150100", "Prepaid Reinsurance", "A", "PREP")
    add("160000", "Intercompany Receivable", "A", "IC", recon=True, oim=True)
    add("170000", "Accrued Investment Income", "A", "AINC")
    add("180000", "Salvage and Subrogation Receivable", "A", "SALV", stat_cat="Salvage")
    add("190000", "Suspense - Premium Clearing", "A", "SUSP", oim=True,
        source_system="SAP", effective_from=date(2012, 1, 1))
    add("190100", "Suspense - Claims Clearing", "A", "SUSP", oim=True,
        source_system="SAP", effective_from=date(2012, 1, 1))
    add("190200", "Deferred Tax Asset", "A", "DTAX", source_system="SAP",
        effective_from=date(2018, 1, 1))

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
    add("270000", "Deferred Tax Liability", "L", "DTAX", source_system="SAP",
        effective_from=date(2018, 1, 1))
    add("280000", "Short-Term Borrowings", "L", "DEBT", source_system="SAP",
        effective_from=date(2012, 1, 1))
    add("280100", "Current Portion LTD", "L", "DEBT", source_system="SAP",
        effective_from=date(2012, 1, 1))
    add("285000", "Senior Notes Payable", "L", "DEBT", source_system="SAP",
        effective_from=date(2012, 1, 1))
    add("285100", "Subordinated Notes", "L", "DEBT", source_system="SAP",
        effective_from=date(2015, 1, 1))
    add("286000", "Preferred Stock - Liability", "L", "DEBT", source_system="SAP",
        effective_from=date(2016, 1, 1), active=False)

    # ---- Equity (3xxxxx) ----
    add("300000", "Common Stock", "E", "EQTY")
    add("300100", "Additional Paid-In Capital", "E", "EQTY")
    add("300200", "Preferred Stock", "E", "EQTY", source_system="SAP",
        effective_from=date(2016, 1, 1))
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
    add("420200", "Intersegment Revenue", "R", "OREV", source_system="SAP",
        effective_from=date(2014, 7, 1))

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

    # Catastrophe losses + prior year reserve development + product-encoded losses
    for lob in LOBS:
        idx = LOBS.index(lob)
        add(f"500{idx}50", f"Catastrophe Losses - {lob}", "X", "LOSS", fa="LAE",
            stat_cat="Cat Losses", source_system="SAP", effective_from=date(2012, 1, 1))
        add(f"500{idx}60", f"Prior Year Reserve Development - {lob}", "X", "LOSS",
            fa="LAE", stat_cat="Reserve Development", source_system="SAP",
            effective_from=date(2012, 1, 1))
        # Product-encoded loss accounts (BI / PD split)
        add(f"500{idx}70", f"Losses Incurred - {lob} - Bodily Injury", "X", "LOSS",
            fa="LAE", stat_cat="Losses Incurred", source_system="SAP",
            effective_from=date(2020, 1, 1))
        add(f"500{idx}80", f"Losses Incurred - {lob} - Property Damage", "X", "LOSS",
            fa="LAE", stat_cat="Losses Incurred", source_system="SAP",
            effective_from=date(2020, 1, 1))

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

    # Channel-encoded commission accounts
    for lob in LOBS:
        idx = LOBS.index(lob)
        add(f"600{idx}40", f"Commission Expense - {lob} - Independent Agent", "X",
            "AQCST", fa="ACQ", stat_cat="Commissions", source_system="SAP",
            effective_from=date(2018, 1, 1))
        add(f"600{idx}50", f"Commission Expense - {lob} - Direct/Digital", "X",
            "AQCST", fa="ACQ", stat_cat="Commissions", source_system="SAP",
            effective_from=date(2018, 1, 1))

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
    # Interest expense
    add("770000", "Interest Expense - Senior Debt", "X", "INTEXP",
        source_system="SAP", effective_from=date(2012, 1, 1))
    add("770100", "Interest Expense - Subordinated Debt", "X", "INTEXP",
        source_system="SAP", effective_from=date(2015, 1, 1))
    # Service and restructuring
    add("780000", "Service Expenses", "X", "OPEX", fa="ADM",
        source_system="SAP", effective_from=date(2014, 7, 1))
    add("790000", "Restructuring Charges", "X", "OPEX", fa="ADM",
        source_system="SAP", effective_from=date(2019, 1, 1))
    # Intangible amortization
    add("720250", "Amort of Purchased Intangibles", "X", "OPEX", fa="ADM",
        source_system="SAP", effective_from=date(2014, 7, 1))
    # Policyholder dividends
    add(
        "760000",
        "Policyholder Dividends",
        "X",
        "PHDIV",
        fa="PHD",
        stat_cat="Policyholder Dividends",
    )

    # ---- Dormant / low-activity accounts (renamed 190000 series) ----
    add("191000", "Legacy Suspense Account", "A", "SUSP", active=False,
        source_system="Legacy", effective_from=date(2006, 1, 1))
    add("191100", "Prior Acquisition Receivable", "A", "MISC", active=False,
        source_system="Legacy", effective_from=date(2008, 1, 1))
    add("290000", "Legacy Reserve - Discontinued LOB", "L", "LRSV", active=False,
        source_system="Legacy", effective_from=date(2007, 1, 1))
    add("490000", "Discontinued Product Revenue", "R", "MISC", active=False,
        source_system="Legacy", effective_from=date(2008, 1, 1))
    add("590000", "Discontinued LOB Losses", "X", "MISC", active=False,
        source_system="Legacy", effective_from=date(2008, 1, 1))

    # ================================================================
    # State-level premium and loss accounts per LOB
    # ================================================================
    rng = SeededRNG(SEED + 1000)
    existing = {a["gl_account"] for a in accounts}

    for lob in LOBS:
        idx = LOBS.index(lob)
        states_for_lob = STATES if lob in ("AUTO", "HOME") else COMML_STATES
        for si, st in enumerate(states_for_lob):
            acct_prem = f"40{idx}{si + 50:02d}"
            if acct_prem not in existing:
                add(acct_prem, f"Premium Written - {lob} - {st}", "R", "PREM",
                    source_system="SAP")
                existing.add(acct_prem)
            acct_loss = f"50{idx}{si + 50:02d}"
            if acct_loss not in existing:
                add(acct_loss, f"Loss Incurred - {lob} - {st}", "X", "LOSS",
                    fa="LAE", source_system="SAP")
                existing.add(acct_loss)

    # ================================================================
    # Part 3a: Acquisition block — "Midwest Mutual" (acquired ~2014)
    # ~40 accounts, 800100-800199, "MM-" prefix, 60% inactive
    # ================================================================
    mm_acq_date = date(2014, 7, 1)
    mm_categories = [
        ("A", "CASH", "MM-Cash Account"),
        ("A", "PREC", "MM-Premium Receivable"),
        ("A", "INVST", "MM-Investment"),
        ("L", "LRSV", "MM-Loss Reserve"),
        ("L", "UPR", "MM-Unearned Premium"),
        ("L", "AP", "MM-Accounts Payable"),
        ("R", "PREM", "MM-Premium"),
        ("X", "LOSS", "MM-Loss Expense"),
        ("X", "OPEX", "MM-Operating Expense"),
    ]
    for i in range(40):
        acct_str = f"80{100 + i:04d}"
        if acct_str not in existing:
            cat = mm_categories[i % len(mm_categories)]
            is_active = rng.random() > 0.60  # 60% inactive (migrated off)
            add(acct_str, f"{cat[2]} {i + 1:03d}", cat[0], cat[1],
                active=is_active, effective_from=mm_acq_date,
                source_system="MM-Acquired")
            existing.add(acct_str)

    # ================================================================
    # Part 3b: Discontinued LOB — Professional Liability (exited ~2018)
    # ~15 accounts, all inactive
    # ================================================================
    pl_accounts = [
        ("850000", "Prof Liab - Direct Premiums Written", "R", "PREM", "11"),
        ("850010", "Prof Liab - Premiums Earned", "R", "PREM", "17"),
        ("850100", "Prof Liab - Losses Incurred", "X", "LOSS", "11"),
        ("850110", "Prof Liab - Case Reserves", "X", "LOSS", "11"),
        ("850120", "Prof Liab - IBNR Reserves", "X", "LOSS", "11"),
        ("850130", "Prof Liab - LAE", "X", "LOSS", "17"),
        ("850200", "Prof Liab - Commission Expense", "X", "AQCST", None),
        ("850300", "Prof Liab - Case Reserve Liability", "L", "LRSV", "11"),
        ("850310", "Prof Liab - IBNR Reserve Liability", "L", "LRSV", "11"),
        ("850320", "Prof Liab - LAE Reserve Liability", "L", "LRSV", "17"),
        ("850400", "Prof Liab - UPR", "L", "UPR", None),
        ("850500", "Prof Liab - Reinsurance Recoverable", "A", "REIN", None),
        ("850600", "Prof Liab - Ceded Premium", "R", "PREM", None),
        ("850700", "Prof Liab - Premiums Receivable", "A", "PREC", None),
        ("850800", "Prof Liab - DAC", "A", "DAC", None),
    ]
    for acct_str, desc, atype, group, stat in pl_accounts:
        eff = date(rng.randint(2008, 2012), 1, 1)
        add(acct_str, desc, atype, group, active=False, stat_cat=stat,
            effective_from=eff, source_system="SAP")
        existing.add(acct_str)

    # ================================================================
    # Part 3c: Legacy numbering (pre-2010 era) — ~20 accounts
    # ================================================================
    legacy_descs = [
        ("860000", "A", "MISC", "Old Cash - Main"),
        ("860100", "A", "MISC", "Old Investment Pool A"),
        ("860200", "A", "MISC", "Old Investment Pool B"),
        ("860300", "A", "MISC", "Old Receivables - Combined"),
        ("860400", "A", "MISC", "Old Prepaid - General"),
        ("861000", "L", "MISC", "Old Reserves - Combined"),
        ("861100", "L", "MISC", "Old AP - Combined"),
        ("861200", "L", "MISC", "Old UPR - Combined"),
        ("862000", "R", "MISC", "Old Premium Income - Combined"),
        ("862100", "R", "MISC", "Old Investment Income"),
        ("863000", "X", "MISC", "Old Loss Expense - Combined"),
        ("863100", "X", "MISC", "Old Commission - Combined"),
        ("863200", "X", "MISC", "Old Operating - Salaries"),
        ("863300", "X", "MISC", "Old Operating - Rent"),
        ("863400", "X", "MISC", "Old Operating - Other"),
        ("864000", "E", "MISC", "Old Retained Earnings"),
        ("864100", "E", "MISC", "Old Capital Stock"),
        ("865000", "A", "MISC", "Old Reinsurance Recv"),
        ("865100", "L", "MISC", "Old Reinsurance Payable"),
        ("866000", "X", "MISC", "Old Tax Expense - Combined"),
    ]
    for acct_str, atype, group, desc in legacy_descs:
        eff = date(rng.randint(2006, 2009), 1, 1)
        add(acct_str, desc, atype, group, active=False,
            effective_from=eff, source_system="Legacy")
        existing.add(acct_str)

    # ================================================================
    # Part 3d: System migration duplicates (~2012 SAP migration) — ~25 pairs
    # Legacy account maps to new SAP account
    # ================================================================
    migration_pairs = [
        ("867000", "100000", "Cash - Main (Legacy)"),
        ("867100", "101100", "FMS (Legacy)"),
        ("867200", "101200", "Equities (Legacy)"),
        ("867300", "110000", "Prem Recv AUTO (Legacy)"),
        ("867400", "110100", "Prem Recv HOME (Legacy)"),
        ("867500", "120000", "RI Recv Paid (Legacy)"),
        ("867600", "200000", "Case Rsv AUTO (Legacy)"),
        ("867700", "200100", "Case Rsv HOME (Legacy)"),
        ("867800", "210000", "UPR AUTO (Legacy)"),
        ("867900", "210100", "UPR HOME (Legacy)"),
        ("868000", "220000", "AP (Legacy)"),
        ("868100", "300000", "Common Stock (Legacy)"),
        ("868200", "310000", "Retained Earnings (Legacy)"),
        ("868300", "400000", "DPW AUTO (Legacy)"),
        ("868400", "400100", "DPW HOME (Legacy)"),
        ("868500", "500000", "Loss AUTO (Legacy)"),
        ("868600", "500100", "Loss HOME (Legacy)"),
        ("868700", "600000", "Comm AUTO (Legacy)"),
        ("868800", "600100", "Comm HOME (Legacy)"),
        ("868900", "700000", "Claims Sal (Legacy)"),
        ("869000", "720000", "Admin Sal (Legacy)"),
        ("869100", "740000", "Premium Tax (Legacy)"),
        ("869200", "410000", "Inv Income (Legacy)"),
        ("869300", "170000", "Accrued Inv Inc (Legacy)"),
        ("869400", "150000", "Prepaid Exp (Legacy)"),
    ]
    for old_acct, _new_acct, desc in migration_pairs:
        atype = "A"  # simplified — actual type doesn't matter since inactive
        if old_acct in ("868000", "868100", "868200"):
            atype = "L" if old_acct == "868000" else "E"
        elif old_acct >= "868300" and old_acct <= "868400":
            atype = "R"
        elif old_acct >= "868500":
            atype = "X"
        add(old_acct, desc, atype, "MISC", active=False,
            effective_from=date(2008, 1, 1), source_system="Legacy")
        existing.add(old_acct)

    # ================================================================
    # Part 3e: Regulatory-driven additions (post-2020)
    # ================================================================
    regulatory_accounts = [
        ("500090", "COVID-19 Loss Reserve - AUTO", "X", "LOSS", date(2020, 3, 1)),
        ("500190", "COVID-19 Loss Reserve - HOME", "X", "LOSS", date(2020, 3, 1)),
        ("200090", "COVID-19 Case Reserve - AUTO", "L", "LRSV", date(2020, 3, 1)),
        ("200190", "COVID-19 Case Reserve - HOME", "L", "LRSV", date(2020, 3, 1)),
        ("500095", "Cyber Risk Losses - COMML", "X", "LOSS", date(2021, 1, 1)),
        ("200295", "Cyber Risk Reserve - COMML", "L", "LRSV", date(2021, 1, 1)),
        ("500096", "Climate Cat Model Adjustment - HOME", "X", "LOSS", date(2022, 1, 1)),
        ("500097", "Climate Cat Model Adjustment - AUTO", "X", "LOSS", date(2022, 1, 1)),
        ("200196", "LDTI Reserve Adjustment - HOME", "L", "LRSV", date(2023, 1, 1)),
        ("200296", "LDTI Reserve Adjustment - COMML", "L", "LRSV", date(2023, 1, 1)),
        ("740400", "Climate Risk Disclosure Expense", "X", "TAX", date(2023, 7, 1)),
        ("720950", "ESG Reporting Expense", "X", "OPEX", date(2023, 1, 1)),
        ("720960", "Cyber Security Expense", "X", "OPEX", date(2021, 6, 1)),
        ("101800", "Digital Asset Holdings", "A", "INVST", date(2024, 1, 1)),
        ("740500", "Digital Asset Regulatory Fee", "X", "TAX", date(2024, 1, 1)),
    ]
    for acct_str, desc, atype, group, eff in regulatory_accounts:
        if acct_str not in existing:
            add(acct_str, desc, atype, group, effective_from=eff,
                source_system="SAP")
            existing.add(acct_str)

    # ================================================================
    # Generate filler accounts to reach ~3,000+
    # ================================================================
    categories = [
        ("15", "A", "Prepaid - Misc"),
        ("16", "A", "Receivable - Misc"),
        ("22", "L", "Payable - Misc"),
        ("72", "X", "Operating Expense - Misc"),
    ]
    target_total = 3100
    acct_num = 870000
    while len(accounts) < target_total:
        cat = categories[rng.randint(0, len(categories) - 1)]
        acct_str = str(acct_num)
        if acct_str not in existing:
            is_active = rng.random() > 0.20  # 20% dormant
            eff_year = rng.randint(2008, 2023)
            src = "SAP" if eff_year >= 2012 else "Legacy"
            add(
                acct_str,
                f"{cat[2]} {acct_num - 870000 + 1:04d}",
                cat[1],
                "MISC",
                active=is_active,
                effective_from=date(eff_year, 1, 1),
                source_system=src,
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
    """Generate ~1M-2M posting records for 12 months.

    Includes scaled operational postings with insurance-specific dimensions,
    seasonal patterns, cat losses, reinsurance, multi-line JEs, backdated
    entries, suspense clearing, cross-LOB allocations, and all 7 MJE patterns.
    """
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
                    "financial_product": line.get("financial_product"),
                    "statutory_line": line.get("statutory_line"),
                    "treaty_id": line.get("treaty_id"),
                    "claim_type": line.get("claim_type"),
                    "distribution_channel": line.get("distribution_channel"),
                    "policy_year": line.get("policy_year"),
                }
            )

    # --- 1. Standard operational postings (bulk of volume) ---
    for month in range(1, 13):
        # Determine backdating rate for this month's postings
        is_year_end = month >= 11

        # Premium postings -- multiple per day per LOB per state
        for lob in LOBS:
            idx = LOBS.index(lob)
            pc = PROFIT_CENTERS[lob]
            products = LOB_PRODUCTS[lob]
            channels = LOB_CHANNELS[lob]
            stat_lines = LOB_STATUTORY_LINES[lob]
            states_for_lob = STATES if lob in ("AUTO", "HOME") else (
                COMML_STATES if lob == "COMML" else ["CA"])  # WC: LOB-level only
            base_prem = {
                "AUTO": 8_000_000,
                "HOME": 5_000_000,
                "COMML": 6_000_000,
                "WC": 3_000_000,
            }[lob]

            # HOME seasonality: heavier spring renewals
            prem_seasonal = 1.0
            if lob == "HOME" and month in (3, 4, 5, 6):
                prem_seasonal = 1.3
            elif lob == "HOME" and month in (11, 12):
                prem_seasonal = 0.7

            # ~6000-8000 premium transactions per LOB per month (scaled up)
            n_prem = int(rng.randint(6000, 8000) * prem_seasonal)
            for _ in range(n_prem):
                day = rng.randint(1, 28)
                st = rng.choice(states_for_lob)
                amt = round(base_prem / 7000 * (0.5 + rng.random()), 2)
                ay = rng.choice([2024, 2025])
                fp = rng.choice(products)
                ch = rng.choice(channels)
                sl = rng.choice(stat_lines)
                py = rng.choice([2024, 2025])
                # Product profit center (AUTO uses financial_product column)
                ppc = PRODUCT_PROFIT_CENTERS.get(fp, pc)

                # Backdating: ~2% of postings
                bd_offset = 0
                if rng.random() < 0.02:
                    bd_offset = rng.randint(3, 30)

                post(
                    month, day, "SA",
                    [
                        {
                            "account": f"110{idx}00", "amount": amt,
                            "profit_center": ppc, "lob": lob, "state": st,
                            "accident_year": ay, "financial_product": fp,
                            "statutory_line": sl, "distribution_channel": ch,
                            "policy_year": py,
                        },
                        {
                            "account": f"400{idx}00", "amount": -amt,
                            "profit_center": ppc, "lob": lob, "state": st,
                            "accident_year": ay, "financial_product": fp,
                            "statutory_line": sl, "distribution_channel": ch,
                            "policy_year": py,
                        },
                    ],
                    entry_day_offset=bd_offset,
                )

            # Claims payments -- scaled up with claim type + statutory line
            n_claims = rng.randint(1500, 2500)
            claim_types = LOB_CLAIM_TYPES[lob]
            for _ in range(n_claims):
                day = rng.randint(1, 28)
                st = rng.choice(states_for_lob)
                amt = round(rng.gauss(15000, 8000), 2)
                if amt < 100:
                    amt = round(100 + rng.random() * 5000, 2)
                ay = rng.choice([2022, 2023, 2024, 2025])
                ct = rng.choice(claim_types)
                fp = rng.choice(products)
                sl = rng.choice(stat_lines)
                # Use product-encoded accounts for ~40% of claims (BI/PD split)
                loss_acct = f"500{idx}00"
                if ct == "BI" and rng.random() < 0.4:
                    loss_acct = f"500{idx}70"
                elif ct == "PD" and rng.random() < 0.4:
                    loss_acct = f"500{idx}80"

                bd_offset = 0
                if rng.random() < 0.02:
                    bd_offset = rng.randint(3, 30)
                    if rng.random() < 0.05:  # rare extreme backdating
                        bd_offset = rng.randint(60, 90)

                post(
                    month, day, "KR",
                    [
                        {
                            "account": loss_acct, "amount": amt,
                            "profit_center": pc, "lob": lob, "state": st,
                            "functional_area": "LAE", "accident_year": ay,
                            "claim_type": ct, "financial_product": fp,
                            "statutory_line": sl,
                        },
                        {
                            "account": "100100", "amount": -amt,
                            "profit_center": pc, "lob": lob, "state": st,
                        },
                    ],
                    entry_day_offset=bd_offset,
                )

            # Commission payments -- scaled up with channel split
            n_comm = rng.randint(600, 1000)
            for _ in range(n_comm):
                day = rng.randint(1, 28)
                amt = round(rng.gauss(3000, 1500), 2)
                if amt < 50:
                    amt = round(50 + rng.random() * 1000, 2)
                ch = rng.choice(channels)
                fp = rng.choice(products)
                # Channel-encoded commission accounts for ~50%
                if ch in ("IA",) and rng.random() < 0.5:
                    comm_acct = f"600{idx}40"
                elif ch in ("DIRECT", "DIGITAL") and rng.random() < 0.5:
                    comm_acct = f"600{idx}50"
                else:
                    comm_acct = f"600{idx}00"
                post(
                    month, day, "KR",
                    [
                        {
                            "account": comm_acct, "amount": amt,
                            "profit_center": pc, "lob": lob,
                            "functional_area": "ACQ",
                            "distribution_channel": ch,
                            "financial_product": fp,
                        },
                        {
                            "account": "220100", "amount": -amt,
                            "profit_center": pc, "lob": lob,
                        },
                    ],
                )

            # Reserve movements (month-end)
            for res_suffix, _res_type in [("10", "Case"), ("20", "IBNR")]:
                amt = round(rng.gauss(500000, 200000), 2)
                sl = rng.choice(stat_lines)
                post(
                    month, 28, "IF",
                    [
                        {
                            "account": f"500{idx}{res_suffix}", "amount": amt,
                            "profit_center": pc, "lob": lob,
                            "functional_area": "LAE", "statutory_line": sl,
                        },
                        {
                            "account": f"200{idx}{res_suffix[0]}0", "amount": -amt,
                            "profit_center": pc, "lob": lob,
                        },
                    ],
                    user="RLOPEZ",
                )

            # UPR movement (month-end)
            upr_amt = round(base_prem * 0.4 * (0.8 + rng.random() * 0.4), 2)
            post(
                month, 28, "IF",
                [
                    {
                        "account": f"400{idx}10", "amount": upr_amt,
                        "profit_center": pc, "lob": lob,
                    },
                    {
                        "account": f"210{idx}00", "amount": -upr_amt,
                        "profit_center": pc, "lob": lob,
                    },
                ],
                user="RLOPEZ",
            )

            # --- Cat losses: concentrated in Q2-Q3 (months 4-9) ---
            if 4 <= month <= 9:
                # 2-3 cat events in months 4-9
                is_cat_month = rng.random() < 0.5
                if is_cat_month:
                    n_cat = rng.randint(200, 500)
                    for _ in range(n_cat):
                        day = rng.randint(1, 28)
                        st = rng.choice(states_for_lob)
                        amt = round(rng.gauss(25000, 15000), 2)
                        if amt < 500:
                            amt = round(500 + rng.random() * 10000, 2)
                        ct = rng.choice(claim_types)
                        post(
                            month, day, "KR",
                            [
                                {
                                    "account": f"500{idx}50", "amount": amt,
                                    "profit_center": pc, "lob": lob,
                                    "state": st, "functional_area": "LAE",
                                    "accident_year": 2025,
                                    "claim_type": ct,
                                    "statutory_line": rng.choice(stat_lines),
                                    "text": "Catastrophe loss",
                                },
                                {
                                    "account": "100100", "amount": -amt,
                                    "profit_center": pc, "lob": lob,
                                    "state": st,
                                },
                            ],
                        )

            # --- Prior year reserve development (quarterly: 3, 6, 9, 12) ---
            if month in (3, 6, 9, 12):
                dev_amt = round(rng.gauss(1_000_000, 500_000), 2)
                sign = 1 if rng.random() < 0.6 else -1  # 60% unfavorable
                dev_amt = dev_amt * sign
                post(
                    month, 28, "IF",
                    [
                        {
                            "account": f"500{idx}60", "amount": dev_amt,
                            "profit_center": pc, "lob": lob,
                            "functional_area": "LAE",
                            "accident_year": rng.choice([2022, 2023, 2024]),
                            "text": "Prior year reserve development",
                            "statutory_line": rng.choice(stat_lines),
                        },
                        {
                            "account": f"200{idx}10", "amount": -dev_amt,
                            "profit_center": pc, "lob": lob,
                        },
                    ],
                    user="RLOPEZ",
                )

            # --- Reinsurance transactions (with treaty_id) ---
            # Ceded premium
            n_ri = rng.randint(150, 250)
            for _ in range(n_ri):
                day = rng.randint(1, 28)
                amt = round(rng.gauss(8000, 4000), 2)
                if amt < 200:
                    amt = round(200 + rng.random() * 2000, 2)
                treaty = rng.choice(TREATIES)
                post(
                    month, day, "SA",
                    [
                        {
                            "account": f"400{idx}20", "amount": amt,
                            "profit_center": pc, "lob": lob,
                            "treaty_id": treaty,
                            "text": f"Ceded premium - {treaty}",
                        },
                        {
                            "account": "260000", "amount": -amt,
                            "profit_center": pc, "lob": lob,
                            "treaty_id": treaty,
                        },
                    ],
                )

            # Ceded loss recovery (higher in cat months)
            n_ri_loss = rng.randint(50, 100)
            if 4 <= month <= 9:
                n_ri_loss = rng.randint(100, 200)
            for _ in range(n_ri_loss):
                day = rng.randint(1, 28)
                amt = round(rng.gauss(12000, 8000), 2)
                if amt < 500:
                    amt = round(500 + rng.random() * 3000, 2)
                treaty = rng.choice(TREATIES)
                post(
                    month, day, "SA",
                    [
                        {
                            "account": "120000", "amount": amt,
                            "profit_center": pc, "lob": lob,
                            "treaty_id": treaty,
                        },
                        {
                            "account": f"500{idx}00", "amount": -amt,
                            "profit_center": pc, "lob": lob,
                            "treaty_id": treaty,
                            "text": f"Ceded loss recovery - {treaty}",
                        },
                    ],
                )

        # Operating expenses (spread across cost centers) -- scaled up
        for cc in COST_CENTERS:
            n_opex = rng.randint(150, 250)
            for _ in range(n_opex):
                day = rng.randint(1, 28)
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
                    month, day, "KR",
                    [
                        {"account": acct, "amount": amt,
                         "cost_center": cc, "functional_area": fa},
                        {"account": "220000", "amount": -amt},
                    ],
                )

        # Investment income (monthly)
        inv_amt = round(rng.gauss(2_000_000, 500_000), 2)
        post(
            month, 28, "SA",
            [
                {"account": "170000", "amount": inv_amt, "functional_area": "INV"},
                {"account": "410000", "amount": -inv_amt, "functional_area": "INV"},
            ],
        )

        # Bond interest income detail
        bond_int = round(rng.gauss(1_500_000, 300_000), 2)
        post(
            month, 28, "SA",
            [
                {"account": "101100", "amount": bond_int, "functional_area": "INV"},
                {"account": "410100", "amount": -bond_int, "functional_area": "INV"},
            ],
        )

        # Tax payments (monthly accrual)
        tax_amt = round(rng.gauss(800_000, 200_000), 2)
        post(
            month, 28, "SA",
            [
                {"account": "740000", "amount": tax_amt},
                {"account": "220200", "amount": -tax_amt},
            ],
        )

        # --- Suspense account clearing patterns ---
        # ~500 suspense entries/month with clearing 1-5 days later
        n_suspense = rng.randint(400, 600)
        uncleared_pct = 0.03  # ~3% remain uncleared at month-end
        for _ in range(n_suspense):
            day = rng.randint(1, 25)
            amt = round(rng.gauss(5000, 3000), 2)
            if amt < 100:
                amt = round(100 + rng.random() * 2000, 2)
            lob = rng.choice(LOBS)
            lidx = LOBS.index(lob)
            # Hit suspense
            post(
                month, day, "SA",
                [
                    {"account": "190000", "amount": amt, "lob": lob,
                     "text": "Premium payment - pending classification"},
                    {"account": "100000", "amount": -amt},
                ],
            )
            # Clear suspense (unless uncleared)
            if rng.random() > uncleared_pct:
                clear_day = min(day + rng.randint(1, 5), 28)
                post(
                    month, clear_day, "CL",
                    [
                        {"account": f"110{lidx}00", "amount": amt, "lob": lob,
                         "text": "Suspense clearing - premium classified"},
                        {"account": "190000", "amount": -amt, "lob": lob,
                         "text": "Suspense clearing"},
                    ],
                )

        # --- Cross-LOB allocations (monthly, multi-line JEs) ---
        # Shared services allocated from corporate to LOBs
        for alloc_acct, alloc_base, alloc_text in [
            ("720400", 200_000, "IT cost allocation"),
            ("720100", 150_000, "Rent allocation"),
            ("720000", 300_000, "Shared admin allocation"),
        ]:
            total = round(alloc_base * (0.8 + rng.random() * 0.4), 2)
            lines: list[dict[str, Any]] = [
                {"account": alloc_acct, "amount": -total,
                 "cost_center": "CC4000", "functional_area": "ADM",
                 "text": f"{alloc_text} - corporate"},
            ]
            # Allocate to LOBs based on weights
            weights = [0.35, 0.25, 0.25, 0.15]
            running = 0.0
            for i, lob in enumerate(LOBS):
                if i == len(LOBS) - 1:
                    lob_amt = round(total - running, 2)
                else:
                    lob_amt = round(total * weights[i], 2)
                    running += lob_amt
                lines.append({
                    "account": alloc_acct, "amount": lob_amt,
                    "profit_center": PROFIT_CENTERS[lob], "lob": lob,
                    "functional_area": "ADM",
                    "text": f"{alloc_text} - {lob}",
                })
            post(month, 28, "MJ", lines, user="MBROWN")

        # --- Multi-line reinsurance settlement JEs (8-15 lines, monthly) ---
        n_ri_settlements = rng.randint(3, 6)
        for _ in range(n_ri_settlements):
            treaty = rng.choice(TREATIES)
            ri_lines: list[dict[str, Any]] = []
            ri_total = 0.0
            n_lob_lines = rng.randint(3, 6)
            for __ in range(n_lob_lines):
                lob = rng.choice(LOBS)
                lidx = LOBS.index(lob)
                amt = round(rng.gauss(50000, 20000), 2)
                if amt < 5000:
                    amt = 5000.0
                ri_lines.append({
                    "account": f"400{lidx}20", "amount": amt,
                    "profit_center": PROFIT_CENTERS[lob], "lob": lob,
                    "treaty_id": treaty,
                    "text": f"RI settlement ceded prem - {treaty}",
                })
                ri_total += amt
            # Ceding commission (credit)
            comm_amt = round(ri_total * 0.25, 2)
            ri_lines.append({
                "account": "750000", "amount": -comm_amt,
                "treaty_id": treaty,
                "text": f"Ceding commission - {treaty}",
            })
            # Net settlement
            net = round(ri_total - comm_amt, 2)
            ri_lines.append({
                "account": "230000", "amount": -net,
                "treaty_id": treaty,
                "text": f"RI payable - {treaty}",
            })
            post(month, rng.randint(20, 28), "SA", ri_lines)

        # --- Investment portfolio transactions ---
        # Bond maturity / purchase (quarterly)
        if month in (3, 6, 9, 12):
            mat_amt = round(rng.gauss(5_000_000, 2_000_000), 2)
            gain = round(rng.gauss(50_000, 30_000), 2)
            post(
                month, 15, "SA",
                [
                    {"account": "100000", "amount": mat_amt + gain,
                     "functional_area": "INV", "text": "Bond maturity proceeds"},
                    {"account": "101100", "amount": -(mat_amt),
                     "functional_area": "INV", "text": "Bond maturity - cost basis"},
                    {"account": "410300", "amount": -gain,
                     "functional_area": "INV", "text": "Realized gain on maturity"},
                ],
            )

            # LP capital call (quarterly)
            lp_amt = round(rng.gauss(2_000_000, 500_000), 2)
            post(
                month, 10, "SA",
                [
                    {"account": "101600", "amount": lp_amt,
                     "functional_area": "INV", "text": "LP capital call"},
                    {"account": "100000", "amount": -lp_amt,
                     "functional_area": "INV"},
                ],
            )

        # Mark-to-market on equity securities (monthly)
        mtm_amt = round(rng.gauss(500_000, 300_000), 2)
        mtm_sign = 1 if rng.random() < 0.55 else -1
        mtm_amt = mtm_amt * mtm_sign
        post(
            month, 28, "SA",
            [
                {"account": "101200", "amount": mtm_amt,
                 "functional_area": "INV", "text": "MTM equity securities"},
                {"account": "410500", "amount": -mtm_amt,
                 "functional_area": "INV", "text": "Unrealized gain/loss - equities"},
            ],
        )

        # --- Debt service (monthly) ---
        int_amt = round(rng.gauss(800_000, 100_000), 2)
        post(
            month, 28, "SA",
            [
                {"account": "770000", "amount": int_amt,
                 "text": "Interest expense - senior debt"},
                {"account": "100000", "amount": -int_amt},
            ],
        )

        # --- Intangible amortization (monthly) ---
        amort_amt = round(rng.gauss(200_000, 30_000), 2)
        post(
            month, 28, "SA",
            [
                {"account": "720250", "amount": amort_amt,
                 "functional_area": "ADM",
                 "text": "Amort of purchased intangibles"},
                {"account": "142200", "amount": -amort_amt,
                 "text": "Accum amort - intangibles"},
            ],
        )

        # --- Deferred tax (quarterly) ---
        if month in (3, 6, 9, 12):
            dta_amt = round(rng.gauss(500_000, 200_000), 2)
            post(
                month, 28, "SA",
                [
                    {"account": "190200", "amount": dta_amt,
                     "text": "Deferred tax asset adjustment"},
                    {"account": "740200", "amount": -dta_amt,
                     "text": "Deferred tax benefit"},
                ],
            )

        # --- Service expenses (monthly) ---
        svc_amt = round(rng.gauss(150_000, 50_000), 2)
        post(
            month, 28, "SA",
            [
                {"account": "780000", "amount": svc_amt,
                 "functional_area": "ADM", "text": "Service expenses"},
                {"account": "220400", "amount": -svc_amt},
            ],
        )

        # --- Bad debt provision (monthly) ---
        bd_amt = round(rng.gauss(100_000, 40_000), 2)
        post(
            month, 28, "SA",
            [
                {"account": "720900", "amount": bd_amt,
                 "text": "Bad debt provision"},
                {"account": "111000", "amount": -bd_amt,
                 "text": "Allowance for doubtful accounts"},
            ],
        )

        # --- Intercompany netting (quarterly) ---
        if month in (3, 6, 9, 12):
            ic_net = round(rng.gauss(2_000_000, 800_000), 2)
            # Partial netting — leaves residual
            net_pct = 0.6 + rng.random() * 0.2
            net_amt = round(ic_net * net_pct, 2)
            post(
                month, 28, "SA",
                [
                    {"account": "240000", "amount": net_amt,
                     "trading_partner": IC_COMPANY_CODE,
                     "text": "IC netting - payable reduction"},
                    {"account": "160000", "amount": -net_amt,
                     "trading_partner": IC_COMPANY_CODE,
                     "text": "IC netting - receivable reduction"},
                ],
            )

        # --- Year-end surge: extra MJE activity in months 11-12 ---
        if is_year_end:
            n_ye = rng.randint(30, 60)
            for _ in range(n_ye):
                day = rng.randint(20, 28)
                amt = round(rng.gauss(50000, 25000), 2)
                if amt < 1000:
                    amt = 1000.0
                acct_pairs = [
                    ("720900", "720300"), ("720400", "720200"),
                    ("700000", "700100"), ("500000", "500010"),
                ]
                pair = rng.choice(acct_pairs)
                post(
                    month, day, "MJ",
                    [
                        {"account": pair[0], "amount": amt,
                         "text": "Year-end adjustment"},
                        {"account": pair[1], "amount": -amt,
                         "text": "Year-end adjustment"},
                    ],
                    user="JSMITH",
                    entry_day_offset=rng.randint(0, 5),
                )

        # --- Partial reversals (~1% of a sample of entries) ---
        n_partial = rng.randint(20, 40)
        for _ in range(n_partial):
            day = rng.randint(5, 28)
            lob = rng.choice(LOBS)
            lidx = LOBS.index(lob)
            orig_amt = round(rng.gauss(10000, 5000), 2)
            if orig_amt < 500:
                orig_amt = 500.0
            partial = round(orig_amt * (0.2 + rng.random() * 0.6), 2)
            post(
                month, day, "CL",
                [
                    {"account": f"500{lidx}00", "amount": -partial,
                     "lob": lob, "profit_center": PROFIT_CENTERS[lob],
                     "text": "Partial reversal"},
                    {"account": "100100", "amount": partial,
                     "lob": lob, "profit_center": PROFIT_CENTERS[lob],
                     "text": "Partial reversal"},
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
    postings_df: pl.DataFrame, accounts_df: pl.DataFrame, rng: SeededRNG
) -> pl.DataFrame:
    """Derive trial balance from posting data.

    Computes opening balance, period debits/credits, closing balance,
    and cumulative balance for each account and period.
    Balance sheet accounts (A, L, E) get non-zero opening balances.
    Income statement accounts (R, X) start at 0.
    """
    # Build opening balance map for BS accounts
    ob_map: dict[str, float] = {}
    for row in accounts_df.iter_rows(named=True):
        atype = row["account_type"]
        group = row["account_group"]
        acct = row["gl_account"]
        if atype in ("A", "L", "E") and row["is_active"]:
            # Determine range based on group
            if group in OPENING_BALANCE_RANGES:
                lo, hi = OPENING_BALANCE_RANGES[group]
            elif atype == "A":
                lo, hi = OPENING_BALANCE_RANGES["MISC_A"]
            elif atype == "L":
                lo, hi = OPENING_BALANCE_RANGES["MISC_L"]
            else:
                lo, hi = OPENING_BALANCE_RANGES["EQTY"]
            # Assets: positive; Liabilities/Equity: negative (natural sign)
            # For debit-balance accounts, use positive OB
            raw = lo + rng.random() * (hi - lo)
            ob_map[acct] = round(raw, 2)

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

    # Map opening balances (only period 1 gets the OB; later periods carry forward)
    ob_series = tb["gl_account"].map_elements(
        lambda a: ob_map.get(a, 0.0), return_dtype=pl.Float64
    )
    tb = tb.with_columns(
        pl.when(pl.col("fiscal_period") == 1)
        .then(ob_series)
        .otherwise(0.0)
        .alias("opening_balance"),
        pl.lit(COMPANY_CODE).alias("company_code"),
        pl.lit(FISCAL_YEAR).alias("fiscal_year"),
        pl.lit(CURRENCY).alias("currency"),
    )

    # Closing = opening + debits - credits
    tb = tb.with_columns(
        (
            pl.col("opening_balance")
            + pl.col("period_debits")
            - pl.col("period_credits")
        ).alias("closing_balance")
    )

    # Cumulative balance (sort by period, cumsum of net + opening balance)
    tb = tb.sort(["gl_account", "fiscal_period"])
    tb = tb.with_columns(
        (
            pl.col("opening_balance")
            + pl.col("period_debits")
            - pl.col("period_credits")
        )
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

    # Trial balance (derived from postings, with opening balances for BS accounts)
    tb_rng = SeededRNG(seed + 9999)  # separate RNG for TB opening balances
    tb_df = _generate_trial_balance(postings_df, accounts_df, tb_rng)

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
