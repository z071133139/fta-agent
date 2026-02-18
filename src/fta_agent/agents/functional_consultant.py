"""Functional Consultant agent — stub.

Full implementation in Iteration 1.5B. This stub provides a runnable
graph so the registry and routing infrastructure work end-to-end.
"""

from __future__ import annotations

from typing import Any

from langchain_core.messages import SystemMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph

from fta_agent.agents.state import AgentState
from fta_agent.llm.router import get_chat_model

_STUB_PROMPT = """You are the Functional Consultant on a finance transformation engagement.
You handle requirements capture, process flow documentation, and deliverable generation.

This agent is under construction. For now, respond helpfully to any requirements or
process documentation questions using your general knowledge."""


def functional_consultant_node(state: AgentState) -> dict[str, Any]:
    """Invoke the LLM with the Functional Consultant system prompt."""
    llm = get_chat_model()
    messages = [SystemMessage(content=_STUB_PROMPT), *state["messages"]]
    response = llm.invoke(messages)
    return {"messages": [response]}


def build_functional_consultant() -> StateGraph[AgentState]:
    """Build and return the Functional Consultant graph."""
    graph: StateGraph[AgentState] = StateGraph(AgentState)
    graph.add_node("functional_consultant", functional_consultant_node)
    graph.set_entry_point("functional_consultant")
    graph.add_edge("functional_consultant", END)
    return graph


def get_functional_consultant_graph() -> CompiledStateGraph:  # type: ignore[type-arg]
    """Return a compiled Functional Consultant graph."""
    return build_functional_consultant().compile()
