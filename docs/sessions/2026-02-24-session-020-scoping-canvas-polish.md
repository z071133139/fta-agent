# Session 020: Scoping Canvas — Visual Polish & Tone Alignment

**Date:** 2026-02-24
**Focus:** Pursuit phase — Scoping Canvas contextual enhancements + design tone overhaul
**Stream:** Pursuit Phase (P1 — Scoping Canvas)

---

## What Was Built

### Enhancement 1: Hub Crossfade — Executive Question on Hover/Focus
- Center hub crossfades from client name to the hovered theme's `executiveQuestion`
- `AnimatePresence mode="wait"` with 150ms fade
- Responds to both mouse hover and keyboard focus (Tab navigation)
- Returns to client name when mouse leaves or no theme focused

### Enhancement 2: Dependency Lines — Cross-Theme Highlighting
- Static `THEME_DEPENDENCIES` map (e.g., Close & Consol → Accounting Foundation + Data & Integration)
- When hovering a theme, its upstream dependency connection lines brighten
- `highlightedIds: Set<string>` passed to ConnectionLayer
- Highlighting stops when panel is open

### Enhancement 3: Per-Node Progress Rings (Apple Watch Style)
- `NodeProgressRing` component: SVG arc with 2px stroke, track at 0.3 opacity
- Fills proportionally as questions are answered
- Positioned over the icon circle, replaces old border

### Enhancement 4: Directional Pulse Animation on Connection Lines
- CSS `stroke-dasharray` animation flowing hub → node
- Subtle 2.5s cycle, only on hovered/active connections
- Single `data-stream` class in globals.css

### Enhancement 5: Mouse-Tracked Parallax Tilt
- `useParallaxTilt` hook tracks mouse position relative to container center
- Applies `rotateX`/`rotateY` (max 1.2deg) with `perspective: 1200px`
- 150ms eased transition, resets on mouse leave

### Enhancement 6: Tunnel Vision Effect on Hover
- When hovering a node, non-related nodes (not hovered, not dependencies) dim to opacity 0.15
- Pure opacity dimming, no blur — restrained approach
- Clears when mouse leaves or panel opens

### Enhancement 7: Glassmorphism on ThemePanel
- Panel: `rgba(15, 23, 42, 0.85)` with `blur(24px) saturate(1.4)`
- Sticky header/footer: lighter `rgba(15, 23, 42, 0.70)` with `blur(16px)`
- Border: `border-white/10`

---

## Design Tone Overhaul

Initial implementation felt "too playful" — colorful emojis, rainbow node names, bright glow effects. Overhauled to match enterprise consulting tone:

### Canvas (ScopingCanvas.tsx)
- **Emojis:** `grayscale(0.85) brightness(1.2)` by default, color only when expanded/turbulent
- **Node names:** All `#CBD5E1` (slate-300), white only when expanded. No per-theme rainbow.
- **Focus ring:** Thin 1px `muted/30` border (was thick blue ring)
- **Connection lines:** `#334155` at 0.25 opacity idle. No glow filters.
- **Progress rings:** `#64748B` (slate-500), not green or theme-colored
- **Parallax:** 1.2deg max
- **Hover scale:** 1.05 (from 1.08)
- **Hub radar sweep:** Halved opacity

### Panel (ThemePanel.tsx)
- **Title:** White `font-mono` (was cyan serif)
- **Executive question:** `font-mono text-muted/50` (was italic serif with quotes)
- **Section headers:** `text-muted/50 font-mono` (was bright colorHex)
- **Question cards:** Muted borders (was bright blue/green)
- **All controls:** Monochrome — scope pills, priority dots, pain levels
- **Everything uses `font-mono`** — consistent system-readout feel

### Design Philosophy
- **Monochrome by default, color earned through interaction/state**
- Pain-driven turbulence (red-shift) only on critical/significant pain levels
- No decorative animation — everything serves a functional purpose

---

## Files Modified

| File | Changes |
|------|---------|
| `web/src/components/pursue/ScopingCanvas.tsx` | All 6 canvas enhancements + tone overhaul |
| `web/src/components/pursue/ThemePanel.tsx` | Glassmorphism + full monochrome redesign |
| `web/src/app/globals.css` | `data-stream` animation, removed unused animation classes |

---

## Verification

- `pnpm --filter web build` — clean
- Hub crossfade on hover/focus works
- Dependency highlighting on hover
- Progress rings fill proportionally
- Tunnel vision dims non-related nodes
- Parallax tilt subtle on mouse move
- Panel opens with glassmorphism effect
- Monochrome tone consistent across canvas + panel
