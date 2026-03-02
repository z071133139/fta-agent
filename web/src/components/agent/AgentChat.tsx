"use client";

import { useCallback, useRef, useState } from "react";

import { useAgentStore } from "@/lib/agent-store";
import { streamAgentMessage } from "@/lib/agent-client";

import { AgentStatusBar } from "./AgentStatusBar";
import { StreamingOutput } from "./StreamingOutput";
import { TracePanel } from "./TracePanel";

export function AgentChat() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const status = useAgentStore((s) => s.status);
  const isRunning = status === "thinking" || status === "acting";

  const handleSubmit = useCallback(async () => {
    const message = input.trim();
    if (!message || isRunning) return;

    setInput("");
    try {
      await streamAgentMessage(message);
    } catch (err) {
      console.error("[AgentChat] stream error:", err);
    }
  }, [input, isRunning]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Status bar */}
      <AgentStatusBar />

      {/* Streaming output */}
      <div className="min-h-0 flex-1 overflow-auto">
        <StreamingOutput />
      </div>

      {/* Trace panel */}
      <TracePanel />

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the GL Design Coach..."
          disabled={isRunning}
          rows={2}
          className="flex-1 resize-none rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 font-[var(--font-body)] text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={isRunning || !input.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600"
        >
          {isRunning ? "Running..." : "Send"}
        </button>
      </div>
    </div>
  );
}
