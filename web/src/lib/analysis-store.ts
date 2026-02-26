"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AnalysisPhase = "needs_data" | "ready" | "running" | "complete";

export interface AnalysisEntry {
  /** Raw markdown/text output from the agent */
  output: string;
  /** Tool calls that completed during this run */
  toolBadges: string[];
  /** Timestamp of completion */
  completedAt: string;
}

export interface AnalysisState {
  /** Primary analysis result */
  primary: AnalysisEntry | null;
  /** Follow-up results appended after primary */
  followUps: AnalysisEntry[];
}

interface AnalysisStoreState {
  /** Analysis state keyed by `{engagementId}:{deliverableId}` */
  analyses: Record<string, AnalysisState>;

  /** Get analysis for a deliverable */
  getAnalysis: (engagementId: string, deliverableId: string) => AnalysisState | null;

  /** Save primary analysis result */
  savePrimary: (
    engagementId: string,
    deliverableId: string,
    entry: AnalysisEntry
  ) => void;

  /** Append a follow-up result */
  appendFollowUp: (
    engagementId: string,
    deliverableId: string,
    entry: AnalysisEntry
  ) => void;

  /** Clear analysis (for re-run) */
  clearAnalysis: (engagementId: string, deliverableId: string) => void;
}

function makeKey(engagementId: string, deliverableId: string): string {
  return `${engagementId}:${deliverableId}`;
}

export const useAnalysisStore = create<AnalysisStoreState>()(
  persist(
    (set, get) => ({
      analyses: {},

      getAnalysis: (engagementId, deliverableId) => {
        return get().analyses[makeKey(engagementId, deliverableId)] ?? null;
      },

      savePrimary: (engagementId, deliverableId, entry) =>
        set((state) => ({
          analyses: {
            ...state.analyses,
            [makeKey(engagementId, deliverableId)]: {
              primary: entry,
              followUps: [],
            },
          },
        })),

      appendFollowUp: (engagementId, deliverableId, entry) =>
        set((state) => {
          const key = makeKey(engagementId, deliverableId);
          const existing = state.analyses[key];
          if (!existing) return state;
          return {
            analyses: {
              ...state.analyses,
              [key]: {
                ...existing,
                followUps: [...existing.followUps, entry],
              },
            },
          };
        }),

      clearAnalysis: (engagementId, deliverableId) =>
        set((state) => {
          const next = { ...state.analyses };
          delete next[makeKey(engagementId, deliverableId)];
          return { analyses: next };
        }),
    }),
    {
      name: "fta-analysis-store",
    }
  )
);
