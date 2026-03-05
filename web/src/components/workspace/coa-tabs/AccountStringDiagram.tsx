"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCOAStore,
  coaStoreKey,
  type COADimension,
} from "@/lib/coa-store";
import {
  ACCOUNT_STRING_SEGMENTS,
  type AccountStringSegment,
} from "@/lib/mock-hierarchy-data";

// ── Types ────────────────────────────────────────────────────────────────────

interface SegmentData {
  id: string;
  name: string;
  length: number;
  mandatory: boolean;
  fillRate: number;
  uniqueValues: number;
  exampleValues: string[];
  reportingPurpose: string;
  issues: { title: string; status: string }[];
  fromAgent: boolean;
}

interface AccountStringDiagramProps {
  engagementId: string;
  deliverableId: string;
  onProposeToAgent?: (message: string) => void;
}

// ── Derive segments from store or fall back to static mock ──────────────────

function deriveSegments(dimensions: COADimension[] | undefined): SegmentData[] {
  if (dimensions && dimensions.length > 0) {
    return dimensions.map((dim) => ({
      id: dim.id,
      name: dim.dimension,
      length: dim.unique_values > 100 ? 6 : dim.unique_values > 10 ? 4 : 2,
      mandatory: dim.mandatory,
      fillRate: dim.fill_rate,
      uniqueValues: dim.unique_values,
      exampleValues: dim.key_values
        ? dim.key_values.split(",").map((v) => v.trim()).slice(0, 4)
        : [],
      reportingPurpose: dim.reporting_purpose,
      issues: dim.issues.map((i) => ({ title: i.title, status: i.status })),
      fromAgent: true,
    }));
  }
  // Static fallback
  return ACCOUNT_STRING_SEGMENTS.map((seg) => ({
    id: seg.id,
    name: seg.name,
    length: seg.length,
    mandatory: seg.mandatory,
    fillRate: seg.fillRate,
    uniqueValues: seg.cardinality,
    exampleValues: seg.exampleValues.slice(0, 4),
    reportingPurpose: seg.statAlignment,
    issues: [],
    fromAgent: false,
  }));
}

// ── Segment Card ─────────────────────────────────────────────────────────────

function SegmentCard({
  segment,
  isActive,
  onClick,
}: {
  segment: SegmentData;
  isActive: boolean;
  onClick: () => void;
}) {
  const openIssues = segment.issues.filter(
    (i) => i.status === "open" || i.status === "in_progress"
  ).length;

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col rounded-lg border p-3 transition-all min-w-[100px] flex-1 ${
        isActive
          ? "border-accent bg-accent/10 ring-1 ring-accent/30"
          : "border-border/50 bg-surface-alt/60 hover:border-border hover:bg-surface-alt/80"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-[11px] font-medium uppercase tracking-wide ${
            isActive ? "text-accent" : "text-muted"
          }`}
        >
          {segment.name}
        </span>
        {segment.mandatory ? (
          <span className="text-[9px] text-success font-mono">REQ</span>
        ) : (
          <span className="text-[9px] text-faint font-mono">OPT</span>
        )}
      </div>
      <span className="text-lg font-mono text-foreground">{segment.length}</span>
      <span className="text-[10px] text-faint">characters</span>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-[10px] font-mono text-secondary">
          {segment.fillRate}%
        </span>
        {openIssues > 0 && (
          <span className="text-[10px] font-mono text-warning">
            {openIssues} issues
          </span>
        )}
      </div>
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function AccountStringDiagram({
  engagementId,
  deliverableId,
  onProposeToAgent,
}: AccountStringDiagramProps) {
  const storeKey = coaStoreKey(engagementId, deliverableId);
  const store = useCOAStore((s) => s.getStore(storeKey));
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);

  const segments = useMemo(
    () => deriveSegments(store?.dimensions),
    [store?.dimensions]
  );

  const totalLength = segments.reduce((sum, s) => sum + s.length, 0);
  const activeSegment = segments.find((s) => s.id === activeSegmentId);

  // Build live coding string preview
  const codingPreview = segments
    .map((s) => {
      const example = s.exampleValues[0] ?? "X".repeat(s.length);
      return example.padEnd(s.length, " ").slice(0, s.length);
    })
    .join("-");

  const handlePropose = () => {
    if (!onProposeToAgent) return;
    const summary = segments
      .map((s) => `${s.name}: ${s.length} chars, ${s.mandatory ? "required" : "optional"}, ${s.fillRate}% fill`)
      .join("\n");
    onProposeToAgent(
      `Review my proposed coding string design:\n\n${summary}\n\nTotal: ${totalLength} characters. Are there gaps or improvements you'd recommend?`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
            Code Block Dimensions
          </h3>
          <p className="text-sm text-muted mt-1">
            {totalLength} characters across {segments.length} segments
            {segments[0]?.fromAgent && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded border border-accent/30 bg-accent/10 text-accent">
                From agent
              </span>
            )}
          </p>
        </div>
        {onProposeToAgent && (
          <button
            onClick={handlePropose}
            className="flex items-center gap-1.5 rounded border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
          >
            Propose to agent
          </button>
        )}
      </div>

      {/* Live coding string preview */}
      <div className="rounded-lg border border-border bg-surface/50 px-4 py-3">
        <span className="text-[11px] uppercase tracking-[0.1em] text-faint block mb-1">
          Coding String Preview
        </span>
        <div className="font-mono text-foreground text-sm tracking-widest overflow-x-auto">
          {codingPreview}
        </div>
        <span className="text-[10px] text-faint mt-1 block">
          {totalLength} chars total
        </span>
      </div>

      {/* Segment cards */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {segments.map((seg) => (
          <SegmentCard
            key={seg.id}
            segment={seg}
            isActive={activeSegmentId === seg.id}
            onClick={() =>
              setActiveSegmentId(activeSegmentId === seg.id ? null : seg.id)
            }
          />
        ))}
      </div>

      {/* Detail panel for selected segment */}
      <AnimatePresence mode="wait">
        {activeSegment && (
          <motion.div
            key={activeSegment.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="rounded-lg border border-border bg-surface p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground uppercase tracking-wide">
                {activeSegment.name}
              </h4>
              {activeSegment.mandatory ? (
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
                <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">
                  Length
                </span>
                <span className="font-mono text-foreground">
                  {activeSegment.length} characters
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">
                  Values
                </span>
                <span className="font-mono text-foreground">
                  {activeSegment.uniqueValues} unique
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">
                  Fill Rate
                </span>
                <span
                  className={`font-mono ${
                    activeSegment.fillRate >= 95
                      ? "text-success"
                      : activeSegment.fillRate >= 80
                        ? "text-foreground"
                        : "text-warning"
                  }`}
                >
                  {activeSegment.fillRate}%
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-[0.1em] text-faint block mb-1">
                Reporting Purpose
              </span>
              <span className="text-sm text-secondary">
                {activeSegment.reportingPurpose}
              </span>
            </div>

            {activeSegment.exampleValues.length > 0 && (
              <div>
                <span className="text-[11px] uppercase tracking-[0.1em] text-faint block mb-1.5">
                  Example Values
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeSegment.exampleValues.map((val) => (
                    <span
                      key={val}
                      className="inline-flex items-center rounded bg-surface-alt px-2 py-0.5 text-[11px] font-mono text-secondary border border-border/50"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Inline issues */}
            {activeSegment.issues.length > 0 && (
              <div>
                <span className="text-[11px] uppercase tracking-[0.1em] text-faint block mb-1.5">
                  Issues
                </span>
                <div className="space-y-1.5">
                  {activeSegment.issues.map((issue, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs"
                    >
                      <span
                        className={`mt-0.5 shrink-0 ${
                          issue.status === "open" || issue.status === "in_progress"
                            ? "text-warning"
                            : "text-success"
                        }`}
                      >
                        {issue.status === "open" || issue.status === "in_progress"
                          ? "\u26A0"
                          : "\u2713"}
                      </span>
                      <span className="text-secondary">{issue.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
