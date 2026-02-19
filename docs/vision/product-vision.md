# Product Vision

> Last updated: Session 009

## The Problem

Finance transformation projects in the insurance industry follow a well-established consulting model: teams of consultants manually gather requirements, document processes, design target operating models, and produce deliverables. This work is:

- **Repetitive across engagements** — the same patterns, questions, and frameworks apply to most insurance finance transformations
- **Heavily dependent on individual experience** — quality varies based on which consultant is staffed
- **Manual and slow** — consultants spend the majority of their time gathering, assembling, and formatting rather than advising
- **Siloed** — knowledge lives in individual laptops, emails, and slide decks; it doesn't compound across the team or across engagements

A typical P&C insurer finance transformation — discovery through design — consumes 12 to 18 months and $3–8M in consulting fees before a single line of ERP configuration is written. Most of that time goes to expensive assembly, not judgment.

## The Vision

FTA reimagines how consultants deliver finance transformation projects. It is not a tool that assists consultants — it is a **virtual consulting team** that changes what consultants do.

**Shift:** From consultants who gather, assemble, and format → to consultants who steer, validate, and advise.

The agents handle analytical and synthesis work. The consultant applies judgment, manages relationships, and makes decisions.

## The Product

FTA is built around **deliverables**, not conversations. Each deliverable in the engagement workplan has a dedicated workspace. An agent runs in that workspace — either analyzing client data or drawing from a leading practice library — and the consultant reviews, steers, and confirms.

### The Navigation Flow

1. **Landing screen** — consultant sees their active engagements, open decisions, and high-priority items
2. **Workplan panel** — click an engagement to see the full workplan (workstreams, deliverables, status, scope)
3. **Deliverable workspace** — click any deliverable to open the workspace where the agent does its work

This is intentionally not a chat interface. It is a structured workspace where agents produce artifacts that consultants review and steer.

### Two Agent Value Models

**Data-grounded** (GL Design Coach): The agent's output derives entirely from the client's actual data. Every row in the artifact table traces back to a specific source — posting lines, MJE analysis output, account master entries. Findings are not generated from general knowledge; they are detected in the data.

**Knowledge-grounded** (Functional Consultant): The agent starts from a curated leading practice library — standard requirements, process templates, benchmark patterns — and adapts them to the engagement's context (segment, ERP target, phase). The output is not generic; it is calibrated to this engagement.

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
