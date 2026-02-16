"""FastAPI application factory."""

from fastapi import FastAPI

from fta_agent.api.routes.chat import router as chat_router
from fta_agent.api.routes.health import router as health_router


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(title="FTA Agent", version="0.1.0")
    app.include_router(health_router)
    app.include_router(chat_router)
    return app


app = create_app()
