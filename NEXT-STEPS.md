# NEXT STEPS

> Last updated: 2026-02-23 (Session 018)
> Current phase: Phase 1 — Personal Use MVP
> Strategy: Workshop Mode first (differentiator), then Framework Expansion + Data Slice

---

## Strategic Reframe (Session 015)

FTA is an **interactive consulting framework** for insurance finance transformations, with AI agents embedded as capabilities. The framework is the product. Some deliverables are agent-powered (GL Account Analysis), others are knowledge-powered (Business Requirements, RACI Matrix), some are hybrid (Process Inventory).

### Three Product Modes

| Mode | When | What FTA does |
|------|------|--------------|
| **Pursuit** | Pre-engagement, exec meeting | Scoping canvas, pain points, proposal generation |
| **Workshop** | During delivery, client in the room | Live capture against leading practice baseline, agent-assisted structuring |
| **Solo** | Between workshops, consultant alone | Review, refine, run agent analysis, prepare next session |

### Build Streams (priority order)

| Stream | Focus | Dependency | Priority |
|--------|-------|------------|----------|
| **W — Workshop Mode** | Live capture, keyboard-first editing, agent listening mode | Existing workspace components | **Now** |
| **A — Framework Expansion** | Knowledge-powered workspaces across all 7 workstreams | None — mock data | After W |
| **B — Data Slice** | d-005-01 Account Analysis end-to-end with real data | Backend SSE + data tools | After W |
| **C — Platform Polish** | Navigation, layout, breadcrumbs, WorkplanSpine wiring | Existing components | After W |

---

## Session Plan

| Session | Focus | Stream | Items |
|---------|-------|--------|-------|
| **015** | Product plan docs ✅ + 4 knowledge workspaces ✅ | A | A1, A2, A3, A9 |
| **016** | Workshop layout toggle ✅ + brightness fix ✅ | W | W1 |
| **017** | CaptureBar + live req/flow editing + agent insights ✅ | W | W2, W3, W4, W5 (partial) |
| **018** | 3 new process flows + fit/gap data + Agentic Bridges panel ✅ | A+W | A11, W5 (enhanced) |
| 019 | Agent listening mode + micro-interactions | W | W5 (remainder), W6 |
| 020 | Backend persistence + workshop session continuity | W | W7, W8 |
| 021 | Remaining knowledge workspaces (A4–A10) + platform polish | A+C | A4–A10, C1–C3 |
| 022+ | Data slice (SSE, GL tools, end-to-end wiring) | B | B1–B5 |

**Milestone after Session 020:** Workshop Mode fully operational — consultant can run a live business process workshop with FTA on the projector, capturing requirements and process changes in real-time against the leading practice baseline.

**Milestone after Session 021:** 15/35 deliverables (43%), all 7 workstreams covered.

---

## Stream W — Workshop Mode (Sessions 016–019)

The differentiator. Live capture against the leading practice baseline during client workshops. The consultant pulls up the workspace on the projector — process flows and requirements are pre-loaded. The client team reacts to what exists.

**Key principle:** Most common action is modification/annotation of existing content, not creation from scratch.

### W1 — Workshop Layout Toggle ✅ (Session 016)

PA-scoped workshop mode. Click "Workshop" button in TopBar → select a process area from dropdown → WorkplanSpine + ActivityPanel hide, artifact expands to full width. Process Inventory and Business Requirements filter to selected PA. Workshop mode persists across d-004-* navigation. Zustand store with session identity + locking model (local state, backend enforcement in W7). `Cmd+E` as power-user shortcut to exit. Brightness/contrast fix across all workspace components.

### W2 — Keyboard Capture System ✅ (Session 017)

CaptureBar component with command prefix parsing (`R` requirement, `N` step, `G` gap, `A` annotate). Global keyboard hook (`useWorkshopKeyboard`) focuses capture bar with prefix. Context-aware: G/A hidden on requirements, shown on flow. Agent proofreading on new requirements (mock cleanup → review card → Y accept / E edit / Esc discard).

### W3 — Live Requirements Editing ✅ (Session 017)

Click to select, double-click to edit text, badge click cycles tag/segment/status. Modified rows: amber dot. New rows: emerald border + slide animation. Workshop captures overlay base data via `capturedRequirements` Map. Inline edit modal for text field. CaptureBar embedded below filter bar in requirements context.

### W4 — Live Process Flow Editing ✅ (Session 017)

Double-click to edit node labels (recorded to store). `G` opens gap notes panel with textarea — notes stored alongside flag. `N` captures new steps to tray → "Place" button → click target node → Dagre relayout with edge splitting. `D`/Delete/Backspace deletes selected node (bridges edges). Dashed red border + "GAP" badge with notes below gap-flagged nodes.

### W5 — Agent Listening Mode (partial ✅ Session 017, enhanced ✅ Session 018)

**Done (Session 017):**
- Agent Insight panels on both requirements and process flow
- Requirements: selecting a row with `fit_gap` data shows agentic bridge + gap remediation as clickable `+R` chips. Click to capture as new requirement. Shows rating (A0–A3), autonomy level, ERP fit summary.
- Process flow: selecting a node with `gl_finding`/`agent_elicited` overlays shows clickable chips. Click → auto-flags gap with overlay text as notes. Leading practice nodes confirmed.

**Done (Session 018):**
- **Agentic Bridges panel** replaces per-node agent insight chips on process flow. PA-scoped — shows all requirements with `agentic_bridge` data for the current workshop PA. Collapsible (bottom-left), shows agentic rating badge (A0–A3), autonomy level, bridge description, and underlying requirement text.
- **Fit/gap data enrichment** across PA-02 (8 reqs), PA-03 (4 reqs), PA-09 (5 reqs), PA-13 (4 reqs) — each with SAP assessment, agentic rating, agentic bridge description, and autonomy level.

**Remaining:**
- Real-time suggestion generation (currently surfaces static mock data, not dynamic agent analysis)
- `Y` accept / `Esc` dismiss on suggestion chips
- Batched suggestion timing (every 10–15 seconds)
- Cross-PA reference detection
- `Cmd+K` command palette

### W6 — Micro-interactions (Session 018)

Workshop-specific animations that make the capture experience feel responsive:
- Node creation: spring animation (200ms) — node appears with slight bounce
- Connector draw: edge animates from source to target (250ms)
- Requirement capture: new row "ejects" into the requirements panel (350ms slide)
- Count badges: flip animation on increment (requirements count, gap count)
- Gap flag: amber pulse on flagged item (300ms)

All animations respect `prefers-reduced-motion`. Projector-friendly — no subtle gradients or low-contrast effects.

### W7 — Backend Persistence (Session 019)

API endpoints to save workshop state:
- `POST /api/v1/workshops/{engagement_id}/captures` — batch save all workshop changes
- `PATCH /api/v1/requirements/{requirement_id}` — update single requirement
- `POST /api/v1/requirements` — create new requirement
- `PATCH /api/v1/process-flows/{flow_id}/nodes` — update process nodes
- `POST /api/v1/process-flows/{flow_id}/nodes` — add new process node

Workshop changes are saved as a "workshop session" with:
- Timestamp, facilitator, attendees
- Before/after state for all modified items
- New items created during the session
- Agent suggestions accepted/dismissed

### W8 — Workshop Session Continuity (Session 019)

- Load previous workshop state when re-entering a workspace
- "Workshop history" panel showing past sessions with change summaries
- Agent context carries across workshops — knows what was discussed before
- Export workshop summary (what changed, new items, open gaps) as a leave-behind

---

## Stream A — Framework Expansion (Knowledge Workspaces)

10 highest-impact deliverables, one per uncovered workstream + key gaps:

| # | Deliverable | Workstream | Type | Status |
|---|-------------|------------|------|--------|
| A1 | d-001-03 RACI Matrix | WS-001 PM & Governance | Table | ✅ Done (015) |
| A2 | d-002-02 Scope Definition | WS-002 Business Case | Table | ✅ Done (015) |
| A3 | d-003-04 ERP Evaluation Summary | WS-003 ERP Selection | Table + scores | ✅ Done (015) |
| A9 | d-001-04 Risk & Issue Log | WS-001 PM & Governance | Table | ✅ Done (015) |
| A4 | d-005-02 Chart of Accounts Design | WS-005 COA & GL | Custom | 021 |
| A5 | d-006-01 Reporting Inventory | WS-006 Reporting | Table | 021 |
| A6 | d-007-04 Interface Inventory | WS-007 Data & Integration | Table | 021 |
| A7 | d-004-06 Process Gap Analysis | WS-004 Business Process | Table + fit/gap | 021 |
| A8 | d-005-04 ACDOCA Dimension Design | WS-005 COA & GL | Custom | 021 |
| A10 | d-006-03 Regulatory Reporting Map | WS-006 Reporting | Table | 021 |
| A11 | d-004-03b/c/d Process Flow Maps (3) | WS-004 Business Process | ProcessFlowMap | ✅ Done (018) |

**Build approach:** Most are AnnotatedTable with domain-specific mock data. No new component types needed. Define columns, write mock rows, add to MOCK_WORKSPACES.

---

## Stream B — Data Slice (GL Account Analysis End-to-End)

Deferred until after Workshop Mode. Get d-005-01 working with real data: upload GL → agent analyzes → workspace shows real results.

| Step | What | Session |
|------|------|---------|
| B1 | SSE streaming endpoint — convert `/api/chat` to SSE, `astream_events(version="v2")` | 021+ |
| B2 | GL data ingestion tool — `@tool ingest_gl_data(file_path)`, Excel/CSV → Polars → DuckDB | 021+ |
| B3 | Account profiling tool — `@tool profile_accounts()`, DuckDB queries, MJE detection | 021+ |
| B4 | Workspace wiring — Preflight CTA → POST with SSE, progressive row reveal | 021+ |
| B5 | Frontend SSE consumer — `@microsoft/fetch-event-source`, `ts-pattern` match, real agent state | 021+ |

**End state:** Upload Acme_TB_FY2025.xlsx → agent profiles 68 accounts → workspace shows real results with provenance.

---

## Stream C — Platform Polish

| Step | What | Session |
|------|------|---------|
| C1 | WorkplanSpine as left sidebar, breadcrumb nav, cross-deliverable linking | 020 |
| C2 | Landing page: workstream progress bars, recent activity feed, status badges | 020 |
| C3 | Loading states, error states, keyboard navigation | 020 |

---

## Current Coverage

| Workstream | Deliverables with Workspaces | Coverage |
|-----------|------------------------------|----------|
| WS-001 PM & Governance | d-001-03, d-001-04 | 2/5 |
| WS-002 Business Case | d-002-02 | 1/4 |
| WS-003 ERP Selection | d-003-04 | 1/5 |
| WS-004 Business Process | d-004-01, d-004-03, d-004-03b, d-004-03c, d-004-03d, d-004-04 | 6/5+ |
| WS-005 COA & GL | d-005-01, d-005-03 | 2/8 |
| WS-006 Reporting | — | 0/5 |
| WS-007 Data & Integration | — | 0/5 |
| **Total** | **12** | **12/35 (34%)** |

---

## Pursuit Phase (designed Session 015, build TBD)

Pre-engagement phase with its own deliverables. Sits upstream of the workplan — same app, same login, separate navigation.

**Route:** `/pursue/[pursuitId]` and `/pursue/[pursuitId]/[deliverableId]`

**Landing page:** Pursuits above engagements (Option A — landing page split).

**Scoping Canvas (P1):** Radial domain map with 7 transformation themes. Pulled up on screen during first executive meeting. Each theme captures scope signal, priority, pain points. Themes map to the 7 workstreams — scope flows into workplan on win.

**Pursuit deliverables:** Scoping Canvas, Executive Summary, Value Hypothesis, Proposal, RFP Response.

**Scoping questions** derived from existing `ProcessInventoryNode.scoping_questions` and `description` fields, elevated to executive language.

---

## Parked Items

- **d-004-03 index view:** Future State Process Maps needs a list/index of all sub-flows across all PAs (currently hardcoded to SP-02.1). Natural flow: Process Inventory → click sub-flow → lands on specific map. d-004-03 itself should show browsable index. Workshop PA filter would apply.

---

## What We're NOT Building Yet

- Supabase integration (Phase 2)
- Multi-agent handoff protocol
- Functional Consultant agent implementation
- Additional data tools beyond GL Account Analysis
- Pursuit phase implementation (designed, build after Workshop Mode milestone)
- Mobile / responsive design
- Auth beyond mock

---

## Key Files

### Frontend
- `web/src/lib/mock-data.ts` — types, workspace configs, workplan, PROCESS_AREAS
- `web/src/lib/mock-requirements.ts` — BR data (324 requirements)
- `web/src/lib/workshop-store.ts` — Zustand store for workshop mode + session + capture state
- `web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx` — workspace dispatch
- `web/src/components/workspace/WorkspaceShell.tsx` — workshop layout wrapper + keyboard shortcut
- `web/src/components/workspace/CaptureBar.tsx` — command input bar (R/N/G/A prefixes, agent review)
- `web/src/hooks/useWorkshopKeyboard.ts` — global keyboard handler for workshop mode
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
- Workshop mode: click Workshop button → select PA, verify layout change, `Cmd+E` to exit
- No regressions: existing workspaces still render correctly
