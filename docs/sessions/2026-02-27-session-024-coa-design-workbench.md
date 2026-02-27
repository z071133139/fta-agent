# Session 024: COA Design Workbench (PDD-006)

**Date:** 2026-02-27
**Focus:** Implement PDD-006 — replace markdown report for d-005-02 with persistent, editable tabbed workbench

---

## What Was Built

### 1. `coa-store.ts` — Zustand + localStorage store
- 4 domain types: COACodeBlock, COAAccountGroup, COADimension, COADecision
- Map-based CRUD for all domains
- `seedFromAgent(key, data)` hydrates from parsed agent JSON
- Per-tab chat message history (code_blocks, account_groups, dimensions, decisions)
- `seededAt`/`modifiedAt` timestamps
- `parseCOAOutput()` utility: regex extracts JSON from `<coa_design>` XML tags, validates structure
- `coaStoreKey()` helper for consistent key generation

### 2. `COADesignWorkbench.tsx` — Tabbed workbench component (~530 lines)
- **4 tabs:** Code Blocks, Account Groups, Dimensions, Decisions
- **Inline cell editing:** Click cell → input, Enter saves, Esc cancels
- **Decision cards:** Card layout with amber/emerald/red status borders, approve/reject buttons, consultant notes textarea
- **Pending badge:** Amber count on Decisions tab
- **Agent summary banner:** Collapsible with seeded/modified dates
- **Chat panel:** Collapsible right sidebar (40px → 280px), per-tab history, mock responses
- **Re-seed:** Confirmation dialog → clears store → re-runs agent
- **Add Row:** Available on all table tabs

### 3. Updated d-005-02 agent prompt
- Now requests structured JSON in `<coa_design>` tags instead of markdown tables
- Added "Do not narrate" instruction to suppress preamble
- Schema: summary, code_blocks[], account_groups[], dimensions[], decisions[]

### 4. Updated page.tsx routing (d-005-02 specific)
- `coaSeeded` → COADesignWorkbench
- `analysisRunning` → LiveAgentWorkspace with `onComplete` that parses JSON and seeds store
- `cachedAnalysis` → CompletedAnalysisView (fallback if JSON parse failed)
- else → DataAnalysisPreflight

### 5. Hydration fix for Zustand persist + SSR
- Added `storesHydrated` flag (false during SSR, true after useEffect mount)
- All persisted store conditionals use guarded values to prevent SSR/client mismatch
- Applied to both `cachedAnalysis` and `coaSeeded` checks

### 6. Mock backend COA response
- Added `_MOCK_RESPONSE_COA_DESIGN` with full `<coa_design>` JSON block
- Variant detection: prompts containing "compute_trial_balance", "coa", or "code block" get COA mock
- `_stream_mock` now accepts message parameter for variant selection
- Set `FTA_MOCK_AGENT=true` in `.env`

---

## Files Created
- `web/src/lib/coa-store.ts`
- `web/src/components/workspace/COADesignWorkbench.tsx`
- `docs/sessions/2026-02-27-session-024-coa-design-workbench.md`

## Files Modified
- `web/src/lib/mock-data.ts` — d-005-02 agent prompt (JSON output)
- `web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx` — d-005-02 routing + hydration fix
- `src/fta_agent/api/routes/stream.py` — mock backend COA response
- `.env` — added `FTA_MOCK_AGENT=true`
- `NEXT-STEPS.md` — session 025 pickup
- `docs/reference/feature-specs.md` — PDD-006 spec + session index
- `docs/plans/master-plan.md` — current position update

---

## Known Issues / Next Steps

1. **Stale localStorage** — user must clear `fta-analysis-store` and `fta-coa-store` from browser localStorage before first test (old markdown analysis cached from pre-PDD-006 runs)
2. **Live LLM testing** — prompt updated but not yet verified with real LLM output. Need to confirm the model follows the `<coa_design>` JSON format reliably.
3. **Chat panel** — currently returns mock responses. Needs backend wiring to `/api/v1/stream` for real agent follow-up questions.
4. **Export** — no PDF/Excel export yet (deferred per PDD scope).

---

## Build Status
`pnpm --filter web build` — clean pass
