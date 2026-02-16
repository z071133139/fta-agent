"""Tests for the evaluation framework."""

from __future__ import annotations

from fta_agent.eval.cost_tracker import CostTracker
from fta_agent.eval.criteria import (
    ALL_CRITERIA,
    COST_CRITERIA,
    DATA_ANALYSIS_CRITERIA,
    DOMAIN_KNOWLEDGE_CRITERIA,
    EvalCategory,
    EvalReport,
    EvalResult,
    Score,
)
from fta_agent.eval.test_scripts import (
    BASELINE_COMPARISON_SCRIPTS,
    DOMAIN_KNOWLEDGE_SCRIPTS,
)

# ---------------------------------------------------------------------------
# Criteria tests
# ---------------------------------------------------------------------------


class TestCriteria:
    def test_domain_knowledge_criteria_exist(self) -> None:
        assert len(DOMAIN_KNOWLEDGE_CRITERIA) >= 8

    def test_data_analysis_criteria_exist(self) -> None:
        assert len(DATA_ANALYSIS_CRITERIA) >= 5

    def test_cost_criteria_exist(self) -> None:
        assert len(COST_CRITERIA) >= 2

    def test_all_criteria_have_unique_ids(self) -> None:
        ids = [c.id for c in ALL_CRITERIA]
        assert len(ids) == len(set(ids)), "Duplicate criterion IDs found"

    def test_all_criteria_have_category(self) -> None:
        for c in ALL_CRITERIA:
            assert c.category in EvalCategory

    def test_all_criteria_have_rubric(self) -> None:
        for c in ALL_CRITERIA:
            assert c.pass_criteria, f"{c.id} missing pass_criteria"
            assert c.partial_criteria, f"{c.id} missing partial_criteria"
            assert c.fail_criteria, f"{c.id} missing fail_criteria"


# ---------------------------------------------------------------------------
# Test scripts tests
# ---------------------------------------------------------------------------


class TestScripts:
    def test_domain_knowledge_scripts_exist(self) -> None:
        assert len(DOMAIN_KNOWLEDGE_SCRIPTS) >= 14

    def test_all_scripts_have_questions(self) -> None:
        for s in DOMAIN_KNOWLEDGE_SCRIPTS:
            assert s.question, f"{s.id} missing question"
            assert s.rubric, f"{s.id} missing rubric"

    def test_all_scripts_reference_valid_criteria(self) -> None:
        valid_ids = {c.id for c in ALL_CRITERIA}
        for s in DOMAIN_KNOWLEDGE_SCRIPTS:
            for cid in s.criteria_ids:
                assert cid in valid_ids, (
                    f"Script {s.id} references unknown criterion {cid}"
                )

    def test_baseline_scripts_are_subset(self) -> None:
        all_ids = {s.id for s in DOMAIN_KNOWLEDGE_SCRIPTS}
        for s in BASELINE_COMPARISON_SCRIPTS:
            assert s.id in all_ids

    def test_baseline_scripts_exist(self) -> None:
        assert len(BASELINE_COMPARISON_SCRIPTS) >= 4


# ---------------------------------------------------------------------------
# Eval report tests
# ---------------------------------------------------------------------------


class TestEvalReport:
    def test_empty_report(self) -> None:
        report = EvalReport(iteration="1")
        assert report.pass_rate == 0.0
        assert "0/0" in report.summary

    def test_all_pass(self) -> None:
        report = EvalReport(
            iteration="1",
            results=[
                EvalResult(criterion_id="DK-01", score=Score.PASS, evidence="ok"),
                EvalResult(criterion_id="DK-02", score=Score.PASS, evidence="ok"),
            ],
        )
        assert report.pass_rate == 100.0

    def test_mixed_results(self) -> None:
        report = EvalReport(
            iteration="1",
            results=[
                EvalResult(criterion_id="DK-01", score=Score.PASS, evidence="ok"),
                EvalResult(criterion_id="DK-02", score=Score.PARTIAL, evidence="ok"),
                EvalResult(criterion_id="DK-03", score=Score.FAIL, evidence="bad"),
            ],
        )
        assert 33 <= report.pass_rate <= 34  # 1/3

    def test_summary_format(self) -> None:
        report = EvalReport(
            iteration="1",
            results=[
                EvalResult(criterion_id="DK-01", score=Score.PASS, evidence="ok"),
            ],
        )
        summary = report.summary
        assert "Iteration 1" in summary
        assert "1/1 PASS" in summary


# ---------------------------------------------------------------------------
# Cost tracker tests
# ---------------------------------------------------------------------------


class TestCostTracker:
    def test_log_call(self) -> None:
        tracker = CostTracker(session_id="test")
        record = tracker.log_call(
            model="claude-sonnet-4-20250514",
            input_tokens=1000,
            output_tokens=500,
        )
        assert record.total_tokens == 1500
        assert record.estimated_cost_usd > 0
        assert tracker.num_calls == 1

    def test_aggregates(self) -> None:
        tracker = CostTracker()
        tracker.log_call("claude-sonnet-4-20250514", 1000, 500)
        tracker.log_call("claude-sonnet-4-20250514", 2000, 800)
        assert tracker.total_input_tokens == 3000
        assert tracker.total_output_tokens == 1300
        assert tracker.total_tokens == 4300
        assert tracker.num_calls == 2
        assert tracker.avg_tokens_per_call == 2150.0

    def test_cost_estimation(self) -> None:
        tracker = CostTracker()
        # 1M input tokens at $3/M + 1M output tokens at $15/M = $18
        record = tracker.log_call("claude-sonnet-4-20250514", 1_000_000, 1_000_000)
        assert abs(record.estimated_cost_usd - 18.0) < 0.01

    def test_summary_output(self) -> None:
        tracker = CostTracker(session_id="eval-run-1")
        tracker.log_call("claude-sonnet-4-20250514", 1000, 500)
        summary = tracker.summary()
        assert "eval-run-1" in summary
        assert "Total calls: 1" in summary
        assert "$" in summary

    def test_save_and_format(self, tmp_path: object) -> None:
        from pathlib import Path

        tracker = CostTracker(session_id="test-save")
        tracker.log_call("claude-sonnet-4-20250514", 1000, 500, label="test")

        out_path = Path(str(tmp_path)) / "cost_log.json"
        tracker.save(out_path)

        import json

        data = json.loads(out_path.read_text())
        assert data["session_id"] == "test-save"
        assert data["summary"]["total_calls"] == 1
        assert len(data["calls"]) == 1
        assert data["calls"][0]["label"] == "test"

    def test_unknown_model_uses_default_pricing(self) -> None:
        tracker = CostTracker()
        record = tracker.log_call("unknown-model-v99", 1000, 500)
        assert record.estimated_cost_usd > 0
