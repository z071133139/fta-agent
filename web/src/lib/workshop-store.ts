import { create } from "zustand";
import type {
  BusinessRequirement,
  BRTag,
  BRSegment,
  BRStatus,
  ProcessFlowNode,
} from "./mock-data";
import {
  saveWorkshopState,
  loadWorkshopState,
  clearWorkshopState,
  saveSessionSummary,
  exportSessionJSON,
  type WorkshopSessionSummary,
} from "./workshop-persistence";

// ── Capture types ────────────────────────────────────────────────────────────

export interface WorkshopRequirement {
  /** Snapshot of the original (undefined for new reqs) */
  original?: BusinessRequirement;
  /** Current edited values */
  current: BusinessRequirement;
  /** True if any field changed from original */
  dirty: boolean;
}

export interface WorkshopFlowNodeChange {
  nodeId: string;
  newLabel?: string;
  gapFlagged?: boolean;
  gapNotes?: string;
  annotation?: string;
}

export interface PlacedFlowNode {
  node: ProcessFlowNode;
  afterNodeId: string;
}

// ── Session types ────────────────────────────────────────────────────────────

interface WorkshopSession {
  facilitator: string;
  processAreaId: string;
  processAreaName: string;
  startedAt: string;
  lockedItems: Set<string>;
}

// ── Store interface ──────────────────────────────────────────────────────────

interface WorkshopState {
  workshopMode: boolean;
  workshopSession: WorkshopSession | null;
  commandPaletteOpen: boolean;

  // Capture state
  capturedRequirements: Map<string, WorkshopRequirement>;
  newRequirementIds: string[];
  flowNodeChanges: Map<string, WorkshopFlowNodeChange>;
  newFlowNodes: ProcessFlowNode[];
  placedFlowNodes: PlacedFlowNode[];
  deletedFlowNodeIds: Set<string>;
  selectedRequirementId: string | null;

  // Session actions
  startWorkshop: (processAreaId: string, processAreaName: string, opts?: { resume?: boolean; engagementId?: string }) => void;
  endWorkshop: (engagementId?: string) => void;
  lockItem: (itemId: string) => void;
  unlockItem: (itemId: string) => void;

  // Capture actions
  addRequirement: (text: string, tag?: BRTag, segment?: BRSegment) => void;
  updateRequirement: (id: string, updates: Partial<BusinessRequirement>) => void;
  toggleRequirementGap: (id: string) => void;
  selectRequirement: (id: string | null) => void;
  recordFlowNodeEdit: (nodeId: string, newLabel: string) => void;
  flagFlowNodeGap: (nodeId: string, notes?: string) => void;
  addFlowNode: (label: string) => void;
  placeFlowNode: (nodeId: string, afterNodeId: string, role: string) => void;
  deleteFlowNode: (nodeId: string) => void;
  annotateFlowNode: (nodeId: string, text: string) => void;
  getCaptureCount: () => number;

  // Command palette
  toggleCommandPalette: () => void;

  // Export
  exportJSON: (engagementId: string) => void;
}

// ── ID generation ────────────────────────────────────────────────────────────

let reqSeq = 1;
let nodeSeq = 1;

export function getReqSeq(): number { return reqSeq; }
export function getNodeSeq(): number { return nodeSeq; }

function genReqId(paId: string): string {
  const num = paId.replace("PA-", "");
  return `BR-${num}.W.${String(reqSeq++).padStart(3, "0")}`;
}

function genNodeId(): string {
  return `WN-${String(nodeSeq++).padStart(3, "0")}`;
}

// ── Auto-save debounce ───────────────────────────────────────────────────────

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let currentEngagementId: string | null = null;

function scheduleSave(state: WorkshopState) {
  if (!state.workshopMode || !state.workshopSession || !currentEngagementId) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const s = state;
    if (!s.workshopSession) return;
    saveWorkshopState(currentEngagementId!, {
      processAreaId: s.workshopSession.processAreaId,
      processAreaName: s.workshopSession.processAreaName,
      startedAt: s.workshopSession.startedAt,
      capturedRequirements: s.capturedRequirements,
      newRequirementIds: s.newRequirementIds,
      flowNodeChanges: s.flowNodeChanges,
      newFlowNodes: s.newFlowNodes,
      placedFlowNodes: s.placedFlowNodes,
      deletedFlowNodeIds: s.deletedFlowNodeIds,
      reqSeq,
      nodeSeq,
    });
  }, 500);
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useWorkshopStore = create<WorkshopState>((set, get) => {
  // Subscribe to state changes for auto-save
  const store = {
    workshopMode: false,
    workshopSession: null,
    commandPaletteOpen: false,

    // Capture state
    capturedRequirements: new Map(),
    newRequirementIds: [],
    flowNodeChanges: new Map(),
    newFlowNodes: [],
    placedFlowNodes: [],
    deletedFlowNodeIds: new Set(),
    selectedRequirementId: null,

    // ── Session actions ──────────────────────────────────────────────────────

    startWorkshop: (processAreaId: string, processAreaName: string, opts?: { resume?: boolean; engagementId?: string }) => {
      const engId = opts?.engagementId ?? "default";
      currentEngagementId = engId;

      if (opts?.resume) {
        const saved = loadWorkshopState(engId, processAreaId);
        if (saved) {
          reqSeq = saved.reqSeq;
          nodeSeq = saved.nodeSeq;
          set({
            workshopMode: true,
            workshopSession: {
              facilitator: "current-user",
              processAreaId: saved.processAreaId,
              processAreaName: saved.processAreaName,
              startedAt: saved.startedAt,
              lockedItems: new Set(),
            },
            capturedRequirements: saved.capturedRequirements,
            newRequirementIds: saved.newRequirementIds,
            flowNodeChanges: saved.flowNodeChanges,
            newFlowNodes: saved.newFlowNodes,
            placedFlowNodes: saved.placedFlowNodes,
            deletedFlowNodeIds: saved.deletedFlowNodeIds,
            selectedRequirementId: null,
          });
          return;
        }
      }

      // Fresh start
      reqSeq = 1;
      nodeSeq = 1;
      set({
        workshopMode: true,
        workshopSession: {
          facilitator: "current-user",
          processAreaId,
          processAreaName,
          startedAt: new Date().toISOString(),
          lockedItems: new Set(),
        },
        capturedRequirements: new Map(),
        newRequirementIds: [],
        flowNodeChanges: new Map(),
        newFlowNodes: [],
        placedFlowNodes: [],
        deletedFlowNodeIds: new Set(),
        selectedRequirementId: null,
      });
    },

    endWorkshop: (engagementId?: string) => {
      const state = get();
      const session = state.workshopSession;
      const engId = engagementId ?? currentEngagementId ?? "default";

      if (session) {
        // Save final state
        saveWorkshopState(engId, {
          processAreaId: session.processAreaId,
          processAreaName: session.processAreaName,
          startedAt: session.startedAt,
          capturedRequirements: state.capturedRequirements,
          newRequirementIds: state.newRequirementIds,
          flowNodeChanges: state.flowNodeChanges,
          newFlowNodes: state.newFlowNodes,
          placedFlowNodes: state.placedFlowNodes,
          deletedFlowNodeIds: state.deletedFlowNodeIds,
          reqSeq,
          nodeSeq,
        });

        // Save session summary to index
        const modifiedCount = [...state.capturedRequirements.values()].filter(
          (r) => r.dirty && r.original !== undefined
        ).length;
        const gapCount = [...state.flowNodeChanges.values()].filter((c) => c.gapFlagged).length;

        const summary: WorkshopSessionSummary = {
          engagementId: engId,
          processAreaId: session.processAreaId,
          processAreaName: session.processAreaName,
          startedAt: session.startedAt,
          endedAt: new Date().toISOString(),
          stats: {
            newRequirements: state.newRequirementIds.length,
            modifiedRequirements: modifiedCount,
            newNodes: state.newFlowNodes.length,
            placedNodes: state.placedFlowNodes.length,
            gapsFlagged: gapCount,
            deletedNodes: state.deletedFlowNodeIds.size,
          },
        };
        saveSessionSummary(summary);
      }

      currentEngagementId = null;

      set({
        workshopMode: false,
        workshopSession: null,
        capturedRequirements: new Map(),
        newRequirementIds: [],
        flowNodeChanges: new Map(),
        newFlowNodes: [],
        placedFlowNodes: [],
        deletedFlowNodeIds: new Set(),
        selectedRequirementId: null,
      });
    },

    lockItem: (itemId: string) => {
      const session = get().workshopSession;
      if (!session) return;
      const next = new Set(session.lockedItems);
      next.add(itemId);
      set({ workshopSession: { ...session, lockedItems: next } });
    },

    unlockItem: (itemId: string) => {
      const session = get().workshopSession;
      if (!session) return;
      const next = new Set(session.lockedItems);
      next.delete(itemId);
      set({ workshopSession: { ...session, lockedItems: next } });
    },

    // ── Capture actions ──────────────────────────────────────────────────────

    addRequirement: (text: string, tag?: BRTag, segment?: BRSegment) => {
      const session = get().workshopSession;
      if (!session) return;

      const id = genReqId(session.processAreaId);
      const req: BusinessRequirement = {
        id,
        pa_id: session.processAreaId,
        sp_id: `${session.processAreaId}.W`,
        tag: tag ?? "OPS",
        segment: segment ?? "All",
        text,
        status: "draft" as BRStatus,
      };

      const next = new Map(get().capturedRequirements);
      next.set(id, { current: req, dirty: true });

      set({
        capturedRequirements: next,
        newRequirementIds: [...get().newRequirementIds, id],
      });
    },

    updateRequirement: (id: string, updates: Partial<BusinessRequirement>) => {
      const captured = get().capturedRequirements;
      const existing = captured.get(id);

      const next = new Map(captured);

      if (existing) {
        const updated = { ...existing.current, ...updates };
        next.set(id, { ...existing, current: updated, dirty: true });
      } else {
        next.set(id, {
          current: updates as BusinessRequirement,
          dirty: true,
        });
      }

      set({ capturedRequirements: next });
    },

    toggleRequirementGap: (id: string) => {
      const captured = get().capturedRequirements;
      const existing = captured.get(id);
      const next = new Map(captured);

      if (existing) {
        const currentStatus = existing.current.status;
        const newStatus: BRStatus = currentStatus === "deferred" ? "draft" : "deferred";
        next.set(id, {
          ...existing,
          current: { ...existing.current, status: newStatus },
          dirty: true,
        });
      }

      set({ capturedRequirements: next });
    },

    selectRequirement: (id: string | null) => {
      set({ selectedRequirementId: id });
    },

    recordFlowNodeEdit: (nodeId: string, newLabel: string) => {
      const next = new Map(get().flowNodeChanges);
      const existing = next.get(nodeId);
      next.set(nodeId, { ...existing, nodeId, newLabel });
      set({ flowNodeChanges: next });
    },

    flagFlowNodeGap: (nodeId: string, notes?: string) => {
      const next = new Map(get().flowNodeChanges);
      const existing = next.get(nodeId);
      const currentGap = existing?.gapFlagged ?? false;

      if (currentGap && notes === undefined) {
        next.set(nodeId, { ...existing, nodeId, gapFlagged: false, gapNotes: undefined });
      } else {
        next.set(nodeId, { ...existing, nodeId, gapFlagged: true, gapNotes: notes ?? existing?.gapNotes });
      }
      set({ flowNodeChanges: next });
    },

    addFlowNode: (label: string) => {
      const node: ProcessFlowNode = {
        id: genNodeId(),
        type: "task",
        label,
        status: "client_overlay",
      };
      set({ newFlowNodes: [...get().newFlowNodes, node] });
    },

    placeFlowNode: (nodeId: string, afterNodeId: string, role: string) => {
      const state = get();
      const node = state.newFlowNodes.find((n) => n.id === nodeId);
      if (!node) return;

      const placedNode: ProcessFlowNode = { ...node, role };

      set({
        newFlowNodes: state.newFlowNodes.filter((n) => n.id !== nodeId),
        placedFlowNodes: [...state.placedFlowNodes, { node: placedNode, afterNodeId }],
      });
    },

    deleteFlowNode: (nodeId: string) => {
      const state = get();

      const placedIdx = state.placedFlowNodes.findIndex((p) => p.node.id === nodeId);
      if (placedIdx >= 0) {
        set({
          placedFlowNodes: state.placedFlowNodes.filter((p) => p.node.id !== nodeId),
        });
        return;
      }

      const trayIdx = state.newFlowNodes.findIndex((n) => n.id === nodeId);
      if (trayIdx >= 0) {
        set({
          newFlowNodes: state.newFlowNodes.filter((n) => n.id !== nodeId),
        });
        return;
      }

      const next = new Set(state.deletedFlowNodeIds);
      next.add(nodeId);
      set({ deletedFlowNodeIds: next });
    },

    annotateFlowNode: (nodeId: string, text: string) => {
      const next = new Map(get().flowNodeChanges);
      const existing = next.get(nodeId);
      next.set(nodeId, { ...existing, nodeId, annotation: text });
      set({ flowNodeChanges: next });
    },

    getCaptureCount: () => {
      const state = get();
      return (
        state.newRequirementIds.length +
        [...state.capturedRequirements.values()].filter(
          (r) => r.dirty && r.original !== undefined
        ).length +
        state.flowNodeChanges.size +
        state.newFlowNodes.length
      );
    },

    // ── Command palette ──────────────────────────────────────────────────────

    toggleCommandPalette: () => {
      set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen }));
    },

    // ── Export ───────────────────────────────────────────────────────────────

    exportJSON: (engagementId: string) => {
      const state = get();
      const session = state.workshopSession;
      if (!session) return;

      exportSessionJSON(engagementId, session.processAreaId, {
        processAreaId: session.processAreaId,
        processAreaName: session.processAreaName,
        startedAt: session.startedAt,
        capturedRequirements: state.capturedRequirements,
        newRequirementIds: state.newRequirementIds,
        flowNodeChanges: state.flowNodeChanges,
        newFlowNodes: state.newFlowNodes,
        placedFlowNodes: state.placedFlowNodes,
        deletedFlowNodeIds: state.deletedFlowNodeIds,
        reqSeq,
        nodeSeq,
      });
    },
  } satisfies WorkshopState;

  return store;
});

// Auto-save subscription
useWorkshopStore.subscribe((state) => {
  scheduleSave(state);
});
