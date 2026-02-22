# Finance Transformation Agent (FTA)

> An interactive consulting framework for insurance finance transformations, with AI agents embedded as capabilities.

**Status: Phase 1 — Personal Use MVP · Three-stream build in progress (Session 015+)**
Full workspace UI complete. 5 of 35 deliverables have workspaces. Building toward 15/35 (all 7 workstreams) + one agent-powered vertical.

---

## What is FTA?

FTA is an **interactive consulting framework** — not an agent with a UI bolted on. A consultant opens it every day to navigate workstreams, review deliverables, make scoping decisions, and capture requirements.

**The shift:** From consultants who gather, assemble, and format → consultants who steer, validate, and advise.

Some deliverables are **agent-powered** (GL Account Analysis — agent ingests data, runs analysis, produces artifacts). Others are **knowledge-powered** (Business Requirements — curated domain library the consultant navigates and customizes). Some are **hybrid** (Process Inventory — knowledge library enriched by agent findings). The agent is a capability inside the framework, not the product itself.

---

## The Product Experience

### Landing Screen
Consultants open FTA and see their active engagements. Each card shows live status — open decisions, high-severity findings, blocked items — and the team of consultants on the engagement. Clicking reveals the full workplan: 7 workstreams, 35+ deliverables, scope editing, per-workstream progress tracking.

### Deliverable Workspace
Clicking any deliverable opens the workspace — the core product screen. Every deliverable has a dedicated workspace where content is produced — either by an agent analyzing client data, from a curated domain library, or a combination.

```
┌──────────────────────┬─────────────────────────────────┬─────────────┐
│  WORKPLAN SPINE      │  ARTIFACT                       │  ACTIVITY   │
│  (collapsible)       │  (flex-1)                       │  (collapsed │
│                      │                                  │   default)  │
│  all workstreams     │  InsightCards (data agents)     │             │
│  active deliverable  │  AnnotatedTable / Graph          │  what the   │
│  highlighted         │  InlineInterrupt (if waiting)   │  agent did, │
│                      │  ─────────────────────────────  │  step by    │
│                      │  AgentChatInput (always open)   │  step       │
└──────────────────────┴─────────────────────────────────┴─────────────┘
```

### Three Deliverable Models

| Model | Examples | How it works |
|-------|----------|-------------|
| **Agent-powered** | GL Account Analysis, Account Mapping | Agent ingests client data, runs analysis. Every row traces to source. |
| **Knowledge-powered** | Business Requirements, RACI Matrix, Scope Definition, ERP Evaluation | Curated domain library adapted to engagement context. No agent run required. |
| **Hybrid** | Process Inventory | Knowledge library enriched by agent findings (GL analysis overlays). |

### Workspace Components

**PreflightScreen** — before the agent runs, shows what it's about to do and what data/library it will use. One button starts.

**InlineInterrupt** — when the agent reaches a decision it can't make alone, it stops mid-table and surfaces an amber decision card. Rows below stay hidden until the consultant resolves it.

**AgentChatInput** — always visible at the bottom. During a run: steer the agent. After completion: ask follow-up questions.

**ActivityPanel** — right rail (collapsed by default). Consultant-readable step log: "Auto-mapped 34 accounts · avg confidence 0.96" — not raw tool call JSON.

---

## Workspace Coverage

| Component | Deliverables |
|-----------|-------------|
| `AnnotatedTable` | d-005-01 Account Analysis, d-005-03 Account Mapping |
| `ProcessInventoryGraph` | d-004-01 Process Inventory (20 PAs, scope/status, AI framework) |
| `ProcessFlowMap` | d-004-03 Future State Process Maps (custom SVG/HTML renderer) |
| `BusinessRequirementsTable` | d-004-04 Business Requirements (324 reqs, PA-05 Fit/Gap pilot) |

5 of 35 deliverables. Target: 15/35 with all 7 workstreams represented.

---

## The Agents

### Consulting Agent — Engagement Lead & PMO
Routes work to the right agent. Tracks the workplan. Owns the decision registry, open items, and status synthesis. The only routing hub — specialists never hand off to each other.

### GL Design Coach — P&C Domain Specialist
The deepest agent. Ingests real GL data (posting lines, account master, trial balance), profiles every account, detects MJE patterns, flags key person risk. Designs COA structure, ACDOCA dimensions, document splitting configuration, and multi-GAAP ledger strategy. Has opinions and will push back on suboptimal design proposals.

### Functional Consultant — Generalist
Structured requirements extraction. Process flow documentation. Works from a leading practice library adapted to engagement context. Deck generation for steering committee updates and client workshops.

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│  FRONTEND: Next.js 15 (App Router, dark mode, Tailwind/Shadcn)   │
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
│  Engagement context · Structured decisions · Auth · RLS           │
└───────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
fta-agent/
├── src/fta_agent/          # Python backend
│   ├── agent/              # LangGraph graphs, nodes, state
│   ├── api/v1/             # FastAPI routes
│   ├── data/               # DuckDB engine, Pydantic models
│   └── prompts/            # All prompts as markdown files
├── web/                    # Next.js 15 frontend
│   ├── src/app/
│   │   ├── page.tsx                              # Landing screen
│   │   └── [engagementId]/
│   │       └── deliverables/[deliverableId]/
│   │           └── page.tsx                      # Workspace dispatch
│   └── src/components/workspace/                 # All workspace components
├── tests/                  # pytest, synthetic data fixtures
├── docs/                   # Plans, vision, session notes, design docs
└── NEXT-STEPS.md           # Active build plan + session schedule
```

---

## Running Locally

**Backend:**
```bash
uv sync
uv run uvicorn fta_agent.api.app:app --reload
```

**Frontend:**
```bash
cd web && pnpm install && pnpm dev
```
Open [http://localhost:3000](http://localhost:3000)

**Tests:**
```bash
uv run pytest
pnpm --filter web build   # TypeScript check
```

---

## Build Strategy (Session 015+)

Three streams, interleaved:

| Stream | Focus | Dependency |
|--------|-------|------------|
| **A — Framework Expansion** | Knowledge-powered workspaces across all 7 workstreams | None — mock data |
| **B — Data Slice** | d-005-01 Account Analysis end-to-end with real data | Backend SSE + data tools |
| **C — Platform Polish** | Navigation, layout, breadcrumbs, WorkplanSpine wiring | Existing components |

See [NEXT-STEPS.md](NEXT-STEPS.md) for the active session plan.

---

## Documentation

| Document | What it covers |
|----------|---------------|
| **[NEXT-STEPS.md](NEXT-STEPS.md)** | **Active build plan + session schedule** |
| [Master Plan](docs/plans/master-plan.md) | Full three-phase product roadmap |
| [V1 Build Plan](docs/plans/v1-build-plan.md) | Phase 1 iteration detail |
| [Product Vision](docs/vision/product-vision.md) | Problem, vision, value proposition |
| [Architecture Overview](docs/vision/architecture-overview.md) | System architecture, routing, frontend |
| [Design Principles](docs/vision/design-principles.md) | Six non-negotiable product principles |
| [Decision Log](docs/decisions/decision-log.md) | All decisions with rationale |
| [Session Log](docs/sessions/) | Build history, session by session |

---

## Rollout Strategy

1. **Phase 1 — Personal use** · Build conviction as user zero · Real P&C engagement via CLI + web
2. **Phase 2 — Super testers** · 3-5 trusted consultants · Multi-user · Supabase auth · GCP deploy
3. **Phase 3 — Broad rollout** · Commercial SaaS · Multiple specialists · Enterprise infrastructure
