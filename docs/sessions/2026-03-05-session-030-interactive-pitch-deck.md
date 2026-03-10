# Session 030 — Interactive Pitch Deck

**Date:** 2026-03-05
**Focus:** PDD-013 — Full-screen interactive pitch deck at `/pitch`

## What Was Built

- **PDD-013: Interactive Pitch Deck** — 11 full-screen navigable slides rendered with the app's native design system at `/pitch`
- **6 slide type components:** TitleSlide, Phase0Slide (two-panel timeline+costs), TwoColumnSlide, ThreeColumnSlide, ValueSlide, RoadmapSlide
- **Keyboard navigation:** Arrow keys, Space (next/prev), Escape (exit), number keys 1-9/0/- for direct jump
- **Click zones:** Left/right thirds of screen for prev/next
- **URL state:** `/pitch?slide=N` preserves position
- **"See it live" demo links** on slides 6, 7, 8 — navigate to actual workspaces with `?from=pitch&slide=N` query params
- **PitchReturnPill** — floating top-right pill on workspace pages when navigated from pitch deck, returns to originating slide
- **Auto-hiding controls** — bottom bar with progress dots, slide counter, nav arrows; visible on mouse move, fades after 3s
- **Content** sourced from `docs/content/fta-slide-deck-content.md` with corrections (COA updates, phase naming, eight-tab workbench)

## Files Created/Modified

- `web/src/app/pitch/page.tsx` — route page
- `web/src/components/pitch/PitchDeck.tsx` — main deck component
- `web/src/components/pitch/SlideControls.tsx` — bottom control bar
- `web/src/components/pitch/PitchReturnPill.tsx` — floating return pill
- `web/src/components/pitch/slides/*.tsx` — 7 slide type components
- `web/src/lib/pitch-deck-data.ts` — typed slide content array
- `web/src/app/[engagementId]/layout.tsx` — PitchReturnPill integration

## Commits

- `a35c972` Session 030: Add interactive pitch deck at /pitch
