"""Orchestrator: coordinates the full search -> crawl -> score -> export pipeline."""

from __future__ import annotations

import logging
import re
from typing import AsyncGenerator

from app.data.airports import search_airports
from app.models.lead import SearchProgress, SearchRequest
from app.services.dedup import deduplicate_leads
from app.services.exporter import export_csv, export_json
from app.services.scoring import score_leads
from app.services.search_engine import search_bing, search_duckduckgo, search_google
from app.services.website_crawler import crawl_companies

logger = logging.getLogger(__name__)


def _resolve_airport(request: SearchRequest) -> tuple[str, str]:
    """Resolve airport input into (airport_name, city)."""
    airport_input = request.airport.strip()
    city = request.city.strip() if request.city else ""

    # Try to extract IATA code from input like "London Heathrow (LHR)"
    iata_match = re.search(r"\(([A-Z]{3})\)", airport_input)
    if iata_match:
        iata = iata_match.group(1)
        results = search_airports(iata)
        if results:
            return results[0]["name"], city or results[0]["city"]

    # Try direct IATA lookup (user typed just "LHR")
    if len(airport_input) == 3 and airport_input.isalpha():
        results = search_airports(airport_input.upper())
        if results:
            return results[0]["name"], city or results[0]["city"]

    # Try searching by name
    results = search_airports(airport_input, request.country.strip())
    if results:
        return results[0]["name"], city or results[0]["city"]

    # Fallback: use the raw input
    return airport_input, city or airport_input


async def run_search(request: SearchRequest) -> AsyncGenerator[SearchProgress | dict, None]:
    """Execute the full pipeline, yielding progress events along the way."""
    country = request.country.strip()
    airport_name, city = _resolve_airport(request)
    keywords = request.keywords if request.keywords else []

    logger.info("Starting search: airport=%s, city=%s, country=%s", airport_name, city, country)

    # Stage 1: DuckDuckGo search (primary, most reliable)
    yield SearchProgress(stage="searching", message=f"Searching for transport companies near {airport_name}...", current=0, total=4)
    ddg_leads = await search_duckduckgo(airport_name, city, country, keywords)
    yield SearchProgress(
        stage="searching",
        message=f"Found {len(ddg_leads)} results from DuckDuckGo",
        current=1,
        total=4,
        leads_found=len(ddg_leads),
    )

    # Stage 2: Bing search (secondary)
    yield SearchProgress(stage="searching", message="Searching Bing for more results...", current=1, total=4)
    bing_leads = await search_bing(airport_name, city, country, keywords)
    yield SearchProgress(
        stage="searching",
        message=f"Found {len(bing_leads)} results from Bing",
        current=2,
        total=4,
        leads_found=len(ddg_leads) + len(bing_leads),
    )

    # Stage 3: Google search (fallback)
    yield SearchProgress(stage="searching", message="Searching Google as fallback...", current=2, total=4)
    google_leads = await search_google(airport_name, city, country, keywords)
    yield SearchProgress(
        stage="searching",
        message=f"Found {len(google_leads)} results from Google",
        current=3,
        total=4,
        leads_found=len(ddg_leads) + len(bing_leads) + len(google_leads),
    )

    # Combine and deduplicate
    all_leads = ddg_leads + bing_leads + google_leads
    all_leads = deduplicate_leads(all_leads)
    yield SearchProgress(
        stage="dedup",
        message=f"{len(all_leads)} unique companies after deduplication",
        current=4,
        total=4,
        leads_found=len(all_leads),
    )

    # Stage 4: Crawl company websites for enrichment
    if all_leads:
        yield SearchProgress(
            stage="crawling",
            message=f"Crawling {len(all_leads)} company websites for contact details...",
            current=0,
            total=len(all_leads),
        )

        all_leads = await crawl_companies(all_leads)

        yield SearchProgress(
            stage="crawling",
            message="Website crawling complete",
            current=len(all_leads),
            total=len(all_leads),
            leads_found=len(all_leads),
        )

    # Stage 5: Final dedup after enrichment
    all_leads = deduplicate_leads(all_leads)

    # Stage 6: Score leads
    yield SearchProgress(stage="scoring", message="Scoring leads...", current=0, total=1)
    all_leads = score_leads(all_leads)
    yield SearchProgress(
        stage="scoring",
        message="Scoring complete",
        current=1,
        total=1,
        leads_found=len(all_leads),
    )

    # Stage 7: Export
    yield SearchProgress(stage="exporting", message="Exporting results...", current=0, total=1)
    csv_path = export_csv(all_leads)
    json_path = export_json(all_leads)
    yield SearchProgress(stage="exporting", message="Export complete", current=1, total=1)

    # Final result
    query_label = f"{airport_name}, {city}, {country}"
    yield {
        "query": query_label,
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
    return result or {"query": request.airport, "total": 0, "leads": [], "export_csv": "", "export_json": ""}
