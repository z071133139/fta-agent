"""LLM model factory and LiteLLM Router configuration."""

from __future__ import annotations

from langchain_anthropic import ChatAnthropic
from langchain_core.language_models.chat_models import BaseChatModel

from fta_agent.config import get_settings

# LiteLLM Router config — ready for multi-provider routing.
# Import and instantiate when needed:
#   from litellm import Router
#   llm_router = Router(model_list=LITELLM_MODEL_LIST)
LITELLM_MODEL_LIST = [
    {
        "model_name": "claude-sonnet",
        "litellm_params": {
            "model": "claude-sonnet-4-20250514",
            "api_key": "os.environ/ANTHROPIC_API_KEY",
        },
    },
    {
        "model_name": "gpt-4o",
        "litellm_params": {
            "model": "gpt-4o",
            "api_key": "os.environ/OPENAI_API_KEY",
        },
    },
]


def get_chat_model(model: str | None = None) -> BaseChatModel:
    """Return a LangChain chat model for use in LangGraph nodes.

    Uses ChatAnthropic / ChatOpenAI directly (first-class LangChain
    integrations with full tool-binding support), rather than ChatLiteLLM.
    """
    settings = get_settings()
    model_name = model or settings.fta_default_model

    if model_name.startswith("gpt"):
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=model_name,
            api_key=settings.openai_api_key,  # type: ignore[arg-type]
        )

    # Default to Anthropic
    return ChatAnthropic(
        model_name=model_name,
        api_key=settings.anthropic_api_key,  # type: ignore[arg-type]
    )
