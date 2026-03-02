"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAgentStore } from "@/lib/agent-store";

export function StreamingOutput() {
  const tokens = useAgentStore((s) => s.tokens);
  const status = useAgentStore((s) => s.status);
  const error = useAgentStore((s) => s.error);
  const [flash, setFlash] = useState(false);

  // Brief emerald flash on completion
  useEffect(() => {
    if (status === "complete") {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!tokens && status === "idle") return null;

  const borderColor = flash
    ? "border-emerald-500/60"
    : status === "error"
      ? "border-red-500/40"
      : "border-slate-700";

  return (
    <div className={`relative rounded-lg border ${borderColor} bg-slate-800/80 p-4 transition-colors duration-700`}>
      <div className="agent-markdown prose prose-invert prose-sm max-w-none font-mono text-sm leading-relaxed text-slate-200">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-lg font-bold text-slate-100 mt-5 mb-2 first:mt-0">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base font-bold text-slate-100 mt-5 mb-2 first:mt-0">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-bold text-slate-200 mt-4 mb-1.5">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="my-2 leading-relaxed">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-slate-100">{children}</strong>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 -mx-1">
                <table className="w-full text-xs border-collapse">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="border-b border-slate-600">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="px-2 py-1.5 text-left font-semibold text-slate-300 whitespace-nowrap">{children}</th>
            ),
            td: ({ children }) => (
              <td className="px-2 py-1 text-slate-300 border-b border-slate-700/50">{children}</td>
            ),
            ul: ({ children }) => (
              <ul className="my-2 space-y-1 list-disc list-inside">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="my-2 space-y-1 list-decimal list-inside">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-slate-300">{children}</li>
            ),
            code: ({ children, className }) => {
              const isBlock = className?.includes("language-");
              if (isBlock) {
                return (
                  <pre className="bg-slate-900/80 rounded p-3 my-2 overflow-x-auto text-xs">
                    <code className="text-slate-300">{children}</code>
                  </pre>
                );
              }
              return (
                <code className="bg-slate-900/60 px-1 py-0.5 rounded text-blue-300">{children}</code>
              );
            },
          }}
        >
          {tokens}
        </ReactMarkdown>
        {(status === "thinking" || status === "acting") && (
          <span className="inline-block h-4 w-1.5 animate-pulse bg-blue-400 ml-0.5" />
        )}
      </div>

      {status === "complete" && (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-700 pt-2">
          <span className={`inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 ${flash ? "animate-ping" : ""}`} />
          <span className="text-xs text-emerald-400">Analysis complete</span>
        </div>
      )}

      {status === "error" && (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-700 pt-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="text-xs text-red-400">
            {error ?? "An error occurred"}
          </span>
        </div>
      )}
    </div>
  );
}
