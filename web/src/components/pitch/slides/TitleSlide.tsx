"use client";

import type { TitleSlideData } from "@/lib/pitch-deck-data";

export function TitleSlide({ data }: { data: TitleSlideData }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <h1 className="font-serif text-7xl text-foreground mb-6 tracking-tight">
        {data.heading}
      </h1>

      <div className="w-24 h-px bg-info/40 mb-8" />

      <p className="text-xl text-info/80 max-w-2xl leading-relaxed whitespace-pre-line mb-6">
        {data.subheading}
      </p>

      <p className="text-lg text-muted max-w-2xl leading-relaxed mb-12">
        {data.subtitle}
      </p>

      <p className="text-sm text-muted/50 tracking-wide">{data.footer}</p>
    </div>
  );
}
