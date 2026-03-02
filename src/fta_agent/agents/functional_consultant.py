"""Functional Consultant agent — process flow builder.

Tool-calling graph with emit_process_flow for NLP-driven process flow
creation. Uses the same LangGraph pattern as GL Design Coach.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Literal

from langchain_core.messages import AIMessage, SystemMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from langgraph.prebuilt import ToolNode

from fta_agent.agents.state import AgentState
from fta_agent.llm.router import get_chat_model
from fta_agent.tools.process_flow_tools import create_process_flow_tools

logger = logging.getLogger(__name__)

# Load system prompt from markdown file
_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "functional_consultant_flow.md"
FC_SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")


def _should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    """Route: if the last AI message has tool calls, go to tools. Else end."""
    messages = state["messages"]
    last = messages[-1]
    if isinstance(last, AIMessage) and last.tool_calls:
        return "tools"
    return "__end__"


def build_functional_consultant() -> StateGraph[AgentState]:
    """Build the Functional Consultant graph with tool-calling support."""
    tools = create_process_flow_tools()
    llm = get_chat_model().bind_tools(tools)

    def fc_node(state: AgentState) -> dict[str, Any]:
        """Invoke the LLM with tools bound."""
        messages = [SystemMessage(content=FC_SYSTEM_PROMPT), *state["messages"]]
        response = llm.invoke(messages)
        return {"messages": [response]}

    graph: StateGraph[AgentState] = StateGraph(AgentState)
    graph.add_node("functional_consultant", fc_node)
    graph.add_node("tools", ToolNode(tools))
    graph.set_entry_point("functional_consultant")
    graph.add_conditional_edges("functional_consultant", _should_continue)
    graph.add_edge("tools", "functional_consultant")
    return graph


def get_functional_consultant_graph() -> CompiledStateGraph:  # type: ignore[type-arg]
    """Return a compiled Functional Consultant graph."""
    return build_functional_consultant().compile()
