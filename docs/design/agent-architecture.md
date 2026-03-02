# Agent Architecture — Frontend ↔ Backend

> How the live agent flow works end-to-end, from user click to rendered output.

---

## High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BROWSER                                                                    │
│                                                                             │
│  ┌──────────────┐    click     ┌───────────────────┐    mount      ┌──────┐│
│  │PreflightScreen│───────────→│  DeliverablePage   │─────────────→│ Live ││
│  │               │  onStart()  │  runState:         │  autoStart   │Agent ││
│  │ • agent label │             │  preflight→running │              │Work- ││
│  │ • Live badge  │             │                    │              │space ││
│  │ • bullets     │             └────────────────────┘              └──┬───┘│
│  │ • source      │                                                   │     │
│  │ • CTA button  │                                                   │     │
│  └──────────────┘                                                    │     │
│                                                                      │     │
│                                  streamAgentMessage()                 │     │
│                                  POST /api/v1/stream                 │     │
│                                  { message, agent, session_id }      │     │
│                                                                      ▼     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  agent-client.ts  (@microsoft/fetch-event-source)                    │  │
│  │                                                                      │  │
│  │  onopen  → reset retry count                                         │  │
│  │  onmessage → parse SSEEvent → ts-pattern match → dispatch to store   │  │
│  │  onerror → retry (max 2) or FatalError                               │  │
│  │  onclose → auto-complete if still running                            │  │
│  └────────────────────────────────┬─────────────────────────────────────┘  │
│                                   │ dispatch                               │
│                                   ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  agent-store.ts  (Zustand)                                           │  │
│  │                                                                      │  │
│  │  status: idle│thinking│acting│awaiting_input│complete│error           │  │
│  │  tokens: ""           ← appendToken(content)                         │  │
│  │  toolCalls: []        ← addToolCall({ tool, status, input, output }) │  │
│  │  traceSteps: []       ← addTraceStep({ step, status })              │  │
│  │  traceLevel: 0│1│2   ← setTraceLevel()                              │  │
│  │  startedAt / completedAt                                             │  │
│  │  sessionId, error                                                    │  │
│  └──────────┬────────────┬─────────────┬───────────────────────────────┘  │
│             │            │             │                                    │
│    subscribe│   subscribe│    subscribe│                                    │
│             ▼            ▼             ▼                                    │
│  ┌──────────────┐ ┌──────────┐ ┌───────────┐                              │
│  │AgentStatusBar│ │Streaming │ │TracePanel │                              │
│  │              │ │Output    │ │           │                              │
│  │ • StatusDot  │ │          │ │ Level 0:  │                              │
│  │   (color by  │ │ • React  │ │  summary  │                              │
│  │    status)   │ │   Mark-  │ │ Level 1:  │                              │
│  │ • Label      │ │   down   │ │  steps +  │                              │
│  │ • Tool count │ │ • remark │ │  tools    │                              │
│  │ • Elapsed    │ │   -gfm   │ │ Level 2:  │                              │
│  │   Ticker     │ │ • cursor │ │  raw JSON │                              │
│  │   (100ms)    │ │ • flash  │ │           │                              │
│  └──────────────┘ └──────────┘ └───────────┘                              │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Tool Badges (completed tools)        │  Follow-up Input (on complete) │  │
│  │  ● profile_accounts  ● detect_mje    │  [Ask a follow-up...] [Send]   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                    SSE stream │ POST /api/v1/stream
                    (text/     │
                    event-     │
                    stream)    │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  BACKEND  (FastAPI)                                                         │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  stream.py — POST /api/v1/stream                                     │  │
│  │                                                                      │  │
│  │  StreamRequest { message, agent, session_id? }                       │  │
│  │                                                                      │  │
│  │  ┌─────────────────────┐                                             │  │
│  │  │ FTA_MOCK_AGENT=true?│                                             │  │
│  │  └────┬───────────┬────┘                                             │  │
│  │       │yes        │no                                                │  │
│  │       ▼           ▼                                                  │  │
│  │  _stream_mock  _stream_agent                                         │  │
│  │  (canned       (real LLM)                                            │  │
│  │   response,                                                          │  │
│  │   no cost)                                                           │  │
│  └──────────────────┬───────────────────────────────────────────────────┘  │
│                     │                                                       │
│                     ▼                                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  SSE Event Envelope (every event)                                    │  │
│  │                                                                      │  │
│  │  {                                                                   │  │
│  │    "type": "token"|"tool_call"|"trace_step"|"interrupt"|             │  │
│  │            "complete"|"error",                                       │  │
│  │    "session_id": "uuid",                                             │  │
│  │    "timestamp": "ISO-8601",                                          │  │
│  │    "payload": { ... }                                                │  │
│  │  }                                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                     │                                                       │
│          (real mode only)                                                    │
│                     ▼                                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  LangGraph — GL Design Coach                                         │  │
│  │                                                                      │  │
│  │  ┌─────────┐     has tool_calls?     ┌───────┐                      │  │
│  │  │gl_coach │──────── yes ──────────→│ tools │                      │  │
│  │  │(LLM +   │                         │(Tool- │                      │  │
│  │  │ system   │←────────────────────────│ Node) │                      │  │
│  │  │ prompt)  │                         └───────┘                      │  │
│  │  └────┬─────┘                                                        │  │
│  │       │ no tool_calls                                                │  │
│  │       ▼                                                              │  │
│  │      END                                                             │  │
│  │                                                                      │  │
│  │  astream_events(version="v2") produces:                              │  │
│  │    on_chat_model_stream → "token" events                             │  │
│  │    on_tool_start        → "tool_call" (started)                      │  │
│  │    on_tool_end          → "tool_call" (completed)                    │  │
│  │    on_chain_start/end   → "trace_step" (filtered)                    │  │
│  │    exception            → "error"                                    │  │
│  │    stream end           → "complete"                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                     │                                                       │
│                     ▼                                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  LLM Layer (LiteLLM)              │  DataEngine (DuckDB)             │  │
│  │                                    │                                  │  │
│  │  claude-sonnet-4-6 (default)       │  GL Tools:                       │  │
│  │  routing config selects model      │  • profile_accounts(top_n)       │  │
│  │  by task type                      │  • detect_mje()                  │  │
│  │                                    │  • compute_tb()                  │  │
│  │                                    │  • generate_is()                 │  │
│  │                                    │  • assess_dims()                 │  │
│  │                                    │                                  │  │
│  │                                    │  Loaded at startup from:         │  │
│  │                                    │  data/fixtures/*.parquet         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## State Machine — Agent Status

```
                    startRun()
                        │
                        ▼
  ┌───────┐   token   ┌──────────┐   tool_call    ┌────────┐
  │ idle  │─────────→│ thinking │──(started)────→│ acting │
  └───────┘           └──────────┘                └───┬────┘
                        ▲    │                        │
                        │    │                   tool_call
                   token│    │                  (completed)
                        │    │                        │
                        │    ▼                        │
                        │  ┌──────────────┐           │
                        ├──│awaiting_input│           │
                        │  └──────────────┘           │
                        │         │                   │
                        └─────────┼───────────────────┘
                                  │
                            complete│error
                                  │
                      ┌───────────┴───────────┐
                      ▼                       ▼
                ┌──────────┐            ┌─────────┐
                │ complete │            │  error  │
                │          │            │         │
                │ flash →  │            │ retry → │
                │ follow-up│            │ restart │
                └──────────┘            └─────────┘
```

---

## SSE Event Types → Store Actions → UI Updates

| SSE Event | Payload | Store Action | UI Effect |
|-----------|---------|-------------|-----------|
| `token` | `{ content }` | `appendToken()` | Text appears in StreamingOutput (markdown rendered) |
| `tool_call` (started) | `{ tool, input }` | `addToolCall()`, status→acting | StatusBar shows "Running [tool]" |
| `tool_call` (completed) | `{ tool, output_preview }` | `addToolCall()` | Tool badge appears (green dot + name) |
| `trace_step` | `{ step, status }` | `addTraceStep()` | TracePanel updates (if Level 1+) |
| `interrupt` | `{ ... }` | status→awaiting_input | Amber status (not yet used) |
| `complete` | `{ total_tokens }` | `completeRun()` | Emerald flash, timer freezes, follow-up input appears |
| `error` | `{ message }` | `setError()` | Red status, error text, retry button |

---

## Component Tree

```
DeliverablePage
├── PreflightScreen              (runState === "preflight")
│   └── CTA button → onStart()
│
└── LiveAgentWorkspace           (runState === "running", agent_live)
    ├── AgentStatusBar
    │   ├── StatusDot            (color by status)
    │   ├── Label                ("Analyzing..." / "Running X" / "Complete")
    │   ├── Tool count badge     ("2 tools run")
    │   └── ElapsedTicker        (100ms interval, freezes on complete)
    │
    ├── Tool Badges              (completed tools as pills)
    │
    ├── StreamingOutput
    │   ├── ReactMarkdown + remarkGfm  (headers, tables, bold, lists)
    │   ├── Blinking cursor      (while thinking/acting)
    │   ├── Emerald flash        (1.2s on complete)
    │   └── Error display        (red border + message)
    │
    ├── TracePanel
    │   ├── Level 0: Summary     ("Ran N tools")
    │   ├── Level 1: Steps       (trace rows + tool rows with status dots)
    │   └── Level 2: Debug       (raw JSON, scrollable)
    │
    ├── Retry button             (on error)
    │
    └── Follow-up input          (on complete)
        ├── Text input
        └── Send button → streamAgentMessage()
```

---

## Key Files

| Layer | File | Purpose |
|-------|------|---------|
| **Page** | `web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx` | Route, runState machine, workspace dispatch |
| **Preflight** | `web/src/components/workspace/PreflightScreen.tsx` | Launch gate before agent runs |
| **Live workspace** | `web/src/components/workspace/LiveAgentWorkspace.tsx` | Auto-start, layout, follow-up input |
| **SSE client** | `web/src/lib/agent-client.ts` | fetch-event-source, retry logic, event dispatch |
| **State** | `web/src/lib/agent-store.ts` | Zustand store, status machine, all agent state |
| **Status bar** | `web/src/components/agent/AgentStatusBar.tsx` | Dot, label, tool count, elapsed timer |
| **Output** | `web/src/components/agent/StreamingOutput.tsx` | Markdown rendering, cursor, flash |
| **Trace** | `web/src/components/agent/TracePanel.tsx` | 3-level progressive disclosure |
| **Workspace config** | `web/src/lib/mock-data.ts` | `agent_live`, `agent_prompt`, `preflight_bullets` |
| **SSE endpoint** | `src/fta_agent/api/routes/stream.py` | POST /api/v1/stream, mock mode, event envelope |
| **Agent graph** | `src/fta_agent/agents/gl_design_coach.py` | LangGraph: gl_coach ↔ tools loop |
| **Tools** | `src/fta_agent/tools/gl_analysis.py` | 5 DuckDB-backed analysis tools |
| **Data engine** | `src/fta_agent/data/engine.py` | DuckDB wrapper, loaded at startup |
| **App** | `src/fta_agent/api/app.py` | FastAPI factory, lifespan (fixture load) |

---

## Cost Control

```bash
# No LLM calls — canned response, streams realistic tool events + markdown
FTA_MOCK_AGENT=true uv run uvicorn fta_agent.api.app:app --reload

# Real LLM calls — costs money
uv run uvicorn fta_agent.api.app:app --reload
```

Mock mode is set via the `FTA_MOCK_AGENT` environment variable in `stream.py`. It returns a pre-recorded analysis with simulated tool calls and word-by-word token streaming. The frontend behaves identically in both modes.
