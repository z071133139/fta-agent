"""Outcome API endpoints — GET + PATCH for all 6 outcome types.

Serves outcome data from DuckDB via the DataEngine. GET endpoints return
lists of Pydantic models serialized as JSON. PATCH endpoints accept partial
updates for interactive status changes from the dashboard.
"""

from __future__ import annotations

import os
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from fta_agent.data.engine import DataEngine
from fta_agent.data.outcomes import (
    AccountMapping,
    AccountProfile,
    AnalysisFinding,
    DimensionalDecision,
    MJEPattern,
    ReconciliationResult,
    TargetAccount,
)

router = APIRouter(prefix="/api/outcomes")

# Module-level engine — lazily initialized on first request.
_engine: DataEngine | None = None


def _get_engine() -> DataEngine:
    global _engine
    if _engine is None:
        db_path = os.environ.get("FTA_DUCKDB_PATH", ":memory:")
        _engine = DataEngine(db_path=db_path)
    return _engine


def _table_exists(engine: DataEngine, table: str) -> bool:
    return table in engine.tables()


# ---------------------------------------------------------------------------
# GET endpoints
# ---------------------------------------------------------------------------


@router.get("/analysis/profiles", response_model=list[AccountProfile])
async def get_profiles() -> list[dict[str, Any]]:
    """Return all account profiles."""
    engine = _get_engine()
    if not _table_exists(engine, "account_profiles"):
        return []
    df = engine.query_polars("SELECT * FROM account_profiles")
    return df.to_dicts()  # type: ignore[return-value]


@router.get("/analysis/findings", response_model=list[AnalysisFinding])
async def get_findings() -> list[dict[str, Any]]:
    """Return all analysis findings."""
    engine = _get_engine()
    if not _table_exists(engine, "analysis_findings"):
        return []
    df = engine.query_polars("SELECT * FROM analysis_findings")
    return df.to_dicts()  # type: ignore[return-value]


@router.get("/design/decisions", response_model=list[DimensionalDecision])
async def get_decisions() -> list[dict[str, Any]]:
    """Return all dimensional decisions."""
    engine = _get_engine()
    if not _table_exists(engine, "dimensional_decisions"):
        return []
    df = engine.query_polars("SELECT * FROM dimensional_decisions")
    return df.to_dicts()  # type: ignore[return-value]


@router.get("/target-coa/accounts", response_model=list[TargetAccount])
async def get_target_accounts() -> list[dict[str, Any]]:
    """Return all target COA accounts."""
    engine = _get_engine()
    if not _table_exists(engine, "target_accounts"):
        return []
    df = engine.query_polars("SELECT * FROM target_accounts")
    return df.to_dicts()  # type: ignore[return-value]


@router.get("/mapping", response_model=list[AccountMapping])
async def get_mappings() -> list[dict[str, Any]]:
    """Return all account mappings."""
    engine = _get_engine()
    if not _table_exists(engine, "account_mappings"):
        return []
    df = engine.query_polars("SELECT * FROM account_mappings")
    return df.to_dicts()  # type: ignore[return-value]


@router.get("/mje/patterns", response_model=list[MJEPattern])
async def get_mje_patterns() -> list[dict[str, Any]]:
    """Return all MJE patterns."""
    engine = _get_engine()
    if not _table_exists(engine, "mje_patterns"):
        return []
    df = engine.query_polars("SELECT * FROM mje_patterns")
    return df.to_dicts()  # type: ignore[return-value]


@router.get("/validation", response_model=list[ReconciliationResult])
async def get_reconciliation() -> list[dict[str, Any]]:
    """Return all reconciliation results."""
    engine = _get_engine()
    if not _table_exists(engine, "reconciliation_results"):
        return []
    df = engine.query_polars("SELECT * FROM reconciliation_results")
    return df.to_dicts()  # type: ignore[return-value]


# ---------------------------------------------------------------------------
# PATCH endpoints (interactive status updates)
# ---------------------------------------------------------------------------


class FindingPatch(BaseModel):
    status: str | None = None
    resolution: str | None = None


class DecisionPatch(BaseModel):
    status: str | None = None
    decided_by: str | None = None


class MappingPatch(BaseModel):
    status: str | None = None
    validated_by: str | None = None


@router.patch("/analysis/findings/{finding_id}")
async def patch_finding(finding_id: str, patch: FindingPatch) -> dict[str, str]:
    """Update a finding's status or resolution."""
    engine = _get_engine()
    if not _table_exists(engine, "analysis_findings"):
        raise HTTPException(status_code=404, detail="No findings data loaded")

    cols: list[str] = []
    params: list[str] = []
    if patch.status is not None:
        cols.append("status = ?")
        params.append(patch.status)
    if patch.resolution is not None:
        cols.append("resolution = ?")
        params.append(patch.resolution)
    if not cols:
        raise HTTPException(status_code=400, detail="No fields to update")

    params.append(finding_id)
    engine.execute(
        f"UPDATE analysis_findings SET {', '.join(cols)} WHERE finding_id = ?",
        params,
    )
    return {"status": "updated", "finding_id": finding_id}


@router.patch("/design/decisions/{decision_id}")
async def patch_decision(
    decision_id: str, patch: DecisionPatch
) -> dict[str, str]:
    """Update a decision's status or decided_by."""
    engine = _get_engine()
    if not _table_exists(engine, "dimensional_decisions"):
        raise HTTPException(status_code=404, detail="No decisions data loaded")

    cols: list[str] = []
    params: list[str] = []
    if patch.status is not None:
        cols.append("status = ?")
        params.append(patch.status)
    if patch.decided_by is not None:
        cols.append("decided_by = ?")
        params.append(patch.decided_by)
    if not cols:
        raise HTTPException(status_code=400, detail="No fields to update")

    params.append(decision_id)
    engine.execute(
        f"UPDATE dimensional_decisions SET {', '.join(cols)} WHERE decision_id = ?",
        params,
    )
    return {"status": "updated", "decision_id": decision_id}


@router.patch("/mapping/{mapping_id}")
async def patch_mapping(mapping_id: str, patch: MappingPatch) -> dict[str, str]:
    """Update a mapping's status or validated_by."""
    engine = _get_engine()
    if not _table_exists(engine, "account_mappings"):
        raise HTTPException(status_code=404, detail="No mapping data loaded")

    cols: list[str] = []
    params: list[str] = []
    if patch.status is not None:
        cols.append("status = ?")
        params.append(patch.status)
    if patch.validated_by is not None:
        cols.append("validated_by = ?")
        params.append(patch.validated_by)
    if not cols:
        raise HTTPException(status_code=400, detail="No fields to update")

    params.append(mapping_id)
    engine.execute(
        f"UPDATE account_mappings SET {', '.join(cols)} WHERE mapping_id = ?",
        params,
    )
    return {"status": "updated", "mapping_id": mapping_id}
