"""Prompt assembly for domain-specific agent system prompts.

Concatenates modular prompt components into a complete system prompt.
Industry and platform modules are selected via parameter (only "pc" and
"sap" are populated in V1).
"""

from __future__ import annotations

from fta_agent.agents.prompts.core import CORE_PROMPT
from fta_agent.agents.prompts.pc_module import PC_DOMAIN_PROMPT
from fta_agent.agents.prompts.sap_module import SAP_PLATFORM_PROMPT
from fta_agent.agents.prompts.translation import TRANSLATION_RULES

_INDUSTRY_MODULES: dict[str, str] = {
    "pc": PC_DOMAIN_PROMPT,
}

_PLATFORM_MODULES: dict[str, str] = {
    "sap": SAP_PLATFORM_PROMPT,
}


def build_system_prompt(
    *,
    industry: str = "pc",
    platform: str = "sap",
    rag_content: str = "",
    data_profile: str = "",
) -> str:
    """Assemble the full system prompt from modular components.

    Args:
        industry: Industry module key (default: "pc" for P&C insurance).
        platform: Platform module key (default: "sap" for SAP S/4HANA).
        rag_content: Optional RAG-retrieved context to inject.
        data_profile: Optional data profile summary to inject.

    Returns:
        The assembled system prompt string.
    """
    parts = [CORE_PROMPT, TRANSLATION_RULES]

    industry_mod = _INDUSTRY_MODULES.get(industry, "")
    if industry_mod:
        parts.append(industry_mod)

    platform_mod = _PLATFORM_MODULES.get(platform, "")
    if platform_mod:
        parts.append(platform_mod)

    if rag_content:
        parts.append(f"\n## Retrieved Context\n\n{rag_content}")

    if data_profile:
        parts.append(f"\n## Current Data Profile\n\n{data_profile}")

    return "\n\n".join(parts)
