"""FastAPI application factory."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fta_agent.data.engine import DataEngine
from fta_agent.data.loader import load_fixture

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Startup: create DataEngine, load fixture data."""
    engine = DataEngine()
    load_fixture(engine)
    app.state.engine = engine
    logger.info("DataEngine initialized with tables: %s", engine.tables())
    yield
    engine.close()
    logger.info("DataEngine closed.")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(title="FTA Agent", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from fta_agent.api.routes.chat import router as chat_router
    from fta_agent.api.routes.health import router as health_router
    from fta_agent.api.routes.outcomes import router as outcomes_router
    from fta_agent.api.routes.upload import router as upload_router

    app.include_router(health_router)
    app.include_router(chat_router)
    app.include_router(outcomes_router)
    app.include_router(upload_router)
    return app


app = create_app()
