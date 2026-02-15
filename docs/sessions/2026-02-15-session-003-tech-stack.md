# Session 003: Tech Stack Decisions

**Date:** 2026-02-15
**Duration:** Single session
**Phase:** Ideation / Design
**Participants:** Product Owner + AI PM (Claude, same persona as Sessions 001-002)

---

## Session Context

Continuation from Sessions 001 (ideation kickoff) and 002 (GL Design Coach deep dive). The product owner returned to make technology choices. This session focused on selecting every major component of the tech stack, with careful evaluation of alternatives.

## Key Discussions and Decisions

### 1. Initial Requirements Gathering

Product owner's constraints and preferences:
- **LLM providers:** Flexible -- use both Claude (Anthropic) and GPT-4o (OpenAI), route by task
- **Language:** Python (natural fit given AI/ML ecosystem)
- **Cloud:** GCP and Firebase available, open to Supabase
- **Enterprise constraints:** None currently, but stack must survive enterprise review if deployed to customer environments
- **Frontend:** Web app for the product, CLI acceptable during development
- **Agent framework and data engine:** Delegated recommendation to AI PM

### 2. Agent Framework: LangGraph (Critical Decision)

Evaluated LangGraph, CrewAI, AutoGen, OpenAI Agents SDK, and custom build.

**Custom build debate (key moment):** Product owner asked "why not custom build the agentic flow?" -- a reasonable question. AI PM initially flipped too quickly to recommending custom build. Product owner pushed back: "this change was fast -- I don't appreciate it -- think again -- this is fundamental."

Re-analysis led to a clearer recommendation for LangGraph, grounded in the distinction between:
- **Domain state:** Engagement context (what the consultant is working on) -- stored in Supabase, our responsibility
- **Workflow state:** Agent session flow (what tools have been called, where are we in the process, what's next) -- managed by LangGraph with built-in checkpointing

The custom build would start clean but converge to building a worse version of LangGraph once multi-consultant scale (5+ concurrent users), session resumability, error recovery, and streaming are needed.

**Lesson learned:** Don't flip on fundamental decisions without thorough analysis. The product owner values well-reasoned positions over agreement.

### 3. LLM Strategy: Multi-Provider via LiteLLM

Single abstraction layer to call any provider. Route by task complexity:
- Complex reasoning (code block design) → Claude Opus/Sonnet
- General tasks (requirements extraction) → Claude Sonnet / GPT-4o
- Simple routing/formatting → Claude Haiku / GPT-4o-mini

### 4. Data Analytics Engine: DuckDB + Polars

Replacing Pandas entirely. Insurance GL data can have millions of records monthly:
- DuckDB: SQL-first, embedded, 5x faster than Pandas, minimal memory
- Polars: Rust-based DataFrame operations, 7x faster CSV reading than Pandas
- Together they handle insurance data volumes on a laptop

### 5. Backend: Python + FastAPI

Natural choice -- Python is the lingua franca for AI/ML. FastAPI for async, type-safe APIs with Pydantic validation.

### 6. Database: Supabase (Postgres + pgvector)

Chosen over Firebase and raw Postgres:
- Postgres for relational engagement context data
- pgvector for semantic search (no separate vector DB)
- Built-in auth, real-time subscriptions, RLS -- all needed for multi-consultant phase
- Open-source, self-hostable -- critical for enterprise

### 7. Frontend: Next.js (React)

CLI during development for fast iteration. Next.js web app for the product -- must be visually appealing and sellable.

### 8. Document Generation: python-pptx

Template-based PowerPoint generation for the Deck Builder tool. PDF via standard Python libraries.

## Decisions Made

| Decision | ID | Summary |
|----------|-----|---------|
| Agent orchestration | DEC-018 | LangGraph |
| LLM provider | DEC-019 | Multi-provider via LiteLLM |
| Data analytics | DEC-020 | DuckDB + Polars |
| Database | DEC-021 | Supabase (Postgres + pgvector) |
| Backend | DEC-022 | Python + FastAPI |
| Frontend | DEC-023 | Next.js (React), CLI for dev |

## Artifacts Modified

- `docs/tech/tech-stack.md` -- created, full tech stack documentation with rationale
- `docs/decisions/decision-log.md` -- added DEC-018 through DEC-023
- `docs/NEXT-STEPS.md` -- updated: tech stack marked complete, priorities reordered
- `README.md` -- added tech stack doc to documentation index

## What Was NOT Discussed Yet

- GL Design Coach MVP tiering (Priority 1 for next session)
- Engagement context detailed design (Priority 2)
- Layer 1 general tools scoping
- Multi-consultant flow
- UI/UX design
- Deployment architecture details (GCP Cloud Run, etc.)
- CI/CD pipeline
- Testing strategy
- Project structure / repo layout for code

## Product Owner Notes

- Delegated framework and data engine recommendations to AI PM -- trusts the technical judgment but expects well-reasoned positions
- Explicitly called out the quick flip from LangGraph to custom build as unacceptable -- values conviction backed by analysis
- No prior LangGraph experience but has read about it -- open to learning
- Pragmatic about stack choices: cutting edge but enterprise-survivable
