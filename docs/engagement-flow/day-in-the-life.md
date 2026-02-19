# Day in the Life: How Consultants Use FTA

> Last updated: Session 009. Reflects the built product.

---

## The Navigation Model

FTA is not a chat interface. Consultants navigate to the work, not to a conversation.

```
Landing screen
    │
    ├── Engagement card → Workplan panel expands
    │       │
    │       └── Click deliverable CTA (View →, Open →, Review →, Resolve →)
    │               │
    │               └── Deliverable workspace
    │                       ├── WorkplanSpine (left — full workplan context)
    │                       ├── Artifact area (center — what the agent built)
    │                       └── ActivityPanel (right — what the agent did)
```

The **workplan spine** is always visible in the workspace, showing every workstream and deliverable. Consultants jump between deliverables without going back to the landing screen.

---

## Scenario: COA Design Day

### Setup
Acme Insurance. P&C carrier. SAP S/4HANA implementation. Design phase. Three consultants: the accounting expert (works primarily with GL Design Coach), the business analyst (Functional Consultant), and the PM (Consulting Agent).

---

### Morning — Accounting Expert

**8:45 — Opens FTA**

Landing screen shows the Acme Insurance card. Stats: 3 open decisions, 2 HIGH findings, 1 blocked item. The accounting expert clicks the card — the workplan panel slides open below.

COA & GL Design workstream shows: Account Analysis Report ✓ (complete), Chart of Accounts Design ◑ (in progress, needs input), Account Mapping ◑ (in progress), and 5 not-started deliverables.

The "Needs Your Input" banner at the top shows 2 items with amber highlights. One of them: "Profit centre structure drafted · 2 design decisions pending your sign-off."

---

**9:00 — Opens Account Analysis Report**

Clicks "View →" on Account Analysis Report. Navigates to:
`/eng-001/deliverables/d-005-01`

The workspace loads with the complete artifact. The GL Design Coach already ran this — the run_state is `complete`.

Four insight cards appear above the table:
- INFO: 68 accounts profiled across 512K posting lines
- RISK: Key person risk — JSMITH posts 91% of actuarial entries
- FINDING: 4 accounts flagged for document splitting
- COMPLIANT: NAIC account group structure: fully compliant

The table shows all 68 accounts with staggered row reveal (simulating the progressive build). The accounting expert hovers over account 2000 (Loss & LAE Reserve) — a provenance sub-row appears below: "94% of entries posted by JSMITH · Source: MJE_ANALYSIS_2025".

The accounting expert types in the chat input at the bottom: "Can you explain the key person risk concentration on JSMITH?" The GL Design Coach responds with the full analysis from the activity log.

---

**9:30 — Opens Account Mapping**

Clicks the Account Mapping deliverable in the WorkplanSpine (left rail auto-expanded the COA & GL Design workstream, with the active deliverable highlighted in blue).

The workspace loads with 8 rows visible and then an **InlineInterrupt** — the amber decision card embedded mid-table:

> **Decision needed**
>
> Account 2340 currently carries both ceded and assumed reinsurance settlement flows. In S/4HANA, these should be separated for clear reporting. Two options: split into two accounts, or use a single account with posting key differentiation.
>
> **A** Split into two accounts
> Create 22001000 (Ceded Settlement) and 22002000 (Assumed Settlement) — cleaner reporting, aligns with NAIC schedule requirements.
>
> **B** Use posting key differentiation
> Single account 22000100 with debit/credit convention — simpler design, but reduces transparency in balance sheet line items.

The rows below the interrupt are hidden — the agent stopped here and won't proceed until the consultant decides.

The accounting expert clicks **Option A**. The interrupt collapses to a one-line resolved summary: "✓ Decision recorded: Split into two accounts." The remaining rows appear with a stagger animation.

---

**10:15 — Reviews the ActivityPanel**

The accounting expert opens the ActivityPanel (right rail, collapsed by default). Three steps visible:
- ✓ Loaded source data — Account Analysis Report + COA Draft v1.2 — 0.9s
- ✓ Auto-mapped 34 accounts — direct and semantic matching · avg confidence 0.96 — 5.6s
- ⟳ Flagging complex accounts — reinsurance flows, clearing, multi-use accounts (active)

The agent is still running in the background on the complex accounts. The consultant can see exactly where it is without waiting for it to finish.

---

### Midday — Business Analyst

**11:00 — Opens Business Requirements**

The business analyst opens FTA on their own machine. Same engagement, different deliverable. They navigate to Business Requirements by Process (`/eng-001/deliverables/d-004-04`).

The workspace shows a **preflight screen** (run_state: `preflight`, agent_kind: `knowledge_grounded`):

> **Functional Consultant**
> Business Requirements by Process
>
> Pre-populated from leading practice library.
> • 47 standard requirements pre-populated from insurance finance library
> • Process areas: R2R, P2P, Financial Close, Reinsurance Accounting
> • Each requirement tagged to process step and RACI role
> • SAP S/4HANA fit-gap indicators pre-filled
> • Ready for workshop validation with client finance team
>
> **Source:** Leading Practice · Insurance Finance · SAP S/4HANA
>
>                          [ Review Library ]

The business analyst clicks "Review Library." A brief 1.2s loading state, then the artifact table appears with the 47 pre-populated requirements. They scroll through, spot two that don't apply to Acme's scope, and type in the chat input: "Remove requirements R-023 and R-031 — these relate to statutory consolidation which is out of scope for this engagement."

---

### Afternoon — PM / Engagement Lead

**14:00 — Reviews workplan status**

The PM opens the Acme workplan from the landing screen. The workplan panel shows the full picture:
- COA & GL Design: 1/8 complete, 2 in progress (one needs input, one active)
- Business Process Design: 1/6 in progress
- All other workstreams: mostly not started (discovery phase work complete)

The "Needs Your Input" banner shows 3 items. One is the RACI Matrix: "8 of 12 roles mapped · 3 gaps in claims finance ownership need resolution."

The PM clicks "Review →" on the RACI Matrix, opens the Consulting Agent workspace, and addresses the gaps.

---

### End of Day — All Consultants

The accounting expert, business analyst, and PM have worked in different parts of the system all day. They never had to email each other to stay in sync — the workplan reflected live status throughout.

The accounting expert resolved the account 2340 interrupt. The business analyst trimmed 2 requirements. The PM closed a RACI gap. The shared engagement context captured all of it.

The PM asks the Consulting Agent (once it's wired to the real API): "What did the team accomplish today?" The agent synthesizes across all workstreams and produces a status update.

---

## Multi-Consultant Tool Locking

Some tools are exclusive — only one consultant can use them per engagement at a time. The GL Design Coach's data ingestion and account profiling tools are exclusive: running a new analysis while another consultant is mid-session would corrupt the analysis store.

When a tool is locked, other consultants see a lock indicator with the name of the consultant currently using it. They can use other tools — requirements capture, process docs, deck generation — without waiting.

---

## The Workplan as Ground Truth

The workplan panel on the landing screen and the WorkplanSpine in the workspace are the same data. Both show:
- Status per deliverable (not_started / in_progress / in_review / complete / blocked)
- Needs-input flags
- Agent ownership per workstream

Consultants scope deliverables in/out using the workplan panel on the landing screen. That scope is reflected everywhere — in the spine, in progress counters, in filter pills.

---

## What This Replaces

| Before FTA | With FTA |
|-----------|----------|
| GL data profiling: 4–6 weeks of manual Excel analysis | Agent runs in minutes; 512K posting lines, 68 accounts, 7 MJE patterns detected |
| COA design: 3–4 week iterative Word doc | Workspace artifact with every row traceable to source data; inline decisions |
| Requirements gathering: 2–3 weeks per workstream of workshop + cleanup | Agent pre-populates from library; consultant validates and adjusts |
| Design decisions: buried in email threads | Captured at the moment with rationale, linked to the deliverable |
| End-of-day status: PM chasing consultants | PM asks Consulting Agent; it synthesizes across all workstreams |
