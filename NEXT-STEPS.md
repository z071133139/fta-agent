# NEXT STEPS

> Last updated: 2026-03-02 (Session 025)
> Current phase: Phase 1 — Personal Use MVP

---

## Strategy

FTA is an **interactive consulting framework** for insurance finance transformations, with AI agents embedded as capabilities. Three product modes: Pursuit, Workshop, Solo.

**Pivot (Session 021):** Shifting from frontend mock expansion to backend agentic capabilities. Two fully working agent flows for pitch demo: Account Analysis + GAAP Income Statement generation.

**PDD-007 complete (Session 025):** Custom Process Flow Builder — NLP-driven flow creation via Functional Consultant agent. Split-view workspace, multi-turn conversation, live preview, accept/discard lifecycle.

---

## Session 026 Pickup

1. **End-to-end Process Flow Builder testing** — test full flow: mock mode (turn 1 = clarifying Qs, turn 2+ = flow emission), live mode (verify ToolMessage fix renders preview), accept → index, discard → clean state
2. **COA Workbench verification** — clear localStorage, restart backend with `FTA_MOCK_AGENT=true`, navigate to d-005-02, run analysis → confirm workbench + 4 tabs
3. **Live LLM testing (both agents)** — `FTA_MOCK_AGENT=false`: test GL Design Coach on d-005-01/d-005-02 + Functional Consultant process flow builder
4. **Agentic Functional Consultant expansion** — 6 capabilities beyond flow building: gap→req pipeline, coverage analysis, cross-PA impact, session prep, deliverable drafting (see `docs/plans/stream-b-agentic-functional-consultant.md`)
5. **Stream A resume** — remaining knowledge workspaces (A6–A8, A10)
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
| PDD-006 | COA Design Workbench (d-005-02) — living document pattern | B4, B5 | Done |
| PDD-007 | Custom Process Flow Builder — FC agent + split-view + emit_process_flow | B3, B5 | Done |

**End state:** Three agent capabilities working end-to-end. GL Design Coach (account analysis, COA design) + Functional Consultant (process flow builder). Real data in, real agent processing, real streamed results.

### Agentic Functional Consultant — Next Capabilities

Five remaining capabilities beyond flow building: gap→requirement pipeline, coverage analysis, cross-PA impact detection, session prep, deliverable drafting. **Full plan:** `docs/plans/stream-b-agentic-functional-consultant.md`

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
| WS-004 Business Process | d-004-01, d-004-03, d-004-03b, d-004-03c, d-004-03d, d-004-04 + custom flows | 6/5+ |
| WS-005 COA & GL | d-005-01, d-005-02, d-005-03, d-005-04 | 4/8 |
| WS-006 Reporting | d-006-01, d-006-06 | 2/6 |
| WS-007 Data & Integration | — | 0/5 |
| **Total** | **16 + custom** | **16/36 (44%) + custom flows** |

---

## Key Files

### Frontend
- `web/src/lib/mock-data.ts` — types, workspace configs, workplan, PROCESS_AREAS
- `web/src/lib/mock-requirements.ts` — BR data (324 requirements)
- `web/src/lib/workshop-store.ts` — Zustand store for workshop mode
- `web/src/lib/analysis-store.ts` — Zustand store for cached analysis results
- `web/src/lib/coa-store.ts` — Zustand store for COA Design Workbench (PDD-006)
- `web/src/lib/flow-builder-store.ts` — Zustand store for Process Flow Builder (PDD-007)
- `web/src/lib/agent-store.ts` — Zustand store for agent SSE streaming state
- `web/src/lib/agent-client.ts` — SSE client with history + onToolCall support
- `web/src/lib/scoping-data.ts` — Scoping Canvas themes, questions
- `web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx` — workspace dispatch
- `web/src/components/workspace/` — all workspace components
- `web/src/components/workspace/COADesignWorkbench.tsx` — editable tabbed workbench for d-005-02
- `web/src/components/workspace/ProcessFlowBuilder.tsx` — split-view FC agent builder (PDD-007)
- `web/src/components/workspace/ProcessFlowIndex.tsx` — flow index with custom flows + builder entry
- `web/src/components/workspace/flow-builder/` — BuilderChatPanel, BuilderPreviewPanel

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

## Parked Items

- **d-004-03 index view:** Future State Process Maps needs a list/index of all sub-flows across all PAs (currently hardcoded to SP-02.1).
- **Trust-building layer for live agent workspaces:** Current CompletedAnalysisView is a single-column markdown dump. Missing: source attribution per recommendation, confidence indicators per finding, inline edit/reject on individual outputs, OutputReview split view (output left / evidence right), InterruptCard in live agent flow, audit trail linking output to tool calls, one-click export (PDF/Excel/clipboard), dynamic agent name in AgentStatusBar. Needs a dedicated PDD before building more GL Design Coach workspaces at production quality. See Session 023 audit for full gap table.
- **Permanent storage for custom process flows (PDD-007 follow-up):** Accepted flows currently live in localStorage (`fta-flow-builder` Zustand persist store). Needs Supabase migration: `custom_process_flows` table with `engagement_id`, `flow_data` (JSONB), `created_by`, `created_at`, `name`. Custom flows should appear alongside leading practice flows in the Process Flow Index and be editable via the standard ProcessFlowMap workshop mode. Depends on Supabase integration (Phase 2).

---

## What We're NOT Building Yet

- Supabase integration (Phase 2) — includes permanent storage for custom process flows, engagement context, auth
- Multi-agent handoff protocol
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
