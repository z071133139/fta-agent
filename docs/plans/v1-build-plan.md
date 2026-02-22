# GL Design Coach V1 -- Build Plan

> Status: APPROVED (Session 005, updated Sessions 006, 008, 009, 010, 011, 015)
> Created: 2026-02-16 (Session 005)
> Last updated: 2026-02-22 (Session 015)

## Plan Philosophy

**Test the riskiest assumption first.** The core bet of this product is that we can encode P&C domain knowledge deeply enough that the agent produces output comparable to a senior consultant. If that fails, nothing else matters. So we prove it first, before building infrastructure.

**Iterative design → build → test → learn.** Every iteration produces a working prototype. The product owner evaluates it against concrete criteria. Findings feed back into subsequent iterations. The plan is a living document -- scope adjustments are logged as decisions.

**Infrastructure follows understanding.** We don't design the Supabase schema in the abstract. We design it after we've seen real conversations and know what needs to be persisted. We don't design the data pipeline in isolation. We design it after we know what profiles the LLM needs to reason over.

---

## Iteration 0: Test Data + Evaluation Framework

**Goal:** Create the tools we need to evaluate everything that follows. Without realistic test data and clear quality criteria, we can't tell if anything works.

### 0A: Synthetic P&C Test Data

**Design:**
- Define schemas for all three input types:
  - Posting data (journal entries): company code, document number, document type, posting date, posting key, GL account, amount, currency, profit center, cost center, functional area, segment, text, user ID, entry date + P&C-specific: state, LOB, accident year
  - Account master: account number, description, account type (BS/PL), account group, reconciliation account flag, open item management, line item display
  - Trial balance: account, period, opening balance, debits, credits, closing balance, cumulative balance
- Design realistic P&C patterns:
  - ~2,500 GL accounts (mix of active, low-activity, dormant)
  - Premium accounts, loss reserve accounts (case, IBNR, LAE), UPR, reinsurance recoverables, expense accounts by functional area
  - MJE patterns embedded: recurring reclassifications, manual accruals, IC entries, correction entries
  - Multiple preparers with different MJE volumes and patterns
  - 12 months of posting data, ~500K-1M records

**Build:**
- Python script to generate synthetic data (repeatable, seeded)
- Output as CSV + Parquet
- Store in `tests/fixtures/` for use across all iterations
- Document the embedded patterns so we can verify detection later

**Test:**
- Data passes basic sanity checks (balances, account types, posting logic)
- MJE patterns are present and detectable by manual inspection

### 0B: Evaluation Framework

**Design:**
- Define concrete quality criteria for domain knowledge (Iteration 1):
  - Insurance language: does the agent NEVER use raw SAP terms without translation?
  - Dimension knowledge: for each of the ~30 code block dimensions, can the agent explain it in P&C context, identify the key design question, and articulate the common debate?
  - Opinions: when given a bad design proposal, does the agent push back with specific reasoning?
  - Cross-dimension impact: when a decision is made on one dimension, does the agent surface ripple effects?
  - Audience tailoring: same question framed differently for CFO vs. finance ops vs. IT?
  - Depth test: does the output match what a senior P&C consultant would say, or could a general-purpose AI produce the same thing?
- Define quality criteria for data analysis (Iteration 3):
  - Account profiling accuracy against known synthetic data
  - MJE pattern detection recall (did it find all the embedded patterns?)
  - MJE-to-COA linking quality (are the recommendations sensible?)
- Define cost thresholds:
  - Target token usage per conversation turn
  - Target cost per design session

**Build:**
- Test conversation scripts (representative questions for each quality dimension)
- Expected answer rubrics (not exact text, but criteria for acceptable answers)
- Token/cost logging utility

**Deliverable:** Synthetic P&C data + evaluation framework ready. Every subsequent iteration can be measured against concrete criteria.

**Checkpoint:** Do we have realistic test data with known patterns? Are evaluation criteria concrete enough to judge quality?

---

## Iteration 1: Domain Knowledge Encoding (THE Core Bet)

**Goal:** Prove the agent can hold a genuinely expert-level P&C code block design conversation. This is the highest-risk component. We test it with the existing skeleton -- zero new infrastructure required.

### 1A: Prompt Architecture

**Design:**
- Context window budget allocation:
  - System prompt (core knowledge): target ~X tokens
  - P&C module: target ~X tokens
  - SAP module: target ~X tokens
  - Conversation history: ~X tokens (remaining budget minus RAG reserve)
  - RAG injection slot: reserved for Iteration 4
  - Data profile injection slot: reserved for Iteration 5
- Modular prompt structure:
  - Core prompt: role, personality, opinions framework, 17-step process, decision capture instructions
  - P&C module: sub-segment knowledge, reserve types, regulatory requirements, NAIC structure (swappable for Life in V2)
  - SAP module: ACDOCA dimensions, validation rules, document splitting, posting logic (swappable for Oracle in V2)
  - Translation rules: SAP→insurance term mapping (embedded, not a lookup)
- Determine: what MUST be in the prompt (always available) vs. what CAN be retrieved via RAG (Iteration 4)

### 1B: P&C Knowledge Modules

**Build:**
- Core system prompt: role definition, personality (opinionated, pushes back), opinions framework (MUST DO / WORTH IT / PARK IT / DON'T TOUCH), 17-step process methodology with position tracking, audience-aware response framing
- P&C knowledge module:
  - Loss reserves (case, IBNR, LAE) -- structure, typical account patterns, design considerations
  - Unearned premium reserves -- calculation basis, account structure
  - Reinsurance recoverables -- ceded premium, ceded losses, recoverable accounting
  - State-level reporting -- why it matters for P&C, how state flows into the code block
  - Accident year / underwriting year -- purpose, design options, implications
  - NAIC Annual Statement structure -- lines of business, statutory account categories
  - Salvage and subrogation accounting
  - Short-duration contract considerations
- SAP knowledge module:
  - All ~30 insurance-relevant ACDOCA dimensions with P&C context, design questions, common debates
  - Cross-dimension impact rules (decision on X triggers warning about Y)
  - Document splitting prerequisites and behavior
  - Account groups, field status variants
  - Posting logic (automatic postings, substitutions, validations)
  - Custom code block extensions (state, statutory product, accident year) -- when to add vs. when to push back
- Insurance language translation -- woven into all prompts, not a separate layer
- Insurance-specific functional area classifications (claims management, acquisition, admin, investment management, loss & LAE, policyholder dividends)

### 1C: Evaluation + Iteration

**Test (using evaluation framework from 0B):**
- Run all test conversation scripts through the agent
- Score against rubrics for: translation, dimension knowledge, opinions, cross-dimension impact, audience tailoring, depth
- Product owner evaluation: real conversation sessions testing realistic workshop scenarios
- Compare: give the same questions to a general-purpose Claude with no domain prompts -- is our agent meaningfully better?
- Identify gaps: what questions does the agent handle poorly? What knowledge is missing?
- Measure: token usage per turn, cost per session

**Iterate:**
- Refine prompts based on evaluation findings
- Re-run evaluation after each refinement
- Repeat until quality bar is met

**Deliverable:** Agent holds realistic P&C code block design conversations. Product owner confirms: "this sounds like a senior P&C consultant."

**Checkpoint (GO/NO-GO):**
- Does the agent pass the depth test on ≥80% of evaluation criteria?
- Does the product owner confirm the output is usable in a real engagement context?
- Is token usage within acceptable cost thresholds?
- **If NO:** Investigate root cause. Options: restructure prompts, reduce scope, change model, add RAG earlier. Update plan before proceeding.
- **If YES:** Proceed to Iteration 1.5. Document what knowledge gaps remain for RAG to address.

---

## Iteration 1.5: Agent Harness (Three-Agent System)

> Added Session 006 after MVP agent design was completed. See [mvp-agent-design.md](../design/mvp-agent-design.md) for the full skills specification.

**Goal:** Build the multi-agent system. Three agents (Consulting Agent, Functional Consultant, GL Design Coach) working together with LLM routing, structured handoff, and outcome capture. This is the "bones" of the consulting team.

### 1.5A: Agent Infrastructure

**Build:**
- Extended AgentState with engagement context fields (engagement metadata, data state, active decisions)
- LLM-based intent router in Consulting Agent (replace keyword regex in `consulting_agent.py`)
- Handoff protocol: context packaging --> sub-agent invocation --> structured outcome return
- Tool definitions as @tool decorated functions:
  - `capture_decision`: Write a DimensionalDecision to engagement context
  - `capture_finding`: Write an AnalysisFinding to engagement context
  - `capture_requirement`: Write a Requirement to engagement context
  - `capture_mapping`: Write an AccountMapping to engagement context
  - `query_context`: Read structured artifacts from engagement context
- Agent self-introduction logic: each agent produces a contextual greeting based on engagement state

### 1.5B: Functional Consultant Agent

> Note (Session 010): The Business Process Design workstream is fully designed.
> Note (Session 011): Process visualization is designed (React Flow). See [`docs/design/process-visualization.md`](../design/process-visualization.md). Build the visualization components before wiring to the real agent — it de-risks the frontend before the backend exists. See [`docs/design/business-process-design-workstream.md`](../design/business-process-design-workstream.md) for the complete design, including the overlay model, cross-agent connection to GL Design Coach, and dynamic workplan expansion. Build this workstream after 1.5A is complete.

**Build:**
- New LangGraph graph for the Functional Consultant
- System prompt: generalist consulting persona, requirements and process language
- Requirements extraction tool: unstructured text --> structured Requirement records
- Process flow generation tool: verbal descriptions --> structured ProcessFlow records
- Engagement context read/write integration
- Process Inventory workspace: interactive scoping conversation, per-process confirmation, workplan expansion trigger
- Future State workspace: leading-practice baseline generation + overlay model + standard question set
- GL finding query (cross-agent connection): on Future State workspace open, query engagement context for GL findings tagged to this process area; surface as overlay suggestions

### 1.5C: Consulting Agent Upgrade

**Build:**
- Upgrade Consulting Agent from keyword router to full orchestrator
- Engagement onboarding flow — invoke `build_pc_plan_design_template()` (built Session 008) to create workplan on engagement creation
- Decision registry: central view of all decisions across agents
- Open items tracking: unresolved questions linked to workstreams
- Status synthesis: natural language engagement status from structured state
- Workplan management: wire scope changes and status updates to API (frontend WorkplanPanel local state → backend persistence)

### 1.5D: GL Design Coach Tool Wiring

**Build:**
- Wire existing GL Design Coach to the outcome capture tools
- Agent invokes `capture_decision` when a design decision is made in conversation
- Agent invokes `capture_finding` when analysis surfaces an issue
- Progressive disclosure tools: `get_account_summary`, `get_category_detail`, `get_account_detail`

**Test:**
- Route 20 representative user messages and verify correct agent selection (>90% accuracy)
- Handoff round-trip: Consulting Agent --> GL Coach --> structured decision --> back to context store
- Functional Consultant: extract requirements from sample meeting notes, verify structured output
- Multi-agent session: user asks status question (Consulting Agent handles), then asks about account design (routes to GL Coach), then asks for a requirements summary (routes to Functional Consultant)
- Outcome persistence: captured decisions and findings survive process restart

**Deliverable:** Three-agent system where each agent can be addressed independently, captures structured outcomes, and shares the engagement context.

**Checkpoint:**
- Does LLM routing correctly identify the target agent >90% of the time?
- Do structured outcomes (decisions, findings, requirements) persist correctly?
- Does each agent self-introduce with relevant engagement context?
- Is the handoff latency acceptable (<2s for routing + context packaging)?
- **If issues:** Simplify routing (fall back to keyword with LLM override for ambiguous cases), adjust handoff protocol.

---

## Iteration 2: Persistence Layer (Engagement Context + DuckDB)

**Goal:** Design decisions and engagement state persist across sessions. Informed by real conversation patterns observed in Iterations 1 and 1.5.

> Updated Session 006: DuckDB replaces Supabase for V1 persistence (DEC-032). Decision extraction resolved: tool calls (DEC-034).

### 2A: Engagement Context Data Model

**Design (informed by Iteration 1 and 1.5 learnings):**
- Engagement profile: client name, sub-segment (P&C), ERP target (SAP), active/archived, design principles, constraints
- Design decisions store: dimension, decision, rationale, alternatives considered, decided by, date, status (active/superseded/reversed), linked process step
- Conversation memory: session history with LangGraph checkpointing, plus summarization strategy for long engagements
- Open items: unresolved questions, who raised them, when, linked to dimension/process step
- Requirements store: structured requirements from Functional Consultant
- Artifact registry: uploaded files (GL extracts), analysis outputs (account profiles, MJE reports), metadata
- Context window management: conversation summarization strategy -- when to summarize older history, how to preserve key decisions in active context

**Build:**
- DuckDB tables for all entities above (schema designed to transfer directly to Postgres/Supabase in Phase 2)
- Engagement context module: `src/fta_agent/data/engagement_context.py`
- LangGraph checkpointer wired to DuckDB (session persistence across CLI restarts)
- Context query interface used by all three agents

### 2B: Structured Outcome Persistence

**Decision resolved (DEC-034):** Agents capture outcomes via tool calls. The capture tools (built in Iteration 1.5) write to in-memory state. This iteration wires them to DuckDB for persistence across sessions.

**Build:**
- Wire `capture_decision`, `capture_finding`, `capture_requirement`, `capture_mapping` tools to DuckDB
- Process position tracking (current step stored in engagement context, surfaced in conversation)
- Open items capture and resurfacing logic
- Cross-session context restoration: on startup, load engagement state from DuckDB into agent state

**Test:**
- Multi-session design workshop simulation:
  - Session 1: discuss profit center design, make a decision
  - Close CLI, reopen
  - Session 2: agent recalls the profit center decision, surfaces downstream implications for segment
- Verify decisions are correctly structured in DuckDB (dimension, rationale, alternatives)
- Verify process position is maintained across sessions
- Verify open items surface when the relevant topic comes up
- Verify all three agents can read outcomes captured by the other two

**Deliverable:** Agent remembers everything across sessions. Design decisions are structured data, not buried in chat history.

**Checkpoint:**
- Do decisions persist correctly across sessions?
- Does the agent recall prior decisions naturally in conversation?
- Does process tracking feel helpful (not robotic)?
- Is conversation summarization preserving the right information?
- **If issues:** Adjust persistence strategy, context restoration, or schema before proceeding.

---

## Iteration 3: Data Intelligence (Pipeline + MJE Analysis)

**Goal:** The data analytics engine works end-to-end. Can ingest GL data, profile accounts, detect MJEs, store results. Not yet wired to the conversational agent -- pure data engineering.

### 3A: Data Pipeline

**Design:**
- File ingestion interface: accepted formats (CSV, Parquet), column name mapping/aliasing (clients use different column names), validation rules, error handling for messy data
- Account profiling SQL/Polars queries:
  - Activity profile: first/last posting, count by period, active/dormant classification
  - Balance behavior: average balance, direction, carries vs. resets
  - Volume: monthly posting volume, materiality (dollar amount)
  - Counterparties: most common offsetting accounts (from same document)
  - Dimension usage: which profit centers, cost centers, segments populated per account
  - Patterns: seasonal, one-time vs. recurring
  - Relationships: accounts that consistently post together
  - Classification check: configured type (from master) vs. observed behavior (from postings)
- MJE identification: document type heuristic (default mapping + client-configurable override)
- MJE pattern detection:
  - Recurring identical: same accounts, same amounts, same frequency
  - Recurring template: same accounts, different amounts
  - Reclassification: systematic moves from account A to B
  - Intercompany: manual IC entries
  - Accrual/reversal pairs
  - Correction entries
  - Consolidation adjustments
- MJE preparer analysis: volume by user, key person risk, timing within close
- Progressive disclosure structure: Level 1 (summary), Level 2 (category), Level 3 (account detail)
- Profile output schema: the exact JSON/table structure that the LLM will receive in Iteration 5

**Build:**
- Extend `src/fta_agent/data/engine.py` with profiling and MJE queries
- File ingestion with validation and column mapping
- All profile computations in DuckDB SQL + Polars
- Results stored in Supabase (persistent analysis store)
- Progressive disclosure pre-computation (all three levels)

**Test:**
- Run on synthetic data: verify all profiles against known patterns
- MJE detection recall: did it find all 7 embedded MJE pattern types?
- MJE preparer analysis: does it correctly identify the key-person-risk users?
- Run on real sanitized data: compare outputs to manual analysis
- Performance: 1M records should process in acceptable time on a laptop
- Error handling: feed it messy data (missing columns, bad formats) and verify graceful failure

**Deliverable:** Data pipeline ingests GL data, produces comprehensive account profiles and MJE analysis, stores everything in Supabase.

**Checkpoint:**
- Does MJE detection find ≥90% of known patterns in synthetic data?
- Do account profiles match manual analysis on real data?
- Does it handle messy real-world data without crashing?
- Is performance acceptable at 1M records?
- **If issues:** Refine queries, add error handling, adjust heuristics before proceeding.

---

## Iteration 4: RAG Pipeline (Knowledge Depth)

**Goal:** Fill the knowledge gaps identified in Iteration 1. The agent can now cite specific NAIC structures, SAP configuration paths, and reference real GL examples.

### 4A: Knowledge Base Curation

**Design:**
- Identify source material based on Iteration 1 gap analysis:
  - NAIC Annual Statement structure (P&C): lines of business, statutory account categories, reporting requirements by state
  - SAP S/4HANA reference: IMG paths, account group configuration, field status variants, document splitting configuration, automatic posting rules
  - Insurance GL examples: real COA patterns, code block design examples by P&C carrier type/size
- Chunking strategy: semantic chunks (by topic/concept, not fixed-size) with overlap
- Embedding model selection: evaluate options for cost, quality, dimension size
- Retrieval design: query construction (user message + conversation summary → retrieval query), top-k selection, relevance threshold

### 4B: RAG Build

**Build:**
- Document processing: chunk and clean source material
- Embedding pipeline: embed chunks, store in Supabase pgvector
- Retrieval function: query → embed → vector search → filter → return top-k
- Prompt injection: format retrieved chunks and insert into the reserved RAG slot in the prompt (designed in Iteration 1A)
- Deduplication: avoid injecting content that's already in the system prompt

**Test:**
- Retrieval quality: for 20+ representative questions, verify correct chunks are retrieved
- Relevance: measure precision and recall of retrieval
- A/B comparison: same questions with RAG vs. without RAG -- score both against evaluation rubrics
- Context window: verify system prompt + RAG + conversation history fits within budget
- Cost impact: measure additional token usage from RAG injection
- Hallucination check: does RAG reduce or increase hallucination on factual questions?

**Deliverable:** Agent answers detailed reference questions with specific citations. Measurable improvement over prompts-only.

**Checkpoint:**
- Does RAG measurably improve answer quality on reference questions (SAP config, NAIC structure)?
- Is retrieval precision ≥80% (correct chunks for the question)?
- Does it stay within context window budget?
- Is the cost impact acceptable?
- **If marginal improvement:** Consider reducing RAG scope and relying more on prompts. Not every question needs retrieval.

---

## Iteration 5: Integration (Data + Conversation + Persistence)

**Goal:** Wire everything together. The agent can ingest data, reason over it, persist decisions, and retrieve reference material -- all in one conversation.

### 5A: Data Engine as LangGraph Tools

**Build:**
- Define LangGraph tools that the GL Design Coach can invoke:
  - `ingest_gl_data`: accept file path, run ingestion + profiling pipeline, store results, return Level 1 summary
  - `get_account_summary`: retrieve Level 1 executive summary from stored profiles
  - `get_category_detail`: Level 2 drill-down by account type/category
  - `get_account_detail`: Level 3 individual account profile
  - `get_mje_summary`: MJE pattern overview with counts and top patterns
  - `get_mje_detail`: specific pattern detail with root cause analysis
  - `get_mje_preparer_analysis`: preparer-level view
- Tool binding: wire tools to the GL Design Coach node using LangChain tool binding
- Progressive disclosure logic: agent decides which level to present based on conversation context (doesn't dump Level 3 unprompted)

### 5B: MJE → COA Design Linking

**Build:**
- When presenting MJE findings, agent links each pattern to a specific code block design recommendation
- Uses both the data profiles (from Iteration 3) and domain knowledge (from Iteration 1) to generate the recommendation
- Stores the linked finding + recommendation in Supabase as a structured artifact

### 5C: Context Window Management

**Build:**
- Conversation summarization: when history exceeds budget, summarize older turns while preserving key decisions
- Profile injection strategy: inject only the relevant subset of profiles for the current discussion topic (not all 2,500 accounts)
- RAG + data + history budget balancing: dynamic allocation based on what the current turn needs

### 5D: Consulting Agent Routing Upgrade

**Design:**
- Evaluate: is keyword routing sufficient for V1 UX, or do we need LLM routing?
- If LLM routing: lightweight classifier that routes based on intent, not just keywords
- Consider: with only one specialist (GL Design Coach) in V1, is the upgrade worth the latency/cost?

**Build (if needed):**
- Replace keyword routing with LLM-based routing in consulting_agent.py

**Test:**
- End-to-end conversation flow:
  1. Start engagement ("New P&C carrier, SAP S/4HANA implementation")
  2. Upload GL data through conversation
  3. Agent presents account summary
  4. Discuss profit center design, make a decision
  5. Agent surfaces cross-dimension impacts
  6. Ask about MJE patterns
  7. Agent links MJE findings to COA recommendations
  8. Close session, reopen
  9. Agent recalls all prior decisions and data analysis
- Run with synthetic data: verify all integration points
- Run with real data: evaluate end-to-end quality
- Cost monitoring: measure total token usage for a full design session
- Verify "LLM is brain, not muscle": confirm raw data never goes to the LLM

**Deliverable:** The full V1 experience works end-to-end.

**Checkpoint:**
- Does the full flow work without errors?
- Is the conversation natural (not robotic tool-call sequences)?
- Does context window management work without losing important information?
- Is the cost per session acceptable?
- **If issues:** Identify the weakest integration point and fix before polish.

---

## Iteration 6: Polish + Real Engagement Validation

**Goal:** V1 is ready for personal use on a real P&C engagement.

**Build:**
- Error handling: bad file formats, incomplete data, missing dimensions, network failures
- CLI UX: progressive disclosure rendering, file upload flow, session management commands
- LangSmith tracing for debugging and quality monitoring
- Cost monitoring dashboard (token usage per session, per tool call)
- Security audit: no API keys or client data in logs, no sensitive data in LangSmith traces

**Test:**
- Full 17-step walkthrough with real P&C data (not synthetic)
- Side-by-side: agent output vs. what product owner would produce manually
- Stress test: large dataset (1M+ posting records)
- Session persistence: multi-day engagement simulation
- Edge cases: unusual account structures, minimal data, massive data

**Deliverable:** GL Design Coach V1 -- ready for personal use.

**Exit Criteria (all must pass):**
- [ ] Product owner has completed a full design workshop simulation with real data
- [ ] Agent output is comparable to senior P&C consultant on ≥80% of evaluation criteria
- [ ] MJE analysis identifies real patterns and links to design recommendations
- [ ] Design decisions persist correctly across sessions
- [ ] Performance acceptable at 1M+ posting records
- [ ] Token cost per session within budget
- [ ] No API keys or client data leaked in logs
- [ ] Product owner confirms: ready to use on a real engagement

---

## Iteration Dependencies

> Updated Session 015: Linear iteration sequence replaced by three-stream build strategy.
> See NEXT-STEPS.md for the active build plan. Iterations below remain the reference
> for what needs to be built, but the sequencing is now interleaved across three streams.

```
Iteration 0 (Test Data + Eval)     ✅ DONE
         │
Iteration 1 (Domain Knowledge)    ✅ DONE
         │
Iteration 1.5 (Agent Harness)     ✅ Frontend complete (Sessions 007–014)
         │
         ├── Stream A: Framework Expansion (knowledge workspaces, no agent needed)
         │   └── Sessions 015, 018, 020
         │
         ├── Stream B: Data Slice (d-005-01 end-to-end)
         │   ├── B1/B5: SSE endpoint + consumer (≈ parts of 1.5A)
         │   ├── B2/B3: GL data tools (≈ Iteration 3)
         │   └── B4: Workspace wiring (≈ Iteration 5 for one vertical)
         │
         └── Stream C: Platform Polish (navigation, layout)
             └── Sessions 019, 020

Post-streams: Iterations 2, 4, 6 (persistence, RAG, polish) informed by stream results
```

**Critical path is no longer linear.** Stream A (framework) and Stream C (polish) have no backend dependency. Stream B (data slice) is the vertical that proves the agent concept — it pulls selectively from Iterations 1.5A, 3, and 5.

---

## Plan Update Protocol

After each iteration checkpoint:
1. What worked as expected?
2. What surprised us?
3. What knowledge gaps were discovered?
4. Do we need to adjust scope, sequence, or approach for subsequent iterations?
5. Log any scope changes as decisions in decision-log.md
6. Update this plan document

**This plan is not a contract. It is our best current understanding of the path forward, updated as we learn.**
