# Architecture Overview

## Layered Architecture

FTA is built on a three-layer architecture. Each layer serves a distinct purpose and can evolve independently.

```
Consultant
    |  (explicit steering -- consultant chooses working context)
    v
+------------------------------------------------------------------+
|                    CONSULTING AGENT (Orchestrator)                |
|  Routes to the right tool or specialist based on consultant's    |
|  current task. Manages shared engagement context.                |
+------------------------------------------------------------------+
    |                    |                         |
    v                    v                         v
+-----------------+  +------------------------+  +-------------------+
| LAYER 1         |  | LAYER 2                |  | LAYER 3           |
| General Tools   |  | Domain Specialist      |  | Platform Config   |
|                 |  | Agents                 |  | Agents            |
| - Requirements  |  | - GL Design Coach(MVP) |  | - SAP Config      |
| - Process Docs  |  | - Close Process Arch.  |  | - Oracle Config   |
| - Deck Builder  |  | - Regulatory Advisor   |  | - Workday Config  |
| - PMO Planning  |  | - Subledger Specialist |  |                   |
|                 |  | - Migration Strategist |  | (FUTURE)          |
|                 |  | - TOM Designer         |  |                   |
|                 |  | - Recon Designer       |  |                   |
+-----------------+  +------------------------+  +-------------------+
         |                    |                         |
         +--------------------+-------------------------+
                              |
                    +---------v----------+
                    | SHARED ENGAGEMENT  |
                    | CONTEXT            |
                    | ("Engagement Brain")|
                    +--------------------+
```

## Layer 1: General Tools (Consulting Agent)

Horizontal capabilities that every consultant needs regardless of domain. These are **task executors** -- they perform specific, well-defined operations.

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| Requirements Engine | Convert unstructured input to structured requirements | Meeting notes, transcripts, raw text | Categorized, prioritized, traceable requirements |
| Process Documenter | NLP-based process documentation | Verbal descriptions, notes, existing docs | Standardized process flows and documentation |
| Deck Builder | Generate presentation deliverables | Agent context, structured data, findings | PowerPoint decks |
| PMO / Planning Tool | Engagement planning and tracking | Scope, milestones, team structure | Backlog, plans, status views (to be scoped separately) |

**Extensibility:** New tools can be added over time without modifying the agent core. Each tool conforms to a standard interface (input schema, output schema, capabilities), and the consulting agent knows how to invoke any compliant tool.

## Layer 2: Domain Specialist Agents

These are fundamentally different from Layer 1 tools. They are **agents with expertise** -- they reason, advise, guide, and push back. Each one encodes the knowledge of a senior domain expert.

**Characteristics of a domain specialist agent:**
- **Has deep knowledge** -- domain-specific, platform-aware, insurance-contextual
- **Has its own tools** -- specialized capabilities (e.g., COA builder, mapping generator)
- **Has memory** -- remembers engagement context, prior decisions, client constraints
- **Has opinions** -- pushes back when it sees suboptimal decisions
- **Guides a process** -- drives a structured methodology, not just answering questions
- **Has data skills** -- can ingest, transform, and validate real client data

**MVP specialist:** GL Design Coach (see [GL Design Coach spec](../agents/gl-design-coach.md))

**Future specialists:**
- Close Process Architect
- Regulatory Reporting Advisor (IFRS 17, LDTI, Solvency II)
- Subledger Integration Specialist
- Data Migration Strategist
- Target Operating Model Designer
- Reconciliation Designer

Each future specialist follows the same architectural pattern and plugs into the shared engagement context.

## Layer 3: Platform Configuration Agents (Future)

These agents close the loop from design to execution. They take the structured design artifacts produced by Layer 2 agents and translate them into platform-specific configuration.

**MVP approach:** Generate configuration-ready specifications (IMG paths, transaction codes, field values) that a functional consultant can execute. The agent does the translation work; a human executes and validates.

**Future approach:** Direct API-driven configuration in sandbox environments with automated validation.

See [Configuration Agent](../features/configuration-agent.md) for detailed scoping.

## Shared Engagement Context ("Engagement Brain")

The backbone of the entire architecture. A semantic knowledge layer that all agents and tools read from and write to. This is what makes FTA a system rather than a collection of disconnected tools.

**Key property:** When a consultant switches from one agent to another, the context does not break. The Requirements Engine knows what the GL Design Coach decided. The Deck Builder knows what the Process Documenter captured.

See [Engagement Context](../features/engagement-context.md) for detailed design.

## Steering Model

The **consultant is always in the driver's seat**. They explicitly choose which agent or tool to work with based on their current task:

- Working on requirements → Consulting Agent (Requirements Engine)
- Designing the chart of accounts → GL Design Coach
- Creating a client readout → Consulting Agent (Deck Builder)

The agent does not autonomously switch contexts. The consultant switches; the context stays connected underneath.

## ERP Platform Strategy

The architecture is ERP-agnostic by design, with SAP as the first-class implementation for MVP.

```
Domain Specialist Agent
    |
    v
Platform-Neutral Interface
    |
    +-- SAP Adapter (MVP)
    +-- Oracle Adapter (future)
    +-- Workday Adapter (future)
```

Every place the agent touches ERP-specific logic goes through a platform adapter. Adding a new ERP means implementing a new adapter, not re-architecting the agent.

See [ERP Platform Strategy](../features/erp-platform-strategy.md) for details.
