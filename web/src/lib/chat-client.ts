/**
 * Callback-based SSE streaming client for workbench chat.
 *
 * Uses callbacks instead of the global useAgentStore singleton so the
 * chat panel can stream independently without clobbering main agent state.
 */

import { fetchEventSource } from "@microsoft/fetch-event-source";

import type { TabId } from "./coa-store";
import { useCOAStore } from "./coa-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Callback interface ────────────────────────────────────────────────────────

export interface ChatStreamCallbacks {
  onToken: (content: string) => void;
  onToolCall: (tool: string, status: "started" | "completed", output?: string) => void;
  onComplete: () => void;
  onError: (message: string) => void;
}

export interface ChatStreamOptions {
  agent?: string;
  sessionId?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  context?: string;
  mockMode?: boolean;
}

// ── SSE event type (matches agent-store SSEEvent) ─────────────────────────────

interface SSEEvent {
  type: "token" | "tool_call" | "trace_step" | "interrupt" | "complete" | "error";
  session_id: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

// ── Stream function ───────────────────────────────────────────────────────────

/**
 * Stream a chat message to the agent backend using SSE.
 * Returns an AbortController so the caller can cancel.
 */
export function streamChat(
  message: string,
  options: ChatStreamOptions,
  callbacks: ChatStreamCallbacks,
): AbortController {
  const ctrl = new AbortController();

  // Prepend workbench context if provided
  const fullMessage = options.context
    ? `<workbench_context>\n${options.context}\n</workbench_context>\n\n${message}`
    : message;

  const body: Record<string, unknown> = {
    message: fullMessage,
    agent: options.agent ?? "gl_design_coach",
    session_id: options.sessionId,
    mock_mode: options.mockMode ?? true, // default to mock for now
  };
  if (options.history && options.history.length > 0) {
    body.history = options.history;
  }

  fetchEventSource(`${API_BASE}/api/v1/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: ctrl.signal,

    onopen: async (response) => {
      if (response.ok) return;
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }
      throw new Error(`Server error: ${response.status}`);
    },

    onmessage: (ev) => {
      if (!ev.data) return;
      const event: SSEEvent = JSON.parse(ev.data);

      switch (event.type) {
        case "token": {
          const content = (event.payload.content as string) ?? "";
          if (content) callbacks.onToken(content);
          break;
        }
        case "tool_call": {
          const tool = (event.payload.tool as string) ?? "unknown";
          const status = (event.payload.status as "started" | "completed") ?? "started";
          const output = event.payload.output_preview as string | undefined;
          callbacks.onToolCall(tool, status, output);
          break;
        }
        case "complete":
          callbacks.onComplete();
          break;
        case "error": {
          const msg = (event.payload.message as string) ?? "Agent error";
          callbacks.onError(msg);
          break;
        }
        // trace_step, interrupt — silently ignore for chat
        default:
          break;
      }
    },

    onerror: (err) => {
      if (ctrl.signal.aborted) return;
      const msg = err instanceof Error ? err.message : "Connection failed";
      if (msg.includes("fetch") || msg.includes("network") || msg.includes("Failed")) {
        callbacks.onError("Backend not reachable. Start the server: uv run uvicorn fta_agent.api.app:app --reload");
      } else {
        callbacks.onError(msg);
      }
      // Stop retrying
      throw err;
    },

    onclose: () => {
      callbacks.onComplete();
    },
  }).catch(() => {
    // fetchEventSource throws on abort or fatal — already handled via callbacks
  });

  return ctrl;
}

// ── Context builder ───────────────────────────────────────────────────────────

type COAStoreEntry = NonNullable<ReturnType<ReturnType<typeof useCOAStore.getState>["getStore"]>>;

/**
 * Build a structured context string from the current COA store state.
 * This gets prepended to the user message so the agent knows what tab
 * the consultant is looking at and what the current data state is.
 */
export function buildWorkbenchContext(
  store: COAStoreEntry,
  activeTab: TabId,
): string {
  const lines: string[] = [];

  // Tab name
  const tabLabels: Record<TabId, string> = {
    analysis: "Analysis Narrative",
    code_blocks: "Code Blocks",
    account_groups: "Account Groups",
    dimensions: "Dimensions",
    decisions: "Decisions",
    account_string: "CB Dimensions",
    dim_matrix: "Dimensional Matrix",
    hierarchy: "Dynamic Hierarchy",
    deliverable: "Deliverable",
  };
  lines.push(`Active tab: ${tabLabels[activeTab]}`);

  // Summary stats
  lines.push(`Code blocks: ${store.code_blocks.length}`);
  lines.push(`Dimensions: ${store.dimensions.length}`);

  const openIssues = store.dimensions.reduce(
    (sum, d) => sum + d.issues.filter((i) => i.status === "open" || i.status === "in_progress").length,
    0,
  );
  lines.push(`Open issues: ${openIssues}`);

  const pendingDecisions = store.decisions.filter((d) => d.status === "pending").length;
  lines.push(`Pending decisions: ${pendingDecisions}`);

  // Tab-specific context
  switch (activeTab) {
    case "dimensions": {
      const dims = store.dimensions;
      const lowFill = dims.filter((d) => d.fill_rate < 90);
      if (lowFill.length > 0) {
        lines.push(`\nDimensions with low fill rate (<90%):`);
        for (const d of lowFill) {
          const issueCount = d.issues.filter((i) => i.status === "open").length;
          lines.push(`  - ${d.dimension}: ${d.fill_rate}% fill, ${d.unique_values} values, ${issueCount} open issues`);
        }
      }
      const dimIssues = dims.flatMap((d) =>
        d.issues
          .filter((i) => i.status === "open")
          .map((i) => `${d.dimension}: ${i.title}`),
      );
      if (dimIssues.length > 0) {
        lines.push(`\nOpen dimension issues:`);
        for (const issue of dimIssues.slice(0, 5)) {
          lines.push(`  - ${issue}`);
        }
      }
      break;
    }
    case "code_blocks": {
      lines.push(`\nCode block ranges: ${store.code_blocks.map((cb) => `${cb.range} (${cb.account_type}, ${cb.count} accts)`).join(", ")}`);
      break;
    }
    case "decisions": {
      const pending = store.decisions.filter((d) => d.status === "pending");
      if (pending.length > 0) {
        lines.push(`\nPending decisions:`);
        for (const d of pending) {
          lines.push(`  - ${d.title}: ${d.options.length} options`);
        }
      }
      break;
    }
    case "account_groups": {
      lines.push(`\nAccount groups: ${store.account_groups.length} groups, ${store.account_groups.reduce((s, g) => s + g.account_count, 0)} total accounts`);
      break;
    }
    case "dim_matrix": {
      lines.push(`\nDimensions: ${store.dimensions.map((d) => `${d.dimension} (${d.fill_rate}%)`).join(", ")}`);
      break;
    }
    default:
      break;
  }

  return lines.join("\n");
}
