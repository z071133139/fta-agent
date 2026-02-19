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

---

## DEC-018: Agent Orchestration -- LangGraph

**Date:** 2026-02-15
**Status:** Decided

**Decision:** Use LangGraph as the agent orchestration framework.
**Alternatives considered:** CrewAI, AutoGen, OpenAI Agents SDK, custom build.

**Rationale:** FTA has two types of state: domain state (engagement context, stored in Supabase) and workflow state (where is the consultant in the process, what tools have been called, what's next). LangGraph manages workflow state with built-in checkpointing, concurrency, streaming, and error recovery. Multi-consultant scale (5+ concurrent users) and multi-agent architecture (Consulting Agent → GL Design Coach → tools) map directly to LangGraph's graph-based design. Building from scratch converges to building a worse framework. AutoGen is being sunset. OpenAI Agents SDK locks into OpenAI. CrewAI has less control over complex flows.

**Key insight:** The custom-build option was carefully evaluated. Day 1 is clean Python classes. Month 6 is a homegrown framework nobody else can maintain. The multi-consultant, multi-agent, long-running engagement requirements mean we'd end up rebuilding LangGraph's features without the community and testing.

---

## DEC-019: LLM Provider -- Multi-Provider via LiteLLM

**Date:** 2026-02-15
**Status:** Decided

**Decision:** Use LiteLLM as an abstraction layer to route to the best model per task. Primary providers: Claude (Anthropic) and GPT-4o (OpenAI).

**Rationale:** Single API to call any provider. Swap models without code changes. Optimize cost by routing simple tasks to cheaper models, complex reasoning to stronger models. No vendor lock-in.

---

## DEC-020: Data Analytics Engine -- DuckDB + Polars

**Date:** 2026-02-15
**Status:** Decided

**Decision:** DuckDB as primary query engine, Polars for DataFrame operations. Replaces Pandas.

**Rationale:** Insurance GL data can have millions of records monthly. DuckDB is SQL-first, 5x faster than Pandas, minimal memory footprint (streams data, spills to disk), no server needed. Polars is Rust-based, 7x faster than Pandas for CSV reading, 5x faster for joins. Together they handle insurance data volumes on a laptop without becoming a clunky data tool.

---

## DEC-021: Database -- Supabase (Postgres + pgvector)

**Date:** 2026-02-15
**Status:** Decided

**Decision:** Supabase as the persistence layer.
**Alternatives considered:** Firebase, raw Postgres.

**Rationale:** Postgres underneath (enterprise-standard, relational engagement context). pgvector for semantic search (no separate vector DB needed). Built-in auth (multi-consultant ready). Real-time subscriptions (concurrency ready). Open-source and self-hostable (enterprise deployment). Row Level Security for future permissions. Firebase rejected: NoSQL/document model doesn't suit relational engagement data, harder to self-host.

---

## DEC-022: Backend -- Python + FastAPI

**Date:** 2026-02-15
**Status:** Decided

**Decision:** Python with FastAPI as the backend framework.

**Rationale:** Python is the lingua franca for AI/ML -- LangGraph, DuckDB, Polars, LiteLLM are all Python-native. FastAPI: async, type-safe with Pydantic, automatic OpenAPI docs. Enterprise-standard, used by Microsoft, Netflix, Uber.

---

## DEC-023: Frontend -- Next.js (React)

**Date:** 2026-02-15
**Status:** Decided

**Decision:** CLI during development phase, Next.js web app for the product.

**Rationale:** CLI-first for fast iteration on agent behavior during personal phase. Next.js for the web app: React ecosystem, SSR, API routes, works naturally with Supabase SDK. The product must be visually appealing and sellable. Enterprise-standard, massive ecosystem.

---

## DEC-024: Commercial Model -- Managed SaaS for Consulting Firms

**Date:** 2026-02-15
**Status:** Decided

**Decision:** FTA is sold to consulting firms who use it on insurance finance transformation engagements. We provide a managed environment (not consulting-firm-hosted). Insurance company data flows through our managed infrastructure.

**Rationale:** Consulting firms are the customer, insurance companies are the end client whose data is processed. This model aligns with how consulting tools are typically sold and deployed.

---

## DEC-025: Enterprise LLM Data Handling -- Enterprise Endpoints via Managed Cloud

**Date:** 2026-02-15
**Status:** Decided (implementation deferred to pre-production)

**Decision:** Client data is sent to LLMs only through enterprise endpoints (AWS Bedrock for Claude, Azure OpenAI for GPT-4o) within our managed cloud accounts. Data is covered by enterprise data processing agreements. LLM providers never access the data directly. LiteLLM abstracts the routing -- no code changes required when switching from standard APIs (used during development) to enterprise endpoints (used in production).

**Rationale:** Insurance company financial data (GL, trial balances, MJEs) is sensitive and covered by consulting firm NDAs. Standard LLM APIs are acceptable for development with synthetic/personal data but not for production with real client data. The "LLM is the brain, not the muscle" architecture (DEC-012) limits data exposure by sending summarized profiles to the LLM rather than raw records. Enterprise endpoints provide the required data governance without changing the application architecture.

**Deferred until:** Pre-production phase. During personal MVP, standard APIs are used with non-client data. Enterprise endpoint configuration is a deployment concern, not an architecture concern, thanks to LiteLLM abstraction (DEC-019).

---

## DEC-026: GL Design Coach MVP -- P&C Only

**Date:** 2026-02-15
**Status:** Decided

**Decision:** The GL Design Coach MVP (V1, personal use) focuses exclusively on Property & Casualty sub-segment. Life/Annuity is added in V2. Reinsurance is deferred to future.

**Rationale:** P&C is the most common sub-segment across insurance finance transformations. Starting narrow allows deeper expertise and faster validation. Expanding to Life/Annuity in V2 is a natural progression once P&C is proven.

**Alternatives considered:** All three sub-segments from day one (broader but shallower); P&C + Life (covers most carriers but doubles the prompt engineering).

---

## DEC-027: GL Design Coach MVP -- Real Data from Day One

**Date:** 2026-02-15
**Status:** Decided

**Decision:** The GL Design Coach V1 works with real client data (posting data, account master, trial balance) from day one. It is not a purely conversational advisor.

**Rationale:** The data skills are the key differentiator (DEC-012). A conversational-only advisor is not meaningfully different from prompting Claude directly. The ability to ingest data, profile accounts, detect MJE patterns, and link findings to COA design recommendations is what makes the agent credible and valuable.

**Alternatives considered:** Conversational-first (faster to build, but no differentiator); lightweight data with trial balance only (tests the pipeline but misses the MJE analysis and account profiling from posting data).

---

## DEC-028: Knowledge Encoding -- Hybrid (Prompts + RAG)

**Date:** 2026-02-15
**Status:** Decided

**Decision:** Domain knowledge is encoded using a hybrid approach: core P&C expertise in structured system prompts, supplemented by RAG over curated reference material (NAIC Annual Statement structure, SAP S/4HANA config reference, insurance GL examples).

**Rationale:** Pure prompt engineering is fastest to iterate but limited by context window -- the full P&C domain knowledge won't fit in a single prompt. Pure RAG requires more infrastructure and risks retrieving irrelevant content. Hybrid puts the essential reasoning patterns in prompts (always available) and uses RAG for reference material that the agent retrieves when needed.

**Alternatives considered:** Prompt engineering only (limited by context window); RAG only (more infrastructure, retrieval quality risk).

---

## DEC-029: Three-Agent MVP Architecture

**Date:** 2026-02-16
**Status:** Decided

**Decision:** The MVP consists of three agents: Consulting Agent (orchestrator + engagement lead + PMO), Functional Consultant (generalist -- requirements, process docs, decks), and GL Design Coach (P&C domain specialist). The human user is the client. The agents are the consulting team.

**Rationale:** This maps directly to how real consulting engagements work: an engagement lead manages the project, a generalist handles cross-cutting work, and a domain specialist does the analytical deep-dive. Three agents is the minimum viable team.

**Alternatives considered:** Single monolithic agent (simpler but can't scale to multi-user or multi-workstream); two agents only -- Consulting Agent + GL Coach (missing the generalist work that consumes significant consulting time).

---

## DEC-030: Multi-User Direct Access Model

**Date:** 2026-02-16
**Status:** Decided

**Decision:** Each agent is independently accessible. Different users interact with different agents based on their role. There is no single entry point or receptionist routing. The engagement context is the connective tissue.

**Rationale:** A project manager and an accounting expert have fundamentally different workflows. Forcing everyone through one agent adds friction and dilutes the specialized UX each agent provides. Direct access lets each agent speak the user's professional language.

**Alternatives considered:** Single entry point with routing to sub-agents (adds latency, loses the "workspace per role" UX); fully autonomous inter-agent communication (too complex for MVP, risk of surprising users).

---

## DEC-031: LLM-Based Intent Routing

**Date:** 2026-02-16
**Status:** Decided

**Decision:** Replace the keyword-based regex router in `consulting_agent.py` with an LLM-based intent classifier. A lightweight LLM call determines the target agent from the user's message + agent descriptions.

**Rationale:** Keyword routing is brittle and can't handle nuanced requests. LLM routing handles edge cases, mixed-intent messages, and evolves naturally as agent capabilities expand. With only 2-3 target agents, the routing task is simple enough for a fast model.

**Alternatives considered:** Keep keyword routing (works but breaks on anything beyond exact phrases); rule-based NLP classifier (middle ground but still brittle); embedding similarity (viable but adds infrastructure).

---

## DEC-032: DuckDB-Based Engagement Context (V1)

**Date:** 2026-02-16
**Status:** Decided

**Decision:** The engagement context store uses DuckDB in V1 (local persistence). All structured artifacts -- decisions, findings, requirements, process flows, mappings, engagement metadata -- are stored in DuckDB tables. Upgraded to Supabase (Postgres) in Phase 2 for multi-user support.

**Rationale:** DuckDB is already in the stack for data analytics. Using it for engagement context in V1 keeps the stack simple (no external database for single-user MVP). The schema design transfers directly to Postgres when we upgrade to Supabase in Phase 2.

**Alternatives considered:** Supabase from day one (premature -- adds deployment complexity for single-user MVP); JSON files (fragile, no query capability); SQLite (viable but DuckDB is already a dependency and has better analytical query support).

---

## DEC-033: Functional Consultant as Separate Agent

**Date:** 2026-02-16
**Status:** Decided

**Decision:** The Functional Consultant is a separate agent with its own identity, skills, and prompt, not a set of tools hanging off the Consulting Agent.

**Rationale:** Requirements capture, process documentation, and deck generation require a different "persona" than engagement management. The Functional Consultant speaks in process and requirements language. Bundling everything into the Consulting Agent would create a bloated agent that's mediocre at everything rather than focused agents that excel at their domain.

**Alternatives considered:** Tools on the Consulting Agent (simpler but weaker UX, harder to maintain prompt quality as capabilities grow); defer to V2 (possible but requirements capture is needed from day one).

---

## DEC-034: Outcome Capture via Tool Calls

**Date:** 2026-02-16
**Status:** Decided

**Decision:** Agents capture structured outcomes (decisions, findings, requirements, mappings) via LangGraph tool calls (`capture_decision`, `capture_finding`, `capture_requirement`, `capture_mapping`). The agent invokes the tool when it detects an outcome in conversation.

**Rationale:** Tool calls are explicit, auditable, and fit naturally into the LangGraph tool-use loop. The agent decides when to capture (not a separate post-processing step), so it can ask the user for confirmation before writing. This gives the user control: "I'm about to record this as a decision -- does this look right?"

**Alternatives considered:** Post-turn extraction (separate LLM call after each turn to extract outcomes -- adds latency and cost, user doesn't see what's being captured); hybrid (agent proposes, post-processor validates -- complex, two LLM calls per turn).

---

## DEC-035: Process Inventory as Scope Gate for Business Process Design

**Date:** 2026-02-19
**Status:** Decided

**Decision:** The Process Inventory deliverable is the mandatory scope gate for the Business Process Design workstream. No downstream deliverable (Future State Process, Business Requirements, Gap Analysis) can be started for a given process until that process is confirmed in the Process Inventory. The inventory workspace allows consultants to select which processes are in scope (e.g., R2R, P2P, Financial Close, Reinsurance Accounting) and define sub-flows per process.

**Rationale:** Process scope determines the entire shape of downstream work. Starting requirements or future-state design before processes are confirmed creates rework. The inventory is the scoping conversation, captured structurally. This also enables per-process parallelism: once a process is confirmed in the inventory, its downstream deliverables become available concurrently.

**Implications:** The workplan expands dynamically as processes are confirmed in the inventory — child rows appear per confirmed process. Parent deliverable rows remain in place throughout. See DEC-037 for workplan expansion model.

**Alternatives considered:** Start all processes by default, allow de-scoping later (creates noise, consultants start work on out-of-scope areas); flat deliverable list per process (doesn't reflect the dependency — inventory gate is cleaner).

---

## DEC-036: No Current State Deliverable — Overlay Model for Future State

**Date:** 2026-02-19
**Status:** Decided

**Decision:** FTA will not produce a standalone Current State process document. Instead, the Future State process map uses an overlay model: the agent generates a leading-practice future-state baseline, and client-specific current-state complications are captured as overlays — modifications, constraints, or exceptions layered onto the baseline process.

**Rationale:** Current state documentation is primarily useful as an input to future state design, not as an output in its own right. Insurance finance teams often have messy, inconsistently documented current processes; producing a polished current-state document adds significant time for limited incremental value. The overlay model captures what actually matters — the delta between leading practice and the client's reality — without requiring a full current-state documentation exercise.

**Implications:** The Future State workspace shows: (1) the leading-practice baseline for the process, pre-populated by the agent; (2) client overlay annotations showing where the client differs. Overlays are elicited through a standard question set (see DEC-038). GL Design Coach findings are a source of overlay suggestions (see DEC-039).

**Alternatives considered:** Document current state first, then design future state as a gap (traditional approach — time-intensive, often produces large documents that nobody reads after design is complete); skip current state entirely (loses the client-specific context that overlays capture).

---

## DEC-037: Dynamic Workplan Expansion per Process

**Date:** 2026-02-19
**Status:** Decided

**Decision:** As processes are confirmed in the Process Inventory, the workplan expands dynamically: each confirmed process generates child deliverable rows beneath the parent deliverable rows in the Business Process Design workstream. Parent rows stay visible throughout — they show aggregate progress across processes. The workplan never collapses back to pre-expansion state.

**Rationale:** The number of in-scope processes is not known at engagement start — it is determined during the inventory. A flat workplan that pre-populates all processes creates visual noise and can't reflect scope accurately. Dynamic expansion makes scope explicit: only confirmed processes appear as child rows, progress tracking is accurate from day one.

**Implications:** The WorkplanPanel and WorkplanSpine must support expandable parent rows with dynamic child rows. Child rows inherit the parent deliverable's agent assignment and workspace template. Progress counters on the parent row aggregate across children.

**Alternatives considered:** Pre-populate all standard processes and allow de-scoping (inverted model — visual noise, requires active management to keep accurate); fixed list defined at engagement setup (doesn't fit the agent-led inventory discovery flow).

---

## DEC-038: Standard Question Set for Overlay Elicitation

**Date:** 2026-02-19
**Status:** Decided

**Decision:** The Functional Consultant uses a standard question set when eliciting client overlays on Future State process maps. The question set is designed to help junior consultants surface client-specific complications without missing key areas. Standard question categories: (1) technology constraints — what current systems are involved and what stays?; (2) people and ownership — who currently owns this process, who should own it in the future state?; (3) data and reporting — what outputs does the client specifically need from this process?; (4) exceptions and edge cases — what scenarios does the standard process not handle for this client?; (5) regulatory/compliance — any specific statutory, regulatory, or audit requirements for this process?.

**Rationale:** Junior consultants often miss key current-state complications in initial conversations with clients. A standard question set acts as a structured elicitation guide embedded in the agent's workflow. The agent frames the questions conversationally but ensures coverage. This compounds institutional knowledge across engagements.

**Implications:** Question sets are encoded in the Functional Consultant's prompts per process area. Answers are captured as overlays linked to specific process steps in the Future State map. Questions can be skipped if the consultant indicates they're not relevant.

**Alternatives considered:** Unstructured elicitation (agent asks open questions — captures what the consultant thinks to mention, misses systematic coverage); separate interview tool (adds workflow friction, breaks the workspace-centric model).

---

## DEC-039: Cross-Agent Connection — GL Design Coach Findings → Future State Overlays

**Date:** 2026-02-19
**Status:** Decided

**Decision:** The GL Design Coach surfaces relevant findings as overlay suggestions in the Functional Consultant's Future State workspace. When GL data analysis has identified patterns relevant to a process (e.g., key person risk in journal entry posting, account complexity in reinsurance settlement), those findings appear as pre-populated overlay suggestions on the corresponding process steps — ready for the consultant to accept, modify, or dismiss.

**Rationale:** The GL Design Coach and the Functional Consultant are analyzing the same client from different angles. GL data findings are highly relevant inputs to process design — a key person concentration in journal entries is a people/ownership overlay on the Close process; account splitting complexity is a system constraint overlay on the Reinsurance process. Without the cross-agent connection, this intelligence is siloed. With it, the data analysis automatically enriches the process design.

**Implications:** Requires that GL Design Coach findings are stored in the shared engagement context with a `process_area` tag. The Functional Consultant queries the engagement context for findings relevant to the current process before generating the Future State baseline. The connection is advisory — suggestions only, consultant decides whether to incorporate.

**Alternatives considered:** Manual handoff (consultant copies findings from one workspace to another — manual and error-prone); no connection (silos — misses the core value of shared engagement context); automatic incorporation without consultant review (removes human judgment from the loop).

---

## DEC-040: Process Gap Analysis is ERP-Dependent

**Date:** 2026-02-19
**Status:** Decided

**Decision:** The Process Gap Analysis deliverable is dependent on the engagement's ERP target (`engagement.erp_target`). The gap analysis compares the client's confirmed Future State process design against the standard ERP process model for the target platform (SAP S/4HANA in MVP). The gaps, fit ratings, and configuration recommendations are specific to the target ERP. A change of ERP target would require re-running the gap analysis.

**Rationale:** A gap analysis without an ERP reference is just a process comparison to leading practice — useful but not actionable. The value of the gap analysis is knowing which parts of the future state design are native to the platform, which require configuration, and which require development or workarounds. That analysis is ERP-specific. The ERP reference is already in the engagement context; using it makes the analysis directly actionable.

**Implications:** The Gap Analysis workspace shows the ERP target prominently. The agent reads `engagement.erp_target` to select the correct ERP process model for comparison. If the ERP target is unknown, the Gap Analysis workspace shows a preflight warning. SAP S/4HANA is the first-class implementation; Oracle and Workday gaps will use platform adapters when those are added.

**Alternatives considered:** ERP-agnostic gap analysis (process-to-leading-practice only — less actionable, doesn't tell the consultant what to configure); separate ERP configuration deliverable instead of gap analysis (deferred to Layer 3 configuration agents — the gap analysis is the handoff document to that layer).

---

## DEC-041: User Stories Backlog is Optional

**Date:** 2026-02-19
**Status:** Decided

**Decision:** The User Stories backlog deliverable in the Business Process Design workstream is optional and client-dependent. It is included in the workplan as an opt-in deliverable that can be scoped in or out at engagement setup or during the Process Inventory phase. Not all finance transformation engagements require a formal user story backlog — some clients prefer requirements-based specifications; others are running formal agile delivery and need user stories for their sprint backlog.

**Rationale:** User stories are a delivery artifact, not a design artifact. They are valuable when the client's implementation team uses them for sprint planning, but they add overhead without clear benefit for clients who don't use agile delivery methods. Making them optional rather than required keeps the workplan clean and avoids generating artifacts nobody reads.

**Implications:** The workplan template includes User Stories as `status: not_started, optional: true`. The Process Inventory or engagement setup phase includes a scope toggle for this deliverable. If scoped out, the deliverable is hidden from the WorkplanPanel and WorkplanSpine rather than shown as not-started.

**Alternatives considered:** Always include user stories (generates unnecessary artifacts for non-agile clients); exclude entirely from V1 (some clients will explicitly need them — better to have the toggle); make it a sub-deliverable of Business Requirements (different artifact type, different audience, better as a sibling deliverable).
