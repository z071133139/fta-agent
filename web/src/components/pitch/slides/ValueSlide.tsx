"use client";

import type { ValueSlideData, ColumnCard } from "@/lib/pitch-deck-data";

const ACCENT_BORDER: Record<ColumnCard["accent"], string> = {
  blue: "border-t-blue-500/60",
  amber: "border-t-amber-500/60",
  green: "border-t-emerald-500/60",
  red: "border-t-red-500/60",
  cyan: "border-t-cyan-500/60",
};

const ACCENT_TEXT: Record<ColumnCard["accent"], string> = {
  blue: "text-blue-400",
  amber: "text-amber-400",
  green: "text-emerald-400",
  red: "text-red-400",
  cyan: "text-cyan-400",
};

export function ValueSlide({ data }: { data: ValueSlideData }) {
  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-5xl mx-auto w-full">
      {/* Title */}
      <div className="mb-8">
        <h2 className="font-serif text-4xl text-foreground mb-1 tracking-tight">
          {data.title}
        </h2>
        <div className="w-16 h-px bg-info/30 mb-3" />
        {data.subtitle && (
          <p className="text-lg text-muted">{data.subtitle}</p>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {data.cards.map((card, i) => (
          <div
            key={i}
            className={`bg-surface rounded-lg border border-border/50 border-t-2 ${ACCENT_BORDER[card.accent]} p-5 flex flex-col`}
          >
            <h3
              className={`text-base font-semibold ${ACCENT_TEXT[card.accent]} mb-3`}
            >
              {card.title}
            </h3>
            <ul className="space-y-2 flex-1">
              {card.bullets.map((bullet, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed"
                >
                  <span
                    className={`${ACCENT_TEXT[card.accent]} opacity-50 mt-0.5 shrink-0`}
                  >
                    -
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
            {card.valueLine && (
              <p className="mt-3 pt-3 border-t border-border/30 text-xs font-medium text-muted italic">
                {card.valueLine}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Takeaway */}
      {data.takeaway && (
        <div className="bg-info/5 border border-info/15 rounded-lg px-6 py-4">
          <p className="text-sm text-info/80 italic leading-relaxed text-center">
            {data.takeaway}
          </p>
        </div>
      )}
    </div>
  );
}
