"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Engagement, DeliverableStatus } from "@/lib/mock-data";

const STATUS_DOT: Record<DeliverableStatus, string> = {
  not_started: "bg-muted/40",
  in_progress: "bg-warning",
  in_review: "bg-accent",
  complete: "bg-success",
  blocked: "bg-error",
};

export default function WorkplanSpine({
  engagement,
}: {
  engagement: Engagement;
}) {
  const params = useParams<{ engagementId: string; deliverableId?: string }>();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Find which workstream contains the active deliverable
  const activeWsId = engagement.workplan?.workstreams.find((ws) =>
    ws.deliverables.some((d) => d.deliverable_id === params.deliverableId)
  )?.workstream_id;

  // Track expanded workstreams — auto-expand the active one
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (activeWsId) s.add(activeWsId);
    return s;
  });

  const toggleWs = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!engagement.workplan) return null;

  // Collapsed icon rail
  if (collapsed) {
    return (
      <div className="flex flex-col items-center w-12 shrink-0 border-r border-border/40 bg-surface/50 py-3 gap-3">
        <button
          onClick={() => setCollapsed(false)}
          title="Expand workplan"
          className="text-muted hover:text-foreground transition-colors text-xs"
        >
          ›
        </button>
        <div className="flex flex-col gap-2 mt-2">
          {engagement.workplan.workstreams.map((ws) => {
            const hasActive = ws.deliverables.some(
              (d) => d.deliverable_id === params.deliverableId
            );
            return (
              <div
                key={ws.workstream_id}
                title={ws.name}
                className={`h-1.5 w-1.5 rounded-full mx-auto ${
                  hasActive ? "bg-accent" : "bg-muted/40"
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-60 shrink-0 border-r border-border/40 bg-surface/30 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0">
        <span className="text-[10px] uppercase tracking-[0.12em] text-muted font-medium">
          Workplan
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-muted hover:text-foreground transition-colors text-xs"
          title="Collapse"
        >
          ‹
        </button>
      </div>

      {/* Workstreams */}
      <div className="flex flex-col py-2">
        {engagement.workplan.workstreams.map((ws) => {
          const isOpen = expanded.has(ws.workstream_id);
          const hasActive = ws.deliverables.some(
            (d) => d.deliverable_id === params.deliverableId
          );
          const complete = ws.deliverables.filter(
            (d) => d.status === "complete"
          ).length;

          return (
            <div key={ws.workstream_id}>
              {/* Workstream header */}
              <button
                onClick={() => toggleWs(ws.workstream_id)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-surface-alt/50 ${
                  hasActive ? "text-foreground" : "text-muted"
                }`}
              >
                <motion.span
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-muted text-[10px] shrink-0"
                >
                  ›
                </motion.span>
                <span className="text-[11px] font-medium leading-snug flex-1 min-w-0 truncate">
                  {ws.name}
                </span>
                <span className="text-[9px] font-mono text-muted shrink-0">
                  {complete}/{ws.deliverables.length}
                </span>
              </button>

              {/* Deliverables */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {ws.deliverables.map((d) => {
                      const isActive =
                        d.deliverable_id === params.deliverableId;
                      return (
                        <button
                          key={d.deliverable_id}
                          onClick={() =>
                            router.push(
                              `/${params.engagementId}/deliverables/${d.deliverable_id}`
                            )
                          }
                          className={`w-full flex items-center gap-2.5 pl-8 pr-3 py-1.5 text-left transition-colors group ${
                            isActive
                              ? "bg-accent/10 border-l-2 border-l-accent text-accent"
                              : "hover:bg-surface-alt/40 text-muted hover:text-foreground/80 border-l-2 border-l-transparent"
                          }`}
                        >
                          <div
                            className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[d.status]}`}
                          />
                          <span className="text-[11px] leading-snug truncate">
                            {d.name}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
