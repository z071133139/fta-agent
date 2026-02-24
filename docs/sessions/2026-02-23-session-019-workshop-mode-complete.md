# Session 019 — Complete Workshop Mode (W5–W8)

**Date:** 2026-02-23
**Stream:** W — Workshop Mode
**Items:** W5 (remainder), W6, W7, W8

---

## Summary

Completed the Workshop Mode milestone. FTA can now serve as a live workshop tool — a consultant can run a business process workshop with FTA on the projector, capturing requirements and process changes in real-time against the leading practice baseline.

## What Was Built

### W5 — Agent Listening Mode (completed)

- **Y accept / Esc dismiss** on both requirements insight panel and Agentic Bridges panel
- **Arrow key navigation** in Agentic Bridges panel with focused item purple ring highlight
- **Cross-PA reference detection:** cyan chips (`→ PA-05`) shown in workshop mode when a requirement references another process area
- **Cmd+K command palette:** centered modal (480px), fuzzy search, arrow nav, Enter execute, Esc close. Commands: New Requirement, New Step, Flag Gap, Annotate, End Workshop, Export Summary, Fit to View
- **Hint labels** on suggestion chips (`Y accept · click to capture`)

### W6 — Micro-interactions

- CSS keyframes: `gap-pulse` (red box-shadow 300ms), `badge-flip` (Y-scale flip 250ms), `node-spring-in` (scale bounce 200ms)
- `@media (prefers-reduced-motion: reduce)` nullifies `.workshop-animate` class
- Node creation: workshop-placed nodes (ID `WN-*`) get spring animation via CSS
- Count badges: flip animation on increment in both CaptureBar and SummaryBar
- Gap flag: red box-shadow pulse on newly flagged nodes

### W7 — Browser Persistence

localStorage-based persistence (migrates to Supabase when Stream B forces API wiring):

- Key `fta-workshop-{engagementId}-{paId}` → full serialized session state
- Key `fta-workshop-sessions-index` → array of session summaries
- Serialize: Map→entries, Set→array. Deserialize: reverse.
- Auto-save: Zustand `subscribe` with 500ms debounce
- `startWorkshop` accepts `{ resume: true }` → hydrates from localStorage
- `endWorkshop` saves final state + session summary, then clears memory
- `reqSeq`/`nodeSeq` counters persisted and restored on resume

### W8 — Workshop Session Continuity

- **Session resume UX:** PA picker shows previous sessions with relative time, quick stats, Resume/New buttons. Direct-PA workspaces show Resume/New when previous session exists.
- **Workshop history panel:** Right slide-out (360px), reads from session index. Each card: PA name, date range, stats (new reqs, modified, nodes, gaps, deleted). Amber left border on most recent. Export button per session.
- **Export workshop summary:** JSON download (`workshop-{paId}-{date}.json`) with metadata, all changes, and statistics. Triggered from history panel and Cmd+K palette.

## New Files

| File | Purpose |
|------|---------|
| `web/src/components/workspace/CommandPalette.tsx` | Cmd+K command palette modal |
| `web/src/components/workspace/WorkshopHistory.tsx` | Session history slide-out panel |
| `web/src/lib/workshop-persistence.ts` | localStorage persistence + serialization + export |

## Modified Files

| File | Changes |
|------|---------|
| `web/src/lib/workshop-store.ts` | Major refactor: auto-save subscription, `exportJSON`, `commandPaletteOpen`, resume logic, session summary generation |
| `web/src/components/workspace/BusinessRequirementsTable.tsx` | Y/Esc on insight panel, cross-PA chips, hint labels, badge-flip animation |
| `web/src/components/workspace/ProcessFlowMap.tsx` | Agentic Bridges arrow nav, Y/Esc accept/dismiss, gap-pulse animation |
| `web/src/components/workspace/WorkspaceTopBar.tsx` | History button integration, session resume UX in PA picker |
| `web/src/components/workspace/CaptureBar.tsx` | Badge-flip animation on count changes |
| `web/src/components/workspace/process-flow/FlowNodeLayer.tsx` | node-spring-in animation for WN-* nodes |
| `web/src/hooks/useWorkshopKeyboard.ts` | Cmd+K handler for command palette |
| `web/src/app/globals.css` | CSS keyframes: gap-pulse, badge-flip, node-spring-in, prefers-reduced-motion |
| `web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx` | CommandPalette + WorkshopHistory wiring |

## Milestone

**Workshop Mode is fully operational.** All W1–W8 items complete. Stream W is done.

Coverage: 12/35 deliverables (34%).

## What's Next

- Session 020: Stream C — Platform Polish (WorkplanSpine sidebar, breadcrumbs, landing page improvements)
- Session 021: Stream A — Framework Expansion (A4–A10, covers all 7 workstreams, target 51%)
