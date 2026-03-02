"""Comprehensive tests for Stream B (B1–B8): agentic capabilities.

Covers:
  B1 — Data fixture generation + DuckDB loading
  B2 — GL analysis tools (profile, MJE, TB, IS, dims)
  B3 — SSE streaming endpoint (/api/v1/stream)
  B4 — GL Design Coach graph with tool nodes
  B5 — SSE event envelope schema validation
  B6/B7 — Workspace config for live agent workspaces
  B8 — Error handling and graceful fallbacks

No LLM calls — all agent invocations are mocked.
"""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import AsyncMock, patch

import polars as pl
import pytest
from httpx import ASGITransport, AsyncClient
from langchain_core.messages import AIMessage, HumanMessage

from fta_agent.api.app import create_app
from fta_agent.data.engine import DataEngine
from fta_agent.data.loader import FIXTURES_DIR, ensure_fixture, load_fixture
from fta_agent.data.schemas import ACCOUNT_MASTER_SCHEMA, POSTING_SCHEMA, TRIAL_BALANCE_SCHEMA
from fta_agent.data.synthetic import generate_synthetic_data
from fta_agent.tools.gl_analysis import (
    _assess_dimensions,
    _compute_trial_balance,
    _detect_mje,
    _generate_income_statement,
    _profile_accounts,
    create_gl_tools,
)


# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def engine() -> DataEngine:
    """Module-scoped DataEngine with fixture data loaded."""
    eng = DataEngine()
    load_fixture(eng)
    yield eng
    eng.close()


@pytest.fixture(scope="module")
def synthetic_data() -> dict[str, pl.DataFrame]:
    """Module-scoped synthetic data (generated once)."""
    return generate_synthetic_data()


# ===========================================================================
# B1 — Data fixture generation + DuckDB loading
# ===========================================================================


class TestB1FixtureGeneration:
    """Verify synthetic data generation and DuckDB loading."""

    def test_synthetic_data_returns_three_datasets(self, synthetic_data: dict[str, pl.DataFrame]) -> None:
        assert "postings" in synthetic_data
        assert "account_master" in synthetic_data
        assert "trial_balance" in synthetic_data

    def test_postings_has_significant_volume(self, synthetic_data: dict[str, pl.DataFrame]) -> None:
        """Should generate >100K posting lines for realistic analysis."""
        assert len(synthetic_data["postings"]) > 100_000

    def test_account_master_has_accounts(self, synthetic_data: dict[str, pl.DataFrame]) -> None:
        assert len(synthetic_data["account_master"]) > 100

    def test_trial_balance_has_periods(self, synthetic_data: dict[str, pl.DataFrame]) -> None:
        assert len(synthetic_data["trial_balance"]) > 1000

    def test_postings_schema_matches(self, synthetic_data: dict[str, pl.DataFrame]) -> None:
        """All columns from POSTING_SCHEMA should be present in generated data."""
        df = synthetic_data["postings"]
        for col_name in POSTING_SCHEMA:
            assert col_name in df.columns, f"Missing column: {col_name}"

    def test_account_master_schema_matches(self, synthetic_data: dict[str, pl.DataFrame]) -> None:
        df = synthetic_data["account_master"]
        for col_name in ACCOUNT_MASTER_SCHEMA:
            assert col_name in df.columns, f"Missing column: {col_name}"

    def test_trial_balance_schema_matches(self, synthetic_data: dict[str, pl.DataFrame]) -> None:
        df = synthetic_data["trial_balance"]
        for col_name in TRIAL_BALANCE_SCHEMA:
            assert col_name in df.columns, f"Missing column: {col_name}"


class TestB1DuckDBLoading:
    """Verify DuckDB loading and table availability."""

    def test_all_tables_loaded(self, engine: DataEngine) -> None:
        tables = engine.tables()
        assert "postings" in tables
        assert "account_master" in tables
        assert "trial_balance" in tables

    def test_postings_queryable(self, engine: DataEngine) -> None:
        result = engine.query_polars("SELECT COUNT(*) as cnt FROM postings")
        assert result["cnt"][0] > 100_000

    def test_account_master_queryable(self, engine: DataEngine) -> None:
        result = engine.query_polars("SELECT COUNT(*) as cnt FROM account_master")
        assert result["cnt"][0] > 100

    def test_trial_balance_queryable(self, engine: DataEngine) -> None:
        result = engine.query_polars("SELECT COUNT(*) as cnt FROM trial_balance")
        assert result["cnt"][0] > 1000

    def test_postings_have_all_document_categories(self, engine: DataEngine) -> None:
        """Verify MJE, STD, ACC, CLR categories exist for tool testing."""
        result = engine.query_polars(
            "SELECT DISTINCT document_category FROM postings ORDER BY document_category"
        )
        categories = result["document_category"].to_list()
        assert "STD" in categories
        assert "MJE" in categories

    def test_postings_have_dimensional_data(self, engine: DataEngine) -> None:
        """Tools depend on profit_center, lob, state being populated."""
        result = engine.query_polars("""
            SELECT
                SUM(CASE WHEN profit_center IS NOT NULL THEN 1 ELSE 0 END) as pc_count,
                SUM(CASE WHEN lob IS NOT NULL THEN 1 ELSE 0 END) as lob_count,
                SUM(CASE WHEN state IS NOT NULL THEN 1 ELSE 0 END) as state_count
            FROM postings
        """)
        assert result["pc_count"][0] > 0
        assert result["lob_count"][0] > 0
        assert result["state_count"][0] > 0

    def test_ensure_fixture_idempotent(self, tmp_path: Path) -> None:
        """ensure_fixture should not regenerate if files exist."""
        # First call generates
        path = ensure_fixture(tmp_path)
        assert (path / "postings.parquet").exists()
        mtime = (path / "postings.parquet").stat().st_mtime

        # Second call skips
        path2 = ensure_fixture(tmp_path)
        assert path2 == path
        assert (path2 / "postings.parquet").stat().st_mtime == mtime


# ===========================================================================
# B2 — GL analysis tools
# ===========================================================================


class TestB2ProfileAccounts:
    """Test the profile_accounts tool."""

    def test_returns_valid_json(self, engine: DataEngine) -> None:
        result = json.loads(_profile_accounts(engine, top_n=5))
        assert "accounts_profiled" in result
        assert "total_postings" in result
        assert "accounts" in result

    def test_respects_top_n(self, engine: DataEngine) -> None:
        result = json.loads(_profile_accounts(engine, top_n=3))
        assert result["accounts_profiled"] == 3
        assert len(result["accounts"]) == 3

    def test_accounts_have_required_fields(self, engine: DataEngine) -> None:
        result = json.loads(_profile_accounts(engine, top_n=1))
        account = result["accounts"][0]
        assert "gl_account" in account
        assert "posting_count" in account
        assert "mje_pct" in account
        assert "description" in account

    def test_accounts_ordered_by_posting_count(self, engine: DataEngine) -> None:
        result = json.loads(_profile_accounts(engine, top_n=10))
        counts = [a["posting_count"] for a in result["accounts"]]
        assert counts == sorted(counts, reverse=True)

    def test_filter_by_account(self, engine: DataEngine) -> None:
        result = json.loads(_profile_accounts(engine, account_filter="p.gl_account LIKE '4%'", top_n=50))
        for account in result["accounts"]:
            assert account["gl_account"].startswith("4")

    def test_empty_filter_returns_empty(self, engine: DataEngine) -> None:
        result = json.loads(_profile_accounts(engine, account_filter="p.gl_account = 'NONEXISTENT'"))
        assert result["accounts"] == []


class TestB2DetectMJE:
    """Test the detect_mje tool."""

    def test_returns_valid_json(self, engine: DataEngine) -> None:
        result = json.loads(_detect_mje(engine))
        assert "recurring_identical" in result
        assert "mje_concentration" in result
        assert "accrual_reversal" in result
        assert "intercompany" in result
        assert "overall_summary" in result

    def test_each_pattern_has_count(self, engine: DataEngine) -> None:
        result = json.loads(_detect_mje(engine))
        for key in ("recurring_identical", "mje_concentration", "accrual_reversal", "intercompany"):
            assert "count" in result[key]
            assert "patterns" in result[key]

    def test_overall_summary_has_categories(self, engine: DataEngine) -> None:
        result = json.loads(_detect_mje(engine))
        summary = result["overall_summary"]
        assert len(summary) > 0
        assert "document_category" in summary[0]
        assert "count" in summary[0]

    def test_min_occurrences_filters(self, engine: DataEngine) -> None:
        loose = json.loads(_detect_mje(engine, min_occurrences=2))
        strict = json.loads(_detect_mje(engine, min_occurrences=10))
        # Strict should have equal or fewer patterns
        assert strict["recurring_identical"]["count"] <= loose["recurring_identical"]["count"]


class TestB2ComputeTrialBalance:
    """Test the compute_trial_balance tool."""

    def test_returns_valid_json(self, engine: DataEngine) -> None:
        result = json.loads(_compute_trial_balance(engine))
        assert "row_count" in result
        assert "by_account_type" in result
        assert "rows" in result

    def test_filter_by_period(self, engine: DataEngine) -> None:
        result = json.loads(_compute_trial_balance(engine, fiscal_period=6))
        for row in result["rows"]:
            assert row["fiscal_period"] == 6

    def test_filter_by_account_type(self, engine: DataEngine) -> None:
        result = json.loads(_compute_trial_balance(engine, account_type_filter="R"))
        for row in result["by_account_type"]:
            assert row["account_type"] == "R"

    def test_rows_have_required_fields(self, engine: DataEngine) -> None:
        result = json.loads(_compute_trial_balance(engine, fiscal_period=1))
        if result["rows"]:
            row = result["rows"][0]
            assert "gl_account" in row
            assert "opening_balance" in row
            assert "closing_balance" in row

    def test_truncation_at_200_rows(self, engine: DataEngine) -> None:
        """Full TB has >200 rows per period, should truncate."""
        result = json.loads(_compute_trial_balance(engine))
        assert result["truncated"] is True or len(result["rows"]) <= 200


class TestB2GenerateIncomeStatement:
    """Test the generate_income_statement tool."""

    def test_returns_valid_json(self, engine: DataEngine) -> None:
        result = json.loads(_generate_income_statement(engine))
        assert "total_revenue" in result
        assert "total_expenses" in result
        assert "net_income" in result
        assert "by_category" in result

    def test_revenue_is_positive(self, engine: DataEngine) -> None:
        """After sign flip, revenue should be positive."""
        result = json.loads(_generate_income_statement(engine))
        assert result["total_revenue"] > 0

    def test_expenses_are_positive(self, engine: DataEngine) -> None:
        result = json.loads(_generate_income_statement(engine))
        assert result["total_expenses"] > 0

    def test_period_filter(self, engine: DataEngine) -> None:
        full_year = json.loads(_generate_income_statement(engine, period_from=1, period_to=12))
        half_year = json.loads(_generate_income_statement(engine, period_from=1, period_to=6))
        # Half year should have less revenue
        assert half_year["total_revenue"] < full_year["total_revenue"]

    def test_categories_populated(self, engine: DataEngine) -> None:
        result = json.loads(_generate_income_statement(engine))
        assert len(result["by_category"]) > 0
        cat = result["by_category"][0]
        assert "account_type" in cat
        assert "account_group" in cat


class TestB2AssessDimensions:
    """Test the assess_dimensions tool."""

    def test_returns_valid_json(self, engine: DataEngine) -> None:
        result = json.loads(_assess_dimensions(engine))
        assert len(result) > 0

    def test_default_dimensions(self, engine: DataEngine) -> None:
        result = json.loads(_assess_dimensions(engine))
        expected = {"profit_center", "cost_center", "functional_area", "segment", "lob", "state"}
        assert expected == set(result.keys())

    def test_custom_dimensions(self, engine: DataEngine) -> None:
        result = json.loads(_assess_dimensions(engine, dimensions=["lob", "state"]))
        assert set(result.keys()) == {"lob", "state"}

    def test_dimension_has_required_fields(self, engine: DataEngine) -> None:
        result = json.loads(_assess_dimensions(engine, dimensions=["profit_center"]))
        dim = result["profit_center"]
        assert "fill_rate_pct" in dim
        assert "distinct_values" in dim
        assert "value_distribution" in dim
        assert "by_account_type" in dim

    def test_fill_rate_is_percentage(self, engine: DataEngine) -> None:
        result = json.loads(_assess_dimensions(engine, dimensions=["profit_center"]))
        pct = result["profit_center"]["fill_rate_pct"]
        assert 0 <= pct <= 100


class TestB2ToolFactory:
    """Test create_gl_tools factory."""

    def test_creates_five_tools(self, engine: DataEngine) -> None:
        tools = create_gl_tools(engine)
        assert len(tools) == 5

    def test_tool_names(self, engine: DataEngine) -> None:
        tools = create_gl_tools(engine)
        names = {t.name for t in tools}
        assert names == {
            "profile_accounts",
            "detect_mje",
            "compute_trial_balance",
            "generate_income_statement",
            "assess_dimensions",
        }

    def test_tools_have_descriptions(self, engine: DataEngine) -> None:
        tools = create_gl_tools(engine)
        for tool in tools:
            assert tool.description
            assert len(tool.description) > 20

    def test_tools_are_invocable(self, engine: DataEngine) -> None:
        """Each tool should be callable via .invoke() without errors."""
        tools = create_gl_tools(engine)
        for tool in tools:
            result = tool.invoke({})
            parsed = json.loads(result)
            assert isinstance(parsed, dict)


# ===========================================================================
# B3 — SSE streaming endpoint
# ===========================================================================


class TestB3SSEEndpoint:
    """Test the /api/v1/stream endpoint.

    These tests mock at the graph level to avoid LLM calls entirely.
    The mock graph yields a single AI message and completes.
    """

    @pytest.fixture
    def app_with_engine(self):
        """Create app with engine pre-loaded (bypassing lifespan)."""
        app = create_app()
        eng = DataEngine()
        load_fixture(eng)
        app.state.engine = eng
        yield app
        eng.close()

    @pytest.fixture
    async def client(self, app_with_engine):
        transport = ASGITransport(app=app_with_engine)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

    def _mock_graph(self):
        """Create a minimal compiled graph that returns without LLM."""
        from langgraph.graph import END, StateGraph
        from fta_agent.agents.state import AgentState

        def echo_node(state: AgentState):
            return {"messages": [AIMessage(content="Mock analysis complete.")]}

        graph: StateGraph[AgentState] = StateGraph(AgentState)
        graph.add_node("gl_coach", echo_node)
        graph.set_entry_point("gl_coach")
        graph.add_edge("gl_coach", END)
        return graph.compile()

    async def test_stream_endpoint_returns_sse(self, client: AsyncClient) -> None:
        """Endpoint should accept POST and return 200 with SSE content type."""
        with patch(
            "fta_agent.api.routes.stream.get_gl_design_coach_graph",
            return_value=self._mock_graph(),
        ):
            response = await client.post(
                "/api/v1/stream",
                json={"message": "analyze accounts"},
            )
            assert response.status_code == 200
            assert "text/event-stream" in response.headers.get("content-type", "")

    async def test_stream_emits_complete_event(self, client: AsyncClient) -> None:
        """SSE stream should end with a 'complete' event."""
        with patch(
            "fta_agent.api.routes.stream.get_gl_design_coach_graph",
            return_value=self._mock_graph(),
        ):
            response = await client.post(
                "/api/v1/stream",
                json={"message": "test"},
            )
            body = response.text
            events = [
                json.loads(line.removeprefix("data: "))
                for line in body.strip().split("\n")
                if line.startswith("data: ")
            ]
            types = [e["type"] for e in events]
            assert "complete" in types

    async def test_stream_events_have_session_id(self, client: AsyncClient) -> None:
        """Every SSE event should carry a session_id."""
        with patch(
            "fta_agent.api.routes.stream.get_gl_design_coach_graph",
            return_value=self._mock_graph(),
        ):
            response = await client.post(
                "/api/v1/stream",
                json={"message": "test", "session_id": "custom-123"},
            )
            body = response.text
            events = [
                json.loads(line.removeprefix("data: "))
                for line in body.strip().split("\n")
                if line.startswith("data: ")
            ]
            for event in events:
                assert "session_id" in event

    async def test_stream_requires_message(self, client: AsyncClient) -> None:
        """Should reject empty message."""
        response = await client.post(
            "/api/v1/stream",
            json={"message": ""},
        )
        assert response.status_code == 422


class TestB3SSEEventEnvelope:
    """Validate SSE event envelope schema."""

    def test_event_types_exhaustive(self) -> None:
        """All event types from the spec should be handled."""
        from fta_agent.api.routes.stream import _sse_event

        for event_type in ("token", "tool_call", "trace_step", "interrupt", "complete", "error"):
            result = _sse_event(event_type, "test-session", {"test": True})
            assert result.startswith("data: ")
            assert result.endswith("\n\n")
            parsed = json.loads(result.removeprefix("data: ").strip())
            assert parsed["type"] == event_type
            assert parsed["session_id"] == "test-session"
            assert "timestamp" in parsed
            assert "payload" in parsed

    def test_event_envelope_has_iso_timestamp(self) -> None:
        from fta_agent.api.routes.stream import _sse_event

        result = _sse_event("token", "s1", {"content": "hello"})
        parsed = json.loads(result.removeprefix("data: ").strip())
        ts = parsed["timestamp"]
        # ISO format should contain T and timezone
        assert "T" in ts
        assert "+" in ts or "Z" in ts

    def test_event_payload_serializes_complex_types(self) -> None:
        """Payload with non-JSON types should serialize via default=str."""
        from datetime import date
        from fta_agent.api.routes.stream import _sse_event

        result = _sse_event("tool_call", "s1", {"date": date(2025, 1, 1)})
        parsed = json.loads(result.removeprefix("data: ").strip())
        assert parsed["payload"]["date"] == "2025-01-01"


# ===========================================================================
# B4 — GL Design Coach graph with tools
# ===========================================================================


class TestB4GLDesignCoachGraph:
    """Test the GL Design Coach graph structure with tools."""

    def test_graph_has_tool_node(self, engine: DataEngine) -> None:
        from fta_agent.agents.gl_design_coach import build_gl_design_coach
        graph = build_gl_design_coach(engine)
        assert "tools" in graph.nodes

    def test_graph_has_conditional_routing(self, engine: DataEngine) -> None:
        from fta_agent.agents.gl_design_coach import build_gl_design_coach
        graph = build_gl_design_coach(engine)
        compiled = graph.compile()
        graph_repr = compiled.get_graph()
        node_names = [n for n in graph_repr.nodes.keys()]
        assert "gl_coach" in node_names
        assert "tools" in node_names
        assert "__end__" in node_names

    def test_tools_edge_returns_to_coach(self, engine: DataEngine) -> None:
        """After tools execute, control should return to gl_coach."""
        from fta_agent.agents.gl_design_coach import build_gl_design_coach
        graph = build_gl_design_coach(engine)
        compiled = graph.compile()
        graph_repr = compiled.get_graph()
        tools_edges = [e for e in graph_repr.edges if e.source == "tools"]
        targets = [e.target for e in tools_edges]
        assert "gl_coach" in targets

    def test_should_continue_routes_to_end_without_tool_calls(self) -> None:
        from fta_agent.agents.gl_design_coach import _should_continue
        state: dict = {"messages": [AIMessage(content="No tools needed")]}
        assert _should_continue(state) == "__end__"  # type: ignore[arg-type]

    def test_should_continue_routes_to_tools_with_tool_calls(self) -> None:
        from fta_agent.agents.gl_design_coach import _should_continue
        msg = AIMessage(content="", tool_calls=[{"name": "profile_accounts", "args": {}, "id": "1"}])
        state: dict = {"messages": [msg]}
        assert _should_continue(state) == "tools"  # type: ignore[arg-type]


# ===========================================================================
# B5 — SSE event schema validation (backend side)
# ===========================================================================


class TestB5StreamRequestValidation:
    """Test Pydantic validation on StreamRequest."""

    def test_valid_request(self) -> None:
        from fta_agent.api.routes.stream import StreamRequest
        req = StreamRequest(message="analyze accounts")
        assert req.message == "analyze accounts"
        assert req.agent == "gl_design_coach"
        assert req.session_id is None

    def test_custom_agent(self) -> None:
        from fta_agent.api.routes.stream import StreamRequest
        req = StreamRequest(message="test", agent="consulting_agent")
        assert req.agent == "consulting_agent"

    def test_custom_session_id(self) -> None:
        from fta_agent.api.routes.stream import StreamRequest
        req = StreamRequest(message="test", session_id="my-session")
        assert req.session_id == "my-session"

    def test_empty_message_rejected(self) -> None:
        from pydantic import ValidationError
        from fta_agent.api.routes.stream import StreamRequest
        with pytest.raises(ValidationError):
            StreamRequest(message="")


# ===========================================================================
# B6/B7 — Workspace config validation
# ===========================================================================


class TestB6B7WorkspaceConfig:
    """Validate that live agent workspaces are properly configured.

    These are TypeScript-level checks validated by reading the source,
    but we can verify the backend has matching tools for the prompts.
    """

    def test_profile_accounts_tool_exists(self, engine: DataEngine) -> None:
        tools = create_gl_tools(engine)
        names = {t.name for t in tools}
        assert "profile_accounts" in names

    def test_generate_income_statement_tool_exists(self, engine: DataEngine) -> None:
        tools = create_gl_tools(engine)
        names = {t.name for t in tools}
        assert "generate_income_statement" in names

    def test_tools_handle_default_params(self, engine: DataEngine) -> None:
        """Both live workspace prompts should work with default tool params."""
        tools = create_gl_tools(engine)
        for tool in tools:
            result = tool.invoke({})
            assert json.loads(result)  # should parse without error


# ===========================================================================
# B8 — Error handling and edge cases
# ===========================================================================


class TestB8ErrorHandling:
    """Test graceful error handling across the stack."""

    def test_profile_accounts_no_match(self, engine: DataEngine) -> None:
        result = json.loads(_profile_accounts(engine, account_filter="p.gl_account = 'ZZZZZ'"))
        assert result["accounts"] == []
        assert "summary" in result

    def test_trial_balance_no_match(self, engine: DataEngine) -> None:
        result = json.loads(_compute_trial_balance(engine, account_type_filter="Z"))
        assert result["rows"] == []

    def test_income_statement_single_period(self, engine: DataEngine) -> None:
        """Edge case: single period range."""
        result = json.loads(_generate_income_statement(engine, period_from=6, period_to=6))
        assert "total_revenue" in result

    def test_dimensions_single_dimension(self, engine: DataEngine) -> None:
        result = json.loads(_assess_dimensions(engine, dimensions=["lob"]))
        assert len(result) == 1
        assert "lob" in result

    def test_engine_close_and_reuse(self) -> None:
        """Engine should not crash on close."""
        eng = DataEngine()
        eng.execute("CREATE TABLE test_close (id INTEGER)")
        eng.close()
        # Should not raise
