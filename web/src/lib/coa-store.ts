"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── COA Domain Types ─────────────────────────────────────────────────────────

export interface COACodeBlock {
  id: string;
  range: string;
  account_type: string;
  naic_alignment: string;
  count: number;
  notes: string;
}

export interface COAAccountGroup {
  id: string;
  group_code: string;
  name: string;
  naic_schedule_line: string;
  account_count: number;
  notes: string;
}

export interface COADimension {
  id: string;
  dimension: string;
  fill_rate: number;
  unique_values: number;
  mandatory: boolean;
  key_values: string;
  reporting_purpose: string;
  issues: string;
}

export type DecisionStatus = "pending" | "approved" | "rejected";

export interface COADecision {
  id: string;
  title: string;
  context: string;
  recommendation: string;
  alternative: string;
  impact: string;
  status: DecisionStatus;
  consultant_notes: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface COADesignData {
  summary: string;
  code_blocks: Omit<COACodeBlock, "id" | "notes">[];
  account_groups: Omit<COAAccountGroup, "id">[];
  dimensions: Omit<COADimension, "id">[];
  decisions: Omit<COADecision, "id" | "status" | "consultant_notes">[];
}

// ── Store State ──────────────────────────────────────────────────────────────

type TabId = "code_blocks" | "account_groups" | "dimensions" | "decisions";

interface COAStoreState {
  // Data keyed by engagement:deliverable
  stores: Record<
    string,
    {
      code_blocks: COACodeBlock[];
      account_groups: COAAccountGroup[];
      dimensions: COADimension[];
      decisions: COADecision[];
      summary: string;
      seededAt: string | null;
      modifiedAt: string | null;
      summaryCollapsed: boolean;
      chatMessages: Record<TabId, ChatMessage[]>;
    }
  >;

  // Accessors
  getStore: (key: string) => COAStoreState["stores"][string] | null;
  isSeeded: (key: string) => boolean;

  // Seed from agent output
  seedFromAgent: (key: string, data: COADesignData) => void;

  // CRUD — Code Blocks
  updateCodeBlock: (key: string, id: string, updates: Partial<COACodeBlock>) => void;
  addCodeBlock: (key: string) => void;
  deleteCodeBlock: (key: string, id: string) => void;

  // CRUD — Account Groups
  updateAccountGroup: (key: string, id: string, updates: Partial<COAAccountGroup>) => void;
  addAccountGroup: (key: string) => void;
  deleteAccountGroup: (key: string, id: string) => void;

  // CRUD — Dimensions
  updateDimension: (key: string, id: string, updates: Partial<COADimension>) => void;
  addDimension: (key: string) => void;
  deleteDimension: (key: string, id: string) => void;

  // CRUD — Decisions
  updateDecision: (key: string, id: string, updates: Partial<COADecision>) => void;

  // Summary
  toggleSummaryCollapsed: (key: string) => void;

  // Chat
  addChatMessage: (key: string, tab: TabId, message: Omit<ChatMessage, "id" | "timestamp">) => void;

  // Re-seed (clear)
  clearStore: (key: string) => void;
}

function makeKey(engagementId: string, deliverableId: string): string {
  return `${engagementId}:${deliverableId}`;
}

let idCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

function emptyStoreEntry(): COAStoreState["stores"][string] {
  return {
    code_blocks: [],
    account_groups: [],
    dimensions: [],
    decisions: [],
    summary: "",
    seededAt: null,
    modifiedAt: null,
    summaryCollapsed: false,
    chatMessages: {
      code_blocks: [],
      account_groups: [],
      dimensions: [],
      decisions: [],
    },
  };
}

function touchModified(
  state: COAStoreState,
  key: string
): COAStoreState["stores"] {
  const existing = state.stores[key];
  if (!existing) return state.stores;
  return {
    ...state.stores,
    [key]: { ...existing, modifiedAt: new Date().toISOString() },
  };
}

export const useCOAStore = create<COAStoreState>()(
  persist(
    (set, get) => ({
      stores: {},

      getStore: (key) => get().stores[key] ?? null,

      isSeeded: (key) => {
        const store = get().stores[key];
        return !!store?.seededAt;
      },

      seedFromAgent: (key, data) =>
        set((state) => {
          const now = new Date().toISOString();
          const entry: COAStoreState["stores"][string] = {
            ...emptyStoreEntry(),
            summary: data.summary,
            seededAt: now,
            modifiedAt: now,
            code_blocks: data.code_blocks.map((cb, i) => ({
              id: nextId("cb"),
              range: cb.range,
              account_type: cb.account_type,
              naic_alignment: cb.naic_alignment,
              count: cb.count,
              notes: "",
            })),
            account_groups: data.account_groups.map((ag) => ({
              id: nextId("ag"),
              group_code: ag.group_code,
              name: ag.name,
              naic_schedule_line: ag.naic_schedule_line,
              account_count: ag.account_count,
              notes: ag.notes,
            })),
            dimensions: data.dimensions.map((d) => ({
              id: nextId("dim"),
              dimension: d.dimension,
              fill_rate: d.fill_rate,
              unique_values: d.unique_values,
              mandatory: d.mandatory,
              key_values: d.key_values,
              reporting_purpose: d.reporting_purpose,
              issues: d.issues,
            })),
            decisions: data.decisions.map((dec) => ({
              id: nextId("dec"),
              title: dec.title,
              context: dec.context,
              recommendation: dec.recommendation,
              alternative: dec.alternative,
              impact: dec.impact,
              status: "pending" as const,
              consultant_notes: "",
            })),
          };
          return { stores: { ...state.stores, [key]: entry } };
        }),

      // ── Code Blocks ────────────────────────────────────────────────────
      updateCodeBlock: (key, id, updates) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...touchModified(state, key),
              [key]: {
                ...state.stores[key],
                modifiedAt: new Date().toISOString(),
                code_blocks: store.code_blocks.map((cb) =>
                  cb.id === id ? { ...cb, ...updates } : cb
                ),
              },
            },
          };
        }),

      addCodeBlock: (key) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          const newBlock: COACodeBlock = {
            id: nextId("cb"),
            range: "",
            account_type: "",
            naic_alignment: "",
            count: 0,
            notes: "",
          };
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                modifiedAt: new Date().toISOString(),
                code_blocks: [...store.code_blocks, newBlock],
              },
            },
          };
        }),

      deleteCodeBlock: (key, id) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                modifiedAt: new Date().toISOString(),
                code_blocks: store.code_blocks.filter((cb) => cb.id !== id),
              },
            },
          };
        }),

      // ── Account Groups ─────────────────────────────────────────────────
      updateAccountGroup: (key, id, updates) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                modifiedAt: new Date().toISOString(),
                account_groups: store.account_groups.map((ag) =>
                  ag.id === id ? { ...ag, ...updates } : ag
                ),
              },
            },
          };
        }),

      addAccountGroup: (key) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          const newGroup: COAAccountGroup = {
            id: nextId("ag"),
            group_code: "",
            name: "",
            naic_schedule_line: "",
            account_count: 0,
            notes: "",
          };
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                modifiedAt: new Date().toISOString(),
                account_groups: [...store.account_groups, newGroup],
              },
            },
          };
        }),

      deleteAccountGroup: (key, id) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                modifiedAt: new Date().toISOString(),
                account_groups: store.account_groups.filter((ag) => ag.id !== id),
              },
            },
          };
        }),

      // ── Dimensions ─────────────────────────────────────────────────────
      updateDimension: (key, id, updates) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                modifiedAt: new Date().toISOString(),
                dimensions: store.dimensions.map((d) =>
                  d.id === id ? { ...d, ...updates } : d
                ),
              },
            },
          };
        }),

      addDimension: (key) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          const newDim: COADimension = {
            id: nextId("dim"),
            dimension: "",
            fill_rate: 0,
            unique_values: 0,
            mandatory: false,
            key_values: "",
            reporting_purpose: "",
            issues: "",
          };
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                modifiedAt: new Date().toISOString(),
                dimensions: [...store.dimensions, newDim],
              },
            },
          };
        }),

      deleteDimension: (key, id) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                modifiedAt: new Date().toISOString(),
                dimensions: store.dimensions.filter((d) => d.id !== id),
              },
            },
          };
        }),

      // ── Decisions ──────────────────────────────────────────────────────
      updateDecision: (key, id, updates) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                modifiedAt: new Date().toISOString(),
                decisions: store.decisions.map((d) =>
                  d.id === id ? { ...d, ...updates } : d
                ),
              },
            },
          };
        }),

      // ── Summary ────────────────────────────────────────────────────────
      toggleSummaryCollapsed: (key) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                summaryCollapsed: !store.summaryCollapsed,
              },
            },
          };
        }),

      // ── Chat ───────────────────────────────────────────────────────────
      addChatMessage: (key, tab, message) =>
        set((state) => {
          const store = state.stores[key];
          if (!store) return state;
          const msg: ChatMessage = {
            ...message,
            id: nextId("msg"),
            timestamp: new Date().toISOString(),
          };
          return {
            stores: {
              ...state.stores,
              [key]: {
                ...store,
                chatMessages: {
                  ...store.chatMessages,
                  [tab]: [...(store.chatMessages[tab] ?? []), msg],
                },
              },
            },
          };
        }),

      // ── Clear ──────────────────────────────────────────────────────────
      clearStore: (key) =>
        set((state) => {
          const next = { ...state.stores };
          delete next[key];
          return { stores: next };
        }),
    }),
    {
      name: "fta-coa-store",
    }
  )
);

// ── Parser ───────────────────────────────────────────────────────────────────

export function parseCOAOutput(output: string): COADesignData | null {
  const match = output.match(/<coa_design>([\s\S]*?)<\/coa_design>/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]) as COADesignData;
    // Basic validation
    if (
      !parsed.summary ||
      !Array.isArray(parsed.code_blocks) ||
      !Array.isArray(parsed.account_groups) ||
      !Array.isArray(parsed.dimensions) ||
      !Array.isArray(parsed.decisions)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// Convenience: make a store key from route params
export function coaStoreKey(engagementId: string, deliverableId: string): string {
  return `${engagementId}:${deliverableId}`;
}
