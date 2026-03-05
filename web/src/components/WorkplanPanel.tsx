"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Engagement,
  type Workstream,
  type DeliverableStatus,
  type ConsultantPresence,
} from "@/lib/mock-data";
import { FeatureGuide } from "@/components/guides/FeatureGuide";
import { GUIDE_REGISTRY, type FeatureGuideData } from "@/lib/guide-content";

// ── Presence helpers ──────────────────────────────────────────────────────

const CONSULTANT_INITIALS: Record<string, string> = {
  "mock-001": "SK",
  "mock-002": "TR",
  "mock-003": "PM",
};

function PresencePip({ p }: { p: ConsultantPresence }) {
  return (
    <div
      title={CONSULTANT_INITIALS[p.consultant_id] ?? p.consultant_id}
      className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-medium shrink-0 ${
        p.is_active
          ? "bg-success/20 text-success ring-1 ring-success/30"
          : "bg-surface-alt text-muted"
      }`}
    >
      {CONSULTANT_INITIALS[p.consultant_id] ?? "?"}
    </div>
  );
}

// ── Status helpers ─────────────────────────────────────────────────────────

const STATUS_DOT: Record<DeliverableStatus, string> = {
  not_started: "bg-muted",
  in_progress:  "bg-warning",
  in_review:    "bg-accent",
  complete:     "bg-success",
  blocked:      "bg-error",
};

const STATUS_LABEL: Record<DeliverableStatus, string> = {
  not_started: "Not Started",
  in_progress:  "In Progress",
  in_review:    "In Review",
  complete:     "Complete",
  blocked:      "Blocked",
};

const STATUS_TEXT: Record<DeliverableStatus, string> = {
  not_started: "text-muted",
  in_progress:  "text-warning",
  in_review:    "text-accent",
  complete:     "text-success",
  blocked:      "text-error",
};

// ── Agent column config ──────────────────────────────────────────────────

type AgentKey = "consulting_agent" | "functional_consultant" | "gl_design_coach";

interface AgentConfig {
  key: AgentKey;
  displayName: string;
  colorCls: string;
  iconCls: string;
  bgCls: string;
}

const AGENT_COLUMNS: AgentConfig[] = [
  { key: "consulting_agent",       displayName: "Engagement Lead",  colorCls: "border-muted/30",       iconCls: "bg-slate-400",  bgCls: "bg-surface-alt/20" },
  { key: "functional_consultant",  displayName: "Business Analyst", colorCls: "border-purple-400/30",  iconCls: "bg-purple-400", bgCls: "bg-purple-500/[0.03]" },
  { key: "gl_design_coach",        displayName: "GL Design Coach",  colorCls: "border-accent/30",      iconCls: "bg-accent",     bgCls: "bg-accent/[0.03]" },
];

function groupWorkstreamsByAgent(workstreams: Workstream[]): Map<AgentKey, Workstream[]> {
  const grouped = new Map<AgentKey, Workstream[]>();
  for (const agent of AGENT_COLUMNS) grouped.set(agent.key, []);
  for (const ws of workstreams) {
    const key = (ws.owner_agent ?? "consulting_agent") as AgentKey;
    grouped.get(key)?.push(ws);
  }
  return grouped;
}

// ── Agent column header ──────────────────────────────────────────────────

function AgentColumnHeader({
  agent,
  workstreams,
  outOfScope,
  onNameClick,
}: {
  agent: AgentConfig;
  workstreams: Workstream[];
  outOfScope: Set<string>;
  onNameClick?: () => void;
}) {
  const allDeliverables = workstreams.flatMap((ws) => ws.deliverables);
  const inScope = allDeliverables.filter((d) => !outOfScope.has(d.deliverable_id));
  const complete = inScope.filter((d) => d.status === "complete").length;
  const total = inScope.length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0;
  const needsReview = inScope.filter((d) => d.needs_input && d.status !== "blocked").length;

  return (
    <div className="mb-3 px-1">
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`h-2 w-2 rounded-full shrink-0 ${agent.iconCls}`} />
        {onNameClick ? (
          <button
            onClick={onNameClick}
            className="text-sm font-semibold text-foreground hover:text-info transition-colors text-left"
            title="Open training guide"
          >
            {agent.displayName}
          </button>
        ) : (
          <span className="text-sm font-semibold text-foreground">{agent.displayName}</span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-muted font-mono">
          {complete}/{total} complete
        </span>
        {needsReview > 0 && (
          <span className="text-[10px] text-warning font-mono">
            · {needsReview} review
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-surface-alt rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted shrink-0">{pct}%</span>
      </div>
    </div>
  );
}

// ── Workstream row ─────────────────────────────────────────────────────────

interface WorkstreamRowProps {
  ws: Workstream;
  outOfScope: Set<string>;
  onToggleDeliverable: (id: string) => void;
  onToggleWorkstream: (wsId: string, allOos: boolean) => void;
  engagementId: string;
  presenceByDeliverable: Map<string, ConsultantPresence[]>;
}

function WorkstreamRow({ ws, outOfScope, onToggleDeliverable, onToggleWorkstream, engagementId, presenceByDeliverable }: WorkstreamRowProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);

  const inScopeDeliverables = ws.deliverables.filter((d) => !outOfScope.has(d.deliverable_id));
  const allOos = ws.deliverables.length > 0 && inScopeDeliverables.length === 0;

  const complete   = inScopeDeliverables.filter((d) => d.status === "complete").length;
  const inScopeTotal = inScopeDeliverables.length;
  const blocked    = inScopeDeliverables.filter((d) => d.status === "blocked").length;
  const needsInput = inScopeDeliverables.filter((d) => d.needs_input && d.status !== "blocked").length;
  const inProgress = inScopeDeliverables.filter(
    (d) => d.status === "in_progress" || d.status === "in_review"
  ).length;

  const progressPct = inScopeTotal > 0 ? Math.round((complete / inScopeTotal) * 100) : 0;

  // Collect presence for this workstream (any deliverable within it)
  const wsPresence: ConsultantPresence[] = [];
  const seenConsultants = new Set<string>();
  for (const d of ws.deliverables) {
    const dp = presenceByDeliverable.get(d.deliverable_id);
    if (dp) {
      for (const p of dp) {
        if (!seenConsultants.has(p.consultant_id)) {
          seenConsultants.add(p.consultant_id);
          wsPresence.push(p);
        }
      }
    }
  }

  return (
    <div className={`border rounded-lg overflow-hidden transition-opacity duration-200 ${
      allOos ? "border-border/40 opacity-50" : "border-border"
    }`}>
      {/* Header */}
      <div
        className="relative"
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-surface hover:bg-surface-alt transition-colors text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <motion.span
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted shrink-0 text-xs"
            >
              ›
            </motion.span>

            <span className={`text-xs font-medium truncate transition-colors ${
              allOos ? "text-muted line-through" : "text-foreground"
            }`}>
              {ws.name}
            </span>

            {/* Presence pips */}
            {!allOos && wsPresence.length > 0 && (
              <div className="flex items-center gap-0.5 shrink-0">
                {wsPresence.map((p) => (
                  <PresencePip key={p.consultant_id} p={p} />
                ))}
              </div>
            )}

            {/* Status badges */}
            {allOos && (
              <span className="shrink-0 text-[10px] font-medium text-muted bg-surface-alt px-1.5 py-0.5 rounded">
                Out of Scope
              </span>
            )}
            {!allOos && blocked > 0 && (
              <span className="shrink-0 text-[10px] font-medium text-error bg-error/10 px-1.5 py-0.5 rounded">
                {blocked} blocked
              </span>
            )}
            {!allOos && needsInput > 0 && blocked === 0 && (
              <span className="shrink-0 text-[10px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                {needsInput} review
              </span>
            )}
            {!allOos && inProgress > 0 && blocked === 0 && needsInput === 0 && (
              <span className="shrink-0 text-[10px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                {inProgress} active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 pr-16">
            {!allOos && (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-12 h-1 bg-surface-alt rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-muted font-mono tabular-nums whitespace-nowrap">
                  {complete}/{inScopeTotal}
                </span>
              </>
            )}
          </div>
        </button>

        {/* Workstream scope toggle — on header hover */}
        <AnimatePresence>
          {headerHovered && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWorkstream(ws.workstream_id, allOos);
              }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-[10px] font-medium transition-colors whitespace-nowrap ${
                allOos
                  ? "bg-accent/15 text-accent hover:bg-accent/25"
                  : "bg-surface-alt text-muted hover:bg-error/15 hover:text-error"
              }`}
            >
              {allOos ? "Restore all" : "Mark OOS"}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Deliverables */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="divide-y divide-border/50 bg-background/40">
              {ws.deliverables.map((d) => {
                const oos = outOfScope.has(d.deliverable_id);
                const isAttention = !oos && (d.status === "blocked" || d.needs_input);

                return (
                  <li
                    key={d.deliverable_id}
                    className={`group flex items-start gap-3 px-4 py-2.5 transition-opacity duration-150 ${
                      oos ? "opacity-40" : ""
                    } ${
                      isAttention && d.status === "blocked"
                        ? "border-l-2 border-l-error/50 pl-[14px]"
                        : isAttention
                        ? "border-l-2 border-l-warning/50 pl-[14px]"
                        : ""
                    }`}
                  >
                    {/* Status dot */}
                    {oos ? (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 flex items-center justify-center text-muted text-[8px]">—</span>
                    ) : (
                      <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[d.status]}`} />
                    )}

                    {/* Name + agent summary */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs leading-snug ${
                        oos ? "text-muted line-through" : "text-foreground/85"
                      }`}>
                        {d.name}
                      </span>
                      {!oos && d.agent_summary && (
                        <p className="text-[10px] text-muted mt-0.5 leading-snug">
                          {d.agent_summary}
                        </p>
                      )}
                    </div>

                    {/* Presence pips on deliverable */}
                    {!oos && presenceByDeliverable.has(d.deliverable_id) && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        {presenceByDeliverable.get(d.deliverable_id)!.map((p) => (
                          <PresencePip key={p.consultant_id} p={p} />
                        ))}
                      </div>
                    )}

                    {/* Right: status + CTA */}
                    {!oos && (
                      <div className="shrink-0 flex flex-col items-end gap-0.5 ml-2">
                        <span className={`text-[10px] font-medium font-mono ${STATUS_TEXT[d.status]}`}>
                          {STATUS_LABEL[d.status]}
                        </span>
                        {d.status === "blocked" && (
                          <button
                            onClick={() => router.push(`/${engagementId}/deliverables/${d.deliverable_id}`)}
                            className="text-[10px] font-medium text-error hover:opacity-70 transition-opacity whitespace-nowrap"
                          >
                            Resolve →
                          </button>
                        )}
                        {d.needs_input && d.status !== "blocked" && (
                          <button
                            onClick={() => router.push(`/${engagementId}/deliverables/${d.deliverable_id}`)}
                            className="text-[10px] font-medium text-warning hover:opacity-70 transition-opacity whitespace-nowrap"
                          >
                            Review →
                          </button>
                        )}
                        {d.status === "complete" && (
                          <button
                            onClick={() => router.push(`/${engagementId}/deliverables/${d.deliverable_id}`)}
                            className="text-[10px] font-medium text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                          >
                            View →
                          </button>
                        )}
                        {d.status === "in_progress" && !d.needs_input && (
                          <button
                            onClick={() => router.push(`/${engagementId}/deliverables/${d.deliverable_id}`)}
                            className="text-[10px] font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                          >
                            Open →
                          </button>
                        )}
                        {d.status === "not_started" && (
                          <button
                            onClick={() => router.push(`/${engagementId}/deliverables/${d.deliverable_id}`)}
                            className="text-[10px] font-medium text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                          >
                            Start →
                          </button>
                        )}
                      </div>
                    )}

                    {/* Scope toggle — on row hover */}
                    {oos ? (
                      <button
                        onClick={() => onToggleDeliverable(d.deliverable_id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded text-[11px] font-medium text-accent hover:bg-accent/20 mt-0.5"
                      >
                        +
                      </button>
                    ) : (
                      <button
                        onClick={() => onToggleDeliverable(d.deliverable_id)}
                        title="Remove from scope"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded text-[11px] font-medium text-muted hover:bg-error/15 hover:text-error mt-0.5"
                      >
                        −
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── WorkplanPanel ──────────────────────────────────────────────────────────

interface WorkplanPanelProps {
  engagement: Engagement;
}

export function WorkplanPanel({ engagement }: WorkplanPanelProps) {
  const workplan = engagement.workplan;

  const [activeGuide, setActiveGuide] = useState<FeatureGuideData | null>(null);

  const [outOfScope, setOutOfScope] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    workplan?.workstreams.forEach((ws) =>
      ws.deliverables.forEach((d) => {
        if (d.in_scope === false) initial.add(d.deliverable_id);
      })
    );
    return initial;
  });

  const toggleDeliverable = (id: string) => {
    setOutOfScope((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleWorkstream = (wsId: string, allOos: boolean) => {
    const ws = workplan?.workstreams.find((w) => w.workstream_id === wsId);
    if (!ws) return;
    setOutOfScope((prev) => {
      const next = new Set(prev);
      if (allOos) ws.deliverables.forEach((d) => next.delete(d.deliverable_id));
      else ws.deliverables.forEach((d) => next.add(d.deliverable_id));
      return next;
    });
  };

  if (!workplan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mt-4 rounded-lg bg-surface border border-border px-6 py-8 text-center text-sm text-muted"
      >
        No workplan has been created for this engagement yet.
      </motion.div>
    );
  }

  // Overall progress (OOS excluded)
  const allDeliverables  = workplan.workstreams.flatMap((ws) => ws.deliverables);
  const inScopeAll       = allDeliverables.filter((d) => !outOfScope.has(d.deliverable_id));
  const totalInScope     = inScopeAll.length;
  const totalComplete    = inScopeAll.filter((d) => d.status === "complete").length;
  const oosCount         = outOfScope.size;
  const overallPct       = totalInScope > 0 ? Math.round((totalComplete / totalInScope) * 100) : 0;

  // Build presence map: deliverable_id → ConsultantPresence[]
  const presenceByDeliverable = new Map<string, ConsultantPresence[]>();
  for (const p of engagement.presence ?? []) {
    if (p.deliverable_id) {
      const existing = presenceByDeliverable.get(p.deliverable_id) ?? [];
      existing.push(p);
      presenceByDeliverable.set(p.deliverable_id, existing);
    }
  }

  // Group workstreams by agent
  const grouped = groupWorkstreamsByAgent(workplan.workstreams);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mt-4"
    >
      {/* Panel header — full width */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-px h-4 bg-accent/60" />
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
            Workplan · {engagement.client_name}
          </h3>
          <span className="text-[10px] font-mono text-muted">
            {totalComplete}/{totalInScope} complete
          </span>
          {oosCount > 0 && (
            <span className="text-[10px] font-mono text-muted/50">
              · {oosCount} out of scope
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-24 h-1 bg-surface-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted">
            {overallPct}%
          </span>
        </div>
      </div>

      {/* Three-column agent grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        {AGENT_COLUMNS.map((agent) => {
          const agentWorkstreams = grouped.get(agent.key) ?? [];
          return (
            <div
              key={agent.key}
              className={`rounded-lg border ${agent.colorCls} ${agent.bgCls} p-3`}
            >
              <AgentColumnHeader
                agent={agent}
                workstreams={agentWorkstreams}
                outOfScope={outOfScope}
                onNameClick={
                  GUIDE_REGISTRY[agent.key]
                    ? () => setActiveGuide(GUIDE_REGISTRY[agent.key])
                    : undefined
                }
              />
              <div className="flex flex-col gap-2">
                {agentWorkstreams.map((ws) => (
                  <WorkstreamRow
                    key={ws.workstream_id}
                    ws={ws}
                    outOfScope={outOfScope}
                    onToggleDeliverable={toggleDeliverable}
                    onToggleWorkstream={toggleWorkstream}
                    engagementId={engagement.engagement_id}
                    presenceByDeliverable={presenceByDeliverable}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Training guide overlay */}
      {activeGuide && (
        <FeatureGuide
          guide={activeGuide}
          onClose={() => setActiveGuide(null)}
        />
      )}
    </motion.div>
  );
}
