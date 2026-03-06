"use client";

import type { ProcessFlowData } from "@/lib/mock-data";
import { ProcessFlowMap } from "@/components/workspace/ProcessFlowMap";

interface BuilderPreviewPanelProps {
  flow: ProcessFlowData | null;
  error?: string | null;
  onDismissError?: () => void;
}

export function BuilderPreviewPanel({ flow, error, onDismissError }: BuilderPreviewPanelProps) {
  if (!flow) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          {/* Error banner */}
          {error && (
            <div className="w-full rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-left">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-error leading-relaxed">{error}</p>
                {onDismissError && (
                  <button
                    onClick={onDismissError}
                    className="shrink-0 text-error/60 hover:text-error transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-error/50 mt-1.5 font-mono">
                Try describing the process again or provide more detail.
              </p>
            </div>
          )}

          {/* Flow icon */}
          {!error && (
            <>
              <svg
                className="w-12 h-12 text-muted/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
              <div>
                <p className="text-[13px] text-muted/70 leading-relaxed">
                  Start the conversation to see your process flow take shape
                </p>
                <p className="text-[10px] text-muted/40 mt-2 font-mono">
                  The agent will build a swimlane diagram as you describe the process
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 relative">
      {/* Error overlay on existing flow */}
      {error && (
        <div className="absolute top-3 left-3 right-3 z-10 rounded-lg border border-error/30 bg-error/10 backdrop-blur-sm px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-error">{error}</p>
            {onDismissError && (
              <button
                onClick={onDismissError}
                className="shrink-0 text-error/60 hover:text-error transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      <ProcessFlowMap data={flow} />
    </div>
  );
}
