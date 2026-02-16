"""Tests for agent graph structure and routing logic (no LLM calls)."""

from langchain_core.messages import HumanMessage

from fta_agent.agents.consulting_agent import build_consulting_agent, route_message
from fta_agent.agents.gl_design_coach import build_gl_design_coach


class TestGLDesignCoach:
    def test_graph_builds(self):
        graph = build_gl_design_coach()
        compiled = graph.compile()
        assert compiled is not None

    def test_graph_has_gl_coach_node(self):
        graph = build_gl_design_coach()
        assert "gl_coach" in graph.nodes


class TestConsultingAgent:
    def test_graph_builds(self):
        graph = build_consulting_agent()
        compiled = graph.compile()
        assert compiled is not None

    def test_graph_has_expected_nodes(self):
        graph = build_consulting_agent()
        assert "gl_coach" in graph.nodes
        assert "general" in graph.nodes


class TestRouting:
    def test_routes_to_gl_on_gl_keyword(self):
        state = {"messages": [HumanMessage(content="Help me design a GL structure")]}
        assert route_message(state) == "gl_coach"

    def test_routes_to_gl_on_coa_keyword(self):
        state = {"messages": [HumanMessage(content="What's a good COA for SaaS?")]}
        assert route_message(state) == "gl_coach"

    def test_routes_to_gl_on_chart_of_accounts(self):
        state = {
            "messages": [
                HumanMessage(content="Design a chart of accounts for manufacturing")
            ]
        }
        assert route_message(state) == "gl_coach"

    def test_routes_to_gl_on_code_block(self):
        state = {
            "messages": [
                HumanMessage(content="How should I set up code block segments?")
            ]
        }
        assert route_message(state) == "gl_coach"

    def test_routes_to_general_on_unrelated(self):
        state = {"messages": [HumanMessage(content="What is cloud computing?")]}
        assert route_message(state) == "general"

    def test_routes_to_general_on_empty(self):
        state = {"messages": []}
        assert route_message(state) == "general"
