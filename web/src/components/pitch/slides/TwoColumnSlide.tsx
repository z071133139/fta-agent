"use client";

import { useRouter } from "next/navigation";
import type { TwoColumnSlideData } from "@/lib/pitch-deck-data";

export function TwoColumnSlide({
  data,
  slideNumber,
}: {
  data: TwoColumnSlideData;
  slideNumber: number;
}) {
  const router = useRouter();

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

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Left — Old Way */}
        <div className="bg-surface rounded-lg border border-border/50 border-t-2 border-t-error/60 p-6">
          <h3 className="text-sm font-semibold text-error/80 uppercase tracking-wider mb-4">
            {data.leftTitle}
          </h3>
          <ul className="space-y-3">
            {data.leftItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted leading-relaxed">
                <span className="text-error/40 mt-0.5 shrink-0">-</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — FTA Way */}
        <div className="bg-surface rounded-lg border border-border/50 border-t-2 border-t-info/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-info/80 uppercase tracking-wider">
              {data.rightTitle}
            </h3>
          </div>
          <ul className="space-y-3">
            {data.rightItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                <span className="text-info/60 mt-0.5 shrink-0">-</span>
                {item}
              </li>
            ))}
          </ul>

          {data.demoRoute && (
            <button
              onClick={() =>
                router.push(
                  `${data.demoRoute!}?from=pitch&slide=${slideNumber}`
                )
              }
              className="mt-6 text-sm font-medium text-info hover:text-foreground transition-colors group cursor-pointer"
            >
              {data.demoLabel ?? "See it live"}{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Takeaway bar */}
      <div className="bg-info/5 border border-info/15 rounded-lg px-6 py-4">
        <p className="text-sm text-info/80 italic leading-relaxed">
          {data.takeaway}
        </p>
      </div>
    </div>
  );
}
