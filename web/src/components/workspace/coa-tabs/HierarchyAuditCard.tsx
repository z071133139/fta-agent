"use client";

import { motion } from "framer-motion";
import type { HierarchyClassification } from "@/lib/mock-hierarchy-data";
import { TierBadge } from "./TierBadge";

// ── Confidence Badge ─────────────────────────────────────────────────────────

const CONFIDENCE_STYLES = {
  high: "bg-success/15 text-success border-success/30",
  medium: "bg-accent/15 text-accent border-accent/30",
  low: "bg-muted/15 text-muted border-muted/30",
} as const;

// ── Audit Card ───────────────────────────────────────────────────────────────

interface HierarchyAuditCardProps {
  classification: HierarchyClassification;
}

export function HierarchyAuditCard({ classification }: HierarchyAuditCardProps) {
  const c = classification;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border border-border bg-surface p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-mono text-foreground">
            {c.accountCode} — {c.accountName}
          </h4>
          <p className="text-[11px] text-muted mt-0.5">
            Type: {c.accountType} &middot; FSLI Node: {c.fsliNodeId}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TierBadge tier={c.tier} status={c.status} />
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded border ${CONFIDENCE_STYLES[c.confidence]}`}
          >
            {c.confidence.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Basis */}
      <div>
        <span className="text-[11px] uppercase tracking-[0.1em] text-faint block mb-1">
          Classification Basis
        </span>
        <p className="text-sm text-secondary leading-relaxed">
          &ldquo;{c.basis}&rdquo;
        </p>
      </div>

      {/* Agent + Hash */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Agent</span>
          <span className="font-mono text-secondary">{c.agent}</span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Hash</span>
          <span className="font-mono text-faint text-[11px]">{c.hash}</span>
        </div>
      </div>

      {/* Audit Trail */}
      {c.auditTrail.length > 0 && (
        <div>
          <span className="text-[11px] uppercase tracking-[0.1em] text-faint block mb-2">
            Change History ({c.auditTrail.length})
          </span>
          <div className="space-y-1.5">
            {c.auditTrail.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-2 text-[11px] rounded bg-surface-alt/50 px-2.5 py-1.5 border border-border/30"
              >
                <span className="font-mono text-accent shrink-0 uppercase">
                  {entry.action}
                </span>
                <span className="text-muted shrink-0">&middot;</span>
                <span className="text-secondary">{entry.actor}</span>
                <span className="text-muted shrink-0">&middot;</span>
                <span className="text-muted truncate flex-1">{entry.detail}</span>
                <span className="text-faint shrink-0 font-mono">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-perspective summary */}
      <div>
        <span className="text-[11px] uppercase tracking-[0.1em] text-faint block mb-1.5">
          Cross-Perspective Mapping
        </span>
        <div className="flex gap-2">
          {(Object.entries(c.perspectives) as [string, string][]).map(([persp, nodeId]) => (
            <span
              key={persp}
              className="inline-flex items-center gap-1 rounded bg-surface-alt px-2 py-0.5 text-[11px] font-mono border border-border/50"
            >
              <span className="text-accent">{persp}</span>
              <span className="text-muted">{nodeId}</span>
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
