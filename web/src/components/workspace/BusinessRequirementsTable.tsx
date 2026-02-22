"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type {
  BusinessRequirementsData,
  BusinessRequirement,
  BRTag,
  BRSegment,
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

function Badge({ label, color, bg, border }: { label: string; color: string; bg: string; border?: boolean }) {
  return (
    <span
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
}: {
  req: BusinessRequirement;
  expanded: boolean;
  onToggle: () => void;
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

  return (
    <div>
      <div
        onClick={onToggle}
        className={[
          "group flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
          expanded
            ? "bg-surface border-border/60"
            : "border-transparent hover:bg-surface/50 hover:border-border/30",
        ].join(" ")}
      >
        {/* ID */}
        <span className="flex-shrink-0 text-[9px] font-mono text-muted w-[72px]">
          {req.id}
        </span>

        {/* Tag */}
        <Badge label={tc.label} color={tc.color} bg={tc.bg} />

        {/* Segment */}
        <Badge label={sc.label} color={sc.color} bg={sc.bg} />

        {/* Text */}
        <span className="flex-1 text-[11px] text-foreground/90 leading-snug truncate">
          {req.text}
        </span>

        {/* Fit + Agentic badges (assessed only) */}
        {fc && (
          <Badge label={primaryAssessment!.rating} color={fc.color} bg={fc.bg} border />
        )}
        {ac && req.fit_gap?.agentic_rating && (
          <Badge label={req.fit_gap.agentic_rating} color={ac.color} bg={ac.bg} border />
        )}

        {/* Status */}
        <Badge label={req.status} color={stc.color} bg={stc.bg} />

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

// ── Summary Bar ───────────────────────────────────────────────────────────

function SummaryBar({ requirements, hasAssessed }: { requirements: BusinessRequirement[]; hasAssessed: boolean }) {
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

function FilterBar({
  filters,
  onFiltersChange,
  hasAssessed,
}: {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  hasAssessed: boolean;
}) {
  const toggleSet = <T extends string>(set: Set<T>, val: T): Set<T> => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    return next;
  };

  return (
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
                : { borderColor: "rgba(71,85,105,0.2)", color: "rgba(148,163,184,0.3)" }
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
                : { borderColor: "rgba(71,85,105,0.2)", color: "rgba(148,163,184,0.3)" }
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
                    : { borderColor: "rgba(71,85,105,0.2)", color: "rgba(148,163,184,0.3)" }
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
                    : { borderColor: "rgba(71,85,105,0.2)", color: "rgba(148,163,184,0.3)" }
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
                : { borderColor: "rgba(71,85,105,0.2)", color: "rgba(148,163,184,0.3)" }
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
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export function BusinessRequirementsTable({ data }: { data: BusinessRequirementsData }) {
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [collapsedPAs, setCollapsedPAs] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    tags: new Set(),
    segments: new Set(),
    fitRatings: new Set(),
    agenticRatings: new Set(),
    assessedOnly: false,
  });

  // Workshop filter
  const workshopMode = useWorkshopStore((s) => s.workshopMode);
  const workshopSession = useWorkshopStore((s) => s.workshopSession);

  const baseRequirements = useMemo(() => {
    if (workshopMode && workshopSession) {
      return data.requirements.filter((r) => r.pa_id === workshopSession.processAreaId);
    }
    return data.requirements;
  }, [data.requirements, workshopMode, workshopSession]);

  const hasAssessed = useMemo(
    () => baseRequirements.some((r) => r.fit_gap),
    [baseRequirements]
  );

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

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <SummaryBar requirements={filtered} hasAssessed={hasAssessed} />
      <FilterBar filters={filters} onFiltersChange={setFilters} hasAssessed={hasAssessed} />

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
                        {reqs.map((r) => (
                          <RequirementRow
                            key={r.id}
                            req={r}
                            expanded={expandedReq === r.id}
                            onToggle={() =>
                              setExpandedReq((prev) => (prev === r.id ? null : r.id))
                            }
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
