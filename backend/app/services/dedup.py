"""Deduplication logic: merge leads referring to the same company."""

from __future__ import annotations

from app.models.lead import Lead
from app.utils.url_helpers import extract_domain


def deduplicate_leads(leads: list[Lead]) -> list[Lead]:
    """Remove duplicate leads based on normalized domain.

    When duplicates are found, merge the richer data into a single lead.
    """
    domain_map: dict[str, Lead] = {}

    for lead in leads:
        domain = extract_domain(lead.website)
        if not domain:
            # No website — use company name as key
            key = lead.company_name.lower().strip()
            if not key:
                continue
        else:
            key = domain

        if key in domain_map:
            _merge_lead(domain_map[key], lead)
        else:
            domain_map[key] = lead

    return list(domain_map.values())


def _merge_lead(existing: Lead, new: Lead) -> None:
    """Merge data from `new` into `existing`, preferring non-empty values."""
    if not existing.company_name and new.company_name:
        existing.company_name = new.company_name

    if not existing.phone and new.phone:
        existing.phone = new.phone

    # Merge emails (deduplicated)
    seen = set(existing.emails)
    for email in new.emails:
        if email not in seen:
            seen.add(email)
            existing.emails.append(email)

    # Merge services
    existing_services = set(existing.services)
    for svc in new.services:
        if svc not in existing_services:
            existing_services.add(svc)
            existing.services.append(svc)

    if not existing.linkedin and new.linkedin:
        existing.linkedin = new.linkedin

    if not existing.city and new.city:
        existing.city = new.city

    if not existing.country and new.country:
        existing.country = new.country

    # Append notes
    if new.notes and new.notes not in existing.notes:
        existing.notes = f"{existing.notes}; {new.notes}".strip("; ")
