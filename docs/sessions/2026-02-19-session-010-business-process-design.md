# Session 010 — Business Process Design Workstream

**Date:** 2026-02-19
**Focus:** Design conversation — Business Process Design workstream dependencies, sequencing, and interaction model
**Output:** Decisions DEC-035 through DEC-041, full workstream design doc

---

## What Was Built

Nothing was built in this session (by design). The session was a design conversation that produced:

- **7 new decisions** (DEC-035 through DEC-041) in the decision log
- **Full workstream design doc** at `docs/design/business-process-design-workstream.md`
- **Updated NEXT-STEPS.md** with Business Process Design build as a planned workstream

---

## Key Design Decisions

### Process Inventory as Scope Gate (DEC-035)

The Process Inventory is the mandatory first deliverable in the Business Process Design workstream. No downstream work (Future State, Requirements, Gap Analysis) can start for a process until that process is confirmed in the inventory.

Key insight: per-process parallelism is allowed — once R2R is confirmed, its downstream deliverables unlock and can run in parallel with the P2P inventory work still ongoing.

### No Current State — Overlay Model (DEC-036)

A significant departure from traditional consulting methodology. Instead of a standalone Current State deliverable, the Future State Process Map uses an overlay model:

- Agent generates leading-practice baseline (from knowledge library, calibrated to segment + ERP)
- Client-specific complications are captured as overlays: constraints, requirements, exceptions, risks
- Overlays are elicited through a standard question set (DEC-038)

This removes the most time-consuming part of traditional process work (documenting current state) while preserving the client-specific context that makes the future-state design actionable.

### Cross-Agent Connection (DEC-039)

The strongest architectural feature of this workstream. GL Design Coach findings — stored in the shared engagement context with a `process_area` tag — flow as pre-suggested overlays into the Functional Consultant's Future State workspace.

Example: "JSMITH posts 91% of actuarial entries" (GL Design Coach finding, risk, process area: financial_close) → auto-appears as a suggested risk overlay on the Close process in the Future State workspace.

This makes the shared engagement context pay off concretely. The two agents are analyzing the same client from different angles, and the context connection surfaces that intelligence automatically.

### Dynamic Workplan Expansion (DEC-037)

The workplan expands as processes are confirmed. Parent deliverable rows stay in place throughout. Child rows appear per confirmed process. Progress counters on parent rows aggregate across children.

### Gap Analysis is ERP-Dependent (DEC-040)

The Process Gap Analysis reads `engagement.erp_target` and uses the corresponding ERP standard process model as the comparison baseline. SAP S/4HANA in MVP. Oracle and Workday via platform adapters later.

---

## What to Build Next (Business Process Design)

The full workstream is designed. Build sequence follows the dependency chain:

1. **Process Inventory workspace** — interactive scoping conversation, per-process confirmation, workplan expansion trigger
2. **Future State workspace** — overlay model, standard question set, leading-practice baseline generation
3. **Cross-agent connection wiring** — GL finding tagging with `process_area`, Functional Consultant query at workspace open
4. **Business Requirements workspace** — library pre-population, overlay-driven requirements
5. **Gap Analysis workspace** — ERP-dependent, preflight warning if ERP not set
6. **User Stories workspace** — optional, gated by engagement scope toggle

**Not starting until:** Backend 1.5A is complete and the frontend is connected to real API calls. Building process design UI on mock data before the agent infrastructure exists doesn't add conviction.

---

## Context from Session 009 (what this session builds on)

Session 009 completed the full workspace UI (agent workspace, three-panel shell, WorkplanSpine, all workspace components). The workspace shell works for any deliverable. The Business Process Design deliverables will use the same shell — the Process Inventory workspace is the most novel (interactive, not just artifact review), but the underlying component patterns are already established.

---

## Files Changed This Session

| File | Change |
|------|--------|
| `docs/decisions/decision-log.md` | Added DEC-035 through DEC-041 |
| `docs/design/business-process-design-workstream.md` | Created — full workstream design |
| `docs/sessions/2026-02-19-session-010-business-process-design.md` | Created — this file |
| `NEXT-STEPS.md` | Added Business Process Design build plan |
| `docs/plans/v1-build-plan.md` | Updated with Business Process Design design note |
