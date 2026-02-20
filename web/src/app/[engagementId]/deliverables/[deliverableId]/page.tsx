"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  MOCK_ENGAGEMENTS,
  MOCK_WORKSPACES,
  type AgentRunState,
  type ProcessInventoryData,
  type ProcessFlowData,
} from "@/lib/mock-data";
import PreflightScreen from "@/components/workspace/PreflightScreen";
import InsightCards from "@/components/workspace/InsightCards";
import AnnotatedTable from "@/components/workspace/AnnotatedTable";
import InlineInterrupt from "@/components/workspace/InlineInterrupt";
import AgentChatInput from "@/components/workspace/AgentChatInput";
import ActivityPanel from "@/components/workspace/ActivityPanel";
import { ProcessInventoryGraph } from "@/components/workspace/ProcessInventoryGraph";
import { ProcessFlowMap } from "@/components/workspace/ProcessFlowMap";

const AGENT_LABEL: Record<string, string> = {
  gl_design_coach: "GL Design Coach",
  functional_consultant: "Functional Consultant",
  consulting_agent: "Consulting Agent",
};

export default function DeliverablePage() {
  const params = useParams<{ engagementId: string; deliverableId: string }>();
  const engagement = MOCK_ENGAGEMENTS.find(
    (e) => e.engagement_id === params.engagementId
  );
  const workspaceTemplate = MOCK_WORKSPACES[params.deliverableId];

  // Resolve deliverable metadata from workplan
  let deliverableName = params.deliverableId;
  let agentId = "consulting_agent";

  if (engagement?.workplan) {
    for (const ws of engagement.workplan.workstreams) {
      const d = ws.deliverables.find(
        (d) => d.deliverable_id === params.deliverableId
      );
      if (d) {
        deliverableName = d.name;
        agentId = d.owner_agent ?? "consulting_agent";
        break;
      }
    }
  }

  const agentName = AGENT_LABEL[agentId] ?? agentId;

  // Run state: start from template, allow transitions
  const [runState, setRunState] = useState<AgentRunState>(
    workspaceTemplate?.run_state ?? "preflight"
  );
  const [interruptResolved, setInterruptResolved] = useState(false);

  // Auto-transition from running → complete for workspaces that start mid-run
  useEffect(() => {
    if (workspaceTemplate?.run_state === "running") {
      const timer = setTimeout(() => {
        setRunState("complete");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [workspaceTemplate?.run_state]);

  // Not found
  if (!workspaceTemplate || !engagement) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Workspace not available for this deliverable.
      </div>
    );
  }

  // Preflight → simulate start
  const handleStart = () => {
    setRunState("running");
    setTimeout(() => {
      if (workspaceTemplate.graph) {
        // Graph workspaces always go to complete
        setRunState("complete");
      } else if (workspaceTemplate.agent_kind === "data_grounded") {
        setRunState("complete");
      } else {
        setRunState("awaiting_input");
      }
    }, 1500);
  };

  const showArtifact =
    runState === "complete" ||
    runState === "awaiting_input" ||
    runState === "running";

  const hasGraph = !!workspaceTemplate.graph;

  const interrupt =
    workspaceTemplate.interrupt && runState === "awaiting_input" && !interruptResolved
      ? workspaceTemplate.interrupt
      : undefined;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Preflight */}
        {runState === "preflight" && (
          <PreflightScreen
            workspace={workspaceTemplate}
            engagement={engagement}
            deliverableName={deliverableName}
            agentName={agentName}
            onStart={handleStart}
          />
        )}

        {/* Running placeholder */}
        {runState === "running" && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent agent-thinking" />
              <span className="text-xs text-muted font-mono">
                {agentName} is working…
              </span>
            </div>
          </div>
        )}

        {/* Artifact view */}
        {showArtifact && runState !== "running" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Graph path — process inventory */}
            {hasGraph && workspaceTemplate.graph!.kind === "process_inventory" && (
              <div className="flex-1 overflow-hidden">
                <ProcessInventoryGraph
                  data={workspaceTemplate.graph as ProcessInventoryData}
                />
              </div>
            )}

            {/* Graph path — process flow map */}
            {hasGraph && workspaceTemplate.graph!.kind === "process_flow" && (
              <div className="flex-1 overflow-hidden">
                <ProcessFlowMap
                  data={workspaceTemplate.graph as ProcessFlowData}
                />
              </div>
            )}

            {/* Table path */}
            {!hasGraph && (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {/* Insight cards — data-grounded agents only */}
                {workspaceTemplate.insight_cards &&
                  workspaceTemplate.insight_cards.length > 0 && (
                    <InsightCards cards={workspaceTemplate.insight_cards} />
                  )}

                {/* Knowledge-grounded: library source badge */}
                {workspaceTemplate.agent_kind === "knowledge_grounded" && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] uppercase tracking-[0.1em] font-medium text-muted/60">
                      Library source
                    </span>
                    <span className="text-[11px] font-mono text-muted bg-surface-alt/60 px-2 py-0.5 rounded">
                      Leading Practice · Insurance Finance · {engagement.erp_target}
                    </span>
                  </div>
                )}

                {/* Table */}
                <AnnotatedTable
                  columns={workspaceTemplate.columns}
                  rows={workspaceTemplate.rows}
                  interruptAfterRowId={interrupt?.insert_after_row_id}
                  interruptResolved={interruptResolved}
                  interruptSlot={
                    interrupt ? (
                      <InlineInterrupt
                        interrupt={interrupt}
                        onResolved={() => setInterruptResolved(true)}
                      />
                    ) : undefined
                  }
                />
              </div>
            )}

            {/* Chat input — always visible at bottom */}
            <AgentChatInput runState={runState} agentName={agentName} />
          </div>
        )}
      </div>

      {/* Activity panel — right rail */}
      <ActivityPanel activity={workspaceTemplate.activity} />
    </div>
  );
}
