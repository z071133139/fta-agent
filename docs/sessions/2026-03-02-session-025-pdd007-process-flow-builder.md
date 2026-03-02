# Session 025: PDD-007 Custom Process Flow Builder

**Date:** 2026-03-02
**Focus:** Implement NLP-driven process flow creation via Functional Consultant agent
**Stream:** B — Agentic Capabilities (PDD-007)

---

## What Was Built

### PDD-007: Custom Process Flow Builder

Full implementation of the Process Flow Builder — an NLP-driven, split-view workspace where the consultant describes a process in natural language and the Functional Consultant agent progressively builds a structured swimlane flow with live preview.

### Backend (Phase 1)

1. **`src/fta_agent/tools/process_flow_tools.py`** — `emit_process_flow` LangGraph tool with Pydantic `ProcessFlowOutput` args_schema. Validates and outputs `ProcessFlowData` JSON. Coerce functions handle both Pydantic model instances and raw dicts from LangChain.

2. **`src/fta_agent/prompts/functional_consultant_flow.md`** — System prompt for FC flow-building mode: PA identification, role elicitation, iterative refinement guidelines.

3. **`src/fta_agent/agents/functional_consultant.py`** — Upgraded from stub to tool-calling graph matching GL Design Coach pattern. Loads prompt from markdown, binds process flow tools to LLM, conditional edges for tool loop.

4. **`src/fta_agent/api/routes/stream.py`** — Major extensions:
   - `HistoryMessage` model + `history` field on `StreamRequest` for multi-turn conversations
   - `mock_mode: bool | None` field for per-request mock override
   - FC agent routing in `_stream_agent()`
   - Full FC mock with `_stream_mock_fc()` — multi-turn (clarifying questions turn 1, flow emission turn 2+)
   - `_FC_MOCK_FLOW` realistic GL Coding Block Correction flow JSON
   - Truncation limit raised to 20000 chars for `emit_process_flow`
   - **ToolMessage fix:** Extract `.content` from LangChain ToolMessage before stringifying (was causing `JSON.parse` failures on frontend)

5. **`src/fta_agent/config.py`** — Added `"extra": "ignore"` to Settings model_config to prevent validation errors from unknown env vars.

### Frontend Stores (Phase 2)

6. **`web/src/lib/flow-builder-store.ts`** — Zustand + persist store with two separate data structures:
   - `sessions`: active building session (one per engagement, cleared on accept/discard)
   - `acceptedFlows`: completed flows list per engagement (accumulate over time)
   - `acceptFlow()` moves currentFlow to acceptedFlows and deletes active session

7. **`web/src/lib/agent-client.ts`** — Extended with `StreamOptions` interface: `history`, `onToolCall` callback, `mockMode`. Fires `onToolCall(tool, output)` on completed tool_call SSE events.

### Builder UI (Phase 3)

8. **`web/src/components/workspace/flow-builder/BuilderPreviewPanel.tsx`** — Empty state with icon/text, wraps `<ProcessFlowMap>` when flow exists.

9. **`web/src/components/workspace/flow-builder/BuilderChatPanel.tsx`** — Chat panel with agent/user message bubbles, "Flow updated" emerald badges, thinking indicator, input area.

10. **`web/src/components/workspace/ProcessFlowBuilder.tsx`** — Split-view compositor: 440px chat left, flex-1 preview right. Mock/Live toggle button. Fresh session on every open. `onToolCall` callback parses `emit_process_flow` output and updates flow preview.

11. **`web/src/components/workspace/ProcessFlowIndex.tsx`** — Added `onStartBuilder` prop, "+ New Process Flow" button, accepted custom flows rendering with "Custom" badge, "Continue Building Flow" label when session active.

12. **`web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx`** — Builder state toggle for d-004-03 (process_flow_index renders either ProcessFlowIndex or ProcessFlowBuilder).

---

## Bugs Found & Fixed

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Mock mode returning GL coach responses for FC | `_stream_mock` ignored agent param | Added `_stream_mock_fc()` with FC-specific routing |
| Network error in live mode | `Settings` model rejecting `FTA_MOCK_AGENT` env var | Added `"extra": "ignore"` to model_config |
| TypeError in `emit_process_flow` tool | LangChain passes Pydantic models, not dicts | Coerce functions: `isinstance` check before `**n` |
| Infinite re-render loop | `getAcceptedFlows()` creating new `[]` each render | Direct property access `s.acceptedFlows[engId]` |
| Old flow showing when creating new | Stale localStorage from old store format | `initialized` flag forces clear+restart on every open |
| Preview not updating on live tool call | `str(ToolMessage)` ≠ raw JSON | Extract `.content` from ToolMessage before stringifying |

---

## Key Architecture Decisions

- **Tool call for structured data, not tag parsing** — `emit_process_flow` produces validated JSON via Pydantic, arrives as discrete SSE `tool_call` event
- **Full history in request body** — No LangGraph checkpointer; each request includes conversation history
- **Read-only preview, edit after accept** — Workshop editing happens after accept, not during builder
- **Separate sessions vs acceptedFlows** — Active building state is ephemeral; accepted flows persist
- **Per-request mock_mode** — Toggle between mock/live without restarting server

---

## Parked Items Added

- **Permanent storage for custom process flows:** Accepted flows live in localStorage. Needs Supabase migration in Phase 2: `custom_process_flows` table.

---

## Verification

- [x] `pnpm --filter web build` — clean
- [x] ProcessFlowIndex shows "+ New Process Flow" button
- [x] Click → split view with chat + empty preview
- [x] Mock mode: multi-turn conversation with flow emission on turn 2+
- [x] Live mode: agent calls `emit_process_flow`, preview updates
- [x] Accept flow → return to index, custom flow appears
- [x] Session persistence via localStorage
- [x] Discard → session cleared
