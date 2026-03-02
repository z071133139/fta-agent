"""SSE streaming endpoint for agent execution.

Streams LangGraph astream_events as Server-Sent Events conforming
to the SSE event envelope defined in the project spec.

Set FTA_MOCK_AGENT=true to replay canned responses instead of calling the LLM.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import uuid
from collections.abc import AsyncIterator
from datetime import datetime, timezone

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessage, HumanMessage
from pydantic import BaseModel, Field

from fta_agent.agents.gl_design_coach import get_gl_design_coach_graph
from fta_agent.agents.functional_consultant import get_functional_consultant_graph
from fta_agent.agents.state import AgentState

logger = logging.getLogger(__name__)

MOCK_MODE = os.environ.get("FTA_MOCK_AGENT", "").lower() in ("true", "1", "yes")

router = APIRouter(prefix="/api/v1")


class HistoryMessage(BaseModel):
    """A single message in conversation history."""

    role: str = Field(..., description="Message role: 'user' or 'assistant'.")
    content: str = Field(..., description="Message content.")


class StreamRequest(BaseModel):
    """Request body for the SSE streaming endpoint."""

    message: str = Field(..., min_length=1, description="The user message to send to the agent.")
    agent: str = Field(default="gl_design_coach", description="Which agent to invoke.")
    session_id: str | None = Field(default=None, description="Session ID for continuity. Generated if omitted.")
    history: list[HistoryMessage] | None = Field(
        default=None,
        description="Conversation history for multi-turn agents. Reconstructed as LangChain messages.",
    )
    mock_mode: bool | None = Field(
        default=None,
        description="Override mock mode per-request. True=mock, False=live, None=use server env.",
    )


def _sse_event(event_type: str, session_id: str, payload: dict) -> str:
    """Format a single SSE event conforming to the project envelope."""
    envelope = {
        "type": event_type,
        "session_id": session_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payload": payload,
    }
    return f"data: {json.dumps(envelope, default=str)}\n\n"


async def _stream_agent(
    request: Request,
    message: str,
    agent: str,
    session_id: str,
    history: list[HistoryMessage] | None = None,
) -> AsyncIterator[str]:
    """Run the agent graph and yield SSE events."""
    engine = request.app.state.engine

    # Select graph based on agent
    if agent == "gl_design_coach":
        graph = get_gl_design_coach_graph(engine)
    elif agent == "functional_consultant":
        graph = get_functional_consultant_graph()
    else:
        # Fallback to GL Design Coach stub
        graph = get_gl_design_coach_graph()

    # Reconstruct message history for multi-turn conversations
    messages: list[HumanMessage | AIMessage] = []
    if history:
        for msg in history:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                messages.append(AIMessage(content=msg.content))
    messages.append(HumanMessage(content=message))

    initial_state: AgentState = {
        "messages": messages,
        "consultant": {
            "consultant_id": "demo-user",
            "display_name": "Demo Consultant",
            "role": "consultant",
        },
        "engagement": {
            "engagement_id": "demo-eng-001",
            "client_name": "Acme Insurance",
            "sub_segment": "P&C",
            "erp_target": "SAP",
            "phase": "discovery",
        },
        "active_agent": agent,
        "last_tool_results": [],
    }

    # Stream events from the graph
    token_buffer = ""
    try:
      async for event in graph.astream_events(initial_state, version="v2"):
        kind = event.get("event", "")

        # LLM token streaming
        if kind == "on_chat_model_stream":
            chunk = event.get("data", {}).get("chunk")
            if chunk and hasattr(chunk, "content") and chunk.content:
                raw = chunk.content
                # Anthropic returns list of content blocks; extract text
                if isinstance(raw, list):
                    content = "".join(
                        block.get("text", "") for block in raw
                        if isinstance(block, dict) and block.get("type") == "text"
                    )
                else:
                    content = str(raw)
                if content:
                    token_buffer += content
                    yield _sse_event("token", session_id, {"content": content})

        # Tool call start
        elif kind == "on_tool_start":
            tool_name = event.get("name", "unknown")
            tool_input = event.get("data", {}).get("input", {})
            yield _sse_event("tool_call", session_id, {
                "tool": tool_name,
                "status": "started",
                "input": tool_input,
            })

        # Tool call end
        elif kind == "on_tool_end":
            tool_name = event.get("name", "unknown")
            output = event.get("data", {}).get("output", "")
            # LangChain wraps tool returns in ToolMessage — extract raw content
            if hasattr(output, "content"):
                output_str = str(output.content)
                logger.info("Tool %s output extracted from ToolMessage (%d chars)", tool_name, len(output_str))
            else:
                output_str = str(output)
                logger.info("Tool %s output raw type=%s (%d chars)", tool_name, type(output).__name__, len(output_str))
            # Truncate large tool outputs for SSE
            # Higher limit for emit_process_flow (flow JSON is ~3-5KB)
            max_len = 20000 if tool_name == "emit_process_flow" else 2000
            if len(output_str) > max_len:
                output_str = output_str[:max_len] + "... (truncated)"
            yield _sse_event("tool_call", session_id, {
                "tool": tool_name,
                "status": "completed",
                "output_preview": output_str,
            })

        # Chain/graph step events for trace
        elif kind == "on_chain_start":
            name = event.get("name", "")
            if name and name not in ("LangGraph", "RunnableSequence"):
                yield _sse_event("trace_step", session_id, {
                    "step": name,
                    "status": "started",
                })

        elif kind == "on_chain_end":
            name = event.get("name", "")
            if name and name not in ("LangGraph", "RunnableSequence"):
                yield _sse_event("trace_step", session_id, {
                    "step": name,
                    "status": "completed",
                })

    except Exception as e:
        logger.exception("Agent stream error")
        yield _sse_event("error", session_id, {
            "message": f"{type(e).__name__}: {e}",
        })
        return

    # Final complete event
    yield _sse_event("complete", session_id, {
        "total_tokens": len(token_buffer.split()),
    })


_MOCK_RESPONSE_ACCOUNT_ANALYSIS = """\
## Top 25 GL Accounts Analysis

### Account Summary

Your top 25 accounts represent **779,411 postings (77.7% of total volume)** and show a well-structured P&C insurance chart of accounts. Here's what I found:

| GL Account | Description | Postings | MJE % | LOB Usage | State Usage | Key Findings |
|------------|-------------|----------|-------|-----------|-------------|--------------|
| **100100** | Cash – Claims | 97,586 | 0.0% | 4 LOBs | 12 states | ✓ High-volume operational |
| **110100** | Premiums Receivable – HOME | 92,393 | 0.0% | HOME only | 12 states | ✓ Single LOB focus |
| **400100** | Direct Premiums Written – HOME | 90,962 | 0.0% | HOME only | 12 states | ✓ Revenue recognition |
| **110300** | Premiums Receivable – WC | 87,170 | 0.0% | WC only | 1 state | ⚠ Single state WC |
| **110200** | Premiums Receivable – COMML | 86,587 | 0.0% | COMML only | 6 states | ✓ Multi-state commercial |

### MJE Detection Results

No significant manual journal entry concentrations detected. All accounts show **< 1% MJE ratio**, which is within normal bounds for a P&C carrier of this size.

### Recommendations

1. **Single-state WC accounts** (110300, 400300) — verify if this is intentional or a data gap
2. **Cash account volume** — 97K postings is high; consider sub-account breakout for better reconciliation
3. **LOB isolation** is clean — each premium account maps to exactly one line of business
"""

_MOCK_RESPONSE_COA_DESIGN = """\
Account structure shows proper GAAP alignment with $4.3B assets, $2.1B liabilities across 3,100 accounts. \
High posting volume (1M entries) indicates active multi-LOB operation across AUTO, HOME, COMML, WC. \
Three critical gaps identified: State dimension has only 72% fill rate, Functional Area at 85% needs cleanup, \
and profit center hierarchy requires restructuring for NAIC Schedule P alignment.

<coa_design>
{
  "summary": "Account structure shows proper GAAP alignment with $4.3B assets, $2.1B liabilities across 3,100 accounts. High posting volume (1M entries) indicates active multi-LOB operation across AUTO, HOME, COMML, WC. Three critical gaps: State dimension at 72% fill rate, Functional Area at 85% needs cleanup, profit center hierarchy requires restructuring for NAIC Schedule P alignment.",
  "code_blocks": [
    { "range": "1XXX", "account_type": "Assets", "naic_alignment": "Balance Sheet Schedule", "count": 1442 },
    { "range": "2XXX", "account_type": "Liabilities", "naic_alignment": "Balance Sheet Schedule", "count": 741 },
    { "range": "3XXX", "account_type": "Equity", "naic_alignment": "Balance Sheet Schedule", "count": 10 },
    { "range": "4XXX", "account_type": "Revenue", "naic_alignment": "Underwriting & Investment Exhibit", "count": 73 },
    { "range": "5XXX", "account_type": "Expenses", "naic_alignment": "Underwriting & Investment Exhibit", "count": 834 }
  ],
  "account_groups": [
    { "group_code": "CASH", "name": "Cash & Equivalents", "naic_schedule_line": "Assets Line 1", "account_count": 3, "notes": "Claims/Operating/Payroll segregation" },
    { "group_code": "INVEST", "name": "Invested Assets", "naic_schedule_line": "Assets Lines 2-8", "account_count": 12, "notes": "Bond/equity/real estate split required" },
    { "group_code": "PREM_REC", "name": "Premiums Receivable", "naic_schedule_line": "Assets Line 14", "account_count": 8, "notes": "Direct/assumed/ceded breakout" },
    { "group_code": "REINS_REC", "name": "Reinsurance Recoverables", "naic_schedule_line": "Assets Line 16", "account_count": 6, "notes": "Schedule F alignment needed" },
    { "group_code": "LOSS_RES", "name": "Loss & LAE Reserves", "naic_schedule_line": "Liabilities Line 1-3", "account_count": 15, "notes": "Case/IBNR/ALAE/ULAE split" },
    { "group_code": "UPR", "name": "Unearned Premium Reserve", "naic_schedule_line": "Liabilities Line 9", "account_count": 4, "notes": "Direct/assumed/ceded" },
    { "group_code": "PREM_EARN", "name": "Premiums Earned", "naic_schedule_line": "UW Exhibit Line 1", "account_count": 8, "notes": "Direct/assumed/ceded by LOB" },
    { "group_code": "LOSS_INC", "name": "Losses Incurred", "naic_schedule_line": "UW Exhibit Line 2", "account_count": 10, "notes": "Paid/reserved/salvage breakdown" },
    { "group_code": "OPER_EXP", "name": "Operating Expenses", "naic_schedule_line": "UW Exhibit Lines 25-29", "account_count": 18, "notes": "Functional area allocation required for IEE" }
  ],
  "dimensions": [
    { "dimension": "Profit Center", "fill_rate": 100, "unique_values": 14, "mandatory": true, "key_values": "PC1000-PC4200", "reporting_purpose": "LOB + Region segmentation for Schedule P", "issues": "" },
    { "dimension": "Segment", "fill_rate": 98, "unique_values": 4, "mandatory": true, "key_values": "P&C, Life, Corporate, Eliminations", "reporting_purpose": "IFRS 8 / ASC 280 operating segments", "issues": "2% gap in intercompany accounts — segment tag missing on elimination entries" },
    { "dimension": "Functional Area", "fill_rate": 85, "unique_values": 8, "mandatory": true, "key_values": "Claims, UW, Investment, Admin, IT, Actuarial, Finance, Legal", "reporting_purpose": "Insurance Expense Exhibit allocation", "issues": "15% unclassified — mostly legacy clearing accounts; 3 functional area codes have no active accounts mapped" },
    { "dimension": "LOB", "fill_rate": 95, "unique_values": 6, "mandatory": true, "key_values": "AUTO, HOME, COMML, WC, UMBRELLA, OTHER", "reporting_purpose": "Schedule P / combined ratio by line", "issues": "5% gap in corporate overhead accounts — no LOB assignment; UMBRELLA line has only 2 accounts — verify completeness" },
    { "dimension": "State", "fill_rate": 72, "unique_values": 38, "mandatory": false, "key_values": "All 50 states + DC, PR, VI, USVI", "reporting_purpose": "Schedule T — Premiums by State", "issues": "28% gap — WC single-state, corporate accounts missing state; 12 states have fewer than 5 accounts — verify if operational or data gap; Default state assignment needed for corporate overhead" }
  ],
  "decisions": [
    { "title": "Leading Ledger Basis", "context": "Single-segment P&C operation with statutory and GAAP reporting requirements. Current system uses statutory as primary basis.", "recommendation": "GAAP leading ledger (0L) with statutory as extension ledger (2L). GAAP basis aligns with consolidated reporting and supports IFRS 17 future-readiness.", "alternative": "Statutory leading with GAAP extension. Lower migration risk but limits consolidation flexibility.", "impact": "GAAP basis supports direct consolidation, segment reporting per ASC 280, and future IFRS 17 adoption without ledger restructuring." },
    { "title": "Extension Ledger Strategy", "context": "Multi-basis reporting required: US GAAP, Statutory (SAP), and potential IFRS 17. Tax differences tracked separately.", "recommendation": "Two extension ledgers: 2L for Statutory adjustments, 4L for Tax. IFRS 17 deferred to Phase 2 as a third extension ledger.", "alternative": "Single extension ledger for all non-GAAP adjustments with attribute-based filtering. Simpler but harder to audit.", "impact": "Clean separation of adjustment types. Each ledger maps to a distinct reporting framework with independent close cycles." },
    { "title": "Document Splitting Scope", "context": "6 accounts flagged for document splitting eligibility (AR, AP, clearing accounts). Current postings lack profit center on balance sheet items.", "recommendation": "Enable document splitting for Profit Center and Segment on all balance sheet accounts. Passive splitting on equity.", "alternative": "Split only on Profit Center, derive Segment from PC master data. Reduces configuration but limits independent segment reporting.", "impact": "Full balance sheet by profit center enables LOB-level balance sheets required for Schedule P Part 1 and management reporting." },
    { "title": "Profit Center Hierarchy", "context": "Current 14 profit centers are flat. NAIC reporting requires LOB-level aggregation, management wants regional view.", "recommendation": "Three-level hierarchy: Region (L1) → LOB (L2) → Sub-LOB (L3). Maps to both NAIC Schedule P lines and internal management views.", "alternative": "Two-level hierarchy: LOB → Sub-LOB only. Simpler but loses geographic dimension for state-level analysis.", "impact": "Three-level structure supports Schedule P, combined ratio by region, and state premium allocation without separate reporting hierarchies." }
  ]
}
</coa_design>
"""

_MOCK_RESPONSE_INCOME_STATEMENT = """\
## GAAP Income Statement — FY2025

Generated from **1,064,838 GL posting lines** across 12 fiscal periods (Jan–Dec 2025). All figures in USD thousands.

### Consolidated P&L

| Line Item | AUTO | HOME | COMML | WC | Total |
|-----------|-----:|-----:|------:|---:|------:|
| **Net Premiums Written** | 412,300 | 287,600 | 198,400 | 143,700 | **1,042,000** |
| Net Premiums Earned | 398,100 | 279,200 | 191,800 | 139,500 | **1,008,600** |
| | | | | | |
| Losses Incurred | (258,800) | (170,400) | (134,300) | (104,200) | **(667,700)** |
| Loss Adjustment Expenses | (39,800) | (25,100) | (21,100) | (18,300) | **(104,300)** |
| **Total Losses & LAE** | **(298,600)** | **(195,500)** | **(155,400)** | **(122,500)** | **(772,000)** |
| | | | | | |
| Commission & Brokerage | (67,700) | (50,200) | (34,600) | (22,300) | **(174,800)** |
| Other Underwriting Expense | (31,800) | (22,300) | (17,300) | (11,200) | **(82,600)** |
| **Total Underwriting Expense** | **(99,500)** | **(72,500)** | **(51,900)** | **(33,500)** | **(257,400)** |
| | | | | | |
| **Underwriting Income (Loss)** | **0** | **11,200** | **(15,500)** | **(16,500)** | **(20,800)** |
| | | | | | |
| Net Investment Income | | | | | **87,300** |
| Realized Investment Gains | | | | | **12,400** |
| Other Income | | | | | **3,200** |
| | | | | | |
| **Net Income Before Tax** | | | | | **82,100** |
| Federal Income Tax | | | | | **(17,200)** |
| **Net Income** | | | | | **64,900** |

### Loss Ratio Analysis by LOB

| LOB | Loss Ratio | LAE Ratio | Combined Loss & LAE | Expense Ratio | Combined Ratio | Assessment |
|-----|----------:|----------:|--------------------:|--------------:|---------------:|------------|
| AUTO | 65.0% | 10.0% | 75.0% | 25.0% | **100.0%** | Breakeven — watch frequency trends |
| HOME | 61.0% | 9.0% | 70.0% | 26.0% | **96.0%** | Profitable — best performing LOB |
| COMML | 70.0% | 11.0% | 81.0% | 27.1% | **108.1%** | ⚠ Unprofitable — driven by large commercial claims |
| WC | 74.7% | 13.1% | 87.8% | 24.0% | **111.8%** | ⚠ Unprofitable — highest loss ratio, single-state concentration |
| **Total** | **66.2%** | **10.3%** | **76.5%** | **25.5%** | **102.1%** | Slight underwriting loss, offset by investment income |

### Key Findings & Transformation Concerns

1. **Commercial lines (COMML) combined ratio at 108.1%** — Large loss events in Q2 and Q4 drove losses above plan. Recommend isolating casualty vs. property sub-lines in the target COA to improve loss tracking granularity.

2. **Workers' Comp (WC) at 111.8% combined** — Highest loss ratio across all LOBs. This LOB operates in a single state (OH), and the 28% state dimension gap identified in the COA design analysis means premium allocation by state cannot be validated against Schedule T requirements.

3. **Investment income ($87.3M) masks underwriting weakness** — Net underwriting loss of $(20.8M) is entirely offset by investment returns. The target COA should support clear separation of underwriting vs. investment results for management reporting.

4. **Expense ratio consistency across LOBs (24–27%)** — The Functional Area dimension at 85% fill rate means 15% of operating expenses cannot be allocated to LOB. This will impact Insurance Expense Exhibit (IEE) accuracy and should be remediated before go-live.

5. **HOME is the strongest performer** — 96% combined ratio and highest dimensional data quality. Consider this LOB as the pilot for the first migration wave.

### Data Quality Notes

- **12 posting periods confirmed** — no gaps in monthly close cycle
- **Reconciliation**: Total net premiums earned ($1,008.6M) ties to Schedule P Part 1 within 0.3% tolerance
- **Unallocated expenses**: $12.4M in corporate overhead could not be assigned to LOB due to missing Functional Area tags — these are included in "Other Underwriting Expense" at the total level only
"""

# Map message content keywords to mock responses
_MOCK_RESPONSES: dict[str, str] = {
    "coa_design": _MOCK_RESPONSE_COA_DESIGN,
    "income_statement": _MOCK_RESPONSE_INCOME_STATEMENT,
    "default": _MOCK_RESPONSE_ACCOUNT_ANALYSIS,
}

_MOCK_TOOLS: dict[str, list[dict[str, str | dict]]] = {
    "coa_design": [
        {"tool": "profile_accounts", "input": {"top_n": 25}, "output": "(68 accounts profiled)"},
        {"tool": "compute_trial_balance", "input": {}, "output": "(trial balance computed)"},
        {"tool": "assess_dimensions", "input": {}, "output": "(5 dimensions assessed)"},
    ],
    "income_statement": [
        {"tool": "load_gl_postings", "input": {"periods": "1-12"}, "output": "(1,064,838 posting lines loaded)"},
        {"tool": "compute_trial_balance", "input": {}, "output": "(trial balance computed — 4 LOBs)"},
        {"tool": "generate_income_statement", "input": {"basis": "GAAP", "by_lob": True}, "output": "(P&L generated with LOB breakdown)"},
        {"tool": "compute_loss_ratios", "input": {}, "output": "(loss ratios computed for 4 LOBs)"},
    ],
    "default": [
        {"tool": "profile_accounts", "input": {"top_n": 25}, "output": "(68 accounts profiled)"},
        {"tool": "detect_mje", "input": {}, "output": "(no anomalies detected)"},
    ],
}


def _detect_mock_variant(message: str) -> str:
    """Pick the right mock response based on the user message."""
    # Only d-005-02 prompt contains the <coa_design> schema instruction
    if "<coa_design>" in message or "Do not narrate" in message:
        return "coa_design"
    # d-006-06 income statement prompt
    lower = message.lower()
    if "income statement" in lower or "loss ratio" in lower:
        return "income_statement"
    return "default"


# ── Functional Consultant mock ─────────────────────────────────────────────

_FC_MOCK_FLOW = json.dumps({
    "kind": "process_flow",
    "name": "GL Coding Block Correction",
    "swimlanes": ["Finance Analyst", "GL System (SAP)", "Finance Manager"],
    "nodes": [
        {"id": "n-001", "type": "start", "label": "Start"},
        {"id": "n-002", "type": "task", "label": "Extract GL data for company code & period", "role": "Finance Analyst", "system": "SAP", "status": "leading_practice"},
        {"id": "n-003", "type": "task", "label": "Identify line items requiring coding block changes", "role": "Finance Analyst", "system": "Excel", "status": "leading_practice"},
        {"id": "n-004", "type": "task", "label": "Prepare correction entries in upload template", "role": "Finance Analyst", "system": "Excel", "status": "client_overlay"},
        {"id": "n-005", "type": "gateway", "label": "Correction amount > threshold?", "role": "Finance Manager"},
        {"id": "n-006", "type": "task", "label": "Review and approve correction entries", "role": "Finance Manager", "status": "leading_practice"},
        {"id": "n-007", "type": "task", "label": "Reverse original GL postings", "role": "GL System (SAP)", "system": "SAP", "status": "leading_practice"},
        {"id": "n-008", "type": "task", "label": "Upload corrected postings via manual journal entry", "role": "Finance Analyst", "system": "SAP", "status": "client_overlay"},
        {"id": "n-009", "type": "task", "label": "Validate reversal and reposting tie-out", "role": "Finance Analyst", "system": "SAP", "status": "leading_practice"},
        {"id": "n-010", "type": "end", "label": "End"},
    ],
    "edges": [
        {"id": "e-001", "source": "n-001", "target": "n-002"},
        {"id": "e-002", "source": "n-002", "target": "n-003"},
        {"id": "e-003", "source": "n-003", "target": "n-004"},
        {"id": "e-004", "source": "n-004", "target": "n-005"},
        {"id": "e-005", "source": "n-005", "target": "n-006", "condition": "Yes"},
        {"id": "e-006", "source": "n-005", "target": "n-007", "condition": "No"},
        {"id": "e-007", "source": "n-006", "target": "n-007"},
        {"id": "e-008", "source": "n-007", "target": "n-008"},
        {"id": "e-009", "source": "n-008", "target": "n-009"},
        {"id": "e-010", "source": "n-009", "target": "n-010"},
    ],
    "overlays": [
        {"id": "ov-001", "node_id": "n-004", "kind": "risk", "text": "Manual Excel manipulation is error-prone. Consider automated validation rules for coding block combinations.", "source": "agent_elicited"},
        {"id": "ov-002", "node_id": "n-008", "kind": "constraint", "text": "Manual journal uploads require dual authorization per SOX controls. Ensure upload template includes preparer/approver fields.", "source": "agent_elicited"},
    ],
}, indent=None)

# Different FC responses based on conversation turn count
_FC_RESPONSE_FIRST = """\
Thank you for describing this process. I can see this is a **GL coding block correction flow** — a common pattern in P&C insurance finance operations where account assignments need post-posting adjustments.

Let me confirm a few details before I build the flow:

1. **Process Area:** This falls under **PA-02 General Ledger & Multi-Basis Accounting** — specifically sub-process corrections and adjustments. Does that align?

2. **Roles involved:** I'm seeing three roles so far:
   - **Finance Analyst** (Jackie) — extracts, prepares corrections, uploads
   - **GL System (SAP)** — automatic reversal processing
   - **Finance Manager** — would there be an approval step for corrections above a threshold?

3. **Decision points:** Is there a materiality threshold where corrections need manager approval before posting?

Let me know on these points and I'll generate the initial flow."""

_FC_RESPONSE_WITH_FLOW = """\
Based on your description, I've built the initial process flow with **3 swimlanes** and **8 process steps** plus a decision gateway.

Key design choices:
- **Automatic reversal** is shown as a system task (SAP handles this, not a manual step)
- Added an **approval gateway** for corrections above threshold — this is leading practice for SOX compliance
- Flagged two areas of concern:
  - The Excel-based correction preparation (risk of manual errors)
  - The manual journal upload requiring dual authorization

The flow shows the end-to-end path from extraction through correction and validation. Take a look at the preview — what would you adjust?"""


async def _stream_mock_fc(session_id: str, message: str, history: list[HistoryMessage] | None = None) -> AsyncIterator[str]:
    """Mock stream for Functional Consultant — multi-turn with flow emission."""
    turn_count = len(history) if history else 0

    yield _sse_event("trace_step", session_id, {"step": "functional_consultant", "status": "started"})

    # First turn (or early turn): ask clarifying questions
    # Later turns: emit the process flow + explanation
    if turn_count < 2:
        response = _FC_RESPONSE_FIRST
    else:
        response = _FC_RESPONSE_WITH_FLOW

        # Emit the process flow tool call
        yield _sse_event("tool_call", session_id, {
            "tool": "emit_process_flow",
            "status": "started",
            "input": {"name": "GL Coding Block Correction"},
        })
        await asyncio.sleep(0.5)
        yield _sse_event("tool_call", session_id, {
            "tool": "emit_process_flow",
            "status": "completed",
            "output_preview": _FC_MOCK_FLOW,
        })

    # Stream tokens
    for line in response.split("\n"):
        words = line.split(" ")
        for i, word in enumerate(words):
            token = word if i == 0 else " " + word
            yield _sse_event("token", session_id, {"content": token})
            await asyncio.sleep(0.01)
        yield _sse_event("token", session_id, {"content": "\n"})
        await asyncio.sleep(0.02)

    yield _sse_event("trace_step", session_id, {"step": "functional_consultant", "status": "completed"})
    yield _sse_event("complete", session_id, {"total_tokens": len(response.split())})


async def _stream_mock(session_id: str, message: str = "", agent: str = "gl_design_coach", history: list[HistoryMessage] | None = None) -> AsyncIterator[str]:
    """Yield a canned response as realistic SSE events (no LLM call)."""

    # Route to FC mock for functional_consultant agent
    if agent == "functional_consultant":
        async for event in _stream_mock_fc(session_id, message, history):
            yield event
        return

    variant = _detect_mock_variant(message)
    response = _MOCK_RESPONSES[variant]
    tools = _MOCK_TOOLS[variant]

    yield _sse_event("trace_step", session_id, {"step": "gl_coach", "status": "started"})

    # Simulate tool calls
    for tool_def in tools:
        yield _sse_event("tool_call", session_id, {
            "tool": tool_def["tool"],
            "status": "started",
            "input": tool_def.get("input", {}),
        })
        await asyncio.sleep(0.3)
        yield _sse_event("tool_call", session_id, {
            "tool": tool_def["tool"],
            "status": "completed",
            "output_preview": tool_def.get("output", ""),
        })

    # Stream tokens in small chunks to simulate LLM output
    for line in response.split("\n"):
        words = line.split(" ")
        for i, word in enumerate(words):
            token = word if i == 0 else " " + word
            yield _sse_event("token", session_id, {"content": token})
            await asyncio.sleep(0.01)
        yield _sse_event("token", session_id, {"content": "\n"})
        await asyncio.sleep(0.02)

    yield _sse_event("trace_step", session_id, {"step": "gl_coach", "status": "completed"})
    yield _sse_event("complete", session_id, {"total_tokens": len(response.split())})


@router.post("/stream")
async def stream_agent(req: StreamRequest, request: Request) -> StreamingResponse:
    """Stream agent execution as Server-Sent Events.

    Sends events conforming to the SSE envelope:
    - token: incremental LLM output
    - tool_call: tool invocation start/end
    - trace_step: graph node execution
    - complete: execution finished
    - error: execution failed

    Set FTA_MOCK_AGENT=true to use canned responses (no LLM cost).
    """
    session_id = req.session_id or str(uuid.uuid4())

    # Per-request mock_mode overrides server env
    use_mock = req.mock_mode if req.mock_mode is not None else MOCK_MODE

    if use_mock:
        logger.info("MOCK MODE: streaming canned response for session %s", session_id)
        generator = _stream_mock(session_id, message=req.message, agent=req.agent, history=req.history)
    else:
        generator = _stream_agent(request, req.message, req.agent, session_id, req.history)

    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
