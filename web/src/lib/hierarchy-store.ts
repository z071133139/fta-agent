"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Perspective,
  type ClassificationTier,
  type ClassificationStatus,
  type HierarchyClassification,
  type AuditEntry,
  ALL_CLASSIFICATIONS,
} from "./mock-hierarchy-data";

// ── Store State ──────────────────────────────────────────────────────────────

interface HierarchyStoreState {
  // Data keyed by engagement:deliverable
  stores: Record<
    string,
    {
      classifications: HierarchyClassification[];
      activePerspective: Perspective;
      selectedAccountId: string | null;
      selectedFsliNodeId: string | null;
      seededAt: string | null;
    }
  >;

  // Accessors
  getStore: (key: string) => HierarchyStoreState["stores"][string] | null;
  isSeeded: (key: string) => boolean;

  // Seed from mock data
  seed: (key: string) => void;

  // Perspective
  setPerspective: (key: string, perspective: Perspective) => void;

  // Selection
  selectAccount: (key: string, accountId: string | null) => void;
  selectFsliNode: (key: string, nodeId: string | null) => void;

  // Classification actions
  approveClassification: (key: string, accountId: string, approver: string) => void;
  rejectClassification: (key: string, accountId: string, reason: string) => void;
  overrideClassification: (
    key: string,
    accountId: string,
    newFsliNodeId: string,
    reason: string,
    consultant: string
  ) => void;

  // Clear
  clearStore: (key: string) => void;
}

let idCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

function addAuditEntry(
  classification: HierarchyClassification,
  action: string,
  actor: string,
  detail: string
): HierarchyClassification {
  const entry: AuditEntry = {
    id: nextId("aud"),
    timestamp: new Date().toISOString(),
    action,
    actor,
    detail,
  };
  return {
    ...classification,
    auditTrail: [...classification.auditTrail, entry],
  };
}

export const useHierarchyStore = create<HierarchyStoreState>()(
  persist(
    (set, get) => ({
      stores: {},

      getStore: (key) => get().stores[key] ?? null,

      isSeeded: (key) => {
        const store = get().stores[key];
        return !!store?.seededAt;
      },

      seed: (key) =>
        set((state) => {
          if (state.stores[key]?.seededAt) return state;
          return {
            stores: {
              ...state.stores,
              [key]: {
                classifications: ALL_CLASSIFICATIONS.map((c) => ({ ...c })),
                activePerspective: "STAT",
                selectedAccountId: null,
                selectedFsliNodeId: null,
                seededAt: new Date().toISOString(),
              },
            },
          };
        }),

      setPerspective: (key, perspective) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: { ...store, activePerspective: perspective, selectedFsliNodeId: null },
            },
          };
        }),

      selectAccount: (key, accountId) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: { ...store, selectedAccountId: accountId },
            },
          };
        }),

      selectFsliNode: (key, nodeId) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                selectedFsliNodeId: store.selectedFsliNodeId === nodeId ? null : nodeId,
              },
            },
          };
        }),

      approveClassification: (key, accountId, approver) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                classifications: store.classifications.map((c) =>
                  c.accountId === accountId
                    ? addAuditEntry(
                        { ...c, status: "approved" },
                        "approved",
                        approver,
                        `Classification approved: ${c.fsliNodeId}`
                      )
                    : c
                ),
              },
            },
          };
        }),

      rejectClassification: (key, accountId, reason) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                classifications: store.classifications.map((c) =>
                  c.accountId === accountId
                    ? addAuditEntry(
                        { ...c, status: "rejected" },
                        "rejected",
                        "Consultant",
                        reason || "Classification rejected"
                      )
                    : c
                ),
              },
            },
          };
        }),

      overrideClassification: (key, accountId, newFsliNodeId, reason, consultant) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                classifications: store.classifications.map((c) =>
                  c.accountId === accountId
                    ? addAuditEntry(
                        { ...c, status: "manual_override", fsliNodeId: newFsliNodeId },
                        "override",
                        consultant,
                        `Overridden to ${newFsliNodeId}: ${reason}`
                      )
                    : c
                ),
              },
            },
          };
        }),

      clearStore: (key) =>
        set((state) => {
          const next = { ...state.stores };
          delete next[key];
          return { stores: next };
        }),
    }),
    {
      name: "fta-hierarchy-store",
      version: 1,
    }
  )
);

export function hierarchyStoreKey(engagementId: string, deliverableId: string): string {
  return `${engagementId}:${deliverableId}`;
}
