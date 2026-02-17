"""SAP S/4HANA platform knowledge module.

ACDOCA dimensions, cross-dimension impact rules, document splitting,
account groups, and custom extensions relevant to P&C insurance
implementations.
"""

from __future__ import annotations

SAP_PLATFORM_PROMPT = """\
## SAP S/4HANA Platform Knowledge

### ACDOCA: The Universal Journal

In S/4HANA, all financial postings land in a single table (ACDOCA). There \
are no separate CO tables, no reconciliation ledger, no special ledger in \
the classic sense. Every posting carries all dimensions simultaneously. \
This is the foundation of the code block design.

### Insurance-Relevant ACDOCA Dimensions

The code block is the set of fields on every journal entry line. For P&C \
insurance, these are the dimensions that matter:

| # | Field | ACDOCA Column | Purpose in P&C Context |
|---|---|---|---|
| 1 | Company Code | RBUKRS | Legal entity — one per carrier |
| 2 | GL Account | RACCT | The account number itself |
| 3 | Profit Center | PRCTR | LOB, region, or business unit (design choice) |
| 4 | Cost Center | RCNTR | Department: claims ops, UW, actuarial, IT, finance |
| 5 | Segment | SEGMENT | IFRS 8 / ASC 280 reporting segment (derives from PC) |
| 6 | Functional Area | RFAREA | Expense class: claims, acquisition, admin, invest |
| 7 | Business Area | RBUSA | Often unused in P&C — evaluate if needed |
| 8 | Trading Partner | RASSC | Intercompany: affiliates, reinsurers |
| 9 | Fund | RFUND | Not typically used in P&C (public sector field) |
| 10 | Grant | RGRANT | Not typically used in P&C |
| 11 | WBS Element | RPROJ | Project tracking — IT implementations, special programs |
| 12 | Internal Order | AUFNR | Cost collection for specific initiatives |
| 13 | Sales Order | KDAUF | Not used in P&C (consider claims reference instead) |
| 14 | Customer | KUNNR | Policyholder, insured, agent, broker (subledger) |
| 15 | Vendor | LIFNR | Service provider, TPA, reinsurer (subledger) |
| 16 | Controlling Area | KOKRS | Usually 1:1 with company code in S/4 |
| 17 | Ledger Group | RLDNR | Parallel accounting: GAAP (0L), Statutory (2L), Tax (3L) |
| 18 | Currency Type | CURTYPE | Local, group, hard, index — multi-currency postings |
| 19 | Valuation Area | VALUATN | Parallel valuation for different acct standards |
| 20 | Partner Profit Center | PPRCTR | Cross-LOB allocations, IC settlement |
| 21 | Partner Cost Center | PRCTR_P | IC cost allocation detail |
| 22 | Partner Segment | PSEGMENT | Ensures segment balance with IC postings |
| 23 | Reference Document | AWREF | Link to originating business transaction |
| 24 | Assignment | ZUONR | Flexible grouping field (configurable sort key) |

**P&C Custom Extensions (CI_COBL)**:

| # | Custom Field | Purpose |
|---|---|---|
| 25 | State (ZZ_STATE) | US state code for state-level regulatory reporting |
| 26 | LOB (ZZ_LOB) | Line of business if not using profit center for LOB |
| 27 | Accident Year (ZZ_ACCYR) | Year of loss occurrence for Schedule P |
| 28 | Policy Year (ZZ_POLYR) | Underwriting year for UW profitability |
| 29 | Treaty ID (ZZ_TREATY) | Reinsurance treaty for ceded accounting |
| 30 | NAIC Line (ZZ_NAIC) | NAIC Annual Statement line code |

### Cross-Dimension Impact Rules

Dimensional decisions cascade. When one dimension is defined, it constrains \
or determines others:

1. **Profit Center → Segment**: Segment derives from profit center through \
the profit center master. If PC = LOB, then segment will be at or above \
the LOB level (e.g., "P&C" or "Non-Life"). You cannot have segment at a \
finer grain than profit center.

2. **Profit Center → COPA**: If profit center already represents LOB, do \
not duplicate LOB as a separate COPA characteristic. Use COPA for \
dimensions orthogonal to profit center (state, product, channel).

3. **Segment → Document Splitting**: Segment is the primary splitting \
characteristic. Document splitting ensures that every balance sheet line \
item carries a segment, enabling segment-level balance sheets. If you \
activate document splitting on segment, every posting that touches the \
balance sheet will be split by segment.

4. **Functional Area → Account Assignment**: Functional area can default \
from the account (for P&L accounts) or from the cost object (cost center \
or internal order). For insurance, most expense accounts have a natural \
functional area: claims expense → CLAIMS, commission expense → ACQUIS, \
IT expense → ADMIN.

5. **Trading Partner → IC Elimination**: Trading partner is required for \
intercompany postings to enable consolidation elimination. If the carrier \
has affiliates or captive reinsurers, trading partner must be populated on \
all IC transactions.

6. **Custom Fields → Document Splitting**: Custom fields added via CI_COBL \
can participate in document splitting, but each additional splitting \
characteristic increases the number of split line items. Use sparingly — \
split on segment (mandatory) and possibly one custom field (e.g., state \
if state-level balance sheet is required).

7. **Ledger Group → Parallel Accounting**: If the carrier needs GAAP, \
statutory, and tax books, configure parallel ledgers. Each ledger can have \
different account assignments for the same transaction (e.g., different \
reserve valuations under GAAP vs. statutory).

### Account Groups and Field Status

Account groups control:
- **Number range**: Which GL account numbers are available (e.g., 1xxxxx \
for assets, 2xxxxx for liabilities)
- **Field status**: Which code block fields are required, optional, or \
suppressed for postings to accounts in this group
- **Account type**: Balance sheet (A/L/E) or P&L (R/X)

**P&C-specific account groups** typically include:
- CASH: Cash and equivalents
- INVEST: Investment assets
- PREM: Premium receivables
- RESV: Loss reserves (case, IBNR, LAE)
- UPR: Unearned premium
- REINS: Reinsurance recoverables and ceded amounts
- PREM_REV: Premium revenue (written, earned)
- LOSS: Loss and LAE expense
- COMM: Commission expense
- OPEX: Operating expenses by function
- STAT: Statutory adjustments
- IC: Intercompany

### Configuration Sequence

The technical configuration follows a specific order due to dependencies:
1. Define ledger groups and parallel accounting approach
2. Define account groups and number ranges
3. Define profit center hierarchy → segment assignment
4. Configure document splitting characteristics and rules
5. Define functional area derivation rules
6. Configure field status groups per account group
7. Implement custom fields (CI_COBL) with BAdI for derivation/validation
8. Configure COPA characteristics and value fields
9. Set up substitution and validation rules

Changes to items higher in this sequence cascade to everything below. This \
is why getting profit center, segment, and document splitting right is \
critical — they are the hardest to change post-go-live.
"""
