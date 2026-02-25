"""Data loader — fixture loading and file upload ingestion."""

from __future__ import annotations

import logging
from pathlib import Path

import polars as pl

from fta_agent.data.engine import DataEngine
from fta_agent.data.synthetic import generate_synthetic_data, save_fixtures

logger = logging.getLogger(__name__)

FIXTURES_DIR = Path(__file__).parent / "fixtures"


def ensure_fixture(fixtures_dir: Path | None = None) -> Path:
    """Generate Parquet fixtures if they don't exist. Return the directory."""
    target = fixtures_dir or FIXTURES_DIR
    postings_path = target / "postings.parquet"
    if postings_path.exists():
        logger.info("Fixtures already exist at %s", target)
        return target

    logger.info("Generating fixtures at %s ...", target)
    save_fixtures(str(target), formats=("parquet",))
    logger.info("Fixtures generated.")
    return target


def load_fixture(engine: DataEngine, fixtures_dir: Path | None = None) -> None:
    """Load Parquet fixtures into DuckDB tables."""
    target = ensure_fixture(fixtures_dir)

    for name in ("postings", "account_master", "trial_balance"):
        parquet_path = target / f"{name}.parquet"
        if not parquet_path.exists():
            logger.warning("Fixture %s not found, skipping.", parquet_path)
            continue
        df = pl.read_parquet(parquet_path)
        engine.load_polars(df, name)
        logger.info("Loaded %s: %d rows", name, len(df))

    logger.info("All fixtures loaded. Tables: %s", engine.tables())


def ingest_upload(engine: DataEngine, file_path: Path, table_name: str = "postings") -> int:
    """Ingest an uploaded CSV or Excel file into DuckDB.

    Returns the number of rows loaded.
    """
    suffix = file_path.suffix.lower()
    if suffix == ".csv":
        df = pl.read_csv(file_path, infer_schema_length=10000)
    elif suffix in (".xlsx", ".xls"):
        df = pl.read_excel(file_path)
    elif suffix == ".parquet":
        df = pl.read_parquet(file_path)
    else:
        msg = f"Unsupported file format: {suffix}. Use CSV, Excel, or Parquet."
        raise ValueError(msg)

    engine.load_polars(df, table_name)
    logger.info("Ingested %s: %d rows into table '%s'", file_path.name, len(df), table_name)
    return len(df)
