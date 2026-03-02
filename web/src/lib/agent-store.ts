import { create } from "zustand";

// ── SSE Event Envelope ──────────────────────────────────────────────────────

export type SSEEventType =
  | "token"
  | "tool_call"
  | "trace_step"
  | "interrupt"
  | "complete"
  | "error";

export interface SSEEvent {
  type: SSEEventType;
  session_id: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

// ── Agent State Machine ─────────────────────────────────────────────────────

export type AgentStatus =
  | "idle"
  | "thinking"
  | "acting"
  | "awaiting_input"
  | "complete"
  | "error";

export interface ToolCallEvent {
  tool: string;
  status: "started" | "completed";
  input?: Record<string, unknown>;
  output_preview?: string;
  timestamp: string;
}

export interface TraceStep {
  step: string;
  status: "started" | "completed";
  timestamp: string;
}

// ── Store ───────────────────────────────────────────────────────────────────

interface AgentState {
  // Connection
  status: AgentStatus;
  sessionId: string | null;
  error: string | null;

  // Streaming output
  tokens: string;
  toolCalls: ToolCallEvent[];
  traceSteps: TraceStep[];

  // Timing
  startedAt: number | null;
  completedAt: number | null;

  // Trace disclosure level (0=outcome, 1=steps, 2=raw)
  traceLevel: 0 | 1 | 2;

  // Actions
  appendToken: (content: string) => void;
  addToolCall: (event: ToolCallEvent) => void;
  addTraceStep: (step: TraceStep) => void;
  setStatus: (status: AgentStatus) => void;
  setError: (error: string) => void;
  setSessionId: (id: string) => void;
  setTraceLevel: (level: 0 | 1 | 2) => void;
  reset: () => void;
  startRun: () => void;
  completeRun: () => void;
}

const initialState = {
  status: "idle" as AgentStatus,
  sessionId: null as string | null,
  error: null as string | null,
  tokens: "",
  toolCalls: [] as ToolCallEvent[],
  traceSteps: [] as TraceStep[],
  startedAt: null as number | null,
  completedAt: null as number | null,
  traceLevel: 0 as 0 | 1 | 2,
};

export const useAgentStore = create<AgentState>((set) => ({
  ...initialState,

  appendToken: (content: string) =>
    set((s) => ({ tokens: s.tokens + content })),

  addToolCall: (event: ToolCallEvent) =>
    set((s) => ({
      toolCalls: [...s.toolCalls, event],
      status: event.status === "started" ? "acting" : s.status,
    })),

  addTraceStep: (step: TraceStep) =>
    set((s) => ({ traceSteps: [...s.traceSteps, step] })),

  setStatus: (status: AgentStatus) => set({ status }),

  setError: (error: string) => set({ error, status: "error" }),

  setSessionId: (id: string) => set({ sessionId: id }),

  setTraceLevel: (level: 0 | 1 | 2) => set({ traceLevel: level }),

  reset: () => set(initialState),

  startRun: () =>
    set({
      ...initialState,
      status: "thinking",
      startedAt: Date.now(),
    }),

  completeRun: () =>
    set({ status: "complete", completedAt: Date.now() }),
}));
