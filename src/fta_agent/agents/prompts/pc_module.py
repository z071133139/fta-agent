"""P&C insurance domain knowledge module.

Deep domain content covering the accounting and reporting concepts that
drive chart-of-accounts design for Property & Casualty carriers.
"""

from __future__ import annotations

PC_DOMAIN_PROMPT = """\
## P&C Insurance Domain Knowledge

### Loss Reserves

Loss reserves are the largest liability on a P&C carrier's balance sheet. \
The COA must support three distinct reserve categories, each with different \
estimation methodologies and reporting requirements:

- **Case Reserves**: Known claims with estimated settlement amounts. Set by \
adjusters on individual claims. Account structure typically by LOB and \
claim type (bodily injury, property damage, liability, medical payments).
- **IBNR (Incurred But Not Reported)**: Actuarial estimate for claims that \
have occurred but not yet been reported. Booked as a bulk reserve at the \
LOB level. Critical for NAIC Annual Statement Schedule P.
- **LAE (Loss Adjustment Expenses)**: Costs of settling claims. Split into \
ALAE (Allocated — tied to specific claims: legal fees, expert witnesses) \
and ULAE (Unallocated — overhead: adjuster salaries, claims system costs). \
ALAE follows the claim; ULAE is allocated by formula.

**COA implication**: Reserve accounts need structure by LOB x reserve type \
(case/IBNR/LAE) at minimum. Some carriers further split by accident year \
on the balance sheet, though this is more commonly tracked as a reporting \
dimension rather than separate accounts.

### Unearned Premium Reserve (UPR)

Premium is earned over the policy period. The unearned portion is a \
liability. P&C policies are short-duration contracts (typically 6 or 12 \
months), so UPR is material and turns over rapidly.

**COA implication**: UPR accounts by LOB are standard. The earning pattern \
(pro-rata daily vs. monthly) affects the close process but not typically \
the account structure.

### Reinsurance Recoverables

Reinsurance creates both assets (recoverables on paid and unpaid losses) \
and liabilities (ceded unearned premium). Treaty types that affect the \
COA structure:

- **Quota Share**: Proportional — fixed percentage ceded. Straightforward \
accounting: gross, ceded, net.
- **Excess of Loss**: Non-proportional — ceded only above attachment point. \
More complex accounting, may require separate tracking by treaty.
- **Facultative**: Individual risk placement. Often tracked as a dimension \
on the posting rather than separate accounts.

**COA implication**: Gross/ceded/net accounting requires parallel account \
structures. Each premium and loss account needs a ceded counterpart. \
Trading partner (reinsurer) should be tracked for credit risk monitoring.

### State-Level Reporting

P&C carriers must file separate statutory financials by state for each \
state where they are licensed. This drives the need for state as a \
reporting dimension in the GL.

**Key requirements**:
- Premium by state (direct and assumed)
- Losses by state
- LAE by state
- Premium taxes by state (rates vary: typically 1.5-4% of direct premium)
- Regulatory assessments by state (guaranty fund, residual market)

**COA implication**: State is not a standard SAP dimension. Implementation \
options: (1) custom field on the code block via CI_COBL, (2) COPA \
characteristic, (3) derive from profit center if PC = state. The choice \
depends on whether state needs to appear on the balance sheet (document \
splitting) or only in profitability reporting.

### Accident Year and Underwriting Year

P&C carriers analyze results by the year of loss occurrence (accident year) \
and the year the policy was written (underwriting year / policy year).

- **Accident year**: When the loss event occurred. Critical for loss \
development triangles and IBNR estimation.
- **Underwriting year**: When the policy was bound. Used for underwriting \
profitability analysis and rate adequacy.

These are analytical dimensions, not always on every GL posting. They are \
most relevant on loss, reserve, and premium postings. Consider whether they \
belong on the code block (all postings), as a custom field on specific \
document types, or as subledger attributes.

### NAIC Annual Statement

Every P&C carrier files the NAIC Annual Statement (also called the "Yellow \
Book"). The COA must support mapping to its key schedules:

- **Schedule P**: Loss and LAE development by line of business and \
accident year. The most complex schedule — requires 10 years of triangle \
data by LOB.
- **Schedule T**: Premium and loss by state. Drives the state-level \
reporting requirement.
- **Exhibit of Premiums and Losses (Underwriting & Investment Exhibit)**: \
Combined ratios by line of business.
- **Schedule D**: Investment portfolio details.
- **Schedule F**: Reinsurance details and credit quality.

**COA implication**: NAIC line-of-business codes must map to the GL's LOB \
dimension. The COA should support aggregation to NAIC reporting lines \
without manual reclassification.

### Salvage and Subrogation

After paying a claim, the carrier may recover amounts through:
- **Salvage**: Recovery from the damaged property (e.g., totaled vehicle)
- **Subrogation**: Recovery from the at-fault party or their insurer

These reduce the net cost of losses and must be tracked separately from \
gross loss payments for NAIC reporting and reserving.

**COA implication**: Separate accounts or posting dimensions for salvage \
and subrogation recoveries, typically by LOB.

### Short-Duration Contracts (ASC 944)

P&C insurance contracts are classified as short-duration under ASC 944 \
(formerly FAS 60). This affects revenue recognition (premium earned over \
the coverage period), loss recognition (when the insured event occurs), \
and the liability adequacy test (premium deficiency reserve).

**COA implication**: The COA must support the distinction between written \
premium, earned premium, and unearned premium. Loss accounts must support \
both paid losses and reserve changes (incurred = paid + change in reserves).
"""
