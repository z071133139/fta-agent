"""Evaluation criteria for FTA agent quality assessment.

Defines concrete, measurable quality dimensions for:
- Domain knowledge (Iteration 1): Does the agent sound like a senior P&C consultant?
- Data analysis (Iteration 3): Does the pipeline find the right patterns?
- Cost thresholds: Are we within budget?

Each criterion has:
- A dimension name
- A description of what "good" looks like
- Specific test questions (in test_scripts.py)
- A scoring rubric (PASS / PARTIAL / FAIL)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum


class Score(StrEnum):
    """Evaluation outcome for a single criterion."""

    PASS = "PASS"  # Meets or exceeds the bar
    PARTIAL = "PARTIAL"  # Shows capability but has gaps
    FAIL = "FAIL"  # Does not meet the bar


class EvalCategory(StrEnum):
    """High-level evaluation category."""

    DOMAIN_KNOWLEDGE = "domain_knowledge"
    DATA_ANALYSIS = "data_analysis"
    COST = "cost"


@dataclass
class EvalCriterion:
    """A single evaluation criterion with rubric."""

    id: str
    category: EvalCategory
    dimension: str
    description: str
    pass_criteria: str
    partial_criteria: str
    fail_criteria: str
    weight: float = 1.0  # Relative importance


@dataclass
class EvalResult:
    """Result of evaluating one criterion."""

    criterion_id: str
    score: Score
    evidence: str  # Specific output or observation that justifies the score
    notes: str = ""


@dataclass
class EvalReport:
    """Complete evaluation report for an iteration."""

    iteration: str
    results: list[EvalResult] = field(default_factory=list)

    @property
    def pass_rate(self) -> float:
        """Percentage of criteria that passed."""
        if not self.results:
            return 0.0
        passed = sum(1 for r in self.results if r.score == Score.PASS)
        return passed / len(self.results) * 100

    @property
    def summary(self) -> str:
        """Human-readable summary."""
        total = len(self.results)
        passed = sum(1 for r in self.results if r.score == Score.PASS)
        partial = sum(1 for r in self.results if r.score == Score.PARTIAL)
        failed = sum(1 for r in self.results if r.score == Score.FAIL)
        return (
            f"Iteration {self.iteration}: "
            f"{passed}/{total} PASS, {partial} PARTIAL, {failed} FAIL "
            f"({self.pass_rate:.0f}%)"
        )


# ---------------------------------------------------------------------------
# Domain Knowledge Criteria (Iteration 1)
# ---------------------------------------------------------------------------

DOMAIN_KNOWLEDGE_CRITERIA = [
    EvalCriterion(
        id="DK-01",
        category=EvalCategory.DOMAIN_KNOWLEDGE,
        dimension="Insurance Language Translation",
        description=(
            "Agent NEVER uses raw SAP terms without providing the insurance "
            "equivalent. When referencing SAP concepts, it translates to "
            "insurance terminology."
        ),
        pass_criteria=(
            "Every SAP term mentioned is accompanied by its insurance "
            "equivalent. Agent proactively uses insurance language "
            "(e.g., 'loss reserves' not 'provisions')."
        ),
        partial_criteria=(
            "Most SAP terms are translated, but occasional raw SAP jargon "
            "slips through without translation."
        ),
        fail_criteria=(
            "Agent freely uses SAP terminology (COGS, material, plant, "
            "production order) without insurance context."
        ),
        weight=2.0,  # Critical differentiator
    ),
    EvalCriterion(
        id="DK-02",
        category=EvalCategory.DOMAIN_KNOWLEDGE,
        dimension="Code Block Dimension Knowledge",
        description=(
            "For each of the ~15 key code block dimensions, the agent can "
            "explain it in P&C context, identify the key design question, "
            "and articulate the common debate."
        ),
        pass_criteria=(
            "Agent explains dimensions in P&C-specific terms, identifies "
            "the right design question, and can articulate both sides of "
            "common debates with concrete examples."
        ),
        partial_criteria=(
            "Agent explains dimensions correctly but generically (not "
            "P&C-specific) or misses some design trade-offs."
        ),
        fail_criteria=(
            "Agent provides textbook definitions without P&C context "
            "or cannot identify the key design question."
        ),
        weight=2.0,
    ),
    EvalCriterion(
        id="DK-03",
        category=EvalCategory.DOMAIN_KNOWLEDGE,
        dimension="Opinions and Push-Back",
        description=(
            "When given a bad or questionable design proposal, the agent "
            "pushes back with specific reasoning. Uses the MUST DO / "
            "WORTH IT / PARK IT / DON'T TOUCH framework."
        ),
        pass_criteria=(
            "Agent identifies problems in the proposal, explains why it's "
            "problematic with specific P&C consequences, suggests a better "
            "approach, and categorizes recommendations."
        ),
        partial_criteria=(
            "Agent raises concerns but doesn't provide specific enough "
            "reasoning or alternatives."
        ),
        fail_criteria=(
            "Agent agrees with everything or provides only generic "
            "caveats without substance."
        ),
        weight=2.0,
    ),
    EvalCriterion(
        id="DK-04",
        category=EvalCategory.DOMAIN_KNOWLEDGE,
        dimension="Cross-Dimension Impact",
        description=(
            "When a decision is made on one dimension, the agent surfaces "
            "ripple effects on other dimensions."
        ),
        pass_criteria=(
            "Agent identifies 2+ downstream impacts of a decision and "
            "explains them concretely. E.g., 'profit center = LOB means "
            "segment will derive as Life vs Non-Life, and state must be "
            "handled elsewhere.'"
        ),
        partial_criteria=(
            "Agent mentions downstream impacts but vaguely or incompletely."
        ),
        fail_criteria=("Agent treats each dimension decision in isolation."),
        weight=1.5,
    ),
    EvalCriterion(
        id="DK-05",
        category=EvalCategory.DOMAIN_KNOWLEDGE,
        dimension="Audience Tailoring",
        description=(
            "Same question framed differently for CFO vs. finance ops vs. IT."
        ),
        pass_criteria=(
            "Agent adjusts depth, terminology, and framing based on the "
            "stated audience. CFO gets strategic view, finance ops gets "
            "operational detail, IT gets technical specifics."
        ),
        partial_criteria=(
            "Agent slightly adjusts tone but content is essentially "
            "the same regardless of audience."
        ),
        fail_criteria=("Agent gives the same response regardless of audience."),
        weight=1.0,
    ),
    EvalCriterion(
        id="DK-06",
        category=EvalCategory.DOMAIN_KNOWLEDGE,
        dimension="P&C Sub-Segment Depth",
        description=(
            "Agent demonstrates specific P&C knowledge: loss reserves "
            "(case, IBNR, LAE), UPR, accident year tracking, state-level "
            "reporting, NAIC Annual Statement structure."
        ),
        pass_criteria=(
            "Agent explains P&C-specific concepts accurately with correct "
            "terminology and can discuss design implications for each."
        ),
        partial_criteria=(
            "Agent knows the concepts exist but explanations are surface-level "
            "or contain inaccuracies."
        ),
        fail_criteria=(
            "Agent confuses P&C concepts with Life/Annuity or provides "
            "generic insurance information."
        ),
        weight=2.0,
    ),
    EvalCriterion(
        id="DK-07",
        category=EvalCategory.DOMAIN_KNOWLEDGE,
        dimension="Depth Test (vs. General AI)",
        description=(
            "The agent's output is meaningfully better than what a "
            "general-purpose Claude with no domain prompts would produce "
            "for the same question."
        ),
        pass_criteria=(
            "Output contains specific P&C examples, concrete numbers, "
            "real design trade-offs, and practical recommendations that "
            "a generalist AI would not produce."
        ),
        partial_criteria=(
            "Output is somewhat better than generalist but could largely "
            "be reproduced with a basic prompt."
        ),
        fail_criteria=(
            "Output is not distinguishable from a general-purpose AI response."
        ),
        weight=2.0,  # THE core bet
    ),
    EvalCriterion(
        id="DK-08",
        category=EvalCategory.DOMAIN_KNOWLEDGE,
        dimension="Process Guidance (17-Step)",
        description=(
            "Agent can articulate where the user is in the design "
            "process and guide them to the next step."
        ),
        pass_criteria=(
            "Agent references the design process naturally, suggests "
            "next steps, and explains why they matter in sequence."
        ),
        partial_criteria=(
            "Agent knows the process exists but doesn't naturally "
            "guide the user through it."
        ),
        fail_criteria=("Agent has no awareness of a structured design process."),
        weight=1.0,
    ),
]

# ---------------------------------------------------------------------------
# Data Analysis Criteria (Iteration 3)
# ---------------------------------------------------------------------------

DATA_ANALYSIS_CRITERIA = [
    EvalCriterion(
        id="DA-01",
        category=EvalCategory.DATA_ANALYSIS,
        dimension="Account Profiling Accuracy",
        description="Account profiles match known synthetic data patterns.",
        pass_criteria=(
            "Activity levels, balance behaviors, and classifications "
            "match the known synthetic data for 95%+ of accounts."
        ),
        partial_criteria="80-95% accuracy on account profiling.",
        fail_criteria="Below 80% accuracy.",
        weight=1.5,
    ),
    EvalCriterion(
        id="DA-02",
        category=EvalCategory.DATA_ANALYSIS,
        dimension="MJE Pattern Detection Recall",
        description=(
            "Pipeline finds all 7 embedded MJE pattern types in synthetic data."
        ),
        pass_criteria="All 7 pattern types detected (100% recall).",
        partial_criteria="5-6 of 7 patterns detected.",
        fail_criteria="4 or fewer patterns detected.",
        weight=2.0,
    ),
    EvalCriterion(
        id="DA-03",
        category=EvalCategory.DATA_ANALYSIS,
        dimension="MJE-to-COA Linking Quality",
        description=(
            "Recommendations linking MJE root causes to COA design "
            "changes are sensible and actionable."
        ),
        pass_criteria=(
            "Each detected MJE pattern has a specific, actionable "
            "COA design recommendation that addresses the root cause."
        ),
        partial_criteria=(
            "Recommendations exist but are generic or don't clearly "
            "address the root cause."
        ),
        fail_criteria="No recommendations or nonsensical suggestions.",
        weight=1.5,
    ),
    EvalCriterion(
        id="DA-04",
        category=EvalCategory.DATA_ANALYSIS,
        dimension="Key Person Risk Detection",
        description=(
            "Pipeline correctly identifies JSMITH as high-volume "
            "MJE preparer (key person risk)."
        ),
        pass_criteria=(
            "JSMITH flagged as highest-volume preparer with concentration risk warning."
        ),
        partial_criteria="JSMITH identified but risk not highlighted.",
        fail_criteria="JSMITH not identified as top preparer.",
        weight=1.0,
    ),
    EvalCriterion(
        id="DA-05",
        category=EvalCategory.DATA_ANALYSIS,
        dimension="Performance at Scale",
        description="1M+ records process in acceptable time on a laptop.",
        pass_criteria="1M records processed in under 60 seconds.",
        partial_criteria="1M records processed in 60-180 seconds.",
        fail_criteria="1M records take more than 180 seconds.",
        weight=1.0,
    ),
]

# ---------------------------------------------------------------------------
# Cost Criteria
# ---------------------------------------------------------------------------

COST_CRITERIA = [
    EvalCriterion(
        id="COST-01",
        category=EvalCategory.COST,
        dimension="Token Usage Per Turn",
        description="Average tokens per conversation turn.",
        pass_criteria="Average under 4,000 tokens per turn.",
        partial_criteria="Average 4,000-8,000 tokens per turn.",
        fail_criteria="Average over 8,000 tokens per turn.",
        weight=1.0,
    ),
    EvalCriterion(
        id="COST-02",
        category=EvalCategory.COST,
        dimension="Cost Per Design Session",
        description=(
            "Total LLM cost for a full design session "
            "(~20-30 turns of substantive conversation)."
        ),
        pass_criteria="Under $2.00 per session.",
        partial_criteria="$2.00-$5.00 per session.",
        fail_criteria="Over $5.00 per session.",
        weight=1.0,
    ),
]

# ---------------------------------------------------------------------------
# All criteria combined
# ---------------------------------------------------------------------------

ALL_CRITERIA = DOMAIN_KNOWLEDGE_CRITERIA + DATA_ANALYSIS_CRITERIA + COST_CRITERIA
