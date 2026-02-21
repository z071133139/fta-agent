# NEXT STEPS

> Last updated: 2026-02-20 (Session 014)
> Current phase: Phase 1 — Personal Use MVP
> Current iteration: 1.5 — Agent Harness

---

## ✅ Completed Session 014 — Business Requirements + ERP Fit/Gap Workspace

### Business Requirements Table (d-004-04)
- 324 requirements across 20 process areas with typed model (BusinessRequirement, FitGapAnalysis, ERPAssessment)
- PA-05 Ceded Reinsurance as Fit/Gap pilot: 25 requirements assessed across 4 ERP platforms (SAP w/ FS-RI, SAP w/o FS-RI, Oracle Cloud, Workday)
- Agentic gap closure ratings (A0–A3) with autonomy levels applied to all assessed requirements
- BusinessRequirementsTable component: SummaryBar, FilterBar (tag/segment/fit/agentic chips + search + assessed-only toggle), Framework legend, collapsible PA groups, RequirementRow with FitGapCard detail panel
- Workspace dispatch extended for `business_requirements` kind
- Business Process Design workstream now has 3 of 5 deliverables with frontend workspaces (d-004-01, d-004-03, d-004-04)

## ✅ Completed Session 013 — Custom Flow Renderer + AI Framework

### Custom Process Flow Renderer (replaced React Flow)
- React Flow removed from ProcessFlowMap — swimlane node click blocking was intractable
- Custom SVG/HTML hybrid renderer built (4 files in `process-flow/`):
  - `useFlowLayout.ts` — Dagre LR layout, cubic bezier edge paths, swimlane-pinned Y
  - `useFlowViewport.ts` — pan/zoom with wheel events, space+drag, fit view (rAF)
  - `FlowEdgeLayer.tsx` — SVG edges, arrowhead markers, `edge-animated` CSS dashes
  - `FlowNodeLayer.tsx` — HTML nodes, click debounce for select vs double-click edit
- Inline editing working: double-click task node → textarea → Enter/Escape/blur commit
- Overlay panel positioned in viewport coords (outside canvas transform)
- Keyboard shortcuts: F=fit, +/-=zoom, Escape=deselect

### AI & Agentic Engineering Framework
- 5 new optional fields on `ProcessInventoryNode`: `agent_wave`, `agent_level`, `agent_opportunity`, `agent_pattern`, `agent_key_insight`
- 2 new exported types: `AgentLevel` ("L0"–"L4"), `AgentPattern` (6 values)
- All 20 PA nodes populated with wave/level/pattern/opportunity/insight data
- `/framework` page built — hero, Why section, L0–L4 maturity model, 6 dimensions, 6 patterns, 4-wave roadmap timeline, value metrics table
- ProcessInventoryGraph updated: W1/L3 badges on each row, agent intel panel in detail drawer, framework link in summary bar

## ✅ Completed Session 012 — Process Visualization (React Flow, initial build)

- `@xyflow/react` + `@dagrejs/dagre` installed
- ProcessInventoryGraph: two-column layout, scope-status colors, detail drawer, MiniMap
- ProcessFlowMap: swimlane groups, task/gateway/start-end nodes, NodeToolbar overlays, animated edges
- Workspace dispatch: `graph` field → graph component; absent → AnnotatedTable
- React Flow dark theme CSS overrides
- Python Pydantic models: ProcessFlow + ProcessInventory with discriminated union
- Mock workspaces: d-004-01 (auto-transitions running→complete), d-004-03 (preflight→flow map)

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

1. ~~Process Inventory workspace~~ — ✅ Session 012–013
2. ~~Future State workspace~~ — ✅ Session 012–013
3. Cross-agent connection wiring — GL finding `process_area` tagging + Functional Consultant query
4. ~~Business Requirements workspace~~ — ✅ Session 014 (324 reqs + Fit/Gap pilot on PA-05)
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
