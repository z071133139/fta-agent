"""Test conversation scripts for evaluating FTA agent quality.

Each script targets one or more evaluation criteria. Scripts include:
- The question to ask the agent
- Context to set up (if any)
- Which criteria it tests
- What a good answer looks like (rubric, not exact text)

These are used in Iteration 1 (domain knowledge) and Iteration 3
(data analysis) to score the agent against concrete criteria.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class TestConversation:
    """A single test question with evaluation rubric."""

    id: str
    criteria_ids: list[str]  # Which EvalCriterion IDs this tests
    setup_context: str  # Context to provide before asking
    question: str  # The actual question to send to the agent
    rubric: str  # What a good answer must contain / demonstrate
    anti_patterns: list[str]  # Things that should NOT appear in the answer


# ---------------------------------------------------------------------------
# Domain Knowledge Test Scripts (for Iteration 1)
# ---------------------------------------------------------------------------

DOMAIN_KNOWLEDGE_SCRIPTS = [
    # --- DK-01: Insurance Language Translation ---
    TestConversation(
        id="DK-01-A",
        criteria_ids=["DK-01"],
        setup_context=(
            "You are helping a mid-size P&C carrier design their "
            "code block for an SAP S/4HANA implementation."
        ),
        question=(
            "Can you explain how functional areas work in SAP and "
            "how we should set them up?"
        ),
        rubric=(
            "MUST: Translate functional area to insurance terms "
            "(expense classification by function). "
            "MUST: Propose insurance-specific functional areas: "
            "claims management, acquisition, administrative, "
            "investment management. "
            "MUST NOT: Use SAP manufacturing terms (production, "
            "sales & distribution, R&D) without immediate "
            "translation to insurance equivalents."
        ),
        anti_patterns=[
            "production",
            "manufacturing",
            "cost of goods sold",
            "COGS",
            "bill of materials",
            "shop floor",
        ],
    ),
    TestConversation(
        id="DK-01-B",
        criteria_ids=["DK-01"],
        setup_context="P&C carrier, SAP S/4HANA.",
        question=(
            "What is the purpose of the 'customer' and 'vendor' "
            "fields in the code block?"
        ),
        rubric=(
            "MUST: Translate customer/vendor to insurance context: "
            "policyholder, insured, agent, broker, claimant, "
            "service provider, reinsurer, TPA. "
            "MUST: Explain it depends on the subledger context."
        ),
        anti_patterns=[],
    ),
    # --- DK-02: Code Block Dimension Knowledge ---
    TestConversation(
        id="DK-02-A",
        criteria_ids=["DK-02", "DK-06"],
        setup_context=(
            "Mid-size P&C carrier with 4 LOBs (Auto, Homeowners, "
            "Commercial Property, Workers Comp) operating in 12 states."
        ),
        question="What should our profit center represent?",
        rubric=(
            "MUST: Discuss the LOB vs. region vs. combination debate "
            "specific to P&C. "
            "MUST: Explain the downstream impact on segment, COPA, "
            "and document splitting. "
            "MUST: Reference the specific LOBs mentioned (Auto, "
            "Homeowners, etc.). "
            "SHOULD: Mention that if profit center = LOB, then "
            "state must be handled through COPA or custom field."
        ),
        anti_patterns=[],
    ),
    TestConversation(
        id="DK-02-B",
        criteria_ids=["DK-02"],
        setup_context="P&C carrier, SAP S/4HANA.",
        question="What is a segment in SAP and do we need it?",
        rubric=(
            "MUST: Explain segment as IFRS 8 / ASC 280 reporting "
            "dimension. "
            "MUST: Explain it derives from profit center in SAP. "
            "MUST: Give P&C example (e.g., Life vs Non-Life, or "
            "P&C vs Corporate). "
            "MUST: Explain the balanced segment reporting "
            "requirement."
        ),
        anti_patterns=[],
    ),
    TestConversation(
        id="DK-02-C",
        criteria_ids=["DK-02"],
        setup_context="P&C carrier, SAP S/4HANA.",
        question=(
            "We need to track accident year in the GL. "
            "Should we add it as a custom field on the code block?"
        ),
        rubric=(
            "MUST: Explain what accident year is and why P&C "
            "carriers need it (loss development, reserving). "
            "MUST: Discuss trade-offs of adding custom fields "
            "(data entry complexity, consistency across sources, "
            "document splitting). "
            "SHOULD: Challenge whether it needs to be on every "
            "journal entry line or can be derived. "
            "SHOULD: Discuss alternatives (subledger attribute, "
            "COPA characteristic, reporting hierarchy)."
        ),
        anti_patterns=[],
    ),
    # --- DK-03: Opinions and Push-Back ---
    TestConversation(
        id="DK-03-A",
        criteria_ids=["DK-03"],
        setup_context=(
            "P&C carrier. Current COA has 4,500 accounts. SAP S/4HANA implementation."
        ),
        question=(
            "Our CIO wants to reduce the chart of accounts from "
            "4,500 to exactly 500 accounts. He says simpler is "
            "always better. What do you think?"
        ),
        rubric=(
            "MUST: Push back against arbitrary reduction. "
            "MUST: Explain that account count is not a goal -- "
            "what matters is whether accounts support reporting. "
            "MUST: Warn about conversion cost / reconciliation "
            "impact of aggressive reduction. "
            "SHOULD: Use MUST DO / WORTH IT / PARK IT / DON'T TOUCH "
            "framework. "
            "SHOULD: Suggest a structured approach (analyze usage, "
            "identify dormant accounts, consolidate where justified)."
        ),
        anti_patterns=[],
    ),
    TestConversation(
        id="DK-03-B",
        criteria_ids=["DK-03"],
        setup_context="P&C carrier, SAP S/4HANA, 4 LOBs.",
        question=(
            "We want to create separate company codes for each LOB "
            "so we can have separate P&Ls. Is that a good idea?"
        ),
        rubric=(
            "MUST: Push back strongly -- this is almost always wrong. "
            "MUST: Explain that LOB P&L should be achieved through "
            "profit centers or COPA, not company codes. "
            "MUST: Warn about intercompany complexity, separate "
            "closings, consolidation overhead. "
            "SHOULD: Explain when separate company codes ARE "
            "appropriate (separate legal entities, not logical "
            "business units)."
        ),
        anti_patterns=[],
    ),
    # --- DK-04: Cross-Dimension Impact ---
    TestConversation(
        id="DK-04-A",
        criteria_ids=["DK-04"],
        setup_context=(
            "P&C carrier. We just decided that profit center = LOB "
            "(Auto, Home, Commercial, WC)."
        ),
        question=(
            "OK, we've decided profit center will represent our LOBs. "
            "What else does this affect?"
        ),
        rubric=(
            "MUST: Surface that segment now derives from profit center "
            "(so segment will be P&C or similar). "
            "MUST: Surface that state/region reporting must now use "
            "a different dimension (COPA or custom field). "
            "SHOULD: Mention impact on document splitting (segment "
            "derives from profit center). "
            "SHOULD: Discuss how this affects the COPA design "
            "(LOB already in profit center, don't duplicate)."
        ),
        anti_patterns=[],
    ),
    # --- DK-05: Audience Tailoring ---
    TestConversation(
        id="DK-05-A",
        criteria_ids=["DK-05"],
        setup_context=(
            "P&C carrier. Presenting the code block design concept to the CFO."
        ),
        question=(
            "I need to explain why the code block design matters to "
            "our CFO. She cares about regulatory reporting, close "
            "cycle, and M&A readiness. Help me frame this."
        ),
        rubric=(
            "MUST: Frame in strategic / business terms, not technical. "
            "MUST: Reference regulatory reporting, close cycle, M&A "
            "readiness specifically. "
            "MUST NOT: Use deep SAP technical jargon (ACDOCA, "
            "document splitting, posting keys). "
            "SHOULD: Quantify where possible (close cycle reduction, "
            "MJE elimination)."
        ),
        anti_patterns=["ACDOCA", "posting key", "field status"],
    ),
    TestConversation(
        id="DK-05-B",
        criteria_ids=["DK-05"],
        setup_context=(
            "P&C carrier. Now explaining the same concept to the "
            "finance operations team."
        ),
        question=(
            "Now I need to explain the code block design to our "
            "finance ops team -- the people who do the actual close "
            "and posting every month. What should I tell them?"
        ),
        rubric=(
            "MUST: Frame in operational terms (what changes in their "
            "daily work, how accounts are organized, what posting "
            "changes). "
            "SHOULD: Be more technical than the CFO version. "
            "SHOULD: Reference specific operational impacts (new "
            "account numbers, cost center changes, MJE elimination)."
        ),
        anti_patterns=[],
    ),
    # --- DK-06: P&C Sub-Segment Depth ---
    TestConversation(
        id="DK-06-A",
        criteria_ids=["DK-06"],
        setup_context="P&C carrier, SAP S/4HANA.",
        question=(
            "How should we structure our loss reserve accounts? "
            "We have case reserves, IBNR, and LAE across 4 LOBs."
        ),
        rubric=(
            "MUST: Explain case reserves, IBNR, and LAE correctly "
            "in P&C context. "
            "MUST: Discuss account structure options (by LOB, by "
            "reserve type, matrix of both). "
            "MUST: Reference NAIC Annual Statement reporting needs. "
            "SHOULD: Discuss the balance sheet vs. P&L account "
            "structure (reserve balance vs. reserve movement). "
            "SHOULD: Mention salvage and subrogation reserves."
        ),
        anti_patterns=[],
    ),
    TestConversation(
        id="DK-06-B",
        criteria_ids=["DK-06"],
        setup_context="P&C carrier operating in 12 US states.",
        question=(
            "Why do we need state-level tracking in our code block "
            "and how should we implement it?"
        ),
        rubric=(
            "MUST: Explain state-level regulatory reporting "
            "requirements for P&C carriers. "
            "MUST: Explain SAP doesn't have a native state field. "
            "MUST: Discuss implementation options (custom field "
            "via CI_COBL, COPA characteristic, reporting hierarchy). "
            "SHOULD: Recommend the minimum approach that meets "
            "regulatory needs."
        ),
        anti_patterns=[],
    ),
    # --- DK-07: Depth Test ---
    TestConversation(
        id="DK-07-A",
        criteria_ids=["DK-07"],
        setup_context=(
            "P&C carrier with 3 legacy companies being merged "
            "into one SAP S/4HANA instance. Each has its own COA. "
            "Total current accounts: 7,200 across all three."
        ),
        question=(
            "We're merging three P&C carriers into one SAP instance. "
            "Each has its own chart of accounts (2,800 + 2,400 + "
            "2,000 accounts). How should we approach the target "
            "COA design?"
        ),
        rubric=(
            "MUST: Provide a structured approach specific to "
            "insurance COA consolidation. "
            "MUST: Reference P&C-specific considerations (reserve "
            "accounts, LOB structures, state reporting). "
            "MUST: Warn about OLD=NEW reconciliation complexity. "
            "MUST: Discuss entity structure (company codes for "
            "legal entities vs. using profit centers for legacy "
            "entity tracking). "
            "A general AI would give generic 'map, analyze, "
            "harmonize' advice. This agent should give P&C-specific "
            "guidance with concrete account structure recommendations."
        ),
        anti_patterns=[],
    ),
    # --- DK-08: Process Guidance ---
    TestConversation(
        id="DK-08-A",
        criteria_ids=["DK-08"],
        setup_context=(
            "Starting a new P&C code block design engagement. "
            "Client is a mid-size carrier."
        ),
        question="Where should we start?",
        rubric=(
            "MUST: Reference a structured design approach (should "
            "align with the 17-step process). "
            "MUST: Suggest starting with understanding current state "
            "and target platform. "
            "SHOULD: Mention the sequence: platform → current state → "
            "data ingest → analysis → design principles → dimension "
            "design."
        ),
        anti_patterns=[],
    ),
]

# ---------------------------------------------------------------------------
# Baseline comparison scripts (same questions to general AI)
# ---------------------------------------------------------------------------
# These are used to compare: domain-prompted agent vs. general-purpose Claude.
# The questions are a subset of the above, chosen for max differentiation.

BASELINE_COMPARISON_SCRIPTS = [
    s
    for s in DOMAIN_KNOWLEDGE_SCRIPTS
    if s.id in {"DK-02-A", "DK-03-A", "DK-06-A", "DK-07-A"}
]
