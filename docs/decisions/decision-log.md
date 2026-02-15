# Decision Log

This log captures key product and architecture decisions made during ideation and beyond. Each entry records what was decided, why, and any deferred alternatives.

---

## DEC-001: AI-Native Flow as Core Principle

**Date:** 2026-02-14
**Status:** Decided

**Decision:** FTA will be built as an AI-native product from the ground up. It will not be a traditional delivery platform with AI features bolted on.

**Rationale:** The goal is to reimagine consulting work, not automate existing workflows. AI-native design enables capabilities that weren't possible before (adaptive reasoning, generative outputs, continuous context).

**Implications:** Every feature must pass the AI-native litmus test. If it could be described as "a form with AI auto-fill," it needs to be redesigned.

---

## DEC-002: Three-Layer Architecture

**Date:** 2026-02-14
**Status:** Decided

**Decision:** The system is organized into three layers:
- Layer 1: General consulting tools (Requirements, Process Docs, Deck Builder, PMO)
- Layer 2: Domain specialist agents (GL Design Coach first)
- Layer 3: Platform configuration agents (future)

**Rationale:** Separating general tools from domain specialists from configuration agents allows each layer to evolve independently and maintains clear boundaries of responsibility.

---

## DEC-003: Consultant Steers, Agent Executes

**Date:** 2026-02-14
**Status:** Decided

**Decision:** The consultant explicitly chooses which agent or tool to work with. The agent does not autonomously switch contexts.

**Rationale:** Consultants need to feel in control. The agent is a force multiplier, not an autonomous actor. Trust is built by keeping the human in the driver's seat.

---

## DEC-004: SAP-First MVP, ERP-Agnostic Architecture

**Date:** 2026-02-14
**Status:** Decided

**Decision:** MVP targets SAP S/4HANA exclusively. The architecture uses platform adapters so that Oracle and Workday can be added later without re-architecting.

**Rationale:** SAP is the dominant ERP in insurance finance transformations. Focusing on one platform allows depth over breadth. The adapter pattern ensures extensibility.

---

## DEC-005: GL Design Coach as First Domain Specialist

**Date:** 2026-02-14
**Status:** Decided

**Decision:** The GL Design Coach is the first Layer 2 domain specialist agent to be built. Other specialists (Close Process Architect, Regulatory Advisor, etc.) will follow.

**Rationale:** COA design is central to every insurance finance transformation. It touches every other workstream. Starting here maximizes value and creates the foundation for other specialists.

---

## DEC-006: Shared Engagement Context ("Engagement Brain")

**Date:** 2026-02-14
**Status:** Decided (detailed design deferred)

**Decision:** All agents and tools read from and write to a shared engagement context. Context never breaks when switching between agents.

**Rationale:** This is what makes FTA a system rather than a collection of disconnected tools. Cross-workstream visibility and context continuity are key differentiators.

**Note:** Detailed design of the engagement context architecture is deferred for a dedicated design session. This is recognized as a critical feature requiring careful design.

---

## DEC-007: Documentation is Structured-First

**Date:** 2026-02-14
**Status:** Decided

**Decision:** All deliverables are structured data first, rendered for human consumption on demand. Traditional documents (PPT, Word, Excel) are views, not sources of truth.

**Rationale:** Structured data can be consumed by both agents and humans. Traditional documents are dead artifacts that can't be queried, linked, or reasoned over. This is a fundamental shift from how consulting deliverables work today.

---

## DEC-008: Agent-Managed Shared Backlog

**Date:** 2026-02-14
**Status:** Decided

**Decision:** The backlog is managed through the agent (conversational interface), persisted in a structured store, and visually displayable. The lead consultant can update, prioritize, and reassign.

**Rationale:** AI-native -- consultants interact with the backlog conversationally rather than navigating a separate tool. But it must also be visible and manageable for the lead.

---

## DEC-009: Concurrency Supported from Day One

**Date:** 2026-02-14
**Status:** Decided

**Decision:** Multiple consultants can work simultaneously against the same engagement context.

**Rationale:** A 5-person team working on a design phase needs real-time concurrent access. This is a foundational requirement, not a future enhancement.

---

## DEC-010: Permissions and Scope Controls -- Post-MVP

**Date:** 2026-02-14
**Status:** Deferred

**Decision:** Permission and scope controls (who can see what, workstream boundaries) are deferred until after MVP. Initially, all consultants on an engagement see everything.

**Rationale:** MVP focus is on core functionality and validation with a small trusted group. Permissions add complexity that can be layered in once the core is proven.

---

## DEC-011: Configuration Agent -- Deferred, Phased Approach

**Date:** 2026-02-14
**Status:** Deferred

**Decision:** The Configuration Agent (Layer 3) is deferred beyond MVP. When built, it will follow a phased approach:
1. Generate configuration specs (not actual config)
2. Build curated, verified knowledge base
3. Record and learn from expert sessions
4. Direct API-driven configuration in sandbox

**Rationale:** SAP configuration is high-risk. "Mostly right" is dangerous. The MVP value is in design, not execution. Configuration automation requires a verified knowledge base that doesn't exist yet.

---

## DEC-012: Domain Specialist Agents Have Data Skills

**Date:** 2026-02-14
**Status:** Decided

**Decision:** Domain specialist agents are not just advisory. They can ingest, transform, and validate real client data (e.g., GL Design Coach can convert data from legacy GL to target GL).

**Rationale:** This is what makes the agent credible. Consultants can demonstrate to clients that the design has been validated against real data, not just designed on paper.

---

## DEC-013: PMO / Engagement Planning Tool -- Scope Separately

**Date:** 2026-02-14
**Status:** Deferred for separate scoping

**Decision:** A PMO / Engagement Planning tool will be added to Layer 1 general tools. It will be scoped in a dedicated session.

**Rationale:** Engagement planning ties directly into the shared backlog and is essential for team coordination. But the scope is large enough to warrant its own design discussion.

---

## DEC-014: Reporting Design Agent -- Separate from GL Design Coach

**Date:** 2026-02-15
**Status:** Decided (agent to be scoped separately)

**Decision:** Financial and management reporting design will be a separate domain specialist agent (Reporting Design Agent), not part of the GL Design Coach. The GL Design Coach owns reporting requirements as input to code block design ("can the code block support the required reports?"). The Reporting Design Agent owns the actual report design and build ("given this code block, design the reports").

**Rationale:** Different skills, different tools, different expertise. The code block is the foundation; the reports are the output built on top of it.

**Critical design note:** The handoff between code block design and reporting design is a **major source of friction on real consulting projects.** The traditional approach (design the code block, hand it off, design the reports, discover the code block doesn't support them, rework) is broken. FTA needs a smart AI-native solution that eliminates this friction -- the two agents must be tightly integrated through the shared engagement context, with the Reporting Design Agent continuously validating that the code block design supports reporting needs as the design evolves, not after it's finalized. This is a key differentiator to design carefully.

---

## DEC-015: Insurance Language Translation as Core Capability

**Date:** 2026-02-15
**Status:** Decided

**Decision:** The GL Design Coach (and all future insurance domain agents) translates SAP terminology to insurance language in every interaction. SAP was built for manufacturing; insurance companies don't have COGS, production orders, or materials. The agent speaks insurance, not SAP.

**Rationale:** SAP jargon is a constant source of confusion on insurance implementations. The agent bridges the gap between SAP's manufacturing-oriented framework and insurance business reality.

---

## DEC-016: Full Code Block Design, Not Just COA

**Date:** 2026-02-15
**Status:** Decided

**Decision:** The GL Design Coach designs the full insurance code block (all relevant ACDOCA dimensions), not just the chart of accounts. The COA is one dimension. The code block includes profit centers, cost centers, segments, functional areas, COPA characteristics, intercompany dimensions, custom insurance-specific extensions (state, statutory product, etc.), parallel ledgers, and currencies.

**Rationale:** A COA without the surrounding code block dimensions is incomplete. All dimensions interact (document splitting derives segment from profit center, cost center drives functional area, etc.). Designing them in isolation leads to rework.

---

## DEC-017: Sub-Segment Differentiation Required

**Date:** 2026-02-15
**Status:** Decided

**Decision:** The GL Design Coach must differentiate between Life/Annuity, Property & Casualty, and Reinsurance sub-segments. Each has fundamentally different COA structures, reserve accounting, regulatory requirements, and code block dimensions.

**Rationale:** A one-size-fits-all approach doesn't work. A Life carrier's COA looks completely different from a P&C carrier's. The agent must ask at engagement start and adapt accordingly.
