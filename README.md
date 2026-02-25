# Finance Transformation Agent (FTA)

> An interactive consulting framework for insurance finance transformations, with AI agents embedded as capabilities.

**Status: Phase 1 — Personal Use MVP · Stream B — Agentic Capabilities (Session 021+)**
13 of 35 deliverable workspaces built. Workshop Mode complete. Now wiring end-to-end agent flows: GL Account Analysis + GAAP Income Statement generation.

---

## What is FTA?

FTA is an **interactive consulting framework** — not an agent with a UI bolted on. A consultant opens it every day to navigate workstreams, review deliverables, make scoping decisions, and capture requirements.

**The shift:** From consultants who gather, assemble, and format → consultants who steer, validate, and advise.

Some deliverables are **agent-powered** (GL Account Analysis — agent ingests data, runs analysis, produces artifacts). Others are **knowledge-powered** (Business Requirements — curated domain library the consultant navigates and customizes). Some are **hybrid** (Process Inventory — knowledge library enriched by agent findings). The agent is a capability inside the framework, not the product itself.

---

## The Product Experience

### Full Lifecycle — Pursuit Through Delivery

FTA covers the complete engagement lifecycle:

**Pursuit phase** (`/pursue/[pursuitId]`) — before you win the work. The Scoping Canvas — a radial domain map with 7 transformation themes — is pulled up on screen during a first executive meeting. Pain points, scope decisions, and priorities are captured live. When you win, scope flows directly into the workplan.

**Delivery phase** (`/[engagementId]/deliverables/[deliverableId]`) — the workplan drives. 7 workstreams, 35 deliverables, each with a dedicated workspace.

### Three Product Modes

| Mode | When | How it works |
|------|------|-------------|
| **Pursuit** | Exec meeting | Scoping canvas on projector, capturing scope and pain points |
| **Workshop** | Client in the room | Live capture against pre-loaded leading practice baseline, keyboard-first |
| **Solo** | Consultant alone | Review, refine, run agent analysis, prepare next session |

### Landing Screen
Consultants open FTA and see active **pursuits** (pre-engagement) above active **engagements** (delivery). Pursuit cards show scope progress and pain points. Engagement cards show open decisions, findings, and blocked items. Clicking reveals the workspace.

### Deliverable Workspace
Every deliverable has a dedicated workspace where content is produced — either by an agent analyzing client data, from a curated domain library, or a combination.

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
| `AnnotatedTable` | d-005-01 Account Analysis, d-005-03 Account Mapping, d-001-03 RACI, d-001-04 Risk Log, d-002-02 Scope, d-003-04 ERP Evaluation, d-006-01 Reporting Inventory |
| `ProcessInventoryGraph` | d-004-01 Process Inventory (20 PAs, scope/status, AI framework) |
| `ProcessFlowMap` | d-004-03, d-004-03b, d-004-03c, d-004-03d Future State Process Maps |
| `BusinessRequirementsTable` | d-004-04 Business Requirements (324 reqs, fit/gap across 4 PAs) |
| `ScopingCanvas` | Pursuit — orbital scoping with Rapid 12 / Deep Dive modes |

13 of 35 deliverables across 6/7 workstreams.

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
│   ├── agents/             # LangGraph graphs, nodes, state, prompts
│   ├── api/                # FastAPI routes (REST + SSE)
│   ├── data/               # DataEngine, schemas, synthetic data, loader
│   └── llm/                # Model routing (Claude, GPT-4o)
├── web/                    # Next.js 15 frontend
│   ├── src/app/
│   │   ├── page.tsx                              # Landing screen
│   │   ├── pursue/[pursuitId]/                   # Pursuit phase
│   │   └── [engagementId]/
│   │       └── deliverables/[deliverableId]/
│   │           └── page.tsx                      # Workspace dispatch
│   └── src/components/
│       ├── workspace/                            # Deliverable workspace components
│       └── pursue/                               # Scoping Canvas, ThemePanel
├── tests/                  # pytest, synthetic data fixtures
├── docs/
│   ├── plans/              # master-plan.md, v1-build-plan.md
│   └── reference/          # feature-specs.md (how things work)
└── NEXT-STEPS.md           # Active backlog + current priorities
```

---

## Running Locally

**Backend:**
```bash
uv sync
cp .env.example .env      # add ANTHROPIC_API_KEY
uv run uvicorn fta_agent.api.app:create_app --factory --reload
```
Generates synthetic P&C GL data on first start (~3,000 accounts, 12 months of postings, 7 embedded MJE patterns) and loads into DuckDB.

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

## Build Strategy

**Current focus (Session 021+):** Stream B — two fully agentic capabilities end-to-end. Prove the system can analyze real data and generate real financial deliverables.

| Stream | Focus | Status |
|--------|-------|--------|
| **W — Workshop Mode** | Keyboard-first live capture during client workshops | Complete (Sessions 016–019) |
| **P — Pursuit** | Scoping Canvas for executive meetings | Scoping Canvas complete (Sessions 019–020) |
| **A — Framework Expansion** | Knowledge-powered workspaces across all 7 workstreams | 13/35 built, paused |
| **B — Agentic Capabilities** | GL Account Analysis + GAAP Income Statement end-to-end | Active |
| **C — Platform Polish** | Navigation, layout, breadcrumbs | Paused |

See [NEXT-STEPS.md](NEXT-STEPS.md) for the active backlog.

---

## Documentation

| Document | What it covers |
|----------|---------------|
| **[NEXT-STEPS.md](NEXT-STEPS.md)** | **Active backlog + current priorities** |
| [Feature Specs](docs/reference/feature-specs.md) | How existing features work (Workshop Mode, Scoping Canvas, etc.) |
| [Master Plan](docs/plans/master-plan.md) | Full three-phase product roadmap |
| [V1 Build Plan](docs/plans/v1-build-plan.md) | Phase 1 iteration detail |
| [Product Vision](docs/vision/product-vision.md) | Problem, vision, value proposition |
| [Architecture Overview](docs/vision/architecture-overview.md) | System architecture, routing, frontend |
| [Design Principles](docs/vision/design-principles.md) | Six non-negotiable product principles |
| [Decision Log](docs/decisions/decision-log.md) | All decisions with rationale |
| [CLAUDE.md](CLAUDE.md) | AI coding standards, architecture rules, anti-patterns |

---

## Rollout Strategy

1. **Phase 1 — Personal use** · Build conviction as user zero · Real P&C engagement via CLI + web
2. **Phase 2 — Super testers** · 3-5 trusted consultants · Multi-user · Supabase auth · GCP deploy
3. **Phase 3 — Broad rollout** · Commercial SaaS · Multiple specialists · Enterprise infrastructure
