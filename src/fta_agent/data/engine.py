"""DuckDB + Polars data engine."""

from __future__ import annotations

from typing import Any

import duckdb
import polars as pl


class DataEngine:
    """Lightweight wrapper around DuckDB with Polars DataFrame I/O."""

    def __init__(self, db_path: str = ":memory:") -> None:
        self.conn = duckdb.connect(db_path)

    def execute(
        self, sql: str, params: list[Any] | None = None
    ) -> duckdb.DuckDBPyConnection:
        """Execute raw SQL and return the connection for chaining."""
        if params:
            return self.conn.execute(sql, params)
        return self.conn.execute(sql)

    def query_polars(self, sql: str) -> pl.DataFrame:
        """Execute SQL and return results as a Polars DataFrame."""
        return self.conn.execute(sql).pl()

    def load_polars(self, df: pl.DataFrame, table_name: str) -> None:
        """Register a Polars DataFrame as a DuckDB table."""
        # DuckDB can query Polars DataFrames directly via replacement scans
        self.conn.register(table_name, df.to_arrow())

    def tables(self) -> list[str]:
        """List all tables in the database."""
        result = self.conn.execute("SHOW TABLES").fetchall()
        return [row[0] for row in result]

    def close(self) -> None:
        """Close the DuckDB connection."""
        self.conn.close()
