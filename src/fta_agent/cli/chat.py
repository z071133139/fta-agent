"""REPL chat interface for development."""

from __future__ import annotations

import sys
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage

from fta_agent.agents.consulting_agent import get_consulting_agent_graph


def main() -> None:
    """Run an interactive chat REPL against the Consulting Agent."""
    print("FTA Agent Chat (type 'quit' or Ctrl+C to exit)")
    print("-" * 48)

    graph = get_consulting_agent_graph()
    messages: list[Any] = []

    while True:
        try:
            user_input = input("\nYou: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nBye!")
            sys.exit(0)

        if not user_input:
            continue
        if user_input.lower() in ("quit", "exit"):
            print("Bye!")
            break

        messages.append(HumanMessage(content=user_input))
        result = graph.invoke({"messages": messages})
        messages = result.get("messages", messages)

        # Print the last AI message
        for msg in reversed(messages):
            if isinstance(msg, AIMessage):
                print(f"\nAgent: {msg.content}")
                break


if __name__ == "__main__":
    main()
