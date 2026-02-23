"""Export leads to CSV and JSON files."""

from __future__ import annotations

import csv
import json
import uuid
from pathlib import Path

from app.config import EXPORT_DIR
from app.models.lead import Lead

CSV_COLUMNS = [
    "Company",
    "Website",
    "Email",
    "Phone",
    "City",
    "Country",
    "Services",
    "LinkedIn",
    "Score",
    "Notes",
]


def _lead_to_row(lead: Lead) -> dict[str, str]:
    return {
        "Company": lead.company_name,
        "Website": lead.website,
        "Email": "; ".join(lead.emails),
        "Phone": lead.phone,
        "City": lead.city,
        "Country": lead.country,
        "Services": ", ".join(lead.services),
        "LinkedIn": lead.linkedin,
        "Score": str(lead.score),
        "Notes": lead.notes,
    }


def export_csv(leads: list[Lead], filename: str | None = None) -> Path:
    """Write leads to a CSV file and return the file path."""
    if not filename:
        filename = f"leads_{uuid.uuid4().hex[:8]}.csv"
    filepath = EXPORT_DIR / filename
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        for lead in leads:
            writer.writerow(_lead_to_row(lead))
    return filepath


def export_json(leads: list[Lead], filename: str | None = None) -> Path:
    """Write leads to a JSON file and return the file path."""
    if not filename:
        filename = f"leads_{uuid.uuid4().hex[:8]}.json"
    filepath = EXPORT_DIR / filename
    data = [lead.model_dump() for lead in leads]
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return filepath
