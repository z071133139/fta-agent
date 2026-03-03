"use client";

import { useState, useRef, useEffect } from "react";
import {
  type Engagement,
  type Pursuit,
  PHASE_LABELS,
  type EngagementPhase,
} from "@/lib/mock-data";

type ContextItem =
  | { kind: "engagement"; data: Engagement }
  | { kind: "pursuit"; data: Pursuit };

const PHASE_DOT: Record<EngagementPhase, string> = {
  discovery: "bg-cyan-400",
  current_state: "bg-warning",
  design: "bg-accent",
  build: "bg-purple-400",
  test: "bg-success",
  cutover: "bg-success",
};

interface ContextSelectorProps {
  engagements: Engagement[];
  pursuits: Pursuit[];
  selectedId: string | null;
  onSelect: (id: string, kind: "engagement" | "pursuit") => void;
}

export function ContextSelector({
  engagements,
  pursuits,
  selectedId,
  onSelect,
}: ContextSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Find selected item
  const selectedEng = engagements.find((e) => e.engagement_id === selectedId);
  const selectedPursuit = pursuits.find((p) => p.pursuit_id === selectedId);
  const selected: ContextItem | null = selectedEng
    ? { kind: "engagement", data: selectedEng }
    : selectedPursuit
      ? { kind: "pursuit", data: selectedPursuit }
      : null;

  return (
    <div ref={ref} className="relative rounded-xl border border-border/40 bg-surface/60">
      {/* Header bar */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground truncate">
              {selected
                ? selected.kind === "engagement"
                  ? selected.data.client_name
                  : selected.data.name
                : "Select..."}
            </span>
            <svg
              className={`h-3.5 w-3.5 text-muted transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          <p className="text-xs text-muted mt-0.5">
            {selected?.kind === "engagement" && (
              <>
                {selected.data.sub_segment} · {selected.data.erp_target} · {PHASE_LABELS[selected.data.phase]} Phase
              </>
            )}
            {selected?.kind === "pursuit" && (
              <>
                {selected.data.sub_segment} · {selected.data.meeting_type} · Pursuit
              </>
            )}
          </p>
        </div>
      </button>

      {/* Stats bar — engagement only */}
      {selected?.kind === "engagement" && (
        <EngagementStats engagement={selected.data} />
      )}

      {/* Pursuit summary */}
      {selected?.kind === "pursuit" && (
        <div className="px-5 pb-3">
          <p className="text-xs text-muted">{selected.data.summary}</p>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-border/60 bg-surface shadow-xl overflow-hidden">
          {/* Engagements group */}
          <div className="px-3 pt-2.5 pb-1">
            <span className="text-[9px] uppercase tracking-[0.15em] text-muted/60 font-medium">
              Engagements
            </span>
          </div>
          {engagements.map((eng) => (
            <button
              key={eng.engagement_id}
              onClick={() => {
                onSelect(eng.engagement_id, "engagement");
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-surface-alt/50 ${
                selectedId === eng.engagement_id ? "bg-accent/5" : ""
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${PHASE_DOT[eng.phase]}`} />
              <span className="text-xs text-foreground/90 flex-1 truncate">{eng.client_name}</span>
              <span className="text-[10px] text-muted font-mono shrink-0">{PHASE_LABELS[eng.phase]}</span>
              <span className="text-[10px] text-muted/50 font-mono shrink-0">{eng.last_active}</span>
            </button>
          ))}

          {/* Pursuits group */}
          {pursuits.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1">
                <span className="text-[9px] uppercase tracking-[0.15em] text-muted/60 font-medium">
                  Pursuits
                </span>
              </div>
              {pursuits.map((p) => (
                <button
                  key={p.pursuit_id}
                  onClick={() => {
                    onSelect(p.pursuit_id, "pursuit");
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-surface-alt/50 ${
                    selectedId === p.pursuit_id ? "bg-accent/5" : ""
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-cyan-400" />
                  <span className="text-xs text-foreground/90 flex-1 truncate">{p.name}</span>
                  <span className="text-[10px] text-muted font-mono shrink-0">{p.sub_segment}</span>
                </button>
              ))}
            </>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border/30">
            <button className="text-[10px] text-muted hover:text-foreground transition-colors">
              + New Engagement
            </button>
            <button className="text-[10px] text-muted hover:text-foreground transition-colors">
              + New Pursuit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stats bar (engagement mode) ──────────────────────────────────────────────

function EngagementStats({ engagement }: { engagement: Engagement }) {
  const { stats, workplan } = engagement;
  const allDeliverables = workplan?.workstreams.flatMap((ws) => ws.deliverables) ?? [];
  const total = allDeliverables.length;
  const complete = allDeliverables.filter((d) => d.status === "complete").length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0;

  const statItems = [
    { value: stats.open_decisions, label: "open", color: stats.open_decisions > 0 ? "text-warning" : "text-foreground" },
    { value: stats.high_findings, label: "HIGH", color: stats.high_findings > 0 ? "text-error" : "text-foreground" },
    { value: stats.requirements, label: "reqs", color: "text-accent" },
    { value: stats.unvalidated_reqs, label: "unval", color: stats.unvalidated_reqs > 0 ? "text-warning" : "text-foreground" },
    { value: stats.blocked_items, label: "block", color: stats.blocked_items > 0 ? "text-error" : "text-foreground" },
  ];

  return (
    <div className="flex items-center gap-3 px-5 pb-3 flex-wrap">
      {statItems.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center rounded-lg border border-border/30 bg-background/40 px-3 py-1.5 min-w-[52px]"
        >
          <span className={`text-sm font-semibold font-mono ${s.color}`}>{s.value}</span>
          <span className="text-[9px] text-muted">{s.label}</span>
        </div>
      ))}

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted">
          {complete}/{total}
        </span>
        <div className="w-20 h-1 bg-surface-alt rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted">{pct}%</span>
      </div>
    </div>
  );
}
