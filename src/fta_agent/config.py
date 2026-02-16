"""Application configuration via environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """FTA Agent configuration loaded from environment variables / .env file."""

    anthropic_api_key: str = ""
    openai_api_key: str = ""
    fta_default_model: str = "claude-sonnet-4-20250514"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # DuckDB
    duckdb_path: str = ":memory:"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
