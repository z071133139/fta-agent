# Finance Transformation Agent (FTA)

> An AI-native agent that reimagines how consultants deliver finance transformation projects in the insurance industry.

## Status: Build -- Phase 1 (Personal Use MVP)

Iterations 0-1 complete (synthetic test data, evaluation framework, domain knowledge prompts, outcome schemas, API routes, frontend dashboard). MVP agent design complete (Session 006). Next: build the three-agent harness (Iteration 1.5).

## What is FTA?

FTA is not another delivery platform with AI bolted on. It is an AI-native agent that fundamentally changes the tasks consultants perform during the early phases of a finance transformation engagement.

**Core idea:** Consultants collaborate with the agent, not navigate a platform. The agent drives discovery, synthesizes deliverables, and maintains a shared engagement context across the entire team.

## Architecture at a Glance

**MVP (Three-Agent System):**

```
Consultant (human -- the client/business)
    |
Consulting Agent (orchestrator + engagement lead + PMO)
    |
    |-- Functional Consultant
    |       - Requirements capture & structuring
    |       - Process documentation
    |       - Deck/deliverable generation
    |
    |-- Domain Specific Agents
            |-- GL Design Coach (MVP -- P&C insurance)
            |-- Reporting Agent (future)
            |-- Close Process Architect (future)
            |-- (7 more specialists planned)
```

## Key Principles

- **AI-native flow** -- conversation-driven, not navigation-driven
- **Documentation is structured-first** -- rendered for humans on demand, consumable by agents always
- **Shared engagement context** -- never breaks across agents or consultants
- **ERP-agnostic architecture, SAP-first MVP**
- **Domain depth is the moat** -- not generic AI wrappers

## Rollout Strategy

1. **Personal use** -- build conviction as user zero
2. **Super testers** -- validate with a small group
3. **Broad user base** -- scale to consulting teams

## Documentation

**Start here:**

| Document | Description |
|----------|-------------|
| **[Next Steps](docs/NEXT-STEPS.md)** | **Start here -- priorities, pickup points, session log** |
| [Master Plan](docs/plans/master-plan.md) | Full 3-phase product roadmap (APPROVED) |
| [V1 Build Plan](docs/plans/v1-build-plan.md) | Detailed Phase 1 iteration plan (APPROVED) |

**Design:**

| Document | Description |
|----------|-------------|
| [MVP Agent Design](docs/design/mvp-agent-design.md) | Three-agent skills specification and interaction model |
| [Consulting Agent](docs/agents/consulting-agent.md) | Orchestrator + engagement lead + PMO |
| [Functional Consultant](docs/agents/functional-consultant.md) | Generalist: requirements, process docs, decks |
| [GL Design Coach](docs/agents/gl-design-coach.md) | P&C domain specialist agent |

**Vision & Architecture:**

| Document | Description |
|----------|-------------|
| [Product Vision](docs/vision/product-vision.md) | Core vision, value proposition, and target users |
| [Architecture Overview](docs/vision/architecture-overview.md) | Layered architecture and component design |
| [Design Principles](docs/vision/design-principles.md) | AI-native design principles |
| [Tech Stack](docs/tech/tech-stack.md) | Technology choices and rationale |

**Features:**

| Document | Description |
|----------|-------------|
| [Engagement Context](docs/features/engagement-context.md) | Shared context / "Engagement Brain" |
| [Shared Backlog](docs/features/shared-backlog.md) | Agent-managed backlog |
| [ERP Platform Strategy](docs/features/erp-platform-strategy.md) | SAP-first, multi-ERP architecture |
| [Configuration Agent](docs/features/configuration-agent.md) | Future: SAP configuration automation |

**Reference:**

| Document | Description |
|----------|-------------|
| [Decision Log](docs/decisions/decision-log.md) | 34 decisions with rationale (DEC-001 through DEC-034) |
| [Cost Model](docs/operations/cost-model.md) | Token estimates, runtime projections |
| [Day in the Life](docs/engagement-flow/day-in-the-life.md) | How consultants use the system |
