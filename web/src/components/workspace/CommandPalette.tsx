"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWorkshopStore } from "@/lib/workshop-store";
import type { CaptureBarHandle } from "./CaptureBar";

interface PaletteCommand {
  id: string;
  label: string;
  shortcut: string;
  action: () => void;
}

export function CommandPalette({
  captureBarRef,
  onFitView,
}: {
  captureBarRef: React.RefObject<CaptureBarHandle | null>;
  onFitView?: () => void;
}) {
  const open = useWorkshopStore((s) => s.commandPaletteOpen);
  const toggle = useWorkshopStore((s) => s.toggleCommandPalette);
  const endWorkshop = useWorkshopStore((s) => s.endWorkshop);
  const exportJSON = useWorkshopStore((s) => s.exportJSON);

  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: PaletteCommand[] = [
    {
      id: "new-req",
      label: "New Requirement",
      shortcut: "R",
      action: () => { toggle(); captureBarRef.current?.focus("R"); },
    },
    {
      id: "new-step",
      label: "New Step",
      shortcut: "N",
      action: () => { toggle(); captureBarRef.current?.focus("N"); },
    },
    {
      id: "flag-gap",
      label: "Flag Gap",
      shortcut: "G",
      action: () => { toggle(); captureBarRef.current?.focus("G"); },
    },
    {
      id: "annotate",
      label: "Annotate",
      shortcut: "A",
      action: () => { toggle(); captureBarRef.current?.focus("A"); },
    },
    {
      id: "end-workshop",
      label: "End Workshop",
      shortcut: "⇧⌘W",
      action: () => { toggle(); endWorkshop(); },
    },
    {
      id: "export-summary",
      label: "Export Summary",
      shortcut: "",
      action: () => { toggle(); exportJSON("default"); },
    },
    {
      id: "fit-view",
      label: "Fit to View",
      shortcut: "F",
      action: () => { toggle(); onFitView?.(); },
    },
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const execute = useCallback((cmd: PaletteCommand) => {
    cmd.action();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIdx]) execute(filtered[selectedIdx]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      toggle();
    }
  }, [filtered, selectedIdx, execute, toggle]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={(e) => { if (e.target === e.currentTarget) toggle(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggle} />

      {/* Palette */}
      <div
        className="relative w-[480px] rounded-xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: "#1E293B",
          borderColor: "rgba(245,158,11,0.25)",
          borderLeftWidth: 3,
          borderLeftColor: "#F59E0B",
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="px-4 py-3 border-b border-border/30">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command…"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/40 outline-none"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>

        {/* Commands list */}
        <div className="max-h-[320px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-muted/50">
              No matching commands
            </div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => execute(cmd)}
              onMouseEnter={() => setSelectedIdx(i)}
              className={[
                "flex items-center justify-between w-full px-4 py-2.5 text-left transition-colors",
                i === selectedIdx
                  ? "bg-[#F59E0B]/10"
                  : "hover:bg-surface-alt/30",
              ].join(" ")}
            >
              <span
                className={[
                  "text-[12px]",
                  i === selectedIdx ? "text-foreground" : "text-muted",
                ].join(" ")}
              >
                {cmd.label}
              </span>
              {cmd.shortcut && (
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                  style={{
                    borderColor: "rgba(71,85,105,0.3)",
                    color: "rgba(148,163,184,0.6)",
                  }}
                >
                  {cmd.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border/20 flex items-center gap-3">
          <span className="text-[9px] font-mono text-muted/40">
            ↑↓ navigate
          </span>
          <span className="text-[9px] font-mono text-muted/40">
            ↵ execute
          </span>
          <span className="text-[9px] font-mono text-muted/40">
            esc close
          </span>
        </div>
      </div>
    </div>
  );
}
