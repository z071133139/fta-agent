# GL Design Coach V1 -- Build Plan

> Status: APPROVED (Session 005)
> Created: 2026-02-16 (Session 005)
> Last updated: 2026-02-16

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
- **If YES:** Proceed to Iteration 2. Document what knowledge gaps remain for RAG to address.

---

## Iteration 2: Persistence Layer (Engagement Context + Supabase)

**Goal:** Design decisions and engagement state persist across sessions. Informed by real conversation patterns observed in Iteration 1.

### 2A: Engagement Context Data Model

**Design (informed by Iteration 1 learnings):**
- Engagement profile: client name, sub-segment (P&C), ERP target (SAP), active/archived, design principles, constraints
- Design decisions store: dimension, decision, rationale, alternatives considered, decided by, date, status (active/superseded/reversed), linked process step
- Conversation memory: session history with LangGraph checkpointing, plus summarization strategy for long engagements
- Open items: unresolved questions, who raised them, when, linked to dimension/process step
- Artifact registry: uploaded files (GL extracts), analysis outputs (account profiles, MJE reports), metadata
- Context window management: conversation summarization strategy -- when to summarize older history, how to preserve key decisions in active context

**Build:**
- Set up Supabase project
- Postgres tables + migrations for all entities above
- Enable pgvector extension (embeddings stored here for Iteration 4 RAG)
- Row Level Security policies (single user for V1, but schema supports multi-user per DEC-009)
- Python Supabase client: `src/fta_agent/db/supabase.py`
- Config: SUPABASE_URL + SUPABASE_KEY in settings
- LangGraph checkpointer wired to Supabase (session persistence across CLI restarts)

### 2B: Structured Decision Extraction

**Design:**
- How the agent detects a design decision in conversation:
  - Option A: LLM tool call -- agent has a `capture_decision` tool it invokes when it detects a decision
  - Option B: Post-turn extraction -- separate LLM call after each turn to extract structured decisions
  - Option C: Hybrid -- agent proposes decisions inline, user confirms, then tool captures
- Evaluate: accuracy, latency, cost, UX feel
- Design the 17-step process state machine: how does the agent track and advance position?

**Build:**
- Implement chosen decision extraction mechanism
- Wire to Supabase decision store
- Process position tracking (current step stored in engagement context, surfaced in conversation)
- Open items capture and resurfacing logic

**Test:**
- Multi-session design workshop simulation:
  - Session 1: discuss profit center design, make a decision
  - Close CLI, reopen
  - Session 2: agent recalls the profit center decision, surfaces downstream implications for segment
- Verify decisions are correctly structured in Supabase (dimension, rationale, alternatives)
- Verify process position is maintained across sessions
- Verify open items surface when the relevant topic comes up

**Deliverable:** Agent remembers everything across sessions. Design decisions are structured data, not buried in chat history.

**Checkpoint:**
- Do decisions persist correctly across sessions?
- Does the agent recall prior decisions naturally in conversation?
- Does process tracking feel helpful (not robotic)?
- Is conversation summarization preserving the right information?
- **If issues:** Adjust extraction mechanism, summarization strategy, or schema before proceeding.

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

```
Iteration 0 (Test Data + Eval) ─────┐
                                     │
Iteration 1 (Domain Knowledge) ◄────┘
         │
         ├── Learnings inform ──► Iteration 2 (Persistence)
         │                               │
         ├── Learnings inform ──► Iteration 3 (Data Pipeline)
         │                               │
         ├── Gap analysis informs ► Iteration 4 (RAG)
         │                               │
         └───────────────────────────────┤
                                         ▼
                                  Iteration 5 (Integration)
                                         │
                                         ▼
                                  Iteration 6 (Polish)
```

**Critical path:** 0 → 1 → 5 → 6 (knowledge encoding must be proven before integration)

**Parallel opportunities:**
- Iterations 2, 3, 4 can overlap after Iteration 1 completes (they don't depend on each other)
- Knowledge base curation (4A) can start during Iteration 2/3 builds

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
