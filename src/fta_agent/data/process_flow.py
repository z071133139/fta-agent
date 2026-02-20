from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field


class ProcessOverlay(BaseModel):
    id: str = Field(..., description="Unique overlay identifier")
    node_id: str = Field(..., description="ID of the process node this overlay is attached to")
    kind: Literal["constraint", "requirement", "exception", "risk"] = Field(
        ..., description="Overlay type"
    )
    text: str = Field(..., min_length=1, description="Overlay content")
    source: Literal["agent_elicited", "gl_finding", "consultant"] = Field(
        ..., description="How this overlay was generated"
    )


class ProcessFlowNode(BaseModel):
    id: str = Field(..., description="Unique node identifier")
    type: Literal[
        "task", "gateway_exclusive", "gateway_parallel", "start", "end", "subprocess"
    ] = Field(..., description="BPMN node type")
    label: str = Field(..., min_length=1, description="Display label")
    role: str | None = Field(default=None, description="Swimlane / lane assignment")
    system: str | None = Field(default=None, description="System that executes this step")
    status: Literal["leading_practice", "client_overlay", "gap"] | None = Field(
        default=None, description="Design status relative to leading practice"
    )


class ProcessFlowEdge(BaseModel):
    id: str
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    condition: str | None = None
    label: str | None = None


class ProcessFlow(BaseModel):
    kind: Literal["process_flow"] = "process_flow"
    name: str = Field(..., min_length=1, description="Process map display name")
    swimlanes: list[str] = Field(
        default_factory=list, description="Ordered swimlane names"
    )
    nodes: list[ProcessFlowNode]
    edges: list[ProcessFlowEdge]
    overlays: list[ProcessOverlay] = Field(default_factory=list)


class ProcessInventoryNode(BaseModel):
    id: str
    name: str = Field(..., min_length=1)
    scope_status: Literal[
        "in_scope", "out_of_scope", "in_progress", "complete", "deferred"
    ]
    owner_agent: str | None = None
    sub_flow_count: int = Field(default=0, ge=0)
    process_area: str | None = None
    description: str | None = None


class ProcessInventoryEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str | None = None


class ProcessInventory(BaseModel):
    kind: Literal["process_inventory"] = "process_inventory"
    nodes: list[ProcessInventoryNode]
    edges: list[ProcessInventoryEdge]


# Discriminated union — use kind field for deserialization
ProcessGraph = Annotated[
    Union[ProcessFlow, ProcessInventory],
    Field(discriminator="kind"),
]
