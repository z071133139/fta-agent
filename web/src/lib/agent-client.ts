import { fetchEventSource } from "@microsoft/fetch-event-source";
import { match } from "ts-pattern";

import { useAgentStore } from "./agent-store";
import type { SSEEvent, ToolCallEvent, TraceStep } from "./agent-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class RetriableError extends Error {}
class FatalError extends Error {}

/** Max retries before giving up */
const MAX_RETRIES = 2;
let retryCount = 0;

/** Options for streamAgentMessage — backwards-compatible extension. */
export interface StreamOptions {
  /** Conversation history for multi-turn agents. */
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  /** Callback fired on every completed tool_call event. */
  onToolCall?: (tool: string, output: string) => void;
  /** Force mock mode for this request (overrides server env). */
  mockMode?: boolean;
}

/**
 * Send a message to the agent and stream the response via SSE.
 *
 * Connects to /api/v1/stream, dispatches events to the Zustand agent store.
 * Uses @microsoft/fetch-event-source for robust SSE handling.
 */
export async function streamAgentMessage(
  message: string,
  agent: string = "gl_design_coach",
  sessionId?: string,
  options?: StreamOptions,
): Promise<void> {
  const store = useAgentStore.getState();
  store.startRun();
  retryCount = 0;

  const body: Record<string, unknown> = { message, agent, session_id: sessionId };
  if (options?.history && options.history.length > 0) {
    body.history = options.history;
  }
  if (options?.mockMode !== undefined) {
    body.mock_mode = options.mockMode;
  }

  try {
    await fetchEventSource(`${API_BASE}/api/v1/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),

      onopen: async (response) => {
        retryCount = 0; // reset on successful open
        if (response.ok) return;

        if (response.status >= 400 && response.status < 500) {
          throw new FatalError(`Client error: ${response.status}`);
        }
        throw new RetriableError(`Server error: ${response.status}`);
      },

      onmessage: (ev) => {
        if (!ev.data) return;

        const event: SSEEvent = JSON.parse(ev.data);
        const s = useAgentStore.getState();

        match(event.type)
          .with("token", () => {
            const content = (event.payload.content as string) ?? "";
            s.appendToken(content);
            if (s.status !== "thinking") s.setStatus("thinking");
          })
          .with("tool_call", () => {
            const toolEvent: ToolCallEvent = {
              tool: (event.payload.tool as string) ?? "unknown",
              status: (event.payload.status as "started" | "completed") ?? "started",
              input: event.payload.input as Record<string, unknown> | undefined,
              output_preview: event.payload.output_preview as string | undefined,
              timestamp: event.timestamp,
            };
            s.addToolCall(toolEvent);

            // Fire onToolCall callback for completed tool calls
            if (toolEvent.status === "completed" && options?.onToolCall && toolEvent.output_preview) {
              options.onToolCall(toolEvent.tool, toolEvent.output_preview);
            }
          })
          .with("trace_step", () => {
            const step: TraceStep = {
              step: (event.payload.step as string) ?? "unknown",
              status: (event.payload.status as "started" | "completed") ?? "started",
              timestamp: event.timestamp,
            };
            s.addTraceStep(step);
          })
          .with("interrupt", () => {
            s.setStatus("awaiting_input");
          })
          .with("complete", () => {
            s.setSessionId(event.session_id);
            s.completeRun();
          })
          .with("error", () => {
            const msg = (event.payload.message as string) ?? "Agent error";
            s.setError(msg);
          })
          .exhaustive();
      },

      onerror: (err) => {
        retryCount++;
        const s = useAgentStore.getState();

        if (err instanceof FatalError || retryCount > MAX_RETRIES) {
          const msg = err instanceof FatalError
            ? err.message
            : "Unable to connect to agent backend. Make sure the server is running on port 8000.";
          s.setError(msg);
          throw err; // stop retrying
        }

        console.error(`[agent-client] SSE error (retry ${retryCount}/${MAX_RETRIES}):`, err);
      },

      onclose: () => {
        const s = useAgentStore.getState();
        if (s.status === "thinking" || s.status === "acting") {
          s.completeRun();
        }
      },
    });
  } catch (err) {
    const s = useAgentStore.getState();
    if (s.status !== "error") {
      // Network error or fetch failed entirely
      const message = err instanceof Error ? err.message : "Connection failed";
      if (message.includes("fetch") || message.includes("network") || message.includes("Failed")) {
        s.setError("Backend not reachable. Start the server: uv run uvicorn fta_agent.api.app:app --reload");
      } else {
        s.setError(message);
      }
    }
  }
}

/**
 * Abort any in-flight agent stream.
 */
export function abortAgentStream(): void {
  useAgentStore.getState().reset();
}
