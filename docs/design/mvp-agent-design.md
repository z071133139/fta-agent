# FTA MVP Agent Design -- Skills Specification

> Status: APPROVED (Session 006)
> Created: 2026-02-16 (Session 006)
> Last updated: 2026-02-16

## Purpose

This document specifies the three-agent MVP architecture, the skills each agent needs, the interaction model between agents and users, and the shared infrastructure that connects them. It is the blueprint for building the agent harness (the next major implementation milestone).

---

## MVP Architecture

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
            |-- GL Design Coach (MVP)
            |-- Reporting Agent (future)
            |-- Close Process Architect (future)
            |-- Subledger Integration Specialist (future)
            |-- Data Migration Strategist (future)
            |-- Target Operating Model Designer (future)
            |-- Reconciliation Designer (future)
```

Three agents in MVP: **Consulting Agent**, **Functional Consultant**, **GL Design Coach**.

The human user is the client (insurance company finance team). The agents are the consulting team. The agents do the work, produce deliverables, and ask the human for decisions when needed.

---

## Consulting Agent (Orchestrator + Engagement Lead + PMO)

The engagement lead. Routes work, tracks progress, owns the plan, drives the engagement forward.

### Orchestration Skills

| Skill | Build / Existing | Detail |
|-------|-----------------|--------|
| Route to correct agent | Build | LLM-based intent routing -- determines whether work goes to Functional Consultant or GL Design Coach (replaces keyword regex) |
| Handoff protocol | Build | Passes work to Functional Consultant or GL Coach with relevant context from the engagement state. Receives structured outcomes back. |
| Context bridging | Build | When one agent's output affects another's work, the orchestrator connects them -- e.g., a GL Design Coach finding triggers a Functional Consultant requirement update |

### PMO / Engagement Management Skills

| Skill | Build / Existing | Detail |
|-------|-----------------|--------|
| Engagement onboarding | Build | Kicks off a new engagement: captures client name, sub-segment (P&C/Life/Reinsurance), ERP target, scope, key stakeholders. Creates the engagement record. |
| Workplan management | Build | Defines and tracks workstreams, milestones, dependencies, task status. Knows the standard finance transformation phases (discovery, current state, design, build, test, cutover) and maps the engagement to them. |
| Task assignment | Build | Assigns tasks to Functional Consultant or Domain Specific Agents. Tracks who's working on what. |
| Engagement state tracking | Build | Tracks what phase the engagement is in, what's been completed, what's in progress, what's blocked on client input. Single source of truth for engagement health. |
| Decision registry | Build | Central log of all decisions made across all agents -- dimension, choice, rationale, status (proposed/pending/decided/revised), who decided, when, downstream impacts |
| Open items tracking | Build | Tracks unresolved questions, assumptions, risks. Links each to the agent/workstream that raised it and the person responsible for resolution. |
| Status synthesis | LLM native | Reads engagement state and produces natural language status updates -- "where are we?", "what's blocking us?", "what did we accomplish this week?" Generates weekly status reports. |
| Dependency management | Build | Knows which workstreams depend on which decisions. Surfaces blockers proactively -- "GL Design Coach is waiting on the profit center decision before it can proceed with segment design." |
| Timeline tracking | Build | Tracks actual vs. planned progress. Flags slippage early. Adjusts the plan when scope changes. |
| Meeting prep | LLM native | Before a client meeting, synthesizes: what was decided last time, what's on the agenda, what decisions are needed, what data/input the client should bring. |

---

## Functional Consultant

The generalist. Handles cross-cutting consulting work that isn't domain-specific.

| Skill | Build / Existing | Detail |
|-------|-----------------|--------|
| Requirements extraction | LLM native + structured output | Accepts unstructured input (meeting notes, transcripts, emails, raw text). Extracts structured requirements: category, priority, source, traceability, status. Output as Pydantic-validated records. |
| Requirements deduplication | Build | Compares new requirements against existing ones in the engagement context. Flags duplicates and near-duplicates. Merges or links as appropriate. |
| Process flow generation | LLM native + structured output | Accepts verbal descriptions or notes about current/future-state processes. Produces structured process flows: steps, systems involved, roles, inputs/outputs, accounts touched. |
| Deck generation | Build | Generates PowerPoint deliverables using python-pptx. Pulls content from engagement context (findings, decisions, mappings, requirements, process flows). Uses templates. Consultant never compiles content manually. |
| Read/write engagement context | Build | Shared access to all structured artifacts -- decisions, findings, requirements, process flows, mappings. Can query ("what requirements relate to segment reporting?") and write (new requirements, updated process flows). |

---

## GL Design Coach (MVP Domain Specific Agent)

The P&C insurance GL/COA design specialist. Does the real analytical work.

### Domain Knowledge (Existing -- encoded in prompt modules)

| Skill | Status | Detail |
|-------|--------|--------|
| P&C insurance accounting | Existing | Loss reserves, UPR, reinsurance, state-level reporting, accident year, NAIC, salvage/subrogation, ASC 944 |
| SAP S/4HANA platform | Existing | ACDOCA dimensions, document splitting, account groups, CI_COBL extensions, cross-dimension rules |
| SAP-to-insurance translation | Existing | 17-entry term mapping, 6 functional areas, anti-pattern enforcement |
| Opinions framework | Existing | MUST DO / WORTH IT / PARK IT / DON'T TOUCH -- every recommendation categorized |
| 17-step design process | Existing | Internalized process awareness, tracks engagement position |

### Data Skills (Build)

| Skill | Build / Existing | Detail |
|-------|-----------------|--------|
| Data ingestion | Build | Read CSV/Parquet files (postings, account master, trial balance). Validate required columns. Load into DuckDB via Polars. |
| Account profiling | Build | SQL queries that produce AccountProfile records -- posting stats, balance direction, dimension usage, counterparties, seasonal patterns, MJE target flag, classification match. Joins posting behavior with account master configuration. |
| MJE detection | Build | SQL queries that find all 7 MJE pattern types: recurring identical, recurring template, reclassification, intercompany, accrual/reversal, correction, consolidation. Profiles by preparer (key-person risk). |
| MJE-to-COA linking | LLM + data | Agent reasons over detected MJE patterns and proposes specific code block design changes that would eliminate or automate each pattern. |
| Progressive disclosure | Build | Pre-computes 3 levels: Level 1 (executive summary), Level 2 (category drill-down), Level 3 (account detail). Agent decides which level to present based on conversation context. |

### Design Skills (LLM native + structured output)

| Skill | Build / Existing | Detail |
|-------|-----------------|--------|
| Code block dimension design | LLM native | Reasons through each ACDOCA dimension with P&C context. Surfaces cross-dimension impacts when a decision is made (e.g., "profit center = LOB means segment derives as Life vs Non-Life"). |
| Target COA construction | LLM + data | Builds target account structure based on current-state analysis + design decisions. Groups by account type, maps to NAIC lines, assigns functional areas. |
| Legacy-to-target mapping | LLM + data | Proposes account mappings based on account profiles + target COA. Assigns confidence (HIGH/MED/LOW). Flags splits and merges. |

### Outcome Capture (Build)

| Skill | Build / Existing | Detail |
|-------|-----------------|--------|
| Capture findings | Build | Write structured findings to engagement context -- category, severity, title, detail, affected accounts, recommendation, recommendation category, status |
| Capture decisions | Build | Write structured design decisions -- dimension, choice, rationale, alternatives considered, downstream impacts, status, decided by |
| Capture mappings | Build | Write structured account mappings -- legacy account, target account, confidence, rationale, split/merge flags, status |

---

## Interaction Model

### Design Principle

Each agent is self-explanatory to the person who uses it. No training manual. A project manager opens the Consulting Agent and immediately knows what they can do. An accounting expert opens the GL Design Coach and immediately knows what it offers. The system speaks each user's professional language.

### Multi-User, Direct Access

Different business users interact with different agents based on their role:

```
Project Manager   <--> Consulting Agent (PMO, status, workplan)
Accounting Expert <--> GL Design Coach (analysis, design, decisions)
Business Analyst  <--> Functional Consultant (requirements, process, decks)
                          |
                  Engagement Context
               (shared across all agents)
```

Each agent is a workspace. Users go directly to the agent relevant to their expertise. There is no single entry point or receptionist routing -- each agent is independently accessible.

### Engagement Context Is the Connective Tissue

When the accounting expert makes a design decision with the GL Coach, the project manager sees it reflected in the Consulting Agent's status. When the business analyst captures a requirement with the Functional Consultant, the GL Coach can reference it when designing the target COA.

All agents read from and write to the same engagement context. No one carries information between agents manually.

### Each Agent Introduces Itself

When a user opens an agent for the first time on an engagement:

**Consulting Agent (to the project manager):**
> "I'm managing the Acme Insurance finance transformation. Here's where we stand: current state analysis is complete, code block design is 40% done -- profit center and segment are decided, 4 dimensions remaining. Two items are blocked on business input. Want the full status, or should we look at the workplan?"

**GL Design Coach (to the accounting expert):**
> "I'm working on the GL design for Acme's S/4HANA migration. I've analyzed 2,800 accounts and found 3 findings that need your review. The most critical: 25 accounts receive manual journal entries -- I have root causes mapped to design recommendations. Where would you like to start?"

**Functional Consultant (to the business analyst):**
> "I'm handling requirements and documentation for the Acme engagement. We have 12 requirements captured so far, 3 are unvalidated. I can also help with process documentation or building a deck for the steering committee. What do you need?"

### Proactive Guidance

Each agent drives its own workstream:
- The GL Coach surfaces findings, recommends next design decisions, flags cross-dimension impacts
- The Consulting Agent flags blockers, tracks timelines, surfaces dependencies between workstreams
- The Functional Consultant flags incomplete requirements, links them to design decisions, prepares deliverables proactively

### Cross-Agent Notifications

When an action in one workspace affects another:
- GL Coach captures a decision --> Consulting Agent's decision registry updates, project manager sees it in status
- Functional Consultant captures a requirement that impacts COA design --> GL Coach can reference it in the next session
- Consulting Agent flags a blocker on a domain agent --> that agent surfaces it to its user in the next session

### Outcome Visibility

Each agent can surface structured outcomes relevant to its user:
- Project manager asks Consulting Agent: "Show me all open decisions" --> formatted table across all agents
- Accounting expert asks GL Coach: "What MJE patterns did you find?" --> structured MJE report
- Business analyst asks Functional Consultant: "What requirements are still unvalidated?" --> filtered requirements list

These are structured artifacts in the engagement context, not chat history.

---

## Shared Infrastructure (All Agents Use)

| Component | Build / Existing | Detail |
|-----------|-----------------|--------|
| Engagement context store | Build | DuckDB-based persistence. All structured artifacts: decisions, findings, requirements, process flows, mappings, files loaded. Queryable by all agents. Survives process restarts. |
| LLM invocation | Existing | LangChain ChatAnthropic / ChatOpenAI via router |
| Tool-use loop | Existing | LangGraph ToolNode + tools_condition pattern |
| Structured output schemas | Existing | Pydantic outcome models (AccountProfile, AnalysisFinding, DimensionalDecision, TargetAccount, AccountMapping, MJEPattern, ReconciliationResult) + Polars schemas |
| Agent state | Build | Extended AgentState with engagement context -- messages + engagement metadata + data state + active decisions |
| Synthetic test data | Existing | ~1M postings with 7 embedded MJE patterns, 3,100 accounts, 12 months |

---

## What We Already Have vs. What We Need to Build

### Already Built

- Domain knowledge prompt modules (core, P&C, SAP, translation) -- ~25K chars
- Outcome schemas (7 Pydantic models + Polars schemas)
- DataEngine wrapper (DuckDB + Polars I/O)
- Synthetic data generator with embedded MJE patterns
- Evaluation framework (15 criteria, 14 test scripts)
- Project skeleton (FastAPI, LangGraph, CLI)
- Keyword-based routing (to be replaced with LLM routing)
- Frontend skeleton (Next.js, 6 outcome pages, TanStack Table, dark theme)

### Needs to Be Built

- **Agent harness**: tool-use loop, LLM routing, handoff protocol, state management
- **Data pipeline**: file ingestion, account profiling SQL, MJE detection SQL, progressive disclosure
- **Tool definitions**: @tool decorated functions bridging agents to data engine and engagement context
- **Engagement context store**: DuckDB tables for decisions, findings, requirements, mappings, files, engagement metadata
- **Consulting Agent logic**: engagement planning, status tracking, workplan management
- **Functional Consultant logic**: requirements extraction, process flow generation, deck generation
- **CLI upgrade**: engagement-aware REPL with persistence

---

## Relationship to Other Documents

| Document | Relationship |
|----------|-------------|
| [master-plan.md](../plans/master-plan.md) | This design is the detailed agent spec for Phase 1 |
| [v1-build-plan.md](../plans/v1-build-plan.md) | Agent harness build maps to a new iteration in the build plan |
| [consulting-agent.md](../agents/consulting-agent.md) | Updated to reflect MVP skills defined here |
| [gl-design-coach.md](../agents/gl-design-coach.md) | Existing spec; data skills and outcome capture refined here |
| [functional-consultant.md](../agents/functional-consultant.md) | New agent spec created from this design |
| [engagement-context.md](../features/engagement-context.md) | Infrastructure design informed by this agent spec |
