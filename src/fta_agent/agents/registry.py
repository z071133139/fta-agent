"""Agent registry — the single source of truth for all FTA agents.

Adding a new agent = one new AgentDefinition entry in AGENT_REGISTRY.
The LLM router, handoff protocol, and CLI all read from this registry.
No hardcoded agent names anywhere else in the routing logic.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Callable

if TYPE_CHECKING:
    from langgraph.graph.state import CompiledStateGraph


@dataclass
class AgentDefinition:
    """Declaration of a single FTA agent."""

    name: str
    description: str
    """Used verbatim in the LLM router prompt — describe what this agent handles."""

    graph_factory: Callable[[], CompiledStateGraph]  # type: ignore[type-arg]
    """Zero-arg callable that returns a compiled LangGraph graph."""

    exclusive_tools: list[str] = field(default_factory=list)
    """Tool names that require a per-engagement lock before execution."""

    persona: str = ""
    """One-sentence persona description shown to the consultant on first open."""


def _get_consulting_agent() -> CompiledStateGraph:  # type: ignore[type-arg]
    from fta_agent.agents.consulting_agent import get_consulting_agent_graph
    return get_consulting_agent_graph()


def _get_gl_design_coach() -> CompiledStateGraph:  # type: ignore[type-arg]
    from fta_agent.agents.gl_design_coach import get_gl_design_coach_graph
    return get_gl_design_coach_graph()


def _get_functional_consultant() -> CompiledStateGraph:  # type: ignore[type-arg]
    # Stub — full graph built in Iteration 1.5B
    from fta_agent.agents.functional_consultant import get_functional_consultant_graph
    return get_functional_consultant_graph()


AGENT_REGISTRY: dict[str, AgentDefinition] = {
    "consulting_agent": AgentDefinition(
        name="consulting_agent",
        description=(
            "Engagement management, workplan, status updates, decision registry, "
            "open items tracking, PMO questions, what needs to happen next, "
            "timeline, blockers, cross-workstream coordination."
        ),
        graph_factory=_get_consulting_agent,
        exclusive_tools=[],
        persona="Engagement lead and PMO for this finance transformation.",
    ),
    "gl_design_coach": AgentDefinition(
        name="gl_design_coach",
        description=(
            "GL account analysis, MJE detection and pattern analysis, code block "
            "dimension design, chart of accounts construction, SAP S/4HANA "
            "configuration, P&C insurance accounting, ACDOCA dimensions, "
            "profit center, segment, functional area, document splitting, "
            "NAIC, loss reserves, reinsurance, COA mapping."
        ),
        graph_factory=_get_gl_design_coach,
        exclusive_tools=["ingest_gl_data", "run_account_profiling", "run_mje_detection"],
        persona="P&C insurance GL and COA design specialist for SAP S/4HANA.",
    ),
    "functional_consultant": AgentDefinition(
        name="functional_consultant",
        description=(
            "Requirements capture and structuring, process flow documentation, "
            "business requirements, user stories, current state process mapping, "
            "future state design, deliverable generation, PowerPoint decks, "
            "workshop preparation, stakeholder documentation."
        ),
        graph_factory=_get_functional_consultant,
        exclusive_tools=[],
        persona="Generalist consultant handling requirements, process, and deliverables.",
    ),
}


def get_agent(name: str) -> AgentDefinition:
    """Return an agent definition by name. Raises KeyError if not found."""
    return AGENT_REGISTRY[name]


def agent_descriptions_for_router() -> str:
    """Format all agent descriptions for injection into the LLM router prompt."""
    lines = []
    for name, defn in AGENT_REGISTRY.items():
        lines.append(f"- {name}: {defn.description}")
    return "\n".join(lines)
