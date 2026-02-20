# Session 013 — Custom Flow Renderer + AI & Agentic Engineering Framework

**Date:** 2026-02-20
**Duration:** ~3 hours
**Phase:** Phase 1 — Personal Use MVP · Iteration 1.5 — Agent Harness

---

## What We Built

### 1. Custom Process Flow Renderer

**Problem:** React Flow's swimlane nodes (`type: "group"`) intercept all pointer events at the wrapper div level, regardless of `pointer-events: none` on inner content. Three separate attempts to enable inline editing failed. The framework was fighting us on a core interaction pattern needed for every future state process map.

**Decision:** Replace React Flow entirely in `ProcessFlowMap.tsx` with a custom SVG/HTML hybrid renderer.

**Architecture — 4 new files in `web/src/components/workspace/process-flow/`:**

| File | Responsibility |
|------|---------------|
| `useFlowLayout.ts` | Dagre LR layout computation. Swimlane-pinned Y positions (Dagre Y discarded). Cubic bezier edge paths. Gateway bottom-port detection for cross-lane edges. |
| `useFlowViewport.ts` | Pan/zoom state. Wheel events with `{ passive: false }` for `preventDefault`. Space+drag pan. `requestAnimationFrame` for initial fit. Mouse-centered zoom math. |
| `FlowEdgeLayer.tsx` | SVG layer. `<marker>` arrowheads with correct `refX` tip alignment. `.edge-animated` CSS class for dashes. Related-edge highlighting. |
| `FlowNodeLayer.tsx` | HTML div nodes. `React.memo` on all sub-components. Click debounce (180ms timer) to distinguish select from double-click. `pointerEvents: none` on swimlane bands. |

**`ProcessFlowMap.tsx` rewritten** — no React Flow imports. Pan/zoom canvas div with `transform: translate(X) scale(Z)` at `transform-origin: 0 0`. Overlay panel positioned in viewport coordinates (outside canvas transform). Keyboard shortcuts: F=fit, +/-=zoom, Escape=deselect.

**`globals.css`** — removed all `.react-flow__*` overrides, added `@keyframes edge-flow` + `.edge-animated` for the flowing dash animation.

**Inline editing:** Double-click any task node → `<textarea autoFocus>` replaces label. Enter (no shift) commits, Escape cancels, blur commits. Click debounce prevents single-click handler firing on double-click.

**Fixes applied during session:**
- Swimlane labels too faint: `rgba(148,163,184,0.6)` → `#94A3B8` + `fontWeight: 600`
- React 19 border shorthand conflict: replaced `border` + `borderLeft` mix with explicit `borderStyle`, `borderWidth` (4-value), `borderColor` (4-value)
- Fit view timing: wrapped `fitView()` in `requestAnimationFrame`

---

### 2. AI & Agentic Engineering Framework

**Input:** User provided a 15,000-word framework document covering maturity model, 6 assessment dimensions, 6 architecture patterns, per-PA assessment data, and 4-wave implementation roadmap.

**Three deliverables built:**

#### A. Type enrichment — `web/src/lib/mock-data.ts`

Two new exported types:
```typescript
export type AgentLevel = "L0" | "L1" | "L2" | "L3" | "L4";
export type AgentPattern =
  | "reconciliation" | "posting" | "allocation"
  | "document_intelligence" | "close_orchestration" | "compliance_reporting";
```

Five new optional fields on `ProcessInventoryNode`:
```typescript
agent_wave?: 1 | 2 | 3 | 4;
agent_level?: AgentLevel;
agent_opportunity?: string;
agent_pattern?: AgentPattern;
agent_key_insight?: string;
```

All 20 PA nodes populated. Summary of assignments:

| Wave | PAs |
|------|-----|
| Wave 1 | PA-03 Premium, PA-08 Investment, PA-09 AP, PA-10 AR, PA-13 Cash, PA-20 Integration |
| Wave 2 | PA-01 CoA, PA-02 GL, PA-04 Claims, PA-05 Ceded RI, PA-11 Intercompany, PA-14 Expense, PA-16 Statutory, PA-17 GAAP, PA-18 Tax, PA-19 Mgmt Reporting |
| Wave 3 | PA-12 Fixed Assets, PA-15 Financial Close |
| Wave 4 | PA-06 Assumed RI, PA-07 Life Reserves |

| Level | PAs |
|-------|-----|
| L1 | PA-01, PA-06, PA-18 |
| L2 | PA-02, PA-03, PA-04, PA-05, PA-07, PA-08, PA-09, PA-10, PA-12, PA-14, PA-16, PA-17 |
| L3 | PA-11, PA-13, PA-15, PA-19, PA-20 |

#### B. `/framework` page — `web/src/app/framework/page.tsx`

Full scrolling standalone page (no workspace shell):
- **Hero** — title, subtitle, 4 stat chips
- **Why Insurance Finance** — 2-column: The Problem / Why AI Changes the Calculus
- **Agent Maturity Model** — L0–L4 horizontal strip cards, color-coded, with examples per level
- **6 Assessment Dimensions** — AR/AV/DM/RE/RC/TP in 3×2 grid with High/Low guidance
- **TP formula** — `TP = (AR + AV + DM) − RE − RC` callout
- **6 Architecture Patterns** — 3×2 grid: Reconciliation, Posting, Allocation, Document Intelligence, Close Orchestration, Compliance & Reporting
- **4-Wave Roadmap** — 2×2 card grid with timeline bar below
- **Value Metrics** — table: 6 metrics × 4 waves
- **CTA** — links to Process Inventory

Accessible at `/framework`. No auth or engagement context required — a standalone reference document.

#### C. ProcessInventoryGraph enhancements — `web/src/components/workspace/ProcessInventoryGraph.tsx`

- **Row badges:** Each PA row shows colored `W1`/`W2` wave chip and `L2`/`L3` level chip
- **Summary bar:** Added "Wave 1" count, "L3+" count, and `framework ↗` link
- **Detail drawer:** New "Agent Framework" section showing wave, level, pattern chip, opportunity text, and key insight callout

---

## Decisions Made

**DEC-042: Replace React Flow with custom renderer for ProcessFlowMap**
React Flow's node wrapper architecture makes it impossible to reliably neutralize pointer events on swimlane group nodes. Custom renderer is simpler, more performant for this use case (no drag/drop needed), and gives full control over click handling.

**DEC-043: Framework page as standalone route, not workspace deliverable**
The framework applies across all engagements and all 20 PAs — it's reference material, not an engagement artifact. A standalone `/framework` route is more appropriate than injecting it into the workspace shell.

**DEC-044: Agent data on mock nodes, not derived**
Wave and level assignments are editorial (based on the framework document), not computed from dimension scores at runtime. Scores can be added later if a scoring UI is built. For now, the assessments are pre-populated in mock data.

---

## Files Changed

| File | Change |
|------|--------|
| `web/src/components/workspace/process-flow/useFlowLayout.ts` | New — Dagre layout + bezier edges |
| `web/src/components/workspace/process-flow/useFlowViewport.ts` | New — pan/zoom hook |
| `web/src/components/workspace/process-flow/FlowEdgeLayer.tsx` | New — SVG edge layer |
| `web/src/components/workspace/process-flow/FlowNodeLayer.tsx` | New — HTML node layer |
| `web/src/components/workspace/ProcessFlowMap.tsx` | Rewritten — custom renderer |
| `web/src/app/globals.css` | Remove React Flow CSS, add edge-animated keyframe |
| `web/src/lib/mock-data.ts` | +2 types, +5 fields on ProcessInventoryNode, all 20 PAs annotated |
| `web/src/components/workspace/ProcessInventoryGraph.tsx` | Wave/level badges, agent intel drawer section |
| `web/src/app/framework/page.tsx` | New — standalone framework reference page |
| `NEXT-STEPS.md` | Updated |

---

## What's Next

Backend 1.5A remains the critical path — all frontend work runs on mock data.

Short-term frontend additions worth considering:
- **Framework page link from landing page** — the `/framework` page has no entry point from the main nav yet
- **Filter/sort by wave in ProcessInventoryGraph** — filter to "Wave 1 only" to show what to prioritize
- **AR/AV/DM/RE/RC dimension scores** on PA nodes if a scoring UI is desired
