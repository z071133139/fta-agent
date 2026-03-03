# FTA — Feature Specs & Session History

> Living reference for what's been built. Consult when modifying existing features.
> Updated each session when new features are built.

---

## Session Index

| Session | Focus | Stream | Items |
|---------|-------|--------|-------|
| **015** | Product plan docs + 4 knowledge workspaces | A | A1, A2, A3, A9 |
| **016** | Workshop layout toggle + brightness fix | W | W1 |
| **017** | CaptureBar + live req/flow editing + agent insights | W | W2, W3, W4, W5 (partial) |
| **018** | 3 new process flows + fit/gap data + Agentic Bridges panel | A+W | A11, W5 (enhanced) |
| **019** | Complete Workshop Mode — W5-W8 | W | W5, W6, W7, W8 |
| **020** | Scoping Canvas polish — contextual enhancements + tone overhaul + Rapid/Deep mode | P | P1 enhancements |
| **021** | Stream B pivot — agentic capabilities (B1–B8) | B | B1+ |
| **024** | PDD-006: COA Design Workbench (d-005-02) | B | COA workbench, mock backend COA response |
| **025** | PDD-007: Custom Process Flow Builder | B | FC agent, emit_process_flow tool, split-view builder, flow-builder-store |
| **026** | PDD-008 color pass, PDD-009 data gates, PDD-010 mission control | B+C | Color readability, workstream data gates, landing page rewrite, presence pips, DuckDB fix |
| **027** | Slide deck content, Phase 1 gap analysis, COA visual research, dynamic hierarchy design | — | `docs/content/fta-slide-deck-content.md` (16+1 slides, old/new/value format), Phase 1 outstanding items audit, insurance COA visualization research (6 formats), dynamic hierarchy architecture (three-tier classification: rule/pattern/agent-pinned, audit trail, reproducibility hash, multi-perspective FSLI roll-ups) |

**Milestone (Session 019):** Workshop Mode fully operational — consultant can run a live business process workshop with FTA on the projector, capturing requirements and process changes in real-time against the leading practice baseline. Persistence via localStorage, session resume, history panel, export JSON.

**Milestone (Session 020):** Scoping Canvas polished with contextual enhancements (hub crossfade, dependency highlighting, progress rings, parallax tilt, tunnel vision, glassmorphism), full design tone overhaul to enterprise-grade monochrome aesthetic, and Rapid 12 / Deep Dive scoping mode with auto-computed hypothesis panel.

---

## Stream W — Workshop Mode (Sessions 016–019)

The differentiator. Live capture against the leading practice baseline during client workshops. The consultant pulls up the workspace on the projector — process flows and requirements are pre-loaded. The client team reacts to what exists.

**Key principle:** Most common action is modification/annotation of existing content, not creation from scratch.

### W1 — Workshop Layout Toggle (Session 016)

PA-scoped workshop mode. Click "Workshop" button in TopBar → select a process area from dropdown → WorkplanSpine + ActivityPanel hide, artifact expands to full width. Process Inventory and Business Requirements filter to selected PA. Workshop mode persists across d-004-* navigation. Zustand store with session identity + locking model (local state, backend enforcement in W7). `Cmd+E` as power-user shortcut to exit. Brightness/contrast fix across all workspace components.

### W2 — Keyboard Capture System (Session 017)

CaptureBar component with command prefix parsing (`R` requirement, `N` step, `G` gap, `A` annotate). Global keyboard hook (`useWorkshopKeyboard`) focuses capture bar with prefix. Context-aware: G/A hidden on requirements, shown on flow. Agent proofreading on new requirements (mock cleanup → review card → Y accept / E edit / Esc discard).

### W3 — Live Requirements Editing (Session 017)

Click to select, double-click to edit text, badge click cycles tag/segment/status. Modified rows: amber dot. New rows: emerald border + slide animation. Workshop captures overlay base data via `capturedRequirements` Map. Inline edit modal for text field. CaptureBar embedded below filter bar in requirements context.

### W4 — Live Process Flow Editing (Session 017)

Double-click to edit node labels (recorded to store). `G` opens gap notes panel with textarea — notes stored alongside flag. `N` captures new steps to tray → "Place" button → click target node → Dagre relayout with edge splitting. `D`/Delete/Backspace deletes selected node (bridges edges). Dashed red border + "GAP" badge with notes below gap-flagged nodes.

### W5 — Agent Listening Mode (Sessions 017–019)

**Session 017:**
- Agent Insight panels on both requirements and process flow
- Requirements: selecting a row with `fit_gap` data shows agentic bridge + gap remediation as clickable `+R` chips. Click to capture as new requirement. Shows rating (A0–A3), autonomy level, ERP fit summary.
- Process flow: selecting a node with `gl_finding`/`agent_elicited` overlays shows clickable chips. Click → auto-flags gap with overlay text as notes. Leading practice nodes confirmed.

**Session 018:**
- **Agentic Bridges panel** replaces per-node agent insight chips on process flow. PA-scoped — shows all requirements with `agentic_bridge` data for the current workshop PA. Collapsible (bottom-left), shows agentic rating badge (A0–A3), autonomy level, bridge description, and underlying requirement text.
- **Fit/gap data enrichment** across PA-02 (8 reqs), PA-03 (4 reqs), PA-09 (5 reqs), PA-13 (4 reqs) — each with SAP assessment, agentic rating, agentic bridge description, and autonomy level.

**Session 019:**
- `Y` accept / `Esc` dismiss on both requirements insight panel and Agentic Bridges panel
- Arrow key navigation in Agentic Bridges panel with focused item purple ring highlight
- Cross-PA reference detection: cyan chips (`→ PA-05`) shown in workshop mode
- `Cmd+K` command palette: centered modal, fuzzy search, arrow nav, Enter execute, Esc close. Commands: New Requirement, New Step, Flag Gap, Annotate, End Workshop, Export Summary, Fit to View
- Hint labels on suggestion chips (`Y accept · click to capture`)

**Remaining for later:**
- Real-time suggestion generation (currently surfaces static mock data, not dynamic agent analysis)
- Batched suggestion timing (every 10–15 seconds)

### W6 — Micro-interactions (Session 019)

- CSS keyframes: `gap-pulse` (red box-shadow 300ms), `badge-flip` (Y-scale flip 250ms), `node-spring-in` (scale bounce 200ms)
- `@media (prefers-reduced-motion: reduce)` nullifies `.workshop-animate` class
- Node creation: workshop-placed nodes (ID `WN-*`) get spring animation via CSS
- Count badges: flip animation on increment in both CaptureBar and SummaryBar
- Gap flag: red box-shadow pulse on newly flagged nodes

### W7 — Browser Persistence (Session 019)

localStorage-based persistence (migrates to Supabase when Stream B forces API wiring):
- Key `fta-workshop-{engagementId}-{paId}` → full serialized session state
- Key `fta-workshop-sessions-index` → array of session summaries
- Serialize: Map→entries, Set→array. Deserialize: reverse.
- Auto-save: Zustand `subscribe` with 500ms debounce
- `startWorkshop` accepts `{ resume: true }` → hydrates from localStorage
- `endWorkshop` saves final state + session summary, then clears memory
- `reqSeq`/`nodeSeq` counters persisted and restored on resume

### W8 — Workshop Session Continuity (Session 019)

- **Session resume UX**: PA picker shows previous sessions with relative time, quick stats, Resume/New buttons. Direct-PA workspaces show Resume/New when previous session exists.
- **Workshop history panel**: Right slide-out (360px), reads from session index. Each card: PA name, date range, stats (new reqs, modified, nodes, gaps, deleted). Amber left border on most recent. Export button per session.
- **Export workshop summary**: JSON download (`workshop-{paId}-{date}.json`) with metadata, all changes, and statistics. Triggered from history panel and Cmd+K palette.

---

## Pursuit Phase — Scoping Canvas (Sessions 019–020)

Pre-engagement phase with its own deliverables. Sits upstream of the workplan — same app, same login, separate navigation.

**Route:** `/pursue/[pursuitId]` and `/pursue/[pursuitId]/[deliverableId]`

**Landing page:** Pursuits above engagements (Option A — landing page split).

**Scoping Canvas (P1):** Built. Orbital layout with 7 themes + context tile. Hub crossfade shows executive question on hover. Dependency highlighting, progress rings, parallax tilt, tunnel vision on hover. Enterprise monochrome tone — grayscale emojis, slate palette, font-mono throughout. ThemePanel with glassmorphism, scope signals, priority, pain level, per-question capture. Keyboard-first (Tab/Enter/0-7/Esc). Export to JSON. Full Zustand store with localStorage persistence. **Rapid 12 / Deep Dive mode** — two-mode question system: rapid surfaces 12 curated executive questions for first meetings, deep dive shows full 80+ set. Auto-computed rapid hypothesis panel with theme scoring and Meeting 2 Agenda generation.

**Pursuit deliverables:** Scoping Canvas (done), Executive Summary, Value Hypothesis, Proposal, RFP Response.

**Scoping questions** derived from existing `ProcessInventoryNode.scoping_questions` and `description` fields, elevated to executive language.

---

## Stream C — Platform Polish (not started)

| Step | What |
|------|------|
| C1 | WorkplanSpine as left sidebar, breadcrumb nav, cross-deliverable linking |
| C2 | Landing page: workstream progress bars, recent activity feed, status badges |
| C3 | Loading states, error states, keyboard navigation |

---

## Stream E — Current State Extraction (designed Session 019, build TBD)

Ingest client data (SAP config, transaction logs, close checklists, process documents) → structured evidence that enriches existing workspaces. **Full plan:** `docs/plans/current-state-extraction-plan.md`

| Step | What | Dependencies |
|------|------|-------------|
| E1+E2 | Type extensions + mock extraction data + evidence UI (badges, coverage lens, detail panel) | None — mock data |
| E3 | Workshop Validation Mode (C/D keys, validation tracking, evidence-backed suggestions) | E1+E2 |
| E4+E5 | Config extraction backend (CSV→DuckDB) + behavioral extraction (log analysis) — no LLM | DataEngine |
| E6 | Document ingestion (LLM-powered, Claude API) + conversational extraction flow | E4+E5, SSE |

**Design principles:** No standalone CLI (agent capability inside FTA). No YAML intermediate (DuckDB via DataEngine). No parallel hierarchy (extend existing types with `evidence?` fields). Mock first, extract later. Workshop gains Validation Mode (confirm/dispute, not just capture).

---

## Stream A — Framework Expansion (Knowledge Workspaces)

| # | Deliverable | Workstream | Type | Status |
|---|-------------|------------|------|--------|
| A1 | d-001-03 RACI Matrix | WS-001 PM & Governance | Table | Done (015) |
| A2 | d-002-02 Scope Definition | WS-002 Business Case | Table | Done (015) |
| A3 | d-003-04 ERP Evaluation Summary | WS-003 ERP Selection | Table + scores | Done (015) |
| A9 | d-001-04 Risk & Issue Log | WS-001 PM & Governance | Table | Done (015) |
| A11 | d-004-03b/c/d Process Flow Maps (3) | WS-004 Business Process | ProcessFlowMap | Done (018) |
| A4 | d-005-02 Chart of Accounts Design | WS-005 COA & GL | COADesignWorkbench | Done (024) |
| A5 | d-006-01 Reporting Inventory | WS-006 Reporting | Table | Done (020) |
| A6 | d-007-04 Interface Inventory | WS-007 Data & Integration | Table | Deferred |
| A7 | d-004-06 Process Gap Analysis | WS-004 Business Process | Table + fit/gap | Deferred |
| A8 | d-005-04 ACDOCA Dimension Design | WS-005 COA & GL | Custom | Deferred |
| A10 | d-006-03 Regulatory Reporting Map | WS-006 Reporting | Table | Deferred |

**Build approach:** Most are AnnotatedTable with domain-specific mock data. No new component types needed. Define columns, write mock rows, add to MOCK_WORKSPACES.

---

## PDD-006 — COA Design Workbench (Session 024)

Replaces the markdown report for d-005-02 with a persistent, editable tabbed workbench seeded by structured agent output. Establishes the "living document" pattern for GL Design Coach deliverables.

### Agent Output Contract

Agent produces narrative summary + structured JSON in `<coa_design>` XML tags. Parser: `parseCOAOutput()` in `coa-store.ts` — regex extracts JSON, validates 4 required arrays. Fallback: if parse fails, shows CompletedAnalysisView with raw markdown.

### Store: `coa-store.ts`

Zustand + localStorage (`fta-coa-store`). 4 domain types: `COACodeBlock`, `COAAccountGroup`, `COADimension`, `COADecision`. Map-based CRUD for all domains. `seedFromAgent(key, data)` hydrates from parsed JSON. Per-tab chat history. `seededAt`/`modifiedAt` timestamps. Key format: `{engagementId}:{deliverableId}`.

### Component: `COADesignWorkbench.tsx`

- **4 tabs:** Code Blocks, Account Groups, Dimensions, Decisions
- **Inline editing:** Click cell → input replaces content, Enter saves, Esc cancels
- **Decision cards:** Card layout (not table) with amber/emerald/red status borders, approve/reject buttons, consultant notes textarea, reset to pending
- **Decisions badge:** Amber count badge on tab when decisions are pending
- **Agent summary banner:** Collapsible, shows narrative summary + seeded/modified dates
- **Chat panel:** Collapsible right sidebar (40px rail → 280px), per-tab message history, mock responses (backend wiring for future)
- **Re-seed:** Confirmation dialog, clears store, re-runs agent
- **Add Row:** Available on Code Blocks, Account Groups, Dimensions tabs

### Routing (page.tsx, d-005-02 only)

```
coaSeeded → COADesignWorkbench (persistent, editable)
analysisRunning → LiveAgentWorkspace (streams, onComplete seeds COA store)
cachedAnalysis → CompletedAnalysisView (fallback if JSON parse failed)
else → DataAnalysisPreflight (first visit)
```

### Hydration Fix

Zustand persist stores hydrate async from localStorage. Added `storesHydrated` flag (false during SSR, true after useEffect mount). All persisted store conditionals use guarded values (`effectiveCachedAnalysis`, `effectiveCoaSeeded`) to prevent SSR/client mismatch.

### Mock Backend

`stream.py` updated with d-005-02 specific mock response (`_MOCK_RESPONSE_COA_DESIGN`) containing full `<coa_design>` JSON block. Variant detection based on prompt content keywords. Set `FTA_MOCK_AGENT=true` in `.env` to use.

---

## PDD-007 — Custom Process Flow Builder (Session 025)

NLP-driven process flow creation from the Process Flow Index. Split-view workspace: chat with the Functional Consultant agent on the left, live ProcessFlowMap preview on the right. The agent asks about PA, roles, steps, gateways; progressively builds structured swimlane flows via `emit_process_flow` tool calls.

### Entry Point

"+ New Process Flow" button on ProcessFlowIndex (d-004-03). Opens ProcessFlowBuilder as overlay replacing the index. "Continue Building Flow" label when an active session exists.

### Split-View Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  ← Process Flow Index    New Process Flow  [Mock/Live] [Accept] [Discard]  │
├──────────────────────────┬─────────────────────────────────────────┤
│  CHAT (w-[440px])        │  PREVIEW (flex-1)                      │
│  Agent/user messages     │  ProcessFlowMap (read-only)             │
│  "Flow updated" badges   │  Updates on each emit_process_flow     │
│  Thinking indicator      │  Empty state before first tool call    │
│  Input area (Enter send) │  Zoom/pan controls                     │
└──────────────────────────┴─────────────────────────────────────────┘
```

### Agent-to-UI Contract

The `emit_process_flow` tool produces validated `ProcessFlowData` JSON via Pydantic schema. Arrives as a `tool_call` SSE event with `status: "completed"` and `output_preview` containing the full JSON. Frontend parses and renders in `<ProcessFlowMap>`.

**ToolMessage fix:** LangChain wraps tool output in `ToolMessage`. The stream endpoint extracts `.content` before stringifying to ensure clean JSON arrives on frontend.

### Store: `flow-builder-store.ts`

Zustand + localStorage (`fta-flow-builder`). Two separate data structures:
- **`sessions`**: active building session per engagement (cleared on accept/discard)
- **`acceptedFlows`**: completed flows per engagement (accumulate, shown in index)

`acceptFlow()` moves `currentFlow` to `acceptedFlows` and deletes the active session.

### Agent Client Extensions

`agent-client.ts` extended with `StreamOptions`:
- `history`: conversation history for multi-turn (sent in POST body)
- `onToolCall(tool, output)`: callback on completed tool_call events
- `mockMode`: per-request mock override (Mock/Live toggle button)

### Mock Backend

`stream.py` includes `_stream_mock_fc()` — multi-turn mock for Functional Consultant:
- Turn 1 (< 2 messages in history): clarifying questions about PA, roles, thresholds
- Turn 2+: emits `_FC_MOCK_FLOW` (GL Coding Block Correction, 3 swimlanes, 8 steps, 1 gateway, 2 overlays) + explanation

### Backend Agent

`functional_consultant.py` — tool-calling LangGraph graph:
- Loads system prompt from `prompts/functional_consultant_flow.md`
- Binds `emit_process_flow` tool to LLM
- Conditional edges: `has_tool_calls → tools → agent` loop, else `END`
- Reconstructs full conversation history from `StreamRequest.history`

### Accept + Index Integration

- "Accept Flow" button → `acceptFlow(engId)` → flow moves to `acceptedFlows`, session deleted
- ProcessFlowIndex reads `acceptedFlows[engId]` and renders custom flows with "Custom" badge
- Click custom flow → opens builder (future: could open ProcessFlowMap directly)
- "Discard" button → session cleared, return to index

### Session Lifecycle

Fresh start on every builder open (`initialized` flag forces `clearSession + startSession`). Session persistence via localStorage for mid-conversation navigation. Accept clears session and persists flow. Discard clears everything.

---

## PDD-008 — Color Readability Overhaul (Session 026)

Systematic pass across all workspace components to fix color readability issues. Replaced `text-[9px]` with `text-[10px]`, swapped hardcoded `blue-400/500` tokens with `accent` CSS variable, increased contrast on muted text in dark theme. Applied to: AgentChatInput, AnnotatedTable, BusinessRequirementsTable, COADesignWorkbench, CompletedAnalysisView, InlineReportPanel, PreflightScreen, ProcessFlowBuilder, ProcessFlowIndex, ProcessFlowMap, WorkplanSpine, WorkspaceTopBar, BuilderChatPanel, FlowEdgeLayer, FlowNodeLayer, DataAnalysisPreflight.

---

## PDD-009 — Workstream-Level Data Gates (Session 026)

Moved data upload from engagement dashboard to workstream-level landing pages with declarative per-workstream data requirements.

### Config

`web/src/lib/workstream-data-config.ts` — static registry of `WorkstreamDataRequirements`. Each workstream declares required file types (e.g. ws-005 needs `trial_balance` + `coa_extract`), with labels, descriptions, and which deliverables each file unlocks.

### Store Extensions

`web/src/lib/data-store.ts` extended with:
- `getWorkstreamFiles(engId, wsId)` — files matching a workstream's required types
- `hasRequiredData(engId, wsId)` — true if all required types present

### Workstream Gate Page

Route: `/[engId]/workstreams/[wsId]`. Renders `WorkstreamDataPanel` with:
- Header (workstream name + agent label)
- Requirement cards (one per file type): status pip, description, upload zone or file card with Preview/Remove, "required for" deliverable list
- Deliverable readiness table: each deliverable shows required types, ready/missing status, clickable to navigate

### DataPreviewTable Enhancement

Added "Columns" tab as default showing all 29 trial balance columns (name, SQL type, nullable, sample value). Tabs: Columns | Postings | Accounts.

### WorkplanSpine Integration

Workstream headers with data requirements show readiness pip (emerald=complete, amber=partial). Hover reveals navigate arrow to workstream gate page.

### DataAnalysisPreflight Update

"No data" state now shows required type badges and routes to `/[engId]/workstreams/[wsId]` instead of dashboard.

### Dashboard Replacement

`WorkstreamDataSummary` replaces `DataSourcesPanel` on the engagement dashboard — compact one-row-per-workstream summary with navigate arrows.

---

## PDD-010 — Mission Control Landing Page (Session 026)

Replaced the engagement cards + agent team grid + workplan panel landing page with a single-screen mission control view.

### Context Selector

`web/src/components/landing/ContextSelector.tsx` — unified dropdown listing engagements AND pursuits as peers. Grouped by type with section headers (ENGAGEMENTS / PURSUITS). Shows selected item name, metadata line, phase dot. Stats bar for engagement mode (stat boxes + progress bar). Pursuit summary for pursuit mode.

### Content Adapts to Selection Type

- **Engagement selected:** Attention queue (collapsed by default, expandable) + full workplan with presence pips
- **Pursuit selected:** Pursuit deliverable list with status pips
- **No selection:** Card picker showing both engagements and pursuits as clickable cards

### Attention Queue

`web/src/components/landing/AttentionQueue.tsx` — collapsed single-line bar showing count + truncated item names. Expands to show blocked/review items with presence pips and resolve/review CTAs. Replaced the old "Needs Your Input" banner inside WorkplanPanel.

### Presence Model

`ConsultantPresence` type on `Engagement`: `consultant_id`, `deliverable_id`, `last_seen`, `is_active`. Mock data: SK on d-005-02 (2h ago), TR on d-001-03 (20m ago, active), PM idle (2d ago).

Presence appears as avatar pips on:
- Attention queue items (with relative time)
- WorkplanPanel workstream headers (aggregated from deliverables within)
- WorkplanPanel deliverable rows (individual)

### Engagement Dashboard Kill

`/[engId]` now redirects to `/?eng=[engId]`. No more standalone engagement dashboard page.

### Persistence

`localStorage` stores selected context (ID + kind). Query params `?eng=` and `?pursuit=` override localStorage for direct links.

---

## Backend Fix — DuckDB Table Registration (Session 026)

`DataEngine.load_polars()` changed from `conn.register()` (replacement scan, Arrow reference can be garbage collected) to `CREATE TABLE AS SELECT * FROM _tmp` (persistent in-memory table). Fixes "column not found" errors in `generate_income_statement` and other tools that JOIN `account_master`.
