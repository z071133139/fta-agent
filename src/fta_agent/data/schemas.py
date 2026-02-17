"""Data schemas for GL data: posting data, account master, trial balance.

Defines both Pydantic models (for validation/serialization) and Polars schema
definitions (for DataFrame construction). These are the canonical schemas for
P&C insurance GL data that flow through the entire system.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from enum import StrEnum

import polars as pl
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class AccountType(StrEnum):
    """Balance sheet vs. P&L classification."""

    ASSET = "A"
    LIABILITY = "L"
    EQUITY = "E"
    REVENUE = "R"
    EXPENSE = "X"


class DebitCredit(StrEnum):
    """Posting direction."""

    DEBIT = "D"
    CREDIT = "C"


class DocumentCategory(StrEnum):
    """High-level document type classification for MJE detection."""

    STANDARD = "STD"  # System-generated / automated
    MANUAL = "MJE"  # Manual journal entry
    ACCRUAL = "ACC"  # Accrual entry
    RECURRING = "REC"  # Recurring entry
    CLEARING = "CLR"  # Clearing / reversal
    INTERFACE = "INT"  # Interface posting from subledger


class FinancialProduct(StrEnum):
    """Internal product codes for P&C insurance."""

    PPA = "PPA"  # Private Passenger Auto
    PPA_NF = "PPA-NF"  # PPA No-Fault
    PPA_LI = "PPA-LI"  # PPA Liability
    PPA_PD = "PPA-PD"  # PPA Physical Damage
    MOTO = "MOTO"  # Motorcycle
    HO3 = "HO3"  # Homeowners Special Form
    HO5 = "HO5"  # Homeowners Comprehensive
    HO4 = "HO4"  # Renters
    BOP = "BOP"  # Business Owners Policy
    CGL = "CGL"  # Commercial General Liability
    CPP = "CPP"  # Commercial Package Policy
    CAL = "CAL"  # Commercial Auto Liability
    CAPD = "CAPD"  # Commercial Auto Physical Damage
    WC = "WC"  # Workers Compensation
    WC_GC = "WC-GC"  # WC Guaranteed Cost
    WC_LD = "WC-LD"  # WC Large Deductible


class ClaimType(StrEnum):
    """Claim classification types."""

    BI = "BI"  # Bodily Injury
    PD = "PD"  # Property Damage
    LIAB = "LIAB"  # Liability
    COMP = "COMP"  # Comprehensive
    COLL = "COLL"  # Collision
    MED = "MED"  # Medical Payments


class DistributionChannel(StrEnum):
    """Distribution channel for policy sales."""

    EA = "EA"  # Exclusive Agency
    IA = "IA"  # Independent Agency
    DIRECT = "DIRECT"  # Direct (call center)
    DIGITAL = "DIGITAL"  # Digital/Online


# ---------------------------------------------------------------------------
# Pydantic models (for validation, serialization, API contracts)
# ---------------------------------------------------------------------------


class PostingRecord(BaseModel):
    """Single journal entry line item (ACDOCA-style posting)."""

    company_code: str
    fiscal_year: int
    fiscal_period: int
    document_number: str
    line_item: int
    document_type: str
    document_category: DocumentCategory
    posting_date: date
    entry_date: date
    posting_key: str  # "40" debit, "50" credit, etc.
    debit_credit: DebitCredit
    gl_account: str
    amount: Decimal
    currency: str  # ISO 4217
    profit_center: str
    cost_center: str | None = None
    functional_area: str | None = None
    segment: str | None = None
    business_area: str | None = None
    trading_partner: str | None = None
    reference: str | None = None
    text: str | None = None
    user_id: str
    # P&C-specific dimensions
    state: str | None = None  # US state code (2-letter)
    lob: str | None = None  # Line of business
    accident_year: int | None = None
    # Insurance-specific dimensions
    financial_product: str | None = None  # PPA, HO3, BOP, CGL, WC, etc.
    statutory_line: str | None = None  # NAIC Annual Statement line
    treaty_id: str | None = None  # Reinsurance treaty
    claim_type: str | None = None  # BI, PD, LIAB, COMP, COLL, MED
    distribution_channel: str | None = None  # EA, IA, DIRECT, DIGITAL
    policy_year: int | None = None  # Underwriting year


class AccountMasterRecord(BaseModel):
    """GL account master data."""

    gl_account: str
    description: str
    account_type: AccountType
    account_group: str
    is_reconciliation_account: bool = False
    open_item_management: bool = False
    line_item_display: bool = True
    # P&C classification
    statutory_category: str | None = None  # NAIC Annual Statement line
    functional_area_default: str | None = None
    is_active: bool = True
    effective_from: date | None = None
    source_system: str | None = None  # "SAP", "Legacy", "MM-Acquired", "Manual"


class TrialBalanceRecord(BaseModel):
    """Single line of a trial balance (one account, one period)."""

    company_code: str
    fiscal_year: int
    fiscal_period: int
    gl_account: str
    currency: str
    opening_balance: Decimal
    period_debits: Decimal
    period_credits: Decimal
    closing_balance: Decimal
    cumulative_balance: Decimal


# ---------------------------------------------------------------------------
# Polars schemas (for DataFrame construction and validation)
# ---------------------------------------------------------------------------

POSTING_SCHEMA = {
    "company_code": pl.Utf8,
    "fiscal_year": pl.Int32,
    "fiscal_period": pl.Int32,
    "document_number": pl.Utf8,
    "line_item": pl.Int32,
    "document_type": pl.Utf8,
    "document_category": pl.Utf8,
    "posting_date": pl.Date,
    "entry_date": pl.Date,
    "posting_key": pl.Utf8,
    "debit_credit": pl.Utf8,
    "gl_account": pl.Utf8,
    "amount": pl.Float64,
    "currency": pl.Utf8,
    "profit_center": pl.Utf8,
    "cost_center": pl.Utf8,
    "functional_area": pl.Utf8,
    "segment": pl.Utf8,
    "business_area": pl.Utf8,
    "trading_partner": pl.Utf8,
    "reference": pl.Utf8,
    "text": pl.Utf8,
    "user_id": pl.Utf8,
    "state": pl.Utf8,
    "lob": pl.Utf8,
    "accident_year": pl.Int32,
    "financial_product": pl.Utf8,
    "statutory_line": pl.Utf8,
    "treaty_id": pl.Utf8,
    "claim_type": pl.Utf8,
    "distribution_channel": pl.Utf8,
    "policy_year": pl.Int32,
}

ACCOUNT_MASTER_SCHEMA = {
    "gl_account": pl.Utf8,
    "description": pl.Utf8,
    "account_type": pl.Utf8,
    "account_group": pl.Utf8,
    "is_reconciliation_account": pl.Boolean,
    "open_item_management": pl.Boolean,
    "line_item_display": pl.Boolean,
    "statutory_category": pl.Utf8,
    "functional_area_default": pl.Utf8,
    "is_active": pl.Boolean,
    "effective_from": pl.Date,
    "source_system": pl.Utf8,
}

TRIAL_BALANCE_SCHEMA = {
    "company_code": pl.Utf8,
    "fiscal_year": pl.Int32,
    "fiscal_period": pl.Int32,
    "gl_account": pl.Utf8,
    "currency": pl.Utf8,
    "opening_balance": pl.Float64,
    "period_debits": pl.Float64,
    "period_credits": pl.Float64,
    "closing_balance": pl.Float64,
    "cumulative_balance": pl.Float64,
}
