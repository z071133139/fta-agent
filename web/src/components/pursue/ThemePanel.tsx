"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  useScopingStore,
  type ScopeSignal,
  type PriorityLevel,
  type PainLevel,
} from "@/lib/scoping-store";
import type { ScopingTheme } from "@/lib/scoping-data";
import { getQuestionSections } from "@/lib/scoping-data";

// ── Signal Pills ─────────────────────────────────────────────────────────────

function ScopeSignalPills({ themeId }: { themeId: string }) {
  const signal = useScopingStore((s) => s.themes[themeId]?.scopeSignal ?? null);
  const setSignal = useScopingStore((s) => s.setScopeSignal);

  const options: { value: ScopeSignal; label: string; activeClass: string }[] = [
    { value: "in", label: "In Scope", activeClass: "bg-surface-alt text-foreground border-foreground/20" },
    { value: "out", label: "Out", activeClass: "bg-surface-alt text-muted border-muted/20" },
    { value: "explore", label: "Explore", activeClass: "bg-surface-alt text-muted border-muted/20" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => setSignal(themeId, o.value)}
          className={`px-3 py-1 rounded text-xs font-mono border transition-all ${
            signal === o.value ? o.activeClass : "bg-transparent text-muted/50 border-transparent hover:border-border/50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PriorityDots({ themeId }: { themeId: string }) {
  const priority = useScopingStore((s) => s.themes[themeId]?.priority ?? null);
  const setPriority = useScopingStore((s) => s.setPriority);

  const levels: { value: PriorityLevel; label: string }[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-wider text-muted/50 font-mono">Priority</span>
      <div className="flex gap-1.5">
        {levels.map((l, i) => {
          const active =
            priority === "high" ? true :
            priority === "medium" ? i <= 1 :
            priority === "low" ? i === 0 :
            false;
          return (
            <button
              key={l.value}
              onClick={() => setPriority(themeId, l.value)}
              title={l.label}
              className={`h-3 w-3 rounded-full border transition-all ${
                active
                  ? "bg-foreground/60 border-foreground/40"
                  : "bg-surface-alt border-border hover:border-muted/50"
              }`}
            />
          );
        })}
      </div>
      {priority && (
        <span className="text-[10px] text-muted/60 font-mono capitalize">{priority}</span>
      )}
    </div>
  );
}

function PainLevelSelect({ themeId }: { themeId: string }) {
  const pain = useScopingStore((s) => s.themes[themeId]?.painLevel ?? null);
  const setPain = useScopingStore((s) => s.setPainLevel);

  const levels: { value: PainLevel; label: string }[] = [
    { value: "none", label: "None" },
    { value: "moderate", label: "Moderate" },
    { value: "significant", label: "Significant" },
    { value: "critical", label: "Critical" },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-wider text-muted/50 font-mono">Pain</span>
      <div className="flex gap-1.5">
        {levels.map((l) => (
          <button
            key={l.value}
            onClick={() => setPain(themeId, l.value)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
              pain === l.value
                ? "text-foreground/80 bg-surface-alt border border-muted/20"
                : "text-muted/40 hover:text-muted/60"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  themeId,
  questionId,
  questionText,
  index,
  isActive,
}: {
  themeId: string;
  questionId: string;
  questionText: string;
  index: number;
  isActive: boolean;
}) {
  const response = useScopingStore(
    (s) => s.themes[themeId]?.questionResponses[questionId],
  );
  const setNotes = useScopingStore((s) => s.setQuestionNotes);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-lg border p-4 transition-colors ${
        isActive
          ? "border-muted/30 bg-white/[0.03]"
          : response?.answered
          ? "border-border/50 bg-white/[0.02]"
          : "border-border/30 bg-transparent"
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded bg-surface-alt/60 text-[10px] font-mono text-muted/60">
          {index + 1}
        </span>
        <p className="text-sm font-mono text-foreground/90 leading-relaxed">
          {questionText}
        </p>
      </div>
      <textarea
        ref={textareaRef}
        value={response?.notes ?? ""}
        onChange={(e) => setNotes(themeId, questionId, e.target.value)}
        placeholder="Capture notes..."
        rows={2}
        className="w-full rounded bg-surface-alt/30 border border-border/30 px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted/30 focus:outline-none focus:border-muted/40 resize-none"
      />
      {response?.notes && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="h-1 w-1 rounded-full bg-muted/50" />
          <span className="text-[10px] text-muted/50 font-mono">Captured</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Panel ───────────────────────────────────────────────────────────────

export function ThemePanel({ theme }: { theme: ScopingTheme }) {
  const collapse = useScopingStore((s) => s.collapseTheme);
  const activeQ = useScopingStore((s) => s.activeQuestionIndex);
  const themeNotes = useScopingStore((s) => s.themes[theme.id]?.notes ?? "");
  const setThemeNotes = useScopingStore((s) => s.setThemeNotes);
  const setDeferred = useScopingStore((s) => s.setThemeStatus);

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl border-l border-white/10 overflow-y-auto"
      style={{
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(24px) saturate(1.4)",
        WebkitBackdropFilter: "blur(24px) saturate(1.4)",
      }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/5 px-6 py-4" style={{ background: "rgba(15, 23, 42, 0.70)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-lg" style={{ filter: "grayscale(0.85) brightness(1.2)" }}>{theme.icon}</span>
            <h2 className="text-lg font-mono font-medium text-foreground">
              {theme.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeferred(theme.id, "deferred")}
              className="px-2 py-1 rounded text-[10px] font-mono text-muted/60 hover:text-foreground bg-transparent border border-border/30 hover:border-border transition-colors"
            >
              Defer
            </button>
            <button
              onClick={collapse}
              className="flex h-7 w-7 items-center justify-center rounded text-muted/60 hover:text-foreground hover:bg-surface-alt/50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-xs font-mono text-muted/50 mb-3">
          {theme.executiveQuestion}
        </p>

        {/* Scope + Priority + Pain */}
        <div className="flex flex-col gap-2">
          <ScopeSignalPills themeId={theme.id} />
          <div className="flex items-center gap-6">
            <PriorityDots themeId={theme.id} />
            <PainLevelSelect themeId={theme.id} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-6">
        {/* Executive overview */}
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-muted/40 font-mono mb-2">
            Overview
          </h3>
          <p className="text-xs text-muted/60 leading-relaxed font-mono">
            {theme.description}
          </p>
        </div>

        {/* Theme-level notes */}
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-muted/40 font-mono mb-2">
            Theme Notes
          </h3>
          <textarea
            value={themeNotes}
            onChange={(e) => setThemeNotes(theme.id, e.target.value)}
            placeholder="General notes for this theme..."
            rows={3}
            className="w-full rounded bg-surface-alt/30 border border-border/30 px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted/30 focus:outline-none focus:border-muted/40 resize-none"
          />
        </div>

        {/* Questions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] uppercase tracking-wider text-muted/40 font-mono">
              Scoping Questions
            </h3>
            <span className="text-[10px] text-muted/40 font-mono">
              {activeQ + 1} / {theme.questions.length}
            </span>
          </div>
          <div className="space-y-3">
            {theme.questions.map((q, i) => {
              const sections = getQuestionSections(theme);
              const showSectionHeader =
                q.section &&
                sections.length > 0 &&
                (i === 0 || theme.questions[i - 1]?.section !== q.section);
              return (
                <div key={q.id}>
                  {showSectionHeader && (
                    <div className={`text-[10px] uppercase tracking-wider font-mono text-muted/50 mb-2 ${i > 0 ? "mt-5" : ""}`}>
                      {q.section}
                    </div>
                  )}
                  <QuestionCard
                    themeId={theme.id}
                    questionId={q.id}
                    questionText={q.text}
                    index={i}
                    isActive={i === activeQ}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Process areas */}
        {theme.processAreas.length > 0 && (
          <div>
            <h3 className="text-[10px] uppercase tracking-wider text-muted/40 font-mono mb-2">
              Process Areas Included
            </h3>
            <div className="space-y-1.5">
              {theme.processAreas.map((pa) => (
                <div
                  key={pa.paId}
                  className="flex items-center justify-between rounded bg-white/[0.02] border border-border/20 px-3 py-2"
                >
                  <span className="text-xs text-foreground/80 font-mono">{pa.name}</span>
                  <span className="text-[10px] text-muted/40 font-mono">
                    {pa.subFlowCount} sub-flows
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="sticky bottom-0 border-t border-white/5 px-6 py-2" style={{ background: "rgba(15, 23, 42, 0.70)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-4 text-[10px] text-muted/30 font-mono">
          <span><kbd className="px-1 py-0.5 rounded bg-surface-alt/40 text-muted/50">Esc</kbd> close</span>
          <span><kbd className="px-1 py-0.5 rounded bg-surface-alt/40 text-muted/50">&larr;</kbd> <kbd className="px-1 py-0.5 rounded bg-surface-alt/40 text-muted/50">&rarr;</kbd> questions</span>
          <span><kbd className="px-1 py-0.5 rounded bg-surface-alt/40 text-muted/50">I</kbd> <kbd className="px-1 py-0.5 rounded bg-surface-alt/40 text-muted/50">O</kbd> <kbd className="px-1 py-0.5 rounded bg-surface-alt/40 text-muted/50">E</kbd> scope</span>
        </div>
      </div>
    </motion.div>
  );
}
