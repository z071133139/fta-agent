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

    # --- Expanded routing tests for Iteration 1 keywords ---

    def test_routes_on_profit_center(self):
        state = {
            "messages": [
                HumanMessage(content="What should our profit center represent?")
            ]
        }
        assert route_message(state) == "gl_coach"

    def test_routes_on_functional_area(self):
        state = {
            "messages": [
                HumanMessage(
                    content="How do functional areas work in SAP?"
                )
            ]
        }
        assert route_message(state) == "gl_coach"

    def test_routes_on_loss_reserves(self):
        state = {
            "messages": [
                HumanMessage(
                    content="How should we structure our loss reserve accounts?"
                )
            ]
        }
        assert route_message(state) == "gl_coach"

    def test_routes_on_ibnr(self):
        state = {
            "messages": [
                HumanMessage(content="We need to track IBNR by LOB.")
            ]
        }
        assert route_message(state) == "gl_coach"

    def test_routes_on_reinsurance(self):
        state = {
            "messages": [
                HumanMessage(
                    content="How do we handle reinsurance in the COA?"
                )
            ]
        }
        assert route_message(state) == "gl_coach"

    def test_routes_on_naic(self):
        state = {
            "messages": [
                HumanMessage(
                    content="Our NAIC annual statement reporting needs improvement."
                )
            ]
        }
        assert route_message(state) == "gl_coach"

    def test_routes_on_target_coa(self):
        state = {
            "messages": [
                HumanMessage(
                    content="Let's design the target COA for our merger."
                )
            ]
        }
        assert route_message(state) == "gl_coach"

    def test_routes_on_mje(self):
        state = {
            "messages": [
                HumanMessage(
                    content="We have too many manual journal entries."
                )
            ]
        }
        assert route_message(state) == "gl_coach"

    def test_routes_on_document_splitting(self):
        state = {
            "messages": [
                HumanMessage(
                    content="How does document splitting work for insurance?"
                )
            ]
        }
        assert route_message(state) == "gl_coach"

    def test_routes_on_accident_year(self):
        state = {
            "messages": [
                HumanMessage(
                    content="Should accident year be on the code block?"
                )
            ]
        }
        assert route_message(state) == "gl_coach"

    # Negative tests

    def test_does_not_route_general_question(self):
        state = {
            "messages": [
                HumanMessage(
                    content="What is the weather forecast for tomorrow?"
                )
            ]
        }
        assert route_message(state) == "general"

    def test_does_not_route_generic_finance(self):
        state = {
            "messages": [
                HumanMessage(
                    content="What are the best practices for budgeting?"
                )
            ]
        }
        assert route_message(state) == "general"
