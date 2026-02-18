# Session 008: Workplan Panel

**Date:** 2026-02-18
**Phase:** Development — Iteration 1.5 (Agent Harness / AI-Native Landing)
**Participants:** Product owner + Claude Code

---

## Session Context

Continuing the AI-native landing screen build from Session 007. This session focused on one feature: surfacing the engagement workplan directly on the landing page so consultants can see project status without entering an agent workspace.

---

## What Was Built

### WorkplanPanel — Landing Page Integration

A full-width accordion panel that expands below the engagement cards grid when a card is selected. The panel is keyed to the selected engagement — switching engagements swaps the panel with an entrance animation.

**Behavior:**
- Click an engagement card to open the workplan panel; click again to collapse (toggle)
- Workstream filter pills across the top let consultants narrow to a single workstream
- Each workstream row shows a collapsible deliverable list with progress counter and mini bar
- Progress counts everywhere (global, per-workstream, filter pills) exclude out-of-scope items

**Scope editing (interactive):**
- Hover any deliverable row → `−` / `+` toggle appears at far right
- Click to mark out of scope: row dims, name gets strikethrough, status replaced with "Out of Scope"
- Hover workstream header → "Mark OOS" / "Restore all" button appears
- All scope changes are local state for now; backend persistence planned in Iteration 1.5C

### Mock Data — P&C Standard Workplan Template

Full P&C Plan & Design workplan built into mock data for both engagements:
- **Acme Insurance (Design phase):** realistic mix of complete / in-progress / in-review / blocked across all 7 workstreams, reflecting active design phase
- **Beacon Reinsurance (Discovery phase):** mostly not-started, one item in-progress

Both share the canonical 7-workstream, 38-deliverable structure for P&C insurers on SAP S/4HANA.

### Backend — Pydantic Models + Template Factory

Two new backend files:
- `src/fta_agent/data/workplan.py` — `DeliverableStatus` StrEnum, `Deliverable`, `Workstream`, `Workplan` Pydantic v2 models with `in_scope: bool = True` field
- `src/fta_agent/data/workplan_template.py` — `build_pc_plan_design_template(engagement_id)` factory used by the Consulting Agent in 1.5C to create a standard workplan during engagement onboarding

---

## Decisions

No formal decisions logged. One design choice worth noting:

**Scope editing as local state:** Workplan scope changes (in/out of scope) are managed as client-side React state for now. The `in_scope: bool` field on the backend `Deliverable` model is ready for persistence — wiring it to the API is deferred to Iteration 1.5C when the Consulting Agent's workplan management tools are built.

---

## Future Requirements Captured

**Deliverable linking** — Each deliverable row should eventually link to its artifact: a document, an agent workspace page, or an output view. The `Deliverable` model will need an `artifact_ref` field (url or structured reference). Clicking a deliverable navigates to the relevant workspace. The `owner_agent` field already present gives us the routing target. Logged in deferred table of NEXT-STEPS.md.

---

## Files Changed

| File | Change |
|------|--------|
| `web/src/lib/mock-data.ts` | Added `DeliverableStatus`, `Deliverable`, `Workstream`, `Workplan` types; `in_scope?` field; `workplan?` on `Engagement`; full mock workplans for eng-001 and eng-002 |
| `web/src/components/WorkplanPanel.tsx` | New — full-width workplan accordion with scope editing |
| `web/src/app/page.tsx` | Wired `WorkplanPanel` below engagement grid; engagement card selection now toggles |
| `src/fta_agent/data/workplan.py` | New — Pydantic models for workplan entities |
| `src/fta_agent/data/workplan_template.py` | New — `build_pc_plan_design_template()` factory |

---

## Test Results

- 118 pytest tests passed, no regressions
- `pnpm --filter web build` clean — no TypeScript errors

---

## Open Items

None from this session.

## Next Session Priorities

1. **Iteration 1.5A — Agent Infrastructure** — this is the critical path item. Extended `AgentState`, Supabase auth integration, tool framework with lock enforcement, agent registry, LLM-based intent router.
2. When 1.5C is built (Consulting Agent upgrade), wire the `build_pc_plan_design_template()` factory into the engagement onboarding flow and connect scope changes to the API.
