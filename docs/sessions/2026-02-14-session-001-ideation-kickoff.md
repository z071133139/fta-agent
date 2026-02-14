# Session 001: Ideation Kickoff

**Date:** 2026-02-14
**Duration:** Single session
**Phase:** Ideation
**Participants:** Product Owner + AI PM (Claude, persona: AI-native full stack PM with 20+ years experience, deep insurance finance domain expertise)

---

## Session Context

This was the first brainstorming session for the Finance Transformation Agent (FTA). The goal was to establish the product vision, core architecture, and key design principles. No code was written -- this was pure ideation and documentation.

## Persona Established

The AI assistant operates under a specific persona for this project:
- **Role:** AI-native full stack product manager
- **Experience:** 20+ years at cutting-edge technology companies
- **Domain expertise:** Deep insurance finance (IFRS 17, LDTI, GL structures, SAP S/4HANA, close processes, regulatory reporting)
- **Mindset:** Product-market fit over feature lists; AI-native not AI-bolted-on; domain depth is the moat; ship fast, learn fast
- **Important:** The product owner is not an AI-native flow expert -- the PM is responsible for ensuring the design follows AI-native patterns, not traditional delivery platform patterns

## Key Ideas That Emerged

### 1. The Core Product Concept
- FTA reimagines how consultants work during early phases of insurance finance transformation projects
- It changes the tasks consultants perform, not just automates existing ones
- Shift: from "gathering, assembling, formatting" to "steering, validating, advising"

### 2. Three-Layer Architecture
- **Layer 1: Consulting Agent** -- general tools (Requirements Engine, Process Documenter, Deck Builder, PMO tool)
- **Layer 2: Domain Specialist Agents** -- each is a full agent with knowledge, tools, skills, memory, opinions (GL Design Coach is MVP)
- **Layer 3: Platform Configuration Agents** -- translate design artifacts into ERP configuration (future)
- Layers are decoupled and extensible independently

### 3. Domain Specialists Are Not Just Tools
- They have their own tools, skills, memory, and capabilities
- They push back and have opinions based on best practices
- They guide a structured process, not just answer questions
- They have DATA SKILLS -- can ingest, transform, validate real client data (e.g., convert legacy GL to target GL)
- This is critical: the GL Design Coach can prove the design works with real data, not just on paper

### 4. Shared Engagement Context ("Engagement Brain")
- All agents and tools read/write to a shared context
- Context never breaks when switching between agents
- This was identified as a KEY differentiating feature
- Product owner got excited about this idea -- wants a "super smart design"
- Detailed design was started but DEFERRED for a dedicated session
- The partially written design (semantic knowledge graph with engagement profile, decision log, artifact registry, open items, conversation memory) is captured in docs/features/engagement-context.md

### 5. Multi-Consultant Team Support
- 5 consultants working on design phase simultaneously
- Shared backlog managed by the agent (conversational interface, persisted, displayable)
- Lead consultant can manage the backlog
- Concurrency from day one
- Permissions/scope: POST-MVP

### 6. Documentation Paradigm Shift
- Questioning ALL traditional deliverables
- Documentation must work for both humans AND agents
- Structured-first, rendered for humans on demand
- Source of truth is never the PowerPoint -- it's the engagement context
- PowerPoint, PDF, etc. are just views/renderings

### 7. ERP Strategy
- Support multiple platforms (SAP, Oracle, Workday)
- SAP-first MVP
- Platform adapter architecture from day one
- Adding a new ERP = new adapter, not re-architecture

### 8. Configuration Agent Vision
- The ultimate vision: agent can configure SAP based on design artifacts
- Design and implementation become the same artifact
- Product owner raised the right concern: "how would you find out how to configure SAP?"
- Honest assessment: this is the highest-risk layer
- DEFERRED beyond MVP
- Phased approach: spec generation → curated knowledge base → record & learn → direct API config
- MVP value: generate configuration-ready specs, human executes last mile

### 9. Research Finding: SAP GL Configuration on GitHub
- Searched for GitHub repos on SAP GL configuration
- Found one relevant repo: oigbokwe73/SAP-Configuration-File (basic FICO config scripts)
- Key insight: the lack of structured, machine-readable SAP config knowledge reinforces the opportunity
- Building a verified, agent-consumable SAP config knowledge base would be a significant moat

## Decisions Made (13 Total)

All captured in docs/decisions/decision-log.md (DEC-001 through DEC-013). Key ones:
- AI-native flow as core principle (DEC-001)
- Three-layer architecture (DEC-002)
- Consultant steers, agent executes (DEC-003)
- SAP-first, ERP-agnostic architecture (DEC-004)
- GL Design Coach as first specialist (DEC-005)
- Shared engagement context (DEC-006, detail deferred)
- Structured-first documentation (DEC-007)
- Agent-managed shared backlog (DEC-008)
- Concurrency from day one (DEC-009)
- Permissions post-MVP (DEC-010)
- Configuration agent deferred with phased plan (DEC-011)
- Domain specialists have data skills (DEC-012)
- PMO tool scope separately (DEC-013)

## What Was NOT Discussed Yet

- Tech stack (language, framework, LLM provider, database, frontend)
- Detailed scope of the GL Design Coach (what exactly is in MVP vs. later)
- Engagement context detailed design (started but deferred)
- UI/UX approach (conversational only? hybrid? web app?)
- Authentication and multi-tenancy
- Testing strategy
- Other domain specialist agents (only listed, not scoped)
- PMO tool scoping
- Data ingestion formats and pipelines
- Deployment architecture

## Artifacts Produced

13 documentation files committed to GitHub repo (z071133139/fta-agent):
- README.md
- 3 vision docs (product-vision, architecture-overview, design-principles)
- 3 agent docs (consulting-agent, gl-design-coach, _template)
- 4 feature docs (engagement-context, shared-backlog, erp-platform-strategy, configuration-agent)
- 1 engagement flow doc (day-in-the-life)
- 1 decision log
- 1 cost model (docs/operations/cost-model.md)

## Product Owner Notes

- Very excited about the shared engagement context idea ("create a super smart design")
- Concerned (rightly) about the feasibility of the configuration agent -- appreciates the honest risk assessment
- Wants to "question all traditional deliverables" -- strong conviction about structured-first docs
- Believes this will "disrupt the consulting industry"
- Pragmatic about rollout: personal → super testers → broad
- Will scope domain specialist agents one by one in future sessions
