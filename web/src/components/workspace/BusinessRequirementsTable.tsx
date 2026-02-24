"use client";

import { useState, useMemo, useCallback, useEffect, useRef, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaptureBar, type CaptureBarHandle } from "./CaptureBar";
import type {
  BusinessRequirementsData,
  BusinessRequirement,
  BRTag,
  BRSegment,
  BRStatus,
  FitRating,
  AgenticRating,
  ERPAssessment,
  FitGapAnalysis,
} from "@/lib/mock-data";
import { useWorkshopStore } from "@/lib/workshop-store";

// ── Config ────────────────────────────────────────────────────────────────

const TAG_CFG: Record<BRTag, { label: string; color: string; bg: string }> = {
  REG: { label: "REG", color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
  CTL: { label: "CTL", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  FIN: { label: "FIN", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  OPS: { label: "OPS", color: "#94A3B8", bg: "rgba(100,116,139,0.20)" },
  INT: { label: "INT", color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
};

const TAG_VALUES: BRTag[] = ["REG", "CTL", "FIN", "OPS", "INT"];
const SEGMENT_VALUES: BRSegment[] = ["P&C", "Life", "Re", "All"];
const STATUS_VALUES: BRStatus[] = ["draft", "validated", "deferred", "out_of_scope"];

const SEGMENT_CFG: Record<BRSegment, { label: string; color: string; bg: string }> = {
  "P&C": { label: "P&C", color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  Life: { label: "Life", color: "#A855F7", bg: "rgba(168,85,247,0.12)" },
  Re:   { label: "Re",   color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  All:  { label: "All",  color: "#64748B", bg: "rgba(100,116,139,0.15)" },
};

const FIT_CFG: Record<FitRating, { label: string; color: string; bg: string }> = {
  F1: { label: "Native Fit",      color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  F2: { label: "Configurable",    color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  F3: { label: "Extension Req'd", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  F4: { label: "External System", color: "#F97316", bg: "rgba(249,115,22,0.15)" },
  F5: { label: "Arch Gap",        color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
};

const AGENTIC_CFG: Record<AgenticRating, { label: string; color: string; bg: string }> = {
  A1: { label: "Full Closure",    color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  A2: { label: "Partial Closure", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  A3: { label: "Agent-Assisted",  color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  A0: { label: "Not Applicable",  color: "#64748B", bg: "rgba(100,116,139,0.15)" },
};

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  draft:        { color: "#64748B", bg: "rgba(100,116,139,0.15)" },
  validated:    { color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  deferred:     { color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  out_of_scope: { color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
};

const PA_NAMES: Record<string, string> = {
  "PA-01": "Chart of Accounts & Org Structure",
  "PA-02": "General Ledger & Multi-Basis Accounting",
  "PA-03": "Premium Accounting & Revenue Recognition",
  "PA-04": "Loss & Claims Accounting",
  "PA-05": "Ceded Reinsurance Accounting",
  "PA-06": "Assumed Reinsurance Accounting",
  "PA-07": "Policyholder Liabilities & Reserves",
  "PA-08": "Investment Accounting Interface",
  "PA-09": "Accounts Payable & Commission Payments",
  "PA-10": "Accounts Receivable & Premium Collections",
  "PA-11": "Intercompany & Pooling",
  "PA-12": "Fixed Assets & Leases",
  "PA-13": "Cash Management & Treasury",
  "PA-14": "Expense Management & Cost Allocation",
  "PA-15": "Financial Close & Consolidation",
  "PA-16": "Statutory & Regulatory Reporting",
  "PA-17": "GAAP/IFRS External Reporting",
  "PA-18": "Tax Accounting & Compliance",
  "PA-19": "Management Reporting & Analytics",
  "PA-20": "Data Integration & Sub-Ledger Interfaces",
};

// ── Badge component ───────────────────────────────────────────────────────

function Badge({ label, color, bg, border, onClick }: { label: string; color: string; bg: string; border?: boolean; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 9,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        color,
        backgroundColor: bg,
        border: border ? `1px solid ${color}30` : undefined,
        borderRadius: 3,
        padding: "1px 6px",
        lineHeight: 1.6,
        whiteSpace: "nowrap",
        cursor: onClick ? "pointer" : undefined,
      }}
    >
      {label}
    </span>
  );
}

// ── FitGapCard ────────────────────────────────────────────────────────────

function FitGapCard({ fitGap }: { fitGap: FitGapAnalysis }) {
  return (
    <div className="mt-3 space-y-3">
      {/* ERP Assessment table */}
      <div className="rounded-lg bg-surface/60 border border-border/40 overflow-hidden">
        <div className="px-3 py-2 border-b border-border/30">
          <span className="text-[9px] uppercase tracking-[0.12em] text-[#3B82F6] font-semibold">
            ERP Assessment
          </span>
        </div>
        <div className="divide-y divide-border/20">
          {fitGap.erp_assessments.map((a: ERPAssessment) => {
            const fc = FIT_CFG[a.rating];
            return (
              <div key={a.platform} className="flex items-start gap-3 px-3 py-2">
                <span className="flex-shrink-0 w-[120px] text-[10px] text-muted pt-0.5">
                  {a.platform}
                </span>
                <Badge label={a.rating} color={fc.color} bg={fc.bg} border />
                <span className="text-[10px] text-muted leading-relaxed flex-1">
                  {a.notes}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap Remediation */}
      {fitGap.gap_remediation && (
        <div className="rounded-lg bg-surface/60 border border-border/40 px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="text-[9px] uppercase tracking-[0.12em] text-[#F59E0B] font-semibold">
                Gap Remediation
              </span>
              <p className="text-[10px] text-muted mt-1 leading-relaxed">{fitGap.gap_remediation}</p>
            </div>
            {fitGap.gap_effort && (
              <Badge label={`Effort: ${fitGap.gap_effort}`} color="#F59E0B" bg="rgba(245,158,11,0.12)" border />
            )}
          </div>
        </div>
      )}

      {/* Agentic Bridge */}
      {fitGap.agentic_rating && (
        <div className="rounded-lg bg-surface/60 border border-border/40 px-3 py-2.5">
          <span className="text-[9px] uppercase tracking-[0.12em] text-[#8B5CF6] font-semibold">
            Agentic Bridge
          </span>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge
              label={`${fitGap.agentic_rating} ${AGENTIC_CFG[fitGap.agentic_rating].label}`}
              color={AGENTIC_CFG[fitGap.agentic_rating].color}
              bg={AGENTIC_CFG[fitGap.agentic_rating].bg}
              border
            />
            {fitGap.agentic_autonomy && (
              <span className="text-[9px] font-mono text-muted">{fitGap.agentic_autonomy}</span>
            )}
          </div>
          {fitGap.agentic_bridge && (
            <p className="text-[10px] text-muted mt-1.5 leading-relaxed">{fitGap.agentic_bridge}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Framework Legend ───────────────────────────────────────────────────────

function FrameworkLegend() {
  const [expanded, setExpanded] = useState(false);

  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          key="legend"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15 }}
          className="overflow-hidden"
        >
          <div className="mx-0 mb-3 px-4 py-3.5 rounded-lg bg-surface/60 border border-border/40">
            <div className="grid grid-cols-2 gap-6">
              {/* Fit Rating column */}
              <div>
                <p className="text-[9px] uppercase tracking-[0.12em] text-[#3B82F6] font-semibold mb-2.5">
                  ERP Fit Rating
                </p>
                <div className="space-y-1.5">
                  {(["F1", "F2", "F3", "F4", "F5"] as FitRating[]).map((r) => (
                    <div key={r} className="flex items-center gap-2">
                      <Badge label={r} color={FIT_CFG[r].color} bg={FIT_CFG[r].bg} border />
                      <span className="text-[10px] text-foreground/90">{FIT_CFG[r].label}</span>
                      <span className="text-[9px] text-muted/80 ml-auto">
                        {r === "F1" ? "Config only" : r === "F2" ? "Low-mod effort" : r === "F3" ? "Custom dev" : r === "F4" ? "Separate tool" : "Redesign likely"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agentic column */}
              <div>
                <p className="text-[9px] uppercase tracking-[0.12em] text-[#8B5CF6] font-semibold mb-2.5">
                  Agentic Gap Closure
                </p>
                <div className="space-y-1.5">
                  {(["A1", "A2", "A3", "A0"] as AgenticRating[]).map((r) => (
                    <div key={r} className="flex items-center gap-2">
                      <Badge label={r} color={AGENTIC_CFG[r].color} bg={AGENTIC_CFG[r].bg} border />
                      <span className="text-[10px] text-foreground/90">{AGENTIC_CFG[r].label}</span>
                      <span className="text-[9px] text-muted/80 ml-auto">
                        {r === "A1" ? "Agent replaces" : r === "A2" ? "Common cases" : r === "A3" ? "Accelerates" : "Arch change"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Effort + pilot note */}
            <div className="mt-4 pt-3 border-t border-border/30">
              <p className="text-[9px] text-muted">
                <span className="font-semibold text-muted">Effort:</span>{" "}
                S = &lt;100 hrs · M = 100–500 hrs · L = 500–2K hrs · XL = 2K+ hrs
              </p>
              <p className="text-[9px] text-muted/50 mt-1.5">
                PA-05 (Ceded Reinsurance) assessed as pilot — widest ERP variance.
                SAP assessed with/without FS-RI — this decision swings 15 of 25 ratings.
              </p>
            </div>
          </div>
        </motion.div>
      )}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className={[
          "text-[9px] px-2 py-0.5 rounded border transition-colors",
          expanded
            ? "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/40"
            : "border-border/20 text-muted/70 hover:text-muted hover:border-border/50",
        ].join(" ")}
      >
        Framework {expanded ? "▲" : "▾"}
      </button>
    </AnimatePresence>
  );
}

// ── Requirement Row ───────────────────────────────────────────────────────

function RequirementRow({
  req,
  expanded,
  onToggle,
  workshopMode,
  isSelected,
  isNew,
  isModified,
  onSelect,
  onInlineEdit,
}: {
  req: BusinessRequirement;
  expanded: boolean;
  onToggle: () => void;
  workshopMode: boolean;
  isSelected: boolean;
  isNew: boolean;
  isModified: boolean;
  onSelect: () => void;
  onInlineEdit: (field: string) => void;
}) {
  const tc = TAG_CFG[req.tag];
  const sc = SEGMENT_CFG[req.segment];
  const stc = STATUS_CFG[req.status] ?? STATUS_CFG.draft;

  // Get primary fit rating (SAP with FS-RI) for inline badge
  const primaryAssessment = req.fit_gap?.erp_assessments.find(
    (a) => a.platform === "SAP with FS-RI"
  );
  const fc = primaryAssessment ? FIT_CFG[primaryAssessment.rating] : null;
  const ac = req.fit_gap?.agentic_rating ? AGENTIC_CFG[req.fit_gap.agentic_rating] : null;

  const handleClick = (e: React.MouseEvent) => {
    if (workshopMode) {
      e.stopPropagation();
      // Blur any focused input (e.g. CaptureBar) so keyboard shortcuts work
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        (document.activeElement as HTMLElement).blur();
      }
      onSelect();
    } else {
      onToggle();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (workshopMode) {
      e.stopPropagation();
      onInlineEdit("text");
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={[
          "group flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all",
          isSelected
            ? "bg-surface border-accent/50 ring-1 ring-accent/30"
            : expanded
              ? "bg-surface border-border/60"
              : "border-transparent hover:bg-surface/50 hover:border-border/30",
        ].join(" ")}
        style={{
          borderLeftWidth: isNew ? 3 : undefined,
          borderLeftColor: isNew ? "#10B981" : undefined,
        }}
      >
        {/* Modified indicator */}
        {isModified && !isNew && (
          <span
            className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "#F59E0B" }}
          />
        )}

        {/* ID */}
        <span className="flex-shrink-0 text-[9px] font-mono text-muted w-[72px]">
          {req.id}
        </span>

        {/* Tag — clickable cycle in workshop */}
        <Badge
          label={tc.label}
          color={tc.color}
          bg={tc.bg}
          onClick={workshopMode ? () => onInlineEdit("tag") : undefined}
        />

        {/* Segment — clickable cycle in workshop */}
        <Badge
          label={sc.label}
          color={sc.color}
          bg={sc.bg}
          onClick={workshopMode ? () => onInlineEdit("segment") : undefined}
        />

        {/* Text */}
        <span className="flex-1 text-[11px] text-foreground/90 leading-snug truncate">
          {req.text}
        </span>

        {/* Cross-PA reference chips — workshop mode only */}
        {workshopMode && (
          <CrossPAChips refs={detectCrossPARefs(req.text, req.pa_id)} />
        )}

        {/* Fit + Agentic badges (assessed only) */}
        {fc && (
          <Badge label={primaryAssessment!.rating} color={fc.color} bg={fc.bg} border />
        )}
        {ac && req.fit_gap?.agentic_rating && (
          <Badge label={req.fit_gap.agentic_rating} color={ac.color} bg={ac.bg} border />
        )}

        {/* Status — clickable cycle in workshop */}
        <Badge
          label={req.status}
          color={stc.color}
          bg={stc.bg}
          onClick={workshopMode ? () => onInlineEdit("status") : undefined}
        />

        {/* Chevron */}
        <span className="text-[10px] text-muted/70 flex-shrink-0">
          {expanded ? "▲" : "▾"}
        </span>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mx-3 mb-1 px-4 py-3 rounded-lg bg-surface/60 border border-border/40">
              {/* SP + full text */}
              <p className="text-[9px] font-mono text-muted/80 mb-1">
                {req.sp_id} · {req.pa_id}
              </p>
              <p className="text-[11px] text-muted leading-relaxed">
                {req.text}
              </p>

              {/* Fit/Gap card */}
              {req.fit_gap && <FitGapCard fitGap={req.fit_gap} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Cross-PA reference detection ─────────────────────────────────────────

function detectCrossPARefs(text: string, currentPaId: string): string[] {
  const matches = text.match(/PA-\d{2}/g);
  if (!matches) return [];
  const unique = [...new Set(matches)];
  return unique.filter((ref) => ref !== currentPaId);
}

function CrossPAChips({ refs }: { refs: string[] }) {
  if (refs.length === 0) return null;
  return (
    <>
      {refs.map((ref) => (
        <span
          key={ref}
          className="text-[8px] font-mono px-1.5 py-0.5 rounded shrink-0"
          style={{
            backgroundColor: "rgba(6,182,212,0.12)",
            color: "#06B6D4",
          }}
        >
          → {ref}
        </span>
      ))}
    </>
  );
}

// ── Workshop Agent Insight Panel ──────────────────────────────────────────

function AgentInsightPanel({
  req,
  onAddRequirement,
}: {
  req: BusinessRequirement;
  onAddRequirement: (text: string) => void;
}) {
  const fg = req.fit_gap;
  if (!fg) return null;

  const hasAgentic = fg.agentic_rating && fg.agentic_bridge;
  const hasRemediation = fg.gap_remediation;
  if (!hasAgentic && !hasRemediation) return null;

  const ac = fg.agentic_rating ? AGENTIC_CFG[fg.agentic_rating] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="mx-3 mb-1 px-3 py-2.5 rounded-lg border overflow-hidden"
      style={{
        backgroundColor: "rgba(139,92,246,0.04)",
        borderColor: "rgba(139,92,246,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] agent-thinking" />
        <span className="text-[9px] uppercase tracking-[0.12em] text-[#8B5CF6] font-semibold">
          Agent Insight
        </span>
        {ac && fg.agentic_rating && (
          <Badge label={`${fg.agentic_rating} ${ac.label}`} color={ac.color} bg={ac.bg} border />
        )}
        {fg.agentic_autonomy && (
          <span className="text-[9px] font-mono text-muted/80">{fg.agentic_autonomy}</span>
        )}
      </div>

      {/* Agentic bridge as suggestion chip */}
      {fg.agentic_bridge && (
        <button
          onClick={() => onAddRequirement(fg.agentic_bridge!)}
          className="group flex items-start gap-2 w-full text-left px-2.5 py-2 rounded-md border border-border/30 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 transition-colors mb-1.5"
        >
          <span className="text-[9px] text-[#10B981] font-mono mt-0.5 shrink-0">+R</span>
          <span className="text-[10px] text-muted leading-relaxed flex-1">
            {fg.agentic_bridge}
          </span>
          <span
            className="text-[9px] font-mono font-semibold shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "rgba(139,92,246,0.15)", color: "#A855F7" }}
          >
            Y accept
          </span>
        </button>
      )}

      {/* Gap remediation as suggestion chip */}
      {fg.gap_remediation && (
        <button
          onClick={() => onAddRequirement(fg.gap_remediation!)}
          className="group flex items-start gap-2 w-full text-left px-2.5 py-2 rounded-md border border-border/30 hover:border-[#F59E0B]/30 hover:bg-[#F59E0B]/5 transition-colors"
        >
          <span className="text-[9px] text-[#F59E0B] font-mono mt-0.5 shrink-0">+R</span>
          <span className="text-[10px] text-muted leading-relaxed flex-1">
            {fg.gap_remediation}
          </span>
          <span
            className="text-[9px] font-mono font-semibold shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "rgba(139,92,246,0.15)", color: "#A855F7" }}
          >
            Y accept
          </span>
          {fg.gap_effort && (
            <Badge label={fg.gap_effort} color="#F59E0B" bg="rgba(245,158,11,0.12)" />
          )}
        </button>
      )}

      {/* ERP assessment summary chips */}
      {fg.erp_assessments.length > 0 && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/20">
          <span className="text-[8px] text-muted/60 uppercase tracking-wide">ERP Fit</span>
          {fg.erp_assessments.map((a) => {
            const fc = FIT_CFG[a.rating];
            return (
              <span key={a.platform} className="flex items-center gap-1">
                <Badge label={a.rating} color={fc.color} bg={fc.bg} />
                <span className="text-[8px] text-muted/60">{a.platform}</span>
              </span>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ── Inline Edit Modal ─────────────────────────────────────────────────────

function InlineEditOverlay({
  req,
  field,
  onCommit,
  onCancel,
}: {
  req: BusinessRequirement;
  field: string;
  onCommit: (updates: Partial<BusinessRequirement>) => void;
  onCancel: () => void;
}) {
  const [textDraft, setTextDraft] = useState(req.text);

  if (field === "text") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-surface border border-border rounded-xl p-4 w-[480px] shadow-2xl">
          <p className="text-[9px] uppercase tracking-[0.12em] text-muted font-semibold mb-2">
            Edit Requirement — {req.id}
          </p>
          <textarea
            autoFocus
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (textDraft.trim()) onCommit({ text: textDraft.trim() });
              }
              if (e.key === "Escape") onCancel();
            }}
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-[11px] text-foreground resize-none focus:outline-none focus:border-accent/60"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={onCancel}
              className="text-[10px] text-muted px-3 py-1 rounded hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { if (textDraft.trim()) onCommit({ text: textDraft.trim() }); }}
              className="text-[10px] text-accent bg-accent/15 px-3 py-1 rounded hover:bg-accent/25 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ── Summary Bar ───────────────────────────────────────────────────────────

function SummaryBar({ requirements, hasAssessed, captureCount, captureFlip }: { requirements: BusinessRequirement[]; hasAssessed: boolean; captureCount: number; captureFlip?: boolean }) {
  const total = requirements.length;
  const assessed = requirements.filter((r) => r.fit_gap).length;

  // Count fit ratings for primary platform (SAP with FS-RI)
  const fitCounts = { f12: 0, f3: 0, f45: 0 };
  const agenticCounts: Record<string, number> = {};

  for (const r of requirements) {
    if (!r.fit_gap) continue;
    const primary = r.fit_gap.erp_assessments.find((a) => a.platform === "SAP with FS-RI");
    if (primary) {
      if (primary.rating === "F1" || primary.rating === "F2") fitCounts.f12++;
      else if (primary.rating === "F3") fitCounts.f3++;
      else fitCounts.f45++;
    }
    if (r.fit_gap.agentic_rating) {
      agenticCounts[r.fit_gap.agentic_rating] = (agenticCounts[r.fit_gap.agentic_rating] ?? 0) + 1;
    }
  }

  // Tag counts
  const tagCounts: Record<string, number> = {};
  for (const r of requirements) {
    tagCounts[r.tag] = (tagCounts[r.tag] ?? 0) + 1;
  }

  return (
    <div className="flex items-center gap-4 px-6 py-2.5 border-b border-border/40 text-[10px] flex-wrap">
      <span className="text-muted">{total} requirements</span>
      {captureCount > 0 && (
        <>
          <div className="w-px h-3 bg-border/40" />
          <span
            className={`font-mono font-semibold px-1.5 py-0.5 rounded${captureFlip ? " workshop-animate badge-flip" : ""}`}
            style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#10B981" }}
          >
            {captureCount} captured
          </span>
        </>
      )}
      {hasAssessed && (
        <>
          <span>
            <span className="text-muted mr-1">Assessed</span>
            <span className="font-mono text-foreground">{assessed}</span>
            <span className="text-muted/80 ml-1">(PA-05)</span>
          </span>
          <div className="w-px h-3 bg-border/40" />
          <span>
            <span className="text-[#10B981] mr-1">F1/F2</span>
            <span className="font-mono text-[#10B981]">{fitCounts.f12}</span>
          </span>
          <span>
            <span className="text-[#F59E0B] mr-1">F3</span>
            <span className="font-mono text-[#F59E0B]">{fitCounts.f3}</span>
          </span>
          <span>
            <span className="text-[#EF4444] mr-1">F4/F5</span>
            <span className="font-mono text-[#EF4444]">{fitCounts.f45}</span>
          </span>
          <div className="w-px h-3 bg-border/40" />
          {Object.entries(agenticCounts).map(([k, v]) => (
            <span key={k}>
              <span style={{ color: AGENTIC_CFG[k as AgenticRating].color + "99" }} className="mr-1">{k}</span>
              <span className="font-mono" style={{ color: AGENTIC_CFG[k as AgenticRating].color }}>{v}</span>
            </span>
          ))}
        </>
      )}
      <div className="w-px h-3 bg-border/40" />
      {(Object.keys(TAG_CFG) as BRTag[]).map((t) =>
        tagCounts[t] ? (
          <span key={t}>
            <span style={{ color: TAG_CFG[t].color + "80" }} className="mr-1">{t}</span>
            <span className="font-mono" style={{ color: TAG_CFG[t].color }}>{tagCounts[t]}</span>
          </span>
        ) : null
      )}
    </div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────

type FilterState = {
  search: string;
  tags: Set<BRTag>;
  segments: Set<BRSegment>;
  fitRatings: Set<FitRating>;
  agenticRatings: Set<AgenticRating>;
  assessedOnly: boolean;
};

// ── Filter Legend Strip ───────────────────────────────────────────────────

const TAG_LABELS: Record<BRTag, string> = {
  REG: "Regulatory",
  CTL: "Control",
  FIN: "Financial",
  OPS: "Operational",
  INT: "Integration",
};

const SEGMENT_LABELS: Record<BRSegment, string> = {
  "P&C": "Property & Casualty",
  Life: "Life Insurance",
  Re: "Reinsurance",
  All: "All Lines",
};

const FIT_LABELS: Record<FitRating, string> = {
  F1: "Native Fit",
  F2: "Configurable",
  F3: "Extension Req'd",
  F4: "External System",
  F5: "Arch Gap",
};

const AGENTIC_LABELS: Record<AgenticRating, string> = {
  A0: "Not Applicable",
  A1: "Full Closure",
  A2: "Partial Closure",
  A3: "Agent-Assisted",
};

function LegendStrip({ hasAssessed }: { hasAssessed: boolean }) {
  return (
    <div className="px-6 py-2 border-b border-border/20 flex items-center gap-4 flex-wrap" style={{ backgroundColor: "rgba(30,41,59,0.6)" }}>
      {/* Tags */}
      <span className="text-[8px] uppercase tracking-[0.1em] text-muted/50 font-semibold">Type</span>
      {(Object.keys(TAG_CFG) as BRTag[]).map((t) => (
        <span key={t} className="flex items-center gap-1">
          <span className="text-[9px] font-mono font-semibold" style={{ color: TAG_CFG[t].color }}>{t}</span>
          <span className="text-[9px] text-muted/70">{TAG_LABELS[t]}</span>
        </span>
      ))}

      <div className="w-px h-3 bg-border/20" />

      {/* Segments */}
      <span className="text-[8px] uppercase tracking-[0.1em] text-muted/50 font-semibold">Segment</span>
      {(Object.keys(SEGMENT_CFG) as BRSegment[]).map((s) => (
        <span key={s} className="flex items-center gap-1">
          <span className="text-[9px] font-mono font-semibold" style={{ color: SEGMENT_CFG[s].color }}>{s}</span>
          <span className="text-[9px] text-muted/70">{SEGMENT_LABELS[s]}</span>
        </span>
      ))}

      {hasAssessed && (
        <>
          <div className="w-px h-3 bg-border/20" />

          {/* Fit */}
          <span className="text-[8px] uppercase tracking-[0.1em] text-muted/50 font-semibold">ERP Fit</span>
          {(["F1", "F2", "F3", "F4", "F5"] as FitRating[]).map((r) => (
            <span key={r} className="flex items-center gap-1">
              <span className="text-[9px] font-mono font-semibold" style={{ color: FIT_CFG[r].color }}>{r}</span>
              <span className="text-[9px] text-muted/70">{FIT_LABELS[r]}</span>
            </span>
          ))}

          <div className="w-px h-3 bg-border/20" />

          {/* Agentic */}
          <span className="text-[8px] uppercase tracking-[0.1em] text-muted/50 font-semibold">Agentic</span>
          {(["A0", "A1", "A2", "A3"] as AgenticRating[]).map((r) => (
            <span key={r} className="flex items-center gap-1">
              <span className="text-[9px] font-mono font-semibold" style={{ color: AGENTIC_CFG[r].color }}>{r}</span>
              <span className="text-[9px] text-muted/70">{AGENTIC_LABELS[r]}</span>
            </span>
          ))}
        </>
      )}
    </div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────

function FilterBar({
  filters,
  onFiltersChange,
  hasAssessed,
}: {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  hasAssessed: boolean;
}) {
  const [legendVisible, setLegendVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLegend = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setLegendVisible(true);
  }, []);

  const scheduleLegendHide = useCallback(() => {
    hideTimer.current = setTimeout(() => setLegendVisible(false), 300);
  }, []);

  const toggleSet = <T extends string>(set: Set<T>, val: T): Set<T> => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    return next;
  };

  return (
    <div
      onMouseEnter={showLegend}
      onMouseLeave={scheduleLegendHide}
    >
      <div className="px-6 py-2.5 border-b border-border/40 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <input
          type="text"
          placeholder="Search requirements…"
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="text-[11px] bg-surface border border-border/40 rounded px-2.5 py-1 text-foreground placeholder:text-muted/40 w-48 focus:outline-none focus:border-accent/50"
        />

        <div className="w-px h-4 bg-border/30" />

        {/* Tag chips */}
        {(Object.keys(TAG_CFG) as BRTag[]).map((t) => {
          const active = filters.tags.has(t);
          const cfg = TAG_CFG[t];
          return (
            <button
              key={t}
              onClick={() => onFiltersChange({ ...filters, tags: toggleSet(filters.tags, t) })}
              className="text-[9px] px-2 py-0.5 rounded border transition-colors"
              style={
                active
                  ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color + "50" }
                  : { borderColor: "rgba(100,116,139,0.6)", color: "#94A3B8" }
              }
            >
              {t}
            </button>
          );
        })}

        <div className="w-px h-4 bg-border/30" />

        {/* Segment chips */}
        {(Object.keys(SEGMENT_CFG) as BRSegment[]).map((s) => {
          const active = filters.segments.has(s);
          const cfg = SEGMENT_CFG[s];
          return (
            <button
              key={s}
              onClick={() => onFiltersChange({ ...filters, segments: toggleSet(filters.segments, s) })}
              className="text-[9px] px-2 py-0.5 rounded border transition-colors"
              style={
                active
                  ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color + "50" }
                  : { borderColor: "rgba(100,116,139,0.6)", color: "#94A3B8" }
              }
            >
              {s}
            </button>
          );
        })}

        {/* Fit/Gap filters — only when assessed data exists */}
        {hasAssessed && (
          <>
            <div className="w-px h-4 bg-border/30" />

            {(["F1", "F2", "F3", "F4", "F5"] as FitRating[]).map((r) => {
              const active = filters.fitRatings.has(r);
              const cfg = FIT_CFG[r];
              return (
                <button
                  key={r}
                  onClick={() => onFiltersChange({ ...filters, fitRatings: toggleSet(filters.fitRatings, r) })}
                  className="text-[9px] px-2 py-0.5 rounded border transition-colors"
                  style={
                    active
                      ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color + "50" }
                      : { borderColor: "rgba(100,116,139,0.6)", color: "#94A3B8" }
                  }
                >
                  {r}
                </button>
              );
            })}

            <div className="w-px h-4 bg-border/30" />

            {(["A0", "A1", "A2", "A3"] as AgenticRating[]).map((r) => {
              const active = filters.agenticRatings.has(r);
              const cfg = AGENTIC_CFG[r];
              return (
                <button
                  key={r}
                  onClick={() => onFiltersChange({ ...filters, agenticRatings: toggleSet(filters.agenticRatings, r) })}
                  className="text-[9px] px-2 py-0.5 rounded border transition-colors"
                  style={
                    active
                      ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color + "50" }
                      : { borderColor: "rgba(100,116,139,0.6)", color: "#94A3B8" }
                  }
                >
                  {r}
                </button>
              );
            })}

            <div className="w-px h-4 bg-border/30" />

            <button
              onClick={() => onFiltersChange({ ...filters, assessedOnly: !filters.assessedOnly })}
              className="text-[9px] px-2 py-0.5 rounded border transition-colors"
              style={
                filters.assessedOnly
                  ? { backgroundColor: "rgba(59,130,246,0.15)", color: "#3B82F6", borderColor: "rgba(59,130,246,0.5)" }
                  : { borderColor: "rgba(100,116,139,0.6)", color: "#94A3B8" }
              }
            >
              Assessed only
            </button>
          </>
        )}

        {/* Framework legend toggle — right-aligned */}
        <div className="ml-auto">
          <FrameworkLegend />
        </div>
      </div>

      {/* Legend strip — slides in on hover */}
      <AnimatePresence>
        {legendVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <LegendStrip hasAssessed={hasAssessed} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export function BusinessRequirementsTable({ data, captureBarRef }: { data: BusinessRequirementsData; captureBarRef?: RefObject<CaptureBarHandle | null> }) {
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [collapsedPAs, setCollapsedPAs] = useState<Set<string>>(new Set());
  const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    tags: new Set(),
    segments: new Set(),
    fitRatings: new Set(),
    agenticRatings: new Set(),
    assessedOnly: false,
  });

  // Workshop state
  const workshopMode = useWorkshopStore((s) => s.workshopMode);
  const workshopSession = useWorkshopStore((s) => s.workshopSession);
  const capturedRequirements = useWorkshopStore((s) => s.capturedRequirements);
  const newRequirementIds = useWorkshopStore((s) => s.newRequirementIds);
  const selectedRequirementId = useWorkshopStore((s) => s.selectedRequirementId);
  const selectRequirement = useWorkshopStore((s) => s.selectRequirement);
  const updateRequirement = useWorkshopStore((s) => s.updateRequirement);
  const addRequirement = useWorkshopStore((s) => s.addRequirement);

  // Merge base requirements with captured changes + new requirements
  const baseRequirements = useMemo(() => {
    let reqs: BusinessRequirement[];

    if (workshopMode && workshopSession) {
      reqs = data.requirements.filter((r) => r.pa_id === workshopSession.processAreaId);
    } else {
      reqs = data.requirements;
    }

    if (!workshopMode) return reqs;

    // Overlay captured modifications on existing requirements
    const merged = reqs.map((r) => {
      const captured = capturedRequirements.get(r.id);
      if (captured) return captured.current;
      return r;
    });

    // Append new requirements
    for (const id of newRequirementIds) {
      const captured = capturedRequirements.get(id);
      if (captured) merged.push(captured.current);
    }

    return merged;
  }, [data.requirements, workshopMode, workshopSession, capturedRequirements, newRequirementIds]);

  const hasAssessed = useMemo(
    () => baseRequirements.some((r) => r.fit_gap),
    [baseRequirements]
  );

  // Capture count for summary bar
  const captureCount = useMemo(() => {
    if (!workshopMode) return 0;
    const modifiedCount = [...capturedRequirements.values()].filter((r) => r.dirty).length;
    return modifiedCount;
  }, [workshopMode, capturedRequirements]);

  // Filter requirements
  const filtered = useMemo(() => {
    return baseRequirements.filter((r) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !r.text.toLowerCase().includes(q) &&
          !r.id.toLowerCase().includes(q) &&
          !r.pa_id.toLowerCase().includes(q)
        )
          return false;
      }
      if (filters.tags.size > 0 && !filters.tags.has(r.tag)) return false;
      if (filters.segments.size > 0 && !filters.segments.has(r.segment)) return false;
      if (filters.assessedOnly && !r.fit_gap) return false;
      if (filters.fitRatings.size > 0) {
        if (!r.fit_gap) return false;
        const primary = r.fit_gap.erp_assessments.find((a) => a.platform === "SAP with FS-RI");
        if (!primary || !filters.fitRatings.has(primary.rating)) return false;
      }
      if (filters.agenticRatings.size > 0) {
        if (!r.fit_gap?.agentic_rating) return false;
        if (!filters.agenticRatings.has(r.fit_gap.agentic_rating)) return false;
      }
      return true;
    });
  }, [baseRequirements, filters]);

  // Group by PA
  const groups = useMemo(() => {
    const map = new Map<string, BusinessRequirement[]>();
    for (const r of filtered) {
      if (!map.has(r.pa_id)) map.set(r.pa_id, []);
      map.get(r.pa_id)!.push(r);
    }
    return map;
  }, [filtered]);

  const togglePA = (paId: string) => {
    setCollapsedPAs((prev) => {
      const next = new Set(prev);
      if (next.has(paId)) next.delete(paId);
      else next.add(paId);
      return next;
    });
  };

  const handleEditCommit = useCallback((id: string, updates: Partial<BusinessRequirement>) => {
    // Find the original req to snapshot if first edit
    const existing = capturedRequirements.get(id);
    if (existing) {
      updateRequirement(id, updates);
    } else {
      // First edit — find original from data
      const original = data.requirements.find((r) => r.id === id);
      if (original) {
        updateRequirement(id, { ...original, ...updates });
      }
    }
    setEditingField(null);
  }, [capturedRequirements, updateRequirement, data.requirements]);

  const handleInlineEdit = useCallback((id: string, field: string) => {
    // Cycle fields are handled immediately — no overlay needed
    if (field === "tag" || field === "segment" || field === "status") {
      const req = baseRequirements.find((r) => r.id === id);
      if (!req) return;

      let updates: Partial<BusinessRequirement>;
      if (field === "tag") {
        const idx = TAG_VALUES.indexOf(req.tag);
        updates = { tag: TAG_VALUES[(idx + 1) % TAG_VALUES.length] };
      } else if (field === "segment") {
        const idx = SEGMENT_VALUES.indexOf(req.segment);
        updates = { segment: SEGMENT_VALUES[(idx + 1) % SEGMENT_VALUES.length] };
      } else {
        const idx = STATUS_VALUES.indexOf(req.status);
        updates = { status: STATUS_VALUES[(idx + 1) % STATUS_VALUES.length] };
      }

      handleEditCommit(id, updates);
      return;
    }

    // Text field → open overlay
    setEditingField({ id, field });
  }, [baseRequirements, handleEditCommit]);

  const newIdSet = useMemo(() => new Set(newRequirementIds), [newRequirementIds]);

  // Y/Esc keyboard handling for insight panel (Task 1)
  const selectedReq = useMemo(
    () => (selectedRequirementId ? baseRequirements.find((r) => r.id === selectedRequirementId) : null),
    [selectedRequirementId, baseRequirements]
  );

  useEffect(() => {
    if (!workshopMode || !selectedReq?.fit_gap) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        const fg = selectedReq.fit_gap;
        if (!fg) return;
        const text = fg.agentic_bridge ?? fg.gap_remediation;
        if (text) {
          addRequirement(text);
          selectRequirement(null); // deselect to prevent duplicate captures
        }
      }

      if (e.key === "Escape") {
        selectRequirement(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [workshopMode, selectedReq, addRequirement, selectRequirement]);

  // Badge flip animation for captured count
  const prevCaptureCount = useRef(captureCount);
  const [captureFlip, setCaptureFlip] = useState(false);
  useEffect(() => {
    if (captureCount > prevCaptureCount.current) {
      setCaptureFlip(true);
      const t = setTimeout(() => setCaptureFlip(false), 250);
      return () => clearTimeout(t);
    }
    prevCaptureCount.current = captureCount;
  }, [captureCount]);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <SummaryBar requirements={filtered} hasAssessed={hasAssessed} captureCount={captureCount} captureFlip={captureFlip} />
      <FilterBar filters={filters} onFiltersChange={setFilters} hasAssessed={hasAssessed} />

      {/* Workshop capture bar */}
      {workshopMode && (
        <div className="shrink-0">
          <CaptureBar ref={captureBarRef} context="requirements" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl space-y-5">
          {groups.size === 0 && (
            <div className="flex items-center justify-center py-16 text-sm text-muted">
              No requirements match the current filters.
            </div>
          )}

          {[...groups].map(([paId, reqs]) => {
            const collapsed = collapsedPAs.has(paId);
            const assessedCount = reqs.filter((r) => r.fit_gap).length;

            return (
              <div key={paId}>
                {/* PA header */}
                <button
                  onClick={() => togglePA(paId)}
                  className="flex items-center gap-2.5 w-full text-left px-3 mb-1.5 group"
                >
                  <span className="text-[9px] font-mono text-muted/80">{paId}</span>
                  <h3 className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
                    {PA_NAMES[paId] ?? paId}
                  </h3>
                  <span className="text-[9px] font-mono text-muted/80 ml-1">
                    {reqs.length}
                  </span>
                  {assessedCount > 0 && (
                    <Badge label={`${assessedCount} assessed`} color="#3B82F6" bg="rgba(59,130,246,0.1)" />
                  )}
                  <span className="text-[10px] text-muted/70 ml-auto group-hover:text-muted transition-colors">
                    {collapsed ? "▾" : "▲"}
                  </span>
                </button>

                {/* Requirements */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      key="reqs"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5">
                        {reqs.map((r) => {
                          const isNew = newIdSet.has(r.id);
                          const isModified = !isNew && capturedRequirements.has(r.id);
                          const isSelected = workshopMode && selectedRequirementId === r.id;

                          const row = (
                            <RequirementRow
                              req={r}
                              expanded={expandedReq === r.id}
                              onToggle={() =>
                                setExpandedReq((prev) => (prev === r.id ? null : r.id))
                              }
                              workshopMode={workshopMode}
                              isSelected={isSelected}
                              isNew={isNew}
                              isModified={isModified}
                              onSelect={() => selectRequirement(r.id)}
                              onInlineEdit={(field) => handleInlineEdit(r.id, field)}
                            />
                          );

                          return isNew ? (
                            <div key={r.id}>
                              <motion.div
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.25 }}
                              >
                                {row}
                              </motion.div>
                              <AnimatePresence>
                                {isSelected && r.fit_gap && (
                                  <AgentInsightPanel req={r} onAddRequirement={addRequirement} />
                                )}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <div key={r.id}>
                              {row}
                              <AnimatePresence>
                                {isSelected && r.fit_gap && (
                                  <AgentInsightPanel req={r} onAddRequirement={addRequirement} />
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline edit overlay */}
      {editingField && (
        <InlineEditOverlay
          req={filtered.find((r) => r.id === editingField.id) ?? baseRequirements.find((r) => r.id === editingField.id)!}
          field={editingField.field}
          onCommit={(updates) => handleEditCommit(editingField.id, updates)}
          onCancel={() => setEditingField(null)}
        />
      )}
    </div>
  );
}
