# PDD-010: Mission Control Landing Page

**Scope:** Replace the current landing page (engagement cards + agent team grid + workplan panel) with a single-screen mission control view organized by "what do I do next?"
**Priority:** High — current landing page has dead agent links, duplicated information, and forces unnecessary navigation
**Depends on:** PDD-009 (workstream data gates, for data status widget)

---

## Problem

The current landing page has three disconnected sections:
1. **Engagement cards** — visual showcase with agent buttons (`GL Design Coach`, `Functional`, `Consulting`) that route to non-existent pages (`/eng-001/gl-coach` → 404)
2. **WorkplanPanel** — expands below the card, pushing the agent section off-screen
3. **"Your Consulting Team"** — static glossary of agents with an "Open for Acme" button that also routes to dead pages

A consultant opening the app wants to know: what needs my attention? where was I? what's the status? Instead they see a marketing-style card layout that requires multiple clicks to reach actual work. The engagement dashboard (`/[engId]`) duplicates stats already shown on the landing page.

Additionally, there's no concept of **who else is working on what**. With multiple consultants on an engagement (SK, TR, PM), nobody can see if a colleague is already in a deliverable or recently touched it.

---

## Solution

Single-screen mission control:
- **Context selector** — compact dropdown listing both engagements AND pursuits (same level). Type badge distinguishes them (`Design`, `Discovery`, `Pursuit`). Selecting a pursuit loads that pursuit's content; selecting an engagement loads the workplan mission control.
- **Stats bar** — inline with selector, content adapts to type (engagement stats vs. pursuit stats)
- **Two-column layout below:**
  - Left (60%): Attention queue + full workplan with presence pips (engagement) or pursuit deliverables (pursuit)
  - Right (40%): Resume card, data status widget
- **Passive presence** — mock consultant location data, shown as avatar pips on workplan rows
- **Kill:** engagement dashboard page (redirect to landing), agent cards section, engagement card grid, separate pursuit section

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FTA                                              framework ↗    Sign out  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Good afternoon, Sarah.                                                     │
│  RACI Matrix has 3 gaps awaiting your input.                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────── ┐ │
│  │  Acme Insurance ▾           P&C · SAP S/4HANA · Design Phase          │ │
│  │                                                                        │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐    13/35 ━━░░░   │ │
│  │  │  3   │  │  2   │  │  12  │  │  3   │  │  1   │    37% complete   │ │
│  │  │ open │  │ HIGH │  │ reqs │  │unval │  │block │                    │ │
│  │  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘                    │ │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Left (60%) ─────────────────────────┬─ Right (40%) ──────────────────┐ │
│  │                                       │                                │ │
│  │  NEEDS YOUR ATTENTION  3              │  RESUME                        │ │
│  │  ────────────────────────────         │  ────────────────────────      │ │
│  │                                       │  Last opened 2h ago            │ │
│  │  ● GL Open Items / Clearing Accts     │  ┌────────────────────────┐   │ │
│  │    Awaiting trial balance extract     │  │  COA Design            │   │ │
│  │    COA & GL Design       Resolve →    │  │  GL Design Coach       │   │ │
│  │                                       │  │  Profit centre draft   │   │ │
│  │  ● RACI Matrix              TR 20m    │  │  2 decisions pending   │   │ │
│  │    8/12 roles · 3 gaps in claims      │  │       Continue ›       │   │ │
│  │    Project Mgmt             Review →  │  └────────────────────────┘   │ │
│  │                                       │                                │ │
│  │  ● Stakeholder Map                    │  DATA                          │ │
│  │    14 stakeholders · CFO/CTO pending  │  ────────────────────────      │ │
│  │    Business Case            Review →  │  COA & GL Design   ● ws-005   │ │
│  │                                       │  ● TB  ○ COA Extract           │ │
│  │                                       │  1/2 uploaded      → Setup    │ │
│  │  WORKPLAN                             │                                │ │
│  │  ────────────────────────────         │                                │ │
│  │                                       │                                │ │
│  │  All  PM&G 2/5  BC&S 2/4  ERP 4/5   │                                │ │
│  │  BPD 0/5  COA 1/8  R&A 1/5  D&I 0/5 │                                │ │
│  │                                       │                                │ │
│  │  › PM & Governance  TR    2/5         │                                │ │
│  │    Consulting Agent  ⚠ 1 review       │                                │ │
│  │                                       │                                │ │
│  │  › Business Case & Scope        2/4   │                                │ │
│  │    Functional  ⚠ 1 review             │                                │ │
│  │                                       │                                │ │
│  │  › ERP Software Selection       4/5   │                                │ │
│  │    Consulting Agent                   │                                │ │
│  │                                       │                                │ │
│  │  › Business Process Design      0/5   │                                │ │
│  │    Functional  ● 2 active             │                                │ │
│  │                                       │                                │ │
│  │  ● COA & GL Design  SK    1/8         │                                │ │
│  │    GL Design Coach  ⚠ 1 blocked       │                                │ │
│  │                                       │                                │ │
│  │  › Reporting & Analytics        1/5   │                                │ │
│  │  › Data & Integration           0/5   │                                │ │
│  └───────────────────────────────────────┴────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Context Selector (dropdown open) — engagements + pursuits together

```
  ┌───────────────────────────────────────────────────────────┐
  │  Acme Insurance ▾           P&C · SAP S/4HANA · Design   │
  │  ┌────────────────────────────────────────────────────┐   │
  │  │  ENGAGEMENTS                                       │   │
  │  │  ● Acme Insurance      Design         2h ago       │   │
  │  │    Beacon Reinsurance   Discovery      3d ago       │   │
  │  │                                                    │   │
  │  │  PURSUITS                                          │   │
  │  │    New Client Scoping   P&C Carrier    ready       │   │
  │  │                                                    │   │
  │  │  ─────────────────────────────────────────────     │   │
  │  │    + New Engagement    + New Pursuit                │   │
  │  └────────────────────────────────────────────────────┘   │
  └───────────────────────────────────────────────────────────┘
```

### Pursuit selected — different content layout

When a pursuit is selected, the stats bar shows pursuit-specific info and the
left column shows the pursuit's deliverables instead of the workplan:

```
  ┌───────────────────────────────────────────────────────────────────────── ┐
  │  New Client Scoping ▾       P&C Carrier · CFO/Controller · Pursuit      │
  │                                                                         │
  │  1 context · 7 themes · 76 scoping questions · Ready for exec session   │
  └─────────────────────────────────────────────────────────────────────────┘

  ┌─ Left (60%) ─────────────────────────┬─ Right (40%) ──────────────────┐
  │                                       │                                │
  │  DELIVERABLES                         │  RESUME                        │
  │  ────────────────────────────         │  ────────────────────────      │
  │                                       │  ...                           │
  │  ● Scoping Canvas                     │                                │
  │    76 questions · Rapid 12 + Deep     │                                │
  │    Dive · Ready            Open →     │                                │
  │                                       │                                │
  │  ○ Executive Summary                  │                                │
  │    Not started             Open →     │                                │
  │                                       │                                │
  │  ○ Value Hypothesis                   │                                │
  │    Not started             Open →     │                                │
  │                                       │                                │
  │  ...                                  │                                │
  └───────────────────────────────────────┴────────────────────────────────┘
```

### First Visit / No Selection

Falls back to simpler card view with both types:

```
  GET STARTED                                                  + New
  ─────────────────────────────────────────────────────────────────

  ENGAGEMENTS
  ┌──────────────────────────────┐  ┌──────────────────────────────┐
  │ ▎Acme Insurance              │  │  Beacon Reinsurance          │
  │  P&C · Design · 2h ago      │  │  Reinsurance · Discovery     │
  │  SK  TR  PM                  │  │  SK                          │
  │  3 decisions · 2 HIGH        │  │  No urgent items             │
  │            Open ›            │  │            Open ›            │
  └──────────────────────────────┘  └──────────────────────────────┘

  PURSUITS
  ┌──────────────────────────────┐
  │ ▎New Client Scoping          │
  │  P&C Carrier · CFO Meeting   │
  │  76 questions · Ready        │
  │            Open ›            │
  └──────────────────────────────┘
```

---

## State Machine

```
                    ┌──────────────────────┐
                    │  No engagement       │
                    │  selected            │
                    │  (card picker view)  │
                    └──────────┬───────────┘
                               │ click "Open"
                               ▼
                    ┌──────────────────────┐
                    │  Engagement selected │◄──── dropdown change
                    │  (mission control)   │
                    └──────────┬───────────┘
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
        Click attention   Click resume    Click workplan
        queue item        "Continue"      deliverable
               │               │               │
               └───────────────┴───────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  /[engId]/deliverables│
                    │  /[deliverableId]     │
                    └──────────────────────┘
```

---

## Presence Model (Mock)

```typescript
interface ConsultantPresence {
  consultant_id: string;
  deliverable_id: string | null;
  last_seen: string;    // ISO timestamp
  is_active: boolean;   // true = tab focused recently
}
```

Added to `Engagement` as `presence?: ConsultantPresence[]`. Mock data:

| Consultant | Location | Last seen | Active |
|---|---|---|---|
| SK (you) | d-005-02 (COA Design) | 2h ago | false |
| TR | d-001-03 (RACI Matrix) | 20m ago | true |
| PM | null (idle) | 2d ago | false |

Presence appears as:
- **Attention queue:** avatar pip + relative time on matching items
- **Workplan rows:** avatar pip(s) next to workstream name if someone is in a deliverable within it
- **Workplan expanded rows:** avatar pip on the specific deliverable row

---

## Key Design Decisions

1. **Kill engagement dashboard page** — `/[engId]` redirects to `/` with that engagement pre-selected via query param (`/?eng=eng-001`). No more dead-end stats page.
2. **Pursuits and engagements are peers in the dropdown** — same selector, grouped by type with section headers (`ENGAGEMENTS` / `PURSUITS`). Type badge distinguishes them. Selecting either changes the full page content.
3. **Content adapts to selection type** — engagement selected: stats bar + attention queue + workplan + data widget. Pursuit selected: pursuit summary + pursuit deliverables list. The layout structure (two columns) stays the same, content swaps.
4. **Attention queue replaces "Needs Input" banner** — promoted from inside the workplan to top-level left column. Always visible, no expand needed. Only shows for engagements (pursuits don't have blocked/review items).
5. **Resume card is personal** — based on logged-in consultant's last deliverable. Uses `presence` data filtered to current user. Works for both engagements and pursuits.
6. **WorkplanPanel reused** — the existing `WorkplanPanel` component (filter pills, workstream rows, expand/collapse, OOS toggles) is the workplan section. Enhanced with presence pips but same core logic.
7. **selectedContext persisted** — `localStorage` stores both the ID and type (engagement vs pursuit) so returning to `/` remembers your last context.
8. **No agent buttons anywhere** — agents are shown as labels on workstream rows (already there). No standalone agent navigation.
9. **No separate pursuit section** — pursuits are no longer a top-of-page section. They live in the dropdown alongside engagements. This eliminates the visual hierarchy that made pursuits feel like a different product.

---

## Scope

### In

| # | Deliverable | Purpose |
|---|---|---|
| 1 | Rewrite `/page.tsx` | Mission control layout: selector + two columns |
| 2 | `ContextSelector` component | Unified dropdown listing engagements + pursuits, stats bar, progress |
| 3 | `AttentionQueue` component | Blocked + needs-input items with presence pips (engagement mode) |
| 4 | `ResumeCard` component | Last deliverable for current user, one-click continue |
| 5 | `DataStatusWidget` component | Compact workstream data status (reuses PDD-009 config) |
| 6 | `PursuitContent` component | Pursuit summary + deliverable list (pursuit mode) |
| 7 | Add `presence` to mock data | Mock presence for SK, TR, PM on engagements |
| 8 | Add presence pips to `WorkplanPanel` | Avatar pips on workstream + deliverable rows |
| 9 | Redirect `/[engId]` to `/?eng=[engId]` | Kill standalone engagement dashboard |
| 10 | First-visit fallback | Card picker showing both engagements and pursuits |
| 11 | Add pursuit to unified context model | Mock pursuit data with same-level structure as engagements |

### Out

- Active locking (real-time "TR is running an analysis" — future)
- Real presence tracking via Supabase realtime (production)
- Cross-context attention queue (only show selected engagement/pursuit)
- Pursuit creation flow
- Engagement creation flow

---

## Files to Create/Modify

| File | Action |
|---|---|
| `web/src/app/page.tsx` | Rewrite — mission control layout with context-aware content |
| `web/src/components/landing/ContextSelector.tsx` | Create — unified dropdown (engagements + pursuits) + stats bar |
| `web/src/components/landing/AttentionQueue.tsx` | Create — blocked/review items with presence pips |
| `web/src/components/landing/ResumeCard.tsx` | Create — last deliverable card |
| `web/src/components/landing/DataStatusWidget.tsx` | Create — compact data gate status |
| `web/src/components/landing/PursuitContent.tsx` | Create — pursuit summary + deliverable list for pursuit mode |
| `web/src/lib/mock-data.ts` | Modify — add `ConsultantPresence` type + mock presence data; add pursuit to unified context type |
| `web/src/components/WorkplanPanel.tsx` | Modify — add presence avatar pips to workstream/deliverable rows |
| `web/src/app/[engagementId]/page.tsx` | Modify — redirect to `/?eng=[engId]` |

### Can delete after migration

| File | Reason |
|---|---|
| `web/src/components/engagement/EngagementOverview.tsx` | Stats now inline in ContextSelector |
| (EngagementCard function in page.tsx) | Replaced by ContextSelector dropdown |
| (AgentTeamCard function in page.tsx) | Removed — agents shown on workstream rows |

---

## Verification

1. `pnpm --filter web build` — clean
2. Navigate to `/` — shows card picker with both engagements and pursuits (no selection on fresh state)
3. Click "Open" on Acme → mission control view with stats, attention queue, workplan
4. Dropdown → switch to Beacon → content updates, attention queue empty, stats change
5. Dropdown → switch to "New Client Scoping" pursuit → left column shows pursuit deliverables (Scoping Canvas etc.), stats bar shows pursuit info, no workplan
6. Resume card shows "COA Design" for SK — click → navigates to `/eng-001/deliverables/d-005-02`
7. Attention queue: "RACI Matrix" shows TR avatar pip + "20m"
8. Workplan: "PM & Governance" row shows TR pip, "COA & GL Design" shows SK pip
9. Expand workstream → deliverable rows show individual presence pips
10. Data widget shows ws-005 status with TB/COA pips → click "Setup" → navigates to workstream gate
11. Navigate to `/eng-001` → redirects to `/?eng=eng-001`
12. `localStorage` remembers selected context (engagement or pursuit) across page reloads
13. Dropdown shows grouped sections: ENGAGEMENTS header, then engagement rows; PURSUITS header, then pursuit rows; divider; + New Engagement / + New Pursuit
