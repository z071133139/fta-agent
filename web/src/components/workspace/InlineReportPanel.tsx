"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useAgentStore } from "@/lib/agent-store";
import { streamAgentMessage } from "@/lib/agent-client";
import { useAnalysisStore } from "@/lib/analysis-store";
import { AgentStatusBar } from "@/components/agent/AgentStatusBar";
import { StreamingOutput } from "@/components/agent/StreamingOutput";
import { TracePanel } from "@/components/agent/TracePanel";
import type { REPORT_GENERATORS } from "@/lib/mock-data";

function ToolBadge({ tool }: { tool: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface/60 px-2 py-1 text-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      <span className="font-mono text-secondary">{tool}</span>
    </span>
  );
}

interface ReportViewProps {
  engagementId: string;
  /** Row ID used as the report key in the analysis store */
  reportRowId: string;
  /** Report name shown in the header */
  reportName: string;
  /** Config from REPORT_GENERATORS */
  config: (typeof REPORT_GENERATORS)[string];
  /** Return to the inventory table */
  onBack: () => void;
}

export function ReportView({
  engagementId,
  reportRowId,
  reportName,
  config,
  onBack,
}: ReportViewProps) {
  const cached = useAnalysisStore((s) => s.getAnalysis(engagementId, reportRowId));
  const savePrimary = useAnalysisStore((s) => s.savePrimary);
  const clearAnalysis = useAnalysisStore((s) => s.clearAnalysis);

  const status = useAgentStore((s) => s.status);
  const tokens = useAgentStore((s) => s.tokens);
  const toolCalls = useAgentStore((s) => s.toolCalls);
  const reset = useAgentStore((s) => s.reset);

  const isRunning = status === "thinking" || status === "acting";
  const hasStarted = useRef(false);
  const hasNotified = useRef(false);

  // Save result on complete
  useEffect(() => {
    if (status === "complete" && !hasNotified.current && hasStarted.current) {
      hasNotified.current = true;
      const tools = toolCalls
        .filter((t) => t.status === "completed")
        .map((t) => t.tool);
      savePrimary(engagementId, reportRowId, {
        output: tokens,
        toolBadges: tools,
        completedAt: new Date().toISOString(),
      });
    }
  }, [status, tokens, toolCalls, engagementId, reportRowId, savePrimary]);

  // Clean up agent store on unmount
  useEffect(() => {
    return () => {
      if (hasStarted.current) {
        reset();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = useCallback(() => {
    hasStarted.current = true;
    hasNotified.current = false;
    streamAgentMessage(config.prompt, config.agent).catch((err) => {
      console.error("[ReportView] stream error:", err);
    });
  }, [config.prompt, config.agent]);

  const handleRerun = useCallback(() => {
    clearAnalysis(engagementId, reportRowId);
    hasStarted.current = true;
    hasNotified.current = false;
    reset();
    streamAgentMessage(config.prompt, config.agent).catch((err) => {
      console.error("[ReportView] rerun error:", err);
    });
  }, [config.prompt, config.agent, engagementId, reportRowId, clearAnalysis, reset]);

  const hasCached = cached?.primary != null;
  const isActive = hasStarted.current && (isRunning || status === "complete" || status === "error");

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Header with back button */}
      <div className="shrink-0 border-b border-border/50 px-5 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors hover:bg-surface-alt/50"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Reporting Inventory
        </button>
        <div className="h-4 w-px bg-border" />
        <h2 className="text-sm font-medium text-foreground">{reportName}</h2>
      </div>

      {/* Agent status bar when running */}
      {isActive && (
        <div className="shrink-0 px-5 pt-3">
          <AgentStatusBar />
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        <AnimatePresence mode="wait">
          {/* Cached result */}
          {hasCached && !isActive && (
            <motion.div
              key="cached"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {cached.primary!.toolBadges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {cached.primary!.toolBadges.map((t, i) => (
                    <ToolBadge key={`${t}-${i}`} tool={t} />
                  ))}
                </div>
              )}

              <div className="prose prose-invert prose-sm max-w-none text-sm text-foreground/90 leading-relaxed [&_table]:w-full [&_table]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:text-[11px] [&_th]:uppercase [&_th]:tracking-[0.1em] [&_th]:text-secondary [&_th]:border-b [&_th]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-surface-alt [&_td]:text-secondary [&_code]:font-mono [&_code]:text-secondary [&_pre]:bg-surface/50 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {cached.primary!.output}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}

          {/* Streaming output */}
          {isActive && (
            <motion.div
              key="streaming"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <StreamingOutput />
              <TracePanel />

              {status === "error" && (
                <button
                  onClick={handleRerun}
                  className="rounded-lg bg-error/20 px-3 py-1.5 text-sm text-error transition-colors hover:bg-error/30"
                >
                  Retry
                </button>
              )}
            </motion.div>
          )}

          {/* Idle — first visit, no cache */}
          {!hasCached && !isActive && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-20 gap-6"
            >
              <div className="flex flex-col items-center gap-2 text-center max-w-md">
                <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-2">
                  <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-foreground">{reportName}</h3>
                <p className="text-sm text-muted leading-relaxed">{config.description}</p>
                <p className="text-[10px] font-mono text-muted mt-1">
                  Agent: {config.agent.replace(/_/g, " ")} · DuckDB · 1,064,838 posting lines · FY2025
                </p>
              </div>
              <button
                onClick={handleGenerate}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/80"
              >
                Generate Report
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar — re-run for cached, nothing for idle/streaming */}
      {hasCached && !isActive && (
        <div className="shrink-0 border-t border-border/50 px-5 py-3 flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted">
            Generated {new Date(cached.primary!.completedAt).toLocaleTimeString()}
          </span>
          <button
            onClick={handleRerun}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-mono text-muted hover:text-foreground hover:border-border-strong transition-colors"
          >
            Re-run
          </button>
        </div>
      )}
    </div>
  );
}
