# Process Visualization Design

> Created: Session 011 (2026-02-19)
> Status: Design complete — ready to build next session

---

## Overview

Two workspace visualization types for the Business Process Design workstream. Both use `@xyflow/react` (React Flow v12, MIT) with `@dagrejs/dagre` for auto-layout.

The existing workspace shell (WorkplanSpine, TopBar, ActivityPanel, AgentChatInput) is unchanged. The new visualizations replace the `AnnotatedTable` in the artifact area for graph-based deliverables.

---

## Architecture

### Dispatch pattern

`DeliverableWorkspace` gets one new optional field:

```typescript
graph?: ProcessGraphData;
```

If `graph` is present, the workspace page renders the graph component. If absent, the existing `AnnotatedTable` path runs. Discriminated union on `kind`:

```typescript
type ProcessGraphData = ProcessFlowData | ProcessInventoryData;
// ProcessFlowData: kind = "process_flow"
// ProcessInventoryData: kind = "process_inventory"
```

### Data schema

```typescript
// Shared
type ProcessNodeType = "task" | "gateway_exclusive" | "gateway_parallel" | "start" | "end" | "subprocess";
type ProcessScopeStatus = "in_scope" | "out_of_scope" | "in_progress" | "complete" | "deferred";
type ProcessOverlayKind = "constraint" | "requirement" | "exception" | "risk";

interface ProcessOverlay {
  id: string;
  node_id: string;
  kind: ProcessOverlayKind;
  text: string;
  source: "agent_elicited" | "gl_finding" | "consultant";
}

// Process Inventory
interface ProcessInventoryNode {
  id: string;
  name: string;
  scope_status: ProcessScopeStatus;
  owner_agent?: string;
  sub_flow_count: number;
  process_area?: string;   // for grouping: "Core Finance" | "Insurance-Specific"
  description?: string;
}

interface ProcessInventoryData {
  kind: "process_inventory";
  nodes: ProcessInventoryNode[];
  edges: ProcessInventoryEdge[];
}

// Process Flow Map
interface ProcessFlowNode {
  id: string;
  type: ProcessNodeType;
  label: string;
  role?: string;           // swimlane assignment
  system?: string;         // "SAP S/4HANA", "Workiva", etc.
  status?: "leading_practice" | "client_overlay" | "gap";
}

interface ProcessFlowData {
  kind: "process_flow";
  name: string;
  swimlanes?: string[];
  nodes: ProcessFlowNode[];
  edges: ProcessFlowEdge[];
  overlays: ProcessOverlay[];
}
```

---

## Visualization 1: Process Inventory Graph

**Deliverable:** `d-004-01` — Process Inventory
**Component:** `web/src/components/workspace/ProcessInventoryGraph.tsx`

### Visual design

Nodes are cards grouped by `process_area`. React Flow parent node pattern — each process area is a semi-transparent group container with a small label. Edges show dependencies between processes.

```
┌── Core Finance ──────────────────────────────────────────────────┐
│                                                                   │
│  [● R2R ✓]     [● P2P ✓]     [● Financial Close ✓]              │
│                                      ↑         ↑                 │
│  [○ FP&A]      [○ Treasury]  [○ Fixed Assets]                    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌── Insurance-Specific ────────────────────────────────────────────┐
│                                                                   │
│  [⟳ Claims Finance]  [⟳ Reinsurance Accounting]                  │
│                                                                   │
│  [○ Regulatory Reporting] ←── depends on Financial Close        │
│  [– Tax (deferred)]                                              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### ProcessCardNode

Left border stripe + status indicator by `scope_status`:

| Status | Border | Dot | Treatment |
|--------|--------|-----|-----------|
| `complete` | `border-l-success` | emerald static | normal |
| `in_progress` | `border-l-accent` | blue `.agent-thinking` pulse | normal |
| `in_scope` | `border-l-border` | slate static | normal |
| `deferred` | `border-l-muted` | muted static | `opacity-50` |
| `out_of_scope` | `border-l-muted` | muted static | `opacity-40` + `line-through` name |

Sub-flow count badge top-right: `bg-surface-alt text-muted text-[9px] rounded px-1.5`

Click node → detail drawer slides in from right (Framer Motion `x: 240 → 0`). Shows: description, sub-flow list, any GL finding links.

### React Flow config

```
nodesDraggable={false}
nodesConnectable={false}
elementsSelectable={true}
fitView={true}, minZoom={0.3}, maxZoom={1.5}
Background: dots, gap=24, size=1, color=#334155
MiniMap: bottom-right, node color by scope status
Controls: zoom/fit only
```

### Layout

Dagre TB. Node size 220×80px. Ranksep 70, nodesep 30. Groups sized to contain children with 24px padding.

---

## Visualization 2: Future State Process Map

**Deliverable:** `d-004-03` — Future State Process Maps
**Component:** `web/src/components/workspace/ProcessFlowMap.tsx`

### Visual design

Swimlane layout. Each lane is a horizontal group node. Nodes are placed within their lane by role assignment.

```
┌── GL Accountant ─────────────────────────────────────────────────────────────┐
│   [●]  →  [Initiate JE]  →  [Review for Completeness]  →  [◇ Approval?]    │
└──────────────────────────────────────────────────────────────────────────────┘
                                                               │ Yes
┌── Finance Controller ────────────────────────────────────────│───────────────┐
│                                             [Finance Controller Review ⚠]  │
│                                                (GL finding: JSMITH 91% risk)│
└──────────────────────────────────────────────────────────────│───────────────┘
                                                               ↓
┌── SAP S/4HANA ───────────────────────────────────────────────────────────────┐
│                                           [Post to ACDOCA ⚠]  →  [●]       │
│                                       (constraint: doc splitting required)   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Custom node types

**`SwimlaneGroupNode`:** Full-width horizontal band. `bg-surface/30 border-y border-border/40`. Lane label `text-[10px] uppercase tracking-[0.15em] text-muted` top-left.

**`TaskNode`:** `bg-surface border border-border/70 rounded-lg px-3 py-2.5`. Status left stripe. System badge bottom-right. If node has overlays: amber `●` badge top-right with count.

**`GatewayNode`:** Diamond via CSS `rotate-45`. `bg-surface-alt border border-border`. Label rendered outside below at `rotate-[-45deg]`.

**`StartEndNode`:** Circle. Start: `border-2 border-accent bg-accent/20`. End: `border-2 border-success bg-success/20`.

### Overlay panel

Clicking a node with overlays opens a `<NodeToolbar>` panel below the node:

```
┌── Overlays (2) ──────────────────────────────────────────────┐
│  [risk] JSMITH currently approves 91% of actuarial JEs...    │
│         ↗ GL Analysis                                         │
│                                                               │
│  [constraint] Document splitting required for 4 accounts...  │
│         ↗ GL Analysis                                         │
└───────────────────────────────────────────────────────────────┘
```

Overlay kind badge colors:
- `constraint` → amber
- `requirement` → blue (accent)
- `exception` → purple
- `risk` → red (error)

GL finding source chip: `bg-success/10 text-success text-[9px]` — the cross-agent connection visualized.

### Edges

- `type="smoothstep"`, `animated={true}` — flowing dashes
- Gateway condition labels: small `text-[9px] text-muted` pill on edge

### Layout

Dagre LR. Swimlanes as group nodes. Node positions computed by Dagre then offset per swimlane y-position.

---

## React Flow Dark Theme CSS

Add to `web/src/app/globals.css`:

```css
/* React Flow dark theme */
.react-flow__background { background-color: var(--color-background); }
.react-flow__edge-path { stroke: var(--color-border); stroke-width: 1.5; }
.react-flow__node-group {
  background: rgba(30,41,59,0.4);
  border: 1px solid rgba(71,85,105,0.4);
  border-radius: 12px;
}
.react-flow__minimap {
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}
.react-flow__controls {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: none;
}
.react-flow__controls-button {
  background: transparent;
  border: none;
  color: var(--color-muted);
  fill: var(--color-muted);
}
.react-flow__controls-button:hover {
  background: var(--color-surface-alt);
}
```

---

## Python Pydantic Models

New file: `src/fta_agent/data/process_flow.py`

Exact mirror of the TypeScript types. Used by:
- Functional Consultant agent to generate process flow artifacts
- BPMN export endpoint (future, when needed)
- Engagement context storage of process flow data

See session doc for full model code.

---

## BPMN Serialization (deferred)

If clients require BPMN 2.0 export: Python serializes `ProcessFlow` JSON to BPMN 2.0 XML using `lxml`. Layout coordinates computed via `networkx` topological sort. New endpoint: `GET /api/v1/deliverables/{id}/export/bpmn`.

The `ProcessFlowNode.type` values map directly to BPMN element types. The frontend never changes — BPMN is an export format only.

Defer until a client explicitly requests BPMN import into Camunda, Signavio, or similar.

---

## Install

```bash
pnpm --filter web add @xyflow/react @dagrejs/dagre
pnpm --filter web add -D @types/dagre
```

---

## Files to Create / Modify

| File | Change |
|------|--------|
| `web/package.json` | New dependencies |
| `web/src/lib/mock-data.ts` | 9 new types + `DeliverableWorkspace.graph?` + 2 mock workspaces |
| `web/src/components/workspace/ProcessInventoryGraph.tsx` | New |
| `web/src/components/workspace/ProcessFlowMap.tsx` | New |
| `web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx` | Graph dispatch |
| `web/src/app/globals.css` | React Flow dark theme overrides |
| `src/fta_agent/data/process_flow.py` | New Python models |
