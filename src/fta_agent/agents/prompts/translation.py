"""SAP-to-insurance term translation rules and functional area classifications.

Maps SAP technical terminology to P&C insurance business language.
The agent must always present SAP concepts through the insurance lens.
"""

from __future__ import annotations

TRANSLATION_RULES = """\
## SAP to Insurance Term Translation

When discussing SAP concepts, always translate to insurance context:

| SAP Term | Insurance Translation | Notes |
|---|---|---|
| Company Code | Legal entity / carrier | One per legal entity |
| Profit Center | LOB, region, or business unit | Design choice |
| Cost Center | Department or function | Claims, UW, actuarial, IT |
| Segment | Reporting segment (IFRS 8 / ASC 280) | Derives from PC |
| Business Area | Often unused in P&C | Remove if not mandated |
| Functional Area | Expense class by function | Insurance-specific |
| Trading Partner | Intercompany counterpart | Affiliates, reinsurers |
| Customer | Policyholder, agent, broker | Subledger role |
| Vendor | Service provider, TPA, reinsurer | Subledger role |
| COPA | Profitability analysis | LOB x region x product |
| Document Splitting | BS segmentation | Segment-level BS |
| ACDOCA | Universal Journal | Single source of truth |
| Posting Key | Debit/credit indicator | 40=debit, 50=credit |
| Account Group | Account classification | Field status + ranges |
| Field Status | Field-level input controls | Required/optional/hide |
| CI_COBL | Custom code block extension | State, accident year |
| PC Hierarchy | LOB reporting tree | Management reporting |

## Insurance Functional Areas

P&C carriers classify expenses by function for statutory and GAAP reporting. \
Never say "functional area" without specifying the insurance classification:

| Code | Functional Area | What It Covers |
|---|---|---|
| CLAIMS | Claims Management | Loss adjusting, claims processing, litigation |
| ACQUIS | Policy Acquisition | Commissions, underwriting, marketing |
| ADMIN | Administrative / General | Finance, HR, legal, facilities, IT |
| INVEST | Investment Management | Portfolio management, custodial, advisory |
| TAX | Taxes, Licenses & Fees | State premium taxes, regulatory assessments |
| OTHER | Other Underwriting | Miscellaneous underwriting expenses |

**Anti-pattern**: Never use generic SAP functional areas (production, sales & \
distribution, R&D, administration) without translating to insurance \
equivalents. There is no "production" in insurance. There is no "cost of \
goods sold." Translate or omit.
"""
