"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Engagement } from "@/lib/mock-data";
import { isWorkshopEligible, PROCESS_AREAS } from "@/lib/mock-data";
import { useWorkshopStore } from "@/lib/workshop-store";

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

  const eligible = params.deliverableId
    ? isWorkshopEligible(params.deliverableId)
    : false;
  const isWorkshopActive = workshopMode && eligible;

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

  const handleSelectPA = (paId: string, paName: string) => {
    startWorkshop(paId, paName);
    setPickerOpen(false);
  };

  return (
    <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/40 bg-background/90 backdrop-blur-sm shrink-0 relative z-20">
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
            <span className="text-foreground/90 truncate max-w-[220px]">
              {deliverableName}
            </span>
          </>
        )}
      </div>

      {/* Right side: agent status + workshop toggle */}
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

        {/* Workshop toggle — visible when workspace is eligible */}
        {eligible && (
          <div className="relative" ref={pickerRef}>
            {isWorkshopActive ? (
              /* Active state — shows PA, click to end */
              <button
                onClick={endWorkshop}
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
            ) : (
              /* Inactive state — click to open PA picker */
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

            {/* PA picker dropdown */}
            <AnimatePresence>
              {pickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-[340px] max-h-[420px] overflow-y-auto rounded-lg border border-border/60 bg-surface shadow-xl z-50"
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
                      {pas.map((pa) => (
                        <button
                          key={pa.pa_id}
                          onClick={() => handleSelectPA(pa.pa_id, pa.name)}
                          className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left hover:bg-warning/5 transition-colors"
                        >
                          <span className="text-[10px] font-mono text-muted w-[36px] shrink-0">
                            {pa.pa_id}
                          </span>
                          <span className="text-xs text-foreground/90 truncate">
                            {pa.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
