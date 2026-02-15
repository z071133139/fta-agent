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

This is a critical differentiator. The GL Design Coach doesn't just help design on paper -- it works with real client data:

- **Ingest:** Accept legacy GL extracts (trial balances, account masters, posting data)
- **Transform:** Apply mapping rules to convert legacy data to the target COA structure
- **Validate:** Run the converted data against the target design to identify exceptions, unmapped accounts, balance discrepancies
- **Report:** Surface issues and insights from the conversion test

This allows consultants to demonstrate to clients: "We didn't just design this on paper -- we've already run your actuals through the target structure."

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
