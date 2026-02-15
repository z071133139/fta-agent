# Next Steps

> Last updated: 2026-02-15 (after Session 002)

## How to Use This Document

This is the primary pickup point between sessions. Before starting any new session, read this document first to understand where things stand and what's next. Update it at the end of every session.

## Current Phase: Ideation / Design

The product vision, architecture, and GL Design Coach have been significantly detailed. No code has been written. The GL Design Coach spec is now comprehensive but needs MVP scoping (what's in V1 vs. later). Other areas remain at high-level ideation.

---

## Priority 1: Define GL Design Coach MVP Tiers

**Why first:** The GL Design Coach spec (docs/agents/gl-design-coach.md) is now very comprehensive -- full code block design, MJE analysis, data validation, insurance language translation, sub-segment differentiation. We need to draw the line on what's in V1 vs. V2 vs. later.

**What needs to happen:**
- Tier the capabilities: what's MVP (personal use), what's V2 (super testers), what's future
- Define the minimum data inputs needed for MVP (just trial balance + account master? or posting data from day one?)
- Decide MVP sub-segment focus (start with P&C only? or all three from day one?)
- Define how the domain knowledge is encoded (prompt engineering? RAG over curated docs? fine-tuning? knowledge base?)
- Define the MVP data analytics engine (lightweight Python scripts? or full pipeline?)

**Relevant docs:**
- docs/agents/gl-design-coach.md (comprehensive spec, needs tiering)

---

## Priority 2: Design the Engagement Context ("Engagement Brain")

**Why second:** This is the backbone that everything connects to. Needs to be designed before we build anything that reads/writes to it. The GL Design Coach's persistent analysis store depends on this.

**What needs to happen:**
- Define the data model (what's stored, how it's structured)
- Choose persistence approach (vector DB + structured store? graph DB? hybrid?)
- Design the semantic linking strategy (how are artifacts cross-referenced?)
- Design the concurrency model (multiple consultants writing simultaneously)
- Define the context query interface (how do agents ask questions of the context?)
- Address context growth: how does it scale over a multi-month engagement?

**Note:** A partial design was started in Session 001 but was deliberately deferred for a dedicated deep-dive. The product owner specifically wants a "super smart design" for this component.

**Relevant docs:**
- docs/features/engagement-context.md (partial structure, open questions)

---

## Priority 3: Choose the Tech Stack

**Why third:** Can't build without making technology choices. Some decisions are now more informed by the GL Design Coach requirements (e.g., need Python for data analytics engine, need structured storage for persistent analysis).

**What needs to happen:**
- LLM provider(s): Anthropic (Claude), OpenAI, open-source, or mix?
- Agent framework: LangChain, LangGraph, Autogen, custom, or something else?
- Backend language/framework (Python likely given data analytics engine needs)
- Frontend approach (conversational-only MVP? web app? both?)
- Database / persistence layer (ties into engagement context design)
- Data analytics engine stack (Pandas? DuckDB? something else for GL data processing?)
- Deployment target for personal phase (local? cloud? which cloud?)

---

## Priority 4: Scope the Layer 1 General Tools

**What needs to happen:**
- Requirements Engine: define input formats, output schema, deduplication logic
- Process Documenter: define NLP approach, output format, structured data model
- Deck Builder: define PowerPoint generation approach, template system, context integration
- PMO / Planning Tool: dedicated scoping session (DEC-013)

**Relevant docs:**
- docs/agents/consulting-agent.md (current spec with open questions)

---

## Priority 5: Define the Multi-Consultant Flow

**What needs to happen:**
- Define how consultants onboard to an engagement in the agent
- Define the backlog data model and interaction patterns
- Define the lead consultant's management capabilities
- Design the real-time update mechanism
- Define the "summarize" capabilities (daily, weekly, cross-workstream)

**Relevant docs:**
- docs/features/shared-backlog.md
- docs/engagement-flow/day-in-the-life.md

---

## Deferred (Not Forgotten)

These items are explicitly deferred but documented:

| Item | Deferred Until | Reference |
|------|---------------|-----------|
| Permissions and scope controls | Post-MVP | DEC-010 |
| Configuration Agent (Layer 3) | After MVP | DEC-011, docs/features/configuration-agent.md |
| Oracle / Workday adapters | After SAP MVP stable | docs/features/erp-platform-strategy.md |
| Other domain specialist agents | After GL Design Coach | Will use docs/agents/_template.md |
| PMO tool detailed scoping | Dedicated session | DEC-013 |
| Cost model refinement | After real usage data | docs/operations/cost-model.md |

---

## Session Log

| Session | Date | Focus | Key Outcomes |
|---------|------|-------|-------------|
| [001](sessions/2026-02-14-session-001-ideation-kickoff.md) | 2026-02-14 | Ideation kickoff | Vision, architecture, 13 decisions, full documentation structure |
| [002](sessions/2026-02-15-session-002-gl-design-coach-deep-dive.md) | 2026-02-15 | GL Design Coach deep dive | Full code block design, MJE analysis, data validation pipeline, insurance language translation, sub-segment differentiation, 7 commits to gl-design-coach.md |
