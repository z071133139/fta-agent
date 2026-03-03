"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useFlowBuilderStore } from "@/lib/flow-builder-store";
import { useAgentStore } from "@/lib/agent-store";
import { streamAgentMessage } from "@/lib/agent-client";
import type { ProcessFlowData } from "@/lib/mock-data";
import { BuilderChatPanel } from "@/components/workspace/flow-builder/BuilderChatPanel";
import { BuilderPreviewPanel } from "@/components/workspace/flow-builder/BuilderPreviewPanel";

interface ProcessFlowBuilderProps {
  onClose?: () => void;
}

export function ProcessFlowBuilder({ onClose }: ProcessFlowBuilderProps) {
  const params = useParams<{ engagementId: string; deliverableId: string }>();
  const engId = params.engagementId;

  // Hydration guard
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Mock/live toggle
  const [useMock, setUseMock] = useState(true);

  // Flow builder store
  const session = useFlowBuilderStore((s) => s.getSession(engId));
  const startSession = useFlowBuilderStore((s) => s.startSession);
  const addUserMessage = useFlowBuilderStore((s) => s.addUserMessage);
  const addAssistantMessage = useFlowBuilderStore((s) => s.addAssistantMessage);
  const updateFlow = useFlowBuilderStore((s) => s.updateFlow);
  const acceptFlow = useFlowBuilderStore((s) => s.acceptFlow);
  const clearSession = useFlowBuilderStore((s) => s.clearSession);

  // Agent store — streaming state
  const agentStatus = useAgentStore((s) => s.status);
  const tokens = useAgentStore((s) => s.tokens);
  const resetAgent = useAgentStore((s) => s.reset);

  // Track whether we got a flow update during the current stream
  const [pendingFlowUpdate, setPendingFlowUpdate] = useState(false);

  // Initialize a fresh building session when the builder opens
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (hydrated && !initialized) {
      // Always start fresh — clear any stale/accepted session
      clearSession(engId);
      startSession(engId);
      setInitialized(true);
    }
  }, [hydrated, initialized, engId, startSession, clearSession]);

  // When agent completes, capture the response
  useEffect(() => {
    if (agentStatus === "complete" && tokens) {
      addAssistantMessage(engId, tokens, pendingFlowUpdate);
      setPendingFlowUpdate(false);
      resetAgent();
    }
  }, [agentStatus, tokens, engId, addAssistantMessage, pendingFlowUpdate, resetAgent]);

  const handleSend = useCallback(
    (message: string) => {
      if (!session) return;

      addUserMessage(engId, message);

      // Build history from existing messages
      const history = session.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      streamAgentMessage(message, "functional_consultant", undefined, {
        history,
        mockMode: useMock,
        onToolCall: (tool: string, output: string) => {
          if (tool === "emit_process_flow") {
            try {
              const flow = JSON.parse(output) as ProcessFlowData;
              if (flow.kind === "process_flow") {
                updateFlow(engId, flow);
                setPendingFlowUpdate(true);
              }
            } catch (err) {
              console.error("[ProcessFlowBuilder] Failed to parse emit_process_flow output:", err, output?.slice(0, 200));
            }
          }
        },
      });
    },
    [session, engId, addUserMessage, updateFlow, useMock]
  );

  const handleAccept = useCallback(() => {
    acceptFlow(engId);
    onClose?.();
  }, [engId, acceptFlow, onClose]);

  const handleDiscard = useCallback(() => {
    resetAgent();
    clearSession(engId);
    onClose?.();
  }, [engId, resetAgent, clearSession, onClose]);

  if (!hydrated || !initialized || !session) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-accent agent-thinking" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border/40">
        <button
          onClick={onClose}
          className="text-[11px] text-muted hover:text-foreground transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Process Flow Index
        </button>
        <div className="h-3 w-px bg-border/40" />
        <span className="text-[12px] text-foreground font-medium">
          {session.currentFlow?.name ?? "New Process Flow"}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {/* Mock / Live toggle */}
          <button
            onClick={() => setUseMock((v) => !v)}
            className={[
              "text-[10px] font-mono px-2.5 py-1 rounded border transition-colors",
              useMock
                ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/25 hover:bg-[#F59E0B]/20"
                : "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/25 hover:bg-[#10B981]/20",
            ].join(" ")}
          >
            {useMock ? "Mock" : "Live"}
          </button>

          {session.currentFlow && (
            <button
              onClick={handleAccept}
              className="text-[11px] font-mono px-3 py-1.5 rounded bg-success/15 text-success hover:bg-success/25 border border-success/20 transition-colors"
            >
              Accept Flow
            </button>
          )}
          <button
            onClick={handleDiscard}
            className="text-[11px] font-mono px-3 py-1.5 rounded bg-surface-alt/50 text-muted hover:text-foreground border border-border/30 transition-colors"
          >
            Discard
          </button>
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Chat panel — fixed width */}
        <div className="w-[440px] shrink-0 border-r border-border/40 flex flex-col min-h-0">
          <BuilderChatPanel
            messages={session.messages}
            agentStatus={agentStatus}
            streamingTokens={tokens}
            disabled={false}
            onSend={handleSend}
          />
        </div>

        {/* Preview panel — flex fill */}
        <div className="flex flex-1 min-h-0 min-w-0 bg-background">
          <BuilderPreviewPanel flow={session.currentFlow} />
        </div>
      </div>
    </div>
  );
}
