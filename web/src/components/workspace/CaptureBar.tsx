"use client";

import { useState, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { useWorkshopStore } from "@/lib/workshop-store";

// ── Types ────────────────────────────────────────────────────────────────────

export type CaptureContext = "requirements" | "flow";

export interface CaptureBarHandle {
  focus: (prefix?: string) => void;
  blur: () => void;
}

type Command = "R" | "N" | "G" | "A";

interface PendingRequirement {
  raw: string;
  clean: string;
  status: "reviewing" | "ready";
}

// ── Command parsing ──────────────────────────────────────────────────────────

function parseCommand(raw: string, context: CaptureContext): { command: Command; text: string } {
  const trimmed = raw.trim();

  // Allowed prefixes depend on context
  const prefixes = context === "requirements" ? "RN" : "RNGA";
  const re = new RegExp(`^[${prefixes}]$`, "i");

  // Exact single-letter command
  if (re.test(trimmed)) {
    return { command: trimmed.toUpperCase() as Command, text: "" };
  }

  // Prefix + space + text
  const matchRe = new RegExp(`^([${prefixes}])\\s+(.*)`, "i");
  const match = trimmed.match(matchRe);
  if (match) {
    return { command: match[1].toUpperCase() as Command, text: match[2].trim() };
  }

  // No prefix → treat as R
  return { command: "R", text: trimmed };
}

// ── Mock agent review ────────────────────────────────────────────────────────

function cleanRequirementText(raw: string): string {
  let text = raw.trim();

  // Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);

  // Ensure starts with "System must" or "The system shall" pattern if not already
  const startsWithVerb = /^(system|the system|must|shall|ensure|support|provide|enable|allow|maintain|validate|generate|process|perform|calculate|display|track|record|report|manage|handle|configure|automate)/i.test(text);
  if (!startsWithVerb) {
    text = "System must " + text.charAt(0).toLowerCase() + text.slice(1);
  }

  // Ensure ends with period
  if (!/[.!]$/.test(text)) {
    text = text + ".";
  }

  return text;
}

// ── Component ────────────────────────────────────────────────────────────────

export const CaptureBar = forwardRef<CaptureBarHandle, { context?: CaptureContext }>(
  function CaptureBar({ context = "requirements" }, ref) {
    const [value, setValue] = useState("");
    const [flash, setFlash] = useState(false);
    const [noSelection, setNoSelection] = useState(false);
    const [pending, setPending] = useState<PendingRequirement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const addRequirement = useWorkshopStore((s) => s.addRequirement);
    const addFlowNode = useWorkshopStore((s) => s.addFlowNode);
    const toggleRequirementGap = useWorkshopStore((s) => s.toggleRequirementGap);
    const annotateFlowNode = useWorkshopStore((s) => s.annotateFlowNode);
    const selectedRequirementId = useWorkshopStore((s) => s.selectedRequirementId);
    const getCaptureCount = useWorkshopStore((s) => s.getCaptureCount);

    useImperativeHandle(ref, () => ({
      focus: (prefix?: string) => {
        // Don't focus if reviewing a pending requirement
        if (pending) return;
        if (prefix) {
          // Skip G/A prefixes on requirements context
          if (context === "requirements" && (prefix === "G" || prefix === "A")) return;
          setValue(prefix + " ");
        }
        setTimeout(() => inputRef.current?.focus(), 0);
      },
      blur: () => {
        inputRef.current?.blur();
      },
    }));

    const doFlash = useCallback(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 400);
    }, []);

    const acceptPending = useCallback(() => {
      if (!pending) return;
      addRequirement(pending.clean);
      doFlash();
      setPending(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }, [pending, addRequirement, doFlash]);

    const editPending = useCallback(() => {
      if (!pending) return;
      setValue(pending.clean);
      setPending(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }, [pending]);

    const dismissPending = useCallback(() => {
      setPending(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }, []);

    const handleSubmit = useCallback(() => {
      if (!value.trim()) return;

      const { command, text } = parseCommand(value, context);

      switch (command) {
        case "R": {
          if (!text) return;
          // Start agent review flow
          setValue("");
          setPending({ raw: text, clean: "", status: "reviewing" });

          // Simulate agent review delay
          setTimeout(() => {
            const cleaned = cleanRequirementText(text);
            setPending({ raw: text, clean: cleaned, status: "ready" });
          }, 600);
          return; // Don't clear value below — already cleared
        }
        case "N": {
          if (!text) return;
          addFlowNode(text);
          doFlash();
          break;
        }
        case "G": {
          if (!selectedRequirementId) {
            setNoSelection(true);
            setTimeout(() => setNoSelection(false), 1200);
            break;
          }
          toggleRequirementGap(selectedRequirementId);
          doFlash();
          break;
        }
        case "A": {
          if (!selectedRequirementId) {
            setNoSelection(true);
            setTimeout(() => setNoSelection(false), 1200);
            break;
          }
          if (!text) break;
          annotateFlowNode(selectedRequirementId, text);
          doFlash();
          break;
        }
      }

      setValue("");
    }, [value, context, addFlowNode, toggleRequirementGap, annotateFlowNode, selectedRequirementId, doFlash]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        setValue("");
        inputRef.current?.blur();
      }
    };

    // Handle keyboard in pending review state
    const handlePendingKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (pending?.status !== "ready") return;
      if (e.key === "Enter" || e.key === "y" || e.key === "Y") {
        e.preventDefault();
        acceptPending();
      }
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        editPending();
      }
      if (e.key === "Escape") {
        dismissPending();
      }
    }, [pending, acceptPending, editPending, dismissPending]);

    const count = getCaptureCount();
    const shortcuts = context === "requirements" ? ["R", "N"] : ["R", "N", "G", "A"];
    const placeholder = context === "requirements"
      ? "Type to capture — R requirement, N step"
      : "Type to capture — R requirement, N step, G gap, A annotate";

    // ── Pending review card ──────────────────────────────────────────────────

    if (pending) {
      return (
        <div
          className="border-t"
          style={{
            borderLeftWidth: 3,
            borderLeftColor: pending.status === "ready" ? "#10B981" : "#3B82F6",
            borderTopColor: "rgba(59,130,246,0.2)",
            backgroundColor: "rgba(15,23,42,0.95)",
          }}
          onKeyDown={handlePendingKeyDown}
          tabIndex={0}
          ref={(el) => el?.focus()}
        >
          {/* Reviewing state */}
          {pending.status === "reviewing" && (
            <div className="flex items-center gap-3 px-5 py-3">
              <div className="h-1.5 w-1.5 rounded-full bg-accent agent-thinking" />
              <span className="text-[10px] font-mono text-accent/70">
                Reviewing requirement…
              </span>
            </div>
          )}

          {/* Ready state — show original vs clean */}
          {pending.status === "ready" && (
            <div className="px-5 py-3 space-y-2">
              {/* Original */}
              <div className="flex items-start gap-2">
                <span className="text-[8px] uppercase tracking-[0.1em] text-muted/50 pt-0.5 w-10 shrink-0">
                  Raw
                </span>
                <span className="text-[10px] text-muted/60 line-through font-mono">
                  {pending.raw}
                </span>
              </div>

              {/* Proposed */}
              <div className="flex items-start gap-2">
                <span className="text-[8px] uppercase tracking-[0.1em] text-[#10B981] pt-0.5 w-10 shrink-0">
                  Clean
                </span>
                <span className="text-[11px] text-foreground font-mono">
                  {pending.clean}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={acceptPending}
                  className="text-[9px] font-mono px-2 py-0.5 rounded transition-colors"
                  style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#10B981" }}
                >
                  Y accept
                </button>
                <button
                  onClick={editPending}
                  className="text-[9px] font-mono px-2 py-0.5 rounded transition-colors"
                  style={{ backgroundColor: "rgba(59,130,246,0.12)", color: "#3B82F6" }}
                >
                  E edit
                </button>
                <button
                  onClick={dismissPending}
                  className="text-[9px] font-mono text-muted/40 px-2 py-0.5 rounded hover:text-muted transition-colors"
                >
                  Esc discard
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── Normal input state ───────────────────────────────────────────────────

    return (
      <div
        className="flex items-center gap-3 px-5 py-2.5 border-t backdrop-blur-md transition-colors"
        style={{
          borderLeftWidth: 3,
          borderLeftColor: flash ? "#10B981" : "#F59E0B",
          borderTopColor: flash
            ? "rgba(16,185,129,0.3)"
            : "rgba(245,158,11,0.2)",
          backgroundColor: flash
            ? "rgba(16,185,129,0.12)"
            : "rgba(15,23,42,0.92)",
          transition: "border-color 0.3s, background-color 0.3s",
        }}
      >
        {/* Capture count */}
        {count > 0 && (
          <span
            className="flex-shrink-0 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "rgba(16,185,129,0.15)",
              color: "#10B981",
            }}
          >
            {count}
          </span>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-[11px] text-foreground placeholder:text-muted/40"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          data-capture-bar
        />

        {/* Hints */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {noSelection && (
            <span className="text-[9px] font-mono text-[#F59E0B] animate-pulse mr-1">
              select a row first
            </span>
          )}
          {shortcuts.map((k) => (
            <span
              key={k}
              className="text-[8px] font-mono text-muted/40 border border-border/20 rounded px-1 py-0.5"
            >
              {k}
            </span>
          ))}
        </div>
      </div>
    );
  }
);
