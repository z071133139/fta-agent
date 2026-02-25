# Insurance COA Dimensions, Hierarchies & Report-to-Dimension Mapping

> Created: 2026-02-24 (Session 020)
> Purpose: Reference for COA design deliverables (d-005-02, d-005-08), hierarchy validation, and cross-deliverable linking to Reporting Inventory (d-006-01).
> Sources: SAP S/4HANA ACDOCA design patterns, NAIC requirements, IFRS 17/LDTI standards, consulting domain knowledge

---

## 1. Standard GL/COA Dimensions for Insurance (42 Total)

### 1A. Core Organizational Dimensions (Standard ACDOCA)

| # | Dimension | ACDOCA Field | Insurance Purpose |
|---|-----------|-------------|-------------------|
| 1 | **GL Account** | RACCT / HKONT | Backbone of every report. Insurance-specific: premium (written/earned/unearned), losses (paid/incurred/reserved), reserves (case/IBNR/LAE), reinsurance (ceded/assumed), investment income, policyholder dividends |
| 2 | **Company Code** | RBUKRS | Each carrier, holding company, service company, captive = separate company code. Drives statutory filing boundaries |
| 3 | **Profit Center** | PRCTR | Typically aligned to LOB, product group, region, or combination. THE key design decision — determines management P&L structure |
| 4 | **Cost Center** | RCNTR / KOSTL | Claims operations, underwriting, actuarial, IT, finance, legal, HR, executive. Drives budgeting and functional area derivation |
| 5 | **Segment** | SEGMENT | High-level: Life, P&C, Health, or Commercial/Personal. Derived from profit center. Required on every balance sheet line via document splitting |
| 6 | **Functional Area** | RFAREA | Insurance-specific functions: Claims Management, Acquisition/Underwriting, Administrative/G&A, Investment Management, Loss & LAE, Policyholder Dividends |
| 7 | **Business Area** | RBUSA / GSBER | Legacy dimension (pre-segment). Key decision: keep or retire |
| 8 | **Trading Partner** | RASSC | Affiliate reinsurance, shared services, management fees, captive arrangements. Enables IC elimination |
| 9 | **Ledger** | RLDNR | Parallel accounting: Leading (GAAP/IFRS), non-leading (Statutory, Tax). Insurance carriers commonly need 2-4 parallel ledgers |
| 10 | **Controlling Area** | KOKRS | Usually 1:1 with company code in S/4HANA |

### 1B. Partner Dimensions

| # | Dimension | ACDOCA Field | Insurance Purpose |
|---|-----------|-------------|-------------------|
| 11 | **Partner Profit Center** | PPRCTR | Cross-LOB allocations, internal reinsurance settlement |
| 12 | **Partner Segment** | PSEGMENT | Balanced segment reporting for IC transactions |
| 13 | **Customer** | KUNNR | Policyholders, agents, brokers, cedants |
| 14 | **Vendor** | LIFNR | Claimants, TPAs, service providers, reinsurers |

### 1C. Cost Object Dimensions

| # | Dimension | ACDOCA Field | Insurance Purpose |
|---|-----------|-------------|-------------------|
| 15 | **Internal Order** | AUFNR | System implementations, regulatory projects, marketing campaigns |
| 16 | **WBS Element** | RPROJ / PS_PSP_PNR | Large transformation programs, capital projects |

### 1D. Currency and Valuation

| # | Dimension | ACDOCA Field | Insurance Purpose |
|---|-----------|-------------|-------------------|
| 17 | **Transaction Currency** | RTCUR | Every posting in native currency |
| 18 | **Local Currency** | RWCUR | Statutory filing currency |
| 19 | **Group Currency** | RKCUR | Consolidation currency |
| 20 | **Currency Type** | CURTYPE | Multi-jurisdictional: local (10), group (30), hard (40) |
| 21 | **Valuation Area** | VALUATN | Different asset valuations under GAAP vs. STAT vs. Tax |

### 1E. Profitability Dimensions (COPA / Margin Analysis)

| # | Dimension | Insurance Purpose |
|---|-----------|-------------------|
| 22 | **Line of Business (LOB)** | Auto, Homeowners, Commercial Property, WC, General Liability |
| 23 | **Product / Product Group** | PPA, HO3, HO5, BOP, CGL, Term Life — finer than LOB |
| 24 | **Distribution Channel** | Exclusive agent, independent agent, broker, direct, digital |
| 25 | **Geography / Region** | State, country, multi-state region |
| 26 | **Customer Group** | Individual, small commercial, mid-market, large commercial |

### 1F. Insurance-Specific Custom Extensions (Not Native to SAP)

| # | Dimension | Field Name | Why SAP Lacks It |
|---|-----------|-----------|------------------|
| 27 | **State** | ZZ_STATE | US insurance regulated state-by-state; premiums, losses, reserves tracked by state for DOI filings |
| 28 | **NAIC Line of Business** | ZZ_NAIC_LOB | Annual Statement requires financials by NAIC line codes — regulatory codes, not internal LOBs |
| 29 | **Accident Year** | ZZ_ACCYR | Required for loss development triangles (Schedule P). Not standard in any ERP |
| 30 | **Policy/Underwriting Year** | ZZ_POLYR | Underwriting profitability analysis, rate adequacy studies |
| 31 | **Treaty ID** | ZZ_TREATY | Track ceded/assumed by specific treaty. Needed for Schedule F and reinsurer credit analysis |
| 32 | **Coverage Type** | ZZ_COVTYP | BI, PD, Comprehensive, Collision, Medical Payments — detailed loss analysis below LOB level |
| 33 | **Claim Type** | ZZ_CLMTYP | Bodily injury, property damage, liability. Affects reserve categorization and Schedule P detail |
| 34 | **Statutory Entity** | ZZ_STATENT | May differ from company code when multiple codes consolidate to one statutory filer |
| 35 | **Risk Category** | ZZ_RISKCAT | Risk-based capital allocation, enterprise risk management |
| 36 | **Accounting Basis Indicator** | ZZ_ACCTBASIS | STAT / GAAP / IFRS / TAX flag (when using single ledger with basis flag) |

### 1G. IFRS 17 / LDTI-Specific Dimensions

| # | Dimension | Purpose |
|---|-----------|---------|
| 37 | **Portfolio** | IFRS 17 unit of account — first level of aggregation |
| 38 | **Cohort / Issue Year Group** | Annual grouping — IFRS 17 prohibits cross-subsidization across cohorts |
| 39 | **Profitability Group** | Onerous / not-yet-profitable / profitable at inception |
| 40 | **Measurement Model** | GMM / VFA / PAA — determines accounting treatment |
| 41 | **CSM Group** | Tracks unearned profit. Critical for IFRS 17 revenue recognition |
| 42 | **Risk Adjustment Group** | Non-financial risk compensation grouping |

---

## 2. Hierarchy Definitions

### 2A. GL Account Hierarchy — Statutory (NAIC Annual Statement)

```
Annual Statement
├── Assets (Schedule A-E)
│   ├── Bonds (Schedule D-1): US Gov, States, Political Subdivisions, Special Revenue, I&M, Affiliates
│   ├── Stocks (Schedule D-2): Preferred, Common
│   ├── Real Estate (Schedule A)
│   ├── Cash & Short-term Investments
│   ├── Premium Receivables: Agents Balances, Direct, Accrued Retrospective
│   ├── Reinsurance Recoverables: Paid Losses, Known Case, IBNR
│   ├── Deferred Acquisition Costs (GAAP only)
│   └── Other Assets
├── Liabilities
│   ├── Loss Reserves: Case (Direct/Assumed), IBNR, LAE (DCC/ALAE + AO/ULAE)
│   ├── Unearned Premium: Direct, Assumed
│   ├── Ceded Reinsurance Balances Payable
│   ├── Funds Held Under Reinsurance Treaties
│   └── Other Liabilities
├── Surplus (Statutory) / Equity (GAAP)
│   ├── Common Capital Stock, Gross Paid-In, Unassigned Surplus, Treasury Stock
├── Revenue
│   ├── Net Premiums Earned: Direct Written, Assumed Written, Ceded Written, Change in UPR
│   ├── Net Investment Income: Bond Interest, Stock Dividends, Real Estate, Other, Expenses (contra)
│   ├── Realized Capital Gains/Losses
│   └── Other Income
└── Expenses
    ├── Losses Incurred: Paid (Direct/Assumed), Less Ceded, Change in Case, Change in IBNR, S&S (contra)
    ├── LAE Incurred: DCC/ALAE, AO/ULAE
    ├── Acquisition Costs: Direct Commissions, Contingent, Ceded (contra), Other, Change in DAC (GAAP)
    ├── General & Administrative: Salaries, Rent, Technology, Professional Fees, Other
    ├── Taxes, Licenses & Fees: Premium Taxes, Guaranty Fund, Federal Income Tax
    └── Policyholder Dividends
```

### 2B. LOB Hierarchy (with NAIC Line Codes)

```
All Lines
├── Personal Lines
│   ├── Personal Auto: PPA Liability [19.1] (BI, PD, PIP, UM/UIM), PPA Physical Damage [19.2] (Comp, Collision)
│   ├── Homeowners [4]: HO-3, HO-5, HO-4, HO-6
│   ├── Personal Umbrella
│   └── Dwelling Fire [1]
├── Commercial Lines
│   ├── Commercial Auto: Liability [19.3], Physical Damage [19.4]
│   ├── Commercial Property: Fire & Allied Lines [1,2.1], Inland Marine [9]
│   ├── General Liability [17]: Premises/Ops, Products/CO, P&A Injury
│   ├── Commercial Package (BOP) [5.1, 5.2]
│   ├── Workers Compensation [16]
│   ├── Commercial Umbrella/Excess
│   ├── Professional Liability (E&O), D&O, Cyber Liability
│   ├── Surety [22], Fidelity [21]
│   └── Farmowners [3]
└── Specialty Lines
    ├── Ocean Marine [8], Aircraft [20]
    ├── Boiler & Machinery [24], Credit [26]
    └── International [27]
```

### 2C. Entity/Organizational Hierarchy

```
Insurance Holding Company (NAIC Group)
├── P&C Operating Company (Admitted Carrier - domicile state)
│   ├── Personal Lines Division
│   └── Commercial Lines Division
├── P&C Operating Company #2 (Surplus Lines / E&S)
├── Life Insurance Subsidiary
├── Captive Reinsurance Company
├── Agency / Distribution Company
├── Shared Services Company (finance, IT, HR)
├── Investment Management Subsidiary
└── Holding Company (intermediate)
    └── Recently Acquired Carrier (integration pending)
```

### 2D. Cost Center Hierarchy

```
All Cost Centers
├── Claims Operations: Auto, Property, Casualty, WC, SIU, Subrogation
├── Underwriting: Personal, Commercial, Specialty, Support
├── Actuarial: Reserving, Pricing, Catastrophe Modeling
├── Distribution: Agent Relations, Marketing, Digital Channel
├── Finance: Accounting, FP&A, Treasury, Tax, Internal Audit
├── Investment Management: Fixed Income, Equity, Alternatives, Inv Accounting
├── IT: Infrastructure, Application Dev, Data & Analytics, Security
├── Legal & Compliance: Legal, Regulatory, ERM
├── HR: Talent, Comp & Benefits, L&D
└── Executive: CEO Office, Board, Corporate Communications
```

### 2E. Functional Area Hierarchy

```
All Functional Areas
├── Loss & LAE (LOSS): Direct Losses, Assumed Losses, LAE (DCC/ALAE + AO/ULAE)
├── Acquisition / Underwriting (ACQUIS): Commissions, UW Salaries, Marketing, Policy Issuance
├── Claims Management (CLAIMS): Adjusters, TPA Fees, Systems, SIU
├── Administrative / G&A (ADMIN): Finance, Legal, HR, IT, Executive, Facilities
├── Investment Management (INVEST): Portfolio Mgmt, Asset Mgmt Fees, Custodian
└── Policyholder Dividends (DIVID)
```

### 2F. Segment & Ledger Hierarchies

```
Operating Segments (ASC 280)        Ledger Strategy
├── Property & Casualty             ├── Leading (0L) — US GAAP or IFRS
│   ├── Personal Lines              ├── Non-Leading (2L) — US Statutory (SAP)
│   └── Commercial Lines            ├── Non-Leading (3L) — Tax Basis
├── Life & Annuity                  ├── Extension (E1) — IFRS 17 Adjustments
├── Health                          └── Extension (E2) — Management Adjustments
└── Corporate & Other
```

---

## 3. Report-to-Dimension Mapping Matrix

### 3A. Regulatory Reports

| Report | GL Acct | Co Code | Profit Ctr | Cost Ctr | Segment | Func Area | LOB | State | Acc Year | Ledger | NAIC Line | Treaty | IC Partner |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| NAIC Annual Statement | X | X | | | | X | X | | | STAT | X | | |
| Schedule P | X | X | | | | | X | | X | STAT | X | | |
| Schedule T | X | X | | | | | X | X | | STAT | X | | |
| Schedule D | X | X | | | | | | | | STAT | | | |
| Schedule F | X | X | | | | | X | | | STAT | | X | X |
| Insurance Expense Exhibit | X | X | | X | | X | X | | | STAT | X | | |
| SEC 10-K/10-Q | X | X | | | X | | X | | | GAAP | | | X |
| IFRS 17 | X | X | | | X | | X | | | IFRS | | | |
| LDTI (ASC 944) | X | X | | | | | X | | | GAAP | | | |

### 3B. Management Reports

| Report | GL Acct | Co Code | Profit Ctr | Cost Ctr | Segment | Func Area | LOB | State | Acc Year | Product | Channel |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Board Financial Package | X | X | X | | X | X | X | | | | |
| Combined Ratio by LOB | X | | X | | | X | X | | | | |
| Loss Ratio Analysis | X | | X | | | | X | | X | X | |
| Underwriting Profitability | X | | X | | | X | X | X | | X | X |
| Budget vs. Actual | X | X | | X | | X | | | | | |
| Multi-Basis Trial Balance | X | X | | X | | | | | | | |

---

## 4. Key Design Decisions (Priority Order)

1. **What does profit center represent?** (LOB, region, product, hybrid) — segment derives from it, document splitting depends on it
2. **How many ledgers?** — drives parallel accounting complexity and close process
3. **Which custom fields on the code block?** (State, accident year, NAIC line, treaty) — each adds to every posting
4. **How is functional area derived?** — drives IEE and statutory expense allocation
5. **Where does LOB live if not on profit center?** — determines availability on balance sheet vs. P&L only
6. **Gross/ceded/net account structure** — design once, consistently
7. **Document splitting characteristics** — segment mandatory; state/LOB as additional = more complexity

---

## 5. Common Transformation Pitfalls

### Dimensional Design Failures
- **No LOB on code block** → Can't produce NAIC exhibits from GL (40-80 hrs/close manual assembly)
- **No accident year dimension** → Schedule P assembled manually (actuarial bottleneck)
- **No state dimension** → Schedule T manual matching (DOI filing delays)
- **Single ledger for STAT and GAAP** → Can't produce clean trial balance without filtering
- **Missing functional area** → IEE entirely manual (most labor-intensive statutory schedule)
- **NAIC line codes not mapped** → Filing errors, key-person dependency

### Structural Design Failures
- **Account explosion** → 5,000-15,000 accounts from encoding LOB x coverage x state in account number
- **Dead accounts not retired** → 30-50% with zero postings, master data pollution
- **Missing gross/ceded/net structure** → Reinsurance accounting manual

### Migration Failures
- **"Redesign everything" mentality** → 2-3x conversion effort
- **No OLD=NEW reconciliation plan** → Go-live delays (weeks to months)
- **Custom fields added late** → Document splitting incomplete, historical data gaps
- **No subledger alignment** → Integration testing failures
