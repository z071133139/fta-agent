"use client";

import { useState, useRef, useEffect } from "react";
import type { AgentRunState } from "@/lib/mock-data";

interface ChatMessage {
  id: string;
  text: string;
  from: "consultant";
}

interface AgentChatInputProps {
  runState: AgentRunState;
  agentName: string;
}

export default function AgentChatInput({
  runState,
  agentName,
}: AgentChatInputProps) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const placeholder =
    runState !== "complete"
      ? "Steer the agent — redirect, add context, or ask it to reconsider…"
      : `Ask ${agentName} about this analysis…`;

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [draft]);

  // Scroll history to bottom on new message
  useEffect(() => {
    historyRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [history]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setHistory((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, from: "consultant" },
    ]);
    setDraft("");
  };

  return (
    <div className="border-t border-border/40 bg-background/60 backdrop-blur-sm">
      {/* Message history */}
      {history.length > 0 && (
        <div
          ref={historyRef}
          className="max-h-32 overflow-y-auto px-4 pt-3 pb-0 flex flex-col gap-1.5"
        >
          {history.map((msg) => (
            <div key={msg.id} className="flex justify-end">
              <div className="bg-accent/15 border border-accent/20 rounded-lg px-3 py-1.5 max-w-md">
                <p className="text-xs text-foreground/85">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-4 py-3">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-surface border border-border/60 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted/40 resize-none focus:outline-none focus:border-accent/60 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim()}
          className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
