# Architecture Overview

> Last updated: Session 009

## System Architecture

FTA is a full-stack AI system: a Next.js frontend, a FastAPI backend, LangGraph agent orchestration, and Supabase for persistence. The backend streams agent output to the frontend over SSE.

```
┌───────────────────────────────────────────────────────────────────┐
│  FRONTEND: Next.js 15 (App Router)                                │
│  Landing · Workplan panel · Deliverable workspace (3-panel)       │
├───────────────────────────────────────────────────────────────────┤
│  API: Python + FastAPI · SSE streaming for agent output           │
├───────────────────────────────────────────────────────────────────┤
│  AGENT ORCHESTRATION: LangGraph                                   │
│  ├── Consulting Agent (hub — all routing flows through here)      │
│  ├── GL Design Coach (P&C domain specialist)                      │
│  └── Functional Consultant (generalist)                           │
├───────────────────────────────────────────────────────────────────┤
│  LLM: LiteLLM · Claude Opus/Sonnet (reasoning) · Haiku (routing) │
├───────────────────────────────────────────────────────────────────┤
│  DATA ENGINE: DuckDB + Polars                                     │
│  GL data profiling · MJE analysis · account pattern detection     │
├───────────────────────────────────────────────────────────────────┤
│  DATABASE: Supabase (Postgres + pgvector)                         │
│  Engagement context · Auth · RLS per engagement · Real-time       │
└───────────────────────────────────────────────────────────────────┘
```

---

## Agent Architecture — Three Layers

### Hub-and-Spoke Routing (DEC-038)

The Consulting Agent is the **only router**. Specialist agents are destinations, not routers. All cross-agent coordination flows through the hub.

```
Consultant
    |
    v
+------------------------------------------------------------------+
|                CONSULTING AGENT (Hub + Orchestrator)             |
|  Routes to the right agent based on LLM intent classification.  |
|  Manages shared engagement context. Owns PMO/planning tools.    |
+------------------------------------------------------------------+
    |                              |
    v                              v
+------------------+    +---------------------------+
| FUNCTIONAL       |    | GL DESIGN COACH           |
| CONSULTANT       |    |                           |
|                  |    | Data-grounded. P&C        |
| Knowledge-       |    | specialist. Ingests real  |
| grounded.        |    | GL data. Has opinions.    |
| Requirements,    |    | Designs COA structure,    |
| process docs,    |    | ACDOCA dimensions, MJE    |
| decks.           |    | analysis.                 |
+------------------+    +---------------------------+
         |                         |
         +-------------------------+
                       |
             +---------v----------+
             |  SHARED ENGAGEMENT |
             |  CONTEXT           |
             |  ("Engagement Brain")|
             +--------------------+
```

**Agent registry (DEC-039):** Adding a new specialist = one declarative entry in the registry. The router discovers agents from the registry — no modification to the Consulting Agent core.

**Multi-user direct access (DEC-030):** Each agent is independently accessible by role. The PM works with the Consulting Agent directly. The accounting expert works with the GL Design Coach directly. They don't have to go through each other.

---

## Three-Layer Capability Model

### Layer 1: General Tools
Horizontal capabilities that every consultant needs regardless of domain. Task executors with standard interfaces.

| Tool | Purpose |
|------|---------|
| Requirements Engine | Unstructured input → structured, traceable requirements |
| Process Documenter | Verbal descriptions → structured process flows |
| Deck Builder | Engagement context → PowerPoint deliverables |
| PMO / Planning Tool | Workplan, backlog, status synthesis |

### Layer 2: Domain Specialist Agents
These are agents with expertise — they reason, advise, guide, push back, and run on real data. Each encodes the knowledge of a senior domain expert.

**MVP:** GL Design Coach (P&C, SAP S/4HANA)

**Future:** Close Process Architect · Regulatory Reporting Advisor · Subledger Integration Specialist · Data Migration Strategist · TOM Designer · Reconciliation Designer

Each specialist follows the same architectural pattern: deep knowledge + own tools + memory + opinions + process guidance + data skills.

### Layer 3: Platform Configuration Agents (Future)
Take design artifacts from Layer 2 and translate them into platform-specific configuration. MVP: configuration specifications a human executes. Future: direct API-driven configuration in sandbox.

See [Configuration Agent](../features/configuration-agent.md).

---

## Two Agent Value Models

The workspace UI reflects two fundamentally different ways agents produce output:

| Model | Agent | How it works |
|-------|-------|-------------|
| **Data-grounded** | GL Design Coach | Every finding derives from client data. Each artifact row has a source reference (posting file, row range, MJE analysis). Insights are traceable. |
| **Knowledge-grounded** | Functional Consultant | Output starts from a leading practice library (curated requirements, process templates), adapted to the engagement's segment and ERP target. |

This distinction drives the preflight screen, insight card display, and the "library source" vs "data source" badge in the workspace.

---

## Frontend Architecture

### Navigation Model

```
/ (landing)
├── Engagement cards + workplan panel
│
└── /[engagementId]/                         ← engagement layout (WorkplanSpine + TopBar)
    └── /deliverables/[deliverableId]/        ← deliverable workspace
```

**Deliverable-centric routing:** Routes are scoped to the deliverable being built, not to the agent that builds it. The agent is metadata on the deliverable. This means the URL and navigation model are stable even as agents evolve.

### Workspace Shell (Three Panels)

```
┌──────────────────────┬─────────────────────────────────┬─────────────┐
│  WORKPLAN SPINE      │  ARTIFACT AREA                  │  ACTIVITY   │
│  240px collapsible   │  flex-1                         │  56px→240px │
│  to 48px icon rail   │                                 │  collapsed  │
│                      │  InsightCards (data only)       │  by default │
│  All workstreams     │  AnnotatedTable                 │             │
│  Active deliverable  │  InlineInterrupt (if waiting)   │  Step log   │
│  highlighted         │  ─────────────────────────      │  with       │
│  Navigates on click  │  AgentChatInput                 │  durations  │
└──────────────────────┴─────────────────────────────────┴─────────────┘
```

### Component Inventory (`web/src/components/workspace/`)

| Component | Role |
|-----------|------|
| `WorkspaceTopBar` | Breadcrumb (← Client / Workstream / Deliverable) + agent status dot |
| `WorkplanSpine` | Collapsible left rail; auto-expands active workstream; navigates on click |
| `PreflightScreen` | Pre-run screen — two variants (data-grounded vs. knowledge-grounded) |
| `InsightCards` | Finding / risk / compliant / info cards above table (data agents only) |
| `AnnotatedTable` | Staggered row reveal; flag badges; provenance detail sub-row on hover |
| `InlineInterrupt` | Amber decision card embedded between table rows at the agent's stop point |
| `AgentChatInput` | Persistent bottom input; context-aware placeholder; local chat history |
| `ActivityPanel` | Right rail; consultant-readable step log with durations; collapsed by default |

### Agent State Machine

Every workspace screen reflects exactly one of these states:

| State | Visual Treatment |
|-------|-----------------|
| `preflight` | PreflightScreen with CTA button |
| `running` | Pulsing blue dot, "working…" label |
| `awaiting_input` | InlineInterrupt dominates — impossible to miss |
| `complete` | Full artifact visible; chat input switches to ask mode |

### SSE Event Envelope (backend → frontend)

All agent output streams over SSE. Every event:
```typescript
type SSEEvent = {
  type: 'token' | 'tool_call' | 'trace_step' | 'interrupt' | 'complete' | 'error'
  session_id: string
  timestamp: string
  payload: Record<string, unknown>
}
```

`ts-pattern` exhaustive match on `event.type` — missing cases are compile errors.

### Segment / ERP Agnosticism

No segment strings (P&C, Life, Reinsurance) or ERP names (SAP, Oracle) are hardcoded in any UI component. All content — preflight bullets, data source labels, library source badges, agent names, deliverable names — comes from engagement and workspace data. The same workspace shell serves any segment on any ERP.

---

## Shared Engagement Context ("Engagement Brain")

The backbone of the architecture. All agents read from and write to the same store. Switching agents never breaks context.

**Persistence:**
- **Supabase Postgres** — engagement metadata, decisions, findings, requirements, workplan (DEC-040)
- **DuckDB** — GL analytics only (posting data, account profiles, MJE analysis)
- **pgvector** — semantic search over engagement context (no separate vector DB)

**Key property:** A consultant can switch from the GL Design Coach mid-COA-design to the Functional Consultant for requirements, and neither agent loses the thread.

See [Engagement Context](../features/engagement-context.md).

---

## ERP Platform Strategy

Platform-neutral interface with SAP S/4HANA as the first-class MVP implementation.

```
Domain Specialist Agent
    |
    v
Platform-Neutral Interface
    |
    +-- SAP Adapter (MVP)
    +-- Oracle Cloud ERP Adapter (future)
    +-- Workday Financials Adapter (future)
```

Every place an agent touches ERP-specific logic goes through a platform adapter. Adding a new ERP means implementing a new adapter, not re-architecting the agent.

See [ERP Platform Strategy](../features/erp-platform-strategy.md).
