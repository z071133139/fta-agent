"use client";

import type { RoadmapSlideData, RoadmapPhase } from "@/lib/pitch-deck-data";

const PHASE_BORDER: Record<RoadmapPhase["accent"], string> = {
  blue: "border-t-blue-500/60",
  amber: "border-t-amber-500/60",
  green: "border-t-emerald-500/60",
};

const PHASE_TEXT: Record<RoadmapPhase["accent"], string> = {
  blue: "text-blue-400",
  amber: "text-amber-400",
  green: "text-emerald-400",
};

const PHASE_BG: Record<RoadmapPhase["accent"], string> = {
  blue: "bg-blue-500/10 text-blue-400",
  amber: "bg-amber-500/10 text-amber-400",
  green: "bg-emerald-500/10 text-emerald-400",
};

export function RoadmapSlide({ data }: { data: RoadmapSlideData }) {
  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-5xl mx-auto w-full">
      {/* Title */}
      <div className="mb-10">
        <h2 className="font-serif text-4xl text-foreground mb-1 tracking-tight">
          {data.title}
        </h2>
        <div className="w-16 h-px bg-info/30 mb-3" />
        {data.subtitle && (
          <p className="text-lg text-muted">{data.subtitle}</p>
        )}
      </div>

      {/* Three phases with connectors */}
      <div className="grid grid-cols-3 gap-4 mb-10 items-start">
        {data.phases.map((phase, i) => (
          <div key={i} className="flex items-start gap-3">
            {/* Phase card */}
            <div
              className={`flex-1 bg-surface rounded-lg border border-border/50 border-t-2 ${PHASE_BORDER[phase.accent]} p-5`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded ${PHASE_BG[phase.accent]}`}
                >
                  {phase.timing}
                </span>
              </div>
              <h3
                className={`text-lg font-semibold ${PHASE_TEXT[phase.accent]} mb-3`}
              >
                {phase.title}
              </h3>
              <ul className="space-y-2">
                {phase.bullets.map((bullet, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed"
                  >
                    <span
                      className={`${PHASE_TEXT[phase.accent]} opacity-50 mt-0.5 shrink-0`}
                    >
                      -
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            {/* Connector arrow */}
            {i < 2 && (
              <span className="text-muted/30 text-lg mt-12 shrink-0">
                &raquo;
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {data.footer && (
        <div className="bg-info/5 border border-info/15 rounded-lg px-6 py-4 text-center">
          <p className="text-base font-semibold text-info/90 italic">
            {data.footer}
          </p>
        </div>
      )}
    </div>
  );
}
