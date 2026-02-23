"""Website crawler that visits company sites to extract contact details."""

from __future__ import annotations

import asyncio
import logging
import re

from bs4 import BeautifulSoup

from app.config import MAX_PAGES_TO_CRAWL, SERVICE_KEYWORDS
from app.models.lead import Lead
from app.utils.http_client import fetch
from app.utils.text_helpers import extract_emails, extract_phones
from app.utils.url_helpers import extract_domain, is_same_domain, resolve_link

logger = logging.getLogger(__name__)

# Pages most likely to contain contact info
CONTACT_PAGE_PATTERNS = re.compile(
    r"(contact|about|impressum|team|book|reserv|enquir|get.in.touch|reach.us)",
    re.IGNORECASE,
)

LINKEDIN_PATTERN = re.compile(r"https?://(?:www\.)?linkedin\.com/company/[\w\-]+/?", re.IGNORECASE)


def _find_contact_links(soup: BeautifulSoup, base_url: str) -> list[str]:
    """Find internal links that are likely contact / about pages."""
    links: list[str] = []
    for a_tag in soup.find_all("a", href=True):
        href = a_tag.get("href", "")
        text = a_tag.get_text(strip=True).lower()
        full_url = resolve_link(base_url, href)
        if not full_url or not is_same_domain(base_url, full_url):
            continue
        # Match by link text or by URL path
        if CONTACT_PAGE_PATTERNS.search(text) or CONTACT_PAGE_PATTERNS.search(href):
            links.append(full_url)
    # Deduplicate while preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for link in links:
        if link not in seen:
            seen.add(link)
            unique.append(link)
    return unique[:MAX_PAGES_TO_CRAWL]


def _find_linkedin(soup: BeautifulSoup) -> str:
    """Extract LinkedIn company page URL from page HTML."""
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        match = LINKEDIN_PATTERN.search(href)
        if match:
            return match.group(0).rstrip("/")
    return ""


def _detect_services(text: str) -> list[str]:
    """Detect transport-related services mentioned in page text."""
    text_lower = text.lower()
    found: list[str] = []
    for kw in SERVICE_KEYWORDS:
        if kw in text_lower:
            found.append(kw)
    return found


def _detect_fleet(text: str) -> bool:
    """Detect if the page mentions fleet size."""
    fleet_patterns = [
        r"fleet\s+of\s+\d+",
        r"\d+\s+vehicles?",
        r"fleet\s+size",
        r"our\s+fleet",
    ]
    text_lower = text.lower()
    return any(re.search(p, text_lower) for p in fleet_patterns)


def _detect_api(text: str) -> bool:
    """Detect if the company mentions API / integration capability."""
    api_patterns = ["api", "integration", "xml feed", "affiliate", "b2b portal", "partner portal"]
    text_lower = text.lower()
    return any(p in text_lower for p in api_patterns)


async def crawl_company(lead: Lead) -> Lead:
    """Crawl a company website to enrich the lead with contact details."""
    if not lead.website:
        return lead

    pages_text: list[str] = []
    all_emails: list[str] = []
    all_phones: list[str] = []
    linkedin = ""
    services: list[str] = []

    try:
        # 1. Fetch homepage
        response = await fetch(lead.website)
        html = response.text
        soup = BeautifulSoup(html, "lxml")
        body_text = soup.get_text(separator=" ", strip=True)
        pages_text.append(body_text)

        # Extract from homepage
        all_emails.extend(extract_emails(html))
        all_phones.extend(extract_phones(body_text))
        linkedin = _find_linkedin(soup)
        services.extend(_detect_services(body_text))

        # 2. Find and crawl contact / about pages
        contact_links = _find_contact_links(soup, lead.website)
        for link in contact_links:
            try:
                resp = await fetch(link)
                inner_soup = BeautifulSoup(resp.text, "lxml")
                inner_text = inner_soup.get_text(separator=" ", strip=True)
                pages_text.append(inner_text)
                all_emails.extend(extract_emails(resp.text))
                all_phones.extend(extract_phones(inner_text))
                if not linkedin:
                    linkedin = _find_linkedin(inner_soup)
                services.extend(_detect_services(inner_text))
            except Exception:
                continue

    except Exception as exc:
        logger.warning("Failed to crawl %s: %s", lead.website, exc)
        return lead

    # Deduplicate results
    seen_emails: set[str] = set()
    unique_emails: list[str] = []
    for e in all_emails:
        e_lower = e.lower()
        # Only keep emails from the company's own domain or common providers
        if e_lower not in seen_emails:
            seen_emails.add(e_lower)
            unique_emails.append(e_lower)

    seen_phones: set[str] = set()
    unique_phones: list[str] = []
    for p in all_phones:
        cleaned = p.replace(" ", "").replace("-", "")
        if cleaned not in seen_phones:
            seen_phones.add(cleaned)
            unique_phones.append(p)

    # Update lead
    lead.emails = unique_emails[:5]  # Cap at 5 emails
    if unique_phones and not lead.phone:
        lead.phone = unique_phones[0]
    if linkedin:
        lead.linkedin = linkedin
    lead.services = list(set(services))

    # Check for fleet and API mentions
    full_text = " ".join(pages_text)
    notes_parts: list[str] = []
    if _detect_fleet(full_text):
        notes_parts.append("Fleet mentioned on website")
    if _detect_api(full_text):
        notes_parts.append("API/integration capability detected")
    if notes_parts:
        existing_notes = lead.notes
        lead.notes = "; ".join(notes_parts) + (f" | {existing_notes}" if existing_notes else "")

    return lead


async def crawl_companies(leads: list[Lead], progress_callback=None) -> list[Lead]:
    """Crawl all company websites concurrently (throttled by semaphore)."""
    enriched: list[Lead] = []
    total = len(leads)

    # Process in batches to avoid overwhelming
    batch_size = 5
    for i in range(0, total, batch_size):
        batch = leads[i : i + batch_size]
        tasks = [crawl_company(lead) for lead in batch]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for result in results:
            if isinstance(result, Lead):
                enriched.append(result)
            elif isinstance(result, Exception):
                logger.warning("Crawl error: %s", result)

        if progress_callback:
            await progress_callback(
                stage="crawling",
                message=f"Crawled {min(i + batch_size, total)}/{total} websites",
                current=min(i + batch_size, total),
                total=total,
            )

    return enriched
