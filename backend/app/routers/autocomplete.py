"""API routes for country and airport autocomplete."""

from __future__ import annotations

from fastapi import APIRouter

from app.data.airports import get_countries as _get_all_countries, search_airports, search_countries

router = APIRouter(prefix="/api", tags=["autocomplete"])


@router.get("/countries")
async def get_countries(q: str = ""):
    """Search countries for autocomplete."""
    results = search_countries(q)
    return {"results": results}


@router.get("/countries/all")
async def get_all_countries():
    """Return full sorted list of all countries for dropdown."""
    return {"results": _get_all_countries()}


@router.get("/airports")
async def get_airports(q: str = "", country: str = ""):
    """Search airports for autocomplete, optionally filtered by country."""
    results = search_airports(q, country)
    return {"results": results}
