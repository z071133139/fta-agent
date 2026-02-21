# Session 014: Business Requirements + ERP Fit/Gap Workspace

**Date:** 2026-02-20
**Iteration:** 1.5 — Agent Harness (frontend continues ahead of backend)

---

## What Was Built

### Business Requirements Workspace (d-004-04)

Built the third graph workspace type — a full requirements catalog with ERP Fit/Gap analysis, completing the Business Process Design workstream's frontend deliverables.

#### New Types (`mock-data.ts`)

- `BusinessRequirement` — id, pa_id, sp_id, tag (REG/FIN/OPS/CTL/INT), segment (P&C/Life/Re/All), text, status, optional fit_gap
- `FitGapAnalysis` — erp_assessments array, gap_remediation, gap_effort, agentic_rating, agentic_bridge, agentic_autonomy
- `ERPAssessment` — platform, rating (F1–F5), notes
- `BusinessRequirementsData` — kind discriminator for workspace dispatch
- Extended `ProcessGraphData` union to include `BusinessRequirementsData`

#### Data (`mock-requirements.ts` — NEW)

- 324 requirements across all 20 process areas
- PA-05 (Ceded Reinsurance) is the Fit/Gap pilot: 25 requirements with full 4-platform ERP assessments
  - SAP with FS-RI, SAP without FS-RI, Oracle Cloud ERP, Workday Financials
  - Each assessment includes fit rating, notes, gap remediation, effort sizing, agentic gap closure rating
- Remaining 299 requirements have substantive insurance finance domain text, no fit_gap yet

#### Component (`BusinessRequirementsTable.tsx` — NEW)

- **SummaryBar** — total count, assessed count, F1/F2/F3/F4/F5 distribution, agentic rating counts, tag distribution
- **FilterBar** — search, tag chips, segment chips, fit rating chips (F1–F5), agentic rating chips (A0–A3), "Assessed only" toggle
- **Framework Legend** — collapsible panel explaining the Fit/Gap and Agentic rating frameworks, right-aligned toggle button
- **ProcessAreaGroup** — collapsible PA headers with count and "assessed" badge
- **RequirementRow** — ID, tag badge, segment badge, truncated text, inline fit/agentic badges (assessed only), status badge, expand chevron
- **DetailPanel** — SP/PA reference, full requirement text, FitGapCard (when assessed)
- **FitGapCard** — ERP assessment table (4 platforms × rating + notes), gap remediation with effort badge, agentic bridge with autonomy level

#### Workspace Dispatch (`page.tsx`)

- Added `business_requirements` branch alongside `process_inventory` and `process_flow`
- d-004-04 workspace updated: run_state "running" (auto-transitions to complete), graph data wired, activity steps reflect loaded state

---

## Design Decisions

- **324 requirements vs. 314 planned** — minor overshoot, no functional impact
- **PA-05 as Fit/Gap pilot** — widest ERP variance (SAP FS-RI vs without is a 15-of-25 rating swing), makes the assessment framework compelling
- **Inline fit badges on rows** — show SAP with FS-RI rating (the engagement's ERP) for quick scanning; non-assessed rows stay clean
- **Framework Legend** — starts collapsed to avoid overwhelming first-time viewers; teaches the F1–F5 and A0–A3 scales in-place

---

## Files Changed

| File | Change |
|------|--------|
| `web/src/lib/mock-data.ts` | BR + FitGap types, ProcessGraphData union, d-004-04 workspace updated |
| `web/src/lib/mock-requirements.ts` | **New** — 324 BusinessRequirement objects |
| `web/src/components/workspace/BusinessRequirementsTable.tsx` | **New** — requirements + fit/gap component |
| `web/src/app/[engagementId]/deliverables/[deliverableId]/page.tsx` | business_requirements dispatch |

---

## Business Process Design Workstream — Frontend Status

All four workspace types now have frontend implementations:

| Deliverable | Workspace Type | Status |
|-------------|---------------|--------|
| d-004-01 Process Inventory | ProcessInventoryGraph | Complete (Session 012–013) |
| d-004-03 Future State Process Maps | ProcessFlowMap | Complete (Session 012–013) |
| d-004-04 Business Requirements | BusinessRequirementsTable | Complete (this session) |
| d-004-05 User Stories Backlog | — | Not started |
| d-004-06 Process Gap Analysis | — | Not started |

---

## What's Next

- Backend 1.5A remains the critical path blocker
- d-004-05 User Stories and d-004-06 Gap Analysis are lower priority frontend items
- The Fit/Gap framework is ready to be extended to other PAs once the agent can run assessments
