# Consulting Agent (Orchestrator + Engagement Lead + PMO)

> Status: Scoping (Session 006 -- updated with MVP skills)
> Created: 2026-02-14 (Session 001)
> Last updated: 2026-02-16 (Session 006)

## Overview

The Consulting Agent is the engagement lead. It routes work to the right agent, tracks progress across all workstreams, owns the engagement plan, and drives the engagement forward. It is the agent a project manager uses daily.

In the MVP, it orchestrates two sub-agents: the **Functional Consultant** (generalist) and the **GL Design Coach** (P&C domain specialist).

## Role

- Acts as the entry point for engagement management and status
- Routes work to the Functional Consultant or GL Design Coach based on intent
- Tracks engagement state: phase, decisions, open items, blockers
- Owns the workplan: phases, milestones, tasks, dependencies
- Connects cross-agent outputs: when a GL decision affects requirements, the Consulting Agent bridges the gap

## Orchestration Skills

### LLM-Based Intent Routing (Build -- replaces keyword regex)

Determines whether a user's request should go to the Functional Consultant or the GL Design Coach:
- GL-related topics (account design, MJE analysis, code block dimensions, COA, mapping) --> GL Design Coach
- Process/requirements/deliverable topics (meeting notes, requirements, process flows, decks) --> Functional Consultant
- Engagement management topics (status, workplan, blockers, decisions) --> handled directly by Consulting Agent

**Implementation:** Lightweight LLM classifier. Single LLM call with the user message + agent descriptions. Returns the target agent. Not a full reasoning chain -- routing should add minimal latency.

### Handoff Protocol (Build)

When routing to a sub-agent:
1. Consulting Agent packages relevant engagement context (current phase, recent decisions, active open items)
2. Passes the user message + context to the target agent
3. Target agent processes and returns structured outcomes (decisions, findings, requirements)
4. Consulting Agent writes outcomes to the engagement context store

When receiving outcomes back:
- Decisions are added to the decision registry
- Findings are logged with severity and status
- Requirements are linked to the originating workstream
- Open items are updated (resolved or new ones added)

### Context Bridging (Build)

When one agent's output affects another's work:
- GL Design Coach captures a decision about profit center design --> Consulting Agent checks if any Functional Consultant requirements reference profit center and flags the connection
- Functional Consultant captures a reporting requirement --> Consulting Agent surfaces it to GL Design Coach as a constraint for the next design session
- Any agent raises an open item --> Consulting Agent tracks it and surfaces it when the relevant topic comes up in any agent

## PMO / Engagement Management Skills

### Engagement Onboarding (Build)

Kicks off a new engagement by capturing:
- Client name and organization
- Insurance sub-segment (P&C / Life / Reinsurance / Multi-line)
- Target ERP platform (SAP S/4HANA / Oracle / Workday / Undecided)
- Engagement scope (full transformation, COA only, close optimization, etc.)
- Key stakeholders (names, roles)
- Key dates and constraints

Creates the engagement record in the engagement context store.

### Workplan Management (Build)

Defines and tracks the engagement workplan:
- Standard finance transformation phases: Discovery, Current State Assessment, Future State Design, Build, Test, Cutover
- Milestones within each phase
- Tasks assigned to agents
- Dependencies between tasks (e.g., "GL account design depends on profit center decision")
- Task status: NOT_STARTED / IN_PROGRESS / BLOCKED / COMPLETED

The Consulting Agent knows the standard phase structure and proposes a workplan when the engagement starts. The user adjusts as needed.

### Decision Registry (Build)

Central log of all decisions made across all agents:
- `dimension`: What the decision is about (profit center, segment, functional area, etc.)
- `choice`: What was decided
- `rationale`: Why
- `alternatives_considered`: What else was on the table
- `status`: PROPOSED / PENDING / DECIDED / REVISED
- `decided_by`: Who made the decision
- `decided_at`: When
- `downstream_impacts`: What other decisions or workstreams are affected
- `source_agent`: Which agent captured the decision

### Open Items Tracking (Build)

Tracks unresolved questions, assumptions, and risks:
- `title`: Short description
- `detail`: Full context
- `raised_by`: Which agent or user raised it
- `assigned_to`: Who is responsible for resolution
- `status`: OPEN / IN_PROGRESS / RESOLVED / DEFERRED
- `blocking`: What workstreams or decisions this blocks
- `linked_decisions`: Related decision IDs
- `resolution`: How it was resolved (when resolved)

### Status Synthesis (LLM native)

Reads engagement state and produces natural language status:
- "Where are we?" -- current phase, percent complete, key accomplishments
- "What's blocking us?" -- open items, unresolved decisions, client dependencies
- "What did we accomplish this week?" -- decisions made, findings reviewed, requirements captured
- Weekly status report generation

### Dependency Management (Build)

Knows which workstreams depend on which decisions:
- Surfaces blockers proactively: "GL Design Coach is waiting on the profit center decision before it can proceed with segment design."
- When a decision is made, checks if it unblocks any pending tasks
- When a task is blocked, traces it back to the blocking decision or open item

### Timeline Tracking (Build)

Tracks actual vs. planned progress:
- Flags slippage early
- Adjusts the plan when scope changes
- Reports on milestone completion

### Meeting Prep (LLM native)

Before a client meeting, synthesizes:
- What was decided since the last meeting
- What's on the agenda for this meeting
- What decisions are needed from the client
- What data or input the client should bring
- Open items that need client resolution

## Extensibility

New agents follow a standard interface. Adding a new domain specialist (e.g., Close Process Architect) means:
1. Implement the agent with domain knowledge, tools, and outcome capture
2. Register it with the Consulting Agent's routing table
3. The Consulting Agent discovers it and routes relevant requests to it

No modification to the Consulting Agent's core logic required.

## MVP Scope

| Capability | MVP (V1) | Later |
|-----------|----------|-------|
| LLM-based intent routing | Yes | |
| Handoff protocol (2 agents) | Yes | |
| Context bridging | Yes | |
| Engagement onboarding | Yes | |
| Workplan management (basic) | Yes | |
| Decision registry | Yes | |
| Open items tracking | Yes | |
| Status synthesis | Yes | |
| Dependency management | | V2 |
| Timeline tracking | | V2 |
| Meeting prep | | V2 |
| Multi-agent routing (3+ agents) | | V2+ |
| Cross-agent notifications | | V2 |

## Open Questions

- [x] What is the interaction model? --> Multi-user, direct access. Each agent is independently accessible. (Session 006)
- [x] How does the agent decide when to chain tools vs. use a single tool? --> Consulting Agent routes, does not chain. Sub-agents own their tool usage. (Session 006)
- [x] What is the handoff protocol between the Consulting Agent and domain specialist agents? --> Structured context + message in, structured outcomes back. (Session 006)
- [ ] How does the PMO tool integrate with the shared backlog? --> Deferred to implementation
- [ ] What is the routing latency budget? (target: <500ms for the routing decision)
