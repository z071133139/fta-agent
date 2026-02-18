# Next Steps

> Last updated: 2026-02-17 (after Session 007)

## How to Use This Document

This is the primary pickup point between sessions. Before starting any new session, read this document first to understand where things stand and what's next. Update it at the end of every session.

## Current Phase: Build -- Phase 1, Iteration 1.5 (Agent Harness)

Interaction model refined (Session 007). Infrastructure plan drafted. AI-native landing screen designed. Next session: approve 1.5A plan and begin building.

---

## Current: Iteration 1.5 -- Agent Harness (Three-Agent System)

**Why now:** The agent design is complete (Session 006) and the interaction model is fully defined (Session 007). Infrastructure plan drafted and ready for approval.

**Reference:** [mvp-agent-design.md](design/mvp-agent-design.md) | [v1-build-plan.md](plans/v1-build-plan.md) Iteration 1.5

### Interaction Model (Session 007 — Finalized)

- **Users are consultants** — FTA agents are a virtual consulting team serving human consultants, not the end client
- **Tool-level locking** — exclusive tools (GL data analysis) block concurrent use per engagement; other tools are multi-user
- **Supabase auth** — no custom auth; RLS for engagement isolation
- **Hub-and-spoke routing** — Consulting Agent is the only router; specialists don't hand off to each other
- **Agent registry** — declarative dict; adding a new agent = one entry; router reads from it dynamically
- **Supabase Postgres** replaces DuckDB for engagement context persistence (DEC-040); DuckDB stays for GL analytics only

### What needs to happen:

**1.5A: Agent Infrastructure** ← Plan drafted, needs approval
- [ ] Extended AgentState with consultant context + engagement metadata
- [ ] Supabase auth integration (replace placeholder auth)
- [ ] Engagement context store (Supabase Postgres tables: engagements, tool_locks, audit_log, outcome tables)
- [ ] Tool framework with lock enforcement and audit trail
- [ ] Agent registry (declarative dict, router reads from it)
- [ ] LLM-based intent router (replace keyword regex in `consulting_agent.py`)
- [ ] Handoff protocol: context packaging → sub-agent invocation → structured outcome return
- [ ] Tool definitions: `capture_decision`, `capture_finding`, `capture_requirement`, `capture_mapping`, `query_context`

**1.5B: Functional Consultant Agent**
- [ ] New LangGraph graph for Functional Consultant
- [ ] System prompt: generalist consulting persona
- [ ] Requirements extraction tool
- [ ] Process flow generation tool
- [ ] Engagement context read/write

**1.5C: Consulting Agent Upgrade**
- [ ] Full orchestrator (replace keyword router)
- [ ] Engagement onboarding flow
- [ ] Decision registry (central view)
- [ ] Open items tracking
- [ ] Status synthesis
- [ ] Basic workplan management

**1.5D: GL Design Coach Tool Wiring**
- [ ] Wire to outcome capture tools
- [ ] Progressive disclosure tools

**Checkpoint:** Three agents route correctly, capture structured outcomes, share engagement context.

### Also In This Iteration: AI-Native Landing Screen

Design approved (Session 007). Ready to build alongside 1.5A.

- [ ] Login screen (`/login`) — Supabase auth, dark floating fields, FTA wordmark in serif, subtle animated background
- [ ] Consultant landing (`/`) — typewriter greeting, engagement cards (phase-colored left border, stats, agent buttons), agent team cards (availability status, domain stats, "Open for [Client]")
- [ ] Next.js route groups: `(auth)/` for login, `(workspace)/` for agent workspaces with sidebar
- [ ] Client-side auth context with mock mode (`NEXT_PUBLIC_MOCK_AUTH=true`)
- [ ] Font loading fix (DM Sans + Instrument Serif via next/font)
- [ ] Sidebar: consultant name + logout in footer

---

## Pending: Domain Knowledge GO/NO-GO Evaluation

The domain knowledge prompts are built (Iteration 1) but the formal GO/NO-GO evaluation hasn't been run yet. This can happen in parallel with the agent harness build.

- [ ] Run all test conversation scripts through the GL Design Coach
- [ ] Score against Iteration 1 evaluation rubrics
- [ ] Product owner evaluation of realistic workshop scenarios
- [ ] Compare against general-purpose Claude with no domain prompts
- [ ] Document gaps for RAG to address in Iteration 4

---

## Up Next: Iteration 2 -- Persistence (DuckDB Engagement Context)

After the agent harness works, wire outcome capture to DuckDB so decisions survive across sessions. See [v1-build-plan.md](plans/v1-build-plan.md) Iteration 2.

---

## Completed

| Item | Session | Reference |
|------|---------|-----------|
| Tech stack selection | 003 | docs/tech/tech-stack.md, DEC-018 through DEC-023 |
| Project skeleton | 004 | FastAPI, LangGraph, LiteLLM, DuckDB/Polars, CLI -- running end-to-end |
| GL Design Coach MVP tiering | 004 | docs/agents/gl-design-coach.md, DEC-026 through DEC-028 |
| Master plan + V1 build plan | 005 | docs/plans/master-plan.md, docs/plans/v1-build-plan.md |
| Iteration 0: Synthetic test data | 005-006 | tests/fixtures/, src/fta_agent/data/synthetic.py |
| Iteration 0: Evaluation framework | 005-006 | src/fta_agent/eval/ (15 criteria, 14 test scripts) |
| Iteration 1: Domain knowledge prompts | 005-006 | src/fta_agent/agents/prompts/ (~25K chars, 4 modules) |
| Iteration 1: Outcome schemas | 005-006 | src/fta_agent/data/outcomes.py (7 Pydantic models + Polars schemas) |
| Iteration 1: API routes | 005-006 | src/fta_agent/api/routes/ (health, chat, outcomes) |
| Iteration 1: Frontend dashboard | 005-006 | web/ (6 outcome pages, TanStack Table, dark theme) |
| MVP agent design (skills spec) | 006 | docs/design/mvp-agent-design.md, 6 decisions (DEC-029 through DEC-034) |

---

## Deferred (Not Forgotten)

These items are explicitly deferred but documented:

| Item | Deferred Until | Reference |
|------|---------------|-----------|
| Permissions and scope controls | Post-MVP | DEC-010 |
| Configuration Agent (Layer 3) | After MVP | DEC-011, docs/features/configuration-agent.md |
| Oracle / Workday adapters | After SAP MVP stable | docs/features/erp-platform-strategy.md |
| Other domain specialist agents | After GL Design Coach | Will use docs/agents/_template.md |
| PMO tool detailed scoping | Dedicated session | DEC-013 |
| Enterprise LLM endpoints (Bedrock/Azure) | Pre-production | DEC-025 |
| Data isolation per engagement | Pre-production | DEC-024 |
| Cost model refinement | After real usage data | docs/operations/cost-model.md |
| Supabase migration (from DuckDB) | Phase 2 | DEC-032 |
| Multi-consultant flow | Phase 2 | docs/features/shared-backlog.md |
| Life/Annuity sub-segment | Phase 2 | DEC-026 |
| Deck generation (full set) | Phase 2 | docs/agents/functional-consultant.md |
| Dependency management | Phase 2 | docs/agents/consulting-agent.md |
| Timeline tracking | Phase 2 | docs/agents/consulting-agent.md |
| Meeting prep | Phase 2 | docs/agents/consulting-agent.md |
| Cross-agent notifications | Phase 2 | docs/design/mvp-agent-design.md |

---

## Session Log

| Session | Date | Focus | Key Outcomes |
|---------|------|-------|-------------|
| [001](sessions/2026-02-14-session-001-ideation-kickoff.md) | 2026-02-14 | Ideation kickoff | Vision, architecture, 13 decisions, full documentation structure |
| [002](sessions/2026-02-15-session-002-gl-design-coach-deep-dive.md) | 2026-02-15 | GL Design Coach deep dive | Full code block design, MJE analysis, data validation pipeline, insurance language translation, sub-segment differentiation, 7 commits to gl-design-coach.md |
| [003](sessions/2026-02-15-session-003-tech-stack.md) | 2026-02-15 | Tech stack decisions | LangGraph, LiteLLM, DuckDB+Polars, FastAPI, Supabase, Next.js. 6 tech decisions (DEC-018 through DEC-023) |
| 004 | 2026-02-15 | Skeleton build + MVP tiering | Project skeleton running end-to-end. GL Design Coach tiered: V1 = P&C only, real data from day one, hybrid knowledge encoding. 3 decisions (DEC-026 through DEC-028) |
| 005 | 2026-02-16 | Master plan + V1 build plan | Full product roadmap (3 phases), detailed V1 build plan (7 iterations). Corrected sequence: domain knowledge first. Plans approved. |
| [006](sessions/2026-02-16-session-006-mvp-agent-design.md) | 2026-02-16 | MVP agent design | Three-agent architecture, skills specification, interaction model. Functional Consultant agent created. 6 decisions (DEC-029 through DEC-034). Agent harness is next build target. |
| [007](sessions/2026-02-17-session-007-interaction-model-and-landing-screen.md) | 2026-02-17 | Interaction model + landing screen | Reframed: consultants are users, agents are virtual team. Tool-level locking, Supabase auth, hub-and-spoke routing, agent registry pattern, Supabase replaces DuckDB for context. AI-native landing screen designed. CLAUDE.md expanded. 6 decisions (DEC-035 through DEC-040). |
