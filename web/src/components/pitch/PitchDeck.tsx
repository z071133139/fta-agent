"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PITCH_SLIDES, EXEC_PITCH_SLIDES } from "@/lib/pitch-deck-data";
import { TitleSlide } from "./slides/TitleSlide";
import { TwoColumnSlide } from "./slides/TwoColumnSlide";
import { ThreeColumnSlide } from "./slides/ThreeColumnSlide";
import { StatsSlide } from "./slides/StatsSlide";
import { Phase0Slide } from "./slides/Phase0Slide";
import { RoadmapSlide } from "./slides/RoadmapSlide";
import { ValueSlide } from "./slides/ValueSlide";
import { ShowcaseSlide } from "./slides/ShowcaseSlide";
import { SlideControls } from "./SlideControls";
import type { SlideData } from "@/lib/pitch-deck-data";

const HIDE_CONTROLS_MS = 3000;

/** Render a slide by type — shared between screen and print views */
function RenderSlide({ slide, slideNumber }: { slide: SlideData; slideNumber: number }) {
  switch (slide.type) {
    case "title":
      return <TitleSlide data={slide} />;
    case "two-column":
      return <TwoColumnSlide data={slide} slideNumber={slideNumber} />;
    case "three-column":
      return <ThreeColumnSlide data={slide} />;
    case "stats":
      return <StatsSlide data={slide} />;
    case "phase0":
      return <Phase0Slide data={slide} />;
    case "roadmap":
      return <RoadmapSlide data={slide} />;
    case "value":
      return <ValueSlide data={slide} />;
    case "showcase":
      return <ShowcaseSlide data={slide} />;
    default:
      return null;
  }
}

export function PitchDeck() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Select deck based on query param
  const deckParam = searchParams.get("deck");
  const slides = deckParam === "exec" ? EXEC_PITCH_SLIDES : PITCH_SLIDES;

  // Derive slide index from URL
  const slideParam = searchParams.get("slide");
  const currentSlide = slideParam
    ? Math.max(0, Math.min(Number(slideParam) - 1, slides.length - 1))
    : 0;

  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSlide = useCallback(
    (n: number) => {
      const clamped = Math.max(0, Math.min(n, slides.length - 1));
      const deckSuffix = deckParam === "exec" ? "&deck=exec" : "";
      router.replace(`/pitch?slide=${clamped + 1}${deckSuffix}`, { scroll: false });
    },
    [router, slides.length, deckParam]
  );

  const goNext = useCallback(() => {
    if (currentSlide < slides.length - 1) setSlide(currentSlide + 1);
  }, [currentSlide, slides.length, setSlide]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) setSlide(currentSlide - 1);
  }, [currentSlide, setSlide]);

  // Auto-hide controls
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), HIDE_CONTROLS_MS);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Ignore if user is in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      showControls();

      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "Escape":
          e.preventDefault();
          router.push("/");
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          setSlide(Number(e.key) - 1);
          break;
        case "0":
          setSlide(9); // slide 10
          break;
        case "-":
          setSlide(10); // slide 11
          break;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, router, setSlide, showControls]);

  // Mouse movement shows controls
  useEffect(() => {
    function handleMove() {
      showControls();
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [showControls]);

  // Initial hide timer
  useEffect(() => {
    hideTimer.current = setTimeout(() => setControlsVisible(false), HIDE_CONTROLS_MS);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const slide = slides[currentSlide];
  if (!slide) return null;

  return (
    <>
      {/* ── Screen view: single active slide ── */}
      <div
        className="h-screen w-screen bg-background overflow-hidden select-none relative print:hidden"
        onMouseMove={showControls}
      >
        {/* Close button */}
        <button
          onClick={() => router.push("/")}
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/80 border border-border/40 hover:border-muted/40 hover:bg-surface transition-all text-xs font-mono text-muted/60 hover:text-muted cursor-pointer backdrop-blur-sm ${
            controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          } transition-opacity duration-500`}
        >
          esc
          <span className="text-muted/30">|</span>
          exit
        </button>

        {/* Click zones for nav */}
        <div
          className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
          onClick={goPrev}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer"
          onClick={goNext}
        />

        {/* Slide content */}
        <div className="relative z-20 h-full pointer-events-none">
          <div className="pointer-events-auto h-full">
            <RenderSlide slide={slide} slideNumber={currentSlide + 1} />
          </div>
        </div>

        {/* Controls */}
        <SlideControls
          currentSlide={currentSlide}
          totalSlides={slides.length}
          visible={controlsVisible}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>

      {/* ── Print view: ALL slides, one per page ── */}
      <div className="hidden print:block">
        {slides.map((s, i) => (
          <div
            key={i}
            className="w-screen h-screen bg-background overflow-hidden"
            style={{ pageBreakAfter: i < slides.length - 1 ? "always" : "auto" }}
          >
            <RenderSlide slide={s} slideNumber={i + 1} />
          </div>
        ))}
      </div>
    </>
  );
}
