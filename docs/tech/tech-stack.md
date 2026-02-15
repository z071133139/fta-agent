# Tech Stack

> Decided: 2026-02-15 (Session 003)

## Design Criteria

- **Cutting edge** -- modern, AI-native, not legacy frameworks
- **Enterprise-review survivable** -- industry-standard components, open-source where possible, self-hostable
- **Scales to multi-consultant** -- not just a personal prototype; the architecture must support 5+ concurrent users
- **Provider-flexible** -- no lock-in to a single LLM vendor

## Stack Overview

```
┌─────────────────────────────────────────────┐
│  FRONTEND: Next.js (React)                  │
│  CLI during dev, web app for product        │
├─────────────────────────────────────────────┤
│  API LAYER: Python + FastAPI                │
├─────────────────────────────────────────────┤
│  AGENT ORCHESTRATION: LangGraph             │
│  ├── Consulting Agent (router)              │
│  ├── GL Design Coach (specialist)           │
│  └── Future agents...                       │
├─────────────────────────────────────────────┤
│  LLM LAYER: LiteLLM (multi-provider)       │
│  ├── Claude (Anthropic)                     │
│  ├── GPT-4o (OpenAI)                        │
│  └── Route by task complexity               │
├─────────────────────────────────────────────┤
│  DATA ENGINE: DuckDB + Polars               │
│  └── GL data profiling, MJE analysis,       │
│      transformation, validation             │
├─────────────────────────────────────────────┤
│  DATABASE: Supabase (Postgres + pgvector)   │
│  ├── Engagement context (structured)        │
│  ├── Semantic search (pgvector)             │
│  ├── Auth (multi-consultant ready)          │
│  └── Real-time (concurrency ready)          │
└─────────────────────────────────────────────┘
```

## Component Decisions

### 1. Agent Orchestration: LangGraph

**Decision:** LangGraph
**Alternatives considered:** CrewAI, AutoGen, OpenAI Agents SDK, custom build

**Why LangGraph:**

- **Workflow state management.** FTA has two types of state: domain state (engagement context, stored in Supabase) and workflow state (where is the consultant in the 17-step design process, what tools have been called, what's next). LangGraph manages workflow state with built-in checkpointing.
- **Scale.** 5+ consultants running concurrent agent sessions with session resumability, error recovery, and streaming. Building this from scratch converges to building a framework -- just a worse one.
- **Multi-agent architecture.** FTA's layered architecture (Consulting Agent → GL Design Coach → tools) maps directly to LangGraph's graph-based design.
- **Human-in-the-loop.** Consultant steers, agent executes. LangGraph has built-in patterns for this.
- **Agent ecosystem growth.** GL Design Coach is first of many specialist agents. LangGraph gives a consistent, repeatable pattern for adding new agents.
- **LLM-provider agnostic.** Works with Claude, OpenAI, and others.
- **Enterprise-ready.** Self-hosted option, backed by well-funded company (LangChain), becoming an industry standard.
- **Observability.** LangSmith integration for tracing and debugging agent behavior.

**Why not custom build:**
- Evaluated carefully. Custom build is simpler initially for a single user, but the multi-consultant, multi-agent, long-running engagement requirements mean we'd end up rebuilding LangGraph's features (checkpointing, concurrency, streaming, error recovery) without the community and testing.
- The "build-it-yourself trap": Day 1 is clean Python classes. Month 6 is a homegrown framework nobody else can maintain.

**Why not CrewAI:**
- Good for simpler role-based teams but less control over complex flows. Still maturing.

**Why not AutoGen:**
- Microsoft is sunsetting it (merging into Agent Framework). Not a safe long-term bet.

**Why not OpenAI Agents SDK:**
- Locks into OpenAI. We need provider flexibility.

### 2. LLM Provider: Multi-provider via LiteLLM

**Decision:** Use LiteLLM as abstraction layer. Route to the best model per task.
**Why:** Single API to call any provider. Swap models without code changes. Optimize cost by routing simple tasks to cheaper models.

**Model routing strategy:**

| Task Type | Recommended Model | Rationale |
|-----------|------------------|-----------|
| Domain reasoning (GL Design Coach, code block design) | Claude Opus / Sonnet | Strong reasoning, large context window |
| General tools (requirements extraction, process docs) | Claude Sonnet / GPT-4o | Good balance of quality and cost |
| Simple routing, formatting, backlog queries | Claude Haiku / GPT-4o-mini | Fast, cheap, sufficient quality |
| Data analysis interpretation | Claude Sonnet | Strong at structured data reasoning |

### 3. Data Analytics Engine: DuckDB + Polars

**Decision:** DuckDB as primary query engine, Polars for DataFrame operations
**Alternatives considered:** Pandas, BigQuery

**Why DuckDB:**
- SQL-first analytics on CSV/Parquet files
- 5x faster than Pandas on million-row datasets
- Minimal memory footprint (streams data, spills to disk)
- No server needed -- runs embedded in Python
- Handles insurance GL data volumes (millions of records) on a laptop

**Why Polars alongside:**
- Rust-based, fast, memory-efficient
- Better than Pandas for DataFrame transformations when Python manipulation is needed
- 7x faster than Pandas for CSV reading, 5x faster for joins

**Why not Pandas alone:**
- Too slow and memory-hungry for insurance GL data at scale
- Single-threaded, can't utilize modern multi-core CPUs

**Why not BigQuery:**
- Overkill for MVP. Adds cloud dependency and cost.
- Consider for multi-tenant production later if DuckDB hits limits.

### 4. Backend: Python + FastAPI

**Decision:** Python with FastAPI
**Why:**
- Python is the lingua franca for AI/ML -- all major LLM libraries, LangGraph, DuckDB, Polars are Python-native
- FastAPI: async, fast, type-safe with Pydantic, automatic OpenAPI docs
- Pydantic for data validation and tool interface schemas
- Enterprise-standard, widely supported

### 5. Database / Persistence: Supabase (Postgres + pgvector)

**Decision:** Supabase
**Alternatives considered:** Firebase, raw Postgres

**Why Supabase:**
- **Postgres underneath** -- industry-standard relational database. Engagement context is inherently relational (decisions link to requirements link to artifacts). Enterprise-review ready.
- **pgvector** -- vector similarity search for semantic queries over engagement context. No separate vector database needed. Battle-tested (used by Notion, Replit, Scale AI).
- **Built-in auth** -- ready for multi-consultant phase without building auth from scratch.
- **Real-time subscriptions** -- ready for concurrent multi-consultant updates.
- **Open-source and self-hostable** -- critical for enterprise deployment. No vendor lock-in.
- **Row Level Security (RLS)** -- ready for permissions/scope controls (post-MVP feature).

**Why not Firebase:**
- NoSQL / document model. No joins. Not suited for relational engagement context data.
- Vector search feels bolted on (requires sync to separate store).
- Harder to self-host. Vendor lock-in to Google.

**Why not raw Postgres:**
- Would work, but we'd build auth, real-time, storage, and APIs ourselves. Supabase gives us these out of the box.

### 6. Frontend: Next.js (React)

**Decision:** CLI during development, Next.js web app for the product
**Why:**
- CLI-first during personal phase for fast iteration on agent behavior
- Next.js for the web app: React ecosystem, SSR, API routes, works naturally with Supabase SDK
- The product must be visually appealing and sellable -- CLI won't cut it for super testers or clients
- Enterprise-standard, massive ecosystem

### 7. File/Document Generation

**Decision:** python-pptx + standard libraries
**Why:**
- `python-pptx` for PowerPoint generation (Deck Builder tool)
- Template-based with dynamic content from engagement context
- PDF generation via standard Python libraries as needed
- Structured-first principle: data lives in engagement context, documents are rendered views

## Development Approach

| Phase | Frontend | Backend | Deployment |
|-------|----------|---------|------------|
| Personal (MVP) | CLI / terminal | Python + FastAPI locally | Local machine or simple GCP setup |
| Super testers | Next.js web app | FastAPI on GCP Cloud Run | Supabase cloud |
| Production | Next.js web app (polished) | FastAPI on GCP (auto-scaling) | Supabase cloud or self-hosted |

## Enterprise Review Posture

Every component in this stack is enterprise-standard:

| Component | Enterprise Credentials |
|-----------|----------------------|
| Python | Most widely used language in enterprise data/AI |
| FastAPI | Production-proven, used by Microsoft, Netflix, Uber |
| LangGraph | Backed by LangChain (well-funded), self-hosted enterprise option |
| Postgres | Gold standard enterprise database |
| Supabase | Open-source, self-hostable, SOC 2 compliant |
| React / Next.js | Industry-standard frontend |
| DuckDB | Embedded analytics standard, used by Google, Meta |

No exotic dependencies. Everything is open-source or has enterprise licensing. Self-hostable where it matters.
