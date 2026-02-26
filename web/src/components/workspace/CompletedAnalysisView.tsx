"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { AnalysisState, AnalysisEntry } from "@/lib/analysis-store";

function ToolBadge({ tool }: { tool: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      <span className="font-mono text-slate-300">{tool}</span>
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
          <span className="text-[10px] uppercase tracking-[0.1em] text-muted font-medium">
            {label}
          </span>
          <div className="flex-1 h-px bg-border/20" />
          <span className="text-[10px] font-mono text-muted/50">
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
      <div className="prose prose-invert prose-sm max-w-none font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
        {entry.output}
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
      <div className="shrink-0 border-t border-slate-700/50 px-5 py-3">
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
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!followUpInput.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
          >
            Send
          </button>
          <button
            onClick={onRerun}
            className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-mono text-muted hover:text-foreground hover:border-slate-500 transition-colors"
            title="Re-run full analysis"
          >
            Re-run
          </button>
        </div>
      </div>
    </div>
  );
}
