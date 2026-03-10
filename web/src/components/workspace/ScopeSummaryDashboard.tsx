"use client";

import {
  MOCK_WORKSPACES,
  type Engagement,
  type ProcessInventoryData,
  type ProcessInventoryNode,
  type ProcessScope,
} from "@/lib/mock-data";
import { getScopingThemes, type ScopingTheme } from "@/lib/scoping-data";

// ── Helpers ─────────────────────────────────────────────────────────────────

function getProcessNodes(): ProcessInventoryNode[] {
  const ws = MOCK_WORKSPACES["d-004-01"];
  if (!ws?.graph || ws.graph.kind !== "process_inventory") return [];
  return (ws.graph as ProcessInventoryData).nodes;
}

function scopeStats(nodes: ProcessInventoryNode[]) {
  let inScope = 0;
  let deferred = 0;
  let outOfScope = 0;
  let totalFlows = 0;
  for (const n of nodes) {
    if (n.scope === "in_scope") inScope++;
    else if (n.scope === "deferred") deferred++;
    else if (n.scope === "out_of_scope") outOfScope++;
    totalFlows += n.sub_flow_count;
  }
  return { inScope, deferred, outOfScope, totalFlows };
}

const AGENT_META: Record<string, { name: string; role: string; color: string; border: string }> = {
  consulting_agent:     { name: "Engagement Lead",   role: "Project manager",         color: "#10B981", border: "border-t-emerald-500" },
  functional_consultant: { name: "Business Analyst",  role: "Functional consultant",   color: "#F59E0B", border: "border-t-amber-500" },
  gl_design_coach:      { name: "GL Design Coach",   role: "Accounting specialist",   color: "#3B82F6", border: "border-t-blue-500" },
};

function agentProgress(engagement: Engagement) {
  const allDeliverables = engagement.workplan?.workstreams.flatMap(ws => ws.deliverables) ?? [];
  const byAgent: Record<string, { total: number; complete: number; inProgress: number; inReview: number; notStarted: number }> = {};

  for (const d of allDeliverables) {
    const agent = d.owner_agent ?? "consulting_agent";
    if (!byAgent[agent]) byAgent[agent] = { total: 0, complete: 0, inProgress: 0, inReview: 0, notStarted: 0 };
    byAgent[agent].total++;
    if (d.status === "complete") byAgent[agent].complete++;
    else if (d.status === "in_progress") byAgent[agent].inProgress++;
    else if (d.status === "in_review") byAgent[agent].inReview++;
    else if (d.status === "not_started") byAgent[agent].notStarted++;
  }

  return ["consulting_agent", "functional_consultant", "gl_design_coach"].map(agentId => ({
    agentId,
    ...AGENT_META[agentId],
    ...(byAgent[agentId] ?? { total: 0, complete: 0, inProgress: 0, inReview: 0, notStarted: 0 }),
  }));
}

const SCOPE_CFG: Record<ProcessScope, { dot: string; badge: string; label: string }> = {
  in_scope:     { dot: "bg-emerald-500", badge: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", label: "In Scope" },
  deferred:     { dot: "bg-amber-500",   badge: "text-amber-400 border-amber-500/30 bg-amber-500/10",     label: "Deferred" },
  out_of_scope: { dot: "bg-red-500/60",  badge: "text-red-400/70 border-red-500/20 bg-red-500/8",         label: "Out" },
};

const PHASE_LABEL: Record<string, string> = {
  discovery: "Discovery",
  current_state: "Current State",
  design: "Design Phase",
  build: "Build",
  test: "Test",
  cutover: "Cutover",
};

// ── Component ───────────────────────────────────────────────────────────────

export function ScopeSummaryDashboard({ engagement }: { engagement: Engagement }) {
  const nodes = getProcessNodes();
  const stats = scopeStats(nodes);
  const agents = agentProgress(engagement);
  const themes = getScopingThemes();

  // Build PA lookup for scope by PA-id
  const paScope = new Map<string, ProcessScope>();
  const paName = new Map<string, string>();
  for (const n of nodes) {
    if (n.pa_id) {
      paScope.set(n.pa_id, n.scope);
      paName.set(n.pa_id, n.name);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-8">

        {/* ── Engagement Header ─────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-display text-foreground">{engagement.client_name}</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[13px] text-muted">{engagement.sub_segment} Carrier</span>
            <span className="text-muted/30">·</span>
            <span className="text-[13px] text-muted">{engagement.erp_target}</span>
            <span className="text-muted/30">·</span>
            <span className="text-[11px] px-2 py-0.5 rounded border border-accent/30 bg-accent/10 text-accent font-medium">
              {PHASE_LABEL[engagement.phase] ?? engagement.phase}
            </span>
          </div>
        </div>

        {/* ── Scope Overview Stats ──────────────────────────────── */}
        <section>
          <div className="text-[10px] uppercase tracking-[0.12em] text-muted font-medium mb-3">
            Scope Overview
          </div>
          <div className="grid grid-cols-4 gap-3">
            <StatCard value={stats.inScope} label="In Scope" sublabel="process areas" color="text-emerald-400" />
            <StatCard value={stats.deferred} label="Deferred" sublabel="process areas" color="text-amber-400" />
            <StatCard value={stats.outOfScope} label="Out of Scope" sublabel="process areas" color="text-red-400/60" />
            <StatCard value={stats.totalFlows} label="Sub-Flows" sublabel="total" color="text-blue-400" />
          </div>
        </section>

        {/* ── Agent Progress ────────────────────────────────────── */}
        <section>
          <div className="text-[10px] uppercase tracking-[0.12em] text-muted font-medium mb-3">
            Delivery Progress by Agent
          </div>
          <div className="grid grid-cols-3 gap-3">
            {agents.map(a => {
              const pct = a.total > 0 ? Math.round((a.complete / a.total) * 100) : 0;
              return (
                <div
                  key={a.agentId}
                  className={`rounded-lg border border-border/40 bg-surface p-4 ${a.border} border-t-2`}
                >
                  <div className="text-[13px] font-medium text-foreground">{a.name}</div>
                  <div className="text-[11px] text-muted mb-3">{a.role}</div>

                  {/* Progress bar */}
                  <div className="h-1 rounded-full bg-border/30 mb-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: a.color }}
                    />
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-[20px] font-mono font-semibold text-foreground">{pct}%</span>
                    <span className="text-[11px] text-muted">
                      {a.complete} / {a.total} complete
                    </span>
                  </div>

                  {/* Sub-status line */}
                  <div className="text-[10px] text-muted/70 mt-1">
                    {[
                      a.inReview > 0 && `${a.inReview} review`,
                      a.inProgress > 0 && `${a.inProgress} in progress`,
                      a.notStarted > 0 && `${a.notStarted} not started`,
                    ].filter(Boolean).join(" · ")}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Process Areas by Theme ───────────────────────────── */}
        <section>
          <div className="text-[10px] uppercase tracking-[0.12em] text-muted font-medium mb-3">
            Process Areas by Scoping Theme
          </div>
          <div className="grid grid-cols-2 gap-3">
            {themes.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                paScope={paScope}
                paName={paName}
              />
            ))}
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="border-t border-border/20 pt-4 pb-2">
          <p className="text-[11px] text-muted/50">
            Scope baseline locked Jan 28 · 47 items confirmed · 12 excluded
          </p>
          <p className="text-[10px] text-muted/40 mt-0.5">
            Source: Scope Definition (d-002-02) · Engagement Lead synthesis
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ value, label, sublabel, color }: {
  value: number;
  label: string;
  sublabel: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-surface px-4 py-3">
      <div className={`text-2xl font-mono font-semibold ${color}`}>{value}</div>
      <div className="text-[12px] text-foreground font-medium mt-0.5">{label}</div>
      <div className="text-[10px] text-muted/60">{sublabel}</div>
    </div>
  );
}

function ThemeCard({ theme, paScope, paName }: {
  theme: ScopingTheme;
  paScope: Map<string, ProcessScope>;
  paName: Map<string, string>;
}) {
  return (
    <div
      className="rounded-lg border border-border/40 bg-surface overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: theme.colorHex }}
    >
      <div className="px-4 py-3">
        {/* Theme header */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-sm">{theme.icon}</span>
          <span className="text-[13px] font-medium text-foreground">{theme.name}</span>
        </div>

        {/* PA list */}
        <div className="space-y-1.5">
          {theme.paIds.map(paId => {
            const scope = paScope.get(paId) ?? "in_scope";
            const name = paName.get(paId) ?? paId;
            const cfg = SCOPE_CFG[scope];
            return (
              <div key={paId} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                  <span className={`text-[12px] truncate ${scope === "out_of_scope" ? "text-muted/50 line-through" : "text-muted"}`}>
                    {paId} {name}
                  </span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
