# NEXT STEPS

> Last updated: 2026-02-19 (Session 010)
> Current phase: Phase 1 — Personal Use MVP
> Current iteration: 1.5 — Agent Harness

---

## Immediate Priority — Iteration 1.5A (Backend)

The frontend is ahead of the backend. The workspace UI is fully built but has zero real API calls — everything runs on mock data. The critical path item is building the agent infrastructure so the frontend has something to connect to.

### What to build next (1.5A):

1. **Extended AgentState** — Add engagement context fields to the LangGraph state:
   - Engagement metadata (client, segment, ERP)
   - Active decisions registry reference
   - Data state (what files have been ingested, what analyses are available)

2. **LLM-based intent router** — Replace keyword routing in `consulting_agent.py` with a lightweight LLM classifier:
   - Input: user message + conversation summary → Output: target agent + intent label
   - Target: >90% routing accuracy on 20 representative messages
   - Fallback: keyword heuristics for clearly identifiable patterns

3. **Outcome capture tools** — `@tool` decorated functions that agents invoke:
   - `capture_decision(dimension, decision, rationale, alternatives)` → writes to engagement context
   - `capture_finding(category, text, severity, account)` → writes to engagement context
   - `capture_requirement(process, text, priority)` → writes to engagement context
   - All write to in-memory AgentState for now (DuckDB persistence in Iteration 2)

4. **Agent self-introduction** — Each agent greets with engagement context:
   - GL Design Coach: "I have [N] accounts profiled, [N] decisions recorded..."
   - Consulting Agent: "You're in [phase], [N] items need input..."
   - Functional Consultant: "I've captured [N] requirements, [N] unvalidated..."

5. **Handoff protocol** — Consulting Agent → sub-agent → structured outcome → back:
   - Context packaging before handoff
   - Outcome capture on return
   - Latency target: <2s for routing + context packaging

### Reference
- `src/fta_agent/agent/consulting_agent.py` — current keyword router to replace
- `src/fta_agent/agent/state.py` — AgentState to extend
- Session 006 agent design: `docs/design/mvp-agent-design.md`
- v1-build-plan.md Iteration 1.5A section

---

## After 1.5A — Connect Frontend to Backend

Once the agent infrastructure exists:

### SSE streaming to workspace

The workspace `AnnotatedTable` is designed for progressive row reveal. Wire it:
- Replace mock `run_state` transitions with real SSE events
- Use `@microsoft/fetch-event-source` (already in CLAUDE.md standards)
- Match the SSE event envelope defined in CLAUDE.md:
  ```typescript
  type SSEEvent = {
    type: 'token' | 'tool_call' | 'trace_step' | 'interrupt' | 'complete' | 'error'
    session_id: string
    timestamp: string
    payload: Record<string, unknown>
  }
  ```
- Use `ts-pattern` exhaustive match on event types

### Preflight CTA → real agent run

The "Start Analysis" / "Review Library" button currently fakes a 1.2s transition. Wire to:
- `POST /api/v1/agents/{agent_id}/run` with SSE response
- AgentChatInput "Steer" messages → `POST /api/v1/agents/{agent_id}/message`

### Generate TypeScript types from OpenAPI

When the API is stable enough:
```bash
npx openapi-typescript http://localhost:8000/openapi.json -o web/types/api.generated.ts
```

---

## Deferred Items

| Item | Deferred Until | Notes |
|------|---------------|-------|
| WorkplanPanel scope changes → API | Iteration 1.5C | `build_pc_plan_design_template()` factory ready; Consulting Agent workplan management tools needed first |
| ActivityPanel → real trace data | Post-1.5A | Currently mock; wire to `trace_step` SSE events |
| WorkplanSpine status updates | Post-1.5C | Deliverable status should update in real-time via Supabase subscriptions in Phase 2 |
| `loading.tsx` suspense boundaries | Before Phase 2 | Required per CLAUDE.md; skipped in frontend-first sessions |
| DuckDB persistence for capture tools | Iteration 2 | Capture tools write to in-memory state in 1.5; persistence wired in Iteration 2 |
| Supabase auth integration | Phase 2 | Using mock auth in Phase 1 |
| `(workspace)` route group | Cleanup sprint | Old route group `/analysis`, `/design`, etc. can be retired once workspace is fully wired |

---

## Designed but Not Yet Built — Business Process Design Workstream

The Business Process Design workstream is fully designed (Session 010). Build starts after Backend 1.5A is complete and the frontend is connected to real API calls.

### What was designed

Full design at [`docs/design/business-process-design-workstream.md`](docs/design/business-process-design-workstream.md).

Key features:
- **Process Inventory as scope gate** — interactive workspace, per-process parallelism
- **Overlay model for Future State** — no Current State deliverable; leading-practice baseline + client overlays
- **Standard question set** — structured elicitation built into the agent's workflow
- **Cross-agent connection** — GL Design Coach findings → Future State overlay suggestions (shared engagement context)
- **Dynamic workplan expansion** — child rows appear as processes are confirmed; parent rows persist
- **ERP-dependent Gap Analysis** — reads `engagement.erp_target`, SAP S/4HANA first
- **User Stories Backlog** — optional, scope toggle at engagement setup

### Build sequence (when ready)

1. Process Inventory workspace — interactive scoping, workplan expansion trigger
2. Future State workspace — overlay model, standard question set, baseline generation
3. Cross-agent connection wiring — GL finding `process_area` tagging + Functional Consultant query
4. Business Requirements workspace — library pre-population, overlay-driven requirements
5. Gap Analysis workspace — ERP-dependent preflight + artifact
6. User Stories workspace — optional, gated by engagement scope toggle

### Decisions

DEC-035 through DEC-041 in [`docs/decisions/decision-log.md`](docs/decisions/decision-log.md).

---

## Architecture Notes for Next Session

**Current state of the frontend:**
- Landing page: complete and wired to mock data
- WorkplanPanel: complete, CTAs navigate to workspace
- Workspace shell: complete (layout, spine, top bar)
- Workspace content: complete (preflight, table, interrupt, chat, activity) — all mock data
- Zero API calls anywhere in the frontend yet

**Backend state:**
- Consulting Agent: keyword router, basic LangGraph graph
- GL Design Coach: domain knowledge prompts, no data tools yet
- Functional Consultant: skeleton only
- Agent state: basic, no engagement context fields
- Data engine: schema defined but not wired to agents
- No SSE endpoints yet

**The gap to close:** Backend 1.5A → API endpoints → SSE streaming → workspace wired.
