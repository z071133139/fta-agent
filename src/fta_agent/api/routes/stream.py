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
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field

from fta_agent.agents.gl_design_coach import get_gl_design_coach_graph
from fta_agent.agents.state import AgentState

logger = logging.getLogger(__name__)

MOCK_MODE = os.environ.get("FTA_MOCK_AGENT", "").lower() in ("true", "1", "yes")

router = APIRouter(prefix="/api/v1")


class StreamRequest(BaseModel):
    """Request body for the SSE streaming endpoint."""

    message: str = Field(..., min_length=1, description="The user message to send to the agent.")
    agent: str = Field(default="gl_design_coach", description="Which agent to invoke.")
    session_id: str | None = Field(default=None, description="Session ID for continuity. Generated if omitted.")


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
) -> AsyncIterator[str]:
    """Run the agent graph and yield SSE events."""
    engine = request.app.state.engine

    # Select graph based on agent
    if agent == "gl_design_coach":
        graph = get_gl_design_coach_graph(engine)
    else:
        # Fallback to stub
        graph = get_gl_design_coach_graph()

    initial_state: AgentState = {
        "messages": [HumanMessage(content=message)],
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
            # Truncate large tool outputs for SSE
            output_str = str(output)
            if len(output_str) > 2000:
                output_str = output_str[:2000] + "... (truncated)"
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
    { "dimension": "Segment", "fill_rate": 98, "unique_values": 4, "mandatory": true, "key_values": "P&C, Life, Corporate, Eliminations", "reporting_purpose": "IFRS 8 / ASC 280 operating segments", "issues": "2% gap in intercompany accounts" },
    { "dimension": "Functional Area", "fill_rate": 85, "unique_values": 8, "mandatory": true, "key_values": "Claims, UW, Investment, Admin, IT, Actuarial, Finance, Legal", "reporting_purpose": "Insurance Expense Exhibit allocation", "issues": "15% unclassified — mostly legacy clearing accounts" },
    { "dimension": "LOB", "fill_rate": 95, "unique_values": 6, "mandatory": true, "key_values": "AUTO, HOME, COMML, WC, UMBRELLA, OTHER", "reporting_purpose": "Schedule P / combined ratio by line", "issues": "5% gap in corporate overhead accounts" },
    { "dimension": "State", "fill_rate": 72, "unique_values": 38, "mandatory": false, "key_values": "All 50 states + DC, PR, VI, USVI", "reporting_purpose": "Schedule T — Premiums by State", "issues": "28% gap — WC single-state, corporate accounts missing state" }
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

# Map message content keywords to mock responses
_MOCK_RESPONSES: dict[str, str] = {
    "coa_design": _MOCK_RESPONSE_COA_DESIGN,
    "default": _MOCK_RESPONSE_ACCOUNT_ANALYSIS,
}

_MOCK_TOOLS: dict[str, list[dict[str, str | dict]]] = {
    "coa_design": [
        {"tool": "profile_accounts", "input": {"top_n": 25}, "output": "(68 accounts profiled)"},
        {"tool": "compute_trial_balance", "input": {}, "output": "(trial balance computed)"},
        {"tool": "assess_dimensions", "input": {}, "output": "(5 dimensions assessed)"},
    ],
    "default": [
        {"tool": "profile_accounts", "input": {"top_n": 25}, "output": "(68 accounts profiled)"},
        {"tool": "detect_mje", "input": {}, "output": "(no anomalies detected)"},
    ],
}


def _detect_mock_variant(message: str) -> str:
    """Pick the right mock response based on the user message."""
    lower = message.lower()
    if "compute_trial_balance" in lower or "code block" in lower or "coa" in lower:
        return "coa_design"
    return "default"


async def _stream_mock(session_id: str, message: str = "") -> AsyncIterator[str]:
    """Yield a canned response as realistic SSE events (no LLM call)."""
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

    if MOCK_MODE:
        logger.info("MOCK MODE: streaming canned response for session %s", session_id)
        generator = _stream_mock(session_id, message=req.message)
    else:
        generator = _stream_agent(request, req.message, req.agent, session_id)

    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
