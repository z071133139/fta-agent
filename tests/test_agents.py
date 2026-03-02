"""Tests for agent graph structure and registry (no LLM calls)."""

from __future__ import annotations

from fta_agent.agents.consulting_agent import build_consulting_agent
from fta_agent.agents.gl_design_coach import build_gl_design_coach, get_gl_design_coach_graph
from fta_agent.agents.functional_consultant import build_functional_consultant
from fta_agent.agents.registry import (
    AGENT_REGISTRY,
    agent_descriptions_for_router,
    get_agent,
)
from fta_agent.agents.state import AgentState, ConsultantContext, EngagementMeta
from fta_agent.data.engine import DataEngine
from fta_agent.data.loader import load_fixture


class TestGLDesignCoach:
    def test_graph_builds_with_engine(self) -> None:
        engine = DataEngine()
        load_fixture(engine)
        graph = build_gl_design_coach(engine)
        compiled = graph.compile()
        assert compiled is not None
        engine.close()

    def test_graph_has_gl_coach_and_tools_nodes(self) -> None:
        engine = DataEngine()
        load_fixture(engine)
        graph = build_gl_design_coach(engine)
        assert "gl_coach" in graph.nodes
        assert "tools" in graph.nodes
        engine.close()

    def test_stub_graph_builds_without_engine(self) -> None:
        """Registry can build a stub graph without data."""
        graph = get_gl_design_coach_graph(engine=None)
        assert graph is not None
        nodes = list(graph.get_graph().nodes.keys())
        assert "gl_coach" in nodes

    def test_graph_has_conditional_edge(self) -> None:
        """gl_coach should route to tools or __end__."""
        engine = DataEngine()
        load_fixture(engine)
        graph = build_gl_design_coach(engine)
        compiled = graph.compile()
        graph_repr = compiled.get_graph()
        # gl_coach should have edges (conditional routing)
        gl_coach_edges = [
            e for e in graph_repr.edges
            if e.source == "gl_coach"
        ]
        assert len(gl_coach_edges) > 0
        engine.close()


class TestFunctionalConsultant:
    def test_graph_builds(self) -> None:
        graph = build_functional_consultant()
        assert graph.compile() is not None

    def test_graph_has_node(self) -> None:
        graph = build_functional_consultant()
        assert "functional_consultant" in graph.nodes


class TestConsultingAgent:
    def test_graph_builds(self) -> None:
        graph = build_consulting_agent()
        assert graph.compile() is not None

    def test_graph_has_all_registry_agents(self) -> None:
        graph = build_consulting_agent()
        for name in AGENT_REGISTRY:
            assert name in graph.nodes, f"Missing node: {name}"

    def test_graph_has_no_legacy_nodes(self) -> None:
        graph = build_consulting_agent()
        assert "gl_coach" not in graph.nodes
        assert "general" not in graph.nodes


class TestAgentRegistry:
    def test_all_expected_agents_registered(self) -> None:
        assert "consulting_agent" in AGENT_REGISTRY
        assert "gl_design_coach" in AGENT_REGISTRY
        assert "functional_consultant" in AGENT_REGISTRY

    def test_get_agent_returns_definition(self) -> None:
        defn = get_agent("gl_design_coach")
        assert defn.name == "gl_design_coach"
        assert defn.description
        assert defn.graph_factory is not None

    def test_exclusive_tools_declared(self) -> None:
        gl = get_agent("gl_design_coach")
        assert "ingest_gl_data" in gl.exclusive_tools
        assert "run_mje_detection" in gl.exclusive_tools

    def test_non_exclusive_agents_have_no_locks(self) -> None:
        assert get_agent("consulting_agent").exclusive_tools == []
        assert get_agent("functional_consultant").exclusive_tools == []

    def test_router_descriptions_include_all_agents(self) -> None:
        descriptions = agent_descriptions_for_router()
        for name in AGENT_REGISTRY:
            assert name in descriptions

    def test_adding_agent_requires_one_entry(self) -> None:
        original_count = len(AGENT_REGISTRY)
        graph = build_consulting_agent()
        assert len(graph.nodes) == original_count


class TestAgentState:
    def test_state_has_required_keys(self) -> None:
        keys = set(AgentState.__annotations__.keys())
        assert "messages" in keys
        assert "consultant" in keys
        assert "engagement" in keys
        assert "active_agent" in keys
        assert "last_tool_results" in keys

    def test_consultant_context_shape(self) -> None:
        keys = set(ConsultantContext.__annotations__.keys())
        assert {"consultant_id", "display_name", "role"} == keys

    def test_engagement_meta_shape(self) -> None:
        keys = set(EngagementMeta.__annotations__.keys())
        assert {"engagement_id", "client_name", "sub_segment", "erp_target", "phase"} == keys
