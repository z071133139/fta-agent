# Finance Transformation Agent (FTA)

> An AI-native agent that reimagines how consultants deliver finance transformation projects in the insurance industry.

**Status: Phase 1 — Personal Use MVP · Iteration 1.5 in progress**
Full workspace UI complete (Sessions 007–009). Backend agent infrastructure (1.5A) is the next critical path item.

---

## What is FTA?

FTA is not a delivery platform with AI bolted on. It is a **virtual consulting team** — three agents, each with a distinct role — serving human consultants on insurance finance transformation engagements.

**The shift:** From consultants who gather, assemble, and format → consultants who steer, validate, and advise.

The agents don't replace consultants. They handle the research, synthesis, and structured output so consultants can spend their time on what only humans can do: judgment, relationships, and accountability.

---

## The Product Experience

### Landing Screen
Consultants open FTA and see their active engagements. Each card shows live status — open decisions, high-severity findings, blocked items — and the team of consultants on the engagement. Clicking reveals the full workplan: 7 workstreams, 38+ deliverables, scope editing, per-workstream progress tracking.

### Deliverable Workspace
Clicking any deliverable (View →, Open →, Review →, Resolve →) opens the workspace — the core product screen. Every deliverable has a dedicated workspace where an agent does its work and the consultant reviews, steers, and confirms.

```
┌──────────────────────┬─────────────────────────────────┬─────────────┐
│  WORKPLAN SPINE      │  ARTIFACT                       │  ACTIVITY   │
│  (collapsible)       │  (flex-1)                       │  (collapsed │
│                      │                                  │   default)  │
│  all workstreams     │  InsightCards (data agents)     │             │
│  active deliverable  │  AnnotatedTable                 │  what the   │
│  highlighted         │  InlineInterrupt (if waiting)   │  agent did, │
│                      │  ─────────────────────────────  │  step by    │
│                      │  AgentChatInput (always open)   │  step       │
└──────────────────────┴─────────────────────────────────┴─────────────┘
```

**Two agent value models:**

| Model | Agent | What it means |
|-------|-------|---------------|
| **Data-grounded** | GL Design Coach | Findings derived from client data — every row has a source reference, every insight is traceable to a posting line |
| **Knowledge-grounded** | Functional Consultant | Output starts from a leading practice library, adapted to the engagement's segment and ERP target |

**Preflight screens** — before the agent runs, it shows what it's about to do and what data or library it will use. One button starts the run.

**InlineInterrupt** — when the agent reaches a decision it can't make alone (e.g., "Account 2340 carries both ceded and assumed flows — split or use posting key differentiation?"), it stops mid-table and surfaces an amber decision card. Rows below stay hidden until the consultant resolves it.

**AgentChatInput** — always visible at the bottom of the artifact area. During a run: steer the agent. After completion: ask follow-up questions about the analysis.

**ActivityPanel** — right rail (collapsed by default). Consultant-readable step log: "Auto-mapped 34 accounts · avg confidence 0.96" — not raw tool call JSON.

---

## The Agents

### Consulting Agent — Engagement Lead & PMO
Routes work to the right agent. Tracks the workplan. Owns the decision registry, open items, and status synthesis. The only routing hub — specialists never hand off to each other.

### GL Design Coach — P&C Domain Specialist
The deepest agent. Ingests real GL data (posting lines, account master, trial balance), profiles every account, detects MJE patterns, flags key person risk. Designs COA structure, ACDOCA dimensions, document splitting configuration, and multi-GAAP ledger strategy — grounded in actual client data, not generic templates. Has opinions and will push back on suboptimal design proposals with specific reasoning.

### Functional Consultant — Generalist
Structured requirements extraction from meeting notes and transcripts. Process flow documentation. Works from a leading practice library adapted to engagement context. Deck generation for steering committee updates and client workshops.

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

**Hub-and-spoke routing:** The Consulting Agent is the only router. Specialist agents are destinations, not routers. All cross-agent coordination flows through the hub.

**Shared Engagement Context ("Engagement Brain"):** All agents read from and write to the same store. Switching agents never breaks context.

**ERP-agnostic:** SAP S/4HANA in MVP. Oracle Cloud ERP and Workday Financials via platform adapters in later phases.

**Segment-agnostic UI:** No segment or ERP strings hardcoded in any component. Content (preflight bullets, data sources, agent labels, deliverable names) comes entirely from engagement data. The same workspace shell serves a P&C carrier on SAP and a reinsurer on Oracle.

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
│   │       ├── layout.tsx                        # 3-panel workspace shell
│   │       └── deliverables/[deliverableId]/
│   │           └── page.tsx                      # Workspace page
│   └── src/components/
│       ├── WorkplanPanel.tsx                     # Landing workplan accordion
│       └── workspace/                            # All workspace components
│           ├── WorkspaceTopBar.tsx               # Breadcrumb + agent status
│           ├── WorkplanSpine.tsx                 # Collapsible left rail
│           ├── PreflightScreen.tsx               # Pre-run screen (2 variants)
│           ├── InsightCards.tsx                  # Finding/risk/info cards
│           ├── AnnotatedTable.tsx                # Artifact table w/ provenance
│           ├── InlineInterrupt.tsx               # Amber decision card
│           ├── AgentChatInput.tsx                # Persistent bottom input
│           └── ActivityPanel.tsx                 # Collapsible right rail
├── tests/                  # pytest, synthetic data fixtures
├── docs/                   # All documentation
└── NEXT-STEPS.md           # Current session pickup document
```

---

## Running Locally

**Backend:**
```bash
uv sync
uv run uvicorn fta_agent.main:app --reload
```

**Frontend:**
```bash
cd web && pnpm dev
```
Open [http://localhost:3000](http://localhost:3000)

**Tests:**
```bash
uv run pytest
pnpm --filter web build   # TypeScript check
```

---

## Documentation

| Document | What it covers |
|----------|---------------|
| **[NEXT-STEPS.md](NEXT-STEPS.md)** | **Session pickup — what to build next** |
| [Master Plan](docs/plans/master-plan.md) | Full three-phase product roadmap |
| [V1 Build Plan](docs/plans/v1-build-plan.md) | Detailed Phase 1 iteration plan |
| [Product Vision](docs/vision/product-vision.md) | Problem, vision, value proposition |
| [Architecture Overview](docs/vision/architecture-overview.md) | System architecture, routing, frontend |
| [Design Principles](docs/vision/design-principles.md) | Six non-negotiable product principles |
| [MVP Agent Design](docs/design/mvp-agent-design.md) | Three-agent skills specification |
| [GL Design Coach](docs/agents/gl-design-coach.md) | P&C domain specialist spec |
| [Functional Consultant](docs/agents/functional-consultant.md) | Generalist agent spec |
| [Consulting Agent](docs/agents/consulting-agent.md) | Orchestrator + PMO spec |
| [Decision Log](docs/decisions/decision-log.md) | All 40 decisions with rationale |
| [Tech Stack](docs/tech/tech-stack.md) | Technology choices and rationale |
| [Day in the Life](docs/engagement-flow/day-in-the-life.md) | How consultants navigate the product |
| [Session Log](docs/sessions/) | Build history, session by session |

---

## Rollout Strategy

1. **Phase 1 — Personal use** · Build conviction as user zero · Real P&C engagement via CLI + web
2. **Phase 2 — Super testers** · 3-5 trusted consultants · Multi-user · Supabase auth · GCP deploy
3. **Phase 3 — Broad rollout** · Commercial SaaS · Multiple specialists · Enterprise infrastructure
