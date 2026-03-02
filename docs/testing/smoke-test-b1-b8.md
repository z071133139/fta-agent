# E2E Smoke Tests — Stream B (B1–B8)

> Covers the two live agent flows: Account Analysis (d-005-01) and GAAP Income Statement (d-006-06).

---

## Starting the Backend

```bash
# Mock mode — no LLM calls, no cost, canned responses:
FTA_MOCK_AGENT=true uv run uvicorn fta_agent.api.app:app --reload

# Live mode — real LLM calls (costs money):
uv run uvicorn fta_agent.api.app:app --reload
```

Mock mode streams realistic tool calls + markdown output at ~10ms/word. Use this for all frontend development and UI testing.

---

## Starting the Frontend

```bash
cd web && pnpm dev
```

Navigate to: `http://localhost:3000/demo-eng-001/deliverables/d-005-01`

---

## Test Matrix

### 1. Preflight Screen

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1.1 | d-005-01 renders | Navigate to d-005-01 | Agent label "GL DESIGN COACH", blue pulsing "LIVE" badge, title "Account Analysis Report", 5 preflight bullets, source badge "Acme_TB_FY2025.xlsx · 512K posting lines", CTA "Run Live Analysis" |
| 1.2 | d-006-06 renders | Navigate to d-006-06 | Same structure, GAAP Income Statement content, source "DuckDB · 1,064,838 posting lines · FY2025" |
| 1.3 | CTA label varies | Navigate to a non-live deliverable (e.g. d-004-01) | Shows "Review Library" or "Start Analysis", not "Run Live Analysis" |

### 2. Agent Start & SSE Connection

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 2.1 | Click starts agent | Click "Run Live Analysis" on d-005-01 | Transitions to LiveAgentWorkspace. Status bar appears with blue pulsing dot |
| 2.2 | SSE fires | Check Network tab | POST to `/api/v1/stream` with `message` (from agent_prompt) and `agent: "gl_design_coach"` |
| 2.3 | Backend down | Stop backend, click "Run Live Analysis" | Error state: "Backend not reachable. Start the server..." after retry exhaustion |

### 3. Status Bar Transitions

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 3.1 | Thinking state | Watch status bar after start | Blue pulsing dot, "Analyzing..." label, elapsed timer ticking |
| 3.2 | Acting state | Watch when tool_call event arrives | Label switches to "Running [tool_name]" (e.g. "Running profile_accounts") |
| 3.3 | Complete state | Wait for stream to finish | Emerald dot (no pulse), "Complete" label, timer frozen |
| 3.4 | Error state | Kill backend mid-stream | Red dot, "Error" label, timer frozen |

### 4. Streaming Output (Markdown Rendering)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 4.1 | Tokens stream | Watch output area | Text appears incrementally, not all at once |
| 4.2 | Blinking cursor | Watch during streaming | Blue cursor visible while thinking/acting, gone on complete |
| 4.3 | Markdown headers | Check `##` and `###` in output | Rendered as styled headings (bold, sized), not raw `##` text |
| 4.4 | Bold text | Check `**text**` in output | Rendered bold/bright, not raw asterisks |
| 4.5 | Tables | Check pipe tables in output | Rendered as styled HTML tables with columns, not raw pipes |
| 4.6 | Completion flash | Watch border on complete | Brief emerald border flash (1.2s), then settles |
| 4.7 | Long output | Let full analysis stream | Container scrolls, no layout overflow |

### 5. Tool Activity & Trace Panel

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 5.1 | Tool badges | Watch above output area | Completed tools appear as badges: green dot + monospace name (e.g. `profile_accounts`, `detect_mje`) |
| 5.2 | Trace Level 0 | Default trace view | Shows "Ran N analysis tools" or "Agent is reasoning..." |
| 5.3 | Trace Level 1 | Click "Steps" toggle | Shows trace steps + tool calls with names, status dots, output preview (120 char max) |
| 5.4 | Trace Level 2 | Click "Debug" toggle | Raw JSON of tool calls with input/output structure |
| 5.5 | Toggle anytime | Switch levels during and after run | All three levels work at any point |

### 6. Error Handling & Retry

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 6.1 | Network error | Kill backend mid-stream | Error state renders, retry button visible |
| 6.2 | Retry works | Click "Retry analysis" | Store resets, stream restarts from scratch |
| 6.3 | 4xx error | Send malformed request (dev tools) | FatalError, no retry, error shown immediately |
| 6.4 | 5xx error | Force server error | RetriableError, retries up to 2x, then error |
| 6.5 | Agent exception | Trigger backend exception | "error" event → frontend shows error message |

### 7. Follow-Up Questions

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 7.1 | Input appears | Wait for completion | Text input + "Send" button visible below output |
| 7.2 | Follow-up works | Type question, press Enter or click Send | Store resets, new stream starts with follow-up message |
| 7.3 | Empty blocked | Click Send with empty input | Nothing happens (button disabled) |

### 8. Navigation & Lifecycle

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 8.1 | Navigate away | Go to another deliverable mid-stream | Store resets (cleanup), no orphaned SSE connections |
| 8.2 | Navigate back | Return to d-005-01 after leaving | Shows preflight screen (fresh state), not stale output |
| 8.3 | Workshop exclusion | Activate workshop mode on a live deliverable | LiveAgentWorkspace does NOT render in workshop mode |

### 9. Cross-Capability

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 9.1 | Different prompts | Run d-005-01, then d-006-06 | Each sends its own `agent_prompt` (account profiling vs income statement) |
| 9.2 | Different tools | Compare tool badges | d-005-01 triggers `profile_accounts` + `detect_mje`; d-006-06 triggers `generate_is` |
| 9.3 | No state bleed | Run one, complete, run other | Second run is clean — no leftover tokens or tool badges from first |

---

## Routes

| Deliverable | URL |
|-------------|-----|
| Account Analysis (d-005-01) | `http://localhost:3000/demo-eng-001/deliverables/d-005-01` |
| GAAP Income Statement (d-006-06) | `http://localhost:3000/demo-eng-001/deliverables/d-006-06` |

---

## Notes

- **Mock mode** (`FTA_MOCK_AGENT=true`) is sufficient for tests 1.x, 3.x, 4.x, 5.x, 7.x, 8.x, 9.x
- **Live mode** needed for tests 2.2 (to verify real SSE payload), 9.2 (to verify real tool dispatch)
- **Backend control** (start/stop) needed for tests 2.3, 3.4, 6.1–6.5
- **28 tests total** across 9 categories
