"""Data upload endpoint — CSV/Excel/Parquet file ingestion."""

from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request, UploadFile
from pydantic import BaseModel

from fta_agent.data.loader import ingest_upload

router = APIRouter(prefix="/api/data")


class UploadResponse(BaseModel):
    status: str
    table: str
    rows: int
    message: str


@router.post("/upload", response_model=UploadResponse)
async def upload_data(request: Request, file: UploadFile) -> UploadResponse:
    """Upload a GL data file (CSV, Excel, or Parquet) into the data engine."""
    engine = getattr(request.app.state, "engine", None)
    if engine is None:
        raise HTTPException(status_code=503, detail="Data engine not initialized")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    suffix = Path(file.filename).suffix.lower()
    if suffix not in (".csv", ".xlsx", ".xls", ".parquet"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: {suffix}. Use CSV, Excel, or Parquet.",
        )

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)

    try:
        rows = ingest_upload(engine, tmp_path, table_name="postings")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    finally:
        tmp_path.unlink(missing_ok=True)

    return UploadResponse(
        status="ok",
        table="postings",
        rows=rows,
        message=f"Loaded {rows} rows from {file.filename}",
    )
