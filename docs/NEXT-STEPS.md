# Next Steps

> Last updated: 2026-02-15 (after Session 004)

## How to Use This Document

This is the primary pickup point between sessions. Before starting any new session, read this document first to understand where things stand and what's next. Update it at the end of every session.

## Current Phase: Build

Project skeleton is running (FastAPI, LangGraph, LiteLLM, DuckDB/Polars, CLI). GL Design Coach MVP tiered. Next step is designing the Engagement Context (Supabase schema), then building the GL Design Coach V1.

---

## Priority 1: Design the Engagement Context ("Engagement Brain")

**Why first:** This is the backbone that everything connects to. The GL Design Coach's persistent analysis store depends on this. Once designed, we set up the Supabase schema.

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

## Priority 2: Scope the Layer 1 General Tools

**What needs to happen:**
- Requirements Engine: define input formats, output schema, deduplication logic
- Process Documenter: define NLP approach, output format, structured data model
- Deck Builder: define PowerPoint generation approach, template system, context integration
- PMO / Planning Tool: dedicated scoping session (DEC-013)

**Relevant docs:**
- docs/agents/consulting-agent.md (current spec with open questions)

---

## Priority 3: Define the Multi-Consultant Flow

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
| Project skeleton | 004 | FastAPI, LangGraph, LiteLLM, DuckDB/Polars, CLI -- running end-to-end |
| GL Design Coach MVP tiering | 004 | docs/agents/gl-design-coach.md, DEC-026 through DEC-028 |

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
| 004 | 2026-02-15 | Skeleton build + MVP tiering | Project skeleton running end-to-end. GL Design Coach tiered: V1 = P&C only, real data from day one, hybrid knowledge encoding. 3 decisions (DEC-026 through DEC-028) |
