"use client";

interface SlideControlsProps {
  currentSlide: number;
  totalSlides: number;
  visible: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function SlideControls({
  currentSlide,
  totalSlides,
  visible,
  onPrev,
  onNext,
}: SlideControlsProps) {
  const total = totalSlides;

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-50 transition-opacity duration-500 print:hidden ${
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

        {/* Nav buttons + download */}
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

          <span className="text-muted/20 text-sm">|</span>

          <button
            onClick={() => window.print()}
            className="text-muted/50 hover:text-foreground transition-colors text-sm font-mono cursor-pointer flex items-center gap-1.5"
            title="Download as PDF"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
