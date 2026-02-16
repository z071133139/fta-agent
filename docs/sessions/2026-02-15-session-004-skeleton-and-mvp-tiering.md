# Session 004: Project Skeleton Build + GL Design Coach MVP Tiering

**Date:** 2026-02-15
**Duration:** Single session
**Phase:** Design → Build Transition
**Participants:** Product Owner + AI PM (Claude)

---

## Session Context

Continuation from Session 003 (tech stack decisions). All design and technology choices were made. This session transitioned from design to code -- building the project skeleton and tiering the GL Design Coach for MVP.

## What Was Built

### Project Skeleton (6 commits)

Full working project skeleton, end-to-end tested with a live Claude API call:

| Component | Files | Status |
|-----------|-------|--------|
| **uv project setup** | pyproject.toml, .python-version, .gitignore, .env.example, uv.lock | Working |
| **Config** | src/fta_agent/config.py (Pydantic Settings) | Working |
| **FastAPI** | api/app.py, routes/health.py, routes/chat.py | Working |
| **LangGraph agents** | agents/state.py, consulting_agent.py, gl_design_coach.py | Working |
| **LLM layer** | llm/router.py (ChatAnthropic/ChatOpenAI + LiteLLM config) | Working |
| **Data engine** | data/engine.py (DuckDB + Polars) | Working |
| **CLI** | cli/chat.py (REPL, fta-chat entry point) | Working |
| **Tests** | 15 tests (health, routing, graph structure, data engine) | All passing |
| **Dev tooling** | ruff lint + format, mypy strict mode | All clean |

**Key architecture decisions confirmed in code:**
- Manual StateGraph (not create_react_agent) -- explicit graph construction for full control
- Keyword-based routing in skeleton (GL/COA/chart of accounts/code block → GL Design Coach)
- ChatAnthropic/ChatOpenAI directly in nodes (not ChatLiteLLM) -- first-class tool binding
- Single shared AgentState (TypedDict with add_messages reducer)
- Tests don't require API keys -- all pass with mock keys

**End-to-end verification:** Sent "What is a chart of accounts?" through the live agent. Message hit the keyword router → GL Design Coach → Claude with domain system prompt → returned a P&C-relevant response.

### GL Design Coach MVP Tiering (3 decisions)

Tiered the comprehensive GL Design Coach spec into V1 / V2 / Future:

**V1 (Personal Use MVP):**
- P&C sub-segment only (DEC-026)
- Real data from day one -- posting data + account master + trial balance (DEC-027)
- Account profiling, MJE detection, pattern linking to COA design
- Insurance language translation, opinions framework, 17-step process guidance
- Hybrid knowledge encoding -- prompts + RAG (DEC-028)

**V2 (Super Testers):**
- Add Life/Annuity sub-segment
- Legacy→target mapping with confidence scores
- OLD=NEW reconciliation
- Persistent analysis store (Supabase)
- Specialist tools as callable (Code Block Designer, COA Builder, Gap Analyzer)

**Future:**
- Reinsurance, Regulatory Cross-Ref, SAP automation rules, audit risk scoring, Layer 1 integration, Oracle/Workday

## Decisions Made

| Decision | Summary |
|----------|---------|
| DEC-026 | GL Design Coach MVP: P&C sub-segment only |
| DEC-027 | GL Design Coach MVP: real data from day one (posting data + account master + trial balance) |
| DEC-028 | Knowledge encoding: hybrid (core in system prompts, reference material via RAG) |

## Notable Moments

- **API key safety:** Product owner pasted a live Anthropic API key in chat. Immediately flagged -- key was revoked and a new one generated. Good reminder to never share secrets in conversation.
- **Supabase gap identified:** Product owner asked why no Supabase was set up. The plan didn't include it (correctly -- NEXT-STEPS.md explicitly deferred Supabase to the Engagement Context design session). This confirmed the docs are being used as intended.
- **Hidden files on macOS:** Product owner couldn't find .env.example in Finder. Resolved with Cmd+Shift+. shortcut to show hidden files.

## Documents Updated

| Document | Changes |
|----------|---------|
| docs/agents/gl-design-coach.md | Added full MVP Tiering section (V1/V2/Future), resolved 4 of 5 open questions |
| docs/decisions/decision-log.md | Added DEC-026, DEC-027, DEC-028 |
| docs/NEXT-STEPS.md | Phase updated to Build, skeleton + tiering marked complete, priorities renumbered, session 004 logged |

## What's Next (Priority 1 for Tomorrow)

**Design the Engagement Context ("Engagement Brain")**

This is the backbone that everything connects to. The GL Design Coach V1 needs it for persistent analysis storage (V2), but the data model and Supabase schema need to be designed first.

What needs to happen:
- Define the data model (what's stored, how it's structured)
- Design the Supabase schema (Postgres tables + pgvector embeddings)
- Design the semantic linking strategy (how are artifacts cross-referenced?)
- Design the concurrency model (multiple consultants writing simultaneously)
- Define the context query interface (how do agents ask questions of the context?)
- Address context growth: how does it scale over a multi-month engagement?

**Relevant docs to review before session:**
- docs/features/engagement-context.md (partial structure, open questions)
- docs/tech/tech-stack.md (Supabase decided as persistence layer)
- docs/NEXT-STEPS.md (pickup document)
