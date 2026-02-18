"""Shared agent state definition."""

from __future__ import annotations

from typing import Annotated, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class ConsultantContext(TypedDict):
    """Identity of the authenticated consultant running this session."""

    consultant_id: str
    display_name: str
    role: str  # "consultant" | "senior" | "admin"


class EngagementMeta(TypedDict):
    """Metadata for the active engagement."""

    engagement_id: str
    client_name: str
    sub_segment: str   # "P&C" | "Life" | "Reinsurance"
    erp_target: str    # "SAP" | "Oracle" | "Workday"
    phase: str         # discovery | current_state | design | build | test | cutover


class AgentState(TypedDict):
    """State shared across all agents in the FTA system.

    Strict separation:
    - messages / active_agent / last_tool_results: workflow state (LangGraph owns)
    - consultant / engagement: domain context (read from Supabase on session start)
    """

    messages: Annotated[list[BaseMessage], add_messages]
    consultant: ConsultantContext
    engagement: EngagementMeta
    active_agent: str             # name of the currently active agent
    last_tool_results: list[str]  # human-readable summaries of last tool outputs
