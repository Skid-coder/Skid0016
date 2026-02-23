"""Google search scraper for finding transport companies."""

from __future__ import annotations

import asyncio
import logging
from urllib.parse import quote_plus

from bs4 import BeautifulSoup

from app.config import DEFAULT_KEYWORDS, MAX_RESULTS_PER_QUERY
from app.models.lead import Lead
from app.utils.http_client import fetch
from app.utils.text_helpers import clean_company_name, extract_phones
from app.utils.url_helpers import extract_domain

logger = logging.getLogger(__name__)


def _build_queries(city: str, country: str, keywords: list[str]) -> list[str]:
    """Build a list of Google search queries."""
    location = f"{city} {country}".strip() if country else city
    all_keywords = keywords if keywords else DEFAULT_KEYWORDS[:4]
    queries: list[str] = []
    for kw in all_keywords:
        queries.append(f"{kw} companies in {location}")
        queries.append(f"{kw} {location} contact email")
    return queries


def _parse_google_results(html: str) -> list[dict]:
    """Parse organic results from a Google search results page."""
    soup = BeautifulSoup(html, "lxml")
    results: list[dict] = []

    # Google wraps each organic result in a div with class 'g'
    for g in soup.select("div.g"):
        link_tag = g.select_one("a[href]")
        title_tag = g.select_one("h3")
        snippet_tag = g.select_one("div.VwiC3b, span.aCOpRe, div[data-sncf]")

        if not link_tag:
            continue

        href = link_tag.get("href", "")
        if not href or not href.startswith("http"):
            continue

        # Skip Google's own pages, maps links, youtube, etc.
        domain = extract_domain(href)
        skip_domains = {"google.com", "youtube.com", "facebook.com", "twitter.com",
                        "instagram.com", "yelp.com", "tripadvisor.com", "wikipedia.org",
                        "linkedin.com", "pinterest.com", "tiktok.com"}
        if domain in skip_domains:
            continue

        results.append({
            "title": title_tag.get_text(strip=True) if title_tag else "",
            "url": href,
            "snippet": snippet_tag.get_text(strip=True) if snippet_tag else "",
        })

    return results


async def search_google(city: str, country: str, keywords: list[str]) -> list[Lead]:
    """Run Google searches and return preliminary leads."""
    queries = _build_queries(city, country, keywords)
    all_results: list[dict] = []
    seen_domains: set[str] = set()

    for query in queries:
        if len(all_results) >= MAX_RESULTS_PER_QUERY:
            break

        url = f"https://www.google.com/search?q={quote_plus(query)}&num=10&hl=en"
        try:
            response = await fetch(url)
            parsed = _parse_google_results(response.text)
            for r in parsed:
                domain = extract_domain(r["url"])
                if domain and domain not in seen_domains:
                    seen_domains.add(domain)
                    all_results.append(r)
                    if len(all_results) >= MAX_RESULTS_PER_QUERY:
                        break
        except Exception as exc:
            logger.warning("Google search failed for query '%s': %s", query, exc)
            continue

        # Small delay between queries
        await asyncio.sleep(1)

    # Convert raw results to Lead objects
    leads: list[Lead] = []
    for r in all_results:
        phones = extract_phones(r.get("snippet", ""))
        leads.append(Lead(
            company_name=clean_company_name(r.get("title", "")),
            website=r["url"],
            phone=phones[0] if phones else "",
            city=city,
            country=country,
            source="google_search",
            notes=r.get("snippet", "")[:300],
        ))

    return leads


async def search_google_maps(city: str, country: str, keywords: list[str]) -> list[Lead]:
    """Search Google Maps for transport companies and parse results."""
    location = f"{city} {country}".strip() if country else city
    kw = keywords[0] if keywords else "airport transfer"
    query = f"{kw} in {location}"
    url = f"https://www.google.com/maps/search/{quote_plus(query)}"

    leads: list[Lead] = []
    try:
        response = await fetch(url, timeout=25.0)
        soup = BeautifulSoup(response.text, "lxml")

        # Google Maps embeds business data in various ways;
        # extract whatever structured info is available from the HTML
        for tag in soup.find_all("a", href=True):
            href = tag.get("href", "")
            text = tag.get_text(strip=True)
            if text and len(text) > 3 and href.startswith("http") and "google" not in href:
                domain = extract_domain(href)
                if domain:
                    leads.append(Lead(
                        company_name=clean_company_name(text),
                        website=href,
                        city=city,
                        country=country,
                        source="google_maps",
                    ))
    except Exception as exc:
        logger.warning("Google Maps search failed: %s", exc)

    return leads
