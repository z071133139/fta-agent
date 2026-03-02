"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FlowBuilderMessage } from "@/lib/flow-builder-store";
import type { AgentStatus } from "@/lib/agent-store";

interface BuilderChatPanelProps {
  messages: FlowBuilderMessage[];
  agentStatus: AgentStatus;
  streamingTokens: string;
  disabled: boolean;
  onSend: (message: string) => void;
}

function AgentBubble({ content, hasFlowUpdate }: { content: string; hasFlowUpdate: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 max-w-[95%]">
      <div className="bg-surface border border-border/30 rounded-lg px-3.5 py-2.5">
        <p className="text-[12px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
      {hasFlowUpdate && (
        <div className="flex items-center gap-1.5 px-1">
          <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          <span className="text-[9px] font-mono text-[#10B981]">
            Flow updated
          </span>
        </div>
      )}
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="bg-accent/10 border border-accent/20 rounded-lg px-3.5 py-2.5 max-w-[95%]">
        <p className="text-[12px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <div className="h-2 w-2 rounded-full bg-accent agent-thinking" />
      <span className="text-[11px] font-mono text-muted/70">
        Functional Consultant is thinking...
      </span>
    </div>
  );
}

export function BuilderChatPanel({
  messages,
  agentStatus,
  streamingTokens,
  disabled,
  onSend,
}: BuilderChatPanelProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isStreaming = agentStatus === "thinking" || agentStatus === "acting";

  // Auto-scroll to bottom on new messages or streaming tokens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, streamingTokens]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setDraft("");
  }, [draft, isStreaming, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <AgentBubble
            content="I'm the Functional Consultant. I'll help you build a structured process flow. Describe the process you want to document, and I'll ask clarifying questions about roles, systems, and decision points — then generate a swimlane diagram you can refine iteratively."
            hasFlowUpdate={false}
          />
        )}

        {messages.map((msg) =>
          msg.role === "assistant" ? (
            <AgentBubble key={msg.id} content={msg.content} hasFlowUpdate={msg.hasFlowUpdate} />
          ) : (
            <UserBubble key={msg.id} content={msg.content} />
          )
        )}

        {/* Streaming output */}
        {isStreaming && streamingTokens && (
          <AgentBubble content={streamingTokens} hasFlowUpdate={false} />
        )}

        {/* Thinking indicator */}
        {isStreaming && !streamingTokens && <ThinkingIndicator />}

        {/* Error */}
        {agentStatus === "error" && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg">
            <div className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
            <span className="text-[11px] text-[#EF4444]">
              Something went wrong. Try sending your message again.
            </span>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border/40 px-4 py-3">
        {disabled ? (
          <div className="flex items-center justify-center py-2">
            <span className="text-[11px] text-[#10B981] font-mono">
              Flow accepted
            </span>
          </div>
        ) : (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder={isStreaming ? "Waiting for response..." : "Describe the process or give feedback..."}
              className="w-full bg-surface-alt/50 border border-border/40 rounded-lg px-3.5 py-2.5 text-[12px] text-foreground placeholder:text-muted/50 resize-none focus:outline-none focus:border-accent/40 disabled:opacity-50 disabled:cursor-not-allowed"
              rows={2}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[9px] font-mono text-muted/50">
                Enter to send · Shift+Enter for newline
              </span>
              <button
                onClick={handleSend}
                disabled={isStreaming || !draft.trim()}
                className="text-[10px] font-mono px-2.5 py-1 rounded bg-accent/15 text-accent hover:bg-accent/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
