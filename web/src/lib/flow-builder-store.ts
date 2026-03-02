/**
 * Flow Builder Store — Zustand + persist
 *
 * Manages multi-turn conversation state and process flow data for the
 * ProcessFlowBuilder workspace. Keyed by engagementId for session persistence.
 *
 * Two separate concepts:
 * - `sessions`: active building session (one per engagement, cleared on accept/discard)
 * - `acceptedFlows`: completed flows persisted for the index (accumulate over time)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProcessFlowData } from "./mock-data";

// ── Types ───────────────────────────────────────────────────────────────────

export interface FlowBuilderMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  hasFlowUpdate: boolean;
  timestamp: string;
}

export interface FlowBuilderSession {
  engagementId: string;
  messages: FlowBuilderMessage[];
  currentFlow: ProcessFlowData | null;
  status: "building" | "accepted";
  createdAt: string;
}

export interface AcceptedFlow {
  id: string;
  engagementId: string;
  flow: ProcessFlowData;
  acceptedAt: string;
}

interface FlowBuilderState {
  sessions: Record<string, FlowBuilderSession>;
  acceptedFlows: Record<string, AcceptedFlow[]>;

  getSession: (engId: string) => FlowBuilderSession | null;
  getAcceptedFlows: (engId: string) => AcceptedFlow[];
  startSession: (engId: string) => void;
  addUserMessage: (engId: string, content: string) => void;
  addAssistantMessage: (engId: string, content: string, hasFlowUpdate: boolean) => void;
  updateFlow: (engId: string, flow: ProcessFlowData) => void;
  acceptFlow: (engId: string) => void;
  clearSession: (engId: string) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

let _msgCounter = 0;
function nextMsgId(): string {
  _msgCounter += 1;
  return `fb-msg-${Date.now()}-${_msgCounter}`;
}

let _flowCounter = 0;
function nextFlowId(): string {
  _flowCounter += 1;
  return `custom-flow-${Date.now()}-${_flowCounter}`;
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useFlowBuilderStore = create<FlowBuilderState>()(
  persist(
    (set, get) => ({
      sessions: {},
      acceptedFlows: {},

      getSession: (engId: string) => get().sessions[engId] ?? null,

      getAcceptedFlows: (engId: string) => get().acceptedFlows[engId] ?? [],

      startSession: (engId: string) =>
        set((s) => ({
          sessions: {
            ...s.sessions,
            [engId]: {
              engagementId: engId,
              messages: [],
              currentFlow: null,
              status: "building",
              createdAt: new Date().toISOString(),
            },
          },
        })),

      addUserMessage: (engId: string, content: string) =>
        set((s) => {
          const session = s.sessions[engId];
          if (!session) return s;
          return {
            sessions: {
              ...s.sessions,
              [engId]: {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    id: nextMsgId(),
                    role: "user",
                    content,
                    hasFlowUpdate: false,
                    timestamp: new Date().toISOString(),
                  },
                ],
              },
            },
          };
        }),

      addAssistantMessage: (engId: string, content: string, hasFlowUpdate: boolean) =>
        set((s) => {
          const session = s.sessions[engId];
          if (!session) return s;
          return {
            sessions: {
              ...s.sessions,
              [engId]: {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    id: nextMsgId(),
                    role: "assistant",
                    content,
                    hasFlowUpdate,
                    timestamp: new Date().toISOString(),
                  },
                ],
              },
            },
          };
        }),

      updateFlow: (engId: string, flow: ProcessFlowData) =>
        set((s) => {
          const session = s.sessions[engId];
          if (!session) return s;
          return {
            sessions: {
              ...s.sessions,
              [engId]: {
                ...session,
                currentFlow: flow,
              },
            },
          };
        }),

      acceptFlow: (engId: string) =>
        set((s) => {
          const session = s.sessions[engId];
          if (!session?.currentFlow) return s;

          // Move current flow to accepted list
          const accepted: AcceptedFlow = {
            id: nextFlowId(),
            engagementId: engId,
            flow: session.currentFlow,
            acceptedAt: new Date().toISOString(),
          };

          const existing = s.acceptedFlows[engId] ?? [];

          // Clear the active session (ready for next build)
          const nextSessions = { ...s.sessions };
          delete nextSessions[engId];

          return {
            sessions: nextSessions,
            acceptedFlows: {
              ...s.acceptedFlows,
              [engId]: [...existing, accepted],
            },
          };
        }),

      clearSession: (engId: string) =>
        set((s) => {
          const next = { ...s.sessions };
          delete next[engId];
          return { sessions: next };
        }),
    }),
    {
      name: "fta-flow-builder",
    }
  )
);
