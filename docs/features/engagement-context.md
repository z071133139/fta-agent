# Shared Engagement Context ("Engagement Brain")

> Status: Ideation -- detailed design deferred, identified as a key differentiating feature

## Overview

The Engagement Context is the single source of truth for everything that happens on an engagement. Every agent and tool reads from and writes to it. It is not a database of records -- it is a semantic knowledge layer that grows as the engagement progresses.

This is the feature that makes FTA a system rather than a collection of disconnected tools.

## Core Property

**When a consultant switches between agents or tools, the context does not break.**

- The Requirements Engine knows what the GL Design Coach decided
- The Deck Builder knows what the Process Documenter captured
- Consultant B can see what Consultant A captured this morning
- The lead can ask for a cross-workstream summary at any point

## Proposed Structure

```
Engagement Context
|
|-- Engagement Profile
|   |-- Client context (size, segment, LOBs, geography)
|   |-- Current state snapshot (systems, processes, org)
|   |-- Engagement scope and objectives
|
|-- Decision Log
|   |-- Decision (what was decided)
|   |-- Rationale (why)
|   |-- Source (which agent/conversation produced it)
|   |-- Dependencies (what other decisions this connects to)
|   |-- Status (proposed | accepted | revised | rejected)
|
|-- Artifact Registry
|   |-- Requirements (linked to source conversations)
|   |-- Process documentation (linked to requirements)
|   |-- Design artifacts (COA, TOM, etc.)
|   |-- Deliverables (decks, documents)
|   |-- Lineage (which artifact informed which)
|
|-- Open Items
|   |-- Unresolved questions
|   |-- Assumptions needing validation
|   |-- Risks identified
|   |-- Owner (which agent flagged it)
|
|-- Conversation Memory
    |-- Per-agent conversation threads
    |-- Cross-agent references
    |-- Key insights extracted (not raw transcripts)
```

## AI-Native Properties

- **Semantic indexing:** Everything is embedded and linked semantically. When the GL Design Coach produces a COA decision, it's automatically linked to the requirements that drove it, the process docs it affects, and the open items it resolves.
- **Inferred cross-references:** Links between artifacts are created automatically by the system, not manually by consultants.
- **Queryable by agents:** Any agent can ask the engagement context natural-language questions: "What requirements relate to segment reporting?" "What decisions were made about intercompany design?"

## Multi-Consultant Support

- All consultants on an engagement feed into the same context
- Real-time updates -- no merge-and-pray
- Concurrency supported from day one
- Deduplication -- the agent flags when something has already been captured

## Detailed Design

The detailed design of the Engagement Context (data model, embedding strategy, persistence, concurrency model, query interface) has been **deferred for a dedicated design session**. This is recognized as one of the most important architectural components of the system.

## Open Questions

- [ ] What is the persistence layer? (Vector DB + structured store? Graph DB?)
- [ ] How is concurrency handled at the data level?
- [ ] What is the embedding and semantic linking strategy?
- [ ] How much conversation history is retained vs. summarized?
- [ ] How does context scope work across engagements? (Does knowledge from Engagement A inform Engagement B?)
