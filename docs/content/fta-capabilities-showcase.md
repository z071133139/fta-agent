# FTA: Reimagining Finance Transformation Delivery

> How we're replacing the spreadsheet-and-slide consulting model with an AI-native framework that treats every deliverable as a living, agent-assisted artifact.

---

## The Problem We're Solving

Finance transformations are delivered the same way they were in 2005: consultants build PowerPoints, populate Excel workbooks, email them around, and hope the version in the partner's inbox is current. The "tools" are generic — Visio for flows, Excel for requirements, Word for reports. Nothing knows what a GL account is. Nothing knows that NAIC Annual Statement Line 1 matters. Nothing connects the gap analysis to the process design to the COA structure.

FTA changes every part of this.

---

## 1. Workshop Mode — Live Capture Against a Baseline

**The old way:** A consultant takes notes in a Word doc during a client workshop. After the meeting, they spend 2-3 hours cleaning, formatting, and entering requirements into a tracker. Half the context is lost.

**The FTA way:** The consultant opens FTA on the projector. The leading-practice process flows and requirements are already loaded. The client team reacts to what exists — not a blank page. As they speak, the consultant captures in real time:

- **`R` key** — captures a requirement. The agent immediately normalizes it ("System must process premium adjustments within T+1 settlement window.") and the consultant accepts with `Y`, edits with `E`, or discards with `Esc`.
- **`G` key** — flags a process step as a gap against the leading practice, with notes about why.
- **`N` key** — captures a new process step and places it directly into the swimlane flow, with automatic edge splitting to maintain flow integrity.
- **`D` key** — deletes an irrelevant step, with automatic edge bridging so the flow stays connected.

The workspace transforms for workshop mode: the sidebar collapses, the capture bar appears, and keyboard shortcuts activate. Sessions auto-save every 500ms to localStorage. The consultant can close the laptop, fly home, and resume the exact session state — including sequence counters for requirement IDs.

**What walks out of the room:** Not notes. Structured, categorized, agent-reviewed deliverable inputs. The session export includes new requirements (normalized), modified flows, flagged gaps, and a summary with counts. The 2-3 hour post-meeting cleanup is eliminated.

---

## 2. NLP Process Flow Builder — Describe It, Don't Draw It

**The old way:** A consultant spends 4-6 hours in Visio manually dragging shapes to create a future-state process flow. Revisions mean re-drawing.

**The FTA way:** Split-view workspace. Left panel: chat with the Functional Consultant agent. Right panel: live swimlane preview.

> "Create a premium billing reconciliation flow with policyholder, billing system, GL posting, and treasury. Include an exception path for declined payments and a regulatory hold for state-specific premium tax calculations."

The agent asks clarifying questions about approval thresholds, system boundaries, and exception handling. Then it emits a structured flow — swim lanes, decision gateways, system vs. manual steps, annotations — that renders live in the preview panel. The consultant iterates:

> "Add a reinsurance cession step after the GL posting, with a gateway for treaty vs. facultative."

The flow updates in real time. When the consultant is satisfied, "Accept Flow" saves it to the index alongside the leading-practice flows, tagged as a custom creation.

**What this means:** Process design shifts from graphic design to business conversation. The consultant's expertise is in insurance finance processes, not in Visio. FTA lets them stay in their domain.

---

## 3. Fit/Gap Framework with Agentic Bridge Ratings

**The old way:** Binary fit/gap. "Fits" or "Doesn't fit." No nuance on how close the fit is or what it would take to close the gap.

**The FTA way:** Two-dimensional assessment:

**ERP Fit Rating (F1–F5):**
| Rating | Meaning |
|--------|---------|
| F1 | Native platform capability — configure and go |
| F2 | Supported with standard extension or add-on |
| F3 | Feasible with custom development |
| F4 | Significant customization required — high risk |
| F5 | Not feasible on this platform |

**Agentic Gap Closure Rating (A0–A3):**
| Rating | Meaning |
|--------|---------|
| A0 | No agentic path — pure manual or pure platform |
| A1 | Agent-assisted — human decides, agent prepares |
| A2 | Agent-supervised — agent acts, human approves |
| A3 | Fully autonomous — agent handles end-to-end |

A requirement rated F3/A2 tells the client: "This requires custom development, but an AI agent could handle it with human approval at checkpoints." That's a fundamentally different conversation from "This is a gap."

324 requirements across 20 insurance finance process areas — each with cross-PA reference detection (clickable chips that link "See PA-07" references to the actual process area), tag classification (REG/CTL/FIN/OPS/INT), and segment applicability (P&C/Life/Reinsurance/All).

---

## 4. GL Design Coach — Domain AI, Not Generic AI

**The old way:** A consultant exports GL data to Excel, writes VLOOKUP formulas, pivots manually, and builds slides summarizing findings. Takes days.

**The FTA way:** The GL Design Coach is a P&C insurance specialist agent with five DuckDB-powered analysis tools:

- **Account Profiling** — posting activity distribution, MJE concentration ratios, dimensional usage per account. Answers: "What does this GL look like?"
- **MJE Detection** — four pattern types: recurring identical entries, high concentration accounts, accrual/reversal pairs, intercompany entries. Answers: "Where are the risky manual processes?"
- **Trial Balance Computation** — opening/closing balances with period debits and credits. The fundamental financial verification.
- **Income Statement Generation** — GAAP-format P&L with optional Line of Business breakdown. Answers: "What does performance look like by segment?"
- **Dimension Assessment** — fill rates, value distributions, cross-analysis by account type. Answers: "Are the analytical dimensions consistently populated?"

These are not generic data tools. They encode insurance finance domain expertise — NAIC alignment checks, statutory category mapping, loss reserve pattern detection, reinsurance accounting recognition. The agent runs them autonomously, interprets the results, and produces findings the consultant can review, edit, and present.

**The COA Design Workbench** takes this further: a four-tab living document (Code Blocks, Account Groups, Dimensions, Decisions) that the agent seeds from analysis output and the consultant refines interactively. Inline-editable cells. Issue tracking embedded in dimension design. Per-tab chat with the GL Design Coach. This is not a report — it's a collaborative design artifact.

---

## 5. Scoping Canvas — Executive Conversations, Not Questionnaires

**The old way:** The consultant brings a 50-slide deck to the CFO meeting. Most slides are skipped. The conversation wanders. Scoping questions live in a Word doc.

**The FTA way:** An orbital layout with seven transformation themes arranged around a central "Why Transform?" context tile. 76 scoping questions derived from the process inventory, elevated to executive language. Two modes:

- **Rapid 12** — quick signal capture across all themes. In/Out/Explore toggles, priority and pain ratings. Designed for a 30-minute CFO conversation.
- **Deep Dive** — detailed question-by-question exploration per theme. For follow-up sessions with the finance team.

Keyboard-first navigation. The consultant doesn't touch the mouse during the client conversation — arrow keys move between themes, Enter opens the detail panel, number keys set ratings. The visual layout communicates scope holistically: the CFO sees which themes are in, which are out, which need exploration. It's a conversation tool, not a data entry form.

---

## 6. Mission Control — "What Do I Do Next?"

**The old way:** Open project tracker. Scan for your name. Figure out what's blocked. Open a different tool for each task.

**The FTA way:** Single-screen mission control that answers three questions instantly:

1. **What needs my attention?** — Collapsible attention queue showing blocked and review items, severity-sorted, with one-click navigation to the deliverable workspace.
2. **Who's working on what?** — Consultant presence pips on workplan rows. Green ring = active right now. Gray = recently active. Relative timestamps ("TR 20m ago on RACI Matrix").
3. **What's the overall status?** — Stats bar (open decisions, HIGH findings, requirements, unvalidated, blocked) + progress bar (13/35 complete, 37%).

Engagements and pursuits are peers in a single dropdown — the consultant switches context without navigating to a different section. The page adapts: engagement selected shows the workplan, pursuit selected shows pursuit deliverables.

---

## 7. Workstream Data Gates — Right Data, Right Place

**The old way:** Consultant emails the client: "Please send us the trial balance extract." Client sends it. Consultant saves it to SharePoint. Analyst downloads it. Nobody remembers which deliverables need which files.

**The FTA way:** Each workstream declares its data requirements. COA & GL Design needs a trial balance extract and a COA extract. The system knows this. The workplan shows green/amber pips: green means data is ready, amber means it's missing. Clicking through shows exactly which files are needed, which deliverables they unlock, and a drag-and-drop upload zone.

When a consultant opens a data-grounded deliverable without the required data, the preflight screen tells them what's missing and routes them to the workstream data setup page — not a generic "upload files" screen.

---

## 8. Agent Transparency — Trust Through Visibility

Every agent interaction follows the same trust-building pattern:

1. **Preflight** — before the agent runs, the consultant sees what will happen, what data will be used, and what the output will cover. No black-box "Run AI" button.

2. **Live execution** — the agent's work is visible in real time. Status bar with color-coded state (blue pulse = thinking, amber = awaiting input, emerald = complete). Tool call badges show which analytical methods are being used.

3. **Three-level trace disclosure:**
   - **Level 0 (default):** Outcome only — "Mapped 47 GL accounts to IFRS 17 structure"
   - **Level 1:** Step summary with tool names, durations, and status badges — for analysts
   - **Level 2:** Raw tool inputs and outputs — for engineers

4. **Source attribution** — every finding references the data that produced it. Every recommendation shows which tool generated it.

5. **Human override** — every agent decision can be edited, rejected, or refined. The COA Workbench is inline-editable. Requirements can be modified. Process flows can be restructured.

This is not AI replacing the consultant. This is AI doing the repetitive analytical work while the consultant retains judgment and control.

---

## What This Adds Up To

| Traditional Approach | FTA Approach |
|---------------------|-------------|
| Workshop notes in Word, cleaned up after | Structured capture in real time, agent-normalized |
| Process flows in Visio, 4-6 hours each | NLP-driven flow creation in minutes, iterative |
| Binary fit/gap in Excel | Two-dimensional fit + agentic bridge rating |
| GL analysis in Excel with VLOOKUPs | Domain-specific DuckDB tools with insurance expertise |
| COA design in spreadsheets, emailed around | Living document with embedded agent assistance |
| Scoping via slide deck and Word questions | Orbital canvas with keyboard-first executive capture |
| Status via project tracker + email | Mission control with presence and attention queue |
| Data files on SharePoint, no traceability | Declarative data gates with deliverable-level readiness |
| Agent output as a black box | Three-level transparency with source attribution |

**Coverage today:** 16 deliverable workspaces across 7 workstreams. Three working agents (GL Design Coach, Functional Consultant, Consulting Agent). Five DuckDB analysis tools. 324 requirements across 20 process areas. Full workshop mode with session persistence. Scoping canvas with Rapid/Deep Dive. Custom process flow builder. COA Design Workbench.

**The thesis:** The consulting framework is the product. The AI agents are capabilities embedded within it. Every deliverable is a living artifact — not a file to be emailed. Every agent action is transparent, attributable, and overridable. The consultant's expertise is amplified, not replaced.
