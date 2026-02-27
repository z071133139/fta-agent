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
