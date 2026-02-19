"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ActivityEntry } from "@/lib/mock-data";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function ActivityPanel({ activity }: { activity: ActivityEntry[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`flex flex-col border-l border-border/40 bg-surface/20 transition-all duration-200 shrink-0 ${
        open ? "w-56" : "w-10"
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center gap-1.5 px-2 py-3 border-b border-border/30 hover:bg-surface-alt/30 transition-colors shrink-0"
        title={open ? "Collapse activity" : "View activity"}
      >
        {open ? (
          <>
            <span className="text-[10px] uppercase tracking-[0.1em] text-muted font-medium whitespace-nowrap">
              Activity
            </span>
            <span className="text-muted text-xs ml-auto">›</span>
          </>
        ) : (
          <span
            className="text-muted text-[10px] font-medium"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Activity
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 overflow-y-auto py-3 px-3"
          >
            <div className="flex flex-col gap-2">
              {activity.map((entry) => (
                <div key={entry.step} className="flex gap-2">
                  {/* Status indicator */}
                  <div className="flex flex-col items-center shrink-0 pt-0.5">
                    {entry.status === "complete" ? (
                      <div className="h-3.5 w-3.5 rounded-full bg-success/20 flex items-center justify-center">
                        <span className="text-success text-[8px]">✓</span>
                      </div>
                    ) : entry.status === "active" ? (
                      <div className="h-3.5 w-3.5 rounded-full bg-accent/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent agent-thinking" />
                      </div>
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full bg-surface-alt/50 flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-muted/30" />
                      </div>
                    )}
                    {entry.step < activity.length && (
                      <div className="w-px h-3 bg-border/30 mt-0.5" />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={`pb-2 min-w-0 flex-1 ${
                      entry.status === "pending" ? "opacity-40" : ""
                    }`}
                  >
                    <p
                      className={`text-[11px] font-medium leading-snug ${
                        entry.status === "active"
                          ? "text-accent"
                          : entry.status === "complete"
                          ? "text-foreground/80"
                          : "text-muted"
                      }`}
                    >
                      {entry.label}
                    </p>
                    {entry.detail && (
                      <p className="text-[10px] text-muted/70 mt-0.5 leading-snug">
                        {entry.detail}
                      </p>
                    )}
                    {entry.duration_ms !== undefined && entry.status === "complete" && (
                      <p className="text-[9px] font-mono text-muted/40 mt-0.5">
                        {formatDuration(entry.duration_ms)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
