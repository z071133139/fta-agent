# Consulting Agent (Layer 1)

> Status: Ideation -- to be scoped in detail

## Overview

The Consulting Agent is the orchestrator and the primary interface for consultants performing general engagement tasks. It routes to the appropriate tool based on the consultant's current work and maintains the connection to the shared engagement context.

## Role

- Acts as the entry point for all general consulting tasks
- Routes to specialized tools based on the task at hand
- Chains tools when a task requires multiple capabilities (e.g., meeting notes → requirements + process documentation)
- Reads from and writes to the shared engagement context
- Hands off to domain specialist agents when the consultant switches to domain-specific work

## General Tools

### Requirements Engine
- **Purpose:** Convert unstructured input into structured, traceable requirements
- **Input:** Meeting notes, transcripts, voice recordings, photos of whiteboards, raw text
- **Output:** Structured requirements with categorization, priority, traceability, status
- **Key behavior:** Deduplication -- flags when a requirement has already been captured by another consultant

### Process Documenter
- **Purpose:** NLP-based process documentation and standardization
- **Input:** Verbal descriptions, notes, existing process documents
- **Output:** Standardized process flows and documentation
- **Key behavior:** Outputs are structured data (agent-consumable), with visual rendering for human review

### Deck Builder
- **Purpose:** Generate client-ready presentation deliverables
- **Input:** Engagement context, structured data, specific findings or decisions
- **Output:** PowerPoint decks
- **Key behavior:** Pulls from the engagement context -- never requires the consultant to manually compile content

### PMO / Engagement Planning Tool
- **Purpose:** Plan, track, and manage the engagement
- **Status:** To be scoped separately
- **Initial thoughts:** Ties directly into the shared backlog; the planning tool provides structure (phases, milestones, workstreams, dependencies) and the agent manages day-to-day execution against that plan

## Extensibility

New tools follow a standard interface:

```
Tool Interface:
  - name: string
  - description: string
  - input_schema: structured definition of expected inputs
  - output_schema: structured definition of outputs
  - capabilities: list of what this tool can do
  - context_access: what parts of engagement context it reads/writes
```

Adding a new tool means implementing this interface. The Consulting Agent discovers and invokes any compliant tool without modification to its core logic.

## Open Questions

- [ ] What is the interaction model? Pure conversation, or conversation + structured input (e.g., file upload)?
- [ ] How does the agent decide when to chain tools vs. use a single tool?
- [ ] What is the handoff protocol between the Consulting Agent and domain specialist agents?
- [ ] How does the PMO tool integrate with the shared backlog?
