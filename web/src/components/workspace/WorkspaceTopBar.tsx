"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Engagement } from "@/lib/mock-data";
import { isWorkshopEligible, PROCESS_AREAS, MOCK_WORKSPACES } from "@/lib/mock-data";
import { useWorkshopStore } from "@/lib/workshop-store";
import {
  hasPreviousSession,
  getSessionTimestamp,
  getSessionStats,
  clearWorkshopState,
} from "@/lib/workshop-persistence";
import { WorkshopHistory } from "./WorkshopHistory";

const AGENT_LABEL: Record<string, string> = {
  gl_design_coach: "GL Design Coach",
  functional_consultant: "Functional Consultant",
  consulting_agent: "Consulting Agent",
};

// Group PAs by process_area for the picker
const PA_GROUPS = PROCESS_AREAS.reduce<Record<string, typeof PROCESS_AREAS>>(
  (acc, pa) => {
    (acc[pa.process_area] ??= []).push(pa);
    return acc;
  },
  {}
);

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

export default function WorkspaceTopBar({
  engagement,
}: {
  engagement: Engagement;
}) {
  const params = useParams<{ engagementId: string; deliverableId?: string }>();
  const router = useRouter();
  const workshopMode = useWorkshopStore((s) => s.workshopMode);
  const workshopSession = useWorkshopStore((s) => s.workshopSession);
  const startWorkshop = useWorkshopStore((s) => s.startWorkshop);
  const endWorkshop = useWorkshopStore((s) => s.endWorkshop);

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const engagementId = params.engagementId ?? "default";

  const eligible = params.deliverableId
    ? isWorkshopEligible(params.deliverableId)
    : false;
  const isWorkshopActive = workshopMode && eligible;

  // Check if this workspace has a pre-set PA (e.g. process flow already scoped to a PA)
  const workspace = params.deliverableId
    ? MOCK_WORKSPACES[params.deliverableId]
    : undefined;
  const directPA = workspace?.workshop_pa;
  const directPAName = directPA
    ? PROCESS_AREAS.find((p) => p.pa_id === directPA)?.name ?? directPA
    : undefined;

  // Check for previous sessions when picker opens
  const paSessionInfo = useMemo(() => {
    if (!pickerOpen) return new Map<string, { timestamp: string; stats: ReturnType<typeof getSessionStats> }>();
    const info = new Map<string, { timestamp: string; stats: ReturnType<typeof getSessionStats> }>();
    for (const pa of PROCESS_AREAS) {
      if (hasPreviousSession(engagementId, pa.pa_id)) {
        const ts = getSessionTimestamp(engagementId, pa.pa_id);
        const stats = getSessionStats(engagementId, pa.pa_id);
        if (ts) info.set(pa.pa_id, { timestamp: ts, stats });
      }
    }
    return info;
  }, [pickerOpen, engagementId]);

  // Check for direct PA previous session
  const directPAHasSession = directPA ? hasPreviousSession(engagementId, directPA) : false;

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pickerOpen]);

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

  const handleSelectPA = (paId: string, paName: string, resume: boolean) => {
    if (!resume) {
      // Archive old session if exists
      clearWorkshopState(engagementId, paId);
    }
    startWorkshop(paId, paName, { resume, engagementId });
    setPickerOpen(false);
  };

  const handleDirectStart = (resume: boolean) => {
    if (directPA && directPAName) {
      if (!resume) {
        clearWorkshopState(engagementId, directPA);
      }
      startWorkshop(directPA, directPAName, { resume, engagementId });
    }
  };

  return (
    <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/40 bg-background/90 backdrop-blur-sm shrink-0 relative z-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted min-w-0">
        <button
          onClick={() => router.push("/")}
          className="hover:text-foreground transition-colors whitespace-nowrap"
        >
          ← Engagements
        </button>
        <span className="opacity-30">/</span>
        <button
          onClick={() => router.push(`/${engagementId}`)}
          className="hover:text-foreground transition-colors whitespace-nowrap"
        >
          {engagement.client_name}
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
            <span className="text-foreground/90 truncate max-w-[220px]">
              {deliverableName}
            </span>
          </>
        )}
      </div>

      {/* Right side: agent status + workshop toggle + history */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Agent status */}
        {agentName && !isWorkshopActive && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">{agentName}</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-accent agent-thinking" />
              <span className="text-[10px] font-mono text-accent">ACTIVE</span>
            </div>
          </div>
        )}

        {/* Workshop history toggle */}
        {isWorkshopActive && <WorkshopHistory />}

        {/* Workshop toggle — visible when workspace is eligible */}
        {eligible && (
          <div className="relative" ref={pickerRef}>
            {isWorkshopActive ? (
              /* Active state — shows PA, click to end */
              <button
                onClick={() => endWorkshop(engagementId)}
                className="flex items-center gap-2 px-2.5 py-1 rounded bg-warning/15 border border-warning/30 hover:bg-warning/25 transition-colors cursor-pointer"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                <span className="text-[10px] font-mono font-medium text-warning tracking-wide">
                  {workshopSession?.processAreaId}
                </span>
                <span className="text-[9px] text-warning font-mono max-w-[160px] truncate">
                  {workshopSession?.processAreaName}
                </span>
                <span className="text-[9px] text-warning/80 ml-1">✕</span>
              </button>
            ) : directPA ? (
              /* Direct start — workspace already scoped to a PA */
              directPAHasSession ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDirectStart(true)}
                    className="flex items-center gap-2 px-2.5 py-1 rounded border border-[#10B981]/30 hover:bg-[#10B981]/5 transition-colors cursor-pointer"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    <span className="text-[10px] font-mono text-[#10B981]">
                      Resume
                    </span>
                  </button>
                  <button
                    onClick={() => handleDirectStart(false)}
                    className="flex items-center gap-2 px-2.5 py-1 rounded border border-border/40 hover:border-warning/30 hover:bg-warning/5 transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] font-mono text-muted">
                      New
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleDirectStart(false)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded border border-border/40 hover:border-warning/30 hover:bg-warning/5 transition-colors cursor-pointer"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-muted/40" />
                  <span className="text-[10px] font-mono font-medium text-muted tracking-wide">
                    Workshop
                  </span>
                </button>
              )
            ) : (
              /* Picker start — need to select a PA */
              <button
                onClick={() => setPickerOpen(!pickerOpen)}
                className="flex items-center gap-2 px-2.5 py-1 rounded border border-border/40 hover:border-warning/30 hover:bg-warning/5 transition-colors cursor-pointer"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-muted/40" />
                <span className="text-[10px] font-mono font-medium text-muted tracking-wide">
                  Workshop
                </span>
              </button>
            )}

            {/* PA picker dropdown — only when no directPA */}
            {!directPA && (
              <AnimatePresence>
                {pickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 w-[380px] max-h-[420px] overflow-y-auto rounded-lg border border-border/60 bg-surface shadow-xl z-50"
                  >
                    <div className="px-3 py-2 border-b border-border/30">
                      <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-muted">
                        Start workshop for process area
                      </span>
                    </div>
                    {Object.entries(PA_GROUPS).map(([group, pas]) => (
                      <div key={group}>
                        <div className="px-3 pt-2.5 pb-1">
                          <span className="text-[9px] uppercase tracking-[0.1em] font-medium text-muted/80">
                            {group}
                          </span>
                        </div>
                        {pas.map((pa) => {
                          const sessionInfo = paSessionInfo.get(pa.pa_id);
                          return (
                            <div
                              key={pa.pa_id}
                              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-warning/5 transition-colors"
                            >
                              <span className="text-[10px] font-mono text-muted w-[36px] shrink-0">
                                {pa.pa_id}
                              </span>
                              <span className="text-xs text-foreground/90 truncate flex-1">
                                {pa.name}
                              </span>
                              {sessionInfo ? (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[8px] font-mono text-muted/50">
                                    {relativeTime(sessionInfo.timestamp)}
                                  </span>
                                  {sessionInfo.stats && (
                                    <span className="text-[8px] font-mono text-[#10B981]/60">
                                      {sessionInfo.stats.newRequirements + sessionInfo.stats.modifiedRequirements} changes
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleSelectPA(pa.pa_id, pa.name, true)}
                                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-colors"
                                  >
                                    Resume
                                  </button>
                                  <button
                                    onClick={() => handleSelectPA(pa.pa_id, pa.name, false)}
                                    className="text-[9px] font-mono px-1.5 py-0.5 rounded text-muted/50 hover:text-muted transition-colors"
                                  >
                                    New
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleSelectPA(pa.pa_id, pa.name, false)}
                                  className="text-[9px] font-mono px-1.5 py-0.5 rounded text-muted/40 hover:text-muted hover:bg-warning/5 transition-colors shrink-0"
                                >
                                  Start
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
