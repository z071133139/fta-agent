"""Tests for agent graph structure and registry (no LLM calls)."""

from __future__ import annotations

from fta_agent.agents.consulting_agent import build_consulting_agent
from fta_agent.agents.gl_design_coach import build_gl_design_coach
from fta_agent.agents.functional_consultant import build_functional_consultant
from fta_agent.agents.registry import (
    AGENT_REGISTRY,
    agent_descriptions_for_router,
    get_agent,
)
from fta_agent.agents.state import AgentState, ConsultantContext, EngagementMeta


class TestGLDesignCoach:
    def test_graph_builds(self) -> None:
        graph = build_gl_design_coach()
        assert graph.compile() is not None

    def test_graph_has_gl_coach_node(self) -> None:
        graph = build_gl_design_coach()
        assert "gl_coach" in graph.nodes


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
        # Validate the pattern: registry is the single source of truth
        # If someone adds to AGENT_REGISTRY, the graph automatically includes it
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
