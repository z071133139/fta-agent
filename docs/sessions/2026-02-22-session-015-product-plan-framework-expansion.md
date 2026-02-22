# Session 015: Product Plan — Interactive Consulting Framework

**Date:** 2026-02-22
**Iteration:** Strategic reframe — FTA as Interactive Consulting Framework

---

## Session Context

Through 14 sessions we built a strong frontend (5 workspaces, full workspace shell, landing page) and a solid backend foundation (agent registry, domain prompts, data schemas). But the product strategy assumed a linear path: finish backend 1.5A → wire SSE → connect frontend. This session steps back to reframe what FTA actually is and plan a more effective build path.

## Strategic Reframe

### What changed

**Before (Session 014):** FTA is an AI agent for insurance finance transformations. The backend agent is the product. The frontend is a UI for it. Backend 1.5A is the blocker.

**After (Session 015):** FTA is an **interactive consulting framework** for insurance finance transformations, with AI agents embedded as capabilities within it. The framework is the product. A consultant opens it every day to navigate workstreams, review deliverables, make scoping decisions, and capture requirements.

### Why this matters

Some deliverables are **agent-powered** (GL Account Analysis — agent ingests data, runs analysis, produces artifacts). Others are **knowledge-powered** (Business Requirements — curated domain library the consultant navigates and customizes). Some are **hybrid** (Process Inventory — knowledge library enriched by agent findings).

The agent is a capability inside the framework, not the product itself. This unlocks a build strategy that doesn't bottleneck on backend agent infrastructure.

### Three-stream strategy

| Stream | Focus | Dependency |
|--------|-------|------------|
| **A — Framework Expansion** | Knowledge-powered workspaces (no agent needed) | None — mock data, fast to build |
| **B — Data Slice** | One deliverable end-to-end with real data (d-005-01) | Backend SSE, data tools |
| **C — Platform Polish** | Navigation, layout, UX | Existing components |

Streams A and C can proceed immediately. Stream B is the former "1.5A blocker" — but it's now one workstream among three, not the only path forward.

---

## Coverage Analysis

### Current state: 5 of 35 deliverables (14%)

| Workspace | Workstream | Type |
|-----------|-----------|------|
| d-005-01 Account Analysis Report | WS-005 COA & GL | AnnotatedTable |
| d-005-03 Account Mapping | WS-005 COA & GL | AnnotatedTable + Interrupt |
| d-004-01 Process Inventory | WS-004 Business Process | ProcessInventoryGraph |
| d-004-03 Future State Process Maps | WS-004 Business Process | ProcessFlowMap |
| d-004-04 Business Requirements | WS-004 Business Process | BusinessRequirementsTable |

Five workstreams have zero coverage: WS-001 PM & Governance, WS-002 Business Case, WS-003 ERP Selection, WS-006 Reporting, WS-007 Data & Integration.

### Target: 15 of 35 deliverables (43%), all 7 workstreams represented

Stream A adds 10 knowledge workspaces selected for maximum coverage and impact:

| # | Deliverable | Workstream | Type | Session |
|---|-------------|------------|------|---------|
| A1 | d-001-03 RACI Matrix | WS-001 PM & Governance | Table | 015 |
| A2 | d-002-02 Scope Definition | WS-002 Business Case | Table | 015 |
| A3 | d-003-04 ERP Evaluation Summary | WS-003 ERP Selection | Table + scores | 015 |
| A9 | d-001-04 Risk & Issue Log | WS-001 PM & Governance | Table | 015 |
| A4 | d-005-02 Chart of Accounts Design | WS-005 COA & GL | Custom | 018 |
| A5 | d-006-01 Reporting Inventory | WS-006 Reporting | Table | 018 |
| A6 | d-007-04 Interface Inventory | WS-007 Data & Integration | Table | 020 |
| A7 | d-004-06 Process Gap Analysis | WS-004 Business Process | Table + fit/gap | 020 |
| A8 | d-005-04 ACDOCA Dimension Design | WS-005 COA & GL | Custom | 020 |
| A10 | d-006-03 Regulatory Reporting Map | WS-006 Reporting | Table | 020 |

---

## Session Plan (next 5-6 sessions)

| Session | Focus | Stream | Deliverables |
|---------|-------|--------|--------------|
| 015 | Product plan + 4 knowledge workspaces | A | A1, A2, A3, A9 |
| 016 | SSE streaming endpoint + workspace wiring | B | B1, B5 |
| 017 | GL data tools + account profiling | B | B2, B3 |
| 018 | End-to-end data slice + 2 knowledge workspaces | B+A | B4, A4, A5 |
| 019 | Navigation, layout, WorkplanSpine wiring | C | C1, C2 |
| 020 | Remaining knowledge workspaces + polish | A+C | A6-A10, C3 |

### Milestone: After Session 020

- 15/35 deliverables with workspaces (all 7 workstreams covered)
- 1 deliverable fully agent-powered with real data (d-005-01)
- Navigation polished with WorkplanSpine and breadcrumbs
- Product is both demo-ready and has one working data vertical

---

## What We're NOT Building Yet

- Supabase integration (Phase 2 — multi-consultant, persistence)
- Multi-agent handoff protocol (only needed when agents produce real output that feeds other agents)
- Functional Consultant agent implementation (knowledge workspaces don't need it)
- Additional data tools beyond GL Account Analysis (one vertical first, then expand)
- Mobile / responsive design
- Auth beyond mock

---

## Decisions Made

| ID | Decision | Status |
|----|----------|--------|
| — | FTA is a consulting framework with embedded agents, not an agent with a UI | Decided |
| — | Three-stream build strategy (Framework, Data Slice, Polish) replaces linear backend-first | Decided |
| — | 10 highest-impact deliverables selected for Stream A expansion | Decided |
| — | Backend 1.5A is now "Stream B" — no longer sole blocker | Decided |

---

## Artifacts Produced

| File | Change |
|------|--------|
| `docs/sessions/2026-02-22-session-015-product-plan-framework-expansion.md` | **New** — this file |
| `NEXT-STEPS.md` | Rewritten for three-stream strategy |
| `README.md` | Rewritten — "interactive consulting framework" framing, three deliverable models, build strategy |
| `docs/plans/master-plan.md` | "What FTA Is" rewritten, Current Position updated with three-stream tree |
| `docs/plans/v1-build-plan.md` | Iteration dependencies updated for stream-based approach |
| `docs/vision/product-vision.md` | Vision reframed as consulting framework, three deliverable models |
| `docs/vision/architecture-overview.md` | Three deliverable models, workspace coverage section added |

---

## Next Session Priorities

Build the 4 knowledge workspaces (A1, A2, A3, A9) — add DeliverableWorkspace entries to MOCK_WORKSPACES with domain-specific mock data, then build check.
