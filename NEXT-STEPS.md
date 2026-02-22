# NEXT STEPS

> Last updated: 2026-02-22 (Session 015)
> Current phase: Phase 1 — Personal Use MVP
> Strategy: Three-stream build (Framework Expansion + Data Slice + Platform Polish)

---

## Strategic Reframe (Session 015)

FTA is an **interactive consulting framework** for insurance finance transformations, with AI agents embedded as capabilities. The framework is the product. Some deliverables are agent-powered (GL Account Analysis), others are knowledge-powered (Business Requirements, RACI Matrix), some are hybrid (Process Inventory).

**Three workstreams, interleaved:**

| Stream | Focus | Dependency |
|--------|-------|------------|
| **A — Framework Expansion** | Knowledge-powered workspaces across all 7 workstreams | None — mock data |
| **B — Data Slice** | d-005-01 Account Analysis end-to-end with real data | Backend SSE + data tools |
| **C — Platform Polish** | Navigation, layout, breadcrumbs, WorkplanSpine wiring | Existing components |

---

## Session Plan

| Session | Focus | Stream | Deliverables |
|---------|-------|--------|--------------|
| **015** | Product plan doc ✅ + 4 knowledge workspaces | A | A1, A2, A3, A9 |
| 016 | SSE streaming endpoint + frontend SSE consumer | B | B1, B5 |
| 017 | GL data ingestion + account profiling tools | B | B2, B3 |
| 018 | End-to-end data slice + 2 knowledge workspaces | B+A | B4, A4, A5 |
| 019 | Navigation, layout, WorkplanSpine wiring | C | C1, C2 |
| 020 | Remaining knowledge workspaces + polish | A+C | A6–A10, C3 |

**Milestone after Session 020:** 15/35 deliverables (43%), all 7 workstreams covered, 1 fully agent-powered vertical.

---

## Stream A — Framework Expansion (Knowledge Workspaces)

10 highest-impact deliverables, one per uncovered workstream + key gaps:

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

**Build approach:** Most are AnnotatedTable with domain-specific mock data. No new component types needed. Define columns, write mock rows, add to MOCK_WORKSPACES.

---

## Stream B — Data Slice (GL Account Analysis End-to-End)

Get d-005-01 working with real data: upload GL → agent analyzes → workspace shows real results.

| Step | What | Session |
|------|------|---------|
| B1 | SSE streaming endpoint — convert `/api/chat` to SSE, `astream_events(version="v2")` | 016 |
| B2 | GL data ingestion tool — `@tool ingest_gl_data(file_path)`, Excel/CSV → Polars → DuckDB | 017 |
| B3 | Account profiling tool — `@tool profile_accounts()`, DuckDB queries, MJE detection | 017 |
| B4 | Workspace wiring — Preflight CTA → POST with SSE, progressive row reveal | 018 |
| B5 | Frontend SSE consumer — `@microsoft/fetch-event-source`, `ts-pattern` match, real agent state | 016 |

**End state:** Upload Acme_TB_FY2025.xlsx → agent profiles 68 accounts → workspace shows real results with provenance.

---

## Stream C — Platform Polish

| Step | What | Session |
|------|------|---------|
| C1 | WorkplanSpine as left sidebar, breadcrumb nav, cross-deliverable linking | 019 |
| C2 | Landing page: workstream progress bars, recent activity feed, status badges | 019 |
| C3 | Loading states, error states, keyboard navigation | 020 |

---

## Current Coverage

| Workstream | Deliverables with Workspaces | Coverage |
|-----------|------------------------------|----------|
| WS-001 PM & Governance | — | 0/5 |
| WS-002 Business Case | — | 0/4 |
| WS-003 ERP Selection | — | 0/5 |
| WS-004 Business Process | d-004-01, d-004-03, d-004-04 | 3/5 |
| WS-005 COA & GL | d-005-01, d-005-03 | 2/8 |
| WS-006 Reporting | — | 0/5 |
| WS-007 Data & Integration | — | 0/5 |
| **Total** | **5** | **5/35 (14%)** |

---

## What We're NOT Building Yet

- Supabase integration (Phase 2)
- Multi-agent handoff protocol
- Functional Consultant agent implementation
- Additional data tools beyond GL Account Analysis
- Mobile / responsive design
- Auth beyond mock

---

## Key Files

### Frontend
- `web/src/lib/mock-data.ts` — types, workspace configs, workplan
- `web/src/lib/mock-requirements.ts` — BR data (324 requirements)
- `web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx` — workspace dispatch
- `web/src/components/workspace/` — all workspace components

### Backend
- `src/fta_agent/agents/consulting_agent.py` — router agent
- `src/fta_agent/agents/gl_design_coach.py` — specialist (needs tools)
- `src/fta_agent/api/routes/chat.py` — needs SSE conversion
- `src/fta_agent/data/engine.py` — DuckDB wrapper
- `src/fta_agent/data/schemas.py` — GL data models
- `src/fta_agent/data/outcomes.py` — outcome models
- `src/fta_agent/data/synthetic.py` — test data generator

---

## Verification (per session)

- `pnpm --filter web build` — clean TypeScript compilation
- Navigate to each new workspace via landing page → workplan → deliverable
- For data slice: upload test data → verify agent output in workspace
- No regressions: existing workspaces still render correctly
