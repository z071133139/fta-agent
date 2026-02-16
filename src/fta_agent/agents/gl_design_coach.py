"""GL Design Coach sub-agent graph.

Specialises in chart-of-accounts design, GL code-block structure,
and general ledger best practices.
"""

from __future__ import annotations

from langchain_core.messages import AIMessage, SystemMessage
from langgraph.graph import END, StateGraph

from fta_agent.agents.state import AgentState
from fta_agent.llm.router import get_chat_model

GL_SYSTEM_PROMPT = (
    "You are an expert GL Design Coach specialising in chart-of-accounts "
    "design, GL code-block structure, segment design, and general ledger "
    "best practices for mid-market and enterprise ERP implementations. "
    "Give concise, actionable advice."
)


def gl_coach_node(state: AgentState) -> AgentState:
    """Invoke the LLM with the GL Design Coach system prompt."""
    llm = get_chat_model()
    messages = [SystemMessage(content=GL_SYSTEM_PROMPT), *state["messages"]]
    response = llm.invoke(messages)
    return {"messages": [response]}


def build_gl_design_coach() -> StateGraph:
    """Build and return the GL Design Coach sub-agent graph."""
    graph = StateGraph(AgentState)
    graph.add_node("gl_coach", gl_coach_node)
    graph.set_entry_point("gl_coach")
    graph.add_edge("gl_coach", END)
    return graph


def get_gl_design_coach_graph():
    """Return a compiled GL Design Coach graph."""
    return build_gl_design_coach().compile()
