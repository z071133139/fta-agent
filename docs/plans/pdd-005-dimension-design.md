# PDD-005: ACDOCA Dimension Design (d-005-04)

**Scope:** Dimension Design workspace — new data-grounded live agent workspace
**Priority:** High — fourth GL Design Coach deliverable in COA workstream
**Depends on:** PDD-001 (engagement data sources), PDD-002 (persisted analysis flow)

---

## Problem — Rachel

d-005-04 ("ACDOCA Dimension Design") is listed in the workplan as `not_started` with no workspace config. Clicking it shows "Workspace not available."

This is where the GL Design Coach designs the **S/4HANA ACDOCA dimension structure**: profit center hierarchy, segment assignments, functional area configuration, and how these map to insurance-specific reporting needs (NAIC schedule lines, LOB analysis, statutory vs. management reporting).

ACDOCA (Universal Journal) is the single source of truth in S/4HANA Finance. Getting the dimensions right is critical — they determine every downstream report, allocation, and consolidation. Wrong dimension design is expensive to fix post-go-live.

### Agent Autonomy Boundaries — Rachel

| Action | Autonomy | Why |
|--------|----------|-----|
| Identify dimensions present in legacy data | Agent decides | Factual analysis of uploaded data |
| Assess dimension quality (fill rate, consistency) | Agent decides | Statistical analysis, objective |
| Propose profit center hierarchy | Agent proposes, **consultant approves** | Business-specific, shapes P&L reporting |
| Propose segment structure | Agent proposes, **consultant approves** | Regulatory requirement (IFRS 8), needs business context |
| Recommend functional area usage | Agent proposes, **consultant approves** | Determines cost-of-sales vs. nature-of-expense reporting |
| Flag dimensions with poor data quality | Agent flags, **consultant resolves** | May need client data remediation |

---

## Scope — Rachel

### In

| # | Deliverable | Purpose |
|---|------------|---------|
| 1 | `MOCK_WORKSPACES["d-005-04"]` config | New workspace: `agent_live: true`, `agent_kind: "data_grounded"`, preflight, agent prompt |
| 2 | Agent prompt for dimension design | Structured prompt: assess current dimensions, propose S/4HANA design |

### Out

- New components (reuses PDD-002 infrastructure)
- New backend tools
- Changes to other workspaces

---

## State Machine — David

Same as PDD-002/003/004:

```
needs_data ──[data exists]──→ ready ──[Run Analysis]──→ running ──[complete]──→ complete
```

### Agent-to-UI Contract — David

```markdown
## Current Dimension Assessment
[Table: dimension name, fill rate %, unique values, quality rating]

## Profit Center Design
**Proposed hierarchy:** [levels and structure]
[Table: PC code, name, LOB alignment, NAIC schedule]
**Rationale:** [why this structure]

## Segment Structure
**Proposed segments:** [IFRS 8 operating segments]
[Table: segment code, name, reporting use]
**Rationale:** [regulatory and management needs]

## Functional Area Configuration
**Recommendation:** [nature-of-expense vs. cost-of-sales vs. hybrid]
[Table: FA code, name, usage]
**Impact:** [how this affects P&L presentation]

## Design Decisions Requiring Approval
### Decision 1: [title]
**Context / Recommendation / Alternative / Impact**
```

---

## Layout — Michelle

Same three-screen flow:

1. **Preflight** — data source badges + "Run Analysis"
2. **Running** — streaming output
3. **Complete** — cached results + follow-up + re-run

### Preflight Content — Michelle

- Title: "ACDOCA Dimension Design"
- Bullets:
  - Assess current dimensional usage across all GL accounts
  - Design profit center hierarchy aligned to insurance LOBs
  - Propose segment structure for IFRS 8 operating segment reporting
  - Configure functional area for P&L presentation method
  - Identify dimension data quality gaps requiring remediation
- Data source: "DuckDB · ACME P&C GL · 68 accounts · dimensional attributes"

---

## Key Design Decisions — All Three

1. **Same one-file pattern** — workspace config only. PDD-002 infrastructure handles everything. (David)

2. **Dimension design is the most architecturally consequential deliverable** — profit center and segment choices cascade to every report, allocation, and consolidation. The agent must present clear options with trade-offs, not a single recommendation. (Rachel: this is where consultant judgment matters most)

3. **assess_dimensions is the primary tool** — the agent's main data input. profile_accounts provides supporting context for account-level dimension fill rates. (David: two tools, each called once)

---

## Files to Create/Modify — David

| File | Action |
|------|--------|
| `web/src/lib/mock-data.ts` | **Modify** — add `MOCK_WORKSPACES["d-005-04"]` config |

One file, one new workspace config entry.

---

## Verification — Rachel

1. `pnpm --filter web build` — clean
2. Navigate to `/eng-001/deliverables/d-005-04` → shows preflight with data source badge
3. Click "Run Analysis" → LiveAgentWorkspace streams
4. Navigate away → back → cached results shown
5. All other workspaces unaffected
