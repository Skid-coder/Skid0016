"""Multi-engine search scraper for finding transport companies.

Uses DuckDuckGo HTML and Bing as search backends (Google SERP is
unreliable due to frequent HTML changes and aggressive bot detection).
"""

from __future__ import annotations

import asyncio
import logging
import re
from urllib.parse import quote_plus, urlparse, parse_qs, unquote

from bs4 import BeautifulSoup

from app.config import DEFAULT_KEYWORDS, MAX_RESULTS_PER_QUERY
from app.models.lead import Lead
from app.utils.http_client import fetch
from app.utils.text_helpers import clean_company_name, extract_phones
from app.utils.url_helpers import extract_domain

logger = logging.getLogger(__name__)

SKIP_DOMAINS = {
    "google.com", "youtube.com", "facebook.com", "twitter.com",
    "instagram.com", "yelp.com", "tripadvisor.com", "wikipedia.org",
    "linkedin.com", "pinterest.com", "tiktok.com", "reddit.com",
    "amazon.com", "ebay.com", "quora.com", "bbc.com", "cnn.com",
    "duckduckgo.com", "bing.com", "yahoo.com", "msn.com",
    "x.com", "threads.net", "medium.com",
}


def _build_queries(airport_name: str, city: str, country: str, keywords: list[str]) -> list[str]:
    """Build search queries optimized for finding transport companies."""
    all_keywords = keywords if keywords else DEFAULT_KEYWORDS[:4]
    queries: list[str] = []

    # Airport-specific queries
    for kw in all_keywords[:3]:
        queries.append(f"{kw} companies near {airport_name} {country}")
        queries.append(f"{kw} {city} {country}")

    # Direct queries
    queries.append(f"airport transfer service {airport_name} {country} contact")
    queries.append(f"private car hire {city} airport {country}")
    queries.append(f"taxi company {city} {country} airport transfers")

    return queries


def _is_valid_result(url: str) -> bool:
    """Check if a URL is a valid company website (not a search engine or social media)."""
    if not url or not url.startswith("http"):
        return False
    domain = extract_domain(url)
    if not domain:
        return False
    if domain in SKIP_DOMAINS:
        return False
    # Skip common non-company domains
    for skip in SKIP_DOMAINS:
        if domain.endswith("." + skip):
            return False
    return True


# ── DuckDuckGo HTML search ─────────────────────────────────────────

def _parse_duckduckgo_results(html: str) -> list[dict]:
    """Parse search results from DuckDuckGo HTML-only endpoint."""
    soup = BeautifulSoup(html, "lxml")
    results: list[dict] = []

    # DuckDuckGo HTML results are in div.result or div.web-result
    for result_div in soup.select(".result, .web-result"):
        link_tag = result_div.select_one("a.result__a")
        snippet_tag = result_div.select_one("a.result__snippet, .result__snippet")

        if not link_tag:
            continue

        href = link_tag.get("href", "")
        # DuckDuckGo sometimes wraps URLs in a redirect
        if "duckduckgo.com" in href and "uddg=" in href:
            parsed = urlparse(href)
            qs = parse_qs(parsed.query)
            href = unquote(qs.get("uddg", [href])[0])

        if not _is_valid_result(href):
            continue

        title = link_tag.get_text(strip=True)
        snippet = snippet_tag.get_text(strip=True) if snippet_tag else ""

        results.append({
            "title": title,
            "url": href,
            "snippet": snippet,
        })

    return results


async def search_duckduckgo(airport_name: str, city: str, country: str, keywords: list[str]) -> list[Lead]:
    """Run DuckDuckGo HTML searches and return preliminary leads."""
    queries = _build_queries(airport_name, city, country, keywords)
    all_results: list[dict] = []
    seen_domains: set[str] = set()

    for query in queries:
        if len(all_results) >= MAX_RESULTS_PER_QUERY:
            break

        url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
        try:
            response = await fetch(url)
            parsed = _parse_duckduckgo_results(response.text)
            logger.info("DuckDuckGo query '%s' returned %d results", query, len(parsed))
            for r in parsed:
                domain = extract_domain(r["url"])
                if domain and domain not in seen_domains:
                    seen_domains.add(domain)
                    all_results.append(r)
                    if len(all_results) >= MAX_RESULTS_PER_QUERY:
                        break
        except Exception as exc:
            logger.warning("DuckDuckGo search failed for '%s': %s", query, exc)
            continue

        await asyncio.sleep(1.5)

    return _results_to_leads(all_results, city, country, "duckduckgo")


# ── Bing search ─────────────────────────────────────────────────────

def _parse_bing_results(html: str) -> list[dict]:
    """Parse search results from Bing."""
    soup = BeautifulSoup(html, "lxml")
    results: list[dict] = []

    # Bing organic results are in li.b_algo
    for item in soup.select("li.b_algo"):
        link_tag = item.select_one("h2 a")
        snippet_tag = item.select_one(".b_caption p, .b_algoSlug")

        if not link_tag:
            continue

        href = link_tag.get("href", "")
        if not _is_valid_result(href):
            continue

        title = link_tag.get_text(strip=True)
        snippet = snippet_tag.get_text(strip=True) if snippet_tag else ""

        results.append({
            "title": title,
            "url": href,
            "snippet": snippet,
        })

    return results


async def search_bing(airport_name: str, city: str, country: str, keywords: list[str]) -> list[Lead]:
    """Run Bing searches and return preliminary leads."""
    queries = _build_queries(airport_name, city, country, keywords)
    all_results: list[dict] = []
    seen_domains: set[str] = set()

    for query in queries[:4]:  # Fewer Bing queries to avoid blocking
        if len(all_results) >= MAX_RESULTS_PER_QUERY:
            break

        url = f"https://www.bing.com/search?q={quote_plus(query)}&count=15"
        try:
            response = await fetch(url)
            parsed = _parse_bing_results(response.text)
            logger.info("Bing query '%s' returned %d results", query, len(parsed))
            for r in parsed:
                domain = extract_domain(r["url"])
                if domain and domain not in seen_domains:
                    seen_domains.add(domain)
                    all_results.append(r)
                    if len(all_results) >= MAX_RESULTS_PER_QUERY:
                        break
        except Exception as exc:
            logger.warning("Bing search failed for '%s': %s", query, exc)
            continue

        await asyncio.sleep(1.5)

    return _results_to_leads(all_results, city, country, "bing")


# ── Google search (improved fallback) ───────────────────────────────

def _parse_google_results(html: str) -> list[dict]:
    """Parse organic results from Google SERP using multiple selector strategies."""
    soup = BeautifulSoup(html, "lxml")
    results: list[dict] = []

    # Strategy 1: Classic div.g selector
    containers = soup.select("div.g")

    # Strategy 2: If div.g fails, try data-sokoban-container
    if not containers:
        containers = soup.select("div[data-sokoban-container]")

    # Strategy 3: Try broader approach - find all h3 tags with parent links
    if not containers:
        for h3 in soup.find_all("h3"):
            parent_a = h3.find_parent("a")
            if parent_a and parent_a.get("href", "").startswith("http"):
                href = parent_a["href"]
                if _is_valid_result(href):
                    results.append({
                        "title": h3.get_text(strip=True),
                        "url": href,
                        "snippet": "",
                    })
        return results

    # Parse containers
    for g in containers:
        link_tag = g.select_one("a[href]")
        title_tag = g.select_one("h3")
        snippet_tag = g.select_one("div.VwiC3b, span.aCOpRe, div[data-sncf], div[style*='line-clamp']")

        if not link_tag:
            continue

        href = link_tag.get("href", "")
        if not _is_valid_result(href):
            continue

        results.append({
            "title": title_tag.get_text(strip=True) if title_tag else "",
            "url": href,
            "snippet": snippet_tag.get_text(strip=True) if snippet_tag else "",
        })

    return results


async def search_google(airport_name: str, city: str, country: str, keywords: list[str]) -> list[Lead]:
    """Run Google searches as a fallback source."""
    queries = _build_queries(airport_name, city, country, keywords)
    all_results: list[dict] = []
    seen_domains: set[str] = set()

    for query in queries[:3]:  # Fewer Google queries to avoid blocking
        if len(all_results) >= MAX_RESULTS_PER_QUERY:
            break

        url = f"https://www.google.com/search?q={quote_plus(query)}&num=10&hl=en"
        try:
            response = await fetch(url)
            parsed = _parse_google_results(response.text)
            logger.info("Google query '%s' returned %d results", query, len(parsed))
            for r in parsed:
                domain = extract_domain(r["url"])
                if domain and domain not in seen_domains:
                    seen_domains.add(domain)
                    all_results.append(r)
                    if len(all_results) >= MAX_RESULTS_PER_QUERY:
                        break
        except Exception as exc:
            logger.warning("Google search failed for '%s': %s", query, exc)
            continue

        await asyncio.sleep(2)

    return _results_to_leads(all_results, city, country, "google_search")


# ── Helper ──────────────────────────────────────────────────────────

def _results_to_leads(results: list[dict], city: str, country: str, source: str) -> list[Lead]:
    """Convert raw search results into Lead objects."""
    leads: list[Lead] = []
    for r in results:
        phones = extract_phones(r.get("snippet", ""))
        leads.append(Lead(
            company_name=clean_company_name(r.get("title", "")),
            website=r["url"],
            phone=phones[0] if phones else "",
            city=city,
            country=country,
            source=source,
            notes=r.get("snippet", "")[:300],
        ))
    return leads
