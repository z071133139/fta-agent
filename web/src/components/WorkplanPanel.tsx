"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Engagement,
  type Workstream,
  type Deliverable,
  type DeliverableStatus,
} from "@/lib/mock-data";

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

// ── Agent chip helpers ─────────────────────────────────────────────────────

const AGENT_CHIP: Record<string, { label: string; cls: string }> = {
  consulting_agent:     { label: "Consulting Agent",    cls: "bg-surface-alt text-muted" },
  gl_design_coach:      { label: "GL Design Coach",     cls: "bg-accent/10 text-accent" },
  functional_consultant:{ label: "Functional Consultant", cls: "bg-purple/10 text-purple" },
};

// ── Needs Your Input banner ────────────────────────────────────────────────

interface AttentionItem extends Deliverable {
  workstream_name: string;
}

function NeedsInputBanner({ items, engagementId }: { items: AttentionItem[]; engagementId: string }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 3);
  const overflow = items.length - 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="mb-4 rounded-lg border border-warning/25 bg-warning/5 overflow-hidden"
    >
      {/* Banner header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-warning/15">
        <div className="h-1.5 w-1.5 rounded-full bg-warning" />
        <span className="text-[10px] uppercase tracking-[0.12em] font-medium text-warning">
          Needs Your Input
        </span>
        <span className="text-[10px] font-mono text-warning/50">{items.length}</span>
      </div>

      {/* Items */}
      <ul className="divide-y divide-warning/10">
        {visible.map((item) => (
          <li key={item.deliverable_id} className="flex items-start gap-3 px-4 py-2.5">
            <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
              item.status === "blocked" ? "bg-error" : "bg-warning"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground/90 leading-snug">{item.name}</p>
              {item.agent_summary && (
                <p className="text-[10px] text-muted mt-0.5 leading-snug">{item.agent_summary}</p>
              )}
              <p className="text-[10px] text-muted/50 mt-0.5">{item.workstream_name}</p>
            </div>
            <button
              onClick={() => router.push(`/${engagementId}/deliverables/${item.deliverable_id}`)}
              className={`shrink-0 text-[10px] font-medium whitespace-nowrap mt-0.5 transition-opacity hover:opacity-70 ${
                item.status === "blocked" ? "text-error" : "text-warning"
              }`}
            >
              {item.status === "blocked" ? "Resolve →" : "Review →"}
            </button>
          </li>
        ))}
      </ul>

      {/* Show more / less */}
      {overflow > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full px-4 py-2 text-[10px] text-muted hover:text-foreground transition-colors text-left border-t border-warning/10"
        >
          {expanded ? "Show less" : `Show ${overflow} more`}
        </button>
      )}
    </motion.div>
  );
}

// ── Workstream row ─────────────────────────────────────────────────────────

interface WorkstreamRowProps {
  ws: Workstream;
  outOfScope: Set<string>;
  onToggleDeliverable: (id: string) => void;
  onToggleWorkstream: (wsId: string, allOos: boolean) => void;
  engagementId: string;
}

function WorkstreamRow({ ws, outOfScope, onToggleDeliverable, onToggleWorkstream, engagementId }: WorkstreamRowProps) {
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
  const agentChip = ws.owner_agent ? AGENT_CHIP[ws.owner_agent] : null;

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
          className="w-full flex items-center justify-between gap-4 px-4 py-3 bg-surface hover:bg-surface-alt transition-colors text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <motion.span
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted shrink-0 text-xs"
            >
              ›
            </motion.span>

            <span className={`text-sm font-medium truncate transition-colors ${
              allOos ? "text-muted line-through" : "text-foreground"
            }`}>
              {ws.name}
            </span>

            {/* Agent chip */}
            {agentChip && !allOos && (
              <span className={`shrink-0 hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded ${agentChip.cls}`}>
                {agentChip.label}
              </span>
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

          <div className="flex items-center gap-3 shrink-0 pr-24">
            {!allOos && (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-16 h-1 bg-surface-alt rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted font-mono tabular-nums whitespace-nowrap">
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
              className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-[10px] font-medium transition-colors whitespace-nowrap ${
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
                    className={`group flex items-start gap-3 px-5 py-3 transition-opacity duration-150 ${
                      oos ? "opacity-40" : ""
                    } ${
                      isAttention && d.status === "blocked"
                        ? "border-l-2 border-l-error/50 pl-[18px]"
                        : isAttention
                        ? "border-l-2 border-l-warning/50 pl-[18px]"
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
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

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

  const filtered = activeFilter
    ? workplan.workstreams.filter((ws) => ws.workstream_id === activeFilter)
    : workplan.workstreams;

  // Progress counts (OOS excluded)
  const allDeliverables  = workplan.workstreams.flatMap((ws) => ws.deliverables);
  const inScopeAll       = allDeliverables.filter((d) => !outOfScope.has(d.deliverable_id));
  const totalInScope     = inScopeAll.length;
  const totalComplete    = inScopeAll.filter((d) => d.status === "complete").length;
  const oosCount         = outOfScope.size;

  // Items needing consultant input (for banner)
  const attentionItems: AttentionItem[] = workplan.workstreams.flatMap((ws) =>
    ws.deliverables
      .filter((d) => !outOfScope.has(d.deliverable_id))
      .filter((d) => d.status === "blocked" || d.needs_input)
      .map((d) => ({ ...d, workstream_name: ws.name }))
  );
  // blocked first, then needs_input
  attentionItems.sort((a, b) => {
    if (a.status === "blocked" && b.status !== "blocked") return -1;
    if (b.status === "blocked" && a.status !== "blocked") return 1;
    return 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mt-4"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
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
              style={{ width: `${totalInScope > 0 ? Math.round((totalComplete / totalInScope) * 100) : 0}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted">
            {totalInScope > 0 ? Math.round((totalComplete / totalInScope) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Needs Your Input banner */}
      <AnimatePresence>
        {attentionItems.length > 0 && (
          <NeedsInputBanner key="attention" items={attentionItems} engagementId={engagement.engagement_id} />
        )}
      </AnimatePresence>

      {/* Workstream filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setActiveFilter(null)}
          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
            activeFilter === null
              ? "bg-accent/20 text-accent"
              : "bg-surface text-muted hover:bg-surface-alt hover:text-foreground"
          }`}
        >
          All
        </button>
        {workplan.workstreams.map((ws) => {
          const wsInScope  = ws.deliverables.filter((d) => !outOfScope.has(d.deliverable_id));
          const wsComplete = wsInScope.filter((d) => d.status === "complete").length;
          const wsBlocked  = wsInScope.filter((d) => d.status === "blocked").length;
          const wsAllOos   = ws.deliverables.length > 0 && wsInScope.length === 0;
          const isActive   = activeFilter === ws.workstream_id;
          return (
            <button
              key={ws.workstream_id}
              onClick={() => setActiveFilter(isActive ? null : ws.workstream_id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                wsAllOos
                  ? "opacity-40 bg-surface text-muted line-through"
                  : isActive
                  ? "bg-accent/20 text-accent"
                  : "bg-surface text-muted hover:bg-surface-alt hover:text-foreground"
              }`}
            >
              {wsBlocked > 0 && !wsAllOos && (
                <span className="h-1.5 w-1.5 rounded-full bg-error" />
              )}
              {ws.name}
              {!wsAllOos && (
                <span className="font-mono opacity-60">{wsComplete}/{wsInScope.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Workstream rows */}
      <div className="flex flex-col gap-2">
        {filtered.map((ws) => (
          <WorkstreamRow
            key={ws.workstream_id}
            ws={ws}
            outOfScope={outOfScope}
            onToggleDeliverable={toggleDeliverable}
            onToggleWorkstream={toggleWorkstream}
            engagementId={engagement.engagement_id}
          />
        ))}
      </div>
    </motion.div>
  );
}
