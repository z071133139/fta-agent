# Session 027: Slide Deck, Phase 1 Gap Analysis, COA Visual Research + Dynamic Hierarchy Design

**Date:** 2026-03-02
**Focus:** Content creation for pitch deck, Phase 1 completeness audit, insurance COA visualization research, dynamic hierarchy architecture design
**Stream:** Documentation + Research (no code changes)

---

## What Was Done

### Slide Deck Content

Created `docs/content/fta-slide-deck-content.md` — 17-slide narrative in old-way/new-way/value format for pitch presentations. Covers the full FTA story from problem statement through demo walkthrough to commercial model.

Created `docs/content/fta-capabilities-showcase.md` — detailed feature catalog (8 sections) documenting every built capability with implementation details. Serves as a reference for demos and capability discussions.

### Phase 1 Gap Analysis

Completed audit of outstanding items before Phase 1 can be considered "done":

- **Trust layer:** Source attribution, confidence indicators, inline edit, OutputReview split view — all missing from agent output screens
- **Persistence:** Custom process flows in localStorage only, no Supabase yet
- **Verification:** End-to-end testing not yet done for Process Flow Builder or COA Workbench
- **Remaining workspaces:** 4 knowledge workspaces still in Stream A backlog (A6–A8, A10)

### Insurance COA Visual Research

Researched 6 standard COA visualization formats used in insurance finance transformations:

1. **Range Table** — account number ranges with descriptions (we have this)
2. **Dimension Canvas** — visual grid of COA dimensions (we have this in COA Workbench)
3. **Account String Diagram** — segmented horizontal bar showing full account string composition (Company | Dept | Natural Account | LOB | Reinsurance Type | Product). **Missing — top priority.**
4. **Dimensional Matrix** — cross-reference grid (Natural Account x LOB x Reinsurance Type). Shows active vs. unused combinations, drives rationalization. **Missing — top priority.**
5. **Hierarchy Tree** — FSLI roll-up visualization. Missing.
6. **Crosswalk** — source-to-target account mapping. Missing.

### Dynamic Hierarchy Architecture (PDD-011 Design)

Designed the architecture for replacing static ERP hierarchies (FSVs) with agent-computed, auditor-ready FSLI roll-ups:

**Three-tier classification model:**
- **Tier 1 (Rule):** Deterministic lookup — `account_type + naic_category → FSLI`. Covers ~80%. No LLM needed.
- **Tier 2 (Pattern):** Coded heuristics on posting behavior + name + dimensions. Covers ~15%. No LLM.
- **Tier 3 (Agent→Pinned):** LLM proposes for ambiguous accounts, consultant approves, approval converts to Tier 1 rule. System converges toward zero LLM calls over time.

**Audit trail design:**
- Every mapping has `classification_source` (rule/pattern/agent_pinned), basis text, `approved_by`, date, full change history
- Agent reasoning preserved verbatim for Tier 3 pins
- Override chain (nothing deleted, full history)
- Reproducibility hash (data + rule version → deterministic output)
- Exportable as audit workpaper appendix

**Multi-perspective:** Same accounts, different reporting frameworks on demand — "Show me NAIC Annual Statement" / "Show me GAAP" / "Show me IFRS 17". Hierarchy is a view, not a structure.

---

## Files Changed (5 files)

| File | Action | Purpose |
|------|--------|---------|
| `docs/content/fta-slide-deck-content.md` | Created | 17-slide pitch deck content |
| `docs/content/fta-capabilities-showcase.md` | Created | Detailed feature catalog |
| `NEXT-STEPS.md` | Updated | Session 028 pickup, PDD-011 queued |
| `docs/plans/master-plan.md` | Updated | Current Position section |
| `docs/reference/feature-specs.md` | Updated | Session 027 entry in index |

---

## Key Decisions

1. **Account String Diagram + Dimensional Matrix are the top COA visual gaps** — these are the two artifacts every CFO expects in a COA presentation. The Range Table and Dimension Canvas we already have are necessary but insufficient.
2. **Dynamic hierarchy replaces static FSVs** — instead of building a static hierarchy tree visualization, design an agent-computed system that's more auditable than manual assignment. Three tiers ensure the system converges toward deterministic rules.
3. **Audit trail is a first-class feature** — not an afterthought. Every mapping decision must be traceable, reproducible, and exportable. This is what gets past the auditors.
4. **PDD-011 queued for Session 028** — COA Visual Enhancements + Dynamic Hierarchy as the next major build.
