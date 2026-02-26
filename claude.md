# Finance Transformation Agent (FTA)

AI-native insurance finance transformation. Python/FastAPI + LangGraph backend · Next.js frontend · Monorepo.

---

## Skills — Read Before Building

For all UI work, read before writing any code:
- `/mnt/skills/public/frontend-design/SKILL.md` — aesthetic principles
- `.claude/skills/ai-native-enterprise-ui.md` — agentic workflow UI patterns

For document/file generation, check `.claude/skills/` for a relevant skill first.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  FRONTEND: Next.js (App Router)             │
│  CLI during dev · web app for product       │
├─────────────────────────────────────────────┤
│  API LAYER: Python + FastAPI                │
│  SSE streaming for agent output             │
├─────────────────────────────────────────────┤
│  AGENT ORCHESTRATION: LangGraph             │
│  ├── Consulting Agent (router + PMO)        │
│  ├── GL Design Coach (P&C specialist MVP)   │
│  └── Future specialist agents...            │
├─────────────────────────────────────────────┤
│  LLM LAYER: LiteLLM (multi-provider)       │
│  ├── Claude Sonnet/Opus — domain reasoning  │
│  ├── Claude Haiku — routing, formatting     │
│  └── GPT-4o — fallback / comparison        │
├─────────────────────────────────────────────┤
│  DATA ENGINE: DuckDB + Polars               │
│  GL data profiling, MJE analysis,           │
│  transformation, validation                 │
├─────────────────────────────────────────────┤
│  DATABASE: Supabase (Postgres + pgvector)   │
│  ├── Engagement context (structured)        │
│  ├── Semantic search (pgvector)             │
│  ├── Auth (multi-consultant ready)          │
│  └── Real-time (concurrency ready)          │
└─────────────────────────────────────────────┘
```

Monorepo layout: `src/fta_agent/` (backend) · `web/` (frontend) · `tests/` · `docs/` · `scripts/`

---

## Interaction Model

FTA agents are a **virtual consulting team** serving human consultants. The human users are consultants (not the end clients). Multiple consultants work on the same engagement, each using the agent most relevant to their role.

- **Consulting Agent** — Project manager persona. Status, workplan, decisions, open items.
- **GL Design Coach** — Accounting expert persona. GL analysis, dimension design, COA.
- **Functional Consultant** — Business analyst persona. Requirements, process flows, decks.

**Tool-level locking:** Some tools are exclusive (one active user per engagement at a time — e.g. GL data analysis). Others are multi-user (Functional Consultant tools). Lock state is visible to all consultants.

**Auth:** Supabase auth — do not build custom auth. Every action is attributed to a consultant. Engagement isolation via Row Level Security.

**Agent registry:** Adding a new agent = one declarative entry in the registry. Router and handoff protocol discover agents from the registry.

---

## Backend Standards

### Package Management — uv only

```bash
uv sync                          # install all deps
uv add <package>                 # add dependency
uv add --dev <package>           # add dev dependency
uv run pytest                    # run tests
uv run uvicorn fta_agent.main:app --reload
```

Never use `pip install` directly. `pyproject.toml` is the single source of truth.

### FastAPI

- Async-first — all endpoints `async def`, all I/O awaited
- Pydantic v2 with `Field` constraints on all models
- CORS configured for localhost:3000
- App factory pattern — `create_app()` in `main.py`, never module-level singleton
- SSE via `StreamingResponse` with `media_type="text/event-stream"` for all agent output
- Versioned routers: `api/v1/`

### LangGraph

Two types of state — keep them strictly separate:
- **Workflow state** — LangGraph owns this (session, tool calls, conversation history, checkpointing)
- **Domain state** — Supabase owns this (engagement context, requirements, artifacts, decisions)

- Use `astream_events(version="v2")` for streaming agent output to SSE
- `interrupt_before` for all human-in-the-loop decision nodes — never auto-proceed
- One file per graph node in `agent/nodes/`
- LangSmith for tracing and debugging in development

### LiteLLM — Model Routing

Route by task type. Never hardcode a model name outside the routing config:

| Task | Model |
|------|-------|
| Domain reasoning (GL design, COA mapping) | `claude-opus-4-6` or `claude-sonnet-4-6` |
| General tools (requirements, process docs) | `claude-sonnet-4-6` or `gpt-4o` |
| Routing, formatting, simple queries | `claude-haiku-4-5` or `gpt-4o-mini` |
| Data analysis interpretation | `claude-sonnet-4-6` |

### Data Layer

- **DuckDB** — primary analytics engine for GL data (SQL-first, embedded, handles millions of rows)
- **Polars** — DataFrame operations when Python manipulation needed (never Pandas)
- **DataEngine wrapper** — all DuckDB/Polars calls go through this class, no raw SQL outside it
- Dual schema pattern per entity: Pydantic model (API boundary) + Polars schema dict (DataEngine)

### Supabase

- Postgres for all structured engagement context — relational, not document store
- pgvector for semantic search over engagement context — no separate vector DB
- Use Supabase auth — do not build custom auth
- Use async Supabase Python client
- Row Level Security (RLS) on all tables — engagement isolation by design

### Prompt Architecture

- All prompts are markdown files in `src/fta_agent/prompts/`
- Never hardcode prompts inline in Python
- `build_system_prompt(workflow, context)` is the single entry point for prompt assembly
- LangSmith links traces to prompt versions

### Code Style

```toml
[tool.ruff]
line-length = 88
target-version = "py312"
select = ["E", "F", "I", "UP", "B", "SIM", "TCH"]

[tool.mypy]
strict = true
python_version = "3.12"
```

- `from __future__ import annotations` in every file
- `StrEnum` for all categoricals — never raw strings
- Type annotations everywhere — no bare `Any` without a comment explaining why
- No `print()` in production — use `structlog` with JSON output
- No bare `except Exception` — catch specific exceptions, log with context

---

## Frontend Standards

### Stack

- Next.js 15, App Router — no Pages Router
- Tailwind CSS
- Shadcn/ui — primitives only, customized via CSS variables, never fork source
- TanStack Table — all data grids, virtualized for large GL datasets
- Framer Motion — agent state transitions only, not decorative
- `@microsoft/fetch-event-source` — SSE consumption, never native EventSource
- Zustand — client/UI state only (agent status, interrupt state, trace level)
- TanStack Query — all server state (session data, outputs, engagement context)
- `ts-pattern` — exhaustive match on SSE event types

### Rendering

- Server Components by default — `'use client'` only at leaf components that need hooks/interactivity
- `export const dynamic = 'force-dynamic'` on all agent-driven pages
- `loading.tsx` Suspense boundaries on every data-dependent segment
- Generate TypeScript types from FastAPI OpenAPI schema — never hand-write them:

```bash
npx openapi-typescript http://localhost:8000/openapi.json -o web/types/api.generated.ts
```

### State — strict separation

- **Zustand** — agent status, interrupt payloads, trace disclosure level, UI toggles. Never server data.
- **TanStack Query** — all data fetched from the API. Never UI state.

### SSE Event Envelope

Every backend SSE event must conform to:

```typescript
type SSEEvent = {
  type: 'token' | 'tool_call' | 'trace_step' | 'interrupt' | 'complete' | 'error'
  session_id: string
  timestamp: string
  payload: Record<string, unknown>
}
```

Use `ts-pattern` exhaustive match on `event.type` — missing cases are compile errors.

---

## UI Design — Skills and Approach

Before writing any UI code, always read both skill files in order:
1. `/mnt/skills/public/frontend-design/SKILL.md` — core aesthetic philosophy
2. `.claude/skills/ai-native-enterprise-ui.md` — FTA-specific agentic patterns

These skills are not optional background reading. They contain the design decisions that make this product look and feel distinct from generic AI tools. Read them, then code.

### Aesthetic Direction — FTA Specific

FTA's UI sits at the intersection of two worlds: premium fintech (Stripe, Linear, Vercel — refined, fast, intentional) and mission control (calm authority, information density that signals competence). It is emphatically not a chatbot UI. It is not a generic SaaS dashboard. Consultants and finance leaders will judge it in 10 seconds.

The defining visual tension for every screen: **structured data density without cognitive overload.** Insurance GL data, COA mappings, and gap analyses are inherently dense. The design must make that density feel controlled and purposeful — not overwhelming.

Dark-mode first. The slate palette below is the base. Agent activity is the only source of color animation — everything else is static and deliberate.

### Agent State Machine — Visual Language

Every UI screen that involves an active agent must reflect exactly one of these states:

| State | Visual Treatment |
|-------|-----------------|
| IDLE | Dim static icon, no animation |
| THINKING | Slow blue pulse (`--agent-thinking`), streaming ellipsis in mono font |
| ACTING | Step counter + tool call label, elapsed time ticker |
| AWAITING_INPUT | Amber InterruptCard dominates the viewport — impossible to miss |
| COMPLETE | Brief emerald flash, then settle to static |
| ERROR | Red accent, error message, explicit retry path |

### Core Component Patterns

**AgentStatusBar** — persistent across all workflow screens. Shows: active agent name, current state with animation, elapsed time. Model/token info visible only in debug mode.

**TracePanel** — three-level progressive disclosure of agent reasoning. Controlled by `traceLevel` in Zustand store:
- Level 0 (default): outcome only — "Mapped 47 GL accounts to IFRS 17 structure"
- Level 1: step summary with icons, labels, durations — for analysts
- Level 2: raw tool calls and inputs — engineers only, never shown by default

Never show Level 2 content to non-engineers. Never show raw JSON at Level 0 or 1.

**InterruptCard** — when the agent hits a `human_review` node, this takes over. Amber border. Full-width or modal. Must show: what the agent is asking, why, and the consequences of approve vs. decline. Keyboard: Enter = approve, Esc = cancel. Never auto-dismiss.

**WorkflowSpine** — persistent left sidebar showing the multi-step engagement workflow (discovery → GL design → validation → output). Each step: status icon, name, elapsed time if complete, activity indicator if active. Expandable per step for detail.

**OutputReview** — split view after agent completes a deliverable. Agent output left, source evidence and reasoning right. Inline edit capability. Confidence indicators per section. One-click export (PDF, Excel, clipboard).

### Streaming Output Rendering

- Never display raw token stream directly — buffer and reveal word-by-word or sentence-by-sentence
- Show a blinking cursor in mono font while waiting for first token
- For tabular output (COA rows, gap analysis items): reveal rows progressively as they complete, not all at once
- `@microsoft/fetch-event-source` handles the SSE connection — never native EventSource
- `ts-pattern` exhaustive match on event types — missing cases are compile errors

### Trust-Building Requirements

FTA is selling AI to skeptical insurance finance professionals. Every screen must:
- Show source attribution on every recommendation — which document, which section
- Show confidence indicators on every agent output — never present uncertainty as certainty
- Provide human override on every agent decision — no irreversible action without confirmation
- Maintain an audit trail — every agent action logged and accessible
- Degrade gracefully — if the agent fails, surface a clear manual path

### Typography

```css
--font-display: "Instrument Serif", Georgia, serif;       /* headings */
--font-body:    "DM Sans", system-ui, sans-serif;         /* UI chrome */
--font-mono:    "JetBrains Mono", "Fira Code", monospace; /* agent output, data, code */
```

### Color Palette

```css
--bg-base:        #0F172A;  /* slate-900 */
--bg-surface:     #1E293B;  /* slate-800 */
--bg-surface-alt: #334155;  /* slate-700 */
--text-primary:   #F1F5F9;
--text-muted:     #94A3B8;  /* slate-400 */
--accent:         #3B82F6;  /* blue-500 */

/* Agent state — exclusive semantics, don't reuse for other purposes */
--agent-thinking: #3B82F6;  /* blue pulse */
--agent-waiting:  #F59E0B;  /* amber — interrupt/awaiting input */
--agent-success:  #10B981;  /* emerald */
--agent-error:    #EF4444;  /* red */

/* Domain */
--confidence-high:   #10B981;
--confidence-medium: #3B82F6;
--confidence-low:    #94A3B8;
--severity-critical: #EF4444;
--severity-high:     #F59E0B;
--severity-medium:   #EAB308;
--severity-low:      #94A3B8;
```

### Badge Conventions

- Severity: red (critical) → amber (high) → yellow (medium) → slate (low)
- Confidence: emerald (high) → blue (medium) → slate (low)
- Decision status: amber (pending) → emerald (approved) → red (rejected) → slate (deferred)
- Agent state: blue pulse (thinking) → amber (awaiting input) → emerald (complete) → red (error)

### TypeScript

```json
{ "strict": true, "noUncheckedIndexedAccess": true, "exactOptionalPropertyTypes": true }
```

No `any`. No `as Type` without an explanatory comment. Discriminated unions over optional fields for variant types.

---

## Testing

### Backend

- pytest + pytest-asyncio with `asyncio_mode = "auto"`
- Zero LLM calls in any test — mock at the LiteLLM or LangGraph level
- Pydantic model tests: valid, invalid, and edge-case inputs
- FastAPI route tests: `httpx.AsyncClient`, no real DB calls in unit tests
- SSE tests: validate event envelope schema, not agent content

### Frontend

- React Testing Library — behavior only, never implementation details
- No snapshot tests
- Playwright E2E on critical paths only

---

## Session Workflow

### Planning docs (three files, distinct purposes)

| File | Purpose | Read at session start? | Update at session end? |
|------|---------|----------------------|----------------------|
| `NEXT-STEPS.md` | Active work: strategy, current stream backlog, coverage, key files | Always | Always (backlog status, coverage) |
| `docs/reference/feature-specs.md` | Living reference: how existing features work, session history | When modifying existing features | When new features are built |
| `docs/plans/master-plan.md` | Product roadmap: phases, iterations, architecture | Rarely | Current Position section each session |

### PDD Committee — Three Personas

Every feature is designed by a committee of three senior personas. All three have 20+ years of experience and follow current industry and technology leading practices. They collaborate on every PDD, each owning specific sections:

**Rachel — Technical Product Manager**
- Insurance finance transformation veteran. Has led 15+ ERP implementations for P&C carriers and reinsurers.
- Owns: problem statement, scope (in/out), dependencies, sequencing, verification criteria.
- Voice: precise, boundary-obsessed, always asks "what's NOT in this PDD?"
- Thinks in: deliverable tables, acceptance criteria, risk to the engagement timeline.

**David — Solutions Architect**
- Full-stack architect specializing in AI-native enterprise systems. Deep in LangGraph, Next.js, streaming architectures.
- Owns: state machines, data flow, store design, file manifest, component contracts.
- Voice: systems thinker, draws boundaries between client state / server state / agent state.
- Thinks in: state diagrams, type signatures, Zustand selector stability, SSE event envelopes.

**Michelle — Product Designer**
- Enterprise UX leader who has designed for Bloomberg, Palantir, and Big 4 consulting tools. Information density specialist.
- Owns: layout wireframes (ASCII), interaction states, navigation flow, visual language alignment.
- Voice: opinionated about density vs. clarity, always references the FTA design system.
- Thinks in: screen layouts, progressive disclosure, agent state visualization, keyboard flows.

### PDD Workflow — Before Building Anything

**Every non-trivial feature gets a PDD before any code is written.** This is the tested development workflow.

1. **Check `NEXT-STEPS.md`** — understand current priorities and active stream
2. **Write the PDD** — the committee collaborates to produce a structured design document:

```
# PDD-NNN: [Feature Title]

**Scope:** [One-line scope statement]
**Priority:** [High/Medium/Low — why]
**Depends on:** [Other PDDs or features]

## Problem                          ← Rachel
[Why this feature exists. What's broken or missing.]

## Scope                            ← Rachel
### In
| # | Deliverable | Purpose |
### Out
[Explicit exclusions]

## Layout / Wireframe               ← Michelle
[ASCII layout of the screen/component]

## State Machine                    ← David
[State diagram if the feature has lifecycle states]

## Navigation                       ← Michelle
[How users get here and leave]

## Key Design Decisions             ← All three
[Numbered list of architectural and UX choices with rationale]

## Files to Create/Modify           ← David
| File | Action |

## Verification                     ← Rachel
[Numbered checklist: build passes + manual test steps]
```

3. **Present the PDD to the user for approval** — do not start coding until confirmed
4. **Implement against the PDD** — use the file manifest and verification checklist as the task list
5. **Build check after each major component** — `pnpm --filter web build` — fix errors immediately before moving on

### After completing a task

1. **Mark the task as complete** in the task list
2. **Update documentation:**
   - `NEXT-STEPS.md` — backlog status, coverage table
   - `docs/plans/master-plan.md` — Current Position section
   - `docs/reference/feature-specs.md` — add specs for any new features built, update session index
3. **List the next 5 items** from `NEXT-STEPS.md` that are up next, so the user can choose what to work on

### General

- Build check (`pnpm --filter web build`) before any commit
- Session docs go to `docs/sessions/YYYY-MM-DD-session-NNN-title.md`
- Commit message format: `Session NNN: [short description]`

---

## Anti-Patterns — Hard Stops

### Backend

- ❌ `pip install` — use `uv add`
- ❌ Sync functions in async FastAPI routes
- ❌ Raw DuckDB/SQL outside DataEngine wrapper
- ❌ Hardcoded model names outside LiteLLM routing config
- ❌ Inline prompts — all prompts live in `prompts/`
- ❌ LLM calls in test suite
- ❌ Pandas — use Polars
- ❌ `print()` — use structlog
- ❌ Bare `except Exception`
- ❌ Storing engagement/domain data in LangGraph state — that belongs in Supabase

### Frontend

- ❌ `'use client'` at layout or page level — push to leaf components
- ❌ `useEffect` for data fetching — use TanStack Query
- ❌ Server data in Zustand
- ❌ UI state in TanStack Query
- ❌ Native EventSource — use `@microsoft/fetch-event-source`
- ❌ Hand-written API types — generate from OpenAPI schema
- ❌ `any` in TypeScript
- ❌ Generic gray-on-white layouts
- ❌ Rounded-full buttons everywhere
- ❌ 50ms spinners — use meaningful agent activity indicators
- ❌ Inter, Roboto, Arial fonts
