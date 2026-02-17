"""GL Design Coach sub-agent graph.

Specialises in chart-of-accounts design, GL code-block structure,
and general ledger best practices for P&C insurance implementations.
Uses the assembled domain prompt from the prompts package.
"""

from __future__ import annotations

from typing import Any

from langchain_core.messages import SystemMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph

from fta_agent.agents.prompts import build_system_prompt
from fta_agent.agents.state import AgentState
from fta_agent.llm.router import get_chat_model

GL_SYSTEM_PROMPT = build_system_prompt()


def gl_coach_node(state: AgentState) -> dict[str, Any]:
    """Invoke the LLM with the GL Design Coach system prompt."""
    llm = get_chat_model()
    messages = [SystemMessage(content=GL_SYSTEM_PROMPT), *state["messages"]]
    response = llm.invoke(messages)
    return {"messages": [response]}


def build_gl_design_coach() -> StateGraph[AgentState]:
    """Build and return the GL Design Coach sub-agent graph."""
    graph = StateGraph(AgentState)
    graph.add_node("gl_coach", gl_coach_node)
    graph.set_entry_point("gl_coach")
    graph.add_edge("gl_coach", END)
    return graph


def get_gl_design_coach_graph() -> CompiledStateGraph:  # type: ignore[type-arg]
    """Return a compiled GL Design Coach graph."""
    return build_gl_design_coach().compile()
