"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PITCH_SLIDES } from "@/lib/pitch-deck-data";
import { TitleSlide } from "./slides/TitleSlide";
import { TwoColumnSlide } from "./slides/TwoColumnSlide";
import { ThreeColumnSlide } from "./slides/ThreeColumnSlide";
import { StatsSlide } from "./slides/StatsSlide";
import { Phase0Slide } from "./slides/Phase0Slide";
import { RoadmapSlide } from "./slides/RoadmapSlide";
import { ValueSlide } from "./slides/ValueSlide";
import { SlideControls } from "./SlideControls";

const HIDE_CONTROLS_MS = 3000;

export function PitchDeck() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive slide index from URL
  const slideParam = searchParams.get("slide");
  const currentSlide = slideParam
    ? Math.max(0, Math.min(Number(slideParam) - 1, PITCH_SLIDES.length - 1))
    : 0;

  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSlide = useCallback(
    (n: number) => {
      const clamped = Math.max(0, Math.min(n, PITCH_SLIDES.length - 1));
      router.replace(`/pitch?slide=${clamped + 1}`, { scroll: false });
    },
    [router]
  );

  const goNext = useCallback(() => {
    if (currentSlide < PITCH_SLIDES.length - 1) setSlide(currentSlide + 1);
  }, [currentSlide, setSlide]);

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

  const slide = PITCH_SLIDES[currentSlide];
  if (!slide) return null;

  return (
    <div
      className="h-screen w-screen bg-background overflow-hidden select-none relative"
      onMouseMove={showControls}
    >
      {/* Click zones for nav */}
      <div
        className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
        onClick={goPrev}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer"
        onClick={goNext}
      />

      {/* Slide content — above click zones for interactive elements */}
      <div className="relative z-20 h-full pointer-events-none">
        <div className="pointer-events-auto h-full">
          {slide.type === "title" && <TitleSlide data={slide} />}
          {slide.type === "two-column" && (
            <TwoColumnSlide data={slide} slideNumber={currentSlide + 1} />
          )}
          {slide.type === "three-column" && <ThreeColumnSlide data={slide} />}
          {slide.type === "stats" && <StatsSlide data={slide} />}
          {slide.type === "phase0" && <Phase0Slide data={slide} />}
          {slide.type === "roadmap" && <RoadmapSlide data={slide} />}
          {slide.type === "value" && <ValueSlide data={slide} />}
        </div>
      </div>

      {/* Controls */}
      <SlideControls
        currentSlide={currentSlide}
        visible={controlsVisible}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  );
}
