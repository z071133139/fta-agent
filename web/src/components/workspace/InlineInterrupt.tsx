"use client";

import { useState } from "react";
import type { InlineInterruptData } from "@/lib/mock-data";

interface InlineInterruptProps {
  interrupt: InlineInterruptData;
  onResolved: () => void;
}

export default function InlineInterrupt({
  interrupt,
  onResolved,
}: InlineInterruptProps) {
  const [resolved, setResolved] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");

  const handleOptionClick = (label: string) => {
    setResolved(label);
    onResolved();
  };

  const handleSend = () => {
    if (!freeText.trim()) return;
    setResolved(freeText.trim());
    onResolved();
  };

  if (resolved !== null) {
    return (
      <div className="mx-4 my-2 flex items-center gap-2 py-2 px-3 rounded-lg bg-success/5 border border-success/20">
        <span className="text-success text-xs">✓</span>
        <span className="text-xs text-muted">
          Decision recorded:{" "}
          <span className="text-foreground/90">{resolved}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="mx-4 my-3 border border-warning/40 bg-warning/5 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-warning text-sm">⚠</span>
        <span className="text-[10px] uppercase tracking-[0.12em] font-medium text-warning">
          Decision needed
        </span>
      </div>

      {/* Context */}
      <p className="text-xs text-foreground/90 leading-relaxed mb-4">
        {interrupt.context}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-4">
        {interrupt.options.map((opt, i) => (
          <div key={i} className="flex gap-3">
            <span className="shrink-0 text-xs font-mono text-muted mt-0.5">
              {String.fromCharCode(65 + i)}
            </span>
            <div>
              <p className="text-xs font-medium text-foreground/90">
                {opt.label}
              </p>
              <p className="text-[11px] text-muted mt-0.5 leading-snug">
                {opt.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {interrupt.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleOptionClick(opt.label)}
            className="px-3 py-1.5 rounded text-xs font-medium bg-warning/15 text-warning hover:bg-warning/25 transition-colors"
          >
            Option {String.fromCharCode(65 + i)}
          </button>
        ))}

        <span className="text-[10px] text-muted mx-1">
          or type a different direction ↓
        </span>
      </div>

      {/* Free-text input */}
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Describe your preferred approach…"
          className="flex-1 bg-surface border border-border/60 rounded px-3 py-1.5 text-xs text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/60"
        />
        <button
          onClick={handleSend}
          disabled={!freeText.trim()}
          className="px-3 py-1.5 rounded text-xs font-medium bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
