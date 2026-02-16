"""Consulting Agent -- supervisor graph that routes to specialist sub-agents.

Uses keyword-based routing in the skeleton (deterministic, testable without
LLM tokens). Will be swapped to LLM-based routing later.
"""

from __future__ import annotations

import re
from typing import Any

from langchain_core.messages import HumanMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph

from fta_agent.agents.gl_design_coach import gl_coach_node
from fta_agent.agents.state import AgentState
from fta_agent.llm.router import get_chat_model

# Keywords that route to the GL Design Coach
_GL_KEYWORDS = re.compile(
    r"\b(gl|general\s+ledger|coa|chart\s+of\s+accounts"
    r"|code\s*block|segment\s+design)\b",
    re.IGNORECASE,
)


def route_message(state: AgentState) -> str:
    """Determine which specialist to route to based on the last user message."""
    messages = state.get("messages", [])
    last_human = ""
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            last_human = msg.content if isinstance(msg.content, str) else ""
            break
    if _GL_KEYWORDS.search(last_human):
        return "gl_coach"
    return "general"


def general_node(state: AgentState) -> dict[str, Any]:
    """Handle general queries that don't match a specialist."""
    llm = get_chat_model()
    response = llm.invoke(state["messages"])
    return {"messages": [response]}


def build_consulting_agent() -> StateGraph[AgentState]:
    """Build and return the Consulting Agent supervisor graph."""
    graph = StateGraph(AgentState)

    graph.add_node("gl_coach", gl_coach_node)
    graph.add_node("general", general_node)

    graph.set_conditional_entry_point(
        route_message,
        {"gl_coach": "gl_coach", "general": "general"},
    )

    graph.add_edge("gl_coach", END)
    graph.add_edge("general", END)

    return graph


def get_consulting_agent_graph() -> CompiledStateGraph:  # type: ignore[type-arg]
    """Return a compiled Consulting Agent graph."""
    return build_consulting_agent().compile()
