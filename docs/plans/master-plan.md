# FTA Master Plan

> Status: APPROVED (Session 005, updated Sessions 006, 015)
> Created: 2026-02-16 (Session 005)
> Last updated: 2026-03-09 (Session 034)

## Purpose

This is the single source of truth for what we are building, in what order, and why. It covers the full FTA product from personal MVP through commercial SaaS. Every session references this plan to stay on track.

---

## What FTA Is

> Updated Session 015: Strategic reframe — FTA is an interactive consulting framework, not just an agent.

FTA is an **interactive consulting framework** for insurance finance transformations, with AI agents embedded as capabilities within it. The framework is the product. A consultant opens it every day to navigate workstreams, review deliverables, make scoping decisions, and capture requirements.

Some deliverables are **agent-powered** (GL Account Analysis — agent ingests data, runs analysis, produces artifacts). Others are **knowledge-powered** (Business Requirements — curated domain library the consultant navigates and customizes). Some are **hybrid** (Process Inventory — knowledge library enriched by agent findings). The agent is a capability inside the framework, not the product itself.

It is **not** a chatbot with finance knowledge. It is **not** a template library. It is **not** an agent with a UI bolted on. It is a structured consulting framework where agents do analytical work, domain libraries provide knowledge, and the consultant steers everything through deliverable-centric workspaces.

**Three-agent MVP architecture (DEC-029, Session 006):**
- **Consulting Agent:** Orchestrator + engagement lead + PMO. Routes work, tracks progress, owns the plan.
- **Functional Consultant:** Generalist. Requirements capture, process documentation, deliverable generation.
- **GL Design Coach:** P&C domain specialist. Data analysis, code block design, MJE optimization.

All agents read from and write to the **Shared Engagement Context** ("Engagement Brain").

**Three product modes (Session 015):**

| Mode | When | What FTA does |
|------|------|--------------|
| **Pursuit** | Pre-engagement, exec meeting | Scoping canvas, pain points, proposal generation |
| **Workshop** | During delivery, client in the room | Live capture against leading practice baseline, agent-assisted structuring |
| **Solo** | Between workshops, consultant alone | Review, refine, run agent analysis, prepare next session |

**Full product lifecycle:**

```
PURSUIT PHASE                           DELIVERY PHASE
─────────────                           ──────────────
Qualify → Scope → Propose → Win ────►   Workplan created from pursuit scope
                              Lost ──►  Archived
```

The pursuit phase has its own deliverables (Scoping Canvas, Executive Summary, Value Hypothesis, Proposal, RFP Response) and its own route (`/pursue/[pursuitId]`). The workplan (WS-001 through WS-007) only exists after you win the work. Scope captured in pursuit flows directly into the workplan — nothing is re-gathered.

**Full three-layer architecture (post-MVP):**
- **Layer 1:** General consulting tools (expanded from Functional Consultant)
- **Layer 2:** Domain specialist agents (GL Design Coach first, then Close Process Architect, Regulatory Advisor, etc.)
- **Layer 3:** Platform configuration agents (SAP first, Oracle/Workday later)

---

## Plan Principles

**Test the riskiest assumption first.** Domain knowledge encoding is the core bet. If the agent can't sound like a senior consultant, nothing else matters.

**Iterative, not waterfall.** Every iteration: design → build → test with real data → learn → update plan. Each produces a working prototype the product owner evaluates.

**Infrastructure follows understanding.** Don't design schemas in the abstract. Design them after we've seen real usage and know what needs to be stored.

**Vertical slices, not horizontal layers.** Each phase delivers usable end-to-end capability for its target audience.

**Domain depth before breadth.** One sub-segment done deeply beats three done superficially. One specialist agent that's genuinely useful beats five that are shallow.

---

## Product Phases

> Updated Session 029: Reframed phases. Phase 1 narrowed to Pitch Demo MVP (get buy-in). Original Phase 1 scope (personal use on real engagements) pushed to Phase 2.

| Phase | Audience | Core Milestone |
|-------|----------|----------------|
| **Phase 1** | Stakeholders (pitch demo) | One live demo: AI ingests data, produces COA design, consultant reviews in workbench |
| **Phase 2** | Product owner (personal use) | GL Design Coach works on real P&C engagements, persistence, RAG, eval |
| **Phase 3** | 3-5 trusted consultants (super testers) | Multi-user, expanded capabilities, Life/Annuity |
| **Phase 4** | Consulting teams (broad rollout) | Commercial SaaS, enterprise deployment, multi-specialist |

---

## Phase 1: Pitch Demo MVP

> Reframed Session 029. Original Phase 1 was "personal use on real engagements" — too broad, scope crept across 29 sessions. Narrowed to: one compelling live demo that gets buy-in from collaborators/investors. Original Phase 1 scope pushed to Phase 2.

**Goal:** Demonstrate the product vision with a live end-to-end flow. Audience watches AI ingest a trial balance, produce a structured COA design, and the consultant reviews it in a presentation-quality workbench. Supported by workshop mode and framework depth as credibility backdrop.

**The demo is three moments:**

| Moment | What the audience sees | Duration | Status |
|--------|----------------------|----------|--------|
| 1. "It knows my world" | Mission control → workplan with P&C workstreams, NAIC vocabulary, statutory schedule lines | 30 sec | Ready |
| 2. "It just did real work" | Upload TB → GL Design Coach runs → COA workbench populates → Deliverable tab shows 7/9 green | 3 min | **Gap: live agent reliability** |
| 3. "It works with humans" | Workshop mode → flag gap → capture requirement → agent suggests → accept with Y | 2 min | Ready |

**Remaining scope (3 sessions):**

| # | Session | What | Exit |
|---|---------|------|------|
| 1 | **Harden live agent** | Run d-005-02 with `FTA_MOCK_AGENT=false`. Fix prompt to reliably produce parseable `<coa_design>` JSON. Test 5+ runs, fix parse/quality failures. | 5 consecutive successful runs producing valid COA workbench data |
| 2 | **Deploy + golden dataset** | Dockerfile for backend (GCP Cloud Run). Frontend on Firebase Hosting. Configurable API URL. Golden pre-seeded data as fallback. Smoke test on live URL. | Working deployed URL with live agent + fallback data |
| 3 | **Demo script + rehearsal** | Write exact click path with timing. Visual polish. Rehearse 3x on deployed URL. Record backup video. | Timed run under 6 minutes on live URL, recovery plan for each failure point |

**What is NOT in Phase 1 (pushed to Phase 2):**
- RAG pipeline (audience won't know it's missing)
- Supabase / real persistence
- Evaluation framework execution
- Real P&C data validation (synthetic is fine for demo)
- PDF/Excel export
- Performance testing at scale
- Cost monitoring
- LangGraph checkpointing
- Additional agent capabilities

**Phase 1 exit criteria:**
- [ ] Deployed to a URL (not localhost) — frontend on Firebase Hosting, backend on GCP Cloud Run
- [ ] Live demo completed in front of at least one stakeholder
- [ ] Agent produces valid COA design from trial balance in < 90 seconds
- [ ] Deliverable tab renders all 9 sections with realistic data
- [ ] Workshop mode shown without errors
- [ ] Stakeholder response: interest in next conversation / collaboration
- [ ] Backup video recorded in case of live demo failure

---

## Phase 2: Personal Use MVP

> Absorbs original Phase 1 scope. Goal: product owner uses FTA on a real P&C engagement. One user, real data, real persistence.

**Goal:** Product owner can use FTA on a real P&C finance transformation engagement. Agent output is reliable enough to show clients. Data persists. Knowledge base provides real reference material.

### What's in Phase 2

**From original Phase 1 (deferred during pitch demo focus):**
- RAG pipeline — curate 20-30 P&C/SAP reference docs, pgvector, retrieval quality testing
- Supabase persistence — migrate 6 Zustand stores to server state (TanStack Query)
- Evaluation framework execution — measure agent output against senior consultant criteria
- Real P&C data validation — test on actual trial balance, not just synthetic
- Performance testing at 1M+ postings
- Token cost monitoring per session
- LangGraph checkpointing (session persistence across browser refreshes)
- LangSmith tracing in development

**New capabilities:**
- Trust-building layer — source attribution, confidence indicators, OutputReview split view (see Session 023 audit)
- PDF/Excel export from Deliverable tab
- Agentic Functional Consultant expansion — 5 capabilities: gap→req pipeline, coverage analysis, cross-PA impact, session prep, deliverable drafting
- Remaining knowledge workspaces (A6-A8, A10 from Stream A)
- End-to-end verification of all 16 workspaces with live agents

**Infrastructure:**
- Supabase auth (single user, but real auth)
- DuckDB → Supabase migration for engagement context
- Custom process flow persistence (currently localStorage)
- LLM routing by task complexity (Opus/Sonnet reasoning, Haiku routing)

### Phase 2 Exit Criteria

- [ ] Product owner has completed a full design workshop simulation with real P&C data
- [ ] Agent output comparable to senior P&C consultant on ≥80% of evaluation criteria
- [ ] MJE analysis identifies real patterns and links to COA design recommendations
- [ ] Design decisions persist correctly across sessions (Supabase, not localStorage)
- [ ] Performance acceptable at 1M+ posting records
- [ ] Token cost per session within budget
- [ ] RAG improves answer quality on SAP config / NAIC questions
- [ ] Product owner confirms: ready to use on a real engagement

---

## Phase 3: Super Testers

**Goal:** 3-5 trusted consultants use FTA on real engagements. Feedback drives improvement. The product proves it works for people other than the builder.

### GL Design Coach V2

| Capability | Why in Phase 3 |
|-----------|---------------|
| Life/Annuity sub-segment | Second most common after P&C; validates multi-segment architecture |
| Legacy→target mapping with confidence scores | Core data skill needed for real engagements |
| OLD=NEW reconciliation | Proves the design works -- "every dollar reconciles" |
| Hours-saved estimation for MJE business case | Quantifies value for client stakeholders |
| Specialist tools as callable (Code Block Designer, COA Builder, Gap Analyzer) | Power user features for detailed design work |

### Layer 1 General Tools

| Tool | Purpose |
|------|---------|
| Requirements Engine | Convert meeting notes / transcripts → structured, traceable requirements |
| Process Documenter | NLP-based process documentation from verbal descriptions |
| Deck Builder (python-pptx) | Generate PowerPoint deliverables from engagement context |
| PMO / Planning Tool | Scoped separately (DEC-013) |

### Consulting Agent Upgrade

- LLM-based routing (replace keyword routing)
- Multi-tool orchestration (chain tools for multi-step tasks)
- Standard tool interface enforced across all Layer 1 tools

### Multi-Consultant Support

- Supabase auth (multi-user, session management)
- Concurrent access to shared engagement context (DEC-009)
- Real-time updates via Supabase subscriptions
- Shared backlog with agent-managed interaction patterns
- Lead consultant management view (cross-workstream visibility)
- User onboarding flow for new engagement team members

### Infrastructure

- LangSmith monitoring across all users
- Deployment to GCP Cloud Run
- Feedback collection mechanism built into the product
- Load testing for multi-user concurrency

### Phase 3 Exit Criteria

- [ ] 3-5 consultants have used FTA on real engagements
- [ ] Feedback collected, analyzed, and incorporated
- [ ] Multi-user concurrency works without data conflicts
- [ ] Layer 1 tools produce usable deliverables
- [ ] Life/Annuity sub-segment validated on a real engagement
- [ ] OLD=NEW reconciliation demonstrated with real data

---

## Phase 4: Broad Rollout

**Goal:** FTA is a commercial product sold to consulting firms for insurance finance transformation engagements.

### Additional Layer 2 Specialists

Built using the [agent template](../agents/_template.md). Each follows the same pattern: deep domain knowledge, own tools, memory, opinions, data skills.

| Specialist | Focus | Integration Notes |
|-----------|-------|-------------------|
| Close Process Architect | Close cycle optimization, MJE elimination | Tight integration with GL Design Coach (shared MJE analysis) |
| Reporting Design Agent | Financial / management report design | Validates continuously against code block design (DEC-014) |
| Regulatory Reporting Advisor | IFRS 17, LDTI, Solvency II, NAIC statutory | Feeds regulatory requirements into code block constraints |
| Subledger Integration Specialist | FPSL, policy admin, actuarial, reinsurance system integration | Depends on GL Design Coach code block outputs |
| Data Migration Strategist | Conversion strategy, data quality, cutover planning | Uses GL Design Coach mapping + reconciliation outputs |
| TOM Designer | Target operating model for finance function | Cross-workstream: process, people, technology |
| Reconciliation Designer | Reconciliation framework and automation | Uses GL Design Coach OLD=NEW patterns |

**Critical integration:** Close Process Architect + Reporting Design Agent must be tightly connected to GL Design Coach through engagement context. The traditional sequential handoff (design COA → hand off → design reports → discover gaps → rework) is exactly what FTA eliminates.

### GL Design Coach V3

- Reinsurance sub-segment
- Regulatory Cross-Reference Checker
- SAP automation rule proposals (recurring entries, accrual engine, substitutions)
- Audit risk scoring
- Platform-agnostic mode
- Oracle Cloud ERP adapter
- Workday Financials adapter

### Layer 3: Platform Configuration Agents

Phased approach per DEC-011:

| Phase | Capability | Risk Level |
|-------|-----------|-----------|
| 3.1 | Configuration Spec Generator (IMG paths, t-codes, field values) | Low -- human executes |
| 3.2 | Curated verified SAP knowledge base | Medium -- knowledge must be verified |
| 3.3 | Record and learn from expert configuration sessions | Medium -- learning accuracy |
| 3.4 | Direct API-driven configuration in sandbox | High -- automated execution |

### Enterprise Infrastructure

| Component | Purpose |
|-----------|---------|
| Enterprise LLM endpoints (AWS Bedrock, Azure OpenAI) | Client data governance (DEC-025) |
| Data isolation per engagement | No cross-engagement data leakage (DEC-024) |
| Row Level Security enforced | Multi-tenant data access control |
| SOC 2 readiness | Enterprise security audit compliance |
| Multi-tenancy | Firm-level isolation |

### Commercial

| Component | Purpose |
|-----------|---------|
| Auth + billing | Per-firm SaaS model (DEC-024) |
| Firm onboarding workflow | Self-service or guided setup |
| Usage analytics + cost tracking | Per docs/operations/cost-model.md |
| GCP auto-scaling deployment | Handle production load |
| Documentation + training material | For consulting firm adoption |
| Support model | Tiered support for paying customers |

### Phase 4 Exit Criteria

- [ ] At least one consulting firm paying for the product
- [ ] Multiple concurrent engagements running without interference
- [ ] Enterprise data governance requirements met
- [ ] At least 2 Layer 2 specialists operational beyond GL Design Coach
- [ ] Configuration Spec Generator (Layer 3 Phase 3.1) working for SAP

---

## Cross-Phase Architecture Constraints

These are non-negotiable across every phase (from design-principles.md):

| # | Principle | What It Means in Practice |
|---|-----------|---------------------------|
| 1 | **AI-Native** | The agent IS the interface. No forms with AI auto-fill. If it could be a form, redesign it. |
| 2 | **Structured-First** | All data is structured. Documents are rendered views. Decision capture is structured from day one, not retrofitted later. |
| 3 | **Domain Depth is the Moat** | If a general-purpose AI prompted with the same question produces similar output, the encoding is not deep enough. |
| 4 | **Shared Context Never Breaks** | Switching agents preserves all context. This is the #1 architectural constraint on every new agent/tool. |
| 5 | **Consultant Steers** | Agent recommends, consultant decides. No autonomous context switching. No surprising the user. |
| 6 | **Build for One, Architect for Many** | P&C module is swappable. SAP adapter is replaceable. Single-user schema supports multi-user. Every "V1 shortcut" must have a clean upgrade path. |

---

## Key Decisions That Shape the Plan

| Decision | Impact |
|----------|--------|
| DEC-004: SAP-first, ERP-agnostic | Phase 1-3 SAP only. Platform adapters in Phase 4. |
| DEC-009: Concurrency from day one | Supabase schema supports multi-user even in Phase 1. |
| DEC-012: Specialists have data skills | Data pipeline in Phase 1, not deferred. |
| DEC-014: Reporting Agent separate | Close Process Architect + Reporting Agent integration is Phase 4 design challenge. |
| DEC-021: Supabase | Persistence for all phases. Schema evolves, platform stays. |
| DEC-025: Enterprise endpoints deferred | Standard APIs Phase 1-3. Bedrock/Azure Phase 4. |
| DEC-026: P&C only V1 | Life/Annuity in Phase 3. Reinsurance in Phase 4. |
| DEC-027: Real data day one | Data pipeline is Phase 1 Iteration 3, not deferred. |
| DEC-028: Hybrid knowledge | Prompts + RAG. Both built in Phase 1. |
| DEC-029: Three-agent MVP | Consulting Agent + Functional Consultant + GL Design Coach. |
| DEC-030: Multi-user direct access | Each agent independently accessible by role. |
| DEC-031: LLM-based routing | Replaces keyword regex with LLM intent classifier. |
| DEC-032: DuckDB engagement context (V1) | Local persistence in V1; Supabase in Phase 2. |
| DEC-033: Functional Consultant as agent | Separate agent, not tools on the Consulting Agent. |
| DEC-034: Outcome capture via tool calls | Agents invoke capture tools, not post-turn extraction. |

---

## Current Position

> Updated Session 034: Pitch Deck done, live agents hardened (FC 3/3, COA 3/5), workbench chat wired, Scope Summary Dashboard added. 2 sessions remaining: deploy + golden dataset, then demo script + rehearsal.

```
Phase 1: Pitch Demo MVP (2 sessions remaining)
├── DONE — Framework & UI (Sessions 004–034)
│   ├── Project skeleton + master plan           ✅ Sessions 004–005
│   ├── Frontend harness (landing, workplan, workspaces) ✅ Sessions 007–014
│   ├── 17 deliverable workspaces                ✅ Sessions 015–034
│   ├── Workshop Mode (W1–W8)                    ✅ Sessions 016–019
│   ├── Scoping Canvas                           ✅ Sessions 019–020
│   ├── Stream B agentic capabilities            ✅ Sessions 021–034
│   │   ├── GL Design Coach (5 tools, SSE)       ✅
│   │   ├── Functional Consultant (flow builder) ✅
│   │   ├── COA Design Workbench (8 tabs)        ✅
│   │   ├── Mission Control Landing              ✅
│   │   ├── COA Deliverable tab (PDD-012)        ✅
│   │   ├── Interactive Pitch Deck (PDD-013)     ✅ Session 030
│   │   ├── Workbench chat wired to agent        ✅ Session 032
│   │   ├── FC agent hardened (3/3 live)         ✅ Session 033
│   │   └── Scope Summary Dashboard (PDD-011)    ✅ Session 034
│   └── Process Flow UAT (120 scenarios)         ✅ Session 028
│
├── REMAINING — Demo Readiness
│   ├── S035: Deploy (GCP Cloud Run + Firebase) + golden dataset  ⬜ ← NEXT
│   └── S036: Demo script + rehearsal on live URL ⬜
│
Phase 2: Personal Use MVP
├── RAG pipeline (curated P&C/SAP docs, pgvector)
├── Supabase persistence (migrate 6 Zustand stores)
├── Evaluation framework execution
├── Real P&C data validation
├── Trust-building layer (source attribution, confidence)
├── PDF/Excel export
├── Agentic FC expansion (5 capabilities)
├── Stream A continued (A6–A10)
├── Stream E: Current State Extraction
└── Performance + cost testing

Phase 3: Super Testers
└── Multi-user, Life/Annuity, Layer 1 tools

Phase 4: Broad Rollout
└── Commercial SaaS, Layer 2+3 specialists
```

**Coverage:** 17 of 33 active deliverables have workspaces (52%) + custom process flows via builder. 19 deliverables in agent backlog (`docs/reference/agent-backlog.md`).

**Frontend state:** Full workspace UI. 6 workspace component types (AnnotatedTable, ProcessInventoryGraph, ProcessFlowMap, BusinessRequirementsTable, ScopeSummaryDashboard, COADesignWorkbench) + ProcessFlowBuilder split-view. 17 deliverables with workspaces. Two "living document" patterns: COADesignWorkbench (agent seeds structured data, consultant edits inline, deliverable tab assembles into document) and ProcessFlowBuilder (agent builds structured flows through conversation). Interactive pitch deck at `/pitch` with live workspace demo links.

**Backend state:** Two agent graphs: GL Design Coach (5 analysis tools) + Functional Consultant (emit_process_flow tool). SSE streaming with multi-turn history support, per-request mock mode, workbench chat client. DataEngine + DuckDB + Polars pipeline. FC agent 3/3 live test passing. COA agent 3/5 live runs passing.

**Next priority:** Deploy backend (GCP Cloud Run) + frontend (Firebase Hosting) with golden dataset fallback (Session 035). Then demo script + rehearsal (Session 036).

---

## Plan Governance

| Document | Purpose | Updated When |
|----------|---------|-------------|
| **This document** (master-plan.md) | Full product roadmap, all phases | End of every session |
| **v1-build-plan.md** | Detailed Phase 1 iteration plan | After each iteration checkpoint |
| **NEXT-STEPS.md** | Session pickup document (what to do next) | End of every session |
| **decision-log.md** | Every decision with rationale | When decisions are made |

**Plan update protocol:** After each iteration checkpoint, review: what worked, what surprised us, what changes. Log scope adjustments as decisions. Update plans before proceeding.

**This plan is not a contract. It is our best current understanding of the path forward, updated as we learn.**
