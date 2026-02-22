# Session 015: Product Plan — Interactive Consulting Framework

**Date:** 2026-02-22
**Iteration:** Strategic reframe — FTA as Interactive Consulting Framework

---

## Session Context

Through 14 sessions we built a strong frontend (5 workspaces, full workspace shell, landing page) and a solid backend foundation (agent registry, domain prompts, data schemas). But the product strategy assumed a linear path: finish backend 1.5A → wire SSE → connect frontend. This session steps back to reframe what FTA actually is and plan a more effective build path.

## Strategic Reframe

### What changed

**Before (Session 014):** FTA is an AI agent for insurance finance transformations. The backend agent is the product. The frontend is a UI for it. Backend 1.5A is the blocker.

**After (Session 015):** FTA is an **interactive consulting framework** for insurance finance transformations, with AI agents embedded as capabilities within it. The framework is the product. A consultant opens it every day to navigate workstreams, review deliverables, make scoping decisions, and capture requirements.

### Why this matters

Some deliverables are **agent-powered** (GL Account Analysis — agent ingests data, runs analysis, produces artifacts). Others are **knowledge-powered** (Business Requirements — curated domain library the consultant navigates and customizes). Some are **hybrid** (Process Inventory — knowledge library enriched by agent findings).

The agent is a capability inside the framework, not the product itself. This unlocks a build strategy that doesn't bottleneck on backend agent infrastructure.

### Three-stream strategy

| Stream | Focus | Dependency |
|--------|-------|------------|
| **A — Framework Expansion** | Knowledge-powered workspaces (no agent needed) | None — mock data, fast to build |
| **B — Data Slice** | One deliverable end-to-end with real data (d-005-01) | Backend SSE, data tools |
| **C — Platform Polish** | Navigation, layout, UX | Existing components |

Streams A and C can proceed immediately. Stream B is the former "1.5A blocker" — but it's now one workstream among three, not the only path forward.

---

## Coverage Analysis

### Current state: 5 of 35 deliverables (14%)

| Workspace | Workstream | Type |
|-----------|-----------|------|
| d-005-01 Account Analysis Report | WS-005 COA & GL | AnnotatedTable |
| d-005-03 Account Mapping | WS-005 COA & GL | AnnotatedTable + Interrupt |
| d-004-01 Process Inventory | WS-004 Business Process | ProcessInventoryGraph |
| d-004-03 Future State Process Maps | WS-004 Business Process | ProcessFlowMap |
| d-004-04 Business Requirements | WS-004 Business Process | BusinessRequirementsTable |

Five workstreams have zero coverage: WS-001 PM & Governance, WS-002 Business Case, WS-003 ERP Selection, WS-006 Reporting, WS-007 Data & Integration.

### Target: 15 of 35 deliverables (43%), all 7 workstreams represented

Stream A adds 10 knowledge workspaces selected for maximum coverage and impact:

| # | Deliverable | Workstream | Type | Session |
|---|-------------|------------|------|---------|
| A1 | d-001-03 RACI Matrix | WS-001 PM & Governance | Table | 015 |
| A2 | d-002-02 Scope Definition | WS-002 Business Case | Table | 015 |
| A3 | d-003-04 ERP Evaluation Summary | WS-003 ERP Selection | Table + scores | 015 |
| A9 | d-001-04 Risk & Issue Log | WS-001 PM & Governance | Table | 015 |
| A4 | d-005-02 Chart of Accounts Design | WS-005 COA & GL | Custom | 018 |
| A5 | d-006-01 Reporting Inventory | WS-006 Reporting | Table | 018 |
| A6 | d-007-04 Interface Inventory | WS-007 Data & Integration | Table | 020 |
| A7 | d-004-06 Process Gap Analysis | WS-004 Business Process | Table + fit/gap | 020 |
| A8 | d-005-04 ACDOCA Dimension Design | WS-005 COA & GL | Custom | 020 |
| A10 | d-006-03 Regulatory Reporting Map | WS-006 Reporting | Table | 020 |

---

## Session Plan (next 5-6 sessions)

| Session | Focus | Stream | Deliverables |
|---------|-------|--------|--------------|
| 015 | Product plan + 4 knowledge workspaces | A | A1, A2, A3, A9 |
| 016 | SSE streaming endpoint + workspace wiring | B | B1, B5 |
| 017 | GL data tools + account profiling | B | B2, B3 |
| 018 | End-to-end data slice + 2 knowledge workspaces | B+A | B4, A4, A5 |
| 019 | Navigation, layout, WorkplanSpine wiring | C | C1, C2 |
| 020 | Remaining knowledge workspaces + polish | A+C | A6-A10, C3 |

### Milestone: After Session 020

- 15/35 deliverables with workspaces (all 7 workstreams covered)
- 1 deliverable fully agent-powered with real data (d-005-01)
- Navigation polished with WorkplanSpine and breadcrumbs
- Product is both demo-ready and has one working data vertical

---

## What We're NOT Building Yet

- Supabase integration (Phase 2 — multi-consultant, persistence)
- Multi-agent handoff protocol (only needed when agents produce real output that feeds other agents)
- Functional Consultant agent implementation (knowledge workspaces don't need it)
- Additional data tools beyond GL Account Analysis (one vertical first, then expand)
- Mobile / responsive design
- Auth beyond mock

---

---

## Pursuit Phase — Pre-Engagement Scoping

### The insight

The engagement lifecycle starts before the workplan. The pursuit phase — qualifying, scoping, proposing — is where FTA first demonstrates value. The workplan (WS-001 through WS-007) only exists after you win the work.

### Scoping Canvas

The centerpiece of the pursuit phase. A **radial domain map** pulled up on screen during a first executive meeting (CFO/CIO/Controller). 7 transformation themes radiating from the client at center:

| Theme | Executive language |
|-------|-------------------|
| Core Finance & GL | "How you close the books" |
| Insurance Operations | "How premium, losses, and reserves flow" |
| Reinsurance | "Ceded and assumed — how complex is your book" |
| Close & Efficiency | "How many days, how many manual entries" |
| Regulatory & Statutory | "NAIC, state filings, Schedule P" |
| Reporting & Analytics | "What the CFO sees every month" |
| Data & Systems | "How everything connects" |

Each theme captures: scope signal (Transform / Optimize / Keep as-is / Explore), priority (Critical / Important / Later), pain points, and notes. The canvas builds visually during the conversation — nodes change color as scope decisions are made, dependency lines illuminate.

**Key design requirements:**
- Visually stunning on a projector — dark mode, animated, nothing like PowerPoint
- Domain vocabulary in the nodes signals deep expertise
- Pain point prompts derived from existing ProcessInventoryNode `scoping_questions` and `description` fields, elevated to executive language
- The 7 themes map directly to the 7 workstreams — scope flows into the workplan on win

### Pursuit deliverables

| # | Deliverable | Type |
|---|-------------|------|
| P1 | Scoping Canvas | Radial domain map |
| P2 | Executive Summary | Generated from scoping session |
| P3 | Value Hypothesis | Pain points → quantified opportunity |
| P4 | Proposal | Scope + approach + timeline + team + investment |
| P5 | RFP Response | If competitive pursuit |

### Navigation — Option A (landing page split)

Pursuits live above engagements on the landing page. Different card treatment — pursuits feel lighter/sales-oriented, engagements feel operational.

### Route structure

```
/                                                Landing (pursuits + engagements)
/pursue/[pursuitId]                              Pursuit workspace
/pursue/[pursuitId]/[deliverableId]              Pursuit deliverable
/[engagementId]/deliverables/[deliverableId]     Engagement workspace (existing)
```

### The win moment

When a pursuit converts to an engagement:
- Pursuit status → "won", engagement created
- 7 scoping themes → 7 workstreams with pre-populated scope
- Pain points → early findings
- Priority signals → workstream sequencing
- Nothing re-gathered

---

## Workshop Mode — Live Capture Against Leading Practice Baseline

### The problem

Current model: consultant preps artifacts → schedules workshop → walks through on screen → takes notes → goes back and manually updates artifacts → repeats 30-40 times. The gap between "client says something" and "artifact reflects it" is where value leaks.

### The solution

FTA's workshop mode: the consultant pulls up the workspace on the projector. The leading practice process flow is already on screen. The 324 requirements for that PA are already in the table. The client team reacts to what exists — they're not building from nothing.

**The conversation is:** "Here's how leading practice P&C carriers handle journal entry processing in SAP S/4HANA. Walk me through where your process differs." Not: "Tell me about your journal entry process."

### Workshop interactions (by frequency)

| Action | Frequency | Example |
|--------|-----------|---------|
| Modify existing | Most common | "We have an extra approval step here" → update node |
| Annotate/flag | Very common | "That step takes us 3 days" → pain point on node |
| Confirm as-is | Common | "Yes, that's how we do it" → node validated |
| Mark as gap | Common | "We don't do that today" → amber glow on node |
| Capture new requirement | Regular | "We need accident year tracking" → new BR in PA |
| Modify existing requirement | Regular | "That should say quarterly, not monthly" → inline edit |
| Remove/defer | Occasional | "Doesn't apply to us" → out of scope |
| Add net new step | Occasional | Something not in leading practice |

### Workshop mode layout

```
┌─────────────────────────────────────────────────┬────────────────────┐
│                                                 │ REQUIREMENTS (14)  │
│          PROCESS CANVAS (70%)                   │                    │
│                                                 │ BR-05-14 Ceded...  │
│  [Leading practice baseline pre-loaded]         │ BR-05-15 Treaty... │
│  [Nodes spring to life as they're modified]     │ BR-05-16 NEW       │
│  [Gaps glow amber]                              │                    │
│  [Validated nodes get emerald]                  │ ── Agent ──        │
│                                                 │ ◉ Listening...     │
│                                                 │ "Overlaps with     │
│                                                 │  BR-03-08" [Y/N]   │
├─────────────────────────────────────────────────┴────────────────────┤
│  [R] Capture requirement...                          ◉ Agent active  │
└──────────────────────────────────────────────────────────────────────┘
```

- WorkplanSpine hidden — canvas needs max width for projector
- Capture bar pinned to bottom — always one keystroke away
- Agent panel compressed — suggestions only
- Toggle with `Cmd+Shift+W`

### Keyboard-first interaction

| Key | Action |
|-----|--------|
| `N` | New process step |
| `R` | New requirement |
| `D` | New decision/gateway |
| `G` | Flag a gap |
| `A` | Annotate selected |
| `F` | Toggle future state |
| `Y` | Accept agent suggestion |
| `Cmd+K` | Command palette |

### Agent role in workshop

The agent is a quiet colleague taking notes at the edge of the room:
- **Listening state**: subtle blue breathing pulse (3s period)
- **Suggestion**: non-blocking chip slides in — "Detected gap: no approval step before posting — add?" `Y`/`Esc`
- **Cross-session**: "This requirement overlaps with BR-03-08 from the reinsurance session last week"
- **Structuring**: auto-classifies captured requirements (PA, SP, tag, segment)

### Visual language for workshop

| Style | Meaning |
|-------|---------|
| Solid fill, blue border | Current state / leading practice baseline |
| Transparent fill, emerald dashed border | Future state — confirmed |
| Amber border, pulsing glow | Gap — work to do |
| Muted, slate border | Out of scope / deferred |

### Micro-interactions

- Node creation: ghost node → type inside → Enter → spring animation (scale 0.85→1.0, 200ms)
- Connector: SVG stroke-dashoffset draws left-to-right, 250ms
- Requirement capture: item "ejects" from capture bar, flies to requirements panel
- Count flip: old number exits up, new enters from below, 100ms
- Agent suggestion: height expands from 0, amber left border, 200ms

---

## Three Product Modes

| Mode | When | What FTA does |
|------|------|--------------|
| **Pursuit** | Pre-engagement, exec meeting | Scoping canvas, pain points, proposal generation |
| **Workshop** | During delivery, client in the room | Live capture against leading practice baseline, agent-assisted structuring |
| **Solo** | Between workshops, consultant alone | Review, refine, run agent analysis, prepare next session |

The same workspaces serve all three modes with different interaction patterns. Process Flow Map in solo mode = review. In workshop mode = live editing with agent assist. Requirements Table in solo mode = filtering and analysis. In workshop mode = rapid capture.

---

## Decisions Made

| ID | Decision | Status |
|----|----------|--------|
| — | FTA is a consulting framework with embedded agents, not an agent with a UI | Decided |
| — | Three-stream build strategy (Framework, Data Slice, Polish) replaces linear backend-first | Decided |
| — | 10 highest-impact deliverables selected for Stream A expansion | Decided |
| — | Backend 1.5A is now "Stream B" — no longer sole blocker | Decided |
| — | Pursuit phase: pre-engagement with own deliverables, separate from workplan | Decided |
| — | Landing page split (Option A): pursuits above engagements | Decided |
| — | Scoping canvas: radial domain map, 7 themes mapping to 7 workstreams | Decided |
| — | Workshop mode: live capture against leading practice baseline, keyboard-first | Decided |
| — | Three product modes: Pursuit, Workshop, Solo | Decided |

---

## Artifacts Produced

| File | Change |
|------|--------|
| `docs/sessions/2026-02-22-session-015-product-plan-framework-expansion.md` | **New** — this file |
| `NEXT-STEPS.md` | Rewritten with three-stream strategy + pursuit phase + workshop mode |
| `README.md` | Rewritten with full product lifecycle, three modes, pursuit phase |
| `docs/plans/master-plan.md` | Strategic reframe, pursuit phase, workshop mode, current position |
| `docs/plans/v1-build-plan.md` | Iteration dependencies updated for stream-based approach |
| `docs/vision/product-vision.md` | Three deliverable models, pursuit phase, workshop mode |
| `docs/vision/architecture-overview.md` | Three deliverable models, workspace coverage, product modes |

---

## Next Session Priorities

Build the 4 knowledge workspaces (A1, A2, A3, A9) — add DeliverableWorkspace entries to MOCK_WORKSPACES with domain-specific mock data, then build check.
