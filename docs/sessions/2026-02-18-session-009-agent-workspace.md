# Session 009: Agent Workspace

**Date:** 2026-02-18
**Phase:** Development — Iteration 1.5 (Agent Harness / AI-Native Frontend)
**Participants:** Product owner + Claude Code

---

## Session Context

Sessions 007 and 008 built the landing page and workplan panel. The natural next step was the core product experience: what happens when a consultant clicks into a deliverable? This session built the agent workspace — the screen where agents do their work and consultants review, steer, and confirm.

The workspace design reflects two distinct agent value models:
- **Data-grounded** (GL Design Coach): findings derived from client data — factual, evidence-based, each row has a provenance
- **Knowledge-grounded** (Functional Consultant): output starts from a leading practice library, adapted to engagement context

---

## What Was Built

### Route Structure

New route group: `/[engagementId]/deliverables/[deliverableId]`

- Deliverable-centric routing — the deliverable is what gets built, not the agent
- Separate layout at `web/src/app/[engagementId]/layout.tsx` (independent of old `(workspace)` route group)
- `export const dynamic` not needed — client component handles params via `useParams()`

### Layout Shell

Three-panel layout: WorkplanSpine (left, collapsible) | artifact area (flex-1) | ActivityPanel (right, collapsed by default)

The top bar (`WorkspaceTopBar`) is a client component that uses `useParams()` to resolve the full breadcrumb: `← Client / Workstream / Deliverable`. Agent name + pulsing status dot at the far right.

### Components Built

**WorkplanSpine** (`/components/workspace/WorkplanSpine.tsx`):
- 240px → 48px icon rail on collapse
- Workstreams listed with expand/collapse; auto-expands the workstream containing the current deliverable
- Active deliverable: `bg-accent/10 border-l-2 border-l-accent text-accent`
- Status dot per deliverable (reuses WorkplanPanel conventions)
- Click navigates: `router.push(/${engagementId}/deliverables/${deliverableId})`
- "‹" collapse / "›" expand toggle at top

**PreflightScreen** (`/components/workspace/PreflightScreen.tsx`):
- Two variants, controlled by `agent_kind` in workspace data:
  - Data-grounded: "Ready to analyze your data." + data source label
  - Knowledge-grounded: "Pre-populated from leading practice library." + `Leading Practice · [erp_target]` badge
- CTA label: "Start Analysis" (data) / "Review Library" (knowledge)
- On click: transitions run_state to `running` → then to `complete` (1.2s simulated)

**InsightCards** (`/components/workspace/InsightCards.tsx`):
- Four semantic kinds: `finding` (amber), `risk` (red), `compliant` (green), `info` (blue)
- Rendered above the artifact table for data-grounded agents only
- Knowledge-grounded agents show a "Library source" badge instead

**AnnotatedTable** (`/components/workspace/AnnotatedTable.tsx`):
- Configurable columns per workspace
- Rows mount with 20ms stagger delay (simulates progressive build)
- `needs_attention` rows: `border-l-2 border-l-warning/50`
- Flags column: renders `row.flags` array as amber pill badges
- Status column: colored badge (Mapped = green, Needs input = amber)
- Hover → provenance detail sub-row expands below the row (font-mono, muted — not a tooltip overlay)
- Interrupt support: hides rows after `insert_after_row_id` until resolved

**InlineInterrupt** (`/components/workspace/InlineInterrupt.tsx`):
- Renders between table rows at `insert_after_row_id` via a `<td colSpan>` slot
- `border border-warning/40 bg-warning/5 rounded-xl`
- Shows: context paragraph, lettered option list, action buttons, free-text override input
- On option click or send: collapses to a one-line resolved summary with ✓
- Parent reveals hidden rows after resolution (via `interruptResolved` prop)

**AgentChatInput** (`/components/workspace/AgentChatInput.tsx`):
- Persistent at the bottom of the artifact area
- Auto-expanding textarea (up to 120px)
- Context-aware placeholder:
  - Active: "Steer the agent — redirect, add context, or ask it to reconsider…"
  - Complete: "Ask [Agent Name] about this analysis…"
- Enter submits; Shift+Enter = newline
- Messages rendered in local history above input (mock — no API yet)

**ActivityPanel** (`/components/workspace/ActivityPanel.tsx`):
- Collapsed by default (10px right rail with vertical "Activity" label)
- Expands to 224px
- Step states: complete (✓, duration), active (blue pulse), pending (dimmed)
- Consultant-readable labels, not developer trace JSON
- Duration shown in seconds for completed steps

### Mock Data — DeliverableWorkspace

Three workspace fixtures added to `web/src/lib/mock-data.ts`:

| ID | Deliverable | Agent | State |
|----|-------------|-------|-------|
| `d-005-01` | Account Analysis Report | GL Design Coach | complete |
| `d-005-03` | Account Mapping: Legacy → New COA | GL Design Coach | awaiting_input |
| `d-004-04` | Business Requirements by Process | Functional Consultant | preflight |

`d-005-01`: 10 rows with provenance, 4 insight cards, 6 completed activity entries with durations.

`d-005-03`: 8 rows, inline interrupt after row 8 ("Account 2340 carries both ceded and assumed flows — split or use posting key differentiation?"), 2 complete + 1 active activity entry.

`d-004-04`: preflight-only (knowledge-grounded), no rows yet, 3 pending activity steps.

### WorkplanPanel — CTA Wiring

All CTA buttons in `WorkplanPanel.tsx` and `NeedsInputBanner` now navigate:
- View → / Open → / Review → / Resolve → all `router.push(/${engagementId}/deliverables/${deliverableId})`

---

## Design Decisions

**Provenance as detail sub-row, not tooltip overlay:** Initial implementation used `position: absolute` on a `<td>`, which doesn't work reliably in table context and caused visual overlap. Replaced with a full-width detail row (`<tr colSpan>`) that expands below the hovered row. Cleaner, no z-index issues.

**Page as client component:** The deliverable page uses `useParams()` rather than async server component params. Simpler for the current mock-data architecture. Will move to server component + TanStack Query when the API is wired.

**Segment/ERP agnosticism enforced:** No P&C or SAP strings hardcoded in UI components. All content (bullets, data source labels, agent names, deliverable names) comes from mock data. "Leading Practice · [ERP target]" reads from `engagement.erp_target`.

---

## Files Changed

| File | Change |
|------|--------|
| `web/src/lib/mock-data.ts` | Added `AgentRunState`, `AgentKind`, `InsightCard`, `ArtifactColumn`, `ArtifactRow`, `InlineInterruptData`, `ActivityEntry`, `DeliverableWorkspace` types; `MOCK_WORKSPACES` constant with 3 fixtures |
| `web/src/app/[engagementId]/layout.tsx` | New — engagement layout shell: WorkspaceTopBar + WorkplanSpine + children |
| `web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx` | New — workspace page: dispatches preflight vs. artifact view, manages run state |
| `web/src/components/workspace/WorkspaceTopBar.tsx` | New — breadcrumb + agent status |
| `web/src/components/workspace/WorkplanSpine.tsx` | New — collapsible left rail |
| `web/src/components/workspace/PreflightScreen.tsx` | New — data-grounded vs. knowledge-grounded variants |
| `web/src/components/workspace/InsightCards.tsx` | New — finding/risk/compliant/info cards |
| `web/src/components/workspace/AnnotatedTable.tsx` | New — staggered table with provenance sub-rows + interrupt slot |
| `web/src/components/workspace/InlineInterrupt.tsx` | New — amber decision card embedded in table |
| `web/src/components/workspace/AgentChatInput.tsx` | New — persistent bottom input with local history |
| `web/src/components/workspace/ActivityPanel.tsx` | New — collapsible right rail with step log |
| `web/src/components/WorkplanPanel.tsx` | Wired all CTA buttons + NeedsInputBanner to `router.push` |

---

## Test Results

- `pnpm --filter web build` clean — no TypeScript errors
- Manual verification: all 10 workspace verification steps from the plan pass

---

## Open Items

None from this session.

---

## Next Session Priorities

1. **Iteration 1.5A (backend)** — This is the critical path. Extended `AgentState`, LLM-based intent router, `capture_decision` / `capture_finding` / `capture_requirement` tools, agent self-introduction with engagement context. Nothing in the frontend has API calls yet — that gap grows with every frontend session.
2. **SSE streaming to workspace** — Once the backend agents stream output, wire the workspace artifact area to receive it. The `AnnotatedTable` is already designed for progressive row reveal. Replace mock `run_state` with real SSE event types (`token`, `tool_call`, `interrupt`, `complete`).
3. **Preflight → real agent run** — The "Start Analysis" / "Review Library" CTA currently simulates a 1.2s transition. Wire it to `POST /api/v1/agents/{agent_id}/run` with SSE response.
4. **WorkplanSpine persistence** — Scope changes in `WorkplanPanel` are still local state. Wire to the Consulting Agent's workplan management tools once 1.5C is built.
