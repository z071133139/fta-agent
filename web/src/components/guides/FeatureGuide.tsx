"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { FeatureGuideData } from "@/lib/guide-content";

// ── Props ───────────────────────────────────────────────────────────────────

interface FeatureGuideProps {
  guide: FeatureGuideData;
  onClose: () => void;
}

// ── Component ───────────────────────────────────────────────────────────────

export function FeatureGuide({ guide, onClose }: FeatureGuideProps) {
  const [step, setStep] = useState(0);
  const total = guide.steps.length;
  const current = guide.steps[step];

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  if (!current) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-4xl max-h-[85vh] mx-4 rounded-xl border border-border bg-surface overflow-hidden flex flex-col">
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between px-6 pt-5 pb-3">
          <div className="border-l-4 border-info pl-3">
            <span className="text-[11px] uppercase tracking-[0.15em] text-info font-medium">
              {guide.agentName}
            </span>
            <h2 className="text-lg font-medium text-foreground mt-0.5">
              {guide.title}
            </h2>
          </div>
          <div className="flex items-center gap-3 shrink-0 mt-1">
            <span className="text-[11px] font-mono text-muted">
              Step {step + 1} of {total}
            </span>
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors p-1"
              title="Close (Esc)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content — split layout */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex gap-6 min-h-[340px]"
            >
              {/* Left — Illustration (55%) */}
              <div className="w-[55%] shrink-0 flex flex-col">
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wide mb-1">
                  {current.title}
                </h3>
                {current.subtitle && (
                  <p className="text-sm text-muted mb-3">
                    {current.subtitle}
                  </p>
                )}
                <div className="flex-1 rounded-lg bg-background border border-border/50 p-4 overflow-auto">
                  <pre className="text-[11px] leading-relaxed font-mono text-secondary whitespace-pre">
                    {current.illustration.join("\n")}
                  </pre>
                </div>
              </div>

              {/* Right — Content (45%) */}
              <div className="flex-1 flex flex-col justify-center">
                <ul className="space-y-3">
                  {current.bullets.map((bullet, i) => (
                    <li key={i} className="flex gap-2 text-sm text-secondary leading-relaxed">
                      <span className="text-info shrink-0 mt-0.5">&bull;</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {current.tip && (
                  <div className="mt-4 rounded-lg bg-info/10 border border-info/30 px-4 py-3">
                    <span className="text-[11px] uppercase tracking-[0.1em] text-info font-medium block mb-1">
                      Tip
                    </span>
                    <p className="text-sm text-secondary leading-relaxed">
                      {current.tip}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer — Navigation */}
        <div className="shrink-0 border-t border-border px-6 py-3 flex items-center justify-between">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {guide.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === step ? "bg-info" : "bg-surface-alt hover:bg-muted"
                }`}
                title={`Step ${i + 1}`}
              />
            ))}
          </div>

          {/* Nav buttons + hint */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-faint font-mono">
              &larr; &rarr; navigate &middot; Esc close
            </span>
            <button
              onClick={goPrev}
              disabled={step === 0}
              className="rounded px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground border border-border hover:border-border-strong transition-colors disabled:opacity-30 disabled:cursor-default"
            >
              &larr; Prev
            </button>
            <button
              onClick={step === total - 1 ? onClose : goNext}
              className="rounded px-3 py-1.5 text-xs font-medium text-foreground bg-accent hover:bg-accent/80 transition-colors"
            >
              {step === total - 1 ? "Done" : "Next \u2192"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
