# Business Process Design Workstream

> Created: Session 010 (2026-02-19)
> Status: Design complete — not yet built

---

## Overview

The Business Process Design workstream is the Functional Consultant's primary domain. It produces the process documentation, requirements, and gap analysis artifacts that define how the client's finance operations will work in the target ERP.

This document covers the full workstream design: dependency chain, workspace behavior for each deliverable, the overlay model for Future State process design, the cross-agent connection to GL Design Coach, and the workplan expansion model.

---

## Deliverable Chain

```
Process Inventory
    │ (scope gate — must confirm each process before downstream work)
    │
    ├── [per confirmed process, in parallel]
    │       │
    │       ├── Future State Process Map
    │       │       │
    │       │       └── Business Requirements by Process
    │       │               │
    │       │               └── User Stories Backlog (optional)
    │       │
    │       └── Process Gap Analysis (ERP-dependent)
    │
    └── [aggregate, after all processes complete]
            └── (future: cross-process summary, steering committee deck)
```

**Key rules:**
- Process Inventory is the only mandatory first step
- Once a process is confirmed in the inventory, its downstream deliverables unlock in parallel
- User Stories is opt-in (scoped in/out at engagement setup or inventory phase)
- Gap Analysis requires `engagement.erp_target` — shows a preflight warning if not set

---

## Process Inventory

### Purpose

The Process Inventory is the scope conversation, captured structurally. The consultant and client agree on which finance processes are in scope, with what sub-flows, before any design work begins.

### Workspace Behavior

**Agent:** Functional Consultant
**Run state:** Starts as `preflight`, transitions to interactive workspace

The Process Inventory is not a standard "run and produce artifact" workspace. It is an interactive scoping conversation:

1. The agent presents standard process areas relevant to the engagement context (segment + ERP target):
   - For P&C Insurance / SAP S/4HANA: R2R, P2P, Financial Close, Premium & Loss Reserving, Reinsurance Accounting, Regulatory Reporting
2. The consultant confirms, expands, or removes processes from the list
3. For each confirmed process, the agent presents standard sub-flows for that process area:
   - e.g., R2R → Journal Entry, Account Reconciliation, Period-End Close, Intercompany
4. The consultant confirms, adjusts, or adds client-specific sub-flows
5. As each process is confirmed, its downstream deliverable rows appear in the workplan

### Workplan Expansion

The workplan expands dynamically as processes are confirmed:

```
Business Process Design
  ├── ◑ Process Inventory                        ← parent row, always present
  │       ├── ✓ R2R (confirmed)                  ← child rows appear when confirmed
  │       ├── ✓ P2P (confirmed)
  │       └── ◑ Financial Close (in progress)
  │
  ├── Future State Process Map
  │       ├── ⬜ R2R — Future State               ← unlocked by Process Inventory confirmation
  │       └── ⬜ P2P — Future State
  │
  ├── Business Requirements by Process
  │       ├── ⬜ R2R — Requirements
  │       └── ⬜ P2P — Requirements
  │
  └── Process Gap Analysis
          ├── ⬜ R2R — Gap Analysis
          └── ⬜ P2P — Gap Analysis
```

**Rules:**
- Parent deliverable rows always show, even before any processes are confirmed
- Parent rows show aggregate status: `x / y processes complete`
- Child rows appear only when a process is confirmed in the inventory
- Confirming a process in inventory creates child rows across all four downstream deliverables simultaneously
- Child rows are never hidden once created — scope removals mark them as `out_of_scope` rather than hiding them

---

## Future State Process Map

### Purpose

Documents how the process will work in the target ERP. Not a mirror of current state — a designed future state grounded in leading practice and adapted to the client's specific constraints and requirements.

### The Overlay Model

There is no separate Current State deliverable. Instead, the Future State workspace uses an overlay model:

```
Leading Practice Baseline (agent-generated, from knowledge library)
    +
Client Overlay (elicited by agent through standard questions)
    =
Future State Process Map
```

**Leading Practice Baseline:**
- The agent pre-populates a standard process flow for the process area, calibrated to the segment and ERP target
- For SAP S/4HANA P&C: process flows reflect standard SAP best practices for insurance finance
- The baseline is the starting point, not the final answer

**Client Overlay:**
- Annotations on specific process steps that capture how the client differs from leading practice
- Four overlay types:
  - `constraint` — something the client can't change (technology, regulatory, contractual)
  - `requirement` — something the client specifically needs that isn't in the baseline
  - `exception` — a step or rule that applies only to certain scenarios for this client
  - `risk` — a current-state complexity that needs to be managed in the future state

**Overlay Sources:**
1. Agent-elicited (standard question set — see below)
2. GL Design Coach findings (auto-suggested — see Cross-Agent Connection)
3. Consultant-entered (free text or inline annotation)

### Standard Question Set for Overlay Elicitation

The agent works through a standard question set per process, adapted to the process area. The questions are designed to surface client-specific complications without requiring the consultant to know what to ask.

**Standard categories:**

| Category | Example questions |
|----------|-----------------|
| Technology & Systems | What current systems are involved in this process? What stays in the future state? Any integration points that are fixed? |
| People & Ownership | Who owns this process today? Who should own it in the future state? Are there shared service / offshore considerations? |
| Data & Reporting | What specific outputs does the client need from this process? Any statutory or management reporting requirements? |
| Exceptions & Edge Cases | What scenarios does the standard process not handle for this client? Unusual transaction types, volumes, or timing? |
| Regulatory & Compliance | Any specific statutory, regulatory, or audit requirements for this process? State-specific rules? NAIC requirements? |

**Agent behavior:**
- Works through questions conversationally, not as a form
- Accepts "not applicable" or "skip" for any question
- Proposes an overlay annotation for each substantive answer before recording it
- Asks for confirmation: "I'll record this as a constraint on step 3 (Journal Entry Approval) — does that look right?"

---

## Business Requirements by Process

### Purpose

Structured requirements for the future-state design, captured at the process level. These are the requirements that drive ERP configuration decisions.

### Agent Behavior

- Pre-populates from the leading practice library, calibrated to segment and ERP target
- Each requirement tagged to: process area, sub-flow, RACI role, SAP fit-gap indicator
- Consultant validates, adjusts, and adds client-specific requirements
- Requirements reference the Future State overlay (client-specific requirements are linked to the overlay that drove them)

### Dependencies

- Cannot start until the Future State Process Map for this process is at least in progress
- The Future State overlays pre-populate some requirements automatically (e.g., a `constraint` overlay on a process step generates a corresponding requirement)

---

## Process Gap Analysis

### Purpose

Compares the confirmed Future State design against the target ERP's standard process model. Identifies: native fit, configuration required, development/workaround required, and out-of-scope.

### ERP Dependency

The gap analysis is ERP-specific. The agent reads `engagement.erp_target` and uses the corresponding ERP process model as the comparison baseline.

- **SAP S/4HANA (MVP):** Full gap analysis against SAP standard processes
- **Oracle Cloud ERP (future):** Via Oracle platform adapter
- **Workday Financials (future):** Via Workday platform adapter

If `engagement.erp_target` is not set, the workspace shows a preflight warning: "ERP target not set for this engagement. Set the ERP target in engagement settings before running the gap analysis."

### Output Structure

For each process step in the Future State map:

| Step | Future State Design | ERP Standard | Fit | Gap Detail | Configuration Approach |
|------|-------------------|--------------|-----|-----------|----------------------|
| ... | ... | ... | Native / Config / Dev / Gap | ... | ... |

Fit ratings:
- `native` — ERP handles this out of the box, no configuration needed
- `config` — standard configuration required (table entries, settings)
- `development` — custom development or extension required
- `gap` — ERP cannot meet this requirement in the standard product

---

## Cross-Agent Connection: GL Design Coach → Future State

The GL Design Coach's data analysis produces findings tagged to process areas. These findings flow as overlay suggestions into the Functional Consultant's Future State workspace.

### How It Works

1. GL Design Coach completes an analysis (e.g., Account Analysis Report, MJE Analysis)
2. Findings are stored in the shared engagement context with a `process_area` tag:
   - e.g., `{finding: "JSMITH posts 91% of actuarial entries", severity: "risk", process_area: "financial_close"}`
3. When the Functional Consultant opens the Future State workspace for a process:
   - The agent queries the engagement context for findings tagged to this process area
   - Matching findings appear as pre-suggested overlays above the process baseline
   - Each suggestion shows: finding text, severity, the process step it affects, and the overlay type proposed
4. Consultant accepts, modifies, or dismisses each suggestion
5. Accepted suggestions become overlays on the Future State map, linked back to the GL finding

### Example Connections

| GL Design Coach Finding | Suggested Future State Overlay |
|------------------------|-------------------------------|
| JSMITH posts 91% of actuarial entries (key person risk) | `risk` overlay on Close process: "Current key person concentration in actuarial close entries — design requires workflow controls or delegation rules" |
| 4 accounts flagged for document splitting | `constraint` overlay on Journal Entry sub-flow: "4 accounts require document splitting configuration — affects posting workflow design" |
| Account 2340 carries ceded and assumed reinsurance flows | `requirement` overlay on Reinsurance Accounting: "Account structure requires process steps to distinguish ceded vs. assumed settlement flows" |

---

## User Stories Backlog (Optional)

### Scope Toggle

Included in the workplan as opt-in. Default: `out_of_scope` for engagements not using agile delivery methodology. Scoped in at engagement setup or during the Process Inventory phase.

### When to Include

- Client's implementation team uses user stories for sprint planning
- Engagement delivery methodology explicitly requires a user story backlog
- Client has a product owner role responsible for a backlog

### When to Exclude

- Client prefers requirements-based specifications
- Engagement is not using agile delivery methods
- User stories would be generated and never used

---

## Workplan Model Summary

```
Business Process Design
  ├── Process Inventory                    [scope gate — interactive workspace]
  ├── Future State Process Map             [per-process child rows, overlay model]
  ├── Business Requirements by Process     [per-process child rows, library + overlay]
  ├── User Stories Backlog                 [optional, per-process child rows]
  └── Process Gap Analysis                 [per-process child rows, ERP-dependent]
```

Parent rows always show aggregate status. Child rows appear when each process is confirmed in the inventory. Progress counters on parent rows aggregate across all child rows.

---

## Relevant Decisions

| Decision | What it covers |
|----------|---------------|
| DEC-035 | Process Inventory as scope gate, per-process parallelism |
| DEC-036 | No Current State deliverable — overlay model |
| DEC-037 | Dynamic workplan expansion, parent rows persist |
| DEC-038 | Standard question set for overlay elicitation |
| DEC-039 | Cross-agent connection: GL findings → Future State suggestions |
| DEC-040 | Gap Analysis is ERP-dependent |
| DEC-041 | User Stories Backlog is optional |
