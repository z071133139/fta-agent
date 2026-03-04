"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ACCOUNT_STRING_SEGMENTS,
  STAT_ALIGNMENT_PILLS,
  type AccountStringSegment,
} from "@/lib/mock-hierarchy-data";

// ── Segment Detail Card ──────────────────────────────────────────────────────

function SegmentDetail({ segment }: { segment: AccountStringSegment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border border-border bg-surface p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground uppercase tracking-wide">
          {segment.name}
        </h4>
        {segment.mandatory ? (
          <span className="text-[11px] font-mono text-success bg-success/15 px-2 py-0.5 rounded border border-success/30">
            REQUIRED
          </span>
        ) : (
          <span className="text-[11px] font-mono text-muted bg-surface-alt px-2 py-0.5 rounded border border-border">
            OPTIONAL
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Length</span>
          <span className="font-mono text-foreground">{segment.length} characters</span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Values</span>
          <span className="font-mono text-foreground">{segment.cardinality} unique</span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Fill Rate</span>
          <span className="font-mono text-foreground">{segment.fillRate}%</span>
        </div>
      </div>

      <div>
        <span className="text-[11px] uppercase tracking-[0.1em] text-faint block mb-1">
          Statutory Alignment
        </span>
        <span className="text-sm text-secondary">{segment.statAlignment}</span>
      </div>

      {segment.accountTypeCounts && (
        <div>
          <span className="text-[11px] uppercase tracking-[0.1em] text-faint block mb-1.5">
            Account Types
          </span>
          <div className="flex gap-2">
            {Object.entries(segment.accountTypeCounts).map(([type, count]) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 rounded bg-surface-alt px-2 py-0.5 text-[11px] font-mono text-secondary border border-border/50"
              >
                <span className="text-accent">{type}</span>
                <span className="text-muted">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function AccountStringDiagram() {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const segments = ACCOUNT_STRING_SEGMENTS;

  const totalCardinality = segments.reduce((sum, s) => sum + s.cardinality, 0);
  const totalLength = segments.reduce((sum, s) => sum + s.length, 0);
  const selected = segments.find((s) => s.id === activeSegment);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
          Account String Composition
        </h3>
        <p className="text-sm text-muted mt-1">
          Full GL account string: {totalLength} characters across {segments.length} segments
        </p>
      </div>

      {/* Segmented Bar */}
      <div className="rounded-lg border border-border bg-surface/50 p-4">
        <div className="flex gap-0.5 h-[120px]">
          {segments.map((seg) => {
            const widthPct = Math.max((seg.cardinality / totalCardinality) * 100, 8);
            const isActive = activeSegment === seg.id;

            return (
              <button
                key={seg.id}
                onClick={() => setActiveSegment(isActive ? null : seg.id)}
                className={`relative flex flex-col items-center justify-between rounded-md transition-all duration-150 px-2 py-3 min-w-[60px] ${
                  isActive
                    ? "bg-accent/20 border-2 border-accent ring-1 ring-accent/30 z-10 scale-[1.02]"
                    : "bg-surface-alt/80 border border-border/50 hover:bg-surface-alt hover:border-border"
                }`}
                style={{ width: `${widthPct}%` }}
              >
                {/* Segment name */}
                <span
                  className={`text-[11px] font-medium uppercase tracking-wide truncate w-full text-center ${
                    isActive ? "text-accent" : "text-muted"
                  }`}
                >
                  {seg.name}
                </span>

                {/* Length */}
                <span className="text-[11px] font-mono text-faint">
                  {seg.length} chr
                </span>

                {/* Example values */}
                <div className="flex flex-col items-center gap-0.5 overflow-hidden">
                  {seg.exampleValues.slice(0, 3).map((val) => (
                    <span
                      key={val}
                      className="text-[10px] font-mono text-secondary truncate max-w-full"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Cardinality scale label */}
        <p className="text-[11px] text-faint mt-2 text-center font-mono">
          Widths proportional to cardinality ({totalCardinality} total unique values)
        </p>
      </div>

      {/* Detail Card */}
      <AnimatePresence mode="wait">
        {selected && <SegmentDetail key={selected.id} segment={selected} />}
      </AnimatePresence>

      {/* Statutory Alignment Summary */}
      <div>
        <h4 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-3">
          Statutory Alignment Summary
        </h4>
        <div className="flex flex-wrap gap-2">
          {STAT_ALIGNMENT_PILLS.map((pill) => (
            <span
              key={pill.line}
              className="inline-flex items-center gap-1.5 rounded-md bg-surface-alt/80 border border-border/50 px-3 py-1.5 text-sm"
            >
              <span className="font-mono text-accent text-[11px]">{pill.line}</span>
              <span className="text-secondary">{pill.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
