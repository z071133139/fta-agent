# PDD-004: Account Mapping (d-005-03)

**Scope:** Account Mapping workspace — upgrade from static mock table to data-grounded live agent with persisted analysis flow
**Priority:** High — third GL Design Coach deliverable in COA workstream
**Depends on:** PDD-001 (engagement data sources), PDD-002 (persisted analysis flow)

---

## Problem — Rachel

d-005-03 exists as a **static mock table** with 8 hardcoded rows and an interrupt card asking about account 2340. It looks functional but produces no live output — every user sees the same 8 rows regardless of data.

Account Mapping is where the agent maps every legacy GL account to a proposed new S/4HANA COA structure. The agent should:
- Profile all accounts from the uploaded data
- Propose a mapping for each account (legacy → new COA number + name)
- Flag accounts that need human decision (splits, consolidations, ambiguous mappings)

### Agent Autonomy Boundaries — Rachel

| Action | Autonomy | Why |
|--------|----------|-----|
| 1:1 direct mappings (cash, basic AR/AP) | Agent decides | Industry standard, high confidence |
| NAIC schedule alignment | Agent decides | Regulatory mapping, deterministic |
| Account consolidation (merge 2+ legacy → 1 new) | Agent proposes, **consultant approves** | Business judgment, affects reporting granularity |
| Account splits (1 legacy → 2+ new) | Agent proposes, **consultant approves** | Creates new accounts, affects posting rules |
| Reinsurance flow routing | Agent proposes, **consultant approves** | Complex, ceded/assumed separation is business-specific |
| Unmappable/obsolete accounts | Agent flags, **consultant resolves** | May require client input |

---

## Scope — Rachel

### In

| # | Deliverable | Purpose |
|---|------------|---------|
| 1 | Update `MOCK_WORKSPACES["d-005-03"]` | Add `agent_live: true`, `agent_kind: "data_grounded"`, agent prompt. Remove static rows, columns, interrupt |
| 2 | Agent prompt for account mapping | Structured prompt: profile accounts, then produce mapping table with status per account |

### Out

- New components (reuses PDD-002 infrastructure)
- New backend tools
- Changes to other workspaces

---

## State Machine — David

Same as PDD-002/003. d-005-03 becomes a data-grounded live workspace:

```
needs_data ──[data exists in data-store]──→ ready ──[Run Analysis]──→ running ──[complete]──→ complete
```

The existing static rows, columns, interrupt, and activity are removed. The workspace becomes a live agent that streams structured markdown output through the same infrastructure as d-005-01 and d-005-02.

### Agent-to-UI Contract — David

```markdown
## Account Mapping Summary
[Stats: total accounts, auto-mapped, needs review, unmappable]

## Mapping Table
| Legacy # | Legacy Name | New # | New Name | Status | Notes |
[One row per account from the data]

## Accounts Requiring Decision
### [Account]: [Legacy Name]
**Issue:** [why auto-mapping failed]
**Option A:** [first approach]
**Option B:** [second approach]
**Recommendation:** [agent's pick + rationale]

## Consolidation Opportunities
[Accounts that could be merged in new COA]

## Obsolete Accounts
[Legacy accounts with zero activity — candidates for removal]
```

### Key Decision — David

**Removing the static mock table is the right call.** The existing 8 rows and interrupt card were placeholders. The live agent will produce a complete mapping from actual data — more rows, more nuance, real account numbers. The PDD-002 `CompletedAnalysisView` handles the output display. If we later want structured table rendering (not markdown), that's a trust-layer enhancement (parked).

---

## Layout — Michelle

No new components. Same flow as d-005-01 and d-005-02:

1. **Preflight** (DataAnalysisPreflight) — data source badges + "Run Analysis"
2. **Running** (LiveAgentWorkspace) — streaming output
3. **Complete** (CompletedAnalysisView) — cached results + follow-up + re-run

### Preflight Content — Michelle

- Title: "Account Mapping: Legacy → New COA"
- Bullets:
  - Map all legacy accounts to S/4HANA COA structure
  - Apply NAIC account group taxonomy for insurance alignment
  - Flag accounts requiring split, consolidation, or manual decision
  - Identify obsolete accounts with zero posting activity
- Data source: "DuckDB · ACME P&C GL · 68 accounts"

---

## Key Design Decisions — All Three

1. **Remove static mock data** — the 8 hardcoded rows and interrupt card are replaced by live agent output. (David: static data was a prototype; the agent now produces real mappings from uploaded data)

2. **Same infrastructure as d-005-01/02** — one config change, no new components. (Rachel: consistent experience across all GL Design Coach workspaces)

3. **Mapping decisions in markdown, not InterruptCard** — the agent presents decision points as structured sections in its output. Real interrupt flow (agent pauses, waits for approval) is a trust-layer enhancement. (Michelle: decision sections are visually distinct via markdown headers + bold labels)

---

## Files to Create/Modify — David

| File | Action |
|------|--------|
| `web/src/lib/mock-data.ts` | **Modify** — update `MOCK_WORKSPACES["d-005-03"]` config |

One file, one workspace config update.

---

## Verification — Rachel

1. `pnpm --filter web build` — clean
2. Navigate to `/eng-001/deliverables/d-005-03` with no data → "Upload GL data" message
3. With data uploaded → data source badge + "Run Analysis" CTA
4. Click "Run Analysis" → LiveAgentWorkspace streams
5. Navigate away → back → cached results shown
6. Follow-up input works
7. All other workspaces unaffected
