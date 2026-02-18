"""Consulting Agent — orchestrator and engagement lead.

Routes incoming messages to the correct specialist agent using an LLM
classifier. Reads available agents from the registry — adding a new agent
requires no changes here.
"""

from __future__ import annotations

from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from pydantic import BaseModel

from fta_agent.agents.registry import AGENT_REGISTRY, agent_descriptions_for_router
from fta_agent.agents.state import AgentState
from fta_agent.llm.router import get_chat_model

# ── Routing ───────────────────────────────────────────────────────────────

_ROUTER_SYSTEM = """\
You are a routing classifier for a finance transformation consulting system.
Given a consultant's message, decide which agent should handle it.

Available agents:
{agent_descriptions}

Respond with ONLY the agent name — one of: {agent_names}.
No explanation. No punctuation. Just the agent name.

If the message is ambiguous or general, route to: consulting_agent.
"""

_ROUTER_HUMAN = "Message: {message}"


class RouteDecision(BaseModel):
    target_agent: str
    confidence: float  # 0.0–1.0


def _extract_agent_name(raw: str) -> str:
    """Parse the raw LLM output into a valid agent name."""
    cleaned = raw.strip().lower().replace("-", "_")
    if cleaned in AGENT_REGISTRY:
        return cleaned
    # Fuzzy: check if any registry key is a substring
    for key in AGENT_REGISTRY:
        if key in cleaned:
            return key
    return "consulting_agent"  # safe fallback


async def route_message(state: AgentState) -> str:
    """Use a lightweight LLM call to classify intent and return the target agent name."""
    messages = state.get("messages", [])
    last_human = ""
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            last_human = msg.content if isinstance(msg.content, str) else ""
            break

    if not last_human:
        return "consulting_agent"

    agent_names = " | ".join(AGENT_REGISTRY.keys())
    prompt = ChatPromptTemplate.from_messages([
        ("system", _ROUTER_SYSTEM),
        ("human", _ROUTER_HUMAN),
    ])

    # Use Haiku for routing — fast and cheap
    llm = get_chat_model("claude-haiku-4-5-20251001")
    chain = prompt | llm | StrOutputParser()

    raw = await chain.ainvoke({
        "agent_descriptions": agent_descriptions_for_router(),
        "agent_names": agent_names,
        "message": last_human,
    })

    return _extract_agent_name(raw)


# ── Agent nodes ───────────────────────────────────────────────────────────

def _make_agent_node(agent_name: str):
    """Return a LangGraph node function that invokes the named agent's graph."""
    def node(state: AgentState) -> dict[str, Any]:
        defn = AGENT_REGISTRY[agent_name]
        graph = defn.graph_factory()
        result = graph.invoke(state)
        return {"messages": result["messages"], "active_agent": agent_name}
    node.__name__ = agent_name
    return node


def _make_consulting_node() -> Any:
    """The Consulting Agent handles messages that aren't routed to a specialist."""
    def node(state: AgentState) -> dict[str, Any]:
        llm = get_chat_model()
        system = SystemMessage(content=(
            "You are the Consulting Agent on a finance transformation engagement. "
            "You manage the engagement plan, track decisions and open items, "
            "synthesise status, and coordinate between specialist agents. "
            "Be concise, direct, and practical."
        ))
        response = llm.invoke([system, *state["messages"]])
        return {"messages": [response], "active_agent": "consulting_agent"}
    return node


# ── Graph ─────────────────────────────────────────────────────────────────

def build_consulting_agent() -> StateGraph[AgentState]:
    """Build the Consulting Agent supervisor graph from the registry."""
    graph: StateGraph[AgentState] = StateGraph(AgentState)

    # Consulting Agent handles its own messages
    graph.add_node("consulting_agent", _make_consulting_node())

    # Register all specialist agents from the registry
    for name, defn in AGENT_REGISTRY.items():
        if name == "consulting_agent":
            continue
        graph.add_node(name, _make_agent_node(name))

    # Conditional entry: LLM router decides the first node
    route_map = {name: name for name in AGENT_REGISTRY}
    graph.set_conditional_entry_point(route_message, route_map)

    # All nodes return to END (single-turn; multi-turn handled by checkpointer)
    for name in AGENT_REGISTRY:
        graph.add_edge(name, END)

    return graph


def get_consulting_agent_graph() -> CompiledStateGraph:  # type: ignore[type-arg]
    """Return a compiled Consulting Agent graph."""
    return build_consulting_agent().compile()
