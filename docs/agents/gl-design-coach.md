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

### Insurance Language Translation (Core Capability)

SAP was built for manufacturing. Its terminology, menu labels, configuration descriptions, and documentation are written in manufacturing language. Insurance companies don't have cost of goods sold, production orders, bill of materials, or shop floors. This mismatch is a constant source of confusion on every insurance implementation.

**The GL Design Coach speaks insurance, not SAP.** Every interaction, every explanation, every recommendation uses insurance terminology. When SAP concepts need to be referenced, the agent translates.

**Translation examples:**

| SAP Term | Insurance Translation | Context |
|----------|----------------------|---------|
| Cost of Goods Sold / COGS | Losses and LAE / Claims Incurred | P&L classification |
| Revenue | Net Premiums Earned / Net Investment Income | P&L classification |
| Cost of Sales Accounting | Expense classification by function (claims, acquisition, admin) | Functional Area purpose |
| Functional Area: Production | Not applicable / remove | Insurance doesn't produce goods |
| Functional Area: Sales & Distribution | Acquisition Costs / Underwriting Expenses | Commission, agent compensation, marketing |
| Functional Area: Administration | General & Administrative Expenses | Finance, HR, legal, IT overhead |
| Functional Area: Research & Development | Not typically applicable (or Actuarial/Product Development) | Some carriers map actuarial R&D here |
| Material | Policy / Contract / Certificate | When SAP references "material" in any context |
| Customer | Policyholder / Insured / Agent / Broker / Claimant | Depends on the subledger context |
| Vendor | Claimant / Service Provider / Reinsurer / TPA | Depends on the transaction type |
| Production Order | Not applicable | Remove from all discussions |
| Plant | Not applicable (or mapped to Office/Region if needed) | Physical location is rarely a posting dimension |
| Bill of Materials | Not applicable | Remove from all discussions |
| Goods Receipt | Not applicable | Remove from all discussions |
| Cost Object | Claim / Policy / Treaty / LOB | What costs are tracked against |
| Finished Goods Inventory | Not applicable | Insurance has no physical inventory |
| Work in Process | Unearned Premium Reserve / Claims in Process | Conceptual parallel only |

**This applies everywhere, not just in conversation:**
- When the agent explains SAP configuration, it uses insurance terms
- When the agent produces deliverables, SAP jargon is translated
- When the agent references SAP documentation or IMG paths, it adds insurance context
- When the agent designs functional areas, it proposes insurance-specific functions, not SAP defaults

**Insurance-specific functional area classifications:**

| Functional Area | Insurance Meaning | What Gets Classified Here |
|----------------|-------------------|--------------------------|
| Claims Management | Cost of managing and adjusting claims | Claims adjuster salaries, TPA fees, claims system costs, litigation |
| Acquisition / Underwriting | Cost of acquiring and underwriting business | Agent commissions, broker fees, underwriting salaries, marketing |
| Administrative / G&A | General overhead | Finance, HR, legal, IT, executive, facilities |
| Investment Management | Cost of managing the investment portfolio | Investment team, asset management fees, custodian |
| Loss & LAE | The losses themselves (not the cost of managing them) | Claim payments, IBNR reserves, case reserves, LAE |
| Policyholder Dividends | Dividends returned to policyholders | Participating policy dividends |

**Why this matters:** When the agent says "functional area" to an insurance CFO, the CFO hears manufacturing. When the agent says "expense classification -- claims, acquisition, and administrative" -- the CFO immediately understands. The agent bridges the gap.

### Insurance Sub-Segment Differentiation

The agent must know which sub-segment(s) the client operates in. The code block design, COA structure, regulatory requirements, and terminology differ significantly across sub-segments. The agent asks early and adapts everything accordingly.

| Sub-Segment | Key GL / Code Block Differences |
|-------------|-------------------------------|
| **Life & Annuity** | Reserve accounting is dominant (policy reserves, DAC amortization, surrender values, annuity benefits). GAAP reserves follow ASC 944. IFRS 17 measurement models (GMM, VFA, PAA) drive subledger-to-GL design. Separate accounts for participating vs. non-participating. Investment income allocation to product lines. Embedded derivatives on variable annuities. Long duration contract accounting under LDTI. |
| **Property & Casualty** | Loss reserves (case, IBNR, LAE) are the core complexity. Unearned premium reserves. Loss development triangles require accident year / underwriting year tracking. Reinsurance recoverables. Salvage and subrogation. State-level reporting is critical (premiums and losses by state). Statutory reporting follows NAIC Annual Statement format. Short-duration contracts -- simpler IFRS 17 (typically PAA). |
| **Reinsurance** | Treaty vs. facultative distinction affects account structure. Assumed and ceded accounting on both sides. Retrocession adds another layer. Funds withheld / funds held accounting. Sliding scale commissions, profit commissions. Multi-currency is more prevalent (international treaties). Reserving at treaty level. Lag in reporting (claims reported by cedant on delay). |

**Why this matters for code block design:**
- A **Life carrier** needs GL accounts for DAC, VOBA, policy reserves by type, separate investment accounts, annuity benefit reserves -- none of which exist in a P&C carrier's COA
- A **P&C carrier** needs accident year tracking, state-level dimensions, unearned premium reserves, salvage/subrogation accounts -- not relevant for life
- A **Reinsurer** needs assumed/ceded mirroring, treaty-level tracking, retrocession layers, funds withheld accounts -- a fundamentally different account structure
- A **multi-line carrier** (common) needs all of the above, carefully organized so the COA doesn't explode in complexity

**Agent behavior:**
- Asks at engagement start: "Which sub-segments does this carrier operate in?"
- Adapts COA recommendations, code block design, regulatory references, and terminology based on the answer
- For multi-line carriers, identifies which dimensions and accounts are shared vs. sub-segment-specific
- References the correct regulatory framework (NAIC Annual Statement for P&C, LDTI for Life, etc.)

### Knowledge
- Insurance-specific GL structures (life, P&C, reinsurance, health)
- **Sub-segment differentiation: Life/Annuity, P&C, Reinsurance**
- Statutory vs. GAAP/IFRS account hierarchies
- Segment/entity/LOB dimensionality
- Subledger-to-GL mapping patterns
- Intercompany design
- Regulatory reporting requirements and their GL implications
- IFRS 17 / LDTI impact on COA design
- SAP-to-insurance terminology translation across all interactions

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

### Insurance Code Block Design (Full ACDOCA Scope)

The GL Design Coach doesn't just design the COA -- it designs the **full insurance code block**. The GL account is one field. The code block is the complete set of accounting dimensions that get populated on every journal entry line item in ACDOCA.

ACDOCA has 360-500+ fields. For insurance, approximately 50-100 are relevant. The rest (material ledger, plant, production order, batch, etc.) are not applicable.

#### Code Block Dimension Guide

A significant portion of consulting time on finance transformation projects is spent discussing what each code block dimension is for, why it matters, and how to design it. The GL Design Coach must support these discussions in an AI-native way -- not as a static reference document, but as an interactive guide that helps the consultant and client work through design decisions for each dimension.

**For each dimension, the agent knows and can articulate:**

| Dimension | What It Is | What It's Used For in Insurance | Key Design Question | Common Debate |
|-----------|-----------|-------------------------------|-------------------|---------------|
| **Company Code** | The legal entity in SAP. Represents a separate set of books with its own balance sheet and P&L. | Each insurance carrier, holding company, and service entity is typically a separate company code. Drives statutory reporting boundaries and legal entity financials. | How many company codes? Does every legal entity need one, or can some be combined? | "Do we need a company code for the holding company that has no transactions?" |
| **GL Account** | The natural account -- identifies WHAT happened financially (premium earned, claims paid, salaries, rent). | The backbone of every financial report. Every transaction is classified by its GL account. Insurance-specific accounts include premium, claims, reserves (IBNR, case, LAE), ceded reinsurance, policyholder dividends. | How granular? How many accounts? How do we balance reporting detail with simplicity? | "Do we need separate GL accounts for each claim type or can we use a dimension?" |
| **Profit Center** | An organizational unit that represents an area of management responsibility for which profit can be measured. | Insurance carriers use profit centers to track profitability. Typically aligned to LOB (auto, property, life), product groups, regions, or a combination. Enables internal P&L by business segment. | What does the profit center represent? LOB? Product? Region? A combination? | "Should LOB be the profit center or a COPA characteristic? If profit center, can we still report profit by region?" |
| **Cost Center** | Where overhead costs are incurred. Represents a department or function within the organization. | Claims operations, underwriting, actuarial, IT, finance, legal, HR, executive. Used for budgeting, cost control, and functional area derivation. | How granular? One cost center per department or per team? | "Do we need separate cost centers for each claims office or is one per region enough?" |
| **Segment** | A high-level reporting dimension required by IFRS 8 / ASC 280 for external segment reporting. Derived from profit center in SAP. | Insurance carriers report externally by operating segment (e.g., Life, P&C, Health). Segment must be on every line item for balanced segment reporting. | How many segments? Do they align with how the business is managed? | "Our IFRS segments are Life and Non-Life, but management tracks 6 LOBs. Do we need 2 segments or 6?" |
| **Functional Area** | Classifies expenses by function for cost-of-sales (P&L by nature vs. by function). | Insurance carriers report expenses as: acquisition costs, claims management, administrative expenses, investment management. Required for statutory reporting and management P&L. | How are functional areas derived? From cost center? From order type? | "Claims adjusters do both claims management and admin work. How do we split their costs?" |
| **Business Area** | Legacy SAP dimension originally used for internal balance sheet reporting before segments existed. | Many insurance carriers still have it from legacy ECC implementations. In S/4HANA, segment has largely replaced it. | Keep or retire? If keep, what does it represent? | "We've used business area for 15 years. Can we retire it or will something break?" |
| **Trading Partner** | Identifies the intercompany counterparty on journal entry line items. | Insurance groups with multiple entities need intercompany elimination for consolidation. Reinsurance ceded between affiliates, shared service charges, management fees. | Which entities trade with each other? What's the IC transaction inventory? | "Do we need trading partner on every line item or only on IC-specific accounts?" |
| **Internal Order** | A cost collector for specific activities, projects, or initiatives with a defined start and end. | One-time projects (system implementation, office move), marketing campaigns, regulatory initiatives. Enables cost tracking outside the recurring cost center structure. | What types of activities warrant an internal order vs. tracking on cost centers? | "Should we use internal orders or WBS elements for our transformation program?" |
| **Ledger** | Represents a set of books under a specific accounting standard. | Insurance carriers operating internationally need parallel accounting: local statutory, IFRS 17, US GAAP. Each ledger can have different postings for the same transaction. | How many ledgers? Leading vs. non-leading? Which standards require separate ledgers vs. adjusting entries? | "Can we handle IFRS 17 adjustments in a non-leading ledger or do we need FPSL?" |
| **Currency** | SAP supports up to 10 parallel currencies per ledger. | Multi-jurisdiction carriers need: local currency, group currency, hard currency. Carriers in volatile currency markets need parallel valuations. | How many currencies? Which currency types (10, 30, 40)? | "Do we need group currency on every entity or only on those that consolidate?" |

**For each COPA characteristic, the agent knows:**

| Characteristic | What It's Used For in Insurance | Key Design Question | Common Debate |
|---------------|-------------------------------|-------------------|---------------|
| **Line of Business** | Profitability analysis by insurance LOB (auto, homeowners, commercial property, term life, etc.) | Where does LOB live -- profit center, COPA, or both? | "If LOB is the profit center, we can't easily do profit center by region. If it's COPA, we lose document splitting by LOB." |
| **Product** | Granular product-level profitability (beyond LOB) | How granular? Product family or individual product? | "Actuarial needs product-level data but finance only reports by LOB. Who wins?" |
| **Distribution Channel** | Direct, agent, broker, digital -- tracks acquisition cost and revenue by channel | Mandatory or optional? Posted or derived from master data? | "Can we derive channel from the agent/broker master data instead of posting it?" |
| **Geography / Region** | State, country, territory -- performance by geography | Separate dimension or derivable from other data? | "Is this the same as the custom state field we need for statutory reporting?" |

**How the agent supports these discussions (AI-native approach):**

The agent doesn't just define dimensions -- it facilitates design workshops:

1. **Contextual explanation.** When a client asks "what is a profit center?" the agent doesn't give a generic SAP definition. It says: "For your company, which is a mid-size P&C carrier with 4 LOBs operating in 12 states, the profit center would most likely represent your LOBs -- Auto, Homeowners, Commercial Property, and Workers Comp. This lets you see a full P&L for each line. Here's why that matters for your specific reporting requirements..."

2. **Trade-off analysis.** When the team debates "should LOB be profit center or COPA?" the agent lays out both sides with the implications specific to the client: what you gain, what you lose, what breaks, what becomes easier. Not generic pros/cons -- specific impact on THIS carrier's reporting, document splitting, and close process.

3. **Cross-dimension impact.** When a decision is made on one dimension, the agent immediately surfaces the ripple effects: "You've decided profit center = LOB. This means your segment will be derived as Life vs. Non-Life (since segment comes from profit center). It also means if you want profitability by state, state must be a COPA characteristic or a custom field, because profit center is already taken by LOB."

4. **Decision capture.** Every dimension design decision is logged with rationale, alternatives considered, and who decided. When the team revisits a decision 3 weeks later, the agent has the full context: "We discussed this on Feb 10. The team chose X because of Y. Here were the alternatives we considered."

5. **Challenge and push back.** The agent flags when a proposed design creates problems: "You're proposing 200 cost centers for a finance organization of 80 people. That's 2.5 cost centers per person. Most carriers your size operate with 40-60. What's driving the granularity?"

6. **Progressive depth.** In early workshops with executives, the agent provides high-level framing. In detailed design sessions with the finance team, it goes deep into derivation logic, posting rules, and document splitting behavior.

#### Insurance-Relevant Code Block Dimensions

**Core Organizational:**

| Dimension | ACDOCA Field | Insurance Purpose | Design Required |
|-----------|-------------|-------------------|-----------------|
| Company Code | RBUKRS | Legal entity (carrier, holding, service co.) | Entity structure |
| GL Account | RACCT / HKONT | Natural account (premium, claims, reserves, expenses) | COA design |
| Segment | SEGMENT | IFRS 8 segment reporting (Life, P&C, Health) | Segment hierarchy |
| Profit Center | PRCTR | Internal profitability (LOB, product, region) | Profit center hierarchy |
| Cost Center | KOSTL | Overhead cost management (departments) | Cost center hierarchy |
| Functional Area | RFAREA | Cost-of-sales (admin, acquisition, claims mgmt) | Derivation rules |
| Business Area | GSBER | Legacy dimension -- often being phased out | Keep or retire decision |
| Ledger | RLDNR | Multi-GAAP (Statutory, IFRS, US GAAP) | Parallel ledger strategy |

**Partner & Intercompany:**

| Dimension | ACDOCA Field | Insurance Purpose | Design Required |
|-----------|-------------|-------------------|-----------------|
| Trading Partner | RASSC | IC eliminations (reinsurance ceded, shared services) | IC partner mapping |
| Partner Profit Center | PPRCTR | IC settlement | Linked to profit center design |
| Partner Segment | PSEGMENT | IC balanced reporting | Linked to segment design |
| Customer | KUNNR | Policyholders, agents, brokers | Subledger integration |
| Vendor | LIFNR | Claimants, service providers, reinsurers | Subledger integration |

**Profitability (COPA Characteristics):**

| Dimension | Insurance Purpose | Design Required |
|-----------|-------------------|-----------------|
| Line of Business | Life, Auto, Property, Health, Workers Comp | COPA characteristic or profit center |
| Product / Product Group | Specific insurance products (Term Life, Whole Life) | COPA characteristic |
| Distribution Channel | Direct, Agent, Broker, Digital | COPA characteristic |
| Geography / Region | State, country, territory | COPA characteristic |
| Customer Group | Individual, Commercial, Group | COPA characteristic |

**Controlling:**

| Dimension | ACDOCA Field | Insurance Purpose | Design Required |
|-----------|-------------|-------------------|-----------------|
| Internal Order | AUFNR | Projects, initiatives | Order type design |
| WBS Element | PS_PSP_PNR | Large programs (if used) | Project structure |

**Currency & Valuation:**

| Dimension | Insurance Purpose | Design Required |
|-----------|-------------------|-----------------|
| Transaction Currency | Original posting currency | Standard |
| Local Currency | Company code currency | Standard |
| Group Currency | Consolidation / group reporting | Group currency strategy |
| Additional currencies (up to 10) | Multi-jurisdiction carriers | Parallel currency strategy |

#### Insurance-Specific Custom Fields (Code Block Extensions)

SAP does not natively support several dimensions that are critical for US insurance companies. These are added as custom fields via coding block extensibility (CI_COBL / OXK3 or Fiori Custom Fields & Logic app) and flow into ACDOCA.

**Common insurance-specific extensions:**

| Custom Field | Why SAP Doesn't Have It | Insurance Purpose |
|-------------|------------------------|-------------------|
| **State** | SAP has no native "state" dimension on the code block | US insurance is regulated state-by-state. Carriers must track premiums, claims, reserves, and expenses by state for statutory reporting to each state's Department of Insurance |
| **Statutory Product / NAIC Line of Business** | SAP has no native statutory product classification | Annual Statement reporting requires financials by NAIC line of business (fire, allied lines, homeowners, auto liability, etc.) |
| **Statutory Entity** | May differ from legal entity structure | Statutory reporting entity may not align 1:1 with SAP company codes |
| **Treaty / Reinsurance Agreement** | Not a standard SAP dimension | Track ceded/assumed premiums and claims by reinsurance treaty |
| **Accident Year / Underwriting Year** | Not a standard SAP GL dimension | Loss development and reserving analysis requires year-of-origin tracking |
| **Coverage Type** | Not a standard SAP dimension | Detailed analysis by coverage within a product line |
| **Risk Category** | Not a standard SAP dimension | Risk-based reporting and capital allocation |

**Design considerations for custom fields:**
- Each custom field added to the code block increases data entry complexity and storage
- Custom fields must be populated consistently across all posting sources (manual, subledger, interfaces)
- Document splitting behavior must be defined for each custom field
- The agent should challenge whether a custom field is truly needed on ACDOCA or whether it can be handled through master data attributes or reporting hierarchies
- The agent should assess: "Does this need to be on every journal entry line, or can it be derived?"

**The agent's role:** When designing the code block, the GL Design Coach identifies which custom extensions the specific carrier needs based on their regulatory environment (US vs. international), reporting requirements, and business model. It proposes the minimum set of extensions that meets requirements -- not every possible field.

#### Subledger Integration Points

| Source System | What It Posts to ACDOCA | Design Required |
|--------------|------------------------|-----------------|
| FPSL (Financial Products Subledger) | IFRS 17 accounting -- CSM, risk adjustments, insurance revenue | FPSL subledger COA to GL COA mapping |
| FS-CD / FI-CA | Premium billing, collections, commissions | Receivables/payables account determination |
| Policy Admin System | Premium, claims, reserves via interfaces | Interface mapping to GL code block |
| Actuarial Systems | Reserve movements, IBNR, LAE | Reserve account structure |
| Reinsurance System | Ceded premiums, recoveries, commissions | Reinsurance account structure |
| Investment / Asset Mgmt | Investment income, gains/losses | Investment account structure |

#### What's NOT Relevant for Insurance

| ACDOCA Field Category | Why Excluded |
|----------------------|--------------|
| Material Ledger (MATNR, BWTAR, etc.) | No manufacturing / inventory valuation |
| Plant / Storage Location | No physical production |
| Production Order | No manufacturing |
| Quantity fields (most) | Insurance is financial, not unit-based |
| Batch / Serial Number | Not applicable |

### Tools (Specialist-Specific)
- **Code Block Designer** -- design the full insurance code block (all relevant ACDOCA dimensions including custom extensions), not just the COA
- **COA Builder** -- construct the target chart of accounts (GL account dimension of the code block)
- **Mapping Generator** -- create mappings from legacy code block to target code block
- **Gap Analyzer** -- compare current state to target and identify gaps across all code block dimensions
- **Regulatory Cross-Reference Checker** -- validate code block design against regulatory reporting needs (statutory, IFRS, segment)
- **Data Transformer** -- convert data from old GL to target GL to verify the new code block design

### Memory
- Remembers the client's current state, prior design decisions, and constraints
- Tracks which design areas have been addressed and which remain open
- Maintains decision history with rationale

### Process Guidance
The GL Design Coach doesn't just answer questions -- it drives a structured design journey across the full code block, not just the COA:

1. Identify the target ERP platform (SAP / Oracle / Workday / agnostic)
2. Understand the current code block structure and pain points
3. Ingest and profile the existing GL data (posting data first, master data as reference)
4. Analyze MJE patterns and identify optimization potential
5. Define design principles and constraints (regulatory, reporting, operational)
6. Design the natural account structure (GL accounts)
7. Design the organizational dimensions (profit center hierarchy, cost center hierarchy, segment model)
8. Design the profitability dimensions (COPA characteristics)
9. Identify required insurance-specific custom field extensions (state, statutory product, etc.)
10. Design the intercompany model (trading partners, partner dimensions)
11. Define the parallel ledger and currency strategy
12. Define the subledger-to-GL integration design (FPSL, policy admin, actuarial, reinsurance)
13. Build the full target code block
14. Map legacy code block to target
15. Validate through data conversion testing (restate actuals, reconcile OLD = NEW)
16. Quantify MJE optimization (business case for the transformation)
17. Produce design documentation and sign-off materials

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

## MVP Tiering (Decided 2026-02-15, Session 004)

### V1 -- Personal Use (MVP)

**Sub-segment focus:** P&C only (DEC-026)

**Conversational guidance (P&C focus):**
- Full code block dimension guide with P&C-specific context
- Insurance language translation (SAP→insurance) across all interactions
- Opinions framework (MUST DO / WORTH IT / PARK IT / DON'T TOUCH)
- 17-step process guidance -- agent knows where you are and guides next step
- Challenge and push-back on design decisions
- P&C sub-segment: loss reserves, UPR, accident year, state-level, NAIC Annual Statement

**Data skills (real data from day one) (DEC-027):**
- Ingest posting data + account master + trial balance
- Account profiling (activity, balance behavior, volume, counterparties, dimension usage)
- Progressive disclosure (executive summary → category drill-down → account detail)
- MJE detection: identify MJEs from posting data, recurring patterns, reclassifications
- Link MJE root causes to COA design recommendations
- MJE preparer analysis (volume, key person risk)
- MJE count reduction quantification

**Knowledge encoding: hybrid approach (DEC-028):**
- Core P&C expertise in structured system prompts (dimensions, opinions, process steps)
- RAG over curated reference material (NAIC Annual Statement structure, SAP S/4HANA config reference, insurance GL examples)

**NOT in V1:**
- Life/Annuity, Reinsurance sub-segments
- Legacy→target mapping generator
- OLD=NEW reconciliation / data conversion testing
- Specialist tools as separate callable tools (Code Block Designer, COA Builder, etc.)
- Persistent analysis store (uses conversation context only)
- Layer 1 integration (Deck Builder, Requirements Engine)
- Audit risk scoring, hours-saved estimation
- SAP automation rule proposals

### V2 -- Super Testers

- Add Life/Annuity sub-segment
- Legacy→target mapping with confidence scores
- OLD=NEW reconciliation (restate actuals, prove it balances)
- Persistent analysis store (Supabase -- browse results outside conversation)
- Hours-saved estimation for MJE optimization business case
- Specialist tools as callable: Code Block Designer, COA Builder, Gap Analyzer

### Future

- Reinsurance sub-segment
- Regulatory Cross-Reference Checker
- SAP automation rule proposals (recurring entries, accrual engine, substitutions)
- Audit risk scoring
- Layer 1 tool integration
- Platform-agnostic / Oracle / Workday modes
- Direct ERP extraction

## Open Questions

- [x] What is the scope of the MVP GL Design Coach vs. full version? → See MVP Tiering above (DEC-026, DEC-027, DEC-028)
- [x] How deep should the SAP-specific knowledge be at launch? → SAP S/4HANA mode for P&C, via hybrid knowledge encoding (prompts + RAG)
- [x] What data formats should the data transformer accept initially? → Posting data + account master + trial balance (V1); legacy→target mapping in V2
- [ ] How does the coach interact with other future specialist agents (e.g., Close Process Architect needs COA decisions)?
- [x] What is the training data / knowledge base strategy for encoding domain expertise? → Hybrid: core in system prompts, reference material via RAG (DEC-028)
