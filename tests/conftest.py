"""Shared test fixtures."""

import pytest
from httpx import ASGITransport, AsyncClient

from fta_agent.api.app import create_app


@pytest.fixture(autouse=True)
def _mock_api_keys(monkeypatch: pytest.MonkeyPatch) -> None:
    """Ensure tests never use real API keys."""
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test-key")
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test-key")


@pytest.fixture
def app():
    """Create a fresh FastAPI app for testing."""
    return create_app()


@pytest.fixture
async def client(app):
    """Async HTTP client wired to the test app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
