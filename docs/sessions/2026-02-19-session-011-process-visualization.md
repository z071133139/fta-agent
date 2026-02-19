# Session 011 — Process Visualization Design + CODEX Review Fixes

**Date:** 2026-02-19
**Focus:** Process visualization research and design; CODEX review fixes; research prompt for insurance process inventory
**Output:** React Flow plan, design doc, research prompt, CODEX fixes committed

---

## What Was Built

Nothing was built in this session (visualization build deferred to next session). The session produced:

- **CODEX fixes committed** — SQL injection fix in outcomes.py, user definition correction, master-plan CLI+web update, README entry point fix, design-principles wording clarified
- **Research prompt** at `docs/research/insurance-process-inventory-research-prompt.md` — for Claude Opus / GPT o3/o4 to generate the insurance-specific process inventory knowledge library
- **Process visualization design doc** at `docs/design/process-visualization.md` — full plan for React Flow implementation of Process Inventory and Future State Process Map
- **NEXT-STEPS.md updated** with visualization build as next planned item

---

## CODEX Review Findings — All Resolved

| Finding | Fix | File |
|---------|-----|------|
| SQL injection in PATCH endpoints | Parameterised queries (`?` placeholders) | `src/fta_agent/api/routes/outcomes.py` |
| Wrong user definition | Corrected to: users are consultants, not insurance finance team | `docs/design/mvp-agent-design.md` |
| Phase 1 scope (CLI-only) | Updated to CLI + web; web built Sessions 007-009 | `docs/plans/master-plan.md` |
| Wrong entry point in README | Fixed to `fta_agent.api.app:app` | `README.md` |
| Design principle conflict | Reworded to resolve apparent tension between "conversation-driven" and "not a chat interface" | `docs/vision/design-principles.md` |

---

## Visualization Research Findings

Deep research via general-purpose agent. Key conclusions:

**Library chosen: `@xyflow/react` (React Flow v12)**
- MIT license, ~1M weekly downloads, React-native custom nodes
- Full FTA design system components can render *inside* nodes (status badges, agent-state animations, confidence indicators)
- CSS variable theming — drops into the slate/dark palette
- Dagre auto-layout for agent-generated graphs
- Covers both use cases (inventory graph + flow map) from one dependency

**BPMN serialization approach** (if needed): Backend-only concern. Python serializes the `ProcessFlow` JSON schema to BPMN 2.0 XML using `lxml`. Frontend never changes. Defer until a client requires it.

**MCP for diagrams**: Nascent ecosystem, not the right integration layer for FTA. Agent outputs JSON via SSE pipeline; frontend renders. MCP reserved for future external tool integrations (SharePoint, Confluence).

---

## Process Visualization Design

Full plan in `docs/design/process-visualization.md`.

### Process Inventory (`d-004-01`)
- React Flow dependency graph, 10 nodes grouped by process area
- Custom card nodes with left-border scope status color coding
- Minimap, zoom controls, dark dot-grid background
- Click node → detail drawer (Framer Motion slide-in)
- Dagre TB auto-layout

### Future State Process Map (`d-004-03`)
- React Flow swimlane diagram, 3 lanes
- Custom node types: TaskNode, GatewayNode (diamond), StartEndNode, SwimlaneGroupNode
- Animated edges (flowing dashes)
- Overlay badges on nodes — amber dot with count
- Click overlaid node → overlay panel with GL finding source chip (emerald "↗ GL Analysis")
- Cross-agent connection demonstrated: 2 pre-loaded overlays from GL Design Coach findings

### Architecture
- `DeliverableWorkspace.graph?: ProcessGraphData` — if present, renders graph; if absent, existing AnnotatedTable path unchanged
- Discriminated union: `kind: "process_inventory" | "process_flow"`
- Python Pydantic models mirror TypeScript types exactly

---

## Insurance Process Inventory Research Prompt

Created at `docs/research/insurance-process-inventory-research-prompt.md`.

Use with Claude Opus 4.6 or GPT o3/o4. Structured to return:
1. Process area index (all finance processes for insurers)
2. Detailed inventory with segment applicability (P&C / Life / Reinsurance) and ERP notes
3. Segment-specific process footprints
4. Insurance-specific areas not in generic ERP libraries
5. Standard scoping questions per process area
6. Complexity and transformation risk matrix

Output feeds directly into the Process Inventory workspace knowledge library.

---

## Files Changed This Session

| File | Change |
|------|--------|
| `src/fta_agent/api/routes/outcomes.py` | SQL injection fix — parameterised queries |
| `docs/design/mvp-agent-design.md` | User definition corrected |
| `docs/plans/master-plan.md` | Phase 1 scope updated to CLI + web |
| `README.md` | Entry point corrected |
| `docs/vision/design-principles.md` | Principle 1 wording clarified |
| `docs/research/insurance-process-inventory-research-prompt.md` | Created — research prompt for process library |
| `docs/design/process-visualization.md` | Created — React Flow implementation plan |
| `docs/sessions/2026-02-19-session-011-process-visualization.md` | Created — this file |
| `NEXT-STEPS.md` | Updated with visualization build as next item |
| `docs/plans/v1-build-plan.md` | Updated with visualization note |

---

## Next Session — Build

1. `pnpm --filter web add @xyflow/react @dagrejs/dagre`
2. Add TypeScript types + 2 new mock workspaces to `mock-data.ts`
3. Build `ProcessInventoryGraph.tsx`
4. Build `ProcessFlowMap.tsx`
5. Add graph dispatch to workspace page
6. Add React Flow dark theme CSS overrides to `globals.css`
7. Add `src/fta_agent/data/process_flow.py` (Python Pydantic models)
8. `pnpm --filter web build` — verify clean
