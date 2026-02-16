# Next Steps

> Last updated: 2026-02-15 (after Session 003)

## How to Use This Document

This is the primary pickup point between sessions. Before starting any new session, read this document first to understand where things stand and what's next. Update it at the end of every session.

## Current Phase: Ideation / Design → Build Transition

The product vision, architecture, GL Design Coach, and tech stack are all defined. No code has been written. Next step is to set up the project skeleton so remaining design work happens against a running codebase, not just documents.

---

## Priority 1: Set Up Project Skeleton

**Why first:** Tech stack is decided. The project structure, FastAPI app, LangGraph skeleton, and LiteLLM wiring are the same regardless of MVP scope. Getting a running agent skeleton demystifies LangGraph and makes remaining design sessions concrete. Three sessions of pure design with zero running code risks over-designing.

**What needs to happen:**
- Python project structure (pyproject.toml / uv, src layout, config)
- FastAPI app skeleton with basic API structure
- LangGraph agent skeleton (hello-world Consulting Agent → GL Design Coach graph)
- LiteLLM configuration (Claude + GPT-4o routing)
- DuckDB + Polars wiring (basic data ingestion proof of concept)
- CLI interface for development-phase interaction
- Basic dev tooling (linting, formatting, type checking)

**What NOT to do yet:**
- Supabase schema -- depends on engagement context design (Priority 3)
- Full agent capabilities -- depends on MVP tiering (Priority 2)

**Relevant docs:**
- docs/tech/tech-stack.md (full stack decisions)

---

## Priority 2: Define GL Design Coach MVP Tiers

**Why second:** The GL Design Coach spec (docs/agents/gl-design-coach.md) is comprehensive -- full code block design, MJE analysis, data validation, insurance language translation, sub-segment differentiation. We need to draw the line on what's in V1 vs. V2 vs. later. With a running skeleton, we can start implementing as we tier.

**What needs to happen:**
- Tier the capabilities: what's MVP (personal use), what's V2 (super testers), what's future
- Define the minimum data inputs needed for MVP (just trial balance + account master? or posting data from day one?)
- Decide MVP sub-segment focus (start with P&C only? or all three from day one?)
- Define how the domain knowledge is encoded (prompt engineering? RAG over curated docs? fine-tuning? knowledge base?)
- Define the MVP data analytics pipeline scope (DuckDB + Polars -- what queries/analyses are in V1?)

**Relevant docs:**
- docs/agents/gl-design-coach.md (comprehensive spec, needs tiering)

---

## Priority 3: Design the Engagement Context ("Engagement Brain")

**Why third:** This is the backbone that everything connects to. The GL Design Coach's persistent analysis store depends on this. Once designed, we set up the Supabase schema.

**What needs to happen:**
- Define the data model (what's stored, how it's structured)
- Design the Supabase schema (Postgres tables + pgvector embeddings)
- Design the semantic linking strategy (how are artifacts cross-referenced?)
- Design the concurrency model (multiple consultants writing simultaneously)
- Define the context query interface (how do agents ask questions of the context?)
- Address context growth: how does it scale over a multi-month engagement?

**Note:** A partial design was started in Session 001 but was deliberately deferred for a dedicated deep-dive. The product owner specifically wants a "super smart design" for this component.

**Relevant docs:**
- docs/features/engagement-context.md (partial structure, open questions)
- docs/tech/tech-stack.md (Supabase decided as persistence layer)

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
- Design the real-time update mechanism (Supabase real-time subscriptions)
- Define the "summarize" capabilities (daily, weekly, cross-workstream)

**Relevant docs:**
- docs/features/shared-backlog.md
- docs/engagement-flow/day-in-the-life.md

---

## Completed

| Item | Session | Reference |
|------|---------|-----------|
| Tech stack selection | 003 | docs/tech/tech-stack.md, DEC-018 through DEC-023 |

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
| Enterprise LLM endpoints (Bedrock/Azure) | Pre-production | DEC-025 |
| Data isolation per engagement | Pre-production | DEC-024 |
| Cost model refinement | After real usage data | docs/operations/cost-model.md |

---

## Session Log

| Session | Date | Focus | Key Outcomes |
|---------|------|-------|-------------|
| [001](sessions/2026-02-14-session-001-ideation-kickoff.md) | 2026-02-14 | Ideation kickoff | Vision, architecture, 13 decisions, full documentation structure |
| [002](sessions/2026-02-15-session-002-gl-design-coach-deep-dive.md) | 2026-02-15 | GL Design Coach deep dive | Full code block design, MJE analysis, data validation pipeline, insurance language translation, sub-segment differentiation, 7 commits to gl-design-coach.md |
| [003](sessions/2026-02-15-session-003-tech-stack.md) | 2026-02-15 | Tech stack decisions | LangGraph, LiteLLM, DuckDB+Polars, FastAPI, Supabase, Next.js. 6 tech decisions (DEC-018 through DEC-023) |
