# Session 033 — Harden Process Flow Builder for Live Agent

**Date:** 2026-03-08
**Focus:** Make the Functional Consultant agent reliably produce valid process flows

## What Was Built

1. **Prompt hardening** — Rewrote `functional_consultant_flow.md`:
   - Explicit instruction to call `emit_process_flow` after gathering 2+ swimlanes and 4+ steps
   - Max 2 rounds of clarifying questions before emitting
   - Full tool invocation format with all field descriptions
   - "NEVER ask more than 2 rounds before emitting" directive

2. **Frontend error recovery** — Parse error display in BuilderPreviewPanel:
   - Error banner with dismiss when flow JSON is malformed
   - Agent error capture in ProcessFlowBuilder
   - Flow validation before accepting (checks `kind`, `nodes`, `edges` fields exist)

3. **Live FC test — 3/3 PASS:**
   - **Test 1:** GL Posting Correction — 3 swimlanes, 11 nodes, gateway (>$50K), 2 overlays (risk + SOX constraint). Multi-turn.
   - **Test 2:** Monthly Premium Close — 3 swimlanes, 11 nodes, approval gateway, correction loop. Single turn (rich prompt).
   - **Test 3:** Reinsurance Treaty Settlement — 4 swimlanes, 10 nodes, gateway (>$1M), 4 overlays. Single turn.

4. **Cleanup** — Removed dead `AgentChatInput` component from deliverable pages

## Commits

- `bfd7242` Session 033: Harden Process Flow Builder for live agent
- `ab0a1d6` Session 033: Remove dead AgentChatInput from deliverable pages
