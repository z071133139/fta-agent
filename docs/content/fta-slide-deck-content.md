# FTA Agent — Slide Deck Content

> Each slide follows the same beat: **The Old Way** (pain) → **The FTA Way** (capability) → **The Value** (outcome). Punchy. No paragraphs. Every slide should make the audience feel the contrast.

---

## 1. Title

**FTA Agent**
Agentic Consulting for Insurance Finance Transformation

March 2026 | Confidential

---

## 2. The Problem

**We deliver finance transformations the same way we did in 2005.**

- Consultants build PowerPoints, populate Excel workbooks, email them around
- 60% of Phase 0 time goes to assembly — not advisory
- 35+ deliverables rebuilt from scratch every engagement
- 324 requirements captured manually across 20 process areas
- 4–6 weeks before the client sees a single strategic insight

> *"We're billing premium rates for work that doesn't require premium judgment."*

---

## 3. The Shift

**Agents replace the work. Consultants keep the judgment.**

| Consultants should be doing | But they're stuck doing |
|-----------------------------|------------------------|
| Strategic advisory | GL data profiling in Excel |
| Design trade-offs | Dragging boxes in Visio |
| Steering workshops | Writing up notes after workshops |
| Executive insight | Formatting deliverables |
| Client relationships | Tracking open items in spreadsheets |

**FTA moves the right column to agents so consultants live in the left column.**

---

## 4. What Is FTA

**A consulting framework with embedded AI agents that produces all Phase 0 deliverables.**

- The framework is the product — agents are capabilities inside it
- Three modes: Agent-powered (GL analysis) · Knowledge-powered (requirements library) · Hybrid (process inventory + agent findings)
- Consultants steer, validate, advise — agents gather, analyze, assemble

---

## 5. Client Workshops

| Old Way | FTA Way |
|---------|---------|
| Consultant takes notes in Word | Consultant opens FTA on the projector |
| Blank page — "what are your requirements?" | Leading-practice requirements already loaded — client reacts |
| 2–3 hours of cleanup after every session | Structured output walks out of the room |
| Half the context lost in translation | Every capture is agent-normalized in real time |

**How it works:** Keyboard-first. `R` = capture requirement (agent normalizes instantly). `G` = flag a gap. `N` = add a process step. `D` = remove one. Auto-save every 500ms. Close the laptop, fly home, resume exact state.

**Value:** The post-workshop cleanup is eliminated. Every session produces deliverable-ready inputs, not notes.

---

## 6. Process Design

| Old Way | FTA Way |
|---------|---------|
| 4–6 hours in Visio per flow | Describe the flow in conversation |
| Revision = redraw from scratch | Revision = one sentence |
| Consultant skill = graphic design | Consultant skill = insurance finance |

**How it works:** Split screen. Left: chat with the agent. Right: live swimlane preview. *"Create a premium billing reconciliation flow with policyholder, billing system, GL posting, and treasury. Include an exception path for declined payments."* The agent renders it. The consultant iterates. Minutes, not hours.

**Value:** Process design becomes a business conversation. The consultant stays in their domain.

---

## 7. Fit/Gap Analysis

| Old Way | FTA Way |
|---------|---------|
| Binary: "Fits" or "Doesn't fit" | Two-dimensional: how close + what closes it |
| No nuance on effort or approach | ERP Fit (F1–F5) + Agentic Bridge (A0–A3) |
| Gap = bad news, full stop | F3/A2 = "Custom dev needed, but an agent can handle it with human approval" |

**324 requirements across 20 P&C insurance process areas.** Each tagged by category (REG/CTL/FIN/OPS/INT), segment (P&C/Life/Reinsurance), with cross-process-area references that link directly.

**Value:** The gap conversation changes from "this doesn't fit" to "here's exactly what it takes and how automation can help."

---

## 8. GL Analysis & COA Design

| Old Way | FTA Way |
|---------|---------|
| Export GL to Excel, write VLOOKUPs | Agent ingests 500K+ posting lines, runs five analysis tools |
| Days of manual pivoting | Minutes — account profiling, MJE detection, trial balance, income statement, dimension assessment |
| COA design in spreadsheets, emailed around | Four-tab collaborative workbench — agent-seeded, consultant-refined |
| Generic data tools | Insurance-specific: NAIC alignment, statutory mapping, loss reserve patterns, reinsurance recognition |
| Manually build and maintain FSV hierarchies | Agent computes roll-ups dynamically — hierarchy is a view, not a structure |
| Separate hierarchies per reporting basis | Same accounts, multiple perspectives on demand: NAIC / GAAP / IFRS 17 / Management |

**How it works:** GL Design Coach runs autonomously. Detects MJE patterns (recurring entries, high concentration, accrual/reversal pairs, intercompany). Generates GAAP income statements with LOB breakdown. Assesses dimension fill rates. Then seeds the COA Design Workbench — Code Blocks, Account Groups, Dimensions, Decisions — with inline-editable cells and per-tab agent chat.

**Dynamic hierarchy:** Instead of manually assigning 780 accounts to FSLI nodes across 4 reporting bases (3,120+ assignments), the agent classifies accounts using a three-tier model: deterministic rules (~80%), pattern heuristics (~15%), and agent-proposed with consultant pin (~5%). The system converges toward zero LLM calls — the agent teaches the rules, then the rules run without the agent.

**Value:** Weeks 1–4 of GL work compressed to hours. Every recommendation grounded in the client's actual data. You'll never manually maintain an FSV again.

---

## 8b. Audit-Ready Classification

| Old Way | FTA Way |
|---------|---------|
| Someone assigns an account in SAP — no reasoning captured | Every mapping has a documented basis: rule, pattern match, or agent reasoning |
| Change trail = transport log, if you're lucky | Full override chain: who changed what, when, why. Nothing deleted. |
| Auditor asks "why is this account here?" — consultant guesses | Classification source + basis text + approval trail for every account |
| Re-run = hope it matches last time | Reproducibility hash: same data + same rules = same output, provably |

**Three-tier classification model:**
- **Tier 1 — Rule:** `account_type=loss_reserve AND naic=schedule_p` → Losses Incurred. Deterministic. No LLM.
- **Tier 2 — Pattern:** Credit-only + name contains "premium" + LOB populated → Revenue. Deterministic. No LLM.
- **Tier 3 — Agent→Pinned:** Agent proposes with full reasoning. Consultant approves. Approval converts to Tier 1 rule. LLM only invoked for accounts it hasn't seen before.

**The audit artifact:** Exportable as workpaper appendix. Every account: FSLI assignment, classification source, basis, approver, date, change history. Agent reasoning preserved verbatim. More auditable than today's manual hierarchies.

**Value:** External auditors get a cleaner trail than they've ever seen on a COA mapping. The system is *more* auditable with AI than without it.

---

## 9. Scoping

| Old Way | FTA Way |
|---------|---------|
| 50-slide deck to the CFO meeting | Orbital canvas — seven themes around a central question |
| Most slides skipped, conversation wanders | 76 questions elevated to executive language, two capture modes |
| Scoping lives in a Word doc | Keyboard-first: arrow keys, Enter, number keys — no mouse during the conversation |

**Two modes:** Rapid 12 (30-min CFO conversation — In/Out/Explore toggles, priority and pain ratings) and Deep Dive (detailed question-by-question for follow-up sessions with the finance team).

**Value:** The CFO sees scope holistically in one visual. The consultant captures signal, not slides.

---

## 10. Engagement Management

| Old Way | FTA Way |
|---------|---------|
| Open project tracker, scan for your name | Mission Control answers three questions instantly |
| Five tabs to figure out what's blocked | Attention queue: blocked and review items, severity-sorted, one click to the workspace |
| Status meeting to learn who's doing what | Presence pips on every workplan row — green = active now, gray = recent |
| Email the client for data, save to SharePoint | Each workstream declares its data requirements — the system knows what's missing and what it unlocks |

**Value:** Day one, every workstream, every deliverable, every decision — one screen. No dropped items. No status meetings to get oriented.

---

## 11. Agent Transparency

| Old Way (Every Other AI Tool) | FTA Way |
|-------------------------------|---------|
| Black-box "Run AI" button | Preflight: see exactly what the agent will analyze before it starts |
| Spinner → wall of text | Live execution: color-coded status bar, tool call badges, elapsed time |
| No explanation of how it got there | Three-level trace: outcome → step summary → raw inputs/outputs |
| Take it or leave it | Every output is inline-editable. Every decision is overridable. |

**The trust model:** Preflight → Live Execution → Decision Interrupts → Auditable Output. Consultants see what agents will do before they do it. Amber interrupt cards surface when the agent hits a judgment call. Enter = approve, Esc = decline.

**Value:** This is how you earn trust with skeptical insurance finance professionals. Not by hiding the AI — by making every step visible.

---

## 12. What's Built Today

This is working software, not a roadmap.

| | |
|---|---|
| **16** deliverable workspaces | across **7** workstreams |
| **3** specialized agents | GL Design Coach · Functional Consultant · Consulting Agent |
| **5** DuckDB analysis tools | Account Profiling · MJE Detection · Trial Balance · Income Statement · Dimension Assessment |
| **324** business requirements | across **20** P&C insurance process areas |
| **20** leading-practice flows | + NLP custom flow builder |
| **Full** workshop mode | keyboard-first capture with session persistence |
| **Full** scoping canvas | orbital layout, Rapid 12, Deep Dive |
| **Full** mission control | attention queue, presence pips, workplan, stats |
| **Full** COA workbench | four-tab collaborative artifact with inline editing |

---

## 13. Technical Architecture

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15, Tailwind + Shadcn/ui, Zustand, React Flow, SSE streaming |
| Agent | LangGraph, Claude (Opus/Sonnet/Haiku), LiteLLM routing, decision registry, structured logging |
| Data | Python FastAPI, DuckDB (500K+ rows), Polars, Supabase (Postgres + pgvector) |

Production-grade. Strict TypeScript. Strict MyPy. Not a prototype.

---

## 14. Roadmap

| Phase | What happens |
|-------|-------------|
| **Now** — Personal MVP | Core workflows operational. 7 workstreams, 35 deliverables. GL analysis live. Battle-tested on real engagements. |
| **Next** — Practice Pilots | 3–5 senior consultants. Multi-user cloud infrastructure. Feedback-driven refinement. |
| **Vision** — Practice Standard | Standard tooling for all FT engagements. Multi-tenant. Adjacent industries. Competitive differentiator in pursuit. |

---

## 15. The Ask

**Let me prove it on one engagement.**

Run the next P&C finance transformation with FTA alongside the traditional approach. Same engagement, same client, same team — agents accelerating Phase 0.

1. **Pilot on one upcoming engagement** — Low risk. Agents supplement, not replace.
2. **2–3 consultants as early adopters** — Feedback shapes the platform.
3. **Measure the difference** — Time to insight. Deliverable quality. Client satisfaction.

---

## 16. The Thesis

The consulting framework is the product.
The AI agents are capabilities embedded within it.
Every deliverable is a living artifact — not a file to be emailed.
Every agent action is transparent, attributable, and overridable.

**The consultant's expertise is amplified, not replaced.**
