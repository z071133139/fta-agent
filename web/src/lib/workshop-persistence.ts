import type { WorkshopRequirement, WorkshopFlowNodeChange, PlacedFlowNode } from "./workshop-store";
import type { ProcessFlowNode } from "./mock-data";

// ── Session summary type ─────────────────────────────────────────────────────

export interface WorkshopSessionSummary {
  engagementId: string;
  processAreaId: string;
  processAreaName: string;
  startedAt: string;
  endedAt: string;
  stats: {
    newRequirements: number;
    modifiedRequirements: number;
    newNodes: number;
    placedNodes: number;
    gapsFlagged: number;
    deletedNodes: number;
  };
}

// ── Serialized state shape ───────────────────────────────────────────────────

interface SerializedWorkshopState {
  processAreaId: string;
  processAreaName: string;
  startedAt: string;
  capturedRequirements: [string, WorkshopRequirement][];
  newRequirementIds: string[];
  flowNodeChanges: [string, WorkshopFlowNodeChange][];
  newFlowNodes: ProcessFlowNode[];
  placedFlowNodes: PlacedFlowNode[];
  deletedFlowNodeIds: string[];
  reqSeq: number;
  nodeSeq: number;
}

// ── Keys ─────────────────────────────────────────────────────────────────────

function sessionKey(engagementId: string, paId: string): string {
  return `fta-workshop-${engagementId}-${paId}`;
}

const INDEX_KEY = "fta-workshop-sessions-index";

// ── Serialize / Deserialize ──────────────────────────────────────────────────

export function serializeState(state: {
  processAreaId: string;
  processAreaName: string;
  startedAt: string;
  capturedRequirements: Map<string, WorkshopRequirement>;
  newRequirementIds: string[];
  flowNodeChanges: Map<string, WorkshopFlowNodeChange>;
  newFlowNodes: ProcessFlowNode[];
  placedFlowNodes: PlacedFlowNode[];
  deletedFlowNodeIds: Set<string>;
  reqSeq: number;
  nodeSeq: number;
}): SerializedWorkshopState {
  return {
    processAreaId: state.processAreaId,
    processAreaName: state.processAreaName,
    startedAt: state.startedAt,
    capturedRequirements: [...state.capturedRequirements.entries()],
    newRequirementIds: state.newRequirementIds,
    flowNodeChanges: [...state.flowNodeChanges.entries()],
    newFlowNodes: state.newFlowNodes,
    placedFlowNodes: state.placedFlowNodes,
    deletedFlowNodeIds: [...state.deletedFlowNodeIds],
    reqSeq: state.reqSeq,
    nodeSeq: state.nodeSeq,
  };
}

export function deserializeState(data: SerializedWorkshopState) {
  return {
    processAreaId: data.processAreaId,
    processAreaName: data.processAreaName,
    startedAt: data.startedAt,
    capturedRequirements: new Map(data.capturedRequirements),
    newRequirementIds: data.newRequirementIds,
    flowNodeChanges: new Map(data.flowNodeChanges),
    newFlowNodes: data.newFlowNodes,
    placedFlowNodes: data.placedFlowNodes,
    deletedFlowNodeIds: new Set(data.deletedFlowNodeIds),
    reqSeq: data.reqSeq,
    nodeSeq: data.nodeSeq,
  };
}

// ── Persistence utilities ────────────────────────────────────────────────────

export function saveWorkshopState(
  engagementId: string,
  state: Parameters<typeof serializeState>[0]
): void {
  try {
    const key = sessionKey(engagementId, state.processAreaId);
    const serialized = serializeState(state);
    localStorage.setItem(key, JSON.stringify(serialized));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function loadWorkshopState(
  engagementId: string,
  paId: string
): ReturnType<typeof deserializeState> | null {
  try {
    const key = sessionKey(engagementId, paId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as SerializedWorkshopState;
    return deserializeState(data);
  } catch {
    return null;
  }
}

export function clearWorkshopState(engagementId: string, paId: string): void {
  try {
    localStorage.removeItem(sessionKey(engagementId, paId));
  } catch {
    // silently fail
  }
}

export function hasPreviousSession(engagementId: string, paId: string): boolean {
  try {
    return localStorage.getItem(sessionKey(engagementId, paId)) !== null;
  } catch {
    return false;
  }
}

export function getSessionTimestamp(engagementId: string, paId: string): string | null {
  try {
    const raw = localStorage.getItem(sessionKey(engagementId, paId));
    if (!raw) return null;
    const data = JSON.parse(raw) as SerializedWorkshopState;
    return data.startedAt;
  } catch {
    return null;
  }
}

export function getSessionStats(engagementId: string, paId: string): WorkshopSessionSummary["stats"] | null {
  try {
    const raw = localStorage.getItem(sessionKey(engagementId, paId));
    if (!raw) return null;
    const data = JSON.parse(raw) as SerializedWorkshopState;
    const modifiedCount = data.capturedRequirements.filter(
      ([, r]) => r.dirty && r.original !== undefined
    ).length;
    const gapCount = data.flowNodeChanges.filter(([, c]) => c.gapFlagged).length;
    return {
      newRequirements: data.newRequirementIds.length,
      modifiedRequirements: modifiedCount,
      newNodes: data.newFlowNodes.length,
      placedNodes: data.placedFlowNodes.length,
      gapsFlagged: gapCount,
      deletedNodes: data.deletedFlowNodeIds.length,
    };
  } catch {
    return null;
  }
}

// ── Session index ────────────────────────────────────────────────────────────

export function saveSessionSummary(summary: WorkshopSessionSummary): void {
  try {
    const existing = loadSessionSummaries();
    existing.push(summary);
    localStorage.setItem(INDEX_KEY, JSON.stringify(existing));
  } catch {
    // silently fail
  }
}

export function loadSessionSummaries(): WorkshopSessionSummary[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorkshopSessionSummary[];
  } catch {
    return [];
  }
}

// ── Export ────────────────────────────────────────────────────────────────────

export interface WorkshopExportData {
  meta: {
    engagementId: string;
    processAreaId: string;
    processAreaName: string;
    startedAt: string;
    exportedAt: string;
  };
  changes: {
    newRequirements: WorkshopRequirement[];
    modifiedRequirements: WorkshopRequirement[];
    newFlowNodes: ProcessFlowNode[];
    placedFlowNodes: PlacedFlowNode[];
    flowNodeChanges: WorkshopFlowNodeChange[];
    deletedFlowNodeIds: string[];
  };
  statistics: WorkshopSessionSummary["stats"];
}

export function exportSessionJSON(
  engagementId: string,
  paId: string,
  state: Parameters<typeof serializeState>[0]
): void {
  const newReqs = state.newRequirementIds
    .map((id) => state.capturedRequirements.get(id))
    .filter((r): r is WorkshopRequirement => r !== undefined);

  const modifiedReqs = [...state.capturedRequirements.values()].filter(
    (r) => r.dirty && r.original !== undefined
  );

  const gapCount = [...state.flowNodeChanges.values()].filter((c) => c.gapFlagged).length;

  const exportData: WorkshopExportData = {
    meta: {
      engagementId,
      processAreaId: state.processAreaId,
      processAreaName: state.processAreaName,
      startedAt: state.startedAt,
      exportedAt: new Date().toISOString(),
    },
    changes: {
      newRequirements: newReqs,
      modifiedRequirements: modifiedReqs,
      newFlowNodes: state.newFlowNodes,
      placedFlowNodes: state.placedFlowNodes,
      flowNodeChanges: [...state.flowNodeChanges.values()],
      deletedFlowNodeIds: [...state.deletedFlowNodeIds],
    },
    statistics: {
      newRequirements: state.newRequirementIds.length,
      modifiedRequirements: modifiedReqs.length,
      newNodes: state.newFlowNodes.length,
      placedNodes: state.placedFlowNodes.length,
      gapsFlagged: gapCount,
      deletedNodes: state.deletedFlowNodeIds.size,
    },
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `workshop-${paId}-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
