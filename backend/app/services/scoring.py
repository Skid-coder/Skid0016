"""Lead scoring system: assigns a 0-100 score based on data quality signals."""

from __future__ import annotations

from app.models.lead import Lead

# Scoring weights (total possible = 100)
WEIGHTS = {
    "has_email": 25,
    "has_website": 10,
    "has_phone": 10,
    "mentions_airport_transfer": 15,
    "has_multiple_services": 10,
    "has_linkedin": 5,
    "has_fleet_mention": 10,
    "has_api_mention": 5,
    "located_near_airport": 5,
    "has_company_name": 5,
}

AIRPORT_KEYWORDS = [
    "airport transfer",
    "airport",
    "meet and greet",
    "flight",
    "terminal",
    "arrivals",
    "departures",
]


def score_lead(lead: Lead) -> int:
    """Calculate a score from 0 to 100 for a single lead."""
    score = 0

    if lead.emails:
        score += WEIGHTS["has_email"]

    if lead.website:
        score += WEIGHTS["has_website"]

    if lead.phone:
        score += WEIGHTS["has_phone"]

    # Check for airport transfer mentions in services or notes
    combined_text = " ".join(lead.services).lower() + " " + lead.notes.lower()
    if any(kw in combined_text for kw in AIRPORT_KEYWORDS):
        score += WEIGHTS["mentions_airport_transfer"]

    if len(lead.services) >= 2:
        score += WEIGHTS["has_multiple_services"]

    if lead.linkedin:
        score += WEIGHTS["has_linkedin"]

    if "fleet" in lead.notes.lower():
        score += WEIGHTS["has_fleet_mention"]

    if "api" in lead.notes.lower() or "integration" in lead.notes.lower():
        score += WEIGHTS["has_api_mention"]

    if any(kw in combined_text for kw in ["airport", "terminal", "flight"]):
        score += WEIGHTS["located_near_airport"]

    if lead.company_name:
        score += WEIGHTS["has_company_name"]

    return min(score, 100)


def score_leads(leads: list[Lead]) -> list[Lead]:
    """Score all leads and sort by score descending."""
    for lead in leads:
        lead.score = score_lead(lead)
    leads.sort(key=lambda l: l.score, reverse=True)
    return leads
