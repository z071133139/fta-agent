# Design Principles

These principles guide every design and implementation decision in FTA. They are non-negotiable.

## 1. AI-Native, Not AI-Bolted-On

FTA is not a traditional delivery platform with AI features added. The agent IS the interface.

**What this means:**
- **Agent-driven reasoning, not navigation-driven.** The agent drives discovery, asks the right questions, and surfaces what matters — the product is not a chat interface, but the agent's reasoning is conversational. Consultants navigate to structured workspaces (deliverables), not to chat threads.
- **Generative outputs, not templates.** Deliverables are synthesized dynamically based on the specific engagement context, not by filling in blanks on a pre-built template.
- **Adaptive reasoning, not fixed workflows.** The agent determines what to do next based on what it knows. A mid-size P&C carrier with a legacy subledger gets a different path than a large life insurer mid-way through IFRS 17.
- **Continuous context, not session-based.** The agent accumulates knowledge about the engagement over time. Week one context informs week three outputs.
- **Agent-initiated, not just responsive.** The agent proactively identifies gaps, flags risks, and suggests next steps the consultant hasn't asked about.

**Litmus test:** If you could describe the feature as "a form with AI auto-fill," it's not AI-native. Redesign it.

## 2. Documentation is Structured-First, Rendered for Humans on Demand

Traditional consulting deliverables (PowerPoint decks, Word documents, Excel trackers) are dead artifacts. They are unreadable by agents, stale the moment they're created, and can't be queried or linked.

**FTA principle:**
- The **source of truth** is always structured data in the engagement context
- **For the agent:** Semantically tagged, linked, queryable -- the agent can reason over it, update it, and cross-reference it
- **For the human:** Rendered views (decks, PDFs, dashboards, narratives) are generated on the fly from the structured data

**Example:** A requirement isn't a bullet on a slide. It's a structured object with attributes, traceability, status, and linked decisions. When the client asks for "the requirements document," the agent generates it from the living data -- always current, always consistent.

**Litmus test:** If a deliverable can't be consumed by an agent, it's not structured enough.

## 3. Domain Depth is the Moat

Generic AI agents are commoditizing. FTA's defensible value comes from encoding deep insurance finance transformation expertise into the product.

**What this means:**
- The agent knows the difference between a P&C carrier's COA and a life insurer's COA
- The agent understands IFRS 17, LDTI, Solvency II implications on GL design
- The agent knows SAP S/4HANA's universal journal, document splitting, segment reporting
- The agent has opinions based on accumulated best practices

**Litmus test:** If a general-purpose AI could do it equally well, it's not deep enough.

## 4. Shared Context Never Breaks

When a consultant switches between agents or tools, the engagement context stays connected. No re-explaining. No copy-pasting between workstreams.

**What this means:**
- All agents and tools read from and write to the same engagement context
- Cross-references are inferred, not manually created
- Any consultant on the team can see what any other consultant has contributed
- The lead can ask for a cross-workstream summary at any point

**Litmus test:** If a consultant has to re-explain something they already told a different agent, the context is broken.

## 5. Consultant Steers, Agent Executes

The consultant is always in control. They decide what to work on. The agent decides how to do it.

**What this means:**
- The consultant explicitly chooses which agent or tool to work with
- Domain specialist agents guide and advise but don't override the consultant's judgment
- The agent surfaces recommendations and risks; the consultant makes the call

**Litmus test:** If the agent makes a decision without the consultant's awareness, the steering model is wrong.

## 6. Build for One, Architect for Many

MVP focuses on one ERP (SAP), one specialist agent (GL Design Coach), one engagement. But the architecture supports extension from day one.

**What this means:**
- Tool and agent interfaces are standardized -- adding tool N+1 doesn't require re-architecting
- ERP-specific logic goes through platform adapters
- Domain specialist agents follow a common pattern (knowledge, tools, skills, memory)

**Litmus test:** If adding a second ERP or a second specialist agent requires touching the agent core, the abstraction is wrong.
