"""API routes for lead search and export."""

from __future__ import annotations

import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse

from app.models.lead import SearchProgress, SearchRequest
from app.services.orchestrator import run_search, run_search_simple

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["search"])


@router.post("/search")
async def search_leads(request: SearchRequest):
    """Run a full search pipeline and return results as JSON."""
    try:
        result = await run_search_simple(request)
        return result
    except Exception as exc:
        logger.exception("Search failed")
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/search/stream")
async def search_leads_stream(request: SearchRequest):
    """Run a search pipeline with Server-Sent Events for progress updates."""

    async def event_generator():
        async for event in run_search(request):
            if isinstance(event, SearchProgress):
                data = event.model_dump_json()
                yield f"event: progress\ndata: {data}\n\n"
            elif isinstance(event, dict):
                yield f"event: result\ndata: {json.dumps(event)}\n\n"
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/download/{filename}")
async def download_file(filename: str):
    """Download an exported CSV or JSON file."""
    # Prevent path traversal
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    from app.config import EXPORT_DIR

    filepath = EXPORT_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")

    media_type = "text/csv" if filename.endswith(".csv") else "application/json"
    return FileResponse(
        path=str(filepath),
        filename=filename,
        media_type=media_type,
    )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "TransferLead Engine"}
