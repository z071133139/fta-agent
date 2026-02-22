"use client";

import type { DeliverableWorkspace, Engagement } from "@/lib/mock-data";

interface PreflightScreenProps {
  workspace: DeliverableWorkspace;
  engagement: Engagement;
  deliverableName: string;
  agentName: string;
  onStart: () => void;
}

export default function PreflightScreen({
  workspace,
  engagement,
  deliverableName,
  agentName,
  onStart,
}: PreflightScreenProps) {
  const isDataGrounded = workspace.agent_kind === "data_grounded";

  const ctaLabel = isDataGrounded ? "Start Analysis" : "Review Library";
  const headline = isDataGrounded
    ? "Ready to analyze your data."
    : "Pre-populated from leading practice library.";

  const sourceLabel = isDataGrounded
    ? workspace.preflight_data_source
    : `Leading Practice · Insurance Finance · ${engagement.erp_target}`;

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 py-12">
      <div className="w-full max-w-lg">
        {/* Deliverable + agent */}
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium mb-1">
          {agentName}
        </p>
        <h2 className="text-xl font-semibold text-foreground mb-6 leading-tight">
          {deliverableName}
        </h2>

        {/* Card */}
        <div className="rounded-xl border border-border/50 bg-surface/60 p-6">
          <p className="text-sm font-medium text-foreground/90 mb-4">
            {headline}
          </p>

          {/* Bullets */}
          <ul className="flex flex-col gap-2 mb-5">
            {workspace.preflight_bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-muted">
                <span className="mt-1 h-1 w-1 rounded-full bg-muted/50 shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>

          {/* Source badge */}
          {sourceLabel && (
            <div className="flex items-center gap-2 mb-6 pt-4 border-t border-border/30">
              <span className="text-[10px] text-muted uppercase tracking-[0.1em]">
                Source
              </span>
              <span className="text-[11px] font-mono text-muted bg-surface-alt/60 px-2 py-0.5 rounded">
                {sourceLabel}
              </span>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={onStart}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 active:bg-accent/80 transition-colors"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
