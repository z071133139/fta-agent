# Finance Transformation Agent (FTA)

> An AI-native agent that reimagines how consultants deliver finance transformation projects in the insurance industry.

## Status: Ideation Phase

This repository captures the product vision, architecture, and design decisions for the Finance Transformation Agent. We are currently in early ideation -- scoping the product, defining the architecture, and documenting key design principles before building.

## What is FTA?

FTA is not another delivery platform with AI bolted on. It is an AI-native agent that fundamentally changes the tasks consultants perform during the early phases of a finance transformation engagement.

**Core idea:** Consultants collaborate with the agent, not navigate a platform. The agent drives discovery, synthesizes deliverables, and maintains a shared engagement context across the entire team.

## Architecture at a Glance

```
Consultant
    |
Consulting Agent (orchestrator)
    |
    |-- Layer 1: General Tools
    |   |-- Requirements Engine
    |   |-- Process Documenter
    |   |-- Deck Builder
    |   |-- PMO / Engagement Planning (to be scoped)
    |
    |-- Layer 2: Domain Specialist Agents
    |   |-- GL Design Coach (MVP)
    |   |-- Close Process Architect (future)
    |   |-- Regulatory Reporting Advisor (future)
    |   |-- Subledger Integration Specialist (future)
    |   |-- Data Migration Strategist (future)
    |   |-- Target Operating Model Designer (future)
    |   |-- Reconciliation Designer (future)
    |
    |-- Layer 3: Platform Configuration Agents (future)
        |-- SAP Configuration Agent
        |-- (Other ERPs)
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

| Document | Description |
|----------|-------------|
| [Product Vision](docs/vision/product-vision.md) | Core vision, value proposition, and target users |
| [Architecture Overview](docs/vision/architecture-overview.md) | Layered architecture and component design |
| [Design Principles](docs/vision/design-principles.md) | AI-native design principles |
| [Consulting Agent](docs/agents/consulting-agent.md) | Layer 1: General tools specification |
| [GL Design Coach](docs/agents/gl-design-coach.md) | First domain specialist agent |
| [Engagement Context](docs/features/engagement-context.md) | Shared context / "Engagement Brain" |
| [Shared Backlog](docs/features/shared-backlog.md) | Agent-managed backlog |
| [ERP Platform Strategy](docs/features/erp-platform-strategy.md) | SAP-first, multi-ERP architecture |
| [Configuration Agent](docs/features/configuration-agent.md) | Future: SAP configuration automation |
| [Day in the Life](docs/engagement-flow/day-in-the-life.md) | How consultants use the system |
| [Decision Log](docs/decisions/decision-log.md) | Key decisions and rationale |
