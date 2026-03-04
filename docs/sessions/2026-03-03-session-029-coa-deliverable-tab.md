# Session 029: COA Deliverable Tab + Agent Backlog

**Date:** 2026-03-03
**Focus:** PDD-012 COA Design Deliverable tab, sidebar cleanup, agent backlog reference doc
**Stream:** B — Agentic Capabilities

---

## What Was Built

### PDD-012: COA Design Deliverable Tab

Added a read-only "Deliverable" tab (8th tab) to the COA Design Workbench that assembles all workbench data into a structured, presentation-quality document view.

**Store changes (`coa-store.ts`):**
- Added `DeliverableStatus` type: `draft | ready_for_review | under_review | approved`
- Exported `TabId` (added `"deliverable"` to union)
- Added `deliverableStatus` to per-key store state (default `"draft"`)
- Added `setDeliverableStatus` action
- Persist version bumped to 4 with migration

**New component (`coa-tabs/COADeliverable.tsx`):**
- `DeliverableStatusBar` — progress bar (N/9 ready), status lifecycle buttons (Draft → Ready for Review → Under Review → Approved), reset to draft from any state
- 9 numbered document sections with serif headers (`font-display`):
  1. Executive Summary — agent narrative
  2. Future State Account String — segments table from mock data
  3. Code Block Structure — from coa-store
  4. Account Group Taxonomy — from coa-store
  5. Dimension Design — from coa-store, shows open issue count
  6. FSLI Hierarchy Mapping — from hierarchy-store, shows tier breakdown per perspective + pending Tier 3 accounts
  7. Design Decisions Log — from coa-store, shows approved/pending/rejected counts
  8. Coverage Analysis — compact matrix from mock data
  9. Open Items & Risks — aggregated from dimensions, hierarchy, decisions
- Per-section readiness badges (green/amber/red) computed live from store data
- "Edit →" buttons on sections with open items navigate to relevant editing tab
- All read-only — no editable fields

**Workbench integration (`COADesignWorkbench.tsx`):**
- 8th tab "Deliverable" with `dividerBefore` separator
- Tab badge: amber count of non-ready sections, or green check when all 9 ready
- Chat panel hidden on deliverable tab (presentation view)
- `onNavigateToTab` callback passed to deliverable component

### Sidebar Cleanup + Agent Backlog

Removed 4 not-yet-built deliverables from sidebar mock data (both engagement instances):
- d-005-05 Document Splitting Configuration Spec
- d-005-06 P&C-Specific Account Groups (NAIC alignment)
- d-005-07 GL Open Items / Clearing Accounts Inventory
- d-005-08 Multi-GAAP Ledger Design (IFRS 17, US GAAP, Stat)

Created `docs/reference/agent-backlog.md` with backlog items organized by all three agents:
- GL Design Coach: 4 items
- Functional Consultant: 12 items
- Consulting Agent: 3 items

Each entry includes ID, dependencies, and domain context.

---

## Files Created/Modified

| File | Action |
|------|--------|
| `web/src/lib/coa-store.ts` | Modified — DeliverableStatus type, deliverableStatus field, setDeliverableStatus action, TabId exported with "deliverable", persist v4 migration |
| `web/src/components/workspace/coa-tabs/COADeliverable.tsx` | Created — 9-section deliverable view with status lifecycle and readiness indicators |
| `web/src/components/workspace/COADesignWorkbench.tsx` | Modified — 8th tab, readiness badge, chat panel hiding, TabId import |
| `web/src/lib/mock-data.ts` | Modified — removed 4 backlog deliverables from ws-005 (both engagements) |
| `docs/reference/agent-backlog.md` | Created — backlog reference for all 3 agents |

---

## Key Decisions

1. **Readiness is computed, not stored.** Always fresh from current store data. No stale indicators.
2. **Status independent of readiness.** Consultant decides when to advance — matches real consulting workflow where you send documents with known open items.
3. **One component file with sub-components.** Follows established pattern from other coa-tabs.
4. **Backlog deliverables moved to reference doc.** Sidebar only shows deliverables that have workspaces or are actively being worked on.

---

## Build Status

`pnpm --filter web build` — clean (both after PDD-012 and after sidebar cleanup)

---

## Coverage Update

WS-005 COA & GL: 4/4 active deliverables have workspaces (d-005-01 through d-005-04). 4 backlog items moved to `docs/reference/agent-backlog.md`.

Overall: 16/32 active deliverables (50%) + custom flows. Backlog: 19 items across 3 agents.
