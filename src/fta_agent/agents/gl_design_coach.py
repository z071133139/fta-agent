"""GL Design Coach sub-agent graph.

Specialises in chart-of-accounts design, GL code-block structure,
and general ledger best practices for P&C insurance implementations.
Uses tools bound to the DataEngine for data analysis.
"""

from __future__ import annotations

from typing import Any, Literal

from langchain_core.messages import AIMessage, SystemMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from langgraph.prebuilt import ToolNode

from fta_agent.agents.prompts import build_system_prompt
from fta_agent.agents.state import AgentState
from fta_agent.data.engine import DataEngine
from fta_agent.llm.router import get_chat_model

GL_SYSTEM_PROMPT = build_system_prompt()


def _should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    """Route: if the last AI message has tool calls, go to tools. Else end."""
    messages = state["messages"]
    last = messages[-1]
    if isinstance(last, AIMessage) and last.tool_calls:
        return "tools"
    return "__end__"


def build_gl_design_coach(engine: DataEngine) -> StateGraph[AgentState]:
    """Build the GL Design Coach graph with tool-calling support."""
    from fta_agent.tools.gl_analysis import create_gl_tools

    tools = create_gl_tools(engine)
    llm = get_chat_model().bind_tools(tools)

    def gl_coach_node(state: AgentState) -> dict[str, Any]:
        """Invoke the LLM with tools bound."""
        messages = [SystemMessage(content=GL_SYSTEM_PROMPT), *state["messages"]]
        response = llm.invoke(messages)
        return {"messages": [response]}

    graph: StateGraph[AgentState] = StateGraph(AgentState)
    graph.add_node("gl_coach", gl_coach_node)
    graph.add_node("tools", ToolNode(tools))
    graph.set_entry_point("gl_coach")
    graph.add_conditional_edges("gl_coach", _should_continue)
    graph.add_edge("tools", "gl_coach")
    return graph


def get_gl_design_coach_graph(engine: DataEngine | None = None) -> CompiledStateGraph:  # type: ignore[type-arg]
    """Return a compiled GL Design Coach graph.

    If engine is None, builds a stub graph without tools (for registry import).
    """
    if engine is None:
        # Stub for registry — will be replaced at runtime with engine
        graph: StateGraph[AgentState] = StateGraph(AgentState)

        def stub_node(state: AgentState) -> dict[str, Any]:
            llm = get_chat_model()
            messages = [SystemMessage(content=GL_SYSTEM_PROMPT), *state["messages"]]
            response = llm.invoke(messages)
            return {"messages": [response]}

        graph.add_node("gl_coach", stub_node)
        graph.set_entry_point("gl_coach")
        graph.add_edge("gl_coach", END)
        return graph.compile()

    return build_gl_design_coach(engine).compile()
