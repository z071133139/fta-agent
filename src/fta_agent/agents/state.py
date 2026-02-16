"""Shared agent state definition."""

from __future__ import annotations

from typing import Annotated, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """State shared by parent and child agent graphs.

    Using `add_messages` reducer so that both the supervisor and sub-agents
    append to the same message list.
    """

    messages: Annotated[list[BaseMessage], add_messages]
