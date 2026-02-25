#!/usr/bin/env python3
"""Generate mock-requirements.ts with 314 BusinessRequirement objects."""

import json
import random

random.seed(42)

# All requirement texts organized by PA and SP
REQS: dict[str, dict[str, list[dict]]] = {}

def r(pa: str, sp: str, tag: str, segment: str, text: str, status: str = "draft"):
    key_pa = pa
    key_sp = sp
    if key_pa not in REQS:
        REQS[key_pa] = {}
    if key_sp not in REQS[key_pa]:
        REQS[key_pa][key_sp] = []
    REQS[key_pa][key_sp].append({"tag": tag, "segment": segment, "text": text, "status": status})

# ===== PA-01: Chart of Accounts & Org Structure (16 reqs, 4 SPs) =====
# SP-01.1: COA Design & Hierarchy (4)
r("01","01.1","FIN","All","System must support a unified chart of accounts with minimum 10-segment structure including company, line of business, legal entity, product, geography, cost center, intercompany, reserve category, GAAP/STAT indicator, and free-form analysis dimensions")
r("01","01.1","FIN","All","COA must enforce parent-child hierarchy validation with inheritance rules preventing posting to summary-level accounts","validated")
r("01","01.1","CTL","All","Account creation workflow must require dual approval with segregation-of-duties enforcement between requestor and approver roles")
r("01","01.1","OPS","All","System must support mass account creation and modification via upload template with pre-validation checks against existing hierarchy rules")

# SP-01.2: Legal Entity & Org Hierarchy (4)
r("01","01.2","REG","All","Legal entity structure must support multi-jurisdictional reporting with separate statutory books per domicile state and country of incorporation")
r("01","01.2","FIN","All","Organizational hierarchy must support matrix reporting across legal entity, management unit, and statutory filing dimensions simultaneously","validated")
r("01","01.2","OPS","All","System must maintain effective-dated organizational changes with full audit trail of hierarchy modifications and re-parenting events")
r("01","01.2","INT","All","Legal entity master data must synchronize bidirectionally with policy administration and claims systems within 15-minute SLA")

# SP-01.3: Segment & LOB Mapping (4)
r("01","01.3","FIN","P&C","Line of business dimension must map to NAIC Annual Statement lines 1–35 with crosswalk to ISO statistical codes and internal product hierarchy")
r("01","01.3","REG","P&C","Segment reporting must support ASC 280 operating segments with automated elimination of intersegment transactions at consolidation")
r("01","01.3","FIN","All","System must maintain version-controlled mapping tables between internal LOB codes and all external reporting classifications (NAIC, ISO, IRIS)")
r("01","01.3","OPS","P&C","LOB reclassification must cascade to all downstream reporting without requiring journal entry reversal or manual reclassification entries")

# SP-01.4: Account Security & Access (4)
r("01","01.4","CTL","All","GL account posting must enforce role-based access control with restrictions by account range, legal entity, and transaction type")
r("01","01.4","CTL","All","System must prevent posting to closed periods, inactive accounts, and entities outside the user's authorized scope with real-time validation","validated")
r("01","01.4","REG","All","Access control changes must generate SOX-compliant audit logs with before/after state capture and reviewer attestation workflow")
r("01","01.4","OPS","All","Account lock/unlock for period close must be configurable by account group, entity, and module with override capability restricted to controller role")

# ===== PA-02: General Ledger & Multi-Basis Accounting (20 reqs, 5 SPs) =====
# SP-02.1: Multi-GAAP Parallel Ledger (4)
r("02","02.1","FIN","All","System must support parallel ledger posting for US STAT, US GAAP, and IFRS 17 with automated adjustment entries between bases","validated")
r("02","02.1","FIN","All","Each accounting basis must maintain independent trial balance, journal history, and subledger detail with cross-basis reconciliation capability")
r("02","02.1","REG","All","Statutory basis must enforce SAP (Statutory Accounting Principles) recognition and measurement rules distinct from GAAP treatment for the same transaction")
r("02","02.1","FIN","All","System must support basis-specific opening balance migration with automated proof of continuity between legacy and target ledger balances")

# SP-02.2: Journal Entry Processing (4)
r("02","02.2","OPS","All","Journal entry input must support manual, recurring, template-based, and automated entries with distinct workflow approval chains per entry type")
r("02","02.2","CTL","All","All journal entries must enforce balanced debit/credit validation with multi-currency balancing at both functional and reporting currency levels","validated")
r("02","02.2","CTL","All","Reversing journal entries must auto-generate in the subsequent period with configurable reversal date logic (first day vs. last day of next period)")
r("02","02.2","OPS","All","Mass journal upload must support CSV and Excel formats with real-time validation, duplicate detection, and error reporting before commit")

# SP-02.3: Currency & Translation (4)
r("02","02.3","FIN","All","Multi-currency engine must support transaction currency, functional currency, and up to three reporting currencies with independent rate type assignment")
r("02","02.3","FIN","All","Currency translation must apply current rate method for balance sheet and temporal method for income statement with CTA posted to equity","validated")
r("02","02.3","REG","All","Statutory translation must support SSAP 23 requirements for non-admitted asset valuation and surplus translation for alien insurers")
r("02","02.4","OPS","All","Exchange rate tables must support daily spot, monthly average, and historical rates with automated feed from market data provider and manual override capability")

# SP-02.4: Period Close & Lock (4)
r("02","02.4","OPS","All","Period close must support phased lockdown by module (AP, AR, GL) with configurable close calendar and automated status dashboard","validated")
r("02","02.4","CTL","All","Post-close adjustment entries must require elevated approval workflow with materiality threshold and audit committee notification triggers")
r("02","02.4","OPS","All","System must support soft close (preliminary reporting with provisional entries) and hard close (final lock with period seal) as distinct states")
r("02","02.4","FIN","All","Year-end close must automatically generate income summary entries, roll retained earnings, and initialize opening balances for new fiscal year")

# SP-02.5: Audit Trail & Journal Drill-Down (4)
r("02","02.5","CTL","All","Every GL posting must maintain immutable audit trail capturing user ID, timestamp, source system, approval chain, and original transaction reference","validated")
r("02","02.5","OPS","All","GL balance drill-down must navigate from trial balance to journal entry to source subledger transaction in three clicks or fewer")
r("02","02.5","REG","All","Audit trail retention must meet 10-year regulatory requirement with indexed search capability across all journal entry fields")
r("02","02.5","INT","All","External audit data extraction must support configurable export templates for Big Four audit platforms (Aura, Canvas, Helix, Omnia)")

# ===== PA-03: Premium Accounting & Revenue Recognition (20 reqs, 5 SPs) =====
# SP-03.1: Gross Written Premium Recording (4)
r("03","03.1","FIN","P&C","System must record gross written premium from policy administration system with breakdown by coverage, term, and installment schedule","validated")
r("03","03.1","OPS","P&C","Premium booking must support endorsement processing including mid-term premium changes, return premium, and additional premium with audit trail to original policy")
r("03","03.1","INT","P&C","Policy administration interface must capture policy-level premium detail sufficient to support statutory Schedule P and Schedule T reporting requirements")
r("03","03.1","CTL","P&C","Premium suspense account must auto-clear within configurable threshold (default 5 business days) with aging report and escalation workflow for unresolved items")

# SP-03.2: Premium Earning & Unearned Premium (4)
r("03","03.2","FIN","P&C","Earned premium calculation must support daily pro-rata, monthly pro-rata, and Rule of 78 methods configurable by line of business and product")
r("03","03.2","FIN","P&C","Unearned premium reserve must calculate at policy level and aggregate to statutory line with mid-month inception support and leap-year handling","validated")
r("03","03.2","REG","P&C","UEPR calculation must comply with SSAP 53 requirements including separate treatment for audit premiums, retrospectively rated premiums, and multi-year policies")
r("03","03.2","OPS","P&C","System must support earning pattern override for specific products (e.g., warranty, surety) where risk exposure differs from pro-rata time distribution")

# SP-03.3: Written Premium Adjustments (4)
r("03","03.3","FIN","P&C","Return premium processing must reverse original earned/unearned split proportionally with separate tracking for cancellation type (flat, short-rate, pro-rata)")
r("03","03.3","OPS","P&C","Retrospective premium adjustments must calculate based on loss experience with configurable rating formula, minimum/maximum premium constraints, and lag recognition")
r("03","03.3","FIN","P&C","Audit premium must be recognized when billed with retrospective adjustment to earned premium based on exposure audit completion date")
r("03","03.3","CTL","P&C","All premium adjustments exceeding materiality threshold must route through supervisory approval workflow with documented business justification")

# SP-03.4: Premium Receivable & Aging (4)
r("03","03.4","FIN","P&C","Premium receivable aging must track by installment due date with configurable aging buckets (current, 30, 60, 90, 120+ days) by legal entity and LOB")
r("03","03.4","CTL","P&C","Bad debt provision for premium receivables must calculate using expected credit loss model with historical write-off analysis by agent/broker channel","validated")
r("03","03.4","OPS","P&C","Premium collection matching must support automated cash application with tolerance-based matching rules and exception queue for partial payments")
r("03","03.4","REG","P&C","Non-admitted premium receivable classification must follow domiciliary state rules with automated reclassification at configured aging thresholds")

# SP-03.5: Premium Tax & Surcharge Accounting (4)
r("03","03.5","REG","P&C","Premium tax liability must calculate by state of risk using jurisdiction-specific tax rates with separate tracking for surplus lines, independently procured, and retaliatory taxes")
r("03","03.5","FIN","P&C","Guaranty fund assessments must accrue based on published assessment rates by state and line with recoupment surcharge tracking against policyholder billings")
r("03","03.5","REG","P&C","System must support multi-state premium tax return preparation with automated allocation of direct and assumed premium by state of risk per Schedule T methodology","validated")
r("03","03.5","OPS","P&C","Residual market mechanism assessments (FAIR plans, auto pools, wind pools) must track by state and program with separate involuntary market expense allocation")

# ===== PA-04: Loss & Claims Accounting (20 reqs, 5 SPs) =====
# SP-04.1: Paid Loss Recording (4)
r("04","04.1","FIN","P&C","Paid loss transactions from claims system must post to GL with full dimensional coding including accident year, LOB, claim type (indemnity vs. expense), and catastrophe indicator","validated")
r("04","04.1","INT","P&C","Claims payment interface must support multiple payment types (indemnity, DCC, A&O, supplemental) with distinct GL account mapping per payment category")
r("04","04.1","CTL","P&C","Loss payment GL entries must reconcile to claims system payment register within $0 tolerance with automated exception reporting for any discrepancy")
r("04","04.1","OPS","P&C","Paid loss recording must support voided and reissued payments with proper reversal accounting and net reporting on statutory exhibits")

# SP-04.2: Case Reserve Accounting (4)
r("04","04.2","FIN","P&C","Case reserve changes from claims system must post as incurred loss adjustments with net change method tracking by accident year and development period")
r("04","04.2","INT","P&C","Case reserve interface must capture gross, ceded, and net reserve positions with automatic reinsurance recovery calculation at individual claim level")
r("04","04.3","CTL","P&C","Case reserve adequacy analysis must support quarterly actuarial review with systematic comparison of initial reserve to ultimate settlement by claim cohort","deferred")
r("04","04.2","OPS","P&C","Bulk reserve adjustments for catastrophe events must post with event code tagging and separate accumulation for PCS catastrophe reporting")

# SP-04.3: IBNR & Bulk Reserve Accounting (4)
r("04","04.3","FIN","P&C","IBNR reserve booking must support actuarial output import with accident year, LOB, and reserve category detail sufficient for Schedule P reporting","validated")
r("04","04.3","FIN","P&C","System must maintain development triangle data (paid, incurred, reported counts) with automated popul from transaction data for actuarial analysis export")
r("04","04.3","REG","P&C","Loss reserve discounting must comply with IRS Section 846 discount factors with annual update capability and separate GAAP undiscounted reserve tracking")
r("04","04.3","CTL","P&C","Actuarial reserve imports must route through actuarial sign-off workflow with comparison to prior quarter and variance explanation for changes exceeding 5%")

# SP-04.4: Loss Adjustment Expense (4)
r("04","04.4","FIN","P&C","Defense and cost containment (DCC) expenses must track separately from adjusting and other (A&O) expenses with proper Schedule P Part 2/3 allocation")
r("04","04.4","FIN","P&C","Unallocated loss adjustment expense reserve must calculate based on paid-to-paid or calendar year method with actuarial input for prospective component")
r("04","04.4","OPS","P&C","Legal fee invoice processing must link to claim file with budget-to-actual tracking and litigation management guideline compliance validation","deferred")
r("04","04.4","REG","P&C","LAE reserve must be reported separately from loss reserves on statutory Annual Statement Schedule P with proper segmentation by accident year and LOB")

# SP-04.5: Salvage, Subrogation & Recovery (4)
r("04","04.5","FIN","P&C","Salvage and subrogation recoveries must reduce incurred losses in the accident year of the original claim with proper offset accounting per SSAP 55","validated")
r("04","04.5","OPS","P&C","Subrogation receivable tracking must support demand letter workflow, recovery aging, and write-off approval process with recovery rate analytics by claim type")
r("04","04.5","FIN","P&C","Anticipated salvage and subrogation must accrue based on actuarial estimates with separate disclosure for statutory and GAAP reporting")
r("04","04.5","CTL","P&C","Recovery transactions must reconcile to claims system recovery register with proper allocation between salvage, subrogation, and deductible recovery categories")

# ===== PA-05: Ceded Reinsurance Accounting (25 reqs, 5 SPs) — ALL have fit_gap =====
# Will be handled separately with fit_gap data

# ===== PA-06: Assumed Reinsurance Accounting (12 reqs, 4 SPs) =====
# SP-06.1: Assumed Treaty Administration (3)
r("06","06.1","OPS","Re","System must maintain assumed treaty master data with contract terms, effective dates, participation shares, and retrocession provisions","validated")
r("06","06.1","INT","Re","Assumed treaty bordereau processing must support electronic and manual ingest with automated validation against treaty terms and commission schedules")
r("06","06.1","CTL","Re","Assumed treaty acceptance workflow must enforce underwriting authority limits with multi-level approval for treaties exceeding defined premium or limit thresholds")

# SP-06.2: Assumed Premium Accounting (3)
r("06","06.2","FIN","Re","Assumed written premium must calculate based on cedant bordereau with application of participation percentage and treaty terms including minimum and deposit provisions")
r("06","06.2","FIN","Re","Assumed premium earning must follow the underlying risk earning pattern provided by the cedant with optional override for portfolio transfer treaties")
r("06","06.2","REG","Re","Funds withheld assumed premium must record the gross premium with offsetting funds withheld liability and imputed interest income calculation","validated")

# SP-06.3: Assumed Loss Accounting (3)
r("06","06.3","FIN","Re","Assumed paid and case reserve losses must record from cedant loss reports with accident year assignment matching the underlying occurrence date")
r("06","06.3","FIN","Re","Assumed IBNR must calculate independently using reinsurance-specific development patterns with separate tracking from direct IBNR estimates")
r("06","06.3","CTL","Re","Assumed loss processing must validate against treaty aggregate limits and stop-loss provisions with automated notification when attachment points are approached")

# SP-06.4: Assumed Reinsurance Reporting (3)
r("06","06.4","REG","Re","Schedule S assumed reinsurance exhibit must auto-populate from assumed treaty and transaction data with proper cedant identification and NAIC codes")
r("06","06.4","FIN","Re","Assumed reinsurance combined ratio analysis must calculate by treaty, cedant, and line of business with trend analysis across underwriting years","deferred")
r("06","06.4","OPS","Re","Cedant account reconciliation must support statement of account matching with automated identification of timing differences and dispute items")

# ===== PA-07: Policyholder Liabilities & Reserves (15 reqs, 5 SPs) =====
# SP-07.1: Loss Reserve Management (3)
r("07","07.1","FIN","P&C","System must maintain separate reserve balances for case, IBNR, ULAE, and salvage/subrogation anticipation with independent booking and release workflows","validated")
r("07","07.1","REG","P&C","Reserve adequacy testing must support management actuarial analysis with documentation of carried reserve vs. actuarial central estimate and range of reasonable estimates")
r("07","07.1","CTL","P&C","Reserve change approval workflow must require actuarial certification and CFO sign-off for changes exceeding 5% of prior quarter carried reserve by LOB")

# SP-07.2: Unearned Premium Reserve (3)
r("07","07.2","FIN","P&C","UPR must calculate at individual policy level with daily granularity and aggregate to statutory line, accident year, and legal entity dimensions")
r("07","07.2","REG","P&C","Premium deficiency reserve testing must compare UPR to expected future losses and expenses with automatic trigger for supplemental reserve booking when deficiency detected")
r("07","07.3","FIN","P&C","Advance premium must track separately from UPR with release to written premium upon policy effective date inception")

# SP-07.3: Retrospective Premium & Loss-Sensitive Liabilities (3)
r("07","07.3","FIN","P&C","Retrospective premium accrual must estimate based on projected loss development with maximum/minimum premium constraints and collateral requirement tracking")
r("07","07.3","OPS","P&C","Retro premium calculation must execute at contract anniversary with interim quarterly estimates using latest loss development data and rating formula application")
r("07","07.3","CTL","P&C","Loss portfolio transfer reserve must account for both the transferred liabilities and any novation or assumption accounting requirements per SSAP 62R")

# SP-07.4: Tabular & Structured Settlement Reserves (3)
r("07","07.4","FIN","P&C","Structured settlement obligations must discount future payment streams using applicable discount rates with annual adequacy testing","deferred")
r("07","07.4","OPS","P&C","Annuity buy-out tracking must maintain present value liability with periodic amortization entries and experience gain/loss recognition")
r("07","07.4","REG","P&C","Life-contingent structured settlement reserves must follow statutory valuation requirements with separate treatment for non-life-contingent payment obligations")

# SP-07.5: Reserve Roll-Forward & Analysis (3)
r("07","07.5","FIN","P&C","System must produce monthly reserve roll-forward showing opening balance, paid losses, case reserve changes, IBNR changes, and closing balance by LOB and accident year","validated")
r("07","07.5","OPS","P&C","Reserve development analysis must track prior-year reserve changes (favorable/adverse) by accident year cohort with Schedule P prior-year development exhibit support")
r("07","07.5","FIN","P&C","Calendar year vs. accident year loss ratio analysis must derive from GL data with proper earned premium denominator matching for each analytical view")

# ===== PA-08: Investment Accounting Interface (15 reqs, 5 SPs) =====
# SP-08.1: Investment Position Interface (3)
r("08","08.1","INT","All","System must receive daily investment position feed from asset management system with security-level detail including CUSIP, par value, book value, and market value","validated")
r("08","08.1","FIN","All","Investment classification must support SSAP categories (bonds at amortized cost, equities at fair value, mortgage loans at amortized cost) with GAAP classification overlay")
r("08","08.1","CTL","All","Investment position reconciliation must match GL investment balances to custodian records and investment system records with three-way reconciliation reporting")

# SP-08.2: Investment Income Accrual (3)
r("08","08.2","FIN","All","Bond interest income must accrue using scientific (actual/actual) or 30/360 methods with amortization of premium and accretion of discount to par at maturity or call date")
r("08","08.2","FIN","All","Dividend income accrual must support ex-date, record date, and payment date accounting with proper period assignment per investment accounting policy","validated")
r("08","08.2","OPS","All","Investment income allocation to legal entities must follow statutory investment pool methodologies with documented allocation basis and quarterly true-up")

# SP-08.3: Realized & Unrealized Gain/Loss (3)
r("08","08.3","FIN","All","Realized gain/loss on investment disposal must calculate using specific identification, FIFO, or average cost method consistently by asset class with lot-level tracking")
r("08","08.3","FIN","All","Unrealized gain/loss for equity securities must flow through surplus (statutory) or income (GAAP-FV through P&L) with proper basis-specific treatment")
r("08","08.3","REG","All","OTTI (Other-Than-Temporary Impairment) testing must run quarterly with credit vs. non-credit loss bifurcation per SSAP 43R requirements","validated")

# SP-08.4: Schedule D Generation (3)
r("08","08.4","REG","All","Schedule D Part 1 (long-term bonds) must auto-generate from investment position data with NAIC SVO designation mapping and amortization schedule")
r("08","08.4","REG","All","Schedule DA (short-term investments) and Schedule DB (derivatives) must populate from investment feed with proper classification and valuation per SSAP 86")
r("08","08.4","OPS","All","Investment schedule data must reconcile to GL balances with automated exception reporting for classification or valuation differences between systems")

# SP-08.5: Derivative & Hedge Accounting (3)
r("08","08.5","FIN","All","Derivative instruments must record at fair value with hedge designation documentation and ongoing effectiveness testing per SSAP 86 and ASC 815")
r("08","08.5","CTL","All","Hedge accounting qualification must be documented at inception with prospective and retrospective effectiveness testing results maintained in system","deferred")
r("08","08.5","FIN","All","Fair value hedge adjustments must offset the hedged item's carrying value with ineffectiveness portion recognized in current period income")

# ===== PA-09: Accounts Payable & Commission Payments (16 reqs, 4 SPs) =====
# SP-09.1: Vendor Invoice Processing (4)
r("09","09.1","OPS","All","Invoice processing must support three-way match (PO, receipt, invoice) with configurable tolerance thresholds and automated approval routing based on amount and category")
r("09","09.1","CTL","All","Duplicate invoice detection must check vendor, amount, invoice number, and date combinations with configurable matching sensitivity and override authorization","validated")
r("09","09.1","OPS","All","Electronic invoice receipt must support EDI 810, PDF extraction via OCR, and vendor portal submission with automated GL coding suggestion based on historical patterns")
r("09","09.1","INT","All","AP subledger must integrate with procurement system for PO-based invoices and with expense management system for non-PO spend with real-time commitment accounting")

# SP-09.2: Agent & Broker Commission Processing (4)
r("09","09.2","FIN","P&C","Commission expense must calculate from commission schedule master data with support for flat rate, sliding scale, contingent, and supplemental commission structures","validated")
r("09","09.2","OPS","P&C","Commission statement generation must reconcile commissions payable to agent/broker accounts with support for commission advance offset and debit balance tracking")
r("09","09.2","REG","P&C","Commission payment must comply with state-specific payment timing requirements with automated hold for agents with suspended or expired licenses")
r("09","09.2","FIN","P&C","Deferred acquisition cost (DAC) amortization must track commission and other acquisition costs with GAAP amortization over policy earning period per ASC 944")

# SP-09.3: Payment Processing & Disbursement (4)
r("09","09.3","OPS","All","Payment execution must support ACH, wire, check, and virtual card with payment method optimization logic based on vendor preference and company cash management strategy")
r("09","09.3","CTL","All","Payment batch release must enforce dual authorization with segregation of duties between payment proposal creation and payment execution approval","validated")
r("09","09.3","OPS","All","Positive pay file generation must produce bank-compliant files for all check payments with automated transmission to banking partners via secure file transfer")
r("09","09.3","FIN","All","Early payment discount capture must calculate optimal payment timing considering discount terms, cash position, and cost of capital with automated scheduling")

# SP-09.4: 1099 & Tax Withholding (4)
r("09","09.4","REG","All","1099 reporting must support all applicable form types (1099-MISC, 1099-NEC, 1099-INT, 1099-DIV) with automated threshold tracking and year-end filing preparation")
r("09","09.4","REG","All","Backup withholding must apply automatically for vendors with missing or invalid TIN per IRS B-notice requirements with proper escrow and remittance accounting","validated")
r("09","09.4","OPS","All","Vendor master TIN validation must interface with IRS TIN matching program with automated flagging of mismatches and vendor notification workflow")
r("09","09.4","CTL","All","Non-resident alien withholding must calculate based on W-8 form series with treaty rate application and quarterly 1042-S reporting capability")

# ===== PA-10: Accounts Receivable & Premium Collections (16 reqs, 4 SPs) =====
# SP-10.1: Premium Billing & Invoicing (4)
r("10","10.1","OPS","P&C","System must generate premium invoices from policy administration billing plan with support for installment, agency bill, and direct bill payment modes")
r("10","10.1","FIN","P&C","Installment billing must calculate finance charges and late fees per state-specific regulatory limits with proper deferred revenue recognition for finance charges","validated")
r("10","10.1","INT","P&C","Billing data interface from policy admin must include policy number, premium amount, billing plan, agent code, and coverage effective dates for proper AR subledger coding")
r("10","10.1","OPS","P&C","Statement of account must consolidate all open items by policyholder or agent/broker with aging detail and payment history for the trailing 12 months")

# SP-10.2: Cash Application & Matching (4)
r("10","10.2","OPS","All","Automated cash application must match incoming payments to open invoices using configurable rules (reference number, amount, payer) with machine learning-assisted matching for ambiguous items","validated")
r("10","10.2","CTL","All","Unapplied cash must post to suspense account with automated aging report and escalation workflow requiring resolution within 5 business days of receipt")
r("10","10.2","OPS","All","Lockbox processing must support multiple bank feeds with automated file parsing, check image capture, and same-day posting with exception queue for unmatched items")
r("10","10.2","FIN","All","Cash application must support split payments across multiple invoices and overpayment handling with configurable rules for credit memo generation vs. refund processing")

# SP-10.3: Agent/Broker Account Management (4)
r("10","10.3","FIN","P&C","Agent account current must track all premium, commission, and claim transactions with net settlement calculation and configurable payment terms by agent tier")
r("10","10.3","CTL","P&C","Agent balance monitoring must flag accounts exceeding credit limits or aging thresholds with automated notification to both agent and internal account management team","validated")
r("10","10.3","OPS","P&C","Agent statement of account must generate monthly with transaction detail, running balance, and net settlement calculation including commission offset")
r("10","10.3","REG","P&C","Premium trust fund compliance must track agent-collected premiums against state fiduciary requirements with automated reporting for trust account deficiency")

# SP-10.4: Collections & Write-Off (4)
r("10","10.4","OPS","P&C","Collection workflow must support configurable dunning sequences by customer segment with escalation from letter to call to cancellation notice per state notice requirements")
r("10","10.4","FIN","P&C","Premium write-off must follow documented approval workflow with proper bad debt expense recognition and separate tracking of written-off balances for potential recovery")
r("10","10.4","REG","P&C","Cancellation for non-payment must comply with state-specific notice periods and proof-of-mailing requirements with earned premium calculation through cancellation effective date","validated")
r("10","10.4","CTL","P&C","Write-off authorization must enforce dollar-based approval thresholds with segregation between the requesting and approving roles and annual review of write-off aging")

# ===== PA-11: Intercompany & Pooling (12 reqs, 3 SPs) =====
# SP-11.1: Intercompany Transaction Processing (4)
r("11","11.1","FIN","All","Intercompany transactions must auto-generate matching entries in both entities with balanced elimination entries at consolidation maintaining audit trail to source")
r("11","11.1","CTL","All","Intercompany balances must reconcile to zero at legal entity pair level with automated identification of unmatched transactions and aging of open intercompany items","validated")
r("11","11.1","OPS","All","Intercompany netting must calculate net settlement across all entity pairs within a netting group with support for multi-currency netting and configurable settlement frequency")
r("11","11.1","FIN","All","Transfer pricing adjustments for intercompany services must calculate based on documented methodology with arm's length pricing validation and annual benchmarking support")

# SP-11.2: Insurance Pooling Accounting (4)
r("11","11.2","FIN","P&C","Pooling arrangement accounting must support both quota share and managing company models with configurable participation percentages and effective date versioning","validated")
r("11","11.2","REG","P&C","Pool member statutory reporting must reflect each member's proportionate share of premium, loss, and expense with Schedule Y intercompany transaction disclosure")
r("11","11.2","OPS","P&C","Pooling allocation must run monthly with automated distribution of assumed and ceded pool entries to member company ledgers based on current participation percentages")
r("11","11.2","CTL","P&C","Pool participation percentage changes must route through regulatory approval workflow with impact analysis showing premium, loss, and surplus effects per member entity")

# SP-11.3: Intercompany Elimination & Consolidation (4)
r("11","11.3","FIN","All","Consolidation elimination entries must auto-generate for intercompany revenue/expense, receivable/payable, and investment/equity with multi-level sub-consolidation support")
r("11","11.3","CTL","All","Elimination journal review must flag any residual intercompany balance exceeding threshold with root cause analysis report showing unmatched transaction detail","validated")
r("11","11.3","REG","All","Minority interest calculation must track non-controlling interest share of subsidiary net income and equity with proper presentation in consolidated financials")
r("11","11.3","FIN","All","Consolidation adjustments must maintain separate identity from operating entries with reversibility and clear linkage between parent elimination and subsidiary source entries")

# ===== PA-12: Fixed Assets & Leases (9 reqs, 3 SPs) =====
# SP-12.1: Fixed Asset Lifecycle (3)
r("12","12.1","OPS","All","Fixed asset register must track asset lifecycle from acquisition through depreciation to retirement with barcode/RFID tagging integration for physical inventory reconciliation")
r("12","12.1","FIN","All","Asset capitalization must support configurable threshold by asset class with automated routing of sub-threshold purchases to expense and proper CIP (construction in progress) tracking","validated")
r("12","12.1","CTL","All","Asset disposal must require approval workflow with gain/loss calculation, proceeds recording, and automated removal from depreciation schedule and insurance coverage listing")

# SP-12.2: Depreciation & Impairment (3)
r("12","12.2","FIN","All","Depreciation calculation must support straight-line, declining balance, sum-of-years-digits, and units-of-production methods with mid-month and half-year convention options")
r("12","12.2","REG","All","Tax depreciation must calculate separately using MACRS with bonus depreciation and Section 179 election support independent of book depreciation","validated")
r("12","12.2","FIN","All","Asset impairment testing must support recoverability assessment with fair value determination and proper write-down accounting per ASC 360 requirements")

# SP-12.3: Lease Accounting (3)
r("12","12.3","REG","All","Lease accounting must comply with ASC 842 (GAAP) and SSAP 22R (statutory) with separate ROU asset and lease liability tracking per accounting basis","validated")
r("12","12.3","FIN","All","Operating and finance lease classification must evaluate using ASC 842 bright-line tests with ongoing reassessment triggers for lease modifications and renewals")
r("12","12.3","OPS","All","Lease payment scheduling must support fixed, variable, and index-based payments with automated remeasurement when variable rate indices are updated")

# ===== PA-13: Cash Management & Treasury (16 reqs, 4 SPs) =====
# SP-13.1: Bank Account Management (4)
r("13","13.1","OPS","All","Bank account master must maintain all account attributes including bank, account number, currency, signatories, and purpose with documented approval for account opening/closing")
r("13","13.1","CTL","All","Bank signatory matrix must enforce authorization limits with multi-signature requirements for transactions above configurable thresholds per bank account and entity","validated")
r("13","13.1","INT","All","Bank connectivity must support SWIFT, BAI2, CAMT.053, and proprietary bank formats for both payment initiation and statement receipt via secure channels")
r("13","13.1","OPS","All","Bank fee analysis must track and categorize all bank charges with comparison to negotiated fee schedules and automated exception flagging for overcharges")

# SP-13.2: Cash Position & Forecasting (4)
r("13","13.2","FIN","All","Daily cash position must aggregate across all bank accounts and entities with real-time visibility into available, ledger, and collected balances by currency","validated")
r("13","13.2","OPS","All","Cash flow forecasting must incorporate scheduled premium collections, claim payments, investment maturities, and operating expenses with configurable forecast horizon and confidence bands")
r("13","13.3","FIN","All","Short-term investment sweep must auto-invest excess cash above target balance using configurable investment rules with overnight, term, and money market fund options")
r("13","13.2","OPS","All","Cash position reporting must support regulatory liquidity adequacy testing with scenario analysis for catastrophe cash demand and reinsurance collection timing")

# SP-13.3: Bank Reconciliation (4)
r("13","13.3","OPS","All","Bank reconciliation must auto-match GL entries to bank statement transactions using configurable rules with separate treatment for deposits, disbursements, and fees","validated")
r("13","13.3","CTL","All","Outstanding items over 30 days must auto-escalate with investigation workflow tracking and mandatory resolution documentation before period close certification")
r("13","13.3","OPS","All","Reconciliation must support multi-currency accounts with translation of bank balances at statement date rates and proper treatment of unrealized currency gains/losses")
r("13","13.3","CTL","All","Bank reconciliation completion must be a mandatory close checkpoint with dashboard visibility showing reconciliation status by account, entity, and period")

# SP-13.4: Cash Controls & Regulatory Compliance (4)
r("13","13.4","CTL","All","Cash handling controls must enforce segregation of duties across payment initiation, approval, execution, and reconciliation with no single user spanning more than two functions")
r("13","13.4","REG","All","Trust account management must comply with state insurance department requirements for premium trust, claim trust, and fiduciary accounts with separate reconciliation","validated")
r("13","13.4","REG","All","OFAC screening must execute against all outgoing payments with automated hold for potential matches and documented resolution workflow per compliance requirements")
r("13","13.4","CTL","All","Fraud detection must monitor payment patterns for anomalies including unusual payee, amount, timing, and geographic patterns with real-time alerting and investigation workflow")

# ===== PA-14: Expense Management & Cost Allocation (16 reqs, 4 SPs) =====
# SP-14.1: Operating Expense Recording (4)
r("14","14.1","OPS","All","Operating expense must record with natural account, cost center, LOB, and function code dimensions sufficient for IEE exhibit allocation and management reporting")
r("14","14.1","CTL","All","Expense approval workflow must enforce delegation-of-authority limits by expense type and amount with automated routing based on organizational hierarchy","validated")
r("14","14.1","OPS","All","Employee expense report processing must support receipt capture, policy compliance checking, and automated GL coding with configurable per-diem and mileage rates")
r("14","14.1","FIN","All","Prepaid expense amortization must track original payment, amortization schedule, and remaining balance with automated monthly recognition entries by benefiting period")

# SP-14.2: Insurance Expense Exhibit Allocation (4)
r("14","14.2","REG","P&C","IEE (Insurance Expense Exhibit) allocation must distribute expenses across statutory lines using approved allocation methodologies including time studies, premium-based, and headcount-based drivers","validated")
r("14","14.2","FIN","P&C","Expense allocation must support multi-step allocation cascading from shared services to functional areas to lines of business with documented methodology and annual review")
r("14","14.2","REG","P&C","Loss adjustment expense must separate into DCC (defense and cost containment) and A&O (adjusting and other) categories per NAIC IEE instructions with proper allocation basis")
r("14","14.3","OPS","P&C","Allocation driver maintenance must support annual update of allocation statistics with version control, approval workflow, and impact analysis before driver changes take effect")

# SP-14.3: Cost Center & Departmental Reporting (4)
r("14","14.3","FIN","All","Cost center reporting must provide budget-to-actual comparison with variance analysis, rolling forecast integration, and drill-down to transaction detail")
r("14","14.3","OPS","All","Internal charge-back processing must calculate service consumption-based allocations with transparent methodology visible to receiving cost centers")
r("14","14.3","CTL","All","Budget vs. actual variance exceeding 10% threshold must trigger automated inquiry workflow with mandatory explanation and re-forecast submission","validated")
r("14","14.3","FIN","All","Shared services cost allocation must use activity-based costing methodology with documented cost drivers and periodic recalibration of allocation rates")

# SP-14.4: DAC & Acquisition Cost Accounting (4)
r("14","14.4","FIN","P&C","Deferred acquisition cost capitalization must identify qualifying costs (commissions, premium taxes, underwriting expenses) with systematic deferral and amortization over earning period")
r("14","14.4","FIN","P&C","DAC recoverability testing must compare unamortized DAC to expected future margins with write-down trigger when anticipated losses exceed remaining premium margin","validated")
r("14","14.4","REG","P&C","Statutory acquisition cost recognition must follow SAP immediate expense recognition for most costs with limited deferral permitted only for agents' balances per SSAP 71")
r("14","14.4","FIN","P&C","GAAP DAC amortization must use the effective yield method for long-duration contracts and the premium-based method for short-duration contracts per ASC 944")

# ===== PA-15: Financial Close & Consolidation (24 reqs, 6 SPs) =====
# SP-15.1: Close Calendar & Task Management (4)
r("15","15.1","OPS","All","Close calendar must define task dependencies, assigned owners, due dates, and completion certification with real-time dashboard showing close progress and bottlenecks","validated")
r("15","15.1","OPS","All","Close task automation must support auto-triggering of dependent tasks upon predecessor completion with parallel path identification and critical path highlighting")
r("15","15.1","CTL","All","Close certification must require sign-off from each functional area controller with attestation that all required procedures have been completed and reconciliations are current")
r("15","15.1","OPS","All","Close cycle time metrics must track task duration, bottleneck identification, and period-over-period trend analysis with target benchmarks for each close task")

# SP-15.2: Subledger Close & Reconciliation (4)
r("15","15.2","CTL","All","All subledger balances must reconcile to GL control accounts with zero-tolerance automated matching and exception workflow for timing differences","validated")
r("15","15.2","OPS","All","Suspense account clearing must complete before close certification with aging analysis, materiality assessment, and documented disposition for remaining items")
r("15","15.2","FIN","All","Accrual estimation methodology must be documented with comparison of estimated vs. actual for prior periods and continuous improvement tracking of estimation accuracy")
r("15","15.2","CTL","All","Balance sheet reconciliation must complete for all accounts above materiality threshold with signed certification, supporting documentation, and variance explanation")

# SP-15.3: Consolidation Processing (4)
r("15","15.3","FIN","All","Consolidation must process for both statutory (combined/consolidated per NAIC rules) and GAAP (ASC 810) purposes with separate elimination and adjustment layers","validated")
r("15","15.3","FIN","All","Currency translation for foreign subsidiaries must apply appropriate rates (closing, average, historical) by account type with cumulative translation adjustment tracking")
r("15","15.3","OPS","All","Consolidation must support multi-level entity hierarchy with sub-consolidation at regional, divisional, and group levels with configurable reporting roll-up structures")
r("15","15.3","FIN","All","Consolidation journal entries must be clearly distinguished from operating entries with full audit trail showing source entity, elimination rule, and paired transaction reference")

# SP-15.4: Topside Adjustments & Reclassifications (4)
r("15","15.4","FIN","All","Topside adjustments at the consolidated level must track by adjustment category (tax provision, pension, mark-to-market) with reversal logic and push-down capability to entities")
r("15","15.4","CTL","All","Topside entry approval must require CFO or Chief Accounting Officer authorization with documented business purpose and quantitative impact assessment","validated")
r("15","15.4","FIN","All","Reclassification entries must support both permanent and temporary reclassifications with automated reversal for temporary items in subsequent period")
r("15","15.4","OPS","All","Manual topside entry tracking must maintain schedule of all recurring and non-recurring manual adjustments with trend analysis and goal to reduce manual entries over time")

# SP-15.5: Close Analytics & Reporting (4)
r("15","15.5","FIN","All","Flash reporting must produce preliminary P&L and balance sheet within 3 business days of month-end with variance to prior month, prior year, and budget")
r("15","15.5","OPS","All","Close metrics dashboard must display days-to-close, number of journal entries, number of reconciling items, and topside adjustment count with trend visualization","validated")
r("15","15.5","FIN","All","Management reporting package must auto-generate from closed trial balance with configurable report templates, narrative sections, and executive summary highlights")
r("15","15.5","CTL","All","Post-close adjustment frequency must be tracked with goal of zero post-close adjustments and root cause analysis for any adjustment made after close certification")

# SP-15.6: Year-End & Audit Support (4)
r("15","15.6","OPS","All","Year-end close must include additional procedures for annual statutory filing preparation, audit evidence assembly, and regulatory examination readiness")
r("15","15.6","CTL","All","Audit request list management must track auditor requests with response SLA, document upload, and status tracking per audit engagement phase","validated")
r("15","15.6","OPS","All","PBC (Prepared by Client) schedule library must maintain templates for recurring audit requests with automated population from GL data and prior year comparison")
r("15","15.6","FIN","All","Subsequent events review must document post-balance sheet events through the audit opinion date with assessment of recognition vs. disclosure treatment per ASC 855")

# ===== PA-16: Statutory & Regulatory Reporting (21 reqs, 7 SPs) =====
# SP-16.1: Annual Statement Preparation (3)
r("16","16.1","REG","P&C","Annual Statement pages 1–7 (balance sheet and income statement) must auto-populate from GL trial balance with statutory basis adjustments applied automatically","validated")
r("16","16.1","REG","P&C","Annual Statement preparation must support both single-entity and combined/consolidated filing with proper elimination entries per NAIC instructions")
r("16","16.1","OPS","P&C","Annual Statement review workflow must include cross-schedule validation, prior year comparison, and NAIC edit check compliance before submission to regulatory filing system")

# SP-16.2: Schedule P — Loss Development (3)
r("16","16.2","REG","P&C","Schedule P must auto-populate Parts 1–7 from loss and premium transaction data with 10-year triangular development by statutory line and accident year","validated")
r("16","16.2","FIN","P&C","Schedule P one-year and total incurred development must calculate from actuarial and transaction data with prior-year reserve development segregated by line and accident year")
r("16","16.2","CTL","P&C","Schedule P data validation must cross-check to Schedule H (paid losses), IEE (ALAE), and aggregate reserves with automated exception reporting for inconsistencies")

# SP-16.3: Schedule F — Ceded Reinsurance (3)
r("16","16.3","REG","P&C","Schedule F must auto-populate from reinsurer master data with authorized/unauthorized classification, collateral tracking, and provision for reinsurance calculation","validated")
r("16","16.3","REG","P&C","Schedule F Part 3 must calculate provision for unauthorized reinsurance based on ceded balances net of qualifying collateral with proper surplus impact calculation")
r("16","16.3","CTL","P&C","Schedule F reinsurer credit assessment must update quarterly with S&P/AM Best rating feed integration and automated notification for rating downgrades below threshold")

# SP-16.4: Schedule T — Premium by State (3)
r("16","16.4","REG","P&C","Schedule T must allocate direct and assumed premium by state of risk with crosswalk to premium tax filing jurisdictions and residual market loadings")
r("16","16.4","OPS","P&C","Schedule T state allocation must reconcile to total direct and assumed written premium on the income statement exhibit with automated exception for allocation variances")
r("16","16.4","REG","P&C","Schedule T must support quarterly filing requirements for applicable jurisdictions with prorated allocation methodology consistent with annual filing approach","validated")

# SP-16.5: RBC — Risk-Based Capital (3)
r("16","16.5","REG","P&C","RBC calculation must populate all component charges (R0–R5) from GL, investment, and reserve data with covariance adjustment and authorized control level determination")
r("16","16.5","FIN","P&C","RBC sensitivity analysis must model impact of reserve changes, investment shifts, and premium growth on capital adequacy ratios with scenario comparison reporting","deferred")
r("16","16.5","CTL","P&C","RBC monitoring must provide quarterly interim calculation with early warning when ratio approaches company action level or trend test failure conditions")

# SP-16.6: IRIS Ratios & Financial Analysis (3)
r("16","16.6","REG","P&C","IRIS (Insurance Regulatory Information System) ratios must auto-calculate from statutory financials with comparison to NAIC benchmark ranges and unusual value flagging","validated")
r("16","16.6","FIN","P&C","Financial ratio trend analysis must track IRIS and other key metrics (combined ratio, operating leverage, reserve-to-surplus) over rolling 5-year period with peer comparison")
r("16","16.6","OPS","P&C","Regulatory financial analysis solvency tools (FAST scoring) must populate from annual statement data with automated identification of ratios outside normal ranges")

# SP-16.7: State Filing & Compliance Calendar (3)
r("16","16.7","OPS","P&C","Regulatory filing calendar must track all state and NAIC filing deadlines with automated reminder workflow and completion status tracking across all domicile and licensed states")
r("16","16.7","REG","P&C","State filing must support NAIC electronic filing via SERFF and state-specific portals with format validation, digital signature, and submission confirmation tracking","validated")
r("16","16.7","CTL","P&C","Filing compliance attestation must require officer certification per state requirements with documented review of filing accuracy and completeness before submission")

# ===== PA-17: GAAP/IFRS External Reporting (12 reqs, 4 SPs) =====
# SP-17.1: GAAP Financial Statement Preparation (3)
r("17","17.1","FIN","All","GAAP financial statements must generate from parallel GAAP ledger with proper presentation of insurance-specific line items per ASC 944 requirements","validated")
r("17","17.1","FIN","All","Statement of cash flows must prepare using indirect method with proper classification of insurance-specific items (premium, losses, commissions) per ASC 230")
r("17","17.1","OPS","All","Financial statement preparation must support management review workflow with inline comment capability, version tracking, and executive approval before external release")

# SP-17.2: GAAP Footnote Disclosure (3)
r("17","17.2","REG","All","Loss reserve disclosure must include tabular reconciliation, development table, and methodology description compliant with ASC 944-40 short-duration insurance requirements")
r("17","17.2","FIN","All","Fair value disclosure must present investment portfolio by level within the fair value hierarchy (Level 1–3) with movement analysis for Level 3 instruments","validated")
r("17","17.2","REG","All","Related party transaction disclosure must identify all intercompany and affiliated transactions with amount, nature, and terms compliant with ASC 850 requirements")

# SP-17.3: SEC Reporting (3)
r("17","17.3","REG","All","10-K and 10-Q preparation must support XBRL tagging of all financial data using US GAAP taxonomy with automated tag mapping from GL account to XBRL element","out_of_scope")
r("17","17.3","REG","All","MD&A data extraction must pull financial metrics, ratios, and trend data from GL and consolidation system with period-over-period variance analysis for narrative support")
r("17","17.3","OPS","All","SEC filing calendar must track all filing deadlines with advance preparation milestones and automated reminder workflow for quarterly and annual submissions","out_of_scope")

# SP-17.4: IFRS 17 Reporting (3)
r("17","17.4","REG","All","IFRS 17 insurance contract measurement must support Building Block Approach (BBA) and Premium Allocation Approach (PAA) with proper CSM calculation and amortization","deferred")
r("17","17.4","FIN","All","IFRS 17 transition accounting must support full retrospective, modified retrospective, and fair value approaches with separate tracking of transition adjustments","deferred")
r("17","17.4","FIN","All","IFRS 17 disclosure requirements must generate from contract group measurement data including reconciliation of opening to closing balances for each measurement component")

# ===== PA-18: Tax Accounting & Compliance (12 reqs, 4 SPs) =====
# SP-18.1: Tax Provision (3)
r("18","18.1","FIN","All","ASC 740 tax provision must calculate current and deferred tax expense from GAAP pre-tax income with book-to-tax difference identification and effective rate reconciliation","validated")
r("18","18.1","FIN","All","Deferred tax asset/liability roll-forward must track temporary differences by source with valuation allowance assessment and realizability analysis per ASC 740-10-30")
r("18","18.1","REG","All","Tax provision must support federal, state, and foreign tax calculations with apportionment methodology and credit/loss carryforward tracking per jurisdiction")

# SP-18.2: Insurance-Specific Tax Calculations (3)
r("18","18.2","REG","P&C","IRC Section 832 taxable income computation must apply insurance-specific modifications including change in unearned premium, loss reserve discount, and proration adjustment")
r("18","18.2","REG","P&C","Loss reserve discount for tax purposes must calculate using IRS-prescribed factors per IRC Section 846 with annual update when new discount factors are published","validated")
r("18","18.2","FIN","P&C","Tax-basis loss reserve must reconcile to statutory reserve with identified differences for case reserve methodology, IBNR approach, and salvage/subrogation treatment")

# SP-18.3: Premium Tax Compliance (3)
r("18","18.3","REG","P&C","Premium tax returns must prepare for all state and local jurisdictions based on direct written premium allocation with retaliatory tax calculation where applicable","validated")
r("18","18.3","REG","P&C","Premium tax credits must track for guaranty fund assessments, fire marshal assessments, and other state-specific credits with proper application against premium tax liability")
r("18","18.3","OPS","P&C","Premium tax filing calendar must track all jurisdiction deadlines with estimated payment scheduling and automated reconciliation of payments to annual returns")

# SP-18.4: Tax Reporting & Audit Support (3)
r("18","18.4","OPS","All","Federal tax return data extraction must auto-populate Form 1120-PC schedules from GL and subsidiary data with documented adjustments from book to tax basis")
r("18","18.4","CTL","All","Tax audit documentation must maintain workpapers, supporting schedules, and position memos with organized retrieval capability for IRS examination requests","validated")
r("18","18.4","REG","All","Transfer pricing documentation must comply with IRC Section 482 requirements with contemporaneous documentation of intercompany pricing methodology and benchmarking analysis","out_of_scope")

# ===== PA-19: Management Reporting & Analytics (15 reqs, 5 SPs) =====
# SP-19.1: Executive Dashboard & KPI (3)
r("19","19.1","FIN","All","Executive dashboard must present key insurance KPIs including combined ratio, loss ratio, expense ratio, premium growth, and investment yield with drill-down capability","validated")
r("19","19.1","FIN","P&C","Underwriting profitability analysis must display by LOB, geography, distribution channel, and policy year with segmented combined ratio decomposition")
r("19","19.1","OPS","All","Dashboard refresh must complete within 15 minutes of close certification with data lineage tracking from source transaction to reported metric")

# SP-19.2: Financial Planning & Budgeting Interface (3)
r("19","19.2","FIN","All","Budget data must integrate from planning system with actual vs. budget variance analysis at all GL dimensions with automated commentary prompts for material variances")
r("19","19.2","OPS","All","Rolling forecast must update quarterly with automated seeding of actuals for completed months and projection methodology for remaining periods based on configured drivers","validated")
r("19","19.2","FIN","All","Capital planning analysis must model surplus adequacy under stress scenarios with risk-based capital impact assessment and dividend capacity calculation")

# SP-19.3: Ad Hoc Query & Self-Service Reporting (3)
r("19","19.3","OPS","All","Self-service reporting must provide business user access to curated data marts with drag-and-drop report builder, calculated field support, and governed data dictionary")
r("19","19.3","INT","All","Data mart must refresh from GL and subledger data with defined latency SLA (real-time for cash, T+1 for other financial data) with data quality monitoring and alerting","validated")
r("19","19.3","CTL","All","Report access control must enforce data security at the row level based on user role, legal entity authorization, and data classification with audit logging of all report execution")

# SP-19.4: Actuarial Data Support (3)
r("19","19.4","FIN","P&C","Actuarial data extract must produce loss triangles, premium development, and claim count data by accident year, LOB, and claim type from GL and claims data sources")
r("19","19.4","INT","P&C","Actuarial data interface must support automated monthly data delivery in standardized format with reconciliation to GL aggregate balances and prior period data consistency checks","validated")
r("19","19.4","OPS","P&C","Actuarial assumption tracking must log reserve methodology changes, selected development factors, and trend rates with version control and actuarial sign-off workflow")

# SP-19.5: Peer Benchmarking & Market Analytics (3)
r("19","19.5","FIN","P&C","Peer company comparison must calculate key ratios from publicly available statutory data with configurable peer group selection by size, LOB mix, and geography")
r("19","19.5","OPS","P&C","Market share analysis must track company premium volume against industry totals by state and LOB using A.M. Best and NAIC market share data","deferred")
r("19","19.5","FIN","P&C","Combined ratio decomposition by peer must present loss ratio, LAE ratio, commission ratio, and other expense ratio with trend analysis over 5-year rolling window")

# ===== PA-20: Data Integration & Sub-Ledger Interfaces (12 reqs, 6 SPs) =====
# SP-20.1: Policy Administration Interface (2)
r("20","20.1","INT","P&C","Policy admin system interface must transmit premium, endorsement, and cancellation transactions with full dimensional coding within 4-hour SLA of source system posting","validated")
r("20","20.1","CTL","P&C","Interface reconciliation must validate record counts, hash totals, and control totals between policy admin and GL with automated exception reporting and retry capability")

# SP-20.2: Claims System Interface (2)
r("20","20.2","INT","P&C","Claims system interface must transmit paid losses, case reserves, and recovery transactions with claim-level detail sufficient for reinsurance allocation and Schedule P reporting")
r("20","20.2","CTL","P&C","Claims interface validation must verify payment totals, reserve movements, and recovery amounts against claims system control reports with zero-tolerance reconciliation","validated")

# SP-20.3: Billing System Interface (2)
r("20","20.3","INT","P&C","Billing system interface must transmit invoice generation, cash application, and write-off transactions with policyholder and agent account detail for AR subledger maintenance")
r("20","20.3","OPS","P&C","Billing interface must support real-time cash posting for lockbox and electronic payments with batch processing for agency sweep and installment billing transactions")

# SP-20.4: Investment System Interface (2)
r("20","20.4","INT","All","Investment system interface must transmit daily position, trade, income, and valuation data with security-level detail for Schedule D reporting and investment income accrual","validated")
r("20","20.4","CTL","All","Investment interface reconciliation must match position counts, market values, and book values between investment system, custodian, and GL with three-way reconciliation report")

# SP-20.5: Banking & Payment Interface (2)
r("20","20.5","INT","All","Banking interface must support inbound statement feeds (BAI2, CAMT.053) and outbound payment files (ACH, wire, check) with automated reconciliation and exception handling")
r("20","20.5","CTL","All","Payment file transmission must use encrypted channels with dual-control release, positive pay integration, and callback verification for high-value wire transfers","validated")

# SP-20.6: Data Quality & Interface Monitoring (2)
r("20","20.6","CTL","All","Interface monitoring dashboard must display real-time status of all inbound and outbound feeds with SLA compliance tracking, error rates, and volume trending","out_of_scope")
r("20","20.6","OPS","All","Data quality rules must validate all interface data against business rules, referential integrity, and reasonableness checks with automated quarantine for failing records")

# ===== PA-05: Ceded Reinsurance Accounting (25 reqs with fit_gap) =====
PA05_REQS = []

# SP-05.1: Treaty & Facultative Setup (5)
PA05_REQS.append({
    "sp": "05.1", "tag": "OPS", "segment": "Re",
    "text": "System must maintain treaty master data supporting proportional (quota share, surplus) and non-proportional (per-occurrence XOL, aggregate XOL, cat XOL) structures with full contract terms",
    "status": "validated",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F1", "notes": "Native treaty master in FS-RI supports all proportional and non-proportional structures with full contract term management"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No native reinsurance module; would require complete custom development of treaty master data model and processing logic"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native reinsurance capability; partner solutions (e.g., Sapiens RI) needed for treaty management with custom GL integration"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No reinsurance functionality; entirely custom build or third-party RI system required with integration to Workday GL"}
        ],
        "gap_remediation": "Implement dedicated reinsurance administration system (e.g., Sapiens RI, RMS) with GL posting interface to ERP",
        "gap_effort": "L",
        "agentic_rating": "A1",
        "agentic_bridge": "Agent can auto-validate treaty terms against contract documents and flag discrepancies for underwriter review",
        "agentic_autonomy": "L1"
    }
})

PA05_REQS.append({
    "sp": "05.1", "tag": "OPS", "segment": "Re",
    "text": "Facultative certificate management must track individual risk cessions with certificate number, ceding percentage, premium, and attachment point linked to underlying policy",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F2", "notes": "FS-RI supports facultative certificates but requires configuration for policy-level linkage and attachment point tracking"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No native support; custom tables and processing required for facultative certificate lifecycle management"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "Requires partner reinsurance solution; no native facultative certificate management capability"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No reinsurance capability; facultative processing requires entirely external system"}
        ],
        "gap_remediation": "Configure RI system facultative module with automated policy-certificate linkage via policy admin integration",
        "gap_effort": "M",
        "agentic_rating": "A2",
        "agentic_bridge": "Agent can auto-match facultative certificates to policies, calculate cession amounts, and generate placement slips for broker review",
        "agentic_autonomy": "L2"
    }
})

PA05_REQS.append({
    "sp": "05.1", "tag": "CTL", "segment": "Re",
    "text": "Reinsurer master data must maintain counterparty credit ratings from A.M. Best, S&P, and Moody's with automated feed updates and notification workflow for rating changes",
    "status": "validated",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F2", "notes": "Business partner master supports rating fields; automated feed from rating agencies requires custom interface development"},
            {"platform": "SAP without FS-RI", "rating": "F4", "notes": "Standard vendor master lacks insurance-specific rating fields; custom extension and monitoring logic needed"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "Supplier master can store ratings as custom attributes but lacks insurance-specific credit monitoring workflows"},
            {"platform": "Workday Financials", "rating": "F4", "notes": "Supplier record can be extended with custom fields for ratings but no native insurance credit monitoring"}
        ],
        "gap_remediation": "Build rating agency API integration with automated master data update and notification engine for threshold breaches",
        "gap_effort": "S-M",
        "agentic_rating": "A2",
        "agentic_bridge": "Agent can monitor rating agency feeds, update reinsurer credit profiles, and generate credit watch reports with recommended actions",
        "agentic_autonomy": "L2-L3"
    }
})

PA05_REQS.append({
    "sp": "05.1", "tag": "FIN", "segment": "Re",
    "text": "Treaty attachment points, occurrence limits, aggregate limits, and reinstatement provisions must be maintained with effective date versioning to support historical and prospective calculations",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F1", "notes": "FS-RI treaty module natively supports layer structures with attachment, limit, reinstatement, and effective date versioning"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No native support for reinsurance treaty structures; complete custom development required"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native treaty structure management; partner RI system needed for layer and limit configuration"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No reinsurance capability; treaty structure management requires external system"}
        ],
        "gap_remediation": "Leverage RI administration system for treaty structure management with GL posting integration for limit and attachment-based calculations",
        "gap_effort": "L",
        "agentic_rating": "A1",
        "agentic_bridge": "Agent can validate treaty terms against signed contracts and flag inconsistencies between system configuration and contract wording",
        "agentic_autonomy": "L1"
    }
})

PA05_REQS.append({
    "sp": "05.1", "tag": "OPS", "segment": "Re",
    "text": "Contract term effective dating must support renewal workflows including automatic roll-forward of expiring treaties, tracking of renewal negotiation status, and binding confirmation processing",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F2", "notes": "FS-RI supports treaty renewal with roll-forward; workflow for negotiation tracking requires additional configuration"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No native reinsurance renewal workflow; would require custom-built renewal management process"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "Contract management module provides some workflow capability but lacks reinsurance-specific renewal logic"},
            {"platform": "Workday Financials", "rating": "F4", "notes": "Business process framework could support basic workflow but no reinsurance-specific renewal management"}
        ],
        "gap_remediation": "Configure RI system renewal module with automated treaty roll-forward and broker portal integration for negotiation tracking",
        "gap_effort": "M",
        "agentic_rating": "A3",
        "agentic_bridge": "Agent can manage renewal timeline, generate renewal submissions from expiring terms, analyze historical experience for renewal pricing, and draft broker instructions",
        "agentic_autonomy": "L2-L3"
    }
})

# SP-05.2: Ceded Premium Accounting (5)
PA05_REQS.append({
    "sp": "05.2", "tag": "FIN", "segment": "Re",
    "text": "Proportional ceded premium calculation must apply treaty cession percentage to subject gross written premium by LOB with automatic update when endorsements modify the underlying premium",
    "status": "validated",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F1", "notes": "Native proportional premium cession calculation with automated endorsement processing and GWP linkage"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No native ceded premium calculation; requires complete custom development of cession logic and GWP linkage"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No ceded premium calculation; requires RI system for proportional cession computation with custom GL posting"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No ceded premium capability; requires external RI system for all cession calculations"}
        ],
        "gap_remediation": "Implement proportional cession engine in RI system with real-time feed from policy admin for endorsement-driven premium adjustments",
        "gap_effort": "L",
        "agentic_rating": "A2",
        "agentic_bridge": "Agent can validate ceded premium calculations against treaty terms, identify premium leakage, and reconcile ceded-to-gross ratios by treaty",
        "agentic_autonomy": "L2"
    }
})

PA05_REQS.append({
    "sp": "05.2", "tag": "FIN", "segment": "Re",
    "text": "Non-proportional (excess of loss) premium allocation must apply per treaty layer based on subject premium, rate-on-line, and sliding-scale provisions with proper allocation across covered LOBs",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F2", "notes": "FS-RI supports XOL premium with rate-on-line calculation; sliding-scale requires additional configuration"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No native XOL premium capability; requires custom build of layer-based premium allocation logic"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No XOL premium calculation; requires partner RI solution for non-proportional premium processing"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No non-proportional reinsurance capability; entirely external system required"}
        ],
        "gap_remediation": "Configure RI system XOL premium module with subject premium feed from GL and automated layer allocation based on treaty terms",
        "gap_effort": "L",
        "agentic_rating": "A1",
        "agentic_bridge": "Agent can review XOL premium allocations for reasonableness and flag misallocations against treaty layer definitions",
        "agentic_autonomy": "L1"
    }
})

PA05_REQS.append({
    "sp": "05.2", "tag": "FIN", "segment": "Re",
    "text": "Minimum and deposit premium processing must track deposit premium payments against treaty minimum premium obligations with adjustment calculation at contract expiration",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F1", "notes": "FS-RI natively manages deposit and minimum premium with automated adjustment at treaty expiry"},
            {"platform": "SAP without FS-RI", "rating": "F4", "notes": "Deposit tracking possible with custom configuration but minimum premium adjustment logic requires development"},
            {"platform": "Oracle Cloud ERP", "rating": "F3", "notes": "Basic deposit tracking possible through contract management; minimum premium adjustment requires customization"},
            {"platform": "Workday Financials", "rating": "F4", "notes": "Deposit payments can be tracked but minimum premium adjustment logic not available natively"}
        ],
        "gap_remediation": "Configure deposit premium tracking with automated minimum premium comparison and adjustment journal generation at treaty expiry",
        "gap_effort": "S-M",
        "agentic_rating": "A2",
        "agentic_bridge": "Agent can monitor deposit premium adequacy against projected minimum, forecast adjustment amounts, and generate treaty settlement calculations",
        "agentic_autonomy": "L2"
    }
})

PA05_REQS.append({
    "sp": "05.2", "tag": "FIN", "segment": "Re",
    "text": "Reinstatement premium calculation must trigger when ceded losses exhaust layer limits with proper application of reinstatement terms (percentage of original premium, pro-rata or full)",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F2", "notes": "FS-RI supports reinstatement calculation but requires configuration for complex reinstatement term variations"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No native reinstatement premium capability; layer exhaustion tracking and reinstatement logic require custom build"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No reinstatement premium calculation; requires RI system for layer tracking and reinstatement trigger logic"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No reinstatement or layer tracking capability; entirely external RI system required"}
        ],
        "gap_remediation": "Implement reinstatement premium engine in RI system with real-time layer exhaustion monitoring and automated premium journal generation",
        "gap_effort": "M",
        "agentic_rating": "A3",
        "agentic_bridge": "Agent can monitor layer erosion in real time, calculate reinstatement premiums, generate broker notifications, and post accounting entries with human approval",
        "agentic_autonomy": "L2-L3"
    }
})

PA05_REQS.append({
    "sp": "05.2", "tag": "FIN", "segment": "Re",
    "text": "Ceded premium earned/unearned calculation must follow the underlying earning pattern with separate tracking for multi-year treaties and treaties with non-standard inception dates",
    "status": "validated",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F1", "notes": "Native ceded UPR calculation with earning pattern alignment to underlying business and multi-year treaty support"},
            {"platform": "SAP without FS-RI", "rating": "F4", "notes": "UPR calculation possible through custom development but lacks native ceded earning pattern management"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native ceded UPR; earning pattern calculation requires custom or partner solution development"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No ceded premium earning capability; requires external system for ceded UPR management"}
        ],
        "gap_remediation": "Configure ceded UPR engine in RI system with earning pattern alignment to gross premium earning methodology",
        "gap_effort": "M",
        "agentic_rating": "A1",
        "agentic_bridge": "Agent can validate ceded earning patterns against underlying gross earning methodology and flag misalignments for actuarial review",
        "agentic_autonomy": "L1"
    }
})

# SP-05.3: Ceded Loss & Reserve Recovery (5)
PA05_REQS.append({
    "sp": "05.3", "tag": "FIN", "segment": "Re",
    "text": "Ceded paid loss recovery calculation must apply treaty terms to gross paid losses with proper allocation across applicable treaties in priority order (fac first, then proportional, then XOL)",
    "status": "validated",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F1", "notes": "FS-RI loss recovery engine supports multi-treaty allocation with configurable priority and automatic cession calculation"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No native ceded loss recovery; requires complete custom development of treaty allocation and recovery logic"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native ceded loss processing; partner RI system needed for treaty-based recovery calculation"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No ceded loss capability; external RI system required for all recovery calculations"}
        ],
        "gap_remediation": "Implement claims-RI system integration for automated cession calculation with treaty priority engine and GL recovery posting",
        "gap_effort": "L",
        "agentic_rating": "A2",
        "agentic_bridge": "Agent can validate ceded recovery calculations against treaty terms, identify under-recovered claims, and generate recovery demand notifications",
        "agentic_autonomy": "L2"
    }
})

PA05_REQS.append({
    "sp": "05.3", "tag": "FIN", "segment": "Re",
    "text": "Ceded case reserve recovery must calculate from gross case reserve changes with treaty-level tracking of recoverable and non-recoverable portions based on treaty retentions and limits",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F2", "notes": "FS-RI supports ceded case reserve tracking; retention and limit boundary handling requires careful configuration"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No ceded reserve capability; custom development needed for treaty-based reserve recovery tracking"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native ceded reserve recovery; requires partner RI solution for treaty-level reserve allocation"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No ceded reserve capability; external RI system required for all reserve recovery tracking"}
        ],
        "gap_remediation": "Configure RI system ceded reserve module with automated calculation from claims system case reserve feed and treaty application logic",
        "gap_effort": "L",
        "agentic_rating": "A1",
        "agentic_bridge": "Agent can reconcile ceded vs. gross reserve movements and flag claims approaching treaty retention or limit boundaries",
        "agentic_autonomy": "L1"
    }
})

PA05_REQS.append({
    "sp": "05.3", "tag": "FIN", "segment": "Re",
    "text": "Ceded IBNR recovery estimation must apply cession factors to gross IBNR by treaty with actuarial input for non-proportional treaties where loss development affects layer penetration",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F3", "notes": "FS-RI supports proportional ceded IBNR; non-proportional IBNR with development-based layer penetration requires additional actuarial input process"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No ceded IBNR capability; requires custom actuarial interface and calculation engine"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native ceded IBNR; actuarial ceded IBNR import possible but no calculation engine"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No ceded IBNR capability; requires external actuarial system with custom GL integration"}
        ],
        "gap_remediation": "Build actuarial ceded IBNR import interface with treaty-level allocation and non-proportional layer penetration estimation support",
        "gap_effort": "M",
        "agentic_rating": "A2",
        "agentic_bridge": "Agent can analyze gross IBNR development patterns, estimate ceded IBNR by treaty layer, and prepare actuarial review package with supporting analytics",
        "agentic_autonomy": "L2"
    }
})

PA05_REQS.append({
    "sp": "05.3", "tag": "OPS", "segment": "Re",
    "text": "Multi-treaty allocation for large losses must apply treaties in contractual order with proper handling of overlapping coverages, interlocking clauses, and net retained loss calculation",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F2", "notes": "FS-RI supports multi-treaty allocation with priority ordering; interlocking clause handling may require custom logic"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No multi-treaty allocation capability; complex loss allocation engine requires full custom development"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native multi-treaty loss allocation; requires dedicated RI solution for complex loss distribution"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No treaty-based loss allocation; complex allocation logic requires external RI system"}
        ],
        "gap_remediation": "Implement multi-treaty allocation engine in RI system with configurable priority rules, interlocking clause logic, and net retention calculation",
        "gap_effort": "L",
        "agentic_rating": "A3",
        "agentic_bridge": "Agent can model multi-treaty loss allocation scenarios, identify optimal recovery paths, and generate allocation worksheets for claims and reinsurance team review",
        "agentic_autonomy": "L2-L3"
    }
})

PA05_REQS.append({
    "sp": "05.3", "tag": "CTL", "segment": "Re",
    "text": "Loss corridor and aggregate limit tracking must monitor cumulative ceded losses against treaty aggregate limits with automated notification when thresholds at 75% and 90% of aggregate are reached",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F2", "notes": "FS-RI tracks aggregate limits; threshold-based notification requires workflow configuration"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No aggregate limit tracking; custom monitoring and notification system required"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native aggregate tracking for reinsurance; custom alerting logic needed on top of partner RI solution"},
            {"platform": "Workday Financials", "rating": "F4", "notes": "No reinsurance aggregate monitoring; alerting framework could support notifications but data source is missing"}
        ],
        "gap_remediation": "Configure aggregate limit monitoring in RI system with automated threshold alerting and escalation workflow to reinsurance and finance teams",
        "gap_effort": "S-M",
        "agentic_rating": "A3",
        "agentic_bridge": "Agent can continuously monitor aggregate erosion, project exhaustion timing based on development trends, and proactively alert stakeholders with recommended actions",
        "agentic_autonomy": "L2-L3"
    }
})

# SP-05.4: Ceding Commission Accounting (5)
PA05_REQS.append({
    "sp": "05.4", "tag": "FIN", "segment": "Re",
    "text": "Provisional ceding commission calculation must apply treaty-defined commission rates to ceded premium with proper accrual for earned but unbilled commission at period end",
    "status": "validated",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F1", "notes": "Native provisional commission calculation with automated accrual based on ceded premium and treaty commission terms"},
            {"platform": "SAP without FS-RI", "rating": "F4", "notes": "Commission calculation possible through custom logic but lacks treaty-based automation"},
            {"platform": "Oracle Cloud ERP", "rating": "F3", "notes": "Basic commission calculation configurable; treaty-specific rate application requires custom development"},
            {"platform": "Workday Financials", "rating": "F4", "notes": "No treaty commission capability; commission calculation requires external RI system"}
        ],
        "gap_remediation": "Configure ceding commission engine in RI system with automated provisional calculation and accrual journal generation",
        "gap_effort": "M",
        "agentic_rating": "A2",
        "agentic_bridge": "Agent can reconcile ceding commission calculations to treaty terms, validate commission rates, and identify commission receivable aging issues",
        "agentic_autonomy": "L2"
    }
})

PA05_REQS.append({
    "sp": "05.4", "tag": "FIN", "segment": "Re",
    "text": "Sliding-scale commission adjustment must calculate based on treaty loss ratio experience with provisional-to-actual adjustment entries at defined calculation dates per treaty terms",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F2", "notes": "FS-RI supports sliding-scale commission with loss ratio calculation; adjustment scheduling requires configuration"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No sliding-scale commission capability; loss ratio-based commission adjustment requires full custom development"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native sliding-scale commission; requires RI system for loss ratio-driven commission adjustment"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No sliding-scale commission capability; treaty loss ratio-based adjustment not available"}
        ],
        "gap_remediation": "Implement sliding-scale commission engine with automated loss ratio calculation, commission adjustment, and settlement statement generation",
        "gap_effort": "M",
        "agentic_rating": "A2",
        "agentic_bridge": "Agent can project sliding-scale commission outcomes based on loss development, model commission sensitivity to reserve changes, and prepare adjustment calculations",
        "agentic_autonomy": "L2"
    }
})

PA05_REQS.append({
    "sp": "05.4", "tag": "FIN", "segment": "Re",
    "text": "Profit commission calculation must apply treaty profit formula with defined expense loading, loss ratio corridors, and deficit carry-forward provisions on both annual and lifetime bases",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F2", "notes": "FS-RI supports profit commission with basic formula; deficit carry-forward and lifetime tracking require additional configuration"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No profit commission capability; complex formula with deficit carry-forward requires full custom development"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native profit commission; partner RI solution needed for treaty-specific profit formula processing"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No profit commission capability; treaty profit formula processing requires external system"}
        ],
        "gap_remediation": "Configure profit commission engine in RI system with treaty-specific formulas, deficit carry-forward tracking, and automated annual/lifetime settlement",
        "gap_effort": "M-L",
        "agentic_rating": "A2",
        "agentic_bridge": "Agent can model profit commission scenarios, track deficit carry-forward balances, and generate commission settlement statements with supporting analytics",
        "agentic_autonomy": "L2"
    }
})

PA05_REQS.append({
    "sp": "05.4", "tag": "OPS", "segment": "Re",
    "text": "Commission receivable and payable management must track balances by reinsurer and treaty with aging analysis, netting against loss settlements, and automated statement reconciliation",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F1", "notes": "Native reinsurer account management with receivable/payable tracking, netting, and statement reconciliation support"},
            {"platform": "SAP without FS-RI", "rating": "F4", "notes": "AP/AR subledger can track balances but lacks treaty-level netting and reinsurance-specific reconciliation"},
            {"platform": "Oracle Cloud ERP", "rating": "F3", "notes": "AP/AR modules can manage reinsurer accounts with custom configuration for netting and treaty-level tracking"},
            {"platform": "Workday Financials", "rating": "F4", "notes": "Basic AP/AR functionality but no treaty-level netting or reinsurance statement reconciliation"}
        ],
        "gap_remediation": "Configure reinsurer account management with treaty-level netting engine and automated statement matching process",
        "gap_effort": "S-M",
        "agentic_rating": "A3",
        "agentic_bridge": "Agent can auto-reconcile reinsurer statements, identify variances, generate dispute documentation, and recommend netting settlements with human approval",
        "agentic_autonomy": "L2-L3"
    }
})

PA05_REQS.append({
    "sp": "05.4", "tag": "FIN", "segment": "Re",
    "text": "Override commission and fronting fee processing must calculate fees for fronting arrangements with proper recognition as commission income and allocation to fronted business segments",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F2", "notes": "FS-RI can handle override commission; fronting fee processing requires additional configuration for income recognition"},
            {"platform": "SAP without FS-RI", "rating": "F4", "notes": "Override commission possible through custom setup; fronting fee allocation requires development"},
            {"platform": "Oracle Cloud ERP", "rating": "F3", "notes": "Revenue recognition module can handle fronting fees with custom configuration for insurance-specific allocation"},
            {"platform": "Workday Financials", "rating": "F4", "notes": "Basic revenue recognition available but fronting fee insurance-specific processing not supported natively"}
        ],
        "gap_remediation": "Configure fronting fee calculation engine with automated income recognition and segment allocation based on fronting arrangement terms",
        "gap_effort": "S",
        "agentic_rating": "A0",
        "agentic_bridge": "Standard configuration item; no agentic enhancement applicable for basic fee calculation",
        "agentic_autonomy": "L1"
    }
})

# SP-05.5: Schedule F & Reinsurer Credit (5)
PA05_REQS.append({
    "sp": "05.5", "tag": "REG", "segment": "Re",
    "text": "Schedule F Part 1-3 data assembly must auto-populate from reinsurer master, treaty, and transaction data with proper classification of assumed, ceded, and intermediary balances",
    "status": "validated",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F2", "notes": "FS-RI maintains data for Schedule F but output formatting and NAIC filing format require report development"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No reinsurance data model; Schedule F data assembly would require complete custom data collection and reporting"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native Schedule F support; data assembly requires custom extraction from partner RI solution and GL"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No Schedule F capability; entirely custom report development from external RI system data required"}
        ],
        "gap_remediation": "Build Schedule F reporting module pulling from RI system and GL data with automated NAIC filing format generation",
        "gap_effort": "L",
        "agentic_rating": "A2",
        "agentic_bridge": "Agent can assemble Schedule F data, validate completeness against treaty inventory, and flag data quality issues before filing deadline",
        "agentic_autonomy": "L2"
    }
})

PA05_REQS.append({
    "sp": "05.5", "tag": "REG", "segment": "Re",
    "text": "Reinsurer authorized/unauthorized classification must apply state-specific rules based on reinsurer licensing status, domicile, and accreditation with automatic reclassification when status changes",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F3", "notes": "FS-RI supports basic authorized/unauthorized flagging; state-specific rule variation and automated reclassification require enhancement"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No reinsurer classification framework; state-specific authorization rules require custom development"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native reinsurer authorization classification; custom attribute management and rule engine needed"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No reinsurer authorization management; state-specific classification requires external system"}
        ],
        "gap_remediation": "Build reinsurer authorization engine with state-specific rule sets and automated NAIC reinsurer database integration for status monitoring",
        "gap_effort": "M",
        "agentic_rating": "A3",
        "agentic_bridge": "Agent can monitor NAIC reinsurer database, track licensing changes, auto-update authorization status, and generate surplus impact analysis for reclassifications",
        "agentic_autonomy": "L2-L3"
    }
})

PA05_REQS.append({
    "sp": "05.5", "tag": "FIN", "segment": "Re",
    "text": "Collateral adequacy tracking must monitor letters of credit, trust accounts, and funds withheld balances against ceded outstanding (paid + case + IBNR) for unauthorized reinsurers",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F3", "notes": "FS-RI tracks ceded outstanding; collateral instrument management and adequacy comparison require additional development"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No ceded outstanding or collateral tracking; complete custom development of collateral adequacy monitoring required"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native collateral tracking for reinsurance; custom solution needed for LOC/trust monitoring against ceded balances"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No reinsurance collateral tracking capability; requires external system for collateral adequacy monitoring"}
        ],
        "gap_remediation": "Implement collateral management module with automated adequacy testing against ceded outstanding and LOC/trust instrument tracking with renewal alerting",
        "gap_effort": "M",
        "agentic_rating": "A2",
        "agentic_bridge": "Agent can monitor collateral adequacy ratios, project future collateral needs based on reserve development, and generate collateral call notifications",
        "agentic_autonomy": "L2"
    }
})

PA05_REQS.append({
    "sp": "05.5", "tag": "FIN", "segment": "Re",
    "text": "Provision for reinsurance (allowance for uncollectible reinsurance) must calculate based on reinsurer credit quality, aging of receivables, and dispute status with quarterly adequacy review",
    "status": "draft",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F3", "notes": "FS-RI provides data for provision calculation; actual provision methodology and automated calculation require custom development"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No reinsurance provision capability; credit quality-based allowance calculation requires full custom development"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "Expected credit loss framework could be adapted but lacks reinsurance-specific provision methodology"},
            {"platform": "Workday Financials", "rating": "F4", "notes": "Basic allowance methodology available but no reinsurance-specific credit quality assessment framework"}
        ],
        "gap_remediation": "Build provision for reinsurance calculation engine with reinsurer credit scoring model and automated Schedule F provision computation",
        "gap_effort": "M",
        "agentic_rating": "A2",
        "agentic_bridge": "Agent can analyze reinsurer credit trends, model provision scenarios under different credit assumptions, and prepare provision adequacy review package",
        "agentic_autonomy": "L2"
    }
})

PA05_REQS.append({
    "sp": "05.5", "tag": "REG", "segment": "Re",
    "text": "Risk transfer testing must evaluate all ceded reinsurance contracts for compliance with SSAP 62R requirements including reasonably possible loss transfer and expected reinsurer deficit analysis",
    "status": "validated",
    "fit_gap": {
        "erp_assessments": [
            {"platform": "SAP with FS-RI", "rating": "F3", "notes": "FS-RI does not perform risk transfer testing natively; actuarial analysis tools needed with results stored in treaty master"},
            {"platform": "SAP without FS-RI", "rating": "F5", "notes": "No risk transfer testing capability; SSAP 62R compliance analysis requires specialized actuarial tooling"},
            {"platform": "Oracle Cloud ERP", "rating": "F4", "notes": "No native risk transfer testing; requires external actuarial analysis with custom documentation management"},
            {"platform": "Workday Financials", "rating": "F5", "notes": "No risk transfer testing capability; SSAP 62R compliance requires specialized external analysis tools"}
        ],
        "gap_remediation": "Implement risk transfer testing workflow with actuarial model integration for ERD (Expected Reinsurer Deficit) and 10-10 rule analysis with documentation management",
        "gap_effort": "M-L",
        "agentic_rating": "A0",
        "agentic_bridge": "Risk transfer testing is a specialized actuarial judgment requiring human expertise; agent role limited to documentation organization",
        "agentic_autonomy": "L1"
    }
})


# Now build the output
lines = []
lines.append('import type { BusinessRequirement, BusinessRequirementsData } from "./mock-data";')
lines.append('')
lines.append('export const BUSINESS_REQUIREMENTS: BusinessRequirementsData = {')
lines.append('  kind: "business_requirements",')
lines.append('  requirements: [')

# First, output all non-PA-05 requirements
req_count = 0
for pa_id, sps in sorted(REQS.items()):
    for sp_id, reqs in sorted(sps.items()):
        for idx, req in enumerate(reqs, 1):
            req_count += 1
            rid = f"BR-{pa_id}.{sp_id.split('.')[1]}.{idx:02d}"
            # fix sp_id format: should be SP-{pa}.{sub}
            sp_full = f"SP-{sp_id}"
            pa_full = f"PA-{pa_id}"

            lines.append('    {')
            lines.append(f'      id: "{rid}",')
            lines.append(f'      pa_id: "{pa_full}",')
            lines.append(f'      sp_id: "{sp_full}",')
            lines.append(f'      tag: "{req["tag"]}",')
            lines.append(f'      segment: "{req["segment"]}",')
            # Escape quotes in text
            text = req["text"].replace('"', '\\"')
            lines.append(f'      text: "{text}",')
            lines.append(f'      status: "{req["status"]}",')
            lines.append('    },')

# Now output PA-05 requirements
for idx, req in enumerate(PA05_REQS):
    req_count += 1
    sp_sub = req["sp"].split(".")[1]
    sp_reqs = [r2 for r2 in PA05_REQS[:idx+1] if r2["sp"] == req["sp"]]
    seq = len(sp_reqs)
    rid = f"BR-05.{sp_sub}.{seq:02d}"
    sp_full = f"SP-{req['sp']}"

    lines.append('    {')
    lines.append(f'      id: "{rid}",')
    lines.append(f'      pa_id: "PA-05",')
    lines.append(f'      sp_id: "{sp_full}",')
    lines.append(f'      tag: "{req["tag"]}",')
    lines.append(f'      segment: "{req["segment"]}",')
    text = req["text"].replace('"', '\\"')
    lines.append(f'      text: "{text}",')
    lines.append(f'      status: "{req["status"]}",')

    fg = req["fit_gap"]
    lines.append('      fit_gap: {')
    lines.append('        erp_assessments: [')
    for erp in fg["erp_assessments"]:
        notes = erp["notes"].replace('"', '\\"')
        lines.append('          {')
        lines.append(f'            platform: "{erp["platform"]}",')
        lines.append(f'            rating: "{erp["rating"]}",')
        lines.append(f'            notes: "{notes}",')
        lines.append('          },')
    lines.append('        ],')
    if "gap_remediation" in fg:
        gr = fg["gap_remediation"].replace('"', '\\"')
        lines.append(f'        gap_remediation: "{gr}",')
    if "gap_effort" in fg:
        lines.append(f'        gap_effort: "{fg["gap_effort"]}",')
    if "agentic_rating" in fg:
        lines.append(f'        agentic_rating: "{fg["agentic_rating"]}",')
    if "agentic_bridge" in fg:
        ab = fg["agentic_bridge"].replace('"', '\\"')
        lines.append(f'        agentic_bridge: "{ab}",')
    if "agentic_autonomy" in fg:
        lines.append(f'        agentic_autonomy: "{fg["agentic_autonomy"]}",')
    lines.append('      },')
    lines.append('    },')

lines.append('  ],')
lines.append('};')
lines.append('')

import sys
print(f"// Total requirements: {req_count}", file=sys.stderr)

output = '\n'.join(lines)
with open('/Users/z0711/fta-agent/web/src/lib/mock-requirements.ts', 'w') as f:
    f.write(output)

print(f"Wrote {req_count} requirements", file=sys.stderr)
