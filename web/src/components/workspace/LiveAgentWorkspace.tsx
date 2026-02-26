"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useAgentStore } from "@/lib/agent-store";
import { streamAgentMessage } from "@/lib/agent-client";
import { AgentStatusBar } from "@/components/agent/AgentStatusBar";
import { StreamingOutput } from "@/components/agent/StreamingOutput";
import { TracePanel } from "@/components/agent/TracePanel";

interface LiveAgentWorkspaceProps {
  /** The initial prompt to send to the agent on start */
  initialPrompt: string;
  /** Agent to invoke */
  agent: string;
  /** Agent display name */
  agentName: string;
  /** Whether to auto-start on mount */
  autoStart?: boolean;
  /** Callback when agent completes — receives output text and tool names */
  onComplete?: (output: string, tools: string[]) => void;
}

export function LiveAgentWorkspace({
  initialPrompt,
  agent,
  agentName,
  autoStart = true,
  onComplete,
}: LiveAgentWorkspaceProps) {
  const status = useAgentStore((s) => s.status);
  const tokens = useAgentStore((s) => s.tokens);
  const toolCalls = useAgentStore((s) => s.toolCalls);
  const reset = useAgentStore((s) => s.reset);
  const [followUpInput, setFollowUpInput] = useState("");
  const hasStarted = useRef(false);

  // Auto-start agent on mount
  useEffect(() => {
    if (autoStart && !hasStarted.current) {
      hasStarted.current = true;
      streamAgentMessage(initialPrompt, agent).catch((err) => {
        console.error("[LiveAgentWorkspace] stream error:", err);
      });
    }
    return () => {
      // Reset store when unmounting
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire onComplete callback when agent transitions to complete
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasNotified = useRef(false);

  useEffect(() => {
    if (status === "complete" && onCompleteRef.current && !hasNotified.current) {
      hasNotified.current = true;
      const output = tokens;
      const tools = toolCalls
        .filter((t) => t.status === "completed")
        .map((t) => t.tool);
      onCompleteRef.current(output, tools);
    }
  }, [status, tokens, toolCalls]);

  const handleFollowUp = useCallback(async () => {
    const msg = followUpInput.trim();
    if (!msg || status === "thinking" || status === "acting") return;
    setFollowUpInput("");
    try {
      await streamAgentMessage(msg, agent);
    } catch (err) {
      console.error("[LiveAgentWorkspace] follow-up error:", err);
    }
  }, [followUpInput, status, agent]);

  const handleRetry = useCallback(() => {
    reset();
    hasStarted.current = false;
    streamAgentMessage(initialPrompt, agent).catch((err) => {
      console.error("[LiveAgentWorkspace] retry error:", err);
    });
  }, [initialPrompt, agent, reset]);

  const isRunning = status === "thinking" || status === "acting";
  const completedTools = toolCalls.filter((t) => t.status === "completed");

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Status bar */}
      <div className="shrink-0 px-5 pt-4">
        <AgentStatusBar />
      </div>

      {/* Main output area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        <AnimatePresence mode="wait">
          {/* Running: show streaming output + trace */}
          {(isRunning || status === "complete" || status === "error") && (
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Tool activity summary */}
              {completedTools.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {completedTools.map((t, i) => (
                    <span
                      key={`${t.tool}-${i}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-xs"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="font-mono text-slate-300">{t.tool}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Streaming response */}
              <StreamingOutput />

              {/* Trace panel */}
              <TracePanel />

              {/* Error retry */}
              {status === "error" && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRetry}
                    className="rounded-lg bg-red-600/20 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-600/30"
                  >
                    Retry analysis
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Idle — shouldn't happen with autoStart */}
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-1 items-center justify-center py-20"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-slate-500" />
                <span className="text-xs text-slate-500 font-mono">
                  {agentName} ready
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Follow-up input — only after completion */}
      {status === "complete" && (
        <div className="shrink-0 border-t border-slate-700/50 px-5 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleFollowUp();
                }
              }}
              placeholder="Ask a follow-up question..."
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleFollowUp}
              disabled={!followUpInput.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
