# Shared Backlog

> Status: Ideation

## Overview

The backlog is managed by the agent, not by an external tool. Consultants interact with the backlog conversationally through the agent, while the backlog itself is persisted in a structured store and can be rendered as a visual board when needed.

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backlog interface | Agent-managed (conversational) | AI-native -- consultants ask the agent, not navigate a tool |
| Persistence | Structured store (to be determined) | Must be displayable and queryable |
| Visual view | Yes -- rendered on demand | Consultants and leads need a scannable board view |
| Lead authority | Lead consultant can update, prioritize, reassign | Maintains human oversight and engagement governance |
| Concurrency | Supported from day one | Multiple consultants working simultaneously |
| Permissions | Post-MVP | Initially all consultants see everything |

## Interaction Model

### Consultant interactions:
- "What should I work on next?"
- "Add a task: finalize segment hierarchy design"
- "Mark the COA natural accounts task as done"
- "What's still open on the GL workstream?"

### Lead interactions:
- "Summarize today's progress across all workstreams"
- "Reprioritize: move regulatory reporting tasks ahead of close process"
- "Reassign the intercompany design task to Consultant B"
- "What's at risk this week?"

### Agent-initiated:
- "Consultant A's workshop surfaced a new subledger requirement that may affect Consultant B's close process workstream"
- "The COA design task has a dependency on segment hierarchy, which is still open"
- "No one has worked on regulatory reporting requirements in 5 days -- should this be reprioritized?"

## Integration with PMO Tool

The shared backlog is closely tied to the PMO / Engagement Planning tool (to be scoped separately). The PMO tool provides the macro structure (phases, milestones, workstreams), and the backlog provides the day-to-day task layer within that structure.

## Open Questions

- [ ] What is the data model for backlog items? (task, subtask, dependency, status, assignee, workstream, priority)
- [ ] How does the backlog connect to the engagement context? (Are completed tasks linked to the artifacts they produced?)
- [ ] What does the visual board view look like?
- [ ] Should the backlog integrate with external tools (Jira, ADO) or remain self-contained?
