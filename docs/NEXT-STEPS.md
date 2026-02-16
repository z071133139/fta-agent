# Next Steps

> Last updated: 2026-02-16 (after Session 005)

## How to Use This Document

This is the primary pickup point between sessions. Before starting any new session, read this document first to understand where things stand and what's next. Update it at the end of every session.

## Current Phase: Build -- Phase 1, Iteration 0

Master plan and V1 build plan approved. Now building the test infrastructure needed to evaluate everything that follows.

---

## Current: Iteration 0 -- Test Data + Evaluation Framework

**Why first:** Without realistic test data and clear quality criteria, we can't tell if anything works. Iteration 1 (domain knowledge) depends on this.

### 0A: Synthetic P&C Test Data

**What needs to happen:**
- Define schemas for posting data, account master, trial balance (with P&C-specific fields)
- Design realistic P&C patterns (~2,500 accounts, MJE patterns, 12 months, ~500K-1M records)
- Build Python generator script (repeatable, seeded)
- Output as CSV + Parquet in `tests/fixtures/`
- Document embedded patterns for later verification

### 0B: Evaluation Framework

**What needs to happen:**
- Define concrete quality criteria for domain knowledge (Iteration 1) and data analysis (Iteration 3)
- Build test conversation scripts with expected answer rubrics
- Build token/cost logging utility
- Define cost thresholds per turn and per session

**Checkpoint:** Realistic data with known patterns? Concrete eval criteria?

**Reference:** [v1-build-plan.md](plans/v1-build-plan.md) Iteration 0

---

## Up Next: Iteration 1 -- Domain Knowledge Encoding (GO/NO-GO)

After Iteration 0, the core bet: prove the agent sounds like a senior P&C consultant. This uses the existing skeleton -- zero new infrastructure.

---

## Completed

| Item | Session | Reference |
|------|---------|-----------|
| Tech stack selection | 003 | docs/tech/tech-stack.md, DEC-018 through DEC-023 |
| Project skeleton | 004 | FastAPI, LangGraph, LiteLLM, DuckDB/Polars, CLI -- running end-to-end |
| GL Design Coach MVP tiering | 004 | docs/agents/gl-design-coach.md, DEC-026 through DEC-028 |
| Master plan + V1 build plan | 005 | docs/plans/master-plan.md, docs/plans/v1-build-plan.md |

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
| Engagement Context design | Iteration 2 (after domain knowledge proven) | docs/features/engagement-context.md |
| Layer 1 tools scoping | Phase 2 | docs/agents/consulting-agent.md |
| Multi-consultant flow | Phase 2 | docs/features/shared-backlog.md |

---

## Session Log

| Session | Date | Focus | Key Outcomes |
|---------|------|-------|-------------|
| [001](sessions/2026-02-14-session-001-ideation-kickoff.md) | 2026-02-14 | Ideation kickoff | Vision, architecture, 13 decisions, full documentation structure |
| [002](sessions/2026-02-15-session-002-gl-design-coach-deep-dive.md) | 2026-02-15 | GL Design Coach deep dive | Full code block design, MJE analysis, data validation pipeline, insurance language translation, sub-segment differentiation, 7 commits to gl-design-coach.md |
| [003](sessions/2026-02-15-session-003-tech-stack.md) | 2026-02-15 | Tech stack decisions | LangGraph, LiteLLM, DuckDB+Polars, FastAPI, Supabase, Next.js. 6 tech decisions (DEC-018 through DEC-023) |
| 004 | 2026-02-15 | Skeleton build + MVP tiering | Project skeleton running end-to-end. GL Design Coach tiered: V1 = P&C only, real data from day one, hybrid knowledge encoding. 3 decisions (DEC-026 through DEC-028) |
| 005 | 2026-02-16 | Master plan + V1 build plan | Full product roadmap (3 phases), detailed V1 build plan (7 iterations). Corrected sequence: domain knowledge first. Plans approved. |
