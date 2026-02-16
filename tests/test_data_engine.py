"""Tests for DuckDB + Polars data engine."""

import polars as pl

from fta_agent.data.engine import DataEngine


class TestDataEngine:
    def test_create_and_query(self):
        engine = DataEngine()
        engine.execute("CREATE TABLE test (id INTEGER, name VARCHAR)")
        engine.execute("INSERT INTO test VALUES (1, 'alice'), (2, 'bob')")
        df = engine.query_polars("SELECT * FROM test ORDER BY id")
        assert len(df) == 2
        assert df["name"].to_list() == ["alice", "bob"]
        engine.close()

    def test_load_polars_dataframe(self):
        engine = DataEngine()
        df = pl.DataFrame({"x": [10, 20, 30], "y": ["a", "b", "c"]})
        engine.load_polars(df, "my_table")
        result = engine.query_polars("SELECT * FROM my_table ORDER BY x")
        assert result["x"].to_list() == [10, 20, 30]
        engine.close()

    def test_list_tables(self):
        engine = DataEngine()
        engine.execute("CREATE TABLE accounts (id INTEGER)")
        engine.execute("CREATE TABLE journals (id INTEGER)")
        tables = engine.tables()
        assert "accounts" in tables
        assert "journals" in tables
        engine.close()

    def test_in_memory_isolation(self):
        engine1 = DataEngine()
        engine2 = DataEngine()
        engine1.execute("CREATE TABLE isolated (id INTEGER)")
        assert "isolated" in engine1.tables()
        assert "isolated" not in engine2.tables()
        engine1.close()
        engine2.close()
