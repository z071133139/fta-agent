"use client";

import Image from "next/image";
import type { ShowcaseSlideData } from "@/lib/pitch-deck-data";

export function ShowcaseSlide({ data }: { data: ShowcaseSlideData }) {
  return (
    <div className="flex flex-col h-full px-8 py-6 max-w-7xl mx-auto w-full">
      {/* Title */}
      <div className="mb-4 shrink-0">
        <h2 className="font-serif text-3xl text-foreground mb-1 tracking-tight">
          {data.title}
        </h2>
        <div className="w-16 h-px bg-info/30 mb-2" />
        <p className="text-base text-muted">{data.subtitle}</p>
      </div>

      {/* Screenshot */}
      <div className="relative flex-1 min-h-0 mb-4 rounded-lg overflow-hidden border border-border/50 bg-surface">
        <Image
          src={data.image}
          alt={data.title}
          fill
          className="object-contain object-top"
          sizes="(max-width: 1280px) 100vw, 1280px"
          priority
        />
      </div>

      {/* Two-column narrative + takeaway */}
      <div className="shrink-0 grid grid-cols-2 gap-4 mb-3">
        <div className="bg-surface rounded-lg border border-border/50 border-l-2 border-l-info/60 px-4 py-3">
          <h3 className="text-xs font-semibold text-info/80 uppercase tracking-wider mb-1.5">
            Agent Does the Work
          </h3>
          <p className="text-sm text-muted leading-relaxed">{data.agentDoes}</p>
        </div>
        <div className="bg-surface rounded-lg border border-border/50 border-l-2 border-l-success/60 px-4 py-3">
          <h3 className="text-xs font-semibold text-success/80 uppercase tracking-wider mb-1.5">
            Consultant Creates Value
          </h3>
          <p className="text-sm text-foreground leading-relaxed">
            {data.consultantDoes}
          </p>
        </div>
      </div>

      {/* Takeaway */}
      <div className="shrink-0 border-l-2 border-blue-500/60 bg-surface rounded-r-lg px-5 py-2.5">
        <p className="text-base text-foreground italic leading-relaxed">
          {data.takeaway}
        </p>
      </div>
    </div>
  );
}
