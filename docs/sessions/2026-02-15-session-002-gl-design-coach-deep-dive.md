# Session 002: GL Design Coach Deep Dive

**Date:** 2026-02-15
**Duration:** Single session
**Phase:** Ideation / Design
**Participants:** Product Owner + AI PM (Claude, same persona as Session 001)

---

## Session Context

Continuation from Session 001 (ideation kickoff). The product owner returned to go deeper into the GL Design Coach -- the MVP domain specialist agent. This session focused on scoping the coach's capabilities, data skills, and domain knowledge in detail.

## Key Discussions and Decisions

### 1. COA Design Methodology (Early Discussion)

Walked through the typical consulting workflow for COA design:
- Receive COA in various formats, supported by trial balance and mapping docs
- Analysis phase: cleanup (dead accounts, duplicates, divested entities)
- Number of COAs to support different accounting functions
- COA transformation: working with business to simplify
- Finalize company codes, GL accounts, profit centers, cost centers

Product owner's idea: have the AI model analyze the existing COA and propose simplification. Confirmed this is strong use case -- pattern recognition at scale.

### 2. Phase 3 Reframing (Critical Course Correction)

Product owner pushed back hard on three common consulting recommendations:
- **Dimensional re-encoding** -- high effort, questionable business value. "What are we really gaining by moving a coding dimension to a separate field?"
- **Account count benchmarking** -- vanity metric. "Does it really matter if I have 500 or 2500 accounts?"
- **Consolidation for simplification** -- "leads to data conversion nightmares as we always have to reconcile OLD to NEW"

**This reframed the agent's approach:** Every recommendation must be categorized as MUST DO (platform/regulation forces it), WORTH IT (benefit exceeds conversion cost), PARK IT (not worth it now), or DON'T TOUCH (working fine, change creates risk). No change for change's sake.

### 3. COA Business Context with Goals

Added a section explaining what the COA is and why it matters, with specific goals for 8 dimensions: regulatory reporting, management reporting, close cycle, audit, M&A readiness, system migration, data conversion, operational efficiency.

### 4. Data Validation as Value Accelerator

The killer feature: match finance data from the existing GL to the new COA proposal to validate the design. Eliminates the gap between "design on paper" and "prove it works with real data."

Pipeline: Ingest → Profile → Map (with confidence scores) → Transform → Validate (reconcile OLD = NEW) → Iterate

### 5. Posting Data Over Account Master (Important Insight)

Product owner challenged the use of account master as primary input: "If the client gives us access to all financial data, wouldn't it be better to extract the account master from the actual postings?"

Agreed -- account master tells you what someone configured. Posting data tells you what actually happened. Flipped the ingestion priority: posting data first, account master as reference only.

### 6. Data Scale Architecture (LLM is the Brain, Not the Muscle)

Product owner raised concern: insurance companies can have millions of records monthly. The agent can't become a clunky data crunching tool.

Solution: Separate compute layer (Python/SQL) from reasoning layer (LLM). The data engine profiles millions of records into structured account profiles (~3,000 rows). The LLM reasons over profiles. The consultant never leaves the conversation.

**Design consideration added:** All analysis must be persisted and stored, accessible outside the conversation flow. Not just chat output that scrolls away.

### 7. MJE Analysis (Manual Journal Entry Optimization)

Critical value accelerator. Insurance companies spend enormous effort on MJEs during close. MJEs are often symptoms of a broken COA.

Agent detects: recurring identical entries, recurring templates, reclassifications, IC entries, accrual/reversal pairs, corrections, consolidation adjustments. Profiles by preparer (key person risk, timing). Links MJE root causes directly to COA design recommendations.

The business case for COA transformation gets quantified: "This design eliminates X MJEs per quarter."

### 8. Target Platform Grounding

The target COA must be grounded in the target ERP. Three modes: SAP S/4HANA (MVP), other ERP (future), platform-agnostic (client hasn't decided). SAP-specific validation rules when in SAP mode.

### 9. Full Code Block Design (Scope Expansion)

Major scope insight: COA is only one field on ACDOCA. The GL Design Coach needs to design the full insurance code block (~50-100 relevant fields out of 360-500+ on ACDOCA). Identified all insurance-relevant dimensions, excluded non-insurance fields (material ledger, plant, production).

### 10. Insurance-Specific Custom Fields

SAP doesn't natively support several insurance-critical dimensions in the US: State, Statutory Product/NAIC LOB, Statutory Entity, Treaty, Accident Year, Coverage Type, Risk Category. These are added via code block extensibility (CI_COBL/OXK3). Agent proposes minimum set needed.

### 11. Code Block Dimension Guide

Added comprehensive guide explaining what each dimension is, what it's used for in insurance, the key design question, and the common debate. Defined 6-point AI-native approach for facilitating design workshops: contextual explanation, trade-off analysis, cross-dimension impact, decision capture, challenge/pushback, progressive depth.

### 12. Insurance Language Translation (Core Capability)

SAP was built for manufacturing. The agent must translate all SAP terminology to insurance language. 20+ term translations defined (COGS → Losses & LAE, Revenue → Net Premiums Earned, Material → Policy, etc.). Insurance-specific functional area classifications defined (Claims Management, Acquisition, Administrative, Investment Management, Loss & LAE, Policyholder Dividends). Applies pervasively across all interactions and deliverables.

### 13. Sub-Segment Differentiation

Agent must differentiate between Life/Annuity, Property & Casualty, and Reinsurance. Each has fundamentally different COA structures, reserve accounting, regulatory requirements, and code block dimensions. Asks at engagement start. Handles multi-line carriers.

## Artifacts Modified

- `docs/agents/gl-design-coach.md` -- 7 commits, significantly expanded:
  - COA Business Context with goals per dimension
  - Pragmatic opinions (MUST DO / WORTH IT / PARK IT / DON'T TOUCH)
  - Data skills architecture (brain vs muscle, ingestion priority, account profiling, progressive disclosure, persistent analysis store, validation pipeline)
  - Target platform grounding (3 modes)
  - MJE analysis capability
  - Full insurance code block design (ACDOCA scope)
  - Insurance-specific custom field extensions
  - Code block dimension guide with AI-native discussion support
  - Insurance language translation (core capability)
  - Sub-segment differentiation (Life, P&C, Reinsurance)

## What Was NOT Discussed Yet

- MVP narrowing: what's in V1 of the GL Design Coach vs. later (the spec is now comprehensive but needs priority tiers)
- Tech stack
- Engagement context detailed design
- Layer 1 general tools scoping
- Multi-consultant flow
- UI/UX approach
- Other domain specialist agents
- How the domain knowledge is actually encoded (training data, RAG, fine-tuning, knowledge base)
- Testing strategy for the agent's recommendations

## Product Owner Notes

- Very hands-on with domain expertise -- provided real-world corrections to textbook consulting approaches
- Pushed back on theoretical simplification recommendations (dimensional re-encoding, account count benchmarking, consolidation) -- grounded the agent in practical reality
- Excited about MJE analysis as value accelerator
- Emphasized that the agent must speak insurance, not SAP
- Pragmatic about scope: "we will discuss the scope of the agents one by one"
- Pattern: product owner provides domain insight → AI PM structures and expands → product owner validates and corrects → iterate
