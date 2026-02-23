import { create } from "zustand";
import type {
  BusinessRequirement,
  BRTag,
  BRSegment,
  BRStatus,
  ProcessFlowNode,
} from "./mock-data";

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

  // Capture state
  capturedRequirements: Map<string, WorkshopRequirement>;
  newRequirementIds: string[];
  flowNodeChanges: Map<string, WorkshopFlowNodeChange>;
  newFlowNodes: ProcessFlowNode[];
  placedFlowNodes: PlacedFlowNode[];
  deletedFlowNodeIds: Set<string>;
  selectedRequirementId: string | null;

  // Session actions
  startWorkshop: (processAreaId: string, processAreaName: string) => void;
  endWorkshop: () => void;
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
}

// ── ID generation ────────────────────────────────────────────────────────────

let reqSeq = 1;
let nodeSeq = 1;

function genReqId(paId: string): string {
  const num = paId.replace("PA-", "");
  return `BR-${num}.W.${String(reqSeq++).padStart(3, "0")}`;
}

function genNodeId(): string {
  return `WN-${String(nodeSeq++).padStart(3, "0")}`;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useWorkshopStore = create<WorkshopState>((set, get) => ({
  workshopMode: false,
  workshopSession: null,

  // Capture state
  capturedRequirements: new Map(),
  newRequirementIds: [],
  flowNodeChanges: new Map(),
  newFlowNodes: [],
  placedFlowNodes: [],
  deletedFlowNodeIds: new Set(),
  selectedRequirementId: null,

  // ── Session actions ──────────────────────────────────────────────────────

  startWorkshop: (processAreaId: string, processAreaName: string) => {
    // Reset sequences on new session
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
      // Reset capture state
      capturedRequirements: new Map(),
      newRequirementIds: [],
      flowNodeChanges: new Map(),
      newFlowNodes: [],
      placedFlowNodes: [],
      deletedFlowNodeIds: new Set(),
      selectedRequirementId: null,
    });
  },

  endWorkshop: () => {
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
      // Already captured — update current
      const updated = { ...existing.current, ...updates };
      next.set(id, { ...existing, current: updated, dirty: true });
    } else {
      // First edit of a base requirement — we don't have the original here,
      // caller should provide full current via initial snapshot
      // This path handles the case where we're editing a base req for the first time
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
    // If not captured yet, caller should snapshot first via updateRequirement

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
      // Toggle off — clear gap flag and notes
      next.set(nodeId, { ...existing, nodeId, gapFlagged: false, gapNotes: undefined });
    } else {
      // Flag gap with notes
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

    // Assign the role/swimlane from the target node
    const placedNode: ProcessFlowNode = { ...node, role };

    set({
      // Remove from tray
      newFlowNodes: state.newFlowNodes.filter((n) => n.id !== nodeId),
      // Add to placed list
      placedFlowNodes: [...state.placedFlowNodes, { node: placedNode, afterNodeId }],
    });
  },

  deleteFlowNode: (nodeId: string) => {
    const state = get();

    // If it's a placed (workshop-added) node, remove from placedFlowNodes
    const placedIdx = state.placedFlowNodes.findIndex((p) => p.node.id === nodeId);
    if (placedIdx >= 0) {
      set({
        placedFlowNodes: state.placedFlowNodes.filter((p) => p.node.id !== nodeId),
      });
      return;
    }

    // If it's a tray node (not yet placed), remove from newFlowNodes
    const trayIdx = state.newFlowNodes.findIndex((n) => n.id === nodeId);
    if (trayIdx >= 0) {
      set({
        newFlowNodes: state.newFlowNodes.filter((n) => n.id !== nodeId),
      });
      return;
    }

    // Otherwise it's a base data node — mark as deleted
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
}));
