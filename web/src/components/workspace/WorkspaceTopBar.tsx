"use client";

import { useParams, useRouter } from "next/navigation";
import type { Engagement } from "@/lib/mock-data";

const AGENT_LABEL: Record<string, string> = {
  gl_design_coach: "GL Design Coach",
  functional_consultant: "Functional Consultant",
  consulting_agent: "Consulting Agent",
};

export default function WorkspaceTopBar({
  engagement,
}: {
  engagement: Engagement;
}) {
  const params = useParams<{ engagementId: string; deliverableId?: string }>();
  const router = useRouter();

  let workstreamName = "";
  let deliverableName = "";
  let agentName = "";

  if (params.deliverableId && engagement.workplan) {
    for (const ws of engagement.workplan.workstreams) {
      const d = ws.deliverables.find(
        (d) => d.deliverable_id === params.deliverableId
      );
      if (d) {
        workstreamName = ws.name;
        deliverableName = d.name;
        agentName = d.owner_agent ? (AGENT_LABEL[d.owner_agent] ?? "") : "";
        break;
      }
    }
  }

  return (
    <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/40 bg-background/90 backdrop-blur-sm shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted min-w-0">
        <button
          onClick={() => router.push("/")}
          className="hover:text-foreground transition-colors whitespace-nowrap"
        >
          ← {engagement.client_name}
        </button>
        {workstreamName && (
          <>
            <span className="opacity-30">/</span>
            <span className="truncate max-w-[180px]">{workstreamName}</span>
          </>
        )}
        {deliverableName && (
          <>
            <span className="opacity-30">/</span>
            <span className="text-foreground/70 truncate max-w-[220px]">
              {deliverableName}
            </span>
          </>
        )}
      </div>

      {/* Agent status */}
      {agentName && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted">{agentName}</span>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-accent agent-thinking" />
            <span className="text-[10px] font-mono text-accent">ACTIVE</span>
          </div>
        </div>
      )}
    </div>
  );
}
