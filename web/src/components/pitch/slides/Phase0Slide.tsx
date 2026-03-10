"use client";

import type { Phase0SlideData, TimelineRow, CostStat } from "@/lib/pitch-deck-data";

const BAR_COLOR: Record<TimelineRow["color"], string> = {
  red: "bg-red-500/80",
  amber: "bg-amber-500/80",
  green: "bg-emerald-500/80",
  blue: "bg-blue-500/80",
  purple: "bg-purple-500/80",
};

const STAT_COLOR: Record<CostStat["color"], string> = {
  red: "text-red-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
  cyan: "text-cyan-400",
  muted: "text-muted",
};

export function Phase0Slide({ data }: { data: Phase0SlideData }) {
  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-6xl mx-auto w-full">
      {/* Title */}
      <div className="mb-4">
        <h2 className="font-serif text-4xl text-foreground mb-1 tracking-tight">
          {data.title}
        </h2>
        <div className="w-16 h-px bg-info/30 mb-3" />
        <p className="text-base text-muted leading-relaxed max-w-4xl">
          {data.subtitle}
        </p>
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left — Timeline */}
        <div className="bg-surface rounded-lg border border-border/50 p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-5">
            Typical Phase 0 Timeline
          </h3>
          <div className="space-y-4">
            {data.timeline.map((row, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs font-mono text-muted/70 w-14 shrink-0">
                  {row.weeks}
                </span>
                <div className="flex-1">
                  <div
                    className={`${BAR_COLOR[row.color]} rounded px-3 py-2 text-xs text-white/90 font-medium truncate`}
                    style={{ width: `${row.widthPercent}%` }}
                  >
                    {row.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Where We Spend Our Time */}
        <div className="bg-surface rounded-lg border border-border/50 p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-5">
            Where We Spend Our Time
          </h3>
          <div className="space-y-4">
            {data.costs.map((cost, i) => (
              <div key={i} className="flex items-start gap-4">
                <span
                  className={`font-serif text-2xl font-bold ${STAT_COLOR[cost.color]} w-24 shrink-0 text-right leading-none pt-0.5`}
                >
                  {cost.value}
                </span>
                <span className="text-sm text-muted leading-snug flex-1 pt-1">
                  {cost.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Takeaway bar */}
      <div className="border-l-2 border-red-500/60 bg-surface rounded-r-lg px-6 py-4">
        <p className="text-lg text-foreground italic leading-relaxed">
          {data.takeaway}
        </p>
      </div>
    </div>
  );
}
