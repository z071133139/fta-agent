"""Process flow generation tools for the Functional Consultant agent.

Provides the `emit_process_flow` tool that outputs validated ProcessFlowData
as a structured tool call (not inline JSON). The frontend receives this via
SSE tool_call events and renders it in the ProcessFlowMap preview.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from langchain_core.tools import tool
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# ── Pydantic schemas matching frontend ProcessFlowData ───────────────────────


class ProcessOverlay(BaseModel):
    """An annotation overlay on a process flow node."""

    id: str = Field(..., description="Unique overlay ID (e.g. 'ov-001')")
    node_id: str = Field(..., description="ID of the node this overlay annotates")
    kind: str = Field(
        ...,
        description="Type of overlay: 'constraint', 'requirement', 'exception', or 'risk'",
    )
    text: str = Field(..., description="Description of the overlay finding")
    source: str = Field(
        default="agent_elicited",
        description="Source: 'agent_elicited', 'gl_finding', or 'consultant'",
    )


class ProcessFlowNode(BaseModel):
    """A node in a BPMN-style process flow."""

    id: str = Field(..., description="Unique node ID (e.g. 'n-001')")
    type: str = Field(
        ...,
        description="Node type: 'start', 'end', 'task', 'gateway', 'subprocess'",
    )
    label: str = Field(..., description="Display label for the node")
    role: str | None = Field(
        default=None,
        description="Swimlane role this node belongs to (must match a swimlane name)",
    )
    system: str | None = Field(
        default=None,
        description="System involved (e.g. 'SAP', 'Excel', 'Email')",
    )
    status: str | None = Field(
        default=None,
        description="Node status: 'leading_practice', 'client_overlay', or 'gap'",
    )


class ProcessFlowEdge(BaseModel):
    """A directed edge connecting two process flow nodes."""

    id: str = Field(..., description="Unique edge ID (e.g. 'e-001')")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    condition: str | None = Field(
        default=None,
        description="Condition label for gateway branches (e.g. 'Yes', 'No', 'Approved')",
    )
    label: str | None = Field(
        default=None,
        description="Optional edge label",
    )


class ProcessFlowOutput(BaseModel):
    """Complete process flow data structure matching the frontend ProcessFlowData type."""

    kind: str = Field(default="process_flow", description="Always 'process_flow'")
    name: str = Field(..., description="Name of the process flow")
    swimlanes: list[str] = Field(
        ...,
        description="Ordered list of swimlane (role) names, top to bottom",
    )
    nodes: list[ProcessFlowNode] = Field(..., description="All nodes in the flow")
    edges: list[ProcessFlowEdge] = Field(..., description="All edges connecting nodes")
    overlays: list[ProcessOverlay] = Field(
        default_factory=list,
        description="Overlay annotations on nodes (constraints, risks, etc.)",
    )


@tool("emit_process_flow", args_schema=ProcessFlowOutput)
def emit_process_flow(
    kind: str,
    name: str,
    swimlanes: list[str],
    nodes: list[ProcessFlowNode | dict[str, Any]],
    edges: list[ProcessFlowEdge | dict[str, Any]],
    overlays: list[ProcessOverlay | dict[str, Any]] | None = None,
) -> str:
    """Emit a validated process flow that renders as a swimlane diagram.

    Call this tool whenever you have enough information to create or update
    a process flow. The output will be displayed as a live preview to the
    consultant. You can call this multiple times to refine the flow.

    Guidelines for creating good process flows:
    - Always include 'start' and 'end' nodes
    - Each task node MUST have a 'role' matching one of the swimlanes
    - Use gateway nodes for decision points with condition labels on edges
    - Keep node labels concise (5-10 words)
    - Connect all nodes — no orphans
    - Order swimlanes by organizational hierarchy or process sequence
    """
    # LangChain may pass pre-validated Pydantic models or raw dicts
    def _coerce_node(n: ProcessFlowNode | dict[str, Any]) -> ProcessFlowNode:
        return n if isinstance(n, ProcessFlowNode) else ProcessFlowNode(**n)

    def _coerce_edge(e: ProcessFlowEdge | dict[str, Any]) -> ProcessFlowEdge:
        return e if isinstance(e, ProcessFlowEdge) else ProcessFlowEdge(**e)

    def _coerce_overlay(o: ProcessOverlay | dict[str, Any]) -> ProcessOverlay:
        return o if isinstance(o, ProcessOverlay) else ProcessOverlay(**o)

    output = ProcessFlowOutput(
        kind="process_flow",
        name=name,
        swimlanes=swimlanes,
        nodes=[_coerce_node(n) for n in nodes],
        edges=[_coerce_edge(e) for e in edges],
        overlays=[_coerce_overlay(o) for o in (overlays or [])],
    )

    return output.model_dump_json()


def create_process_flow_tools() -> list[Any]:
    """Return the list of process flow tools for the Functional Consultant."""
    return [emit_process_flow]
