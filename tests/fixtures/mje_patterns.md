# Embedded MJE Patterns in Synthetic Data

Generated with seed: 42
Fiscal year: 2025

These patterns are deliberately embedded for detection verification.
The evaluation framework checks that the data pipeline finds all of them.

| # | Pattern | User | Frequency | Accounts | Expected Count |
|---|---------|------|-----------|----------|---------------|
| 1 | **recurring_identical**: Jackie Smith books identical reclassification every quarter | JSMITH | quarterly | 720900 / 720300 | 4 |
| 2 | **recurring_template**: Monthly allocation of shared IT costs across LOBs | MBROWN | monthly | 720400 / 700200,710100 | 12 |
| 3 | **reclassification**: Systematic reclass from generic loss to LOB-specific loss accounts | JSMITH | monthly | 500000 / 500010 | 12 |
| 4 | **intercompany**: Manual IC entries for shared service charges | ACHEN | monthly | 160000 / 720000 | 12 |
| 5 | **accrual_reversal**: Month-end claims accrual with next-month reversal | JSMITH | monthly | 500030 / 220400 | 24 |
| 6 | **correction**: Corrections to fix wrong LOB postings (user error) | DWILSON | sporadic | various (corrections) | 10 |
| 7 | **consolidation_adjustment**: Quarter-end group consolidation adjustments | LJONES | quarterly | various (consolidation) | 8 |

## Key Person Risk Signal

- **JSMITH (Jackie Smith)** is deliberately the highest-volume MJE preparer
- Books: recurring identical, reclassification, accrual/reversal, plus 3-5 misc MJEs/month
- Expected to be flagged by preparer analysis as concentration risk

## Account Activity Patterns

- ~2,500 accounts total, ~85% active, ~15% dormant/low-activity
- 5 explicitly inactive accounts (190000, 190100, 290000, 490000, 590000)
- State-level detail accounts for premium and loss by LOB
- 4 LOBs: AUTO, HOME, COMML, WC with different volume profiles
