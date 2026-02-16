"""Token usage and cost tracking utility.

Logs token counts and estimated costs for each LLM call. Provides
per-turn and per-session aggregates for cost monitoring.

Usage:
    tracker = CostTracker()
    tracker.log_call(
        model="claude-sonnet-4-20250514",
        input_tokens=1500, output_tokens=800,
    )
    print(tracker.summary())
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path

# Pricing per 1M tokens (as of early 2026, approximate)
# Update these when pricing changes
MODEL_PRICING: dict[str, dict[str, float]] = {
    "claude-sonnet-4-20250514": {
        "input": 3.00,
        "output": 15.00,
    },
    "claude-opus-4-20250514": {
        "input": 15.00,
        "output": 75.00,
    },
    "claude-haiku-3-20240307": {
        "input": 0.25,
        "output": 1.25,
    },
    "gpt-4o": {
        "input": 2.50,
        "output": 10.00,
    },
    "gpt-4o-mini": {
        "input": 0.15,
        "output": 0.60,
    },
}

# Default pricing for unknown models
DEFAULT_PRICING = {"input": 3.00, "output": 15.00}


@dataclass
class CallRecord:
    """Record of a single LLM API call."""

    timestamp: str
    model: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    estimated_cost_usd: float
    label: str = ""  # Optional label (e.g., "routing", "domain_response")


@dataclass
class CostTracker:
    """Tracks token usage and cost across a session."""

    session_id: str = ""
    calls: list[CallRecord] = field(default_factory=list)

    def log_call(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        label: str = "",
    ) -> CallRecord:
        """Log a single LLM call and return the record."""
        total = input_tokens + output_tokens
        cost = self._estimate_cost(model, input_tokens, output_tokens)

        record = CallRecord(
            timestamp=datetime.now(UTC).isoformat(),
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total,
            estimated_cost_usd=cost,
            label=label,
        )
        self.calls.append(record)
        return record

    @property
    def total_input_tokens(self) -> int:
        return sum(c.input_tokens for c in self.calls)

    @property
    def total_output_tokens(self) -> int:
        return sum(c.output_tokens for c in self.calls)

    @property
    def total_tokens(self) -> int:
        return sum(c.total_tokens for c in self.calls)

    @property
    def total_cost_usd(self) -> float:
        return sum(c.estimated_cost_usd for c in self.calls)

    @property
    def num_calls(self) -> int:
        return len(self.calls)

    @property
    def avg_tokens_per_call(self) -> float:
        if not self.calls:
            return 0.0
        return self.total_tokens / len(self.calls)

    @property
    def avg_cost_per_call(self) -> float:
        if not self.calls:
            return 0.0
        return self.total_cost_usd / len(self.calls)

    def summary(self) -> str:
        """Human-readable cost summary."""
        lines = [
            f"Session: {self.session_id or '(unnamed)'}",
            f"Total calls: {self.num_calls}",
            f"Total tokens: {self.total_tokens:,} "
            f"(in: {self.total_input_tokens:,}, "
            f"out: {self.total_output_tokens:,})",
            f"Avg tokens/call: {self.avg_tokens_per_call:,.0f}",
            f"Total cost: ${self.total_cost_usd:.4f}",
            f"Avg cost/call: ${self.avg_cost_per_call:.4f}",
        ]

        # Breakdown by model
        models: dict[str, list[CallRecord]] = {}
        for c in self.calls:
            models.setdefault(c.model, []).append(c)

        if len(models) > 1:
            lines.append("\nBy model:")
            for model, calls in sorted(models.items()):
                model_cost = sum(c.estimated_cost_usd for c in calls)
                model_tokens = sum(c.total_tokens for c in calls)
                lines.append(
                    f"  {model}: {len(calls)} calls, "
                    f"{model_tokens:,} tokens, ${model_cost:.4f}"
                )

        return "\n".join(lines)

    def save(self, path: str | Path) -> None:
        """Save call log to JSON file."""
        data = {
            "session_id": self.session_id,
            "summary": {
                "total_calls": self.num_calls,
                "total_input_tokens": self.total_input_tokens,
                "total_output_tokens": self.total_output_tokens,
                "total_tokens": self.total_tokens,
                "total_cost_usd": round(self.total_cost_usd, 6),
            },
            "calls": [
                {
                    "timestamp": c.timestamp,
                    "model": c.model,
                    "input_tokens": c.input_tokens,
                    "output_tokens": c.output_tokens,
                    "total_tokens": c.total_tokens,
                    "estimated_cost_usd": round(c.estimated_cost_usd, 6),
                    "label": c.label,
                }
                for c in self.calls
            ],
        }
        Path(path).write_text(json.dumps(data, indent=2) + "\n")

    @staticmethod
    def _estimate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
        """Estimate USD cost based on model pricing."""
        pricing = MODEL_PRICING.get(model, DEFAULT_PRICING)
        input_cost = (input_tokens / 1_000_000) * pricing["input"]
        output_cost = (output_tokens / 1_000_000) * pricing["output"]
        return input_cost + output_cost
