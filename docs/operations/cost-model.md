# Cost Model

> Status: Preliminary estimates -- to be refined with real usage data

## Overview

FTA's cost structure has two dimensions: the cost to build the product (development) and the cost to run it (runtime inference). Both are primarily driven by LLM token consumption.

## 1. Development Cost

Cost of using LLM assistance (Claude Code or similar) to build FTA.

### Estimates

| Phase | Scope | Estimated Tokens |
|-------|-------|-----------------|
| Architecture & design sessions | Agent harness, context model, tool interfaces | 3M-8M |
| Layer 1: General tools | Requirements Engine, Process Documenter, Deck Builder | 5M-12M |
| Layer 2: GL Design Coach | Knowledge base, tools, data skills, SAP adapter | 5M-15M |
| Engagement context | Persistence, semantic linking, concurrency | 3M-8M |
| UI / frontend | Conversational interface, backlog view, renderers | 3M-10M |
| Testing & iteration | Debugging, refinement, edge cases | 3M-10M |
| **Total MVP estimate** | | **20M-50M tokens** |

### Variables That Affect Development Cost
- Complexity of data transformation logic (GL conversion)
- Depth of SAP-specific knowledge encoding
- Amount of iteration during debugging
- Context window size per session (grows with file complexity)

## 2. Runtime Cost (Per-Engagement)

Cost of running FTA once deployed, measured per consultant interaction.

### Per-Action Estimates

| Action | Token Range | Notes |
|--------|------------|-------|
| Simple tool invocation (notes to requirements) | 5K-15K | Light processing, structured output |
| Process documentation generation | 10K-30K | Depends on input complexity |
| Deck generation | 10K-25K | Pulls from engagement context |
| GL Design Coach session (single turn) | 10K-30K | Domain reasoning + context retrieval |
| GL Design Coach session (multi-turn, deep design) | 50K-100K | Extended conversation with memory |
| Data transformation (GL conversion) | Variable | Depends on data volume; may not be token-driven |
| Cross-context query ("summarize today") | 10K-50K | Scales with engagement context size |
| Backlog interaction | 3K-10K | Lightweight |

### Per-Consultant Per-Day Estimate

| Usage Intensity | Tokens/Day | Description |
|----------------|------------|-------------|
| Light | 50K-100K | Occasional tool use, short sessions |
| Moderate | 100K-300K | Regular tool use, some specialist sessions |
| Heavy | 300K-500K | Deep specialist sessions, data work, cross-context queries |

### Monthly Projections (5 Consultants)

| Scenario | Tokens/Month | Notes |
|----------|-------------|-------|
| Light usage | 5M-10M | Early adoption, occasional use |
| Moderate usage | 10M-30M | Regular daily use across team |
| Heavy usage | 30M-50M | Full team, intensive design phase |

## 3. Cost Optimization Strategies

### Model Routing
Not every operation needs the most capable (and expensive) model. Route by task complexity:

| Task Type | Recommended Model Tier | Rationale |
|-----------|----------------------|-----------|
| Backlog queries, simple formatting | Small / fast model | Low reasoning, high speed |
| Requirements extraction, process docs | Mid-tier model | Moderate reasoning |
| GL Design Coach reasoning | Large / capable model | Deep domain reasoning required |
| Data transformation logic | Code-optimized model | Structured data processing |
| Cross-context synthesis | Large / capable model | Complex retrieval + reasoning |

### Context Management
- Summarize older conversation history instead of carrying full transcripts
- Use retrieval (RAG) to pull relevant context instead of loading everything
- Cache frequently accessed engagement context

### Caching
- Cache common domain knowledge (SAP GL structures, insurance COA patterns)
- Cache repeated queries and tool outputs
- Avoid re-processing unchanged data

## 4. Cost Tracking Plan

Build usage tracking into the MVP from day one:

### Metrics to Capture
- Tokens consumed per action type
- Tokens consumed per agent/tool
- Tokens consumed per consultant per day
- Context size growth over engagement lifetime
- Cache hit rates

### Tracking Implementation
- [ ] Instrument every LLM call with token counting
- [ ] Log action type, agent, consultant, token count, model used
- [ ] Build a simple dashboard for cost visibility
- [ ] Set up alerts for unusual consumption spikes

### Optimization Cycle
1. Measure real usage during personal phase
2. Identify highest-cost actions
3. Optimize (model routing, caching, context management)
4. Re-measure
5. Repeat before scaling to super testers

## 5. Pricing Considerations (Future)

When FTA moves beyond personal use, the cost model informs pricing:

- **Per-engagement flat fee?** Predictable for clients, risky if usage varies
- **Per-consultant-seat?** Simple, but doesn't reflect actual usage
- **Usage-based?** Aligns cost with value, but harder to predict for buyers
- **Hybrid?** Base seat fee + usage above threshold

This decision is deferred until real usage data is available from the personal and super tester phases.

## Open Questions

- [ ] Which LLM provider(s) will FTA use? (Anthropic, OpenAI, open-source, mix?)
- [ ] What are the actual per-token costs for the chosen provider(s)?
- [ ] How much of the data transformation work is token-driven vs. traditional compute?
- [ ] What is the engagement context size ceiling before performance/cost degrades?
- [ ] How does cost scale with engagement duration (2-month vs. 6-month project)?
