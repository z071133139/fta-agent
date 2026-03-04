"use client";

import type { StatsSlideData } from "@/lib/pitch-deck-data";

export function StatsSlide({ data }: { data: StatsSlideData }) {
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

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {data.stats.map((stat, i) => (
          <div
            key={i}
            className="bg-surface rounded-lg border border-border/50 p-6 text-center"
          >
            <p className="font-mono text-3xl font-bold text-foreground mb-2">
              {stat.value}
            </p>
            <p className="text-sm text-muted leading-snug">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Footer quote */}
      {data.footer && (
        <div className="bg-surface-alt/30 border border-border/30 rounded-lg px-6 py-4">
          <p className="text-sm text-muted italic text-center leading-relaxed">
            &ldquo;{data.footer}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
