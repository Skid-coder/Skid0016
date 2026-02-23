"""Orchestrator: coordinates the full search → crawl → score → export pipeline."""

from __future__ import annotations

import asyncio
import logging
from typing import AsyncGenerator

from app.models.lead import Lead, SearchProgress, SearchRequest
from app.services.dedup import deduplicate_leads
from app.services.exporter import export_csv, export_json
from app.services.scoring import score_leads
from app.services.search_engine import search_google, search_google_maps
from app.services.website_crawler import crawl_companies

logger = logging.getLogger(__name__)


async def run_search(request: SearchRequest) -> AsyncGenerator[SearchProgress | dict, None]:
    """Execute the full pipeline, yielding progress events along the way.

    Final yield is a dict with the complete results.
    """
    city = request.city.strip()
    country = request.country.strip()
    keywords = request.keywords if request.keywords else []

    # Stage 1: Google search
    yield SearchProgress(stage="searching", message="Searching Google...", current=0, total=3)
    google_leads = await search_google(city, country, keywords)
    yield SearchProgress(
        stage="searching",
        message=f"Found {len(google_leads)} results from Google search",
        current=1,
        total=3,
        leads_found=len(google_leads),
    )

    # Stage 2: Google Maps search
    yield SearchProgress(stage="searching", message="Searching Google Maps...", current=1, total=3)
    maps_leads = await search_google_maps(city, country, keywords)
    yield SearchProgress(
        stage="searching",
        message=f"Found {len(maps_leads)} results from Google Maps",
        current=2,
        total=3,
        leads_found=len(google_leads) + len(maps_leads),
    )

    # Combine and deduplicate after initial search
    all_leads = google_leads + maps_leads
    all_leads = deduplicate_leads(all_leads)
    yield SearchProgress(
        stage="dedup",
        message=f"{len(all_leads)} unique companies after deduplication",
        current=3,
        total=3,
        leads_found=len(all_leads),
    )

    # Stage 3: Crawl company websites for enrichment
    if all_leads:
        yield SearchProgress(
            stage="crawling",
            message=f"Crawling {len(all_leads)} company websites...",
            current=0,
            total=len(all_leads),
        )

        async def _progress_cb(stage: str, message: str, current: int, total: int):
            pass  # Progress is tracked at batch level

        all_leads = await crawl_companies(all_leads)

        yield SearchProgress(
            stage="crawling",
            message="Website crawling complete",
            current=len(all_leads),
            total=len(all_leads),
            leads_found=len(all_leads),
        )

    # Stage 4: Final dedup after enrichment
    all_leads = deduplicate_leads(all_leads)

    # Stage 5: Score leads
    yield SearchProgress(stage="scoring", message="Scoring leads...", current=0, total=1)
    all_leads = score_leads(all_leads)
    yield SearchProgress(
        stage="scoring",
        message="Scoring complete",
        current=1,
        total=1,
        leads_found=len(all_leads),
    )

    # Stage 6: Export
    yield SearchProgress(stage="exporting", message="Exporting results...", current=0, total=1)
    csv_path = export_csv(all_leads)
    json_path = export_json(all_leads)
    yield SearchProgress(stage="exporting", message="Export complete", current=1, total=1)

    # Final result
    yield {
        "query": f"{city}, {country}" if country else city,
        "total": len(all_leads),
        "leads": [lead.model_dump() for lead in all_leads],
        "export_csv": str(csv_path),
        "export_json": str(json_path),
    }


async def run_search_simple(request: SearchRequest) -> dict:
    """Non-streaming version: runs the full pipeline and returns the final result."""
    result = None
    async for event in run_search(request):
        if isinstance(event, dict):
            result = event
    return result or {"query": request.city, "total": 0, "leads": [], "export_csv": "", "export_json": ""}
