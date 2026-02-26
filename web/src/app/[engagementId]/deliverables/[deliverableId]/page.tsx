"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  MOCK_ENGAGEMENTS,
  MOCK_WORKSPACES,
  isWorkshopEligible,
  type AgentRunState,
  type ProcessInventoryData,
  type ProcessFlowData,
  type BusinessRequirementsData,
} from "@/lib/mock-data";
import { useWorkshopStore } from "@/lib/workshop-store";
import { useAnalysisStore, type AnalysisEntry } from "@/lib/analysis-store";
import { useAgentStore } from "@/lib/agent-store";
import PreflightScreen from "@/components/workspace/PreflightScreen";
import { DataAnalysisPreflight } from "@/components/workspace/DataAnalysisPreflight";
import { CompletedAnalysisView } from "@/components/workspace/CompletedAnalysisView";
import InsightCards from "@/components/workspace/InsightCards";
import AnnotatedTable from "@/components/workspace/AnnotatedTable";
import InlineInterrupt from "@/components/workspace/InlineInterrupt";
import AgentChatInput from "@/components/workspace/AgentChatInput";
import ActivityPanel from "@/components/workspace/ActivityPanel";
import { LiveAgentWorkspace } from "@/components/workspace/LiveAgentWorkspace";
import { ProcessInventoryGraph } from "@/components/workspace/ProcessInventoryGraph";
import { ProcessFlowMap } from "@/components/workspace/ProcessFlowMap";
import { ProcessFlowIndex } from "@/components/workspace/ProcessFlowIndex";
import { BusinessRequirementsTable } from "@/components/workspace/BusinessRequirementsTable";
import { CaptureBar, type CaptureBarHandle } from "@/components/workspace/CaptureBar";
import { useWorkshopKeyboard } from "@/hooks/useWorkshopKeyboard";
import { CommandPalette } from "@/components/workspace/CommandPalette";

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

  // Workshop mode
  const workshopMode = useWorkshopStore((s) => s.workshopMode);
  const eligible = isWorkshopEligible(params.deliverableId);
  const isWorkshopActive = workshopMode && eligible;

  // Workshop capture bar ref + keyboard hook
  const captureBarRef = useRef<CaptureBarHandle>(null);
  useWorkshopKeyboard(captureBarRef);

  // ── Analysis store (PDD-002) ──────────────────────────────────────────
  const isDataGroundedLive =
    workspaceTemplate?.agent_live && workspaceTemplate?.agent_kind === "data_grounded";

  const cachedAnalysis = useAnalysisStore((s) =>
    s.getAnalysis(params.engagementId, params.deliverableId)
  );
  const savePrimary = useAnalysisStore((s) => s.savePrimary);
  const appendFollowUp = useAnalysisStore((s) => s.appendFollowUp);
  const clearAnalysis = useAnalysisStore((s) => s.clearAnalysis);

  // Track whether we're in the "running" phase for data-grounded live
  const [analysisRunning, setAnalysisRunning] = useState(false);
  // Track follow-up running state
  const [followUpRunning, setFollowUpRunning] = useState(false);

  // ── Standard run state (non-analysis workspaces) ──────────────────────
  // Process flows skip preflight — content is knowledge-grounded and renders instantly
  const initialRunState: AgentRunState =
    workspaceTemplate?.graph?.kind === "process_flow"
      ? "complete"
      : workspaceTemplate?.run_state ?? "preflight";
  const [runState, setRunState] = useState<AgentRunState>(initialRunState);
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

  // ── Data-grounded live workspace (PDD-002 flow) ───────────────────────
  if (isDataGroundedLive) {
    // If we have cached results and not currently running, show completed view
    if (cachedAnalysis?.primary && !analysisRunning && !followUpRunning) {
      return (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <CompletedAnalysisView
              analysis={cachedAnalysis}
              agentName={agentName}
              onRerun={() => {
                clearAnalysis(params.engagementId, params.deliverableId);
                setAnalysisRunning(true);
              }}
              onFollowUp={() => {
                // Follow-ups currently append mock data
                // In production, this would stream from the agent
                setFollowUpRunning(true);
                setTimeout(() => {
                  appendFollowUp(params.engagementId, params.deliverableId, {
                    output: "Follow-up analysis would appear here with live agent streaming.",
                    toolBadges: [],
                    completedAt: new Date().toISOString(),
                  });
                  setFollowUpRunning(false);
                }, 1000);
              }}
            />
          </div>
          {!isWorkshopActive && (
            <ActivityPanel activity={workspaceTemplate.activity} />
          )}
        </div>
      );
    }

    // If running, show the live agent workspace with onComplete callback
    if (analysisRunning) {
      return (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <LiveAgentWorkspace
              initialPrompt={workspaceTemplate.agent_prompt ?? "Analyze the GL accounts."}
              agent="gl_design_coach"
              agentName={agentName}
              autoStart
              onComplete={(output, tools) => {
                savePrimary(params.engagementId, params.deliverableId, {
                  output,
                  toolBadges: tools,
                  completedAt: new Date().toISOString(),
                });
                setAnalysisRunning(false);
              }}
            />
          </div>
          {!isWorkshopActive && (
            <ActivityPanel activity={workspaceTemplate.activity} />
          )}
        </div>
      );
    }

    // Otherwise show the data analysis preflight
    return (
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DataAnalysisPreflight
            deliverableName={deliverableName}
            agentName={agentName}
            bullets={workspaceTemplate.preflight_bullets}
            onStart={() => setAnalysisRunning(true)}
          />
        </div>
        {!isWorkshopActive && (
          <ActivityPanel activity={workspaceTemplate.activity} />
        )}
      </div>
    );
  }

  // ── Standard workspace flow (unchanged) ───────────────────────────────

  // Preflight → start
  const handleStart = () => {
    setRunState("running");
    // Live agent workspaces stay in "running" — the LiveAgentWorkspace handles its own state
    if (workspaceTemplate.agent_live) return;
    setTimeout(() => {
      if (workspaceTemplate.graph) {
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
      {/* Command palette — workshop mode only */}
      {isWorkshopActive && (
        <CommandPalette captureBarRef={captureBarRef} />
      )}

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

        {/* Live agent workspace — replaces both running and artifact views */}
        {workspaceTemplate.agent_live && runState === "running" && (
          <LiveAgentWorkspace
            initialPrompt={workspaceTemplate.agent_prompt ?? "Analyze the GL accounts."}
            agent="gl_design_coach"
            agentName={agentName}
            autoStart
          />
        )}

        {/* Running placeholder — non-live workspaces only */}
        {runState === "running" && !workspaceTemplate.agent_live && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent agent-thinking" />
              <span className="text-xs text-muted font-mono">
                {agentName} is working…
              </span>
            </div>
          </div>
        )}

        {/* Artifact view — non-live workspaces */}
        {showArtifact && runState !== "running" && !workspaceTemplate.agent_live && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Graph path — process inventory */}
            {hasGraph && workspaceTemplate.graph!.kind === "process_inventory" && (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <ProcessInventoryGraph
                  data={workspaceTemplate.graph as ProcessInventoryData}
                />
              </div>
            )}

            {/* Graph path — process flow index */}
            {hasGraph && workspaceTemplate.graph!.kind === "process_flow_index" && (
              <ProcessFlowIndex />
            )}

            {/* Graph path — process flow map */}
            {hasGraph && workspaceTemplate.graph!.kind === "process_flow" && (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 min-h-0 relative">
                  <ProcessFlowMap
                    data={workspaceTemplate.graph as ProcessFlowData}
                  />
                </div>
                {isWorkshopActive && (
                  <div className="shrink-0">
                    <CaptureBar ref={captureBarRef} context="flow" />
                  </div>
                )}
              </div>
            )}

            {/* Graph path — business requirements */}
            {hasGraph && workspaceTemplate.graph!.kind === "business_requirements" && (
              <BusinessRequirementsTable
                data={workspaceTemplate.graph as BusinessRequirementsData}
                captureBarRef={captureBarRef}
              />
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

            {/* Chat input — hidden in workshop mode */}
            {!isWorkshopActive && (
              <AgentChatInput runState={runState} agentName={agentName} />
            )}

          </div>
        )}
      </div>

      {/* Activity panel — right rail (hidden in workshop mode) */}
      {!isWorkshopActive && (
        <ActivityPanel activity={workspaceTemplate.activity} />
      )}
    </div>
  );
}
