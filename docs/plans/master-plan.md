# FTA Master Plan

> Status: APPROVED (Session 005, updated Sessions 006, 015)
> Created: 2026-02-16 (Session 005)
> Last updated: 2026-02-22 (Session 015)

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

| Phase | Audience | Core Milestone |
|-------|----------|----------------|
| **Phase 1** | Product owner (personal use) | GL Design Coach works on real P&C engagements via CLI |
| **Phase 2** | 3-5 trusted consultants (super testers) | Multi-user, web UI, expanded capabilities |
| **Phase 3** | Consulting teams (broad rollout) | Commercial SaaS, enterprise deployment, multi-specialist |

---

## Phase 1: Personal Use MVP

**Goal:** Product owner can use FTA on a real P&C finance transformation engagement. One user, one engagement, CLI + web interface.

**What's in Phase 1:**
- Three-agent MVP: Consulting Agent + Functional Consultant + GL Design Coach (DEC-029)
- GL Design Coach V1 (P&C only, SAP mode, real data, hybrid knowledge)
- Engagement Context with DuckDB persistence (local, V1) (DEC-032)
- Data Analytics Engine (ingest, profile, MJE analysis)
- RAG pipeline (curated P&C + SAP reference material)
- LLM-based intent routing (DEC-031)
- Agent handoff protocol with structured outcome capture (DEC-034)
- CLI interface (engagement-aware REPL)
- Web UI (Next.js 15 — landing screen, workplan panel, deliverable workspace — Sessions 007–009)
- Synthetic + real P&C data for testing
- Evaluation framework
- Cost monitoring
- LangGraph checkpointing (session persistence)
- LangSmith tracing

**What's NOT in Phase 1:**
- Life/Annuity, Reinsurance sub-segments
- Other Layer 2 specialists (Close Process Architect, Reporting Agent, etc.)
- Layer 3 configuration agents
- Web UI wired to real agent API (frontend built; backend wiring is Iteration 1.5A+)
- Multi-user / concurrency
- Enterprise LLM endpoints
- Supabase (deferred to Phase 2; DuckDB used in Phase 1)

### Phase 1 Iterations

**See [v1-build-plan.md](v1-build-plan.md) for full detail on each iteration.**

| # | Focus | What It Proves | Checkpoint |
|---|-------|---------------|------------|
| **0** | Synthetic test data + evaluation framework | We can measure quality | Realistic data with known patterns? Concrete eval criteria? |
| **1** | **Domain knowledge encoding** | **THE core bet: agent sounds like a senior P&C consultant** | **GO/NO-GO: Product owner confirms depth is sufficient** |
| **2** | Persistence (Supabase + Engagement Context) | Decisions survive across sessions | Structured decisions persist and recall correctly? |
| **3** | Data pipeline + MJE analysis | Can ingest GL data, profile accounts, detect MJEs | ≥90% MJE detection on synthetic data? Handles real data? |
| **4** | RAG pipeline | Reference knowledge improves answers | Measurable improvement on SAP config / NAIC questions? |
| **5** | Integration (wire everything together) | Full flow works end-to-end | Natural conversation with data + persistence + RAG? |
| **6** | Polish + real engagement validation | V1 is usable | 17-step walkthrough with real P&C data passes? |

**Sequence rationale:**
- Iteration 1 (domain knowledge) comes first because it's the highest-risk component and needs zero new infrastructure
- Iterations 2, 3, 4 are informed by Iteration 1 learnings and can partially overlap
- Iteration 5 integrates everything; Iteration 6 polishes for real use

**Phase 1 exit criteria:**
- [ ] Product owner has completed a full design workshop simulation with real P&C data
- [ ] Agent output comparable to senior P&C consultant on ≥80% of evaluation criteria
- [ ] MJE analysis identifies real patterns and links to COA design recommendations
- [ ] Design decisions persist correctly across sessions
- [ ] Performance acceptable at 1M+ posting records
- [ ] Token cost per session within budget
- [ ] No API keys or client data leaked
- [ ] Product owner confirms: ready to use on a real engagement

---

## Phase 2: Super Testers

**Goal:** 3-5 trusted consultants use FTA on real engagements. Feedback drives improvement. The product proves it works for people other than the builder.

### GL Design Coach V2

| Capability | Why in Phase 2 |
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

- Supabase auth (user accounts, session management)
- Concurrent access to shared engagement context (DEC-009)
- Real-time updates via Supabase subscriptions
- Shared backlog with agent-managed interaction patterns
- Lead consultant management view (cross-workstream visibility)
- User onboarding flow for new engagement team members

### Web UI (Next.js)

- Conversation interface with rich rendering (tables, progressive disclosure, code block visualizations)
- File upload for GL data
- Engagement dashboard
- Decision log browser
- Analysis results viewer (persistent analysis store)
- Session history

### Infrastructure

- LLM routing by task complexity (Opus/Sonnet for reasoning, Haiku for formatting/routing)
- LangSmith monitoring across all users
- Deployment to GCP Cloud Run
- Feedback collection mechanism built into the product
- Load testing for multi-user concurrency

### Phase 2 Exit Criteria

- [ ] 3-5 consultants have used FTA on real engagements
- [ ] Feedback collected, analyzed, and incorporated
- [ ] Multi-user concurrency works without data conflicts
- [ ] Web UI is functional and consultant-friendly
- [ ] Layer 1 tools produce usable deliverables
- [ ] Life/Annuity sub-segment validated on a real engagement
- [ ] OLD=NEW reconciliation demonstrated with real data

---

## Phase 3: Broad Rollout

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

### Phase 3 Exit Criteria

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
| DEC-004: SAP-first, ERP-agnostic | Phase 1-2 SAP only. Platform adapters in Phase 3. |
| DEC-009: Concurrency from day one | Supabase schema supports multi-user even in Phase 1. |
| DEC-012: Specialists have data skills | Data pipeline in Phase 1, not deferred. |
| DEC-014: Reporting Agent separate | Close Process Architect + Reporting Agent integration is Phase 3 design challenge. |
| DEC-021: Supabase | Persistence for all phases. Schema evolves, platform stays. |
| DEC-025: Enterprise endpoints deferred | Standard APIs Phase 1-2. Bedrock/Azure Phase 3. |
| DEC-026: P&C only V1 | Life/Annuity in Phase 2. Reinsurance in Phase 3. |
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

> Updated Session 015: Workshop Mode prioritized as the differentiator. Streams A/B/C deferred until after Workshop Mode milestone.

```
Phase 1: Personal Use MVP
├── Project skeleton                         ✅ Session 004
├── GL Design Coach MVP tiering              ✅ Session 004
├── Master plan + V1 build plan              ✅ Session 005 (approved)
├── MVP agent design (skills spec)           ✅ Session 006
│
├── Iteration 0: Test Data + Eval Framework  ✅ Complete
├── Iteration 1: Domain Knowledge + Frontend ✅ Complete
├── Iteration 1.5: Agent Harness             ✅ Frontend complete (Sessions 007–014)
│   ├── Frontend — Landing + Workplan        ✅ Sessions 007–008
│   ├── Frontend — Agent Workspace           ✅ Session 009
│   ├── Frontend — Process Visualization     ✅ Sessions 012–013
│   └── Frontend — Business Requirements     ✅ Session 014
│
├── Stream A: Framework Expansion            ✅ A1–A3, A9 complete (Session 015)
│
├── WORKSHOP MODE (Sessions 016–019)         ← IN PROGRESS
│   ├── W1 Workshop layout toggle            (Session 016) ← NEXT
│   ├── W2 Keyboard capture system           (Session 016)
│   ├── W3 Live requirements editing         (Session 017)
│   ├── W4 Live process flow editing         (Session 017)
│   ├── W5 Agent listening mode              (Session 018)
│   ├── W6 Micro-interactions                (Session 018)
│   ├── W7 Backend persistence               (Session 019)
│   └── W8 Workshop session continuity       (Session 019)
│
├── Stream A continued: A4–A10               (Session 020)
├── Stream C: Platform Polish                (Session 020)
├── Stream B: Data Slice (d-005-01)          (Session 021+)
│
├── Iteration 2: Persistence Layer           (after Stream B proves vertical)
├── Iteration 3–6: Deferred                  (informed by Workshop Mode + Streams)
│
Phase 2: Super Testers
└── (not started)

Phase 3: Broad Rollout
└── (not started)
```

**Coverage:** 9 of 35 deliverables have workspaces (26%). Target after Session 020: 15/35 (43%), all 7 workstreams represented.

**Frontend state:** Full workspace UI running on mock data. Landing page, workspace shell, 4 workspace component types (AnnotatedTable, ProcessInventoryGraph, ProcessFlowMap, BusinessRequirementsTable). 9 deliverables with workspaces across 4 workstreams. Zero API calls.

**Backend state:** Consulting Agent keyword router, GL Design Coach domain prompts, data schemas + DuckDB engine + synthetic data generator ready. No SSE, no data tools wired, no Supabase.

**Next priority:** Workshop Mode — the differentiator. Live capture against leading practice baseline during client workshops.

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
