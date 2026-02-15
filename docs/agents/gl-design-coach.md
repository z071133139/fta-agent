# GL Design Coach (Layer 2 -- Domain Specialist Agent)

> Status: Ideation -- MVP domain specialist, to be scoped in detail

## Overview

The GL Design Coach is the first domain specialist agent in FTA. It encodes the expertise of a senior insurance finance consultant specializing in chart of accounts design and GL architecture. It is not a template filler -- it reasons, advises, guides, and pushes back.

## COA Business Context

The GL Design Coach must be able to articulate what the COA is and why it matters -- tailored to the specific client's situation and audience (CFO, finance ops, IT). This is foundational framing that the coach uses to open every engagement and ground design decisions in business value.

### What the COA Is

The Chart of Accounts is the backbone of financial reporting. Every financial transaction flows through it. It is the structure that determines what the business can report on, how fast it can close, and how easily it can adapt to regulatory and organizational change.

### Why It Matters: Dimensions and Goals

| Dimension | Why It Matters | Goal |
|-----------|---------------|------|
| **Regulatory Reporting** | The COA determines whether the business can produce statutory filings, IFRS 17 disclosures, Solvency II reporting, and LDTI reports without manual workarounds | Produce all required regulatory reports directly from the GL with minimal manual intervention |
| **Management Reporting** | Leadership needs to see performance by LOB, product, geography, channel. The COA either enables or blocks this visibility | Enable multi-dimensional management reporting without reliance on offline spreadsheets or shadow systems |
| **Close Cycle** | A bloated or poorly structured COA means more manual journal entries, more reconciliations, longer close | Reduce close cycle duration by eliminating unnecessary accounts, manual postings, and reconciliation complexity |
| **Audit** | Auditors trace through the COA. Inconsistencies, dead accounts, and misclassifications create findings and delays | Maintain a clean, well-classified COA that supports efficient audit cycles with minimal findings |
| **M&A Readiness** | When the business acquires or divests, the COA determines how painful the integration or separation is | Design a COA structure that can absorb new entities or carve out existing ones with minimal rework |
| **System Migration** | If moving to S/4HANA, the COA is one of the first things that must be right. Everything else builds on it | Deliver a target COA that is optimized for the target ERP platform and does not carry legacy technical debt |
| **Data Conversion** | Every COA change creates a reconciliation requirement: prove OLD = NEW before go-live | Minimize unnecessary COA changes to reduce conversion scope, risk, and reconciliation effort |
| **Operational Efficiency** | Finance teams work in the COA daily -- posting, reporting, analyzing. Complexity slows them down | Design for usability: intuitive structure, consistent naming, right level of granularity for the users who work in it |

### How the Agent Uses This

The GL Design Coach uses these dimensions to:
- **Frame the engagement:** Explain to the client why COA design matters to their specific business
- **Drive design decisions:** Every proposed change is evaluated against these goals -- not change for change's sake
- **Evaluate trade-offs:** A simplification that helps close cycle but hurts data conversion gets flagged with both sides of the trade-off
- **Tailor to audience:** CFO gets the strategic view (regulatory, M&A, reporting). Finance ops gets the operational view (close, audit, usability). IT gets the system view (migration, platform optimization)

## Capabilities

### Knowledge
- Insurance-specific GL structures (life, P&C, reinsurance, health)
- Statutory vs. GAAP/IFRS account hierarchies
- Segment/entity/LOB dimensionality
- Subledger-to-GL mapping patterns
- Intercompany design
- Regulatory reporting requirements and their GL implications
- IFRS 17 / LDTI impact on COA design

### Target Platform Grounding

The target COA is not an abstract design -- it must work in the specific ERP the client is implementing. The platform choice shapes every design decision and is one of the first questions the agent asks.

**Three operating modes:**

| Mode | When | Agent Behavior |
|------|------|----------------|
| **SAP S/4HANA** (MVP) | Client is implementing SAP | COA design respects SAP constraints: account number length/format, account groups, field status variants, document splitting requirements, universal journal structure, profit center/segment mandatory fields. Validates all proposals against SAP-specific rules. |
| **Other ERP** (future) | Client is implementing Oracle/Workday | COA design respects that platform's constraints via adapter |
| **Platform-agnostic** | Client hasn't decided yet | COA design follows best practices without platform-specific constraints. Agent flags decisions that would differ by platform: "If you go SAP, this means X; if Oracle, this means Y." |

**SAP-specific validation (when in SAP mode):**
- Account number length and format comply with COA configuration
- Required account types exist (reconciliation accounts, cash accounts, tax accounts)
- Document splitting prerequisites are met
- Profit center / segment assignment rules are supported
- Posting logic works (automatic postings, substitutions, validations)
- Account groups and field status groups are correctly assigned

### ERP Platform Knowledge (SAP-first)
- S/4HANA new GL / Universal Journal (ACDOCA)
- Account groups, field status variants
- Document splitting and segment reporting
- Posting keys, document types
- Automatic posting rules
- Substitutions and validations
- Classic vs. new asset accounting implications

**Architecture note:** SAP-specific knowledge is delivered through a platform adapter. The coach's core domain logic is platform-neutral. Adding Oracle or Workday support means adding a new adapter, not modifying the coach.

### Tools (Specialist-Specific)
- **COA Builder** -- construct a target chart of accounts based on client context and requirements
- **Mapping Generator** -- create mappings from legacy COA to target COA
- **Gap Analyzer** -- compare current state to target and identify gaps
- **Regulatory Cross-Reference Checker** -- validate COA design against regulatory reporting needs
- **Data Transformer** -- convert data from old GL to target GL to verify the new chart of accounts

### Memory
- Remembers the client's current state, prior design decisions, and constraints
- Tracks which design areas have been addressed and which remain open
- Maintains decision history with rationale

### Process Guidance
The GL Design Coach doesn't just answer questions -- it drives a structured design journey:

1. Understand the current COA structure and pain points
2. Define design principles and constraints (regulatory, reporting, operational)
3. Design the natural account structure
4. Design the dimensional model (segments, profit centers, cost centers, LOBs)
5. Define the subledger-to-GL mapping strategy
6. Build the target COA
7. Map legacy accounts to target
8. Validate through data conversion testing
9. Produce design documentation and sign-off materials

The coach knows where you are in this journey and guides you to the next step.

### Opinions
The GL Design Coach has strong views grounded in real-world experience, not textbook theory:
- It will **not** recommend dimensional re-encoding unless there is a clear business case -- "cleaner design" alone is not sufficient justification given the conversion cost
- It will **not** benchmark account counts as a goal -- 2,500 well-organized accounts that support reporting needs are better than 500 that require workarounds
- It will flag when a design doesn't support required regulatory reporting
- It will identify when intercompany design is missing or insufficient
- It will warn about data migration and reconciliation complexity for every proposed change
- It will categorize every recommendation as: **MUST DO** (platform/regulation forces it), **WORTH IT** (benefit exceeds conversion cost and risk), **PARK IT** (not worth the effort now), or **DON'T TOUCH** (working fine, change creates risk with no upside)
- It will push back on simplification for simplification's sake -- every change must justify its conversion and reconciliation cost

## Data Skills

This is a critical differentiator. The GL Design Coach doesn't just help design on paper -- it works with real client data.

### Architecture: LLM is the Brain, Not the Muscle

Insurance GL data can be millions of records per month. The LLM never processes raw data directly. Instead:

```
Consultant (conversational interface)
    |
GL Design Coach (LLM -- reasons, interprets, recommends)
    |
Data Analytics Engine (Python/SQL -- crunches millions of records)
    |
Raw GL Data
```

The Data Analytics Engine ingests raw data, computes structured **account profiles**, and stores the results. The LLM reasons over the profiles, not the raw data. A 3,000-account COA with millions of postings becomes 3,000 profile rows the LLM can work with.

The consultant never leaves the conversation. They don't open a separate tool, run queries, or export results. The agent orchestrates the data engine invisibly.

### Data Ingestion Priority

The agent prioritizes actual posting data over static configuration:

| Priority | Data Source | Purpose |
|----------|-----------|---------|
| 1 | **Posting data (journal entries)** | Ground truth -- derive the real COA from actual usage, not stale config |
| 2 | **Account master (as reference)** | Descriptions, configured attributes -- agent flags discrepancies vs. actual behavior |
| 3 | **Trial balance** | Balance validation and reconciliation |
| Future | **Direct ERP extraction** | Pull all of the above directly from SAP |

**Key principle:** The account master tells you what someone configured. The posting data tells you what actually happened. The agent starts with the data and challenges the master.

### What the Data Engine Pre-Computes (Account Profiles)

| Profile Dimension | What's Computed |
|-------------------|----------------|
| Activity | First posting date, last posting date, posting count by period |
| Balance behavior | Average balance, balance direction, carries balance vs. resets |
| Volume | Monthly posting volume, materiality (dollar amount) |
| Counterparties | Most common offsetting accounts |
| Dimensions used | Which profit centers, cost centers, segments are populated |
| Patterns | Seasonal posting patterns, one-time vs. recurring |
| Relationships | Accounts that consistently post together in the same journal entries |
| Classification check | Configured type (from master) vs. observed behavior (from postings) |

### Progressive Disclosure

The agent presents findings in layers, not data dumps:

- **Level 1 -- Executive summary:** "2,800 accounts, 1,600 active, 340 low-activity, 12 anomalies"
- **Level 2 -- Category drill-down:** "Here are the 340 low-activity accounts grouped by type..."
- **Level 3 -- Account detail:** "Account 510340: last posting March 2024, 2 postings total, both reclassifications. Recommendation: merge into 510300."

The consultant goes as deep as they want. The data is always there, pre-computed and ready.

### Persistent Analysis Store

**Design consideration:** Analysis results are not just conversational output that scrolls away. All analysis is **persisted and stored** as structured data in the engagement context. Consultants can:

- Access detailed analysis results at any time outside the conversation flow
- Browse account profiles, findings, and recommendations independently
- Share analysis with other team members or client stakeholders
- Return to analysis from a prior session without re-running it
- Render the analysis in different formats (browsable report, deck, detailed export)

This follows the structured-first documentation principle: the analysis is living data in the engagement context, not a chat message that gets buried.

### Data Validation Pipeline

- **Ingest:** Accept GL extracts (posting data, account masters, trial balances)
- **Profile:** Derive the real COA from actual posting behavior
- **Map:** Auto-suggest mappings from legacy to target with confidence scores (high / medium / low)
- **Transform:** Restate balances under the target COA
- **Validate:** Reconciliation (OLD = NEW), completeness, design validation, anomaly detection
- **Iterate:** Consultant adjusts, agent re-runs, full audit trail maintained

This allows consultants to demonstrate to clients: "We didn't just design this on paper -- we've already run your actuals through the target structure and every dollar reconciles."

## MJE Analysis (Manual Journal Entry Optimization)

This is a critical value accelerator. Insurance companies spend significant effort on manual journal entries during the financial close. MJEs are often a **symptom of a broken COA** -- if someone books the same reclassification every quarter, that's not a people problem, that's a COA problem.

By analyzing MJEs alongside the COA design, the agent can **design the problem away** rather than just document it for later. This connects two workstreams that are usually separate: COA design and close process optimization.

### Why MJE Analysis Belongs in the GL Design Coach

- MJEs caused by COA gaps should be eliminated through COA redesign, not automated as-is
- MJE data quantifies the business case for COA transformation (hours saved, risk reduced)
- MJE analysis during design prevents discovering close process issues months later during UAT
- The posting data is already ingested -- MJE analysis is an extension of the same data pipeline

### MJE Pattern Detection

The Data Analytics Engine identifies MJEs from posting data (by document type, posting keys, user IDs) and profiles them:

| Pattern | What the Agent Detects | Optimization Potential |
|---------|----------------------|----------------------|
| **Recurring identical** | Same accounts, same amounts, same period frequency (e.g., Jackie books the same entry every quarter) | Automate via recurring entry program or eliminate through COA redesign |
| **Recurring template** | Same accounts, different amounts each period (accruals, allocations) | Automate via allocation rules or accrual engine in target ERP |
| **Reclassification** | Moves balances from account A to account B every period | Fix the source: redesign COA so original posting lands correctly |
| **Intercompany** | Manual IC entries that should be automated | Design IC posting rules in target COA |
| **Accrual/reversal pairs** | Manual accrual posted, then reversed next period | Automate via accrual engine in SAP |
| **Correction entries** | Fixing posting errors after the fact | Investigate root cause: wrong account defaults, user error, system gap |
| **Consolidation adjustments** | Entries to make the GL work for reporting purposes | Redesign COA to support reporting natively |

### User Pattern Analysis

The agent profiles MJEs by preparer:

- **Volume:** Who books the most MJEs (concentration risk)
- **Key person risk:** Which MJEs are only booked by one person
- **Timing:** Which MJEs are booked last minute in the close (bottleneck indicators)
- **Patterns:** Individuals who consistently book the same entries -- these are the strongest candidates for automation or elimination

### Materiality and Risk Assessment

- MJEs sorted by dollar amount -- focus optimization on the ones that matter
- MJEs that auditors would flag (large, unusual, late, round numbers)
- MJEs with no clear supporting documentation pattern (risk indicator)

### Connecting MJE Findings to COA Design

This is the key integration. The agent doesn't just produce an MJE report -- it links every finding to a specific COA design recommendation:

**Example agent output:**

> "I found 142 recurring MJEs across 8 company codes. 63 are reclassifications between P&L accounts. I've traced the root cause for 48 of them to dimensional encoding in the current COA -- the source system posts to a generic account and a manual reclass moves it to the correct LOB account every quarter.
>
> In the target COA design, I'm proposing account derivation rules that route these postings correctly at the source. This would eliminate 48 MJEs per quarter.
>
> Want me to walk through the specific accounts and proposed derivation rules?"

### MJE Deliverable

The analysis produces a structured deliverable (stored in persistent analysis store):

- **MJE inventory:** Every recurring MJE profiled by pattern, preparer, frequency, materiality
- **Root cause analysis:** Why each MJE exists, traced to COA or process gaps
- **Optimization recommendations:** Linked to specific target COA design decisions
- **Business case:** "This COA design eliminates X MJEs, reduces close effort by Y entries per period, reduces audit risk on Z entries"
- **Residual MJEs:** The ones that will remain in the new world and why (legitimate business reasons, not COA gaps)

### MVP Scope

| Capability | MVP | Later |
|-----------|-----|-------|
| Identify MJEs from posting data (by document type) | Yes | |
| Detect recurring patterns (same accounts, same frequency) | Yes | |
| Detect reclassification patterns | Yes | |
| Link MJE root causes to COA design gaps | Yes | |
| User/preparer analysis | Yes | |
| Quantify optimization potential (MJE count reduction) | Yes | |
| Estimate hours saved per close | | Yes |
| Audit risk scoring | | Yes |
| Propose specific SAP automation rules (recurring entries, accrual engine, substitutions) | | Yes |

## Integration with Layer 1

The GL Design Coach can invoke Layer 1 general tools:
- Call the **Deck Builder** to produce a COA design presentation
- Call the **Requirements Engine** to capture requirements surfaced during COA design
- Call the **Process Documenter** to document GL-related process changes

## Open Questions

- [ ] What is the scope of the MVP GL Design Coach vs. full version?
- [ ] How deep should the SAP-specific knowledge be at launch?
- [ ] What data formats should the data transformer accept initially?
- [ ] How does the coach interact with other future specialist agents (e.g., Close Process Architect needs COA decisions)?
- [ ] What is the training data / knowledge base strategy for encoding domain expertise?
