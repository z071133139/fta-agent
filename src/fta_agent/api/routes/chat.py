"""Chat endpoint — invokes the Consulting Agent graph."""

from __future__ import annotations

from pydantic import BaseModel
from fastapi import APIRouter
from langchain_core.messages import AIMessage, HumanMessage

from fta_agent.agents.consulting_agent import get_consulting_agent_graph

router = APIRouter(prefix="/api")


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    """Send a message to the Consulting Agent and return the reply."""
    graph = get_consulting_agent_graph()
    result = await graph.ainvoke({"messages": [HumanMessage(content=req.message)]})
    messages = result.get("messages", [])
    # Last message from the agent
    for msg in reversed(messages):
        if isinstance(msg, AIMessage):
            content = msg.content if isinstance(msg.content, str) else str(msg.content)
            return ChatResponse(reply=content)
    return ChatResponse(reply="No response from agent.")
