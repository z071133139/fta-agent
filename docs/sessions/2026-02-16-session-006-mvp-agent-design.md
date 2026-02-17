# Session 006: MVP Agent Design -- Skills Specification

**Date:** 2026-02-16
**Phase:** Design
**Participants:** Product owner + Claude Code

---

## Session Context

With the project skeleton (Session 004), synthetic test data, evaluation framework (Iteration 0), and dashboard frontend all built, this session shifted to designing the multi-agent MVP architecture. The goal was to define exactly what agents exist, what skills each agent has, how they interact with each other and with users, and what shared infrastructure connects them.

This is the architectural design session that precedes building the agent harness -- the next major implementation milestone.

## Key Discussions

### Three-Agent MVP Architecture

Designed the MVP as three agents working together as a consulting team:

1. **Consulting Agent** -- orchestrator, engagement lead, PMO. Routes work, tracks progress, owns the engagement plan.
2. **Functional Consultant** -- generalist. Requirements capture, process documentation, deliverable generation.
3. **GL Design Coach** -- P&C domain specialist. The analytical engine that does the real COA/code block design work.

The human user is the client (insurance company finance team). The agents are the consulting team.

### Interaction Model -- Multi-User Direct Access

Defined a multi-user model where different business users interact with different agents based on their role:
- Project manager works with the Consulting Agent for status and workplan
- Accounting expert works with the GL Design Coach for analysis and design
- Business analyst works with the Functional Consultant for requirements and decks

Each agent is independently accessible -- no single entry point or receptionist routing. The engagement context is the connective tissue that keeps everything synchronized.

### Skills Inventory

Catalogued all skills across the three agents, categorized as:
- **Build**: Needs to be implemented as tools or logic
- **Existing**: Already encoded in prompt modules or project skeleton
- **LLM native**: Handled by the LLM's reasoning capabilities with structured output

Key skill categories:
- **Consulting Agent**: routing, handoff protocol, context bridging, engagement onboarding, workplan, decision registry, open items, status synthesis
- **Functional Consultant**: requirements extraction, deduplication, process flow generation, deck generation, engagement context read/write
- **GL Design Coach**: data ingestion, account profiling, MJE detection, MJE-to-COA linking, progressive disclosure, dimension design, outcome capture

### Agent Self-Introduction Pattern

Each agent introduces itself contextually when a user first opens it on an engagement -- summarizing current state, key findings, and offering actionable next steps. No generic welcome message.

### Cross-Agent Communication

Defined how agents communicate through the engagement context:
- GL Coach captures a decision --> decision registry updates --> Consulting Agent surfaces it in status
- Functional Consultant captures a requirement --> GL Coach can reference it in design
- Any agent raises a blocker --> Consulting Agent tracks and surfaces it

### Shared Infrastructure

Identified what exists vs. what needs to be built:
- **Exists**: prompt modules, outcome schemas, DataEngine, synthetic data, eval framework, FastAPI/LangGraph skeleton
- **Build**: agent harness (tool-use loop, routing, handoff, state), data pipeline, engagement context store, tool definitions

## Decisions Made

| ID | Decision | Status |
|----|----------|--------|
| DEC-029 | Three-agent MVP: Consulting Agent + Functional Consultant + GL Design Coach | Decided |
| DEC-030 | Multi-user direct access model -- each agent is independently accessible | Decided |
| DEC-031 | LLM-based intent routing replaces keyword regex routing | Decided |
| DEC-032 | Engagement context as DuckDB-based persistence (local, upgraded to Supabase in Phase 2) | Decided |
| DEC-033 | Functional Consultant as a new agent (not just Layer 1 tools on the Consulting Agent) | Decided |
| DEC-034 | Structured outcome capture via tool calls (not post-turn extraction) | Decided |

## Artifacts Produced

| Artifact | Path | Description |
|----------|------|-------------|
| MVP Agent Design spec | `docs/design/mvp-agent-design.md` | Full skills specification, interaction model, infrastructure inventory |
| Functional Consultant spec | `docs/agents/functional-consultant.md` | New agent spec with skills, models, integration, MVP scope |
| Consulting Agent spec (updated) | `docs/agents/consulting-agent.md` | Rewritten with MVP skills, routing, handoff, PMO capabilities |
| GL Design Coach spec (updated) | `docs/agents/gl-design-coach.md` | Added outcome capture skills section |
| Decision log (updated) | `docs/decisions/decision-log.md` | DEC-029 through DEC-034 |
| Master plan (updated) | `docs/plans/master-plan.md` | Reflects three-agent architecture |
| V1 build plan (updated) | `docs/plans/v1-build-plan.md` | New iteration for agent harness build |
| NEXT-STEPS.md (updated) | `docs/NEXT-STEPS.md` | Reflects current position and next priorities |

## What Changed Since Last Session

- Iteration 0 (synthetic test data + evaluation framework) was completed between sessions 005 and 006
- Iteration 1 frontend (Next.js dashboard) was built between sessions 005 and 006
- Iteration 1 backend (outcome schemas, domain prompts, API routes, expanded routing) was built between sessions 005 and 006
- The focus shifted from "build infrastructure" to "design the agent system"

## Open Items Carried Forward

- [ ] Routing latency budget -- target <500ms for LLM routing decision
- [ ] python-pptx template design for Functional Consultant deck generation
- [ ] Requirements extraction mechanism -- tool calls vs. post-turn extraction (decided tool calls, but implementation details TBD)
- [ ] Process flow granularity defaults
- [ ] How the Consulting Agent's workplan integrates with the shared backlog feature

## Next Session Priorities

1. **Begin agent harness implementation** -- start with the Consulting Agent as the LangGraph orchestrator with LLM routing
2. **Build engagement context store** -- DuckDB tables for decisions, findings, requirements, engagement metadata
3. **Implement tool definitions** -- @tool decorated functions for outcome capture, context queries
4. **Wire up the GL Design Coach** with data ingestion and account profiling tools
5. **Domain knowledge evaluation** -- run Iteration 1 eval criteria against current prompts (GO/NO-GO checkpoint)
