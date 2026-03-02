"use client";

import { useEffect, useState } from "react";
import { useAgentStore } from "@/lib/agent-store";
import { match } from "ts-pattern";

function StatusDot({ status }: { status: string }) {
  const colorClass = match(status)
    .with("idle", () => "bg-slate-500")
    .with("thinking", () => "bg-blue-500 animate-pulse")
    .with("acting", () => "bg-blue-400 animate-pulse")
    .with("awaiting_input", () => "bg-amber-500 animate-pulse")
    .with("complete", () => "bg-emerald-500")
    .with("error", () => "bg-red-500")
    .otherwise(() => "bg-slate-500");

  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass} transition-colors duration-500`} />;
}

function ElapsedTicker() {
  const startedAt = useAgentStore((s) => s.startedAt);
  const completedAt = useAgentStore((s) => s.completedAt);
  const status = useAgentStore((s) => s.status);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (status !== "thinking" && status !== "acting") return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [status]);

  if (!startedAt) return null;

  const end = completedAt ?? now;
  const elapsed = (end - startedAt) / 1000;
  const display = elapsed < 10 ? elapsed.toFixed(1) : Math.round(elapsed).toString();

  return (
    <span className="font-mono text-xs tabular-nums text-slate-400">
      {display}s
    </span>
  );
}

export function AgentStatusBar() {
  const status = useAgentStore((s) => s.status);
  const toolCalls = useAgentStore((s) => s.toolCalls);
  const error = useAgentStore((s) => s.error);

  if (status === "idle") return null;

  const activeTool = toolCalls.filter((t) => t.status === "started").pop();
  const completedTools = toolCalls.filter((t) => t.status === "completed").length;

  const statusLabel = match(status)
    .with("thinking", () => "Analyzing...")
    .with("acting", () => activeTool ? `Running ${activeTool.tool}` : "Processing...")
    .with("awaiting_input", () => "Awaiting your input")
    .with("complete", () => "Complete")
    .with("error", () => "Error")
    .otherwise(() => "");

  const borderColor = match(status)
    .with("complete", () => "border-emerald-500/40")
    .with("error", () => "border-red-500/40")
    .with("awaiting_input", () => "border-amber-500/40")
    .otherwise(() => "border-slate-700");

  return (
    <div className={`flex items-center gap-3 rounded-lg border ${borderColor} bg-slate-800/80 px-4 py-2.5 backdrop-blur-sm transition-colors duration-700`}>
      <StatusDot status={status} />

      <span className="text-sm font-medium text-slate-200">
        GL Design Coach
      </span>

      <span className="text-sm text-slate-400">
        {statusLabel}
      </span>

      {completedTools > 0 && (
        <span className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-xs text-slate-300">
          {completedTools} tool{completedTools !== 1 ? "s" : ""} run
        </span>
      )}

      <div className="ml-auto">
        <ElapsedTicker />
      </div>

      {error && (
        <span className="text-xs text-red-400 max-w-[200px] truncate">{error}</span>
      )}
    </div>
  );
}
