from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class DeliverableStatus(StrEnum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    COMPLETE = "complete"
    BLOCKED = "blocked"


class Deliverable(BaseModel):
    deliverable_id: str = Field(..., description="Unique identifier for this deliverable")
    name: str = Field(..., min_length=1, description="Deliverable display name")
    status: DeliverableStatus = Field(
        default=DeliverableStatus.NOT_STARTED,
        description="Current status of the deliverable",
    )
    owner_agent: str | None = Field(
        default=None,
        description="Agent responsible: consulting_agent | gl_design_coach | functional_consultant",
    )
    in_scope: bool = Field(
        default=True,
        description="Whether this deliverable is in scope for the engagement",
    )


class Workstream(BaseModel):
    workstream_id: str = Field(..., description="Unique identifier for this workstream")
    name: str = Field(..., min_length=1, description="Workstream display name")
    deliverables: list[Deliverable] = Field(default_factory=list)


class Workplan(BaseModel):
    workplan_id: str = Field(..., description="Unique identifier for this workplan")
    engagement_id: str = Field(..., description="Engagement this workplan belongs to")
    workstreams: list[Workstream] = Field(default_factory=list)
    created_at: datetime = Field(..., description="When this workplan was created")
