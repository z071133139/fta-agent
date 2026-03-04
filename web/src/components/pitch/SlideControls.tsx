"use client";

import { PITCH_SLIDES } from "@/lib/pitch-deck-data";

interface SlideControlsProps {
  currentSlide: number;
  visible: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function SlideControls({
  currentSlide,
  visible,
  onPrev,
  onNext,
}: SlideControlsProps) {
  const total = PITCH_SLIDES.length;

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-50 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between px-8 py-4 bg-gradient-to-t from-background/90 to-transparent">
        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i === currentSlide
                  ? "w-2.5 h-2.5 bg-info"
                  : "w-1.5 h-1.5 bg-muted/30"
              }`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <span className="font-mono text-xs text-muted/50">
          {currentSlide + 1} / {total}
        </span>

        {/* Nav buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPrev}
            disabled={currentSlide === 0}
            className="text-muted/50 hover:text-foreground disabled:opacity-20 disabled:cursor-default transition-colors text-sm font-mono cursor-pointer"
          >
            &larr;
          </button>
          <button
            onClick={onNext}
            disabled={currentSlide === total - 1}
            className="text-muted/50 hover:text-foreground disabled:opacity-20 disabled:cursor-default transition-colors text-sm font-mono cursor-pointer"
          >
            &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
