"use client";

import { useRouter } from "next/navigation";
import type { Engagement, Pursuit, ConsultantPresence } from "@/lib/mock-data";

const AGENT_LABEL: Record<string, string> = {
  gl_design_coach: "GL Design Coach",
  functional_consultant: "Functional Consultant",
  consulting_agent: "Consulting Agent",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface ResumeCardProps {
  engagement?: Engagement | null;
  pursuit?: Pursuit | null;
  currentConsultantId: string;
}

export function ResumeCard({
  engagement,
  pursuit,
  currentConsultantId,
}: ResumeCardProps) {
  const router = useRouter();

  // Find current user's presence in engagement
  if (engagement) {
    const myPresence = engagement.presence?.find(
      (p) => p.consultant_id === currentConsultantId && p.deliverable_id
    );

    if (!myPresence || !myPresence.deliverable_id) {
      return (
        <ResumeEmpty message="No recent deliverable. Pick one from the workplan below." />
      );
    }

    // Find the deliverable
    const deliverable = engagement.workplan?.workstreams
      .flatMap((ws) => ws.deliverables)
      .find((d) => d.deliverable_id === myPresence.deliverable_id);

    if (!deliverable) {
      return <ResumeEmpty message="Last deliverable not found." />;
    }

    const agentLabel = deliverable.owner_agent
      ? AGENT_LABEL[deliverable.owner_agent] ?? deliverable.owner_agent
      : null;

    const pendingDecisions = deliverable.needs_input ? "Decisions pending" : null;

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
            Resume
          </h2>
          <div className="flex-1 h-px bg-border/30" />
        </div>

        <p className="text-[10px] text-muted mb-2">
          Last opened {relativeTime(myPresence.last_seen)}
        </p>

        <button
          onClick={() =>
            router.push(
              `/${engagement.engagement_id}/deliverables/${deliverable.deliverable_id}`
            )
          }
          className="w-full rounded-xl border border-border/40 bg-surface/60 p-5 text-left hover:bg-surface-alt/40 transition-colors group"
        >
          <p className="text-sm font-semibold text-foreground mb-1">
            {deliverable.name}
          </p>
          {agentLabel && (
            <p className="text-[10px] text-accent mb-2">{agentLabel}</p>
          )}
          {deliverable.agent_summary && (
            <p className="text-xs text-muted leading-relaxed mb-3">
              {deliverable.agent_summary}
            </p>
          )}
          <div className="flex items-center justify-between">
            {pendingDecisions && (
              <span className="text-[10px] text-warning font-medium">
                {pendingDecisions}
              </span>
            )}
            <span className="text-xs font-medium text-accent opacity-60 group-hover:opacity-100 transition-opacity ml-auto">
              Continue ›
            </span>
          </div>
        </button>
      </div>
    );
  }

  // Pursuit resume — find most recent deliverable
  if (pursuit) {
    const ready = pursuit.deliverables.find((d) => d.status === "ready" || d.status === "in_progress");
    if (!ready) {
      return <ResumeEmpty message="No deliverables started yet." />;
    }

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
            Resume
          </h2>
          <div className="flex-1 h-px bg-border/30" />
        </div>

        <button
          onClick={() =>
            router.push(`/pursue/${pursuit.pursuit_id}/${ready.id}`)
          }
          className="w-full rounded-xl border border-border/40 bg-surface/60 p-5 text-left hover:bg-surface-alt/40 transition-colors group"
        >
          <p className="text-sm font-semibold text-foreground mb-1">{ready.name}</p>
          {ready.summary && (
            <p className="text-xs text-muted leading-relaxed mb-3">
              {ready.summary}
            </p>
          )}
          <span className="text-xs font-medium text-accent opacity-60 group-hover:opacity-100 transition-opacity">
            Continue ›
          </span>
        </button>
      </div>
    );
  }

  return <ResumeEmpty message="Select an engagement or pursuit to see your resume." />;
}

function ResumeEmpty({ message }: { message: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
          Resume
        </h2>
        <div className="flex-1 h-px bg-border/30" />
      </div>
      <div className="rounded-xl border border-border/30 bg-surface/40 px-5 py-6 text-center">
        <p className="text-xs text-muted">{message}</p>
      </div>
    </div>
  );
}
