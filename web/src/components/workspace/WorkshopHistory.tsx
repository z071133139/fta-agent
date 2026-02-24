"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  loadSessionSummaries,
  type WorkshopSessionSummary,
} from "@/lib/workshop-persistence";
import { useWorkshopStore } from "@/lib/workshop-store";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function StatPill({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return (
    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-alt/40 text-muted">
      {value} {label}
    </span>
  );
}

export function WorkshopHistory() {
  const workshopMode = useWorkshopStore((s) => s.workshopMode);
  const exportJSON = useWorkshopStore((s) => s.exportJSON);
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<WorkshopSessionSummary[]>([]);

  useEffect(() => {
    if (open) {
      setSessions(loadSessionSummaries().reverse());
    }
  }, [open]);

  if (!workshopMode) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={[
          "flex items-center gap-1.5 px-2 py-1 rounded border transition-colors text-[10px] font-mono",
          open
            ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]"
            : "border-border/40 text-muted/60 hover:text-muted hover:border-border/60",
        ].join(" ")}
        title="Workshop history"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        History
      </button>

      {/* Slide-out panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: 360, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 360, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[360px] bg-surface border-l border-border/60 shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between sticky top-0 bg-surface z-10">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#F59E0B]">
                    Workshop History
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted/50 hover:text-foreground text-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Sessions */}
              <div className="p-3 space-y-2">
                {sessions.length === 0 && (
                  <div className="py-12 text-center text-xs text-muted/40">
                    No workshop sessions recorded yet.
                  </div>
                )}

                {sessions.map((s, i) => (
                  <div
                    key={`${s.processAreaId}-${s.startedAt}`}
                    className="rounded-lg border overflow-hidden"
                    style={{
                      borderColor: i === 0 ? "rgba(245,158,11,0.3)" : "rgba(71,85,105,0.3)",
                      borderLeftWidth: 3,
                      borderLeftColor: i === 0 ? "#F59E0B" : "rgba(71,85,105,0.3)",
                    }}
                  >
                    <div className="px-3 py-2.5">
                      {/* PA + time */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-semibold text-foreground/90">
                          {s.processAreaId}
                        </span>
                        <span className="text-[10px] text-muted/80 truncate flex-1">
                          {s.processAreaName}
                        </span>
                        <span className="text-[9px] font-mono text-muted/50 shrink-0">
                          {relativeTime(s.endedAt)}
                        </span>
                      </div>

                      {/* Date range */}
                      <div className="text-[9px] font-mono text-muted/40 mb-2">
                        {new Date(s.startedAt).toLocaleDateString()} — {new Date(s.endedAt).toLocaleDateString()}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <StatPill label="new reqs" value={s.stats.newRequirements} />
                        <StatPill label="modified" value={s.stats.modifiedRequirements} />
                        <StatPill label="nodes" value={s.stats.newNodes + s.stats.placedNodes} />
                        <StatPill label="gaps" value={s.stats.gapsFlagged} />
                        <StatPill label="deleted" value={s.stats.deletedNodes} />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportJSON("default")}
                          className="text-[9px] font-mono px-2 py-0.5 rounded border border-border/30 text-muted/70 hover:text-foreground hover:border-border/50 transition-colors"
                        >
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
