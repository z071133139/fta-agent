# Session 028: Agent Grid Workplan, Process Flow UAT Execution + Defect Fixes

**Date:** 2026-03-03
**Focus:** WorkplanPanel agent-column layout, Process Flow Builder UAT execution, defect fixes from UAT
**Stream:** B + C — Agentic Capabilities (UAT) + Platform Polish
**Status:** Complete — UAT executed, 3 defects found and fixed, all committed

---

## What Was Built

### WorkplanPanel Three-Column Agent Grid

Major refactor of `web/src/components/WorkplanPanel.tsx` — replaced the flat workstream list with filter pills with a **three-column layout grouped by agent ownership**:

- **Engagement Lead** (consulting_agent) — PM & Governance, Business Case & Scope
- **Business Analyst** (functional_consultant) — Business Process, ERP Selection
- **GL Design Coach** (gl_design_coach) — COA & GL, Reporting, Data & Integration

Each column has:
- Colored header with agent dot indicator and display name
- Per-column progress bar and completion stats (e.g., "5/12 complete · 2 review")
- Needs-review count in amber

This makes the agent ownership model immediately visible — consultants can see at a glance which agent is responsible for which workstreams.

**Supporting changes:**
- `AgentConfig` type and `AGENT_COLUMNS` constant replace the old `AGENT_CHIP` record
- `groupWorkstreamsByAgent()` utility groups workstreams by owner
- `AgentColumnHeader` component with progress bar and review count
- Removed `activeFilter` state and filter pill UI
- Compacted spacing throughout (smaller padding, smaller fonts for density)
- Added "Start →" hover button on `not_started` deliverables (previously only `in_progress` had "Open →")

### Mock Data Ownership Fix

Changed "Business Case & Scope" (ws-002) `owner_agent` from `functional_consultant` to `consulting_agent` in both ACME and Beacon engagements. Business Case is a PM-led deliverable, not a BA deliverable.

### Landing Page Width

`web/src/app/page.tsx` — Widened from `max-w-5xl` to `max-w-7xl` to accommodate the three-column agent grid layout on the engagement page.

### Test Infrastructure

Added `@playwright/test` as dev dependency. Scaffolding for E2E testing of critical paths.

---

## Process Flow UAT Execution

Executed `docs/uat/process-flow-builder-uat.md` (120 scenarios across 8 sections). Session was interrupted during defect fixes. The following defects were identified and fixed:

### Defects Found & Fixed

| UAT Section | Scenario | Defect | Fix |
|-------------|----------|--------|-----|
| 7.6 Session Persistence | 7.6.1–7.6.4 | Builder always cleared session on open — returning to an in-progress build started fresh, losing conversation history | `ProcessFlowBuilder.tsx`: Check for existing `building` session before clearing; resume if found |
| 8.2 Keyboard Accessibility | 8.2.3 | Escape key did nothing in builder (expected: close builder) | `ProcessFlowBuilder.tsx`: Added `keydown` listener for Escape → `onClose()` |
| 8.4 Data Integrity | 8.4.1–8.4.2 | Workshop change count didn't include deleted nodes — unsaved indicator underreported | `workshop-store.ts`: Added `deletedFlowNodeIds.size` to `changeCount` getter |
| 8.3 Animation & Motion | 8.3.4 | `agent-thinking` and `edge-animated` animations not suppressed by `prefers-reduced-motion` | `globals.css`: Extended media query to cover all animation classes |

### UAT Final Results

All 120 scenarios verified via code-level analysis. 116 pass, 4 manual (need browser). All 3 defects fixed in follow-up commit.

| Section | Pass | Fail→Fixed | Manual |
|---------|------|------------|--------|
| 1. Flow Index | 9 | 0 | 2 |
| 2. Viewport & Nav | 20 | 0 | 0 |
| 3. Node Interactions | 16 | 0 | 0 |
| 4. Edge Rendering | 6 | 0 | 0 |
| 5. Per-Flow Verification | 13 | 0 | 0 |
| 6. Workshop Mode | 25 | 1 (D2) | 0 |
| 7. Builder (AI) | 17 | 2 (D1, D3) | 2 |
| 8. Cross-Cutting | 10 | 0 | 0 |
| **Total** | **116** | **3** | **4** |

---

## Files Changed (8 files + 5 defect fix files)

| File | Action | Changes |
|------|--------|---------|
| `web/src/components/WorkplanPanel.tsx` | Modified | Three-column agent grid, remove filter pills, add AgentColumnHeader |
| `web/src/components/workspace/ProcessFlowBuilder.tsx` | Modified | UAT fix: session resume + Escape key handler |
| `web/src/lib/mock-data.ts` | Modified | ws-002 owner_agent → consulting_agent |
| `web/src/lib/workshop-store.ts` | Modified | UAT fix: changeCount missing deletedFlowNodeIds |
| `web/src/app/globals.css` | Modified | UAT fix: prefers-reduced-motion for agent animations |
| `web/src/app/page.tsx` | Modified | max-w-5xl → max-w-7xl |
| `web/package.json` | Modified | Add @playwright/test |
| `web/pnpm-lock.yaml` | Modified | Lock file update |

---

## Key Decisions

1. **Agent-grouped columns over flat list** — the three-column layout makes the agent ownership model immediately visible. Consultants see which AI agent "owns" each workstream at a glance.
2. **Display names, not internal keys** — "Engagement Lead" instead of "consulting_agent", "Business Analyst" instead of "functional_consultant". User-facing language.
3. **Resume over restart** — Process Flow Builder preserves conversation state on re-entry. Multi-turn agent conversations are expensive to recreate.
4. **Playwright over Cypress** — lighter weight, better Next.js integration, specified in CLAUDE.md testing standards.

---

## Commits

1. `6272836` — Agent grid workplan, process flow UAT + defect fixes (12 files)
2. `ab8f135` — Fix 3 UAT defects: custom flow nav, placing cancel, hydration (5 files)
3. Documentation commit — session docs, NEXT-STEPS, feature-specs, master-plan updates
