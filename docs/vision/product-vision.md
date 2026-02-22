# Product Vision

> Last updated: Session 015

## The Problem

Finance transformation projects in the insurance industry follow a well-established consulting model: teams of consultants manually gather requirements, document processes, design target operating models, and produce deliverables. This work is:

- **Repetitive across engagements** — the same patterns, questions, and frameworks apply to most insurance finance transformations
- **Heavily dependent on individual experience** — quality varies based on which consultant is staffed
- **Manual and slow** — consultants spend the majority of their time gathering, assembling, and formatting rather than advising
- **Siloed** — knowledge lives in individual laptops, emails, and slide decks; it doesn't compound across the team or across engagements

A typical P&C insurer finance transformation — discovery through design — consumes 12 to 18 months and $3–8M in consulting fees before a single line of ERP configuration is written. Most of that time goes to expensive assembly, not judgment.

## The Vision

FTA is an **interactive consulting framework** for insurance finance transformations, with AI agents embedded as capabilities within it. The framework is the product. A consultant opens it every day to navigate workstreams, review deliverables, make scoping decisions, and capture requirements.

**Shift:** From consultants who gather, assemble, and format → to consultants who steer, validate, and advise.

The framework handles structured domain content and analytical work. The consultant applies judgment, manages relationships, and makes decisions. AI agents are capabilities within the framework — not the product itself.

## The Product

FTA is built around **deliverables**, not conversations. Each deliverable in the engagement workplan has a dedicated workspace. Some workspaces are **agent-powered** (GL Account Analysis — agent ingests data, runs analysis, produces artifacts). Others are **knowledge-powered** (Business Requirements — curated domain library the consultant navigates and customizes). Some are **hybrid** (Process Inventory — knowledge library enriched by agent findings).

### The Full Lifecycle

FTA covers the complete engagement lifecycle — from first executive meeting through delivery:

**Pursuit phase** — before you win the work. The consultant pulls up the Scoping Canvas in a first meeting with the CFO. 7 transformation themes radiating from the client's company. As the conversation flows, scope decisions, pain points, and priorities are captured structured and in real-time. The canvas itself signals domain competence. At the end, the scope document exports as a PDF leave-behind. Pursuit deliverables include: Scoping Canvas, Executive Summary, Value Hypothesis, Proposal, RFP Response.

**Delivery phase** — after you win. The scope captured in pursuit flows directly into the workplan. The 7 themes become the 7 workstreams. Pain points become early findings. Nothing is re-gathered.

### The Navigation Flow

1. **Landing screen** — consultant sees active pursuits (pre-engagement) and active engagements (delivery), clearly separated
2. **Pursuit workspace** (`/pursue/[pursuitId]`) — scoping canvas, proposal tools
3. **Workplan panel** — click an engagement to see the full workplan (workstreams, deliverables, status, scope)
4. **Deliverable workspace** — click any deliverable to open the workspace

This is intentionally not a chat interface. It is a structured workspace where agents produce artifacts that consultants review and steer.

### Three Product Modes

The same workspaces serve three distinct interaction patterns:

| Mode | When | Interaction |
|------|------|------------|
| **Pursuit** | Pre-engagement, exec meeting | Scoping canvas, radial domain map, pain point capture |
| **Workshop** | During delivery, client in the room | Live capture against leading practice baseline, keyboard-first, agent-assisted |
| **Solo** | Between workshops, consultant alone | Review, refine, run agent analysis, prepare next session |

**Workshop mode** is where FTA's agent value is most visible. The consultant pulls up the process flow or requirements table on a projector. The leading practice baseline is pre-loaded. The client team reacts — "we have an extra approval step here," "that takes us 3 days," "we don't do that today." The consultant captures changes with keyboard shortcuts (`N` new step, `R` new requirement, `G` flag gap). The agent quietly assists: auto-classifying requirements, flagging cross-session overlaps, detecting gaps. The artifact updates in real-time — no post-workshop manual update needed.

### Three Deliverable Models

**Agent-powered** (e.g., GL Account Analysis): The agent ingests client data, runs analysis, and produces artifacts. Every row traces back to a specific source — posting lines, MJE analysis output, account master entries. Findings are detected in the data, not generated from general knowledge.

**Knowledge-powered** (e.g., Business Requirements, RACI Matrix, Scope Definition): The workspace draws from a curated domain library — standard requirements, process templates, benchmark patterns — adapted to the engagement's context (segment, ERP target, phase). No agent run required; the framework provides the content.

**Hybrid** (e.g., Process Inventory): Starts from a knowledge library (leading practice process areas), enriched by agent findings (GL analysis results surface as overlay suggestions on process nodes).

### Human Oversight by Design

FTA is built for skeptical insurance finance professionals. Every workspace must:
- Show source attribution on every finding — which file, which rows, which analysis
- Provide confidence indicators on output — never present uncertainty as certainty
- Offer human override on every agent decision — `InlineInterrupt` stops the agent and surfaces the decision for the consultant
- Maintain an audit trail — every agent action is logged and accessible

When the agent can't proceed alone, it stops and asks. The consultant sees the exact question, the context, and the consequences of each option. Nothing moves forward without explicit confirmation.

---

## Value Proposition

### For the Consultant
- Compress early-phase timelines dramatically
- Produce higher-quality, more consistent deliverables
- Focus on high-value advisory work instead of document assembly
- Maintain full context across all workstreams without manual effort
- Each deliverable workspace gives the agent's full reasoning, not just the output

### For the Client
- Faster time to deliverables
- More consistent quality regardless of which consultant is assigned
- Design artifacts that are directly traceable to client data
- Living documentation that stays current throughout the engagement

### For the Firm
- Higher consultant leverage — fewer people, same or better output
- Reusable domain knowledge that compounds across engagements
- Differentiated offering in a competitive market
- Structured decisions logged from day one, reducing knowledge loss when consultants roll off

---

## Target Users

### Primary: Finance Transformation Consultants
Working on the design phase of insurance finance transformation projects. They interact with specific agents daily based on their workstream: accounting experts with the GL Design Coach, business analysts with the Functional Consultant, project managers with the Consulting Agent.

### Secondary: Engagement Leads
Overseeing the engagement, managing the workplan, ensuring quality across workstreams. They use the Consulting Agent for status synthesis, cross-workstream visibility, and steering committee deliverables.

### Future: Client Stakeholders
Insurance company finance teams who may review certain outputs (e.g., a COA design recommendation) or interact with the agent directly in later phases.

---

## What This Is NOT

- Not a generic AI chatbot with finance knowledge
- Not a traditional project management platform with AI features bolted on
- Not a replacement for consultants — it is a force multiplier
- Not a template library — outputs are generated from structured engagement context and client data
- Not a black box — every recommendation shows its sources, every decision has an audit trail

---

## Industry Focus

- **Primary:** Insurance (P&C MVP, then Life/Annuity, Reinsurance)
- **Domain:** Finance transformation — GL design, close process, regulatory reporting, TOM, data migration
- **ERP platforms:** SAP S/4HANA (MVP), Oracle Cloud ERP and Workday Financials via platform adapters

---

## Rollout Strategy

| Phase | Audience | Core milestone |
|-------|----------|----------------|
| Phase 1 | Product owner (personal use) | GL Design Coach works on real P&C engagements via CLI + web |
| Phase 2 | 3–5 trusted consultants | Multi-user, Supabase auth, GCP deployment, Life/Annuity sub-segment |
| Phase 3 | Consulting teams | Commercial SaaS, multiple specialist agents, enterprise infrastructure |
