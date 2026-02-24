# Scoping Canvas — Design Research & Decisions

> Captured from Session 020 design research. This documents the rationale behind the Scoping Canvas artifact — the primary Pursuit phase deliverable used in the first CFO/Controller meeting.

## What It Is

The Scoping Canvas is an interactive artifact pulled up on screen during the first executive meeting with a prospective client. The consultant walks through transformation context and 7 domain themes, capturing scope signals, priorities, pain points, and notes. After the meeting, it exports as a leave-behind JSON (future: PDF).

**Route:** `/pursue/[pursuitId]`
**Files:** `web/src/components/pursue/`, `web/src/lib/scoping-data.ts`, `web/src/lib/scoping-store.ts`

---

## Meeting Flow Design

The canvas is structured around the natural arc of a 60–90 minute CFO/Controller scoping meeting:

### Phase 1: Context (15–30 min) — "Why Transform?"

Before any domain questions, the consultant needs to understand the strategic context. This shapes which of the 7 themes gets priority and how deep to go.

**7 sections, 33 questions:**

| Section | # Qs | What It Surfaces |
|---------|------|-----------------|
| Transformation Drivers | 4 | Why now? Regulatory, system, or business event? Prior attempts? |
| Current Pain Points | 6 | Close cycle, spreadsheet dependency, key-person risk, audit findings |
| Business Context | 5 | DWP, entity count, finance org structure, M&A, growth trajectory |
| Technology Landscape | 5 | Current ERP age, system count, cloud posture, data trust |
| Vision & Success | 4 | CFO's target state, executive sponsor, budget, failure criteria |
| Timeline & Constraints | 5 | Go-live driver, hard vs. aspirational deadline, phasing, resource model |
| AI & Automation | 4 | Current AI usage, autonomous process appetite, board posture |

**Design rationale:**
- Not all questions will be asked — they're conversation starters, not a checklist
- First 2–3 in each section are the must-asks; rest are follow-ups
- "Transformation Drivers" goes first because the answer shapes everything else
- "AI & Automation" goes last — it's our differentiator but needs trust built first
- "Timeline & Constraints" was added because timeline drives scope trade-offs and phasing decisions

### Phase 2: Domain Themes (30–60 min)

7 themes covering all 20 process areas, grouped for executive conversation flow:

| # | Theme | Color | PAs | Qs | Executive Question |
|---|-------|-------|-----|----|--------------------|
| 1 | Accounting Foundation | Blue `#3B82F6` | PA-01, PA-02 | 6 | "How is your GL and chart of accounts structured today?" |
| 2 | Insurance Operations | Teal `#14B8A6` | PA-03–06 | 7 | "Walk me through premium, claims, and reinsurance accounting." |
| 3 | Financial Operations | Purple `#A855F7` | PA-09–13 | 7 | "How do AP, AR, treasury, and intercompany work today?" |
| 4 | Close & Consolidation | Amber `#F59E0B` | PA-14, PA-15 | 6 | "What does your close cycle look like?" |
| 5 | Reporting & Compliance | Emerald `#10B981` | PA-16–18 | 7 | "How do you produce NAIC statements and GAAP filings?" |
| 6 | Analytics & Planning | Rose `#F43F5E` | PA-19 | 5 | "What management reporting and analytics do you have?" |
| 7 | Data & Integration | Slate `#64748B` | PA-20, PA-08 | 6 | "How many systems feed the GL, and what breaks?" |

**Totals:** 1 context tile + 7 themes = 8 expandable sections, 77 questions across 20 process areas.

---

## Theme Grouping Rationale

The 20 process areas originally grouped into 5 technical categories (Foundation, Insurance Operations, Financial Operations, Close & Reporting, Analytics & Tax, Extended/Specialist). These were regrouped into 7 themes for executive conversation:

1. **Foundation → Accounting Foundation** — CoA and GL are always the first topic because they're the architectural foundation. Executives understand "how is your chart of accounts structured?" even if they don't know ACDOCA.

2. **Insurance Operations stays together** — Premium, claims, and reinsurance are the insurance-specific processes. This is where the CFO expects deep domain knowledge. PA-06 (Assumed Reinsurance) included here even though it's "Extended" in the technical taxonomy.

3. **Financial Operations consolidated** — AP, AR, intercompany, fixed assets, treasury. These are familiar to any CFO. Grouped because a single conversation covers the operational finance picture.

4. **Close & Consolidation split from Reporting** — In the original taxonomy, close and reporting were combined. Split because the close conversation ("how many days?") is operationally distinct from the reporting conversation ("which statutory tool?").

5. **Reporting & Compliance gets its own theme** — NAIC, GAAP, and tax reporting are high-anxiety topics for insurance CFOs. Giving them their own theme signals we take compliance seriously.

6. **Analytics & Planning is thin but important** — Only PA-19, but management reporting is where the CFO lives. This is often where AI appetite surfaces naturally.

7. **Data & Integration = PA-20 + PA-08** — PA-08 (Investment Accounting Interface) moved here from "Extended/Specialist" because it's really an integration question: "how does Clearwater feed the GL?"

---

## Question Design Principles

1. **Executive language, not technical** — "How many statutory LOBs?" not "What is your company code hierarchy?" The consultant translates to technical scope after the meeting.

2. **Open-ended, not yes/no** — Every question starts with How/What/Where/Who. Forces the executive to describe their world, not just confirm assumptions.

3. **Pain-eliciting** — "What breaks?" "What keeps your Controller up at night?" These surface the real priorities, not the sanitized version.

4. **Scope-directing** — Each question maps to specific process areas. The answer tells you whether a theme is in/out/explore.

5. **Sourced from PA data where available** — 9 of 20 PAs have `scoping_questions` in the ProcessInventoryNode data. These were used directly or elevated to executive language. Questions were written for the 11 PAs that lacked them.

---

## State Machine Per Theme

```
untouched → exploring → captured
                ↓
             deferred
```

- **untouched** — Muted appearance, no data
- **exploring** — Expanded, consultant is asking questions (blue pulse)
- **captured** — Has notes/signals, collapsed with emerald indicator
- **deferred** — Explicitly marked as out of scope for this meeting

Auto-transition: `exploring → captured` happens on collapse if any data was entered.

---

## Signal Capture Model

Each theme captures three orthogonal signals:

- **Scope Signal** (In / Out / Explore) — Will this theme be part of the engagement?
- **Priority** (High / Medium / Low) — Relative importance if in scope
- **Pain Level** (None / Moderate / Significant / Critical) — How much it hurts today

These three signals, combined with question notes, give the consultant everything needed to write a proposal and plan the first workshop cycle.

---

## Keyboard Design (Projector-Friendly)

The canvas is designed to be used on a projector in front of the CFO. Mouse clicks work but keyboard is faster and looks more polished:

| Key | Context | Action |
|-----|---------|--------|
| `0` | Canvas | Open context tile |
| `1`–`7` | Canvas | Jump to theme and expand |
| `Tab`/`Shift+Tab` | Canvas | Cycle focus between themes |
| `Enter` | Canvas | Expand focused theme |
| `Esc` | Panel | Collapse back to canvas |
| `←`/`→` | Panel | Navigate between questions |
| `I`/`O`/`E` | Panel | Set scope signal (In/Out/Explore) |

Note: keyboard shortcuts are disabled when cursor is in a textarea to avoid conflicts.

---

## Export Format

JSON download with:
- Client name, date, pursuit ID
- Per-theme: status, scope signal, priority, pain level, notes
- Per-question: text, notes, answered flag
- Summary stats: themes explored, captured, deferred, in/out/explore counts

Future: PDF generation with a formatted leave-behind document.

---

## What Flows Downstream

On engagement win, the scoping canvas data flows into:
- **Workplan generation** — In-scope themes map to workstreams, priority determines sequencing
- **Workshop planning** — High-pain themes get early workshops, question notes seed the discussion
- **Proposal writing** — Scope signals + notes provide the raw material for the engagement proposal
- **Value hypothesis** — Pain levels and driver context feed the business case
