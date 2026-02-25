# NEXT STEPS

> Last updated: 2026-02-24 (Session 021)
> Current phase: Phase 1 — Personal Use MVP

---

## Strategy

FTA is an **interactive consulting framework** for insurance finance transformations, with AI agents embedded as capabilities. Three product modes: Pursuit, Workshop, Solo.

**Pivot (Session 021):** Shifting from frontend mock expansion to backend agentic capabilities. Two fully working agent flows for pitch demo: Account Analysis + GAAP Income Statement generation.

---

## Active Stream: B — Agentic Capabilities

| Step | What | Deps | Status |
|------|------|------|--------|
| B1 | Data fixture + startup loader (Parquet, DuckDB auto-load, upload) | — | In Progress |
| B2 | Analysis tools — profile_accounts, detect_mje, compute_tb, generate_is, assess_dims | B1 | Todo |
| B3 | SSE streaming endpoint — astream_events, event envelope, StreamingResponse | — | Todo |
| B4 | Wire GL Design Coach graph with tool nodes + LLM interpret | B2, B3 | Todo |
| B5 | Frontend SSE consumer — fetch-event-source, agent Zustand store, ts-pattern match | B3 | Todo |
| B6 | Capability 1 — Account Analysis end-to-end (d-005-01 live) | B4, B5 | Todo |
| B7 | Capability 2 — GAAP Income Statement generation (d-006-06) | B4, B5 | Todo |
| B8 | Demo polish — fallback, transitions, timing, status bar | B6, B7 | Todo |

**End state:** Two capabilities working end-to-end. Real data in, real agent processing, real streamed results.

### Agentic Functional Consultant (after B)

Six capabilities: gap→requirement pipeline, coverage analysis, to-be flow generation, cross-PA impact detection, session prep, deliverable drafting. **Full plan:** `docs/plans/stream-b-agentic-functional-consultant.md`

---

## Frozen Streams (resume after B)

- **Stream A — Framework Expansion:** 6 remaining knowledge workspaces (A4, A6–A8, A10). See `docs/reference/feature-specs.md`.
- **Stream C — Platform Polish:** WorkplanSpine sidebar, breadcrumbs, loading/error states. See `docs/reference/feature-specs.md`.
- **Stream E — Current State Extraction:** Designed, not built. See `docs/reference/feature-specs.md`.

---

## Current Coverage

| Workstream | Deliverables with Workspaces | Coverage |
|-----------|------------------------------|----------|
| WS-001 PM & Governance | d-001-03, d-001-04 | 2/5 |
| WS-002 Business Case | d-002-02 | 1/4 |
| WS-003 ERP Selection | d-003-04 | 1/5 |
| WS-004 Business Process | d-004-01, d-004-03, d-004-03b, d-004-03c, d-004-03d, d-004-04 | 6/5+ |
| WS-005 COA & GL | d-005-01, d-005-03 | 2/8 |
| WS-006 Reporting | d-006-01 | 1/5 |
| WS-007 Data & Integration | — | 0/5 |
| **Total** | **13** | **13/35 (37%)** |

---

## Key Files

### Frontend
- `web/src/lib/mock-data.ts` — types, workspace configs, workplan, PROCESS_AREAS
- `web/src/lib/mock-requirements.ts` — BR data (324 requirements)
- `web/src/lib/workshop-store.ts` — Zustand store for workshop mode
- `web/src/lib/scoping-data.ts` — Scoping Canvas themes, questions
- `web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx` — workspace dispatch
- `web/src/components/workspace/` — all workspace components

### Backend
- `src/fta_agent/agents/consulting_agent.py` — router agent
- `src/fta_agent/agents/gl_design_coach.py` — specialist (needs tools)
- `src/fta_agent/api/app.py` — FastAPI app with lifespan (fixture auto-load)
- `src/fta_agent/data/engine.py` — DuckDB wrapper
- `src/fta_agent/data/schemas.py` — GL data models
- `src/fta_agent/data/outcomes.py` — outcome models
- `src/fta_agent/data/synthetic.py` — test data generator
- `src/fta_agent/data/loader.py` — fixture loading + file upload ingestion

---

## Parked Items

- **d-004-03 index view:** Future State Process Maps needs a list/index of all sub-flows across all PAs (currently hardcoded to SP-02.1).

---

## What We're NOT Building Yet

- Supabase integration (Phase 2)
- Multi-agent handoff protocol
- Functional Consultant agent implementation
- Additional data tools beyond GL Account Analysis
- Pursuit phase implementation (designed, build after Stream B)
- Mobile / responsive design
- Auth beyond mock

---

## Verification (per session)

- `pnpm --filter web build` — clean TypeScript compilation
- Navigate to each new workspace via landing page → workplan → deliverable
- Workshop mode: click Workshop button → select PA, verify layout change, `Cmd+E` to exit
- No regressions: existing workspaces still render correctly
