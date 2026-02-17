# Functional Consultant (Layer 1 -- Generalist Agent)

> Status: Scoping (Session 006)
> Created: 2026-02-16

## Overview

The Functional Consultant is the generalist on the consulting team. It handles cross-cutting work that isn't domain-specific: requirements capture, process documentation, and deliverable generation. It works alongside the GL Design Coach (and future domain specialists) and shares the engagement context with all agents.

The Functional Consultant is the agent a business analyst uses daily. It speaks in process and requirements language, not accounting or SAP jargon.

## Role

- Captures and structures requirements from any source (meeting notes, transcripts, emails, raw text)
- Documents current-state and future-state processes as structured flows
- Generates client-facing deliverables (PowerPoint decks) from the engagement context
- Reads from and writes to the shared engagement context
- Links requirements to design decisions made by domain agents

## Skills

### Requirements Extraction (LLM native + structured output)

**Input:** Unstructured text -- meeting notes, transcripts, emails, raw bullet points, voice-to-text output.

**Output:** Structured requirements with:
- `id`: Unique identifier (auto-generated)
- `title`: Short descriptive title
- `description`: Full requirement text
- `category`: Functional area (reporting, close process, GL design, regulatory, integration, etc.)
- `priority`: HIGH / MEDIUM / LOW
- `source`: Where it came from (meeting date, person, document)
- `traceability`: Links to upstream decisions or downstream design artifacts
- `status`: DRAFT / VALIDATED / IMPLEMENTED / DEFERRED
- `linked_decisions`: Decision IDs from the decision registry that address this requirement
- `linked_findings`: Finding IDs from the GL Design Coach that relate to this requirement

**Behavior:** The agent extracts multiple requirements from a single input. It asks clarifying questions when a requirement is ambiguous. It proposes a category and priority and asks the user to confirm.

### Requirements Deduplication (Build)

When new requirements are captured, the agent compares them against the existing requirements in the engagement context:
- Exact duplicates are flagged and not added
- Near-duplicates are presented to the user: "This looks similar to REQ-014. Should I merge them, link them, or keep them separate?"
- Semantic similarity comparison (not just string matching)

### Process Flow Generation (LLM native + structured output)

**Input:** Verbal descriptions, notes, or existing documentation about a business process.

**Output:** Structured process flow with:
- `id`: Unique identifier
- `name`: Process name (e.g., "Monthly Close -- Reserve Posting")
- `type`: CURRENT_STATE / FUTURE_STATE
- `steps`: Ordered list of process steps, each with:
  - Step name
  - System involved (SAP, Excel, policy admin, manual, etc.)
  - Role responsible
  - Inputs required
  - Outputs produced
  - Accounts touched (GL accounts affected)
  - Pain points (current state only)
  - Automation potential (current state only)
- `linked_requirements`: Requirement IDs that drive this process
- `linked_decisions`: Decision IDs that affect this process

**Behavior:** The agent generates the flow and walks the user through it step by step, asking for corrections and additions. It flags steps that involve manual work or spreadsheets as automation candidates.

### Deck Generation (Build -- python-pptx)

Generates PowerPoint deliverables from the engagement context. The consultant never manually compiles content.

**Deck types:**
- **Steering Committee Update**: Status, decisions made, open items, next steps. Pulls from Consulting Agent's engagement state.
- **Current State Assessment**: Findings, pain points, MJE analysis summary, account statistics. Pulls from GL Design Coach's analysis.
- **Design Recommendations**: Proposed code block design, rationale, trade-offs, alternatives considered. Pulls from GL Design Coach's decisions.
- **Requirements Summary**: All captured requirements by category, status, priority. Pulls from Functional Consultant's requirements.

**Behavior:** The agent asks which deck type is needed, assembles content from the engagement context, generates the deck, and presents a summary of what's included. Uses templates for consistent formatting.

### Read/Write Engagement Context (Build)

The Functional Consultant has full access to the shared engagement context:
- **Read**: Query any structured artifact -- decisions, findings, requirements, process flows, mappings
- **Write**: Create new requirements, update process flows, link artifacts together
- **Query examples**: "What requirements relate to segment reporting?", "Which findings are still open?", "What decisions have been made about intercompany?"

## Pydantic Models

The Functional Consultant produces and consumes these structured types:

```python
class Requirement(BaseModel):
    id: str
    title: str
    description: str
    category: RequirementCategory  # StrEnum
    priority: Priority  # HIGH | MEDIUM | LOW
    source: str
    status: RequirementStatus  # DRAFT | VALIDATED | IMPLEMENTED | DEFERRED
    linked_decisions: list[str] = []
    linked_findings: list[str] = []
    created_at: datetime
    updated_at: datetime

class ProcessFlow(BaseModel):
    id: str
    name: str
    flow_type: FlowType  # CURRENT_STATE | FUTURE_STATE
    steps: list[ProcessStep]
    linked_requirements: list[str] = []
    linked_decisions: list[str] = []
    created_at: datetime
    updated_at: datetime

class ProcessStep(BaseModel):
    order: int
    name: str
    system: str
    role: str
    inputs: list[str]
    outputs: list[str]
    accounts_touched: list[str] = []
    pain_points: list[str] = []
    automation_potential: str | None = None
```

## Integration with Other Agents

### From GL Design Coach
- Receives: Findings, design decisions, account mappings, MJE analysis results
- Uses for: Linking requirements to design artifacts, generating decks with design content

### From Consulting Agent
- Receives: Task assignments, engagement state, workplan context
- Reports: New requirements captured, process flows documented, deliverables generated

### To Engagement Context
- Writes: Requirements, process flows, deliverable metadata
- Reads: Everything -- full cross-agent visibility

## MVP Scope

| Capability | MVP (V1) | Later |
|-----------|----------|-------|
| Requirements extraction from text | Yes | |
| Requirements deduplication | Yes | |
| Process flow generation | Yes | |
| Read/write engagement context | Yes | |
| Deck generation (steering committee) | Yes | |
| Deck generation (all types) | | V2 |
| Voice/audio transcription input | | V2 |
| Image/whiteboard OCR input | | Future |
| Requirements traceability matrix | | V2 |
| Process mining from posting data | | Future |

## Open Questions

- [ ] What python-pptx template design should we use for the MVP deck types?
- [ ] Should requirements extraction use tool calls or post-turn extraction?
- [ ] How granular should process flow steps be by default?
