# NEXT STEPS

> Last updated: 2026-02-27 (Session 024)
> Current phase: Phase 1 — Personal Use MVP

---

## Strategy

FTA is an **interactive consulting framework** for insurance finance transformations, with AI agents embedded as capabilities. Three product modes: Pursuit, Workshop, Solo.

**Pivot (Session 021):** Shifting from frontend mock expansion to backend agentic capabilities. Two fully working agent flows for pitch demo: Account Analysis + GAAP Income Statement generation.

---

## Session 025 Pickup

1. **Clear localStorage + test COA Workbench** — clear `fta-analysis-store` and `fta-coa-store` from browser localStorage, restart backend with `FTA_MOCK_AGENT=true`, navigate to d-005-02, run analysis → confirm workbench appears with 4 tabs, inline editing, decision cards
2. **Hydration error verification** — confirm the SSR hydration mismatch fix works (storesHydrated guard in page.tsx)
3. **Live LLM testing** — set `FTA_MOCK_AGENT=false`, re-run d-005-02 → confirm agent produces `<coa_design>` JSON → workbench seeds correctly
4. **Agentic Functional Consultant** — start stream for 6 capabilities (gap→req, coverage, to-be flows, cross-PA, session prep, deliverable drafting)
5. **Stream A resume** — remaining knowledge workspaces
6. **Stream C** — platform polish (WorkplanSpine, breadcrumbs, loading states)

---

## Active Stream: B — Agentic Capabilities

| Step | What | Deps | Status |
|------|------|------|--------|
| B1 | Data fixture + startup loader (Parquet, DuckDB auto-load, upload) | — | Done |
| B2 | Analysis tools — profile_accounts, detect_mje, compute_tb, generate_is, assess_dims | B1 | Done |
| B3 | SSE streaming endpoint — astream_events, event envelope, StreamingResponse | — | Done |
| B4 | Wire GL Design Coach graph with tool nodes + LLM interpret | B2, B3 | Done |
| B5 | Frontend SSE consumer — fetch-event-source, agent Zustand store, ts-pattern match | B3 | Done |
| B6 | Capability 1 — Account Analysis end-to-end (d-005-01 live) | B4, B5 | Done |
| B7 | Capability 2 — GAAP Income Statement generation (d-006-06) | B4, B5 | Done |
| B8 | Demo polish — fallback, transitions, timing, status bar | B6, B7 | Done |

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
| WS-005 COA & GL | d-005-01, d-005-02, d-005-03, d-005-04 | 4/8 |
| WS-006 Reporting | d-006-01, d-006-06 | 2/6 |
| WS-007 Data & Integration | — | 0/5 |
| **Total** | **16** | **16/36 (44%)** |

---

## Key Files

### Frontend
- `web/src/lib/mock-data.ts` — types, workspace configs, workplan, PROCESS_AREAS
- `web/src/lib/mock-requirements.ts` — BR data (324 requirements)
- `web/src/lib/workshop-store.ts` — Zustand store for workshop mode
- `web/src/lib/analysis-store.ts` — Zustand store for cached analysis results
- `web/src/lib/coa-store.ts` — Zustand store for COA Design Workbench (PDD-006)
- `web/src/lib/scoping-data.ts` — Scoping Canvas themes, questions
- `web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx` — workspace dispatch
- `web/src/components/workspace/` — all workspace components
- `web/src/components/workspace/COADesignWorkbench.tsx` — editable tabbed workbench for d-005-02

### Backend
- `src/fta_agent/agents/consulting_agent.py` — router agent
- `src/fta_agent/agents/gl_design_coach.py` — specialist (needs tools)
- `src/fta_agent/api/app.py` — FastAPI app with lifespan (fixture auto-load)
- `src/fta_agent/data/engine.py` — DuckDB wrapper
- `src/fta_agent/data/schemas.py` — GL data models
- `src/fta_agent/data/outcomes.py` — outcome models
- `src/fta_agent/data/synthetic.py` — test data generator
- `src/fta_agent/data/loader.py` — fixture loading + file upload ingestion
- `src/fta_agent/tools/gl_analysis.py` — 5 analysis tools (profile, MJE, TB, IS, dims)
- `src/fta_agent/api/routes/stream.py` — SSE streaming endpoint (`/api/v1/stream`)

---

## Parked Items

- **d-004-03 index view:** Future State Process Maps needs a list/index of all sub-flows across all PAs (currently hardcoded to SP-02.1).
- **Trust-building layer for live agent workspaces:** Current CompletedAnalysisView is a single-column markdown dump. Missing: source attribution per recommendation, confidence indicators per finding, inline edit/reject on individual outputs, OutputReview split view (output left / evidence right), InterruptCard in live agent flow, audit trail linking output to tool calls, one-click export (PDF/Excel/clipboard), dynamic agent name in AgentStatusBar. Needs a dedicated PDD before building more GL Design Coach workspaces at production quality. See Session 023 audit for full gap table.

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
