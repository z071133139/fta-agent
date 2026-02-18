# Session 007: Interaction Model + AI-Native Landing Screen

**Date:** 2026-02-17
**Phase:** Design + Planning
**Participants:** Product owner + Claude Code

---

## Session Context

Session 007 opened with a context review — git status, NEXT-STEPS.md, session 006 log, and key code files (AgentState, consulting_agent, outcomes, DataEngine, prompts). The session then focused on two things: refining the interaction model before building the agent harness (1.5A), and designing the AI-native landing screen for the frontend.

No code was written this session. All output is design decisions and documentation.

---

## Key Discussions

### Interaction Model Reframe

A critical reframe was established early: **the FTA agents serve human consultants, not the end client.** The insurance company's finance team is the client. The human users of the FTA system are the consulting team members who serve that client.

This changes several things:
- Agents are a **virtual consulting team** — they do the analytical and documentation work that consultants would otherwise do manually
- The consultant delegates to agents and reviews/approves their output
- Trust-building is directed at the consultant, not the insurance company directly

### Multi-Consultant Concurrency Model

Multiple human consultants work on the same engagement simultaneously, each in the agent most relevant to their role:
- PM → Consulting Agent
- Accounting expert → GL Design Coach
- Business analyst → Functional Consultant

**Tool-level locking** was defined as the concurrency model: some tools are exclusive (one active user per engagement at a time), others are multi-user. Specifically:
- GL data analysis tools (ingestion, profiling, MJE detection) → exclusive, lock required
- Functional Consultant tools → multi-user, no lock needed
- Consulting Agent read operations → multi-user; write operations may lock

Lock state is visible to all consultants ("In use by Tom R.") so no one is blocked silently.

### Authentication

Supabase auth — do not build custom auth. Every agent action is attributed to an authenticated consultant. Engagement isolation enforced via Row Level Security at the database level.

### Agent Registry Pattern

The infrastructure must make adding a new agent a single declarative entry — no hardcoded conditionals per agent in the routing or handoff logic. The router reads descriptions from the registry to build its LLM routing prompt dynamically.

### Hub-and-Spoke Routing

The Consulting Agent is the only router. Specialist agents (GL Coach, Functional Consultant) do not hand off to each other directly. If a specialist identifies that another specialist's input is needed, it captures an artifact to shared context and surfaces it — the human consultant decides when to engage the other agent.

### 1.5A Infrastructure Plan

Drafted the full agent infrastructure plan (not yet approved for build):
- Extended AgentState with consultant context and engagement metadata
- Auth layer (Supabase-based, not custom)
- Engagement context store (Supabase Postgres, replacing earlier DuckDB plan)
- Tool framework with lock enforcement and audit trail
- Agent registry (declarative, router reads from it)
- LLM router (replaces keyword regex)

### CLAUDE.md Update

The project CLAUDE.md was significantly expanded with:
- Full architecture diagram including Supabase
- Interaction model section (consultant users, tool-level locking, Supabase auth)
- Backend standards: LiteLLM model routing table, Supabase RLS, structlog, uv-only package management
- Frontend standards: full component pattern library (AgentStatusBar, TracePanel, InterruptCard, WorkflowSpine, OutputReview), SSE event envelope spec, Zustand vs TanStack Query separation
- Agent state machine visual language
- Trust-building requirements
- Expanded anti-pattern list

### AI-Native Landing Screen Design

Designed the consultant-facing landing screen. Two screens:

**Login screen (`/login`):**
- Full-screen dark background with subtle animated conic gradient
- Floating fields — no hard card border
- FTA wordmark in Instrument Serif
- Supabase auth on submit

**Consultant landing (`/`):**
- Typewriter greeting by consultant name ("Good morning, Sarah."), then streaming context sentence about active engagements
- **Engagement cards** — primary work objects. Colored left border by phase (cyan=discovery, amber=current state, blue=design, purple=build, green=test/cutover). Shows consultant avatars, domain stats (open decisions, findings, requirements), agent access buttons
- **Agent team cards** — "Your Consulting Team" section below. One card per agent showing: role description, availability status (green dot = available, amber = in use by [name]), domain-relevant stats, "Open for [Client]" action button
- Layout restructured using Next.js route groups: `(auth)/` for login, `(workspace)/` for agent workspaces with sidebar, root `page.tsx` for landing

Client-side auth context with mock mode (`NEXT_PUBLIC_MOCK_AUTH=true`) so frontend development can proceed without backend.

---

## Decisions Made

| ID | Decision | Status |
|----|----------|--------|
| DEC-035 | Human users are consultants (not the insurance client) — agents are the virtual consulting team | Decided |
| DEC-036 | Tool-level locking: exclusive tools block concurrent use per engagement; other tools are multi-user | Decided |
| DEC-037 | Supabase auth — no custom auth to be built | Decided |
| DEC-038 | Hub-and-spoke routing: Consulting Agent is the only router; specialists don't hand off to each other | Decided |
| DEC-039 | Agent registry pattern: declarative dict, router and handoff read from it; adding an agent = one entry | Decided |
| DEC-040 | Supabase Postgres replaces DuckDB for engagement context persistence (DuckDB remains for GL data analytics only) | Decided |

---

## Artifacts Produced

| Artifact | Path | Description |
|----------|------|-------------|
| CLAUDE.md (updated) | `CLAUDE.md` | Comprehensive project guide with architecture, standards, UI patterns, anti-patterns |
| Session 007 doc | `docs/sessions/2026-02-17-session-007-interaction-model-and-landing-screen.md` | This document |
| 1.5A infrastructure plan | `.claude/plans/` | Agent infrastructure plan (drafted, not yet approved) |

---

## Open Items Carried Forward

- [ ] 1.5A plan needs approval before build begins — carry to Session 008
- [ ] Decision log needs updating with DEC-035 through DEC-040
- [ ] `.claude/skills/ai-native-enterprise-ui.md` skill file referenced in CLAUDE.md but not yet created
- [ ] Supabase project setup (replaces DuckDB for engagement context per DEC-040)
- [ ] Domain knowledge GO/NO-GO evaluation still pending (deferred from Session 006)

---

## Next Session Priorities

1. **Approve 1.5A plan** — review the infrastructure plan and green-light the build
2. **Build AI-native landing screen** — login + consultant landing with engagement cards and agent team cards
3. **Update decision log** — DEC-035 through DEC-040
4. **Create `.claude/skills/ai-native-enterprise-ui.md`** — FTA-specific UI pattern skill file referenced in CLAUDE.md
