# Insurance Finance Reporting Inventory — Domain Reference

> Created: 2026-02-24 (Session 020)
> Purpose: Comprehensive reporting inventory for insurance finance transformations. Foundation for FTA deliverables d-006-01 (Reporting Inventory), COA/hierarchy design validation, and cross-deliverable linking.
> Sources: NAIC Annual Statement structure, SAP S/4HANA ACDOCA patterns, consulting domain knowledge (P&C, Life/Annuity, Reinsurance)

---

## Overview

**59 reports** across three categories:

| Category | Count | Purpose |
|----------|-------|---------|
| Regulatory/Statutory | 22 | Required by regulators (NAIC, state DOIs, SEC, IRS, EIOPA) |
| Management | 22 | Internal decision-making (CFO, Board, Controller, Actuarial, Treasury, FP&A) |
| Operational | 15 | Day-to-day operations (reconciliations, exceptions, close process) |

**Sub-segment coverage:**
- P&C specific: R-03, R-09, M-02, M-09, M-12, M-13, M-18, O-04, O-15
- Life/Annuity specific: R-14, R-15, R-16, R-18, M-05, M-10, M-14
- Reinsurance specific: R-04, M-11, M-19, M-20, O-04
- Cross-segment: All remaining reports

---

# CATEGORY 1: REGULATORY / STATUTORY REPORTS (22)

## 1.1 NAIC Annual Statement — Core Schedules (All Lines)

### R-01: Balance Sheet (Pages 2-4)
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual (quarterly supplements)
- **Data sources:** GL trial balance, investment subledger, reserve subledger, reinsurance recoverables
- **Transformation risk:** GL must produce statutory-basis trial balance mapping to NAIC line items. Missing statutory account classifications = manual mapping every quarter.
- **Dimensions required:** Legal entity, statutory vs. GAAP basis, admitted vs. non-admitted asset classification

### R-02: Statement of Income (Underwriting & Investment Exhibit)
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual (quarterly via Quarterly Statement)
- **Data sources:** Premium GL, loss & LAE GL, investment income GL, operating expense GL
- **Transformation risk:** Income statement structure differs between statutory (SAP) and GAAP. P&C uses underwriting income format; Life uses summary of operations format.
- **Dimensions required:** LOB (NAIC lines), direct vs. assumed vs. ceded, accident year vs. calendar year

### R-03: Schedule P — Loss Development (P&C)
- **Sub-segment:** P&C
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual
- **Data sources:** Loss reserve subledger, claims system, actuarial triangles, reinsurance cessions
- **Transformation risk:** THE critical P&C schedule. Requires 10 years of accident year loss development. If GL/subledger can't track by accident year, entire schedule built outside GL — reconciliation nightmare.
- **Dimensions required:** Accident year (10 years), LOB (21 P&C lines per NAIC), direct/assumed/ceded/net, paid vs. incurred, DCC vs. A&O
- **Risk rank:** #1

### R-04: Schedule F — Reinsurance
- **Sub-segment:** All (critical for Reinsurance)
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual
- **Data sources:** Reinsurance treaties, ceded premium/loss data, collateral/LOC records, reinsurer credit ratings
- **Transformation risk:** Every reinsurance counterparty tracked with recoverables, collateral, credit quality. COA must segregate ceded vs. direct at GL level.
- **Dimensions required:** Reinsurer entity, treaty/facultative, authorized/unauthorized, collateral type, LOB, accident year
- **Risk rank:** #4

### R-05: Schedule D — Investments (Parts 1-6)
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual (quarterly updates)
- **Data sources:** Investment subledger, custodian feeds, NAIC SVO designations, fair value services
- **Transformation risk:** GL must carry statutory-basis investment valuations. COA needs asset class, NAIC designation, maturity bucket dimensions.
- **Dimensions required:** NAIC SVO designation (1-6), asset class, maturity bucket, affiliated vs. non-affiliated

### R-06: Schedule A — Real Estate
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual
- **Data sources:** Fixed asset subledger, property appraisals, depreciation schedules
- **Dimensions required:** Property type, occupied vs. investment, encumbrance status

### R-07: Schedule E — Cash and Short-Term Investments
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual / Quarterly
- **Data sources:** Bank statements, money market fund records
- **Dimensions required:** Bank/custodian entity, deposit type, FDIC coverage status

### R-08: Schedule T — Premiums by State
- **Regulator:** NAIC / State DOIs (premium tax allocation)
- **Frequency:** Annual
- **Data sources:** Policy administration system, premium GL, state allocation rules
- **Transformation risk:** Every dollar of premium allocated to 54 US jurisdictions. If COA/GL doesn't carry state-level premium detail, this is a massive manual exercise.
- **Dimensions required:** State/territory (54 jurisdictions), LOB, direct written vs. direct earned
- **Risk rank:** #6

### R-09: Insurance Expense Exhibit (IEE)
- **Sub-segment:** P&C (IEE), Life (separate exhibit)
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual
- **Data sources:** Expense GL, LOB allocation rules, commission subledger, general expense allocations
- **Transformation risk:** Requires allocation of ALL expenses across LOBs and functional categories. Bad COA design = entirely manual allocation. Most labor-intensive statutory schedule.
- **Dimensions required:** LOB, expense function (loss adjustment, acquisition, general, investment), direct vs. allocated, commission vs. non-commission
- **Risk rank:** #3

### R-10: Five-Year Historical Data / General Interrogatories
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual
- **Transformation risk:** Historical comparability breaks at migration. Must plan for data migration or parallel reporting.
- **Dimensions required:** 5-year time series, consistent LOB definitions across years

### R-11: Supplemental Investment Risk Interrogatories (SIRI)
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual
- **Dimensions required:** Issuer, sector, geography, asset class, affiliated status, 10 largest exposures

### R-12: Risk-Based Capital (RBC)
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual
- **Data sources:** Annual statement data (feeds from Schedules D, P, F), off-balance-sheet exposures
- **Transformation risk:** RBC is a formula applied to Annual Statement data. If feeder schedules are wrong, RBC triggers regulatory action levels.
- **Dimensions required:** All dimensions required by feeder schedules plus off-balance-sheet tracking

### R-13: Schedule Y — Holding Company Intercompany Activity
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual
- **Dimensions required:** Legal entity, intercompany partner, transaction type, arm's-length indicator

## 1.2 Life/Annuity Specific

### R-14: Actuarial Opinion and Memorandum (SAO)
- **Sub-segment:** Life/Annuity
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual
- **Transformation risk:** GL reserves must tie to actuarial model output. COA must distinguish reserve types (basic, deficiency, additional, CARVM, CRVM).
- **Dimensions required:** Reserve type, product line, issue year, valuation basis

### R-15: VM-20/21 Principle-Based Reserving (PBR)
- **Sub-segment:** Life/Annuity
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual (quarterly monitoring)
- **Transformation risk:** GL must carry PBR reserve amounts separately from pre-PBR reserves. Requires granular product-level tracking.
- **Dimensions required:** Product cohort, issue year, PBR vs. formulaic basis, deterministic vs. stochastic reserve

### R-16: Separate Account Statement
- **Sub-segment:** Life/Annuity (variable products)
- **Regulator:** NAIC / State DOIs
- **Frequency:** Annual / Quarterly
- **Transformation risk:** GL must maintain complete segregation between general and separate accounts.
- **Dimensions required:** General vs. separate account, sub-account/fund, insulated vs. non-insulated

## 1.3 Federal / SEC / International

### R-17: SEC 10-K / 10-Q
- **Regulator:** SEC
- **Frequency:** Annual / Quarterly
- **Transformation risk:** Full GAAP-basis financials with segment reporting (ASC 280). Dual-basis GL (SAP and GAAP) or robust conversion required. Single biggest driver of COA complexity.
- **Dimensions required:** GAAP segment, legal entity, consolidation/elimination, intercompany, all disclosure dimensions

### R-18: LDTI Disclosures (ASC 944 / ASU 2018-12)
- **Sub-segment:** Life/Annuity
- **Regulator:** SEC / GAAP requirement
- **Frequency:** Quarterly / Annual
- **Transformation risk:** Most significant change to insurance accounting in decades. Requires liability remeasurement, DAC on constant-level basis, MRB at fair value, roll-forward disclosures. GL must support LDTI measurement attributes and cohort-level tracking.
- **Dimensions required:** Issue year cohort, product grouping, liability type (LFPB, participating, limited-pay, UPR), measurement component, DAC/VOBA/URI by cohort, MRB fair value components
- **Risk rank:** #2

### R-19: IFRS 17 Disclosures
- **Sub-segment:** All (international operations or IFRS reporters)
- **Regulator:** IASB / local regulators
- **Frequency:** Quarterly / Annual
- **Transformation risk:** CSM tracking by group of contracts, risk adjustment, insurance revenue disaggregation. Multi-basis challenge: SAP + GAAP + IFRS 17.
- **Dimensions required:** Portfolio, group of contracts (profitability + annual cohort), measurement model (GMM/VFA/PAA), CSM components, risk adjustment, OCI election

### R-20: IRS Form 1120-PC / 1120-L
- **Regulator:** IRS
- **Frequency:** Annual
- **Transformation risk:** Insurance tax starts from statutory income. P&C loss reserve discounting (Section 846) requires accident year detail. Life DAC tax (Section 848) requires specified premium categories.
- **Dimensions required:** Tax entity, insurance company type, loss reserve discount factors by LOB, Section 848 categories

### R-21: Solvency II QRTs (EU Operations)
- **Regulator:** EIOPA / National regulators
- **Frequency:** Annual (full) / Quarterly (subset)
- **Transformation risk:** Third valuation basis (market-consistent) on top of local GAAP and IFRS. ~70 QRT templates. Different LOB classification from NAIC.
- **Dimensions required:** Solvency II LOB (non-life: 12, life: ~9, health: ~6), geography, currency, homogeneous risk group, entity, ring-fenced fund

### R-22: ORSA — Own Risk and Solvency Assessment
- **Regulator:** NAIC (US) / EIOPA (EU) / IAIS (global)
- **Frequency:** Annual
- **Dimensions required:** Projection year (3-5), stress scenario, risk category, capital metric

---

# CATEGORY 2: MANAGEMENT REPORTS (22)

## 2.1 CFO / Board Level

### M-01: Financial Dashboard / CFO Scorecard
- **User group:** CFO, Board
- **Frequency:** Monthly / Quarterly
- **Transformation risk:** Must present dual-basis results (SAP and GAAP) with variance analysis. Manual reclassification every month if COA doesn't support clean aggregation.
- **Dimensions required:** Reporting basis, business segment, legal entity, budget vs. actual vs. prior year, consolidated vs. solo

### M-02: Combined Ratio Analysis (P&C)
- **Sub-segment:** P&C
- **User group:** CFO, Board, Underwriting leadership
- **Frequency:** Monthly / Quarterly
- **Transformation risk:** Combined ratio = (Loss Ratio + Expense Ratio). THE P&C performance metric. Requires clean separation of loss, LAE, acquisition, operating expense by LOB.
- **Dimensions required:** LOB (NAIC, internal, management hierarchies), accident year vs. calendar year, gross vs. net, current vs. prior year development
- **Risk rank:** #9

### M-03: Investment Portfolio Performance
- **User group:** CFO, CIO, Investment Committee
- **Frequency:** Monthly / Quarterly
- **Dimensions required:** Asset class, duration, credit quality, sector, book yield vs. market yield, STAT vs. GAAP basis

### M-04: Statutory Surplus and Capital Adequacy
- **User group:** CFO, Board, Regulators
- **Frequency:** Quarterly
- **Dimensions required:** Legal entity, surplus components, RBC ratio components

### M-05: Embedded Value / Value of New Business (Life)
- **Sub-segment:** Life/Annuity
- **User group:** CFO, Board, Investor Relations
- **Frequency:** Annual
- **Dimensions required:** Product line, in-force vs. new business, VIF components, economic vs. operating variance

### M-06: GAAP Earnings Waterfall / Bridge
- **User group:** CFO, Investor Relations, Board
- **Frequency:** Quarterly
- **Transformation risk:** COA must tag every SAP-to-GAAP difference so bridge can be automated.
- **Dimensions required:** Reporting basis bridge, adjustment category, segment, variance components

## 2.2 Controller / Accounting

### M-07: Trial Balance (Multi-Basis)
- **User group:** Controller, Accounting
- **Frequency:** Monthly
- **Transformation risk:** The #1 test of whether a COA transformation succeeded. Must produce SAP, GAAP, and IFRS/Tax trial balances.
- **Dimensions required:** Reporting basis, legal entity, cost center, account, IC indicator, currency
- **Risk rank:** #7

### M-08: Premium Bordereaux / Written & Earned Premium
- **User group:** Controller, Underwriting, Actuarial
- **Frequency:** Monthly
- **Dimensions required:** LOB, policy effective date, earning basis, written vs. earned vs. unearned, direct vs. assumed vs. ceded

### M-09: Loss & LAE Reserve Summary
- **Sub-segment:** P&C, Reinsurance
- **User group:** Controller, Actuarial, CFO
- **Frequency:** Monthly / Quarterly
- **Transformation risk:** Reserve = largest P&C liability. GL must reconcile to actuarial carried reserves at same granularity.
- **Dimensions required:** Reserve type (case, IBNR, ULAE/ALAE/DCC), LOB, accident year, direct vs. ceded, development period

### M-10: DAC Roll-Forward (Life)
- **Sub-segment:** Life/Annuity (also P&C GAAP)
- **User group:** Controller, Actuarial
- **Frequency:** Quarterly
- **Transformation risk:** Under LDTI, DAC amortization changed fundamentally. COA must support DAC balances by cohort and product.
- **Dimensions required:** Issue year cohort, product grouping, roll-forward components, LDTI vs. legacy basis

### M-11: Reinsurance Recoverable Aging & Credit
- **Sub-segment:** Reinsurance, P&C
- **User group:** Controller, Treasury, Reinsurance Manager
- **Frequency:** Monthly / Quarterly
- **Transformation risk:** Recoverables often 20-40% of P&C assets. Must track at counterparty level.
- **Dimensions required:** Reinsurer counterparty, treaty, aging bucket, paid vs. case vs. IBNR recoverable, collateral, authorized vs. unauthorized

## 2.3 Actuarial

### M-12: Loss Development Triangles (P&C)
- **Sub-segment:** P&C
- **User group:** Actuarial, CFO
- **Frequency:** Quarterly
- **Transformation risk:** 10x10+ triangles. If GL doesn't carry accident year, triangles built from claims data with manual GL reconciliation.
- **Dimensions required:** Accident year (10+), development period, LOB, paid vs. incurred, gross vs. ceded vs. net, DCC vs. A&O

### M-13: Reserve Adequacy / Actuarial Reserve Analysis
- **User group:** Actuarial, CFO, Board
- **Frequency:** Quarterly
- **Dimensions required:** LOB, accident year, reserve method, point estimate vs. range, carried vs. indicated

### M-14: LDTI Liability Roll-Forward (Life)
- **Sub-segment:** Life/Annuity
- **User group:** Actuarial, Controller, External Reporting
- **Frequency:** Quarterly / Annual
- **Dimensions required:** Product grouping, roll-forward components, current vs. locked-in discount rate, issue year cohort, undiscounted vs. discounted

## 2.4 Treasury / FP&A

### M-15: Cash Flow Projection / Liquidity
- **User group:** Treasurer, CFO
- **Frequency:** Weekly / Monthly
- **Dimensions required:** Cash flow category (operating/investing/financing), legal entity, currency, time horizon, bank account
- **Risk rank:** #10

### M-16: Budget vs. Actual Variance
- **User group:** FP&A, Business unit leaders
- **Frequency:** Monthly
- **Transformation risk:** Budget structure must align with GL COA. COA changes = all budgets remapped.
- **Dimensions required:** Budget version, segment, LOB, cost center, account, variance type (rate, volume, mix)

### M-17: Expense Allocation
- **User group:** Controller, FP&A, Actuarial
- **Frequency:** Monthly / Quarterly
- **Transformation risk:** Insurance expense allocation is uniquely complex — expenses allocated to LOBs (statutory), functions (management), and products (pricing).
- **Dimensions required:** Natural expense, cost center, LOB allocation, functional allocation, direct vs. allocated, allocation driver

### M-18: Underwriting Performance (P&C)
- **Sub-segment:** P&C
- **User group:** CUO, Business unit leaders
- **Frequency:** Monthly / Quarterly
- **Dimensions required:** LOB (detailed), state, distribution channel, new vs. renewal, policy size tier, loss ratio band

## 2.5 Reinsurance Specific

### M-19: Ceded/Assumed Reinsurance Performance
- **Sub-segment:** Reinsurance
- **User group:** Reinsurance Manager, CFO
- **Frequency:** Monthly / Quarterly
- **Dimensions required:** Treaty, reinsurer counterparty, treaty type, ceded premium/loss/commission, experience account, LOB, contract year

### M-20: Retrocession Analysis
- **Sub-segment:** Reinsurance
- **User group:** Reinsurance Manager, CFO
- **Frequency:** Quarterly
- **Dimensions required:** Retrocession counterparty/program, assumed by cedant, gross vs. net of retrocession, treaty year

## 2.6 Additional

### M-21: Segment Reporting Package (ASC 280)
- **User group:** CFO, External Reporting
- **Frequency:** Quarterly
- **Dimensions required:** Operating segment, geography, product line, intersegment eliminations

### M-22: Intercompany Activity
- **User group:** Controller, Tax
- **Frequency:** Monthly
- **Dimensions required:** Legal entity, IC partner, transaction type, agreement reference

---

# CATEGORY 3: OPERATIONAL REPORTS (15)

## 3.1 Reconciliation Reports

### O-01: Subledger-to-GL Reconciliation
- **User group:** Accounting, Controller
- **Frequency:** Monthly (some daily)
- **Transformation risk:** #1 operational pain point. Poor subledger-to-GL mapping = 50%+ of close time consumed by reconciliation.
- **Dimensions required:** Subledger source (policy admin, claims, investments, reinsurance, banking, commissions), account, entity, reconciling item type
- **Risk rank:** #5

### O-02: Bank Reconciliation
- **Frequency:** Daily / Monthly
- **Dimensions required:** Bank, account, transaction type, reconciling item category

### O-03: Intercompany Reconciliation / Elimination
- **Frequency:** Monthly
- **Transformation risk:** IC must balance before consolidation. Without matched IC coding = manual reconciliation across dozens of entities.
- **Dimensions required:** Originating entity, partner entity, IC account, imbalance amount/root cause

### O-04: Reinsurance Three-Way Reconciliation
- **Sub-segment:** P&C, Reinsurance
- **Frequency:** Monthly / Quarterly
- **Transformation risk:** Contract terms vs. GL vs. claims system — one of the most complex insurance reconciliations.
- **Dimensions required:** Treaty, reinsurer, LOB, accident year, paid vs. case vs. IBNR, loss vs. premium, authorized vs. unauthorized

## 3.2 Exception Reports

### O-05: Suspense / Unreconciled Items
- **Frequency:** Daily / Weekly
- **Transformation risk:** Suspense accounts = symptom of bad COA or poor integration. Goal: eliminate.
- **Dimensions required:** Suspense account, source system, aging, responsible party, resolution status

### O-06: Manual Journal Entry (MJE) Report
- **Frequency:** Monthly / Quarterly
- **Transformation risk:** High MJE volume = broken process. Target: 50-80% reduction. Heavily scrutinized by auditors.
- **Dimensions required:** Preparer, approver, amount, recurring vs. non-recurring, account, reversal indicator, SOX reference

### O-07: Late/Missing Entries (Close Completeness)
- **Frequency:** During close (daily)
- **Dimensions required:** Close task, expected vs. actual date, responsible party, status, automation status

### O-08: Posting Error / Validation Failures
- **Frequency:** Daily (during close)
- **Dimensions required:** Source system, error type, record count, resolution status

## 3.3 Processing Reports

### O-09: Financial Close Checklist / Task Tracker
- **Frequency:** Monthly (daily during close)
- **Transformation risk:** Close process itself is transformed — tasks eliminated, automated, resequenced. Both operational tool and transformation KPI.
- **Dimensions required:** Close period, task category, owner, dependency, SLA, actual time, automation status

### O-10: Consolidation / Elimination Processing
- **Frequency:** Monthly / Quarterly
- **Transformation risk:** Common chart across all entities (or reliable mapping) required. Minority interest, equity method, pooling need specific COA support.
- **Dimensions required:** Entity, consolidation hierarchy, elimination type, adjustment category, currency translation method
- **Risk rank:** #8

### O-11: Currency Translation / FX Processing
- **Frequency:** Monthly
- **Dimensions required:** Functional currency, reporting currency, translation method, CTA components, entity

### O-12: Data Quality / Completeness Scorecard
- **Frequency:** Monthly
- **Dimensions required:** Data domain, quality dimension (completeness, accuracy, timeliness, consistency), entity, trend

### O-13: Regulatory Filing Tracker
- **Frequency:** Ongoing
- **Dimensions required:** Filing type, jurisdiction, due date, status, sign-off chain

### O-14: Premium-to-Cash Reconciliation
- **Frequency:** Monthly
- **Dimensions required:** Premium lifecycle stage, LOB, billing method, aging bucket, producer/agent

### O-15: Claims Payment / Disbursement Processing
- **Sub-segment:** P&C, Life/Annuity
- **Frequency:** Daily / Weekly
- **Dimensions required:** Claim number, LOB, accident year, payment type, payee type, check/EFT status

---

# TRANSFORMATION RISK RANKING

Top 10 reports most likely to break during a finance transformation:

| Rank | Report | ID | Why |
|------|--------|-----|-----|
| 1 | Schedule P — Loss Development | R-03 | Accident year data integrity during migration; loss of historical development |
| 2 | LDTI Disclosures | R-18 | Novel cohort tracking; most companies building from scratch |
| 3 | Insurance Expense Exhibit | R-09 | Expense functional coding almost always changes in new COA |
| 4 | Schedule F — Reinsurance | R-04 | Reinsurance counterparty data scattered across systems |
| 5 | Subledger-to-GL Reconciliation | O-01 | All mappings change; highest volume of issues post-go-live |
| 6 | Schedule T — Premiums by State | R-08 | State allocation logic embedded in legacy systems |
| 7 | Multi-Basis Trial Balance | M-07 | The fundamental test; if this doesn't work, nothing works |
| 8 | Consolidation Processing | O-10 | Common COA across entities is the hardest organizational challenge |
| 9 | Combined Ratio Analysis | M-02 | LOB definitions often change; historical comparability at risk |
| 10 | Cash Flow Projection | M-15 | Cash flow classification changes ripple across all entities |

---

# DIMENSION SUMMARY — COA/GL REQUIREMENTS

Dimensions required across all 59 reports, by priority:

| Dimension | Reports Requiring It | Priority |
|-----------|---------------------|----------|
| **Legal Entity** | Nearly all | Critical |
| **Reporting Basis** (SAP/GAAP/IFRS/Tax/SII) | R-01, R-17–R-21, M-01, M-06, M-07 | Critical |
| **Line of Business** (multiple hierarchies) | R-02, R-03, R-04, R-08, R-09, M-02, M-08, M-09, M-12, M-17, M-18 | Critical |
| **Accident Year** | R-03, R-04, R-20, M-02, M-09, M-12, M-13, O-04 | Critical (P&C) |
| **Direct/Assumed/Ceded** | R-02–R-04, M-02, M-08, M-09, M-19, O-04 | Critical |
| **Intercompany Partner** | R-13, M-22, O-03 | Critical (Groups) |
| **Issue Year Cohort** | R-14, R-15, R-18, R-19, M-10, M-14 | Critical (Life/LDTI) |
| **Product Group** | R-14, R-15, R-18, M-05, M-10, M-14, M-21 | Critical (Life) |
| **State/Territory** | R-08, M-18 | Critical (P&C) |
| **Reinsurer Counterparty** | R-04, M-11, M-19, M-20, O-04 | Critical (Reinsurance) |
| **Treaty/Contract** | R-04, M-11, M-19, O-04 | High (Reinsurance) |
| **Reserve Type** | R-03, R-14, M-09, M-13 | High |
| **Expense Function** | R-09, M-17 | High |
| **NAIC SVO Designation / Asset Class** | R-05, R-11, M-03 | High (Investments) |
| **Currency** | O-11, M-15, R-21 | High (International) |
| **Cost Center** | M-07, M-16, M-17 | High |
| **GAAP Segment** | R-17, M-21 | High (Public) |
| **Solvency II LOB** | R-21 | High (EU operations) |
| **IFRS 17 Group of Contracts** | R-19 | High (IFRS reporters) |
| **CSM / Risk Adjustment** | R-19, M-14 | High (IFRS reporters) |
| **Measurement Model** (GMM/VFA/PAA) | R-19 | High (IFRS reporters) |
