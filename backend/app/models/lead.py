"""Data models for leads and search requests."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """Incoming search request from the UI."""

    country: str = Field(..., min_length=1, max_length=200, description="Country to search in")
    airport: str = Field(..., min_length=1, max_length=200, description="Airport name or IATA code")
    city: str = Field("", description="City derived from airport selection")
    keywords: list[str] = Field(default=[], description="Extra keywords (auto-populated)")


class Lead(BaseModel):
    """A single lead (company) extracted from search results."""

    company_name: str = ""
    website: str = ""
    emails: list[str] = Field(default_factory=list)
    phone: str = ""
    city: str = ""
    country: str = ""
    services: list[str] = Field(default_factory=list)
    linkedin: str = ""
    score: int = 0
    notes: str = ""
    source: str = ""

    @property
    def domain(self) -> str:
        from app.utils.url_helpers import extract_domain
        return extract_domain(self.website)


class SearchResponse(BaseModel):
    """Response returned to the frontend."""

    query: str
    total: int
    leads: list[Lead]
    export_csv: str = ""
    export_json: str = ""


class SearchProgress(BaseModel):
    """Real-time progress update sent via SSE."""

    stage: str
    message: str
    current: int = 0
    total: int = 0
    leads_found: int = 0
