import { create } from "zustand";
import {
  getScopingThemes,
  getContextTile,
  getQuestionsForMode,
  type ScopingTheme,
  type ScopingMode,
} from "./scoping-data";

// ── Types ────────────────────────────────────────────────────────────────────

export type ThemeStatus = "untouched" | "exploring" | "captured" | "deferred";
export type ScopeSignal = "in" | "out" | "explore";
export type PriorityLevel = "high" | "medium" | "low";
export type PainLevel = "none" | "moderate" | "significant" | "critical";

export interface QuestionResponse {
  notes: string;
  answered: boolean;
}

export interface ThemeCapture {
  status: ThemeStatus;
  scopeSignal: ScopeSignal | null;
  priority: PriorityLevel | null;
  painLevel: PainLevel | null;
  notes: string;
  questionResponses: Record<string, QuestionResponse>;
}

function emptyThemeCapture(): ThemeCapture {
  return {
    status: "untouched",
    scopeSignal: null,
    priority: null,
    painLevel: null,
    notes: "",
    questionResponses: {},
  };
}

// ── Store ────────────────────────────────────────────────────────────────────

interface ScopingState {
  pursuitId: string;
  clientName: string;
  sessionDate: string;

  themes: Record<string, ThemeCapture>;
  expandedThemeId: string | null;
  focusedThemeIndex: number; // 0-6 for keyboard nav
  activeQuestionIndex: number; // within expanded theme
  scopingMode: ScopingMode;

  // Actions
  setClientName: (name: string) => void;
  setScopingMode: (mode: ScopingMode) => void;
  expandTheme: (themeId: string) => void;
  collapseTheme: () => void;
  setFocusedTheme: (index: number) => void;
  nextTheme: () => void;
  prevTheme: () => void;

  setScopeSignal: (themeId: string, signal: ScopeSignal) => void;
  setPriority: (themeId: string, priority: PriorityLevel) => void;
  setPainLevel: (themeId: string, pain: PainLevel) => void;
  setThemeNotes: (themeId: string, notes: string) => void;
  setThemeStatus: (themeId: string, status: ThemeStatus) => void;

  setQuestionNotes: (themeId: string, questionId: string, notes: string) => void;
  markQuestionAnswered: (themeId: string, questionId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;

  exportJSON: () => string;
}

export const useScopingStore = create<ScopingState>((set, get) => {
  const contextTile = getContextTile();
  const themes = getScopingThemes();
  const allTiles = [contextTile, ...themes];
  const initialCaptures: Record<string, ThemeCapture> = {};
  for (const t of allTiles) {
    initialCaptures[t.id] = emptyThemeCapture();
  }

  return {
    pursuitId: "pursuit-001",
    clientName: "",
    sessionDate: new Date().toISOString().slice(0, 10),

    themes: initialCaptures,
    expandedThemeId: null,
    focusedThemeIndex: 0,
    activeQuestionIndex: 0,
    scopingMode: "rapid",

    setClientName: (name) => set({ clientName: name }),
    setScopingMode: (mode) => set({ scopingMode: mode, activeQuestionIndex: 0 }),

    expandTheme: (themeId) => {
      const state = get();
      const capture = state.themes[themeId];
      if (capture && capture.status === "untouched") {
        set({
          expandedThemeId: themeId,
          activeQuestionIndex: 0,
          themes: {
            ...state.themes,
            [themeId]: { ...capture, status: "exploring" },
          },
        });
      } else {
        set({ expandedThemeId: themeId, activeQuestionIndex: 0 });
      }
    },

    collapseTheme: () => {
      const state = get();
      const tid = state.expandedThemeId;
      if (!tid) return;
      const capture = state.themes[tid];
      if (!capture) { set({ expandedThemeId: null }); return; }

      // Auto-mark as captured if any data was entered
      const hasData =
        capture.scopeSignal !== null ||
        capture.priority !== null ||
        capture.painLevel !== null ||
        capture.notes.length > 0 ||
        Object.values(capture.questionResponses).some((r) => r.notes.length > 0);

      const newStatus: ThemeStatus =
        capture.status === "deferred" ? "deferred" :
        hasData ? "captured" :
        "untouched";

      set({
        expandedThemeId: null,
        themes: {
          ...state.themes,
          [tid]: { ...capture, status: newStatus },
        },
      });
    },

    setFocusedTheme: (index) => set({ focusedThemeIndex: Math.max(0, Math.min(6, index)) }),
    nextTheme: () => set((s) => ({ focusedThemeIndex: Math.min(6, s.focusedThemeIndex + 1) })),
    prevTheme: () => set((s) => ({ focusedThemeIndex: Math.max(0, s.focusedThemeIndex - 1) })),

    setScopeSignal: (themeId, signal) =>
      set((s) => ({
        themes: {
          ...s.themes,
          [themeId]: { ...s.themes[themeId]!, scopeSignal: signal },
        },
      })),

    setPriority: (themeId, priority) =>
      set((s) => ({
        themes: {
          ...s.themes,
          [themeId]: { ...s.themes[themeId]!, priority },
        },
      })),

    setPainLevel: (themeId, pain) =>
      set((s) => ({
        themes: {
          ...s.themes,
          [themeId]: { ...s.themes[themeId]!, painLevel: pain },
        },
      })),

    setThemeNotes: (themeId, notes) =>
      set((s) => ({
        themes: {
          ...s.themes,
          [themeId]: { ...s.themes[themeId]!, notes },
        },
      })),

    setThemeStatus: (themeId, status) =>
      set((s) => ({
        themes: {
          ...s.themes,
          [themeId]: { ...s.themes[themeId]!, status },
        },
      })),

    setQuestionNotes: (themeId, questionId, notes) =>
      set((s) => {
        const capture = s.themes[themeId];
        if (!capture) return s;
        return {
          themes: {
            ...s.themes,
            [themeId]: {
              ...capture,
              questionResponses: {
                ...capture.questionResponses,
                [questionId]: {
                  notes,
                  answered: notes.length > 0,
                },
              },
            },
          },
        };
      }),

    markQuestionAnswered: (themeId, questionId) =>
      set((s) => {
        const capture = s.themes[themeId];
        if (!capture) return s;
        const existing = capture.questionResponses[questionId];
        return {
          themes: {
            ...s.themes,
            [themeId]: {
              ...capture,
              questionResponses: {
                ...capture.questionResponses,
                [questionId]: {
                  notes: existing?.notes ?? "",
                  answered: true,
                },
              },
            },
          },
        };
      }),

    nextQuestion: () =>
      set((s) => {
        const tid = s.expandedThemeId;
        if (!tid) return s;
        const tile = allTiles.find((t) => t.id === tid);
        if (!tile) return s;
        const max = getQuestionsForMode(tile, s.scopingMode).length - 1;
        return { activeQuestionIndex: Math.min(max, s.activeQuestionIndex + 1) };
      }),

    prevQuestion: () =>
      set((s) => ({
        activeQuestionIndex: Math.max(0, s.activeQuestionIndex - 1),
      })),

    exportJSON: () => {
      const s = get();
      const allExportTiles = [getContextTile(), ...getScopingThemes()];
      const exportData = {
        pursuitId: s.pursuitId,
        clientName: s.clientName,
        sessionDate: s.sessionDate,
        scopingMode: s.scopingMode,
        exportedAt: new Date().toISOString(),
        themes: allExportTiles.map((theme) => {
          const capture = s.themes[theme.id] ?? emptyThemeCapture();
          return {
            themeId: theme.id,
            themeName: theme.name,
            status: capture.status,
            scopeSignal: capture.scopeSignal,
            priority: capture.priority,
            painLevel: capture.painLevel,
            notes: capture.notes,
            processAreas: theme.paIds,
            questions: theme.questions.map((q) => ({
              questionId: q.id,
              text: q.text,
              notes: capture.questionResponses[q.id]?.notes ?? "",
              answered: capture.questionResponses[q.id]?.answered ?? false,
            })),
          };
        }),
        summary: {
          themesExplored: Object.values(s.themes).filter(
            (t) => t.status !== "untouched",
          ).length,
          themesCaptured: Object.values(s.themes).filter(
            (t) => t.status === "captured",
          ).length,
          themesDeferred: Object.values(s.themes).filter(
            (t) => t.status === "deferred",
          ).length,
          inScope: Object.values(s.themes).filter(
            (t) => t.scopeSignal === "in",
          ).length,
          outOfScope: Object.values(s.themes).filter(
            (t) => t.scopeSignal === "out",
          ).length,
          needsExploration: Object.values(s.themes).filter(
            (t) => t.scopeSignal === "explore",
          ).length,
        },
      };
      return JSON.stringify(exportData, null, 2);
    },
  };
});
