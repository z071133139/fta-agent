# NEXT STEPS

> Last updated: 2026-03-02 (Session 027)
> Current phase: Phase 1 — Personal Use MVP

---

## Strategy

FTA is an **interactive consulting framework** for insurance finance transformations, with AI agents embedded as capabilities. Three product modes: Pursuit, Workshop, Solo.

**Pivot (Session 021):** Shifting from frontend mock expansion to backend agentic capabilities. Two fully working agent flows for pitch demo: Account Analysis + GAAP Income Statement generation.

**PDD-007 complete (Session 025):** Custom Process Flow Builder — NLP-driven flow creation via Functional Consultant agent. Split-view workspace, multi-turn conversation, live preview, accept/discard lifecycle.

**PDD-009 complete (Session 026):** Workstream-Level Data Gates — declarative per-workstream data requirements, workstream gate page, deliverable readiness table, WorkplanSpine data pips.

**PDD-010 complete (Session 026):** Mission Control Landing Page — unified context selector (engagements + pursuits), attention queue, resume card, data status widget, consultant presence pips, kill engagement dashboard.

**Session 027:** Slide deck content created (`docs/content/fta-slide-deck-content.md`). Phase 1 gap analysis completed. COA Design Workbench visual gap identified: missing Account String Diagram and Dimensional Matrix — the two most important COA visualizations for CFO presentations. Research completed on 6 standard insurance COA visual formats.

---

## Session 028 Pickup

1. **PDD-011 — COA Visual Enhancements + Dynamic Hierarchy** — Major evolution of d-005-02 COA Design Workbench. Three components:
   - **Account String Diagram:** Interactive horizontal segmented bar showing full account string composition (Company | Dept | Natural Account | LOB | Reinsurance Type | Product). Each segment: label, width, example values, NAIC alignment. The centerpiece of every COA presentation to CFOs.
   - **Dimensional Matrix:** Cross-reference grid showing Natural Account x LOB x Reinsurance Type intersections. Active vs. unused combinations. Shows the "explosion" problem and drives rationalization.
   - **Dynamic Hierarchy with Audit Trail:** Replaces static ERP hierarchies (FSVs) with agent-computed roll-ups. Three-tier classification model:
     - Tier 1 (Rule): deterministic lookup — `account_type + naic_category → FSLI`. Covers ~80%. No LLM.
     - Tier 2 (Pattern): coded heuristics on posting behavior + name + dimensions. Covers ~15%. No LLM.
     - Tier 3 (Agent→Pinned): LLM proposes for ambiguous accounts, consultant approves, approval converts to Tier 1 rule. System converges toward zero LLM calls.
   - **Audit artifact:** Every mapping has classification_source (rule/pattern/agent_pinned), basis text, approved_by, date, full change history. Agent reasoning preserved verbatim for Tier 3 pins. Override chain (nothing deleted). Reproducibility hash (data + rule version → deterministic output). Exportable as audit workpaper appendix.
   - **Multi-perspective:** Same accounts, different reporting frameworks on demand — "Show me NAIC Annual Statement" / "Show me GAAP" / "Show me IFRS 17". Hierarchy is a view, not a structure.
   - Research: 6 standard COA visual formats identified. We have range table + dimension canvas. Missing account string, dimensional matrix, hierarchy tree, crosswalk.
2. **PDD-008 — Color Readability Overhaul** — see `docs/plans/pdd-008-color-readability-overhaul.md`
3. **End-to-end Process Flow Builder testing** — test full flow: mock mode (turn 1 = clarifying Qs, turn 2+ = flow emission), live mode (verify ToolMessage fix renders preview), accept → index, discard → clean state
4. **COA Workbench verification** — clear localStorage, restart backend with `FTA_MOCK_AGENT=true`, navigate to d-005-02, run analysis → confirm workbench + 4 tabs
5. **Live LLM testing (both agents)** — `FTA_MOCK_AGENT=false`: test GL Design Coach on d-005-01/d-005-02 + Functional Consultant process flow builder
6. **Agentic Functional Consultant expansion** — 5 capabilities beyond flow building: gap→req pipeline, coverage analysis, cross-PA impact, session prep, deliverable drafting (see `docs/plans/stream-b-agentic-functional-consultant.md`)
7. **Stream A resume** — remaining knowledge workspaces (A6–A8, A10)

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

**End state:** Three agent capabilities working end-to-end. GL Design Coach (account analysis, COA design) + Functional Consultant (process flow builder). Real data in, real agent processing, real streamed results.

### Agentic Functional Consultant — Next Capabilities

Five remaining capabilities beyond flow building: gap→requirement pipeline, coverage analysis, cross-PA impact detection, session prep, deliverable drafting. **Full plan:** `docs/plans/stream-b-agentic-functional-consultant.md`

---

## Frozen Streams (resume after B)

- **Stream A — Framework Expansion:** 4 remaining knowledge workspaces (A6–A8, A10). A4 completed as PDD-006. See `docs/reference/feature-specs.md`.
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
