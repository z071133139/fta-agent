"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AnalysisState, AnalysisEntry } from "@/lib/analysis-store";

function ToolBadge({ tool }: { tool: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface/60 px-2 py-1 text-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      <span className="font-mono text-secondary">{tool}</span>
    </span>
  );
}

function AnalysisBlock({
  entry,
  label,
}: {
  entry: AnalysisEntry;
  label?: string;
}) {
  return (
    <div>
      {label && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">
            {label}
          </span>
          <div className="flex-1 h-px bg-border/20" />
          <span className="text-[10px] font-mono text-muted">
            {new Date(entry.completedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Tool badges */}
      {entry.toolBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {entry.toolBadges.map((t, i) => (
            <ToolBadge key={`${t}-${i}`} tool={t} />
          ))}
        </div>
      )}

      {/* Output */}
      <div className="prose prose-invert prose-sm max-w-none text-sm text-foreground/90 leading-relaxed [&_table]:w-full [&_table]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:text-[11px] [&_th]:uppercase [&_th]:tracking-[0.1em] [&_th]:text-secondary [&_th]:border-b [&_th]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-surface-alt [&_td]:text-secondary [&_code]:font-mono [&_code]:text-secondary [&_pre]:bg-surface/50 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {entry.output}
        </ReactMarkdown>
      </div>
    </div>
  );
}

interface CompletedAnalysisViewProps {
  analysis: AnalysisState;
  agentName: string;
  onRerun: () => void;
  onFollowUp: (message: string) => void;
}

export function CompletedAnalysisView({
  analysis,
  agentName,
  onRerun,
  onFollowUp,
}: CompletedAnalysisViewProps) {
  const [followUpInput, setFollowUpInput] = useState("");

  const handleSend = useCallback(() => {
    const msg = followUpInput.trim();
    if (!msg) return;
    setFollowUpInput("");
    onFollowUp(msg);
  }, [followUpInput, onFollowUp]);

  if (!analysis.primary) return null;

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Scrollable output */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Primary analysis */}
          <AnalysisBlock entry={analysis.primary} />

          {/* Follow-ups */}
          {analysis.followUps.map((fu, i) => (
            <AnalysisBlock
              key={i}
              entry={fu}
              label={`Follow-up ${i + 1}`}
            />
          ))}
        </motion.div>
      </div>

      {/* Bottom bar: follow-up + re-run */}
      <div className="shrink-0 border-t border-border/50 px-5 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={followUpInput}
            onChange={(e) => setFollowUpInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a follow-up question..."
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground/90 placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            onClick={handleSend}
            disabled={!followUpInput.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-40"
          >
            Send
          </button>
          <button
            onClick={onRerun}
            className="rounded-lg border border-border px-3 py-2 text-xs font-mono text-muted hover:text-foreground hover:border-border-strong transition-colors"
            title="Re-run full analysis"
          >
            Re-run
          </button>
        </div>
      </div>
    </div>
  );
}
