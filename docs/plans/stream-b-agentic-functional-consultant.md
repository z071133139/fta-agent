# Stream B — Agentic Functional Consultant

> Created: 2026-02-24 (Session 020)
> Status: DESIGNED — build when Stream B backend (SSE + LLM) is ready

## Problem

Workshop Mode captures data well but the agent doesn't do real work. Fit/gap badges and suggestion chips are smart UI, not an agent. The Functional Consultant needs to do the structured synthesis work between sessions that consultants hate.

## Core Pattern: Capture → Synthesize → Draft

### Workshop (human leads, agent listens)
- Consultant captures requirements, flags gaps, annotates flows
- Agent role: minimal — flag duplicates, missing coverage, real-time cross-references

### Between Workshops — Solo Mode (agent leads, human reviews)
This is where the agent earns its keep. Six capabilities:

### 1. Gap → Requirement Pipeline
When a gap is flagged on a process flow, agent drafts a full structured BR:
- Description, acceptance criteria, priority suggestion
- SAP/ERP capability reference
- Complexity estimate and dependencies
- Traceability back to the process step and PA

Not a one-liner — a real requirement ready for consultant review.

### 2. Coverage Analysis
Agent scans all captured data across all PAs and produces a heat map:
- Which PAs have thin requirement coverage
- Which PAs have gaps flagged but no requirements written
- Which process areas haven't been discussed at all
- "PA-02 has 15 requirements but nothing about month-end reconciliation."
- "PA-09 has 4 gaps flagged but zero requirements written."

### 3. To-Be Flow Generation
Given current state flow + captured gaps + requirements, agent drafts a to-be process flow:
- Most time-consuming deliverable consultants produce manually
- Agent generates draft nodes and edges based on gap remediation patterns
- Consultant reviews, adjusts, approves
- Biggest single time-saver in the product

### 4. Cross-PA Impact Detection
Capture a requirement in one PA, agent identifies all impacted PAs:
- "This premium recognition change impacts Close (journal entries), Reporting (new disclosures), Data (new interface from policy admin)"
- Auto-creates linked items / cross-references
- Surfaces during workshop as cyan chips (already partially built)

### 5. Session Prep
Before the next workshop, agent generates:
- Agenda based on coverage gaps
- List of unconfirmed items from previous session
- Suggested follow-up questions per PA
- Coverage summary for the client team

### 6. Deliverable Drafting
Agent produces first drafts of key deliverables:
- Gap Analysis report (from fit/gap data + captured gaps)
- Requirements Traceability Matrix (requirements → process steps → gaps → design decisions)
- Process Design Document (current + to-be flows + gap narrative)
- Consultant reviews and refines — agent output is always a proposal, never auto-committed

## Interaction Model

### Solo Mode (third mode alongside Workshop and Normal)
- Agent-driven review of workshop captures
- "Review my workshop captures" → agent walks through gaps, drafts requirements, suggests to-be flows
- Split view: agent output left, source evidence right
- Accept / Edit / Reject on every agent-generated item

### Agent Draft Cards
- Agent-generated content sits in a review queue
- Each card: what the agent produced, why, source evidence, confidence level
- Accept → committed to deliverable. Edit → opens inline editor. Reject → discarded with reason.
- Nothing auto-committed — consultant steers everything

### Coverage Lens
- Visual heat map overlay on WorkplanSpine
- Red/amber/green by PA: coverage depth, gap-to-requirement ratio, unconfirmed items
- Click through to specific gaps

## Dependencies

- Stream B backend: SSE streaming, LLM calls via LiteLLM
- Workshop persistence (W7 ✅) — agent reads from localStorage/Supabase captures
- Existing mock data provides the domain knowledge scaffolding
- Agent needs access to: requirements, process flows, fit/gap data, workshop captures

## Build Sequence (within Stream B)

1. **B1–B2**: SSE endpoint + basic LLM wiring (already planned)
2. **B-FC1**: Gap → Requirement pipeline (highest value, clearest input/output)
3. **B-FC2**: Coverage analysis (heuristic-first, LLM-enriched)
4. **B-FC3**: Cross-PA impact detection (pattern matching + LLM)
5. **B-FC4**: Session prep generation
6. **B-FC5**: To-be flow generation (hardest — needs graph generation)
7. **B-FC6**: Deliverable drafting (builds on all above)

## Design Principle

The agent isn't replacing the consultant's judgment — it's doing the 60% of work that's structured synthesis (connecting dots, drafting from patterns, identifying coverage gaps) so the consultant can focus on the 40% that requires domain expertise and client relationship.
