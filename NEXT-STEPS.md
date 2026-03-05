# NEXT STEPS

> Last updated: 2026-03-05 (Session 032)
> Current phase: Phase 1 — Pitch Demo MVP (1-2 sessions remaining)

---

## Strategy

FTA is an **interactive consulting framework** for insurance finance transformations, with AI agents embedded as capabilities. Three product modes: Pursuit, Workshop, Solo.

**Phase reframe (Session 029):** Phase 1 narrowed to **Pitch Demo MVP** — one compelling live demo that gets buy-in from collaborators/investors. Original Phase 1 scope (personal use on real engagements) pushed to Phase 2. No new features — 3 sessions of hardening, polish, and rehearsal.

**The demo is three moments:**
1. "It knows my world" — Mission control, P&C workstreams, NAIC vocabulary (READY)
2. "It just did real work" — Upload TB → GL Design Coach → COA workbench → Deliverable tab (GAP: live agent reliability)
3. "It works with humans" — Workshop mode, gap flagging, requirement capture, agent suggestions (READY)

---

## Session 030 — Interactive Pitch Deck (Done)

- PDD-013: `/pitch` route — 11 full-screen navigable slides using app design system
- 6 slide types: Title, Phase0 (two-panel timeline+costs), TwoColumn, ThreeColumn, Stats, Roadmap, Value
- Keyboard nav (arrows, number keys, Escape), click zones, auto-hiding controls
- "See it live" links on slides 6/7/8 navigate to workspaces with "Back to deck" return pill
- Content from `fta-slide-deck-content.md` with fixes (COA, updated phases, eight-tab workbench)

## Session 031 — Harden Live Agent (Done)

- Fixed critical `naic_alignment` → `stat_alignment` field name mismatch
- Landing page polish — compact greeting, FTA logo
- 3/5 live agent runs passing

## Session 032 — Wire Workbench Chat to Real Agent (Done)

- **`chat-client.ts`** — callback-based SSE streaming client (no Zustand collision with main agent store)
- **`buildWorkbenchContext()`** — injects active tab + store state into agent messages
- **5 smart chat mock responses** in `stream.py` — show examples, propose fix, impact analysis, continuation, tab-aware fallback
- **`AgentChatPanel` fully wired** — token-by-token streaming, blinking cursor, tool activity indicator, input disabled during stream
- **`updateChatMessage`** added to COA store for in-place message updates
- Also includes prior uncommitted COA tab improvements (AccountStringDiagram, DimensionalMatrix, COADeliverable, DynamicHierarchy)

## Session 033/034 — Deploy + Golden Dataset + Demo Script

4. **Deploy backend** — Dockerfile for FastAPI + DuckDB + LangGraph. Deploy to GCP Cloud Run. Set `ANTHROPIC_API_KEY` env var. Verify fixture auto-loads on startup, SSE streams to remote frontend.
5. **Deploy frontend** — Firebase Hosting from repo. Configure `NEXT_PUBLIC_API_URL` env var pointing to deployed backend. Add deployed domain to backend CORS config.
6. **Configurable API URL** — Replace hardcoded `localhost:8000` with environment variable in frontend API client (`agent-client.ts`, any fetch calls). Already uses env vars? Verify and fix.
7. **Pre-seed golden coa-store + hierarchy-store** — Beautiful, complete data as demo fallback if live agent fails during pitch. All 9 deliverable sections green-ready.
8. **Smoke test on deployed URL** — Open Firebase Hosting link, run through all three demo moments against deployed backend. Fix any issues.

## Session 033 — Demo Script + Rehearsal

9. **Visual polish pass** — Fix any rendering issues found during deployed testing. Ensure dark theme looks screenshot-ready.
10. **Write demo script** — Exact click path with timing for each of the three moments. Identify every failure point with recovery action.
11. **Rehearse 3x** — Time the full demo on the deployed URL (not localhost). Target: under 6 minutes.
12. **Record backup video** — Screen recording of the full demo flow in case live demo fails.

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
| PDD-006 | COA Design Workbench (d-005-02) — living document pattern | B4, B5 | Done |
| PDD-007 | Custom Process Flow Builder — FC agent + split-view + emit_process_flow | B3, B5 | Done |
| PDD-009 | Workstream-Level Data Gates — declarative data requirements per workstream | B1 | Done |
| PDD-010 | Mission Control Landing Page — unified context selector, attention queue, presence | PDD-009 | Done |
| UAT | Process Flow Builder UAT — 120 scenarios, 3 defects fixed (custom flow nav, placing cancel, hydration) | PDD-007 | Done |
| PDD-012 | COA Design Deliverable tab — 9-section document view with readiness + status lifecycle | PDD-006, PDD-011 | Done |

**End state:** Three agent capabilities working end-to-end. GL Design Coach (account analysis, COA design) + Functional Consultant (process flow builder). Real data in, real agent processing, real streamed results.

### Agentic Functional Consultant — Next Capabilities

Five remaining capabilities beyond flow building: gap→requirement pipeline, coverage analysis, cross-PA impact detection, session prep, deliverable drafting. **Full plan:** `docs/plans/stream-b-agentic-functional-consultant.md`

---

## Deferred to Phase 2 (Personal Use MVP)

- **RAG pipeline** — curate 20-30 P&C/SAP reference docs, pgvector, retrieval quality testing
- **Supabase persistence** — migrate 6 Zustand stores to server state (TanStack Query)
- **Evaluation framework** — measure agent output against senior consultant criteria
- **Real P&C data validation** — test on actual trial balance, not just synthetic
- **Trust-building layer** — source attribution, confidence indicators, OutputReview split view
- **PDF/Excel export** — from Deliverable tab and other workspaces
- **Agentic FC expansion** — 5 capabilities: gap→req, coverage, cross-PA impact, session prep, deliverable drafting
- **Stream A continued** — A6–A8, A10 remaining knowledge workspaces
- **Stream C — Platform Polish** — WorkplanSpine sidebar, breadcrumbs, loading/error states
- **Stream E — Current State Extraction** — designed Session 019, build TBD
- **Performance + cost testing** — 1M+ postings, token budget per session

---

## Current Coverage

| Workstream | Deliverables with Workspaces | Coverage |
|-----------|------------------------------|----------|
| WS-001 PM & Governance | d-001-03, d-001-04 | 2/5 |
| WS-002 Business Case | d-002-02 | 1/4 |
| WS-003 ERP Selection | d-003-04 | 1/5 |
| WS-004 Business Process | d-004-01, d-004-03, d-004-03b, d-004-03c, d-004-03d, d-004-04 + custom flows | 6/5+ |
| WS-005 COA & GL | d-005-01, d-005-02 (+Deliverable tab), d-005-03, d-005-04 | 4/4 active (4 in backlog) |
| WS-006 Reporting | d-006-01, d-006-06 | 2/6 |
| WS-007 Data & Integration | — | 0/5 |
| **Total** | **16 + custom** | **16/32 active (50%) + 19 backlog** |

---

## Key Files

### Frontend
- `web/src/lib/mock-data.ts` — types, workspace configs, workplan, PROCESS_AREAS
- `web/src/lib/mock-requirements.ts` — BR data (324 requirements)
- `web/src/lib/workshop-store.ts` — Zustand store for workshop mode
- `web/src/lib/analysis-store.ts` — Zustand store for cached analysis results
- `web/src/lib/coa-store.ts` — Zustand store for COA Design Workbench (PDD-006) + Deliverable tab (PDD-012)
- `web/src/lib/hierarchy-store.ts` — Zustand store for FSLI hierarchy classifications
- `web/src/lib/flow-builder-store.ts` — Zustand store for Process Flow Builder (PDD-007)
- `web/src/lib/agent-store.ts` — Zustand store for agent SSE streaming state
- `web/src/lib/agent-client.ts` — SSE client with history + onToolCall support (main agent runs)
- `web/src/lib/chat-client.ts` — callback-based SSE client for workbench chat panel (no Zustand collision)
- `web/src/lib/scoping-data.ts` — Scoping Canvas themes, questions
- `web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx` — workspace dispatch
- `web/src/components/workspace/` — all workspace components
- `web/src/components/workspace/COADesignWorkbench.tsx` — editable tabbed workbench for d-005-02 (8 tabs incl. Deliverable)
- `web/src/components/workspace/coa-tabs/COADeliverable.tsx` — 9-section deliverable document view (PDD-012)
- `docs/reference/agent-backlog.md` — backlog deliverables by agent (GL Design Coach, FC, Consulting Agent)
- `web/src/components/workspace/ProcessFlowBuilder.tsx` — split-view FC agent builder (PDD-007)
- `web/src/components/workspace/ProcessFlowIndex.tsx` — flow index with custom flows + builder entry
- `web/src/components/workspace/flow-builder/` — BuilderChatPanel, BuilderPreviewPanel
- `web/src/components/landing/` — ContextSelector, AttentionQueue, ResumeCard, DataStatusWidget, PursuitContent
- `web/src/components/workstream/` — WorkstreamDataPanel, WorkstreamDataSummary
- `web/src/lib/workstream-data-config.ts` — declarative per-workstream data requirements
- `web/src/lib/data-store.ts` — Zustand store for uploaded data files + workstream selectors

### Backend
- `src/fta_agent/agents/consulting_agent.py` — router agent
- `src/fta_agent/agents/gl_design_coach.py` — GL specialist with tool-calling graph
- `src/fta_agent/agents/functional_consultant.py` — FC agent with process flow tools
- `src/fta_agent/api/app.py` — FastAPI app with lifespan (fixture auto-load)
- `src/fta_agent/data/engine.py` — DuckDB wrapper
- `src/fta_agent/data/schemas.py` — GL data models
- `src/fta_agent/data/outcomes.py` — outcome models
- `src/fta_agent/data/synthetic.py` — test data generator
- `src/fta_agent/data/loader.py` — fixture loading + file upload ingestion
- `src/fta_agent/tools/gl_analysis.py` — 5 analysis tools (profile, MJE, TB, IS, dims)
- `src/fta_agent/tools/process_flow_tools.py` — emit_process_flow tool (PDD-007)
- `src/fta_agent/prompts/functional_consultant_flow.md` — FC flow-building system prompt
- `src/fta_agent/api/routes/stream.py` — SSE streaming endpoint (`/api/v1/stream`)

---

## Parked Items (Phase 2)

- **CB Dimensions tab redesign:** Current tab conflates coding string layout (how the GL key is composed) with code block dimensions (what qualifies a posting — profit center, cost center, functional area, etc.). Needs a clear concept: is it showing the GL key structure, or the dimensions that apply to code blocks? Missing real dimensions (profit center, cost center, functional area, segment, trading partner). Revisit after demo.
- **d-004-03 index view:** Future State Process Maps needs a list/index of all sub-flows across all PAs (currently hardcoded to SP-02.1).
- **Trust-building layer:** Source attribution, confidence indicators, OutputReview split view, audit trail. See Session 023 audit for full gap table. Needs dedicated PDD.
- **Permanent storage for custom process flows:** Accepted flows in localStorage. Needs Supabase migration. Depends on Phase 2.
- **Browser UAT pass:** 4 remaining MANUAL scenarios from Process Flow UAT need in-browser confirmation.

---

## What We're NOT Building Yet

- Everything in the "Deferred to Phase 2" list above
- Multi-agent handoff protocol (Phase 3)
- Additional Layer 2 specialists (Phase 3+)
- Mobile / responsive design (Phase 4)
- Enterprise LLM endpoints (Phase 4)

---

## Verification (per session)

- `pnpm --filter web build` — clean TypeScript compilation
- Navigate to each new workspace via landing page → workplan → deliverable
- Workshop mode: click Workshop button → select PA, verify layout change, `Cmd+E` to exit
- No regressions: existing workspaces still render correctly
