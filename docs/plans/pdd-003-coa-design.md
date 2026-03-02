# PDD-003: Chart of Accounts Design (d-005-02)

**Scope:** COA Design workspace — data-grounded live agent with structured output, design decisions requiring consultant sign-off
**Priority:** High — core GL Design Coach deliverable, second in the COA workstream after Account Analysis
**Depends on:** PDD-001 (engagement data sources), PDD-002 (persisted analysis flow)

---

## Problem — Rachel

d-005-02 exists in the workplan as "Chart of Accounts Design (code block, dimensions)" with status `in_progress` and `needs_input: true`. But there is no workspace config — clicking it shows "Workspace not available."

This is the deliverable where the GL Design Coach proposes the **new S/4HANA COA structure**: code block ranges, account groups aligned to NAIC annual statement lines, dimension assignments (profit center, segment, functional area), and multi-GAAP ledger allocation rules. It depends on the Account Analysis (d-005-01) output — the profiled accounts, MJE patterns, and document splitting flags inform every design decision.

The critical difference from d-005-01: COA Design is **not just analysis — it produces design decisions that require consultant approval.** The agent proposes, the consultant approves or modifies. This is where the trust layer matters most.

### Agent Autonomy Boundaries — Rachel

| Action | Autonomy | Why |
|--------|----------|-----|
| Propose code block ranges (1XXXXXXX–9XXXXXXX) | Agent decides | Industry standard, low risk |
| Assign NAIC account group taxonomy | Agent decides | Regulatory mapping, deterministic |
| Propose profit center / segment hierarchy | Agent proposes, **consultant approves** | Business-specific, shapes all downstream reporting |
| Recommend document splitting configuration | Agent proposes, **consultant approves** | Irreversible in S/4HANA — wrong choice is costly |
| Propose multi-GAAP ledger structure (leading vs. extension) | Agent proposes, **consultant approves** | Architectural fork — FPSL vs. direct GL is irreversible |
| Flag accounts needing manual resolution | Agent flags, **consultant resolves** | Ambiguous legacy accounts, agent lacks context |

---

## Scope — Rachel

### In

| # | Deliverable | Purpose |
|---|------------|---------|
| 1 | `MOCK_WORKSPACES["d-005-02"]` config | Workspace definition: `agent_live: true`, `agent_kind: "data_grounded"`, preflight bullets, agent prompt |
| 2 | Agent prompt for COA design | Structured prompt producing sections: Code Block Design, Account Groups, Dimension Assignments, Design Decisions |
| 3 | PDD-002 flow integration | Uses `DataAnalysisPreflight` → `LiveAgentWorkspace` → `CompletedAnalysisView` (already built) |
| 4 | Design decision rendering | Agent output includes decision points with options — rendered as amber InterruptCards inline with the analysis |

### Out

- New backend tools (uses existing `profile_accounts`, `assess_dimensions`, `compute_trial_balance`)
- Changes to CompletedAnalysisView (trust layer improvements are parked — see NEXT-STEPS.md)
- Changes to other workspaces
- Real Supabase persistence

---

## State Machine — David

Same as PDD-002. d-005-02 is a data-grounded live workspace, so it follows the existing analysis store flow:

```
needs_data ──[data exists in data-store]──→ ready ──[Run Analysis]──→ running ──[complete]──→ complete
                                              ↑                                                  │
                                              └──────────────────[Re-run]────────────────────────┘
```

No new state machine needed. The `isDataGroundedLive` check in the deliverable page already routes through this.

### Agent-to-UI Contract — David

The agent prompt must produce **structured markdown** with clear section headers so that even without the trust layer refactor, the output is scannable:

```markdown
## Code Block Structure
[Table: range, account type, NAIC alignment]

## Account Groups
[Table: group code, name, NAIC schedule line, account count]

## Dimension Assignments
[Table: dimension, values, assignment basis]

## Design Decisions Requiring Approval
### Decision 1: [title]
**Context:** [why this matters]
**Recommendation:** [agent's choice]
**Alternative:** [other option]
**Impact:** [what changes downstream]
```

This structure ensures the output is not a wall of text even before we build structured rendering components.

---

## Layout — Michelle

No new layout components needed. This workspace uses the same screen flow as d-005-01:

1. **Preflight** (DataAnalysisPreflight) — shows data source badges from engagement store + "Run Analysis" CTA
2. **Running** (LiveAgentWorkspace) — AgentStatusBar + StreamingOutput with markdown rendering + TracePanel
3. **Complete** (CompletedAnalysisView) — cached output + follow-up input + re-run

The agent prompt is the key design lever — it shapes the output structure that the user sees.

### Navigation — Michelle

- Accessible from WorkplanSpine → WS-005 COA & GL Design → "Chart of Accounts Design"
- Breadcrumb: `← Engagements / Acme Insurance / COA & GL Design / Chart of Accounts Design`
- No new navigation changes needed

---

## Key Design Decisions — All Three

1. **Reuse PDD-002 infrastructure** — no new components. The workspace config + agent prompt are the only new code. (David: avoid component proliferation before the trust layer refactor)

2. **Agent prompt is the product** — the quality of d-005-02 output depends entirely on the prompt. It must reference Account Analysis findings (MJE patterns, document splitting flags) and produce insurance-domain-specific COA recommendations. (Rachel: the agent must demonstrate it has read the data, not just generic COA advice)

3. **Design decisions as structured sections** — the agent prompt instructs the LLM to separate factual analysis (code blocks, NAIC mapping) from judgment calls (dimension hierarchy, ledger architecture). This makes it clear where the consultant's input is needed. (Michelle: visual hierarchy through markdown headers, not through new components)

4. **Dependencies on d-005-01 are prompt-level** — the agent prompt references the same engagement data. It doesn't read d-005-01's cached output. Both workspaces analyze the same uploaded data independently. (David: no cross-deliverable state coupling)

---

## Files to Create/Modify — David

| File | Action |
|------|--------|
| `web/src/lib/mock-data.ts` | **Modify** — add `MOCK_WORKSPACES["d-005-02"]` config |

That's it. One file, one workspace config entry. The PDD-002 infrastructure handles everything else.

---

## Verification — Rachel

1. `pnpm --filter web build` — clean
2. Navigate to `/eng-001/deliverables/d-005-02` with no data uploaded → shows "Upload GL data" message + link to dashboard
3. Upload sample data on dashboard → navigate to d-005-02 → shows data source badge + "Run Analysis" CTA
4. Click "Run Analysis" → LiveAgentWorkspace streams (or shows agent status if backend not running)
5. Navigate away → back → cached results shown (no preflight)
6. Follow-up input works
7. "Re-run" clears cache and restarts
8. All other workspaces unaffected
