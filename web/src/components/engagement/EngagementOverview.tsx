"use client";

import type { Engagement } from "@/lib/mock-data";
import { PHASE_LABELS } from "@/lib/mock-data";

interface StatBoxProps {
  value: number;
  label: string;
  sublabel: string;
  color?: "warning" | "error" | "muted" | "accent";
}

function StatBox({ value, label, sublabel, color = "muted" }: StatBoxProps) {
  const valueColor = {
    warning: "text-warning",
    error: "text-error",
    muted: "text-foreground",
    accent: "text-accent",
  }[color];

  return (
    <div className="flex flex-col items-center rounded-lg border border-border/30 bg-surface/40 px-4 py-3 min-w-[80px]">
      <span className={`text-xl font-semibold font-mono ${valueColor}`}>
        {value}
      </span>
      <span className="text-[10px] text-muted mt-0.5">{label}</span>
      <span className="text-[9px] text-muted/50">{sublabel}</span>
    </div>
  );
}

export function EngagementOverview({
  engagement,
}: {
  engagement: Engagement;
}) {
  const { stats } = engagement;

  return (
    <div className="mb-8">
      {/* Client info */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">
          {engagement.client_name}
        </h1>
        <p className="text-sm text-muted">
          {engagement.sub_segment} ·{" "}
          {engagement.erp_target} ·{" "}
          {PHASE_LABELS[engagement.phase]} Phase
        </p>

        {/* Team */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] uppercase tracking-[0.1em] text-muted/60 font-medium">
            Team
          </span>
          <div className="flex items-center gap-1">
            {engagement.consultants.map((c) => (
              <div
                key={c.consultant_id}
                title={c.display_name}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-alt text-[10px] font-medium text-muted border border-border/30"
              >
                {c.initials}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3">
        <StatBox
          value={stats.open_decisions}
          label="open"
          sublabel="decisions"
          color={stats.open_decisions > 0 ? "warning" : "muted"}
        />
        <StatBox
          value={stats.high_findings}
          label="high"
          sublabel="findings"
          color={stats.high_findings > 0 ? "error" : "muted"}
        />
        <StatBox
          value={stats.requirements}
          label="reqs"
          sublabel=""
          color="accent"
        />
        <StatBox
          value={stats.unvalidated_reqs}
          label="unval."
          sublabel=""
          color={stats.unvalidated_reqs > 0 ? "warning" : "muted"}
        />
        <StatBox
          value={stats.blocked_items}
          label="blocked"
          sublabel=""
          color={stats.blocked_items > 0 ? "error" : "muted"}
        />
      </div>
    </div>
  );
}
