"use client";

import type { ProcessFlowData } from "@/lib/mock-data";
import { ProcessFlowMap } from "@/components/workspace/ProcessFlowMap";

interface BuilderPreviewPanelProps {
  flow: ProcessFlowData | null;
}

export function BuilderPreviewPanel({ flow }: BuilderPreviewPanelProps) {
  if (!flow) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          {/* Flow icon */}
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 relative">
      <ProcessFlowMap data={flow} />
    </div>
  );
}
