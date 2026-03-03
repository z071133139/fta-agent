"use client";

import { useParams, useRouter } from "next/navigation";
import {
  MOCK_WORKSPACES,
  type ProcessFlowData,
  type ProcessFlowIndexData,
} from "@/lib/mock-data";
import { useFlowBuilderStore } from "@/lib/flow-builder-store";

interface FlowEntry {
  deliverable_id: string;
  sp_id: string;
  sp_name: string;
  pa_label: string;
  pa_name: string;
  swimlane_count: number;
  node_count: number;
  overlay_count: number;
  leading: number;
  overlay: number;
  gap: number;
  isCustom?: boolean;
}

function buildFlowEntries(indexData: ProcessFlowIndexData): FlowEntry[] {
  return indexData.flow_ids
    .map((id) => {
      const ws = MOCK_WORKSPACES[id];
      if (!ws?.graph || ws.graph.kind !== "process_flow") return null;
      const flow = ws.graph as ProcessFlowData;
      const taskNodes = flow.nodes.filter(
        (n) => n.type !== "start" && n.type !== "end"
      );
      const paLabel = ws.workshop_pa ?? "";
      // Extract SP id + name from preflight_title (e.g. "SP-02.1 · Journal Entry Processing")
      const spMatch = ws.preflight_title.match(/^(SP-[\d.]+)\s*·\s*(.+)$/);
      const spId = spMatch?.[1] ?? id;
      const spName = spMatch?.[2] ?? flow.name;
      // Extract PA name from preflight_bullets[0] (e.g. "PA-02 General Ledger & Multi-Basis Accounting · sub-flow 1 of 5")
      const paMatch = ws.preflight_bullets[0]?.match(/^(PA-\d+\s+[^·]+)/);
      const paName = paMatch?.[1]?.trim() ?? paLabel;

      let leading = 0, overlayCount = 0, gapCount = 0;
      for (const node of taskNodes) {
        if (node.status === "leading_practice") leading++;
        else if (node.status === "client_overlay") overlayCount++;
        else if (node.status === "gap") gapCount++;
      }

      return {
        deliverable_id: id,
        sp_id: spId,
        sp_name: spName,
        pa_label: paLabel,
        pa_name: paName,
        swimlane_count: flow.swimlanes?.length ?? 0,
        node_count: taskNodes.length,
        overlay_count: flow.overlays.length,
        leading,
        overlay: overlayCount,
        gap: gapCount,
      } satisfies FlowEntry;
    })
    .filter((c): c is FlowEntry => c !== null);
}

interface ProcessFlowIndexProps {
  onStartBuilder?: () => void;
  onViewCustomFlow?: (flow: ProcessFlowData) => void;
}

export function ProcessFlowIndex({ onStartBuilder, onViewCustomFlow }: ProcessFlowIndexProps) {
  const params = useParams<{ engagementId: string; deliverableId: string }>();
  const router = useRouter();
  const workspace = MOCK_WORKSPACES[params.deliverableId];

  // Get accepted custom flows and active session from the builder store
  // Use direct property access (not getter methods) to avoid creating new references each render
  const acceptedFlows = useFlowBuilderStore((s) => s.acceptedFlows[params.engagementId]);
  const activeSession = useFlowBuilderStore((s) => s.sessions[params.engagementId]);
  const hasInProgressSession = activeSession && activeSession.status === "building";

  if (!workspace?.graph || workspace.graph.kind !== "process_flow_index") {
    return null;
  }

  const entries = buildFlowEntries(workspace.graph as ProcessFlowIndexData);

  // Add all accepted custom flows as entries
  const allEntries = [...entries];
  for (const accepted of (acceptedFlows ?? [])) {
    const flow = accepted.flow;
    const taskNodes = flow.nodes.filter(
      (n) => n.type !== "start" && n.type !== "end"
    );
    allEntries.push({
      deliverable_id: accepted.id,
      sp_id: "Custom",
      sp_name: flow.name,
      pa_label: "Custom",
      pa_name: "Custom Process Flows",
      swimlane_count: flow.swimlanes?.length ?? 0,
      node_count: taskNodes.length,
      overlay_count: flow.overlays.length,
      leading: 0,
      overlay: 0,
      gap: 0,
      isCustom: true,
    });
  }

  // Group by PA
  const groups = new Map<string, FlowEntry[]>();
  for (const entry of allEntries) {
    const key = entry.pa_label;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }

  const totalFindings = allEntries.reduce((s, e) => s + e.overlay_count, 0);

  return (
    <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Summary bar */}
      <div className="flex items-center gap-4 px-6 py-2.5 border-b border-border/40 text-[11px]">
        <span className="text-muted">{allEntries.length} process flows</span>
        <span>
          <span className="text-muted mr-1">Swimlane designs</span>
          <span className="font-mono text-foreground">{allEntries.length}</span>
        </span>
        {totalFindings > 0 && (
          <span>
            <span className="text-[#F59E0B] mr-1">Findings</span>
            <span className="font-mono text-[#F59E0B]">
              {totalFindings}
            </span>
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted/60">
            Leading Practice · Insurance Finance
          </span>
        </div>
      </div>

      {/* Flow list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl space-y-5">
          {[...groups].map(([pa, paEntries]) => (
            <div key={pa}>
              <h3 className="text-[11px] uppercase tracking-[0.14em] text-muted font-semibold px-3 mb-1.5">
                {paEntries[0]?.pa_name ?? pa}
              </h3>
              <div className="space-y-0.5">
                {paEntries.map((entry) => (
                  <button
                    key={entry.deliverable_id}
                    onClick={() => {
                      if (entry.isCustom) {
                        // View accepted custom flow in read-only map
                        const accepted = (acceptedFlows ?? []).find((a) => a.id === entry.deliverable_id);
                        if (accepted) {
                          onViewCustomFlow?.(accepted.flow);
                        }
                      } else {
                        router.push(
                          `/${params.engagementId}/deliverables/${entry.deliverable_id}`
                        );
                      }
                    }}
                    className="group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-transparent cursor-pointer transition-colors hover:bg-surface/50 hover:border-border/30 text-left"
                  >
                    {/* Dot */}
                    <div className="flex-shrink-0 w-3 flex items-center justify-center">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          entry.isCustom ? "bg-accent" : "bg-[#475569]"
                        }`}
                      />
                    </div>

                    {/* SP ID */}
                    <span className="flex-shrink-0 text-[10px] font-mono text-muted/80 w-12">
                      {entry.sp_id}
                    </span>

                    {/* Name */}
                    <span className="flex-1 text-[12px] leading-snug text-foreground">
                      {entry.sp_name}
                    </span>

                    {/* Stats */}
                    <span className="flex-shrink-0 text-[10px] font-mono text-muted mr-1">
                      {entry.swimlane_count} lanes
                    </span>
                    <span className="flex-shrink-0 text-[10px] font-mono text-muted mr-1">
                      {entry.node_count} steps
                    </span>

                    {/* Node type breakdown badges */}
                    {entry.leading > 0 && (
                      <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded border border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]">
                        {entry.leading} LP
                      </span>
                    )}
                    {entry.overlay > 0 && (
                      <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]">
                        {entry.overlay} Overlay
                      </span>
                    )}
                    {entry.gap > 0 && (
                      <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded border border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]">
                        {entry.gap} Gap
                      </span>
                    )}

                    {/* Custom badge */}
                    {entry.isCustom && (
                      <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded border border-accent/30 bg-accent/10 text-accent">
                        Custom
                      </span>
                    )}

                    {/* Findings count */}
                    {entry.overlay_count > 0 && (
                      <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded border border-border/20 text-muted/70">
                        {entry.overlay_count} findings
                      </span>
                    )}

                    {/* Arrow */}
                    <svg
                      className="flex-shrink-0 w-3 h-3 text-muted/30 group-hover:text-muted/60 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* + New Process Flow button */}
          <div className="px-3 pt-2">
            <button
              onClick={onStartBuilder}
              className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-dashed border-border/50 cursor-pointer transition-colors hover:bg-surface/50 hover:border-accent/30 w-full text-left"
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-[12px] text-muted group-hover:text-foreground transition-colors">
                {hasInProgressSession ? "Continue Building Flow" : "New Process Flow"}
              </span>
              <span className="text-[10px] font-mono text-muted/50 ml-auto">
                Functional Consultant
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
