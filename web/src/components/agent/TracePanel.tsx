"use client";

import { useAgentStore } from "@/lib/agent-store";
import type { ToolCallEvent, TraceStep } from "@/lib/agent-store";
import { match } from "ts-pattern";

function ToolCallRow({ event }: { event: ToolCallEvent }) {
  const isComplete = event.status === "completed";

  return (
    <div className="flex items-start gap-2 py-1.5">
      <span
        className={`mt-0.5 inline-block h-1.5 w-1.5 rounded-full ${
          isComplete ? "bg-emerald-500" : "bg-blue-500 animate-pulse"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-300">
            {event.tool}
          </span>
          <span className={`text-xs ${isComplete ? "text-emerald-400" : "text-blue-400"}`}>
            {isComplete ? "done" : "running..."}
          </span>
        </div>
        {isComplete && event.output_preview && (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
            {event.output_preview.slice(0, 120)}...
          </p>
        )}
      </div>
    </div>
  );
}

function TraceStepRow({ step }: { step: TraceStep }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          step.status === "completed" ? "bg-slate-500" : "bg-blue-500 animate-pulse"
        }`}
      />
      <span className="font-mono text-xs text-slate-400">
        {step.step}
      </span>
      <span className="text-xs text-slate-600">
        {step.status}
      </span>
    </div>
  );
}

export function TracePanel() {
  const traceLevel = useAgentStore((s) => s.traceLevel);
  const toolCalls = useAgentStore((s) => s.toolCalls);
  const traceSteps = useAgentStore((s) => s.traceSteps);
  const status = useAgentStore((s) => s.status);
  const setTraceLevel = useAgentStore((s) => s.setTraceLevel);

  if (status === "idle") return null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Agent Trace
        </span>
        <div className="flex gap-1">
          {([0, 1, 2] as const).map((level) => (
            <button
              key={level}
              onClick={() => setTraceLevel(level)}
              className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
                traceLevel === level
                  ? "bg-slate-600 text-slate-200"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {match(level)
                .with(0, () => "Summary")
                .with(1, () => "Steps")
                .with(2, () => "Debug")
                .exhaustive()}
            </button>
          ))}
        </div>
      </div>

      {/* Level 0: just outcome summary */}
      {traceLevel === 0 && (
        <div className="text-xs text-slate-400">
          {toolCalls.filter((t) => t.status === "completed").length > 0
            ? `Ran ${toolCalls.filter((t) => t.status === "completed").length} analysis tool${
                toolCalls.filter((t) => t.status === "completed").length !== 1 ? "s" : ""
              }`
            : status === "thinking"
              ? "Agent is reasoning..."
              : "Waiting..."}
        </div>
      )}

      {/* Level 1: step summaries with tool names */}
      {traceLevel >= 1 && (
        <div className="space-y-0.5">
          {traceSteps.map((step, i) => (
            <TraceStepRow key={`${step.step}-${i}`} step={step} />
          ))}
          {toolCalls.map((event, i) => (
            <ToolCallRow key={`${event.tool}-${i}`} event={event} />
          ))}
        </div>
      )}

      {/* Level 2 additionally shows raw input/output */}
      {traceLevel === 2 && toolCalls.length > 0 && (
        <div className="mt-2 border-t border-slate-700 pt-2">
          <pre className="max-h-40 overflow-auto text-xs text-slate-500">
            {JSON.stringify(
              toolCalls.map((t) => ({
                tool: t.tool,
                status: t.status,
                input: t.input,
                output_preview: t.output_preview?.slice(0, 200),
              })),
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
