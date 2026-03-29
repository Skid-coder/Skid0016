"""URL parsing and normalization utilities."""

from __future__ import annotations

from urllib.parse import urljoin, urlparse

import tldextract


def extract_domain(url: str) -> str:
    """Return the registered domain (e.g. 'example.com') from a URL."""
    if not url:
        return ""
    ext = tldextract.extract(url)
    if ext.domain and ext.suffix:
        return f"{ext.domain}.{ext.suffix}".lower()
    return ""


def normalize_url(url: str) -> str:
    """Normalize a URL to a canonical form for deduplication."""
    if not url:
        return ""
    url = url.strip().rstrip("/")
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    parsed = urlparse(url)
    # Strip www prefix for normalization
    host = parsed.netloc.lower().replace("www.", "")
    return f"{parsed.scheme}://{host}{parsed.path}".rstrip("/")


def resolve_link(base_url: str, href: str) -> str:
    """Resolve a relative link against a base URL."""
    if not href:
        return ""
    if href.startswith(("mailto:", "tel:", "javascript:", "#")):
        return ""
    return urljoin(base_url, href)


def is_same_domain(url1: str, url2: str) -> bool:
    """Check if two URLs belong to the same registered domain."""
    return extract_domain(url1) == extract_domain(url2)
