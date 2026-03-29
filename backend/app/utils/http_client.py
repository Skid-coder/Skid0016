"""Shared async HTTP client with anti-blocking measures."""

from __future__ import annotations

import asyncio
import random

import httpx
from fake_useragent import UserAgent
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import (
    HTTP_PROXY,
    HTTPS_PROXY,
    MAX_CONCURRENT_REQUESTS,
    REQUEST_DELAY_MIN,
    REQUEST_DELAY_MAX,
)

_ua = UserAgent(fallback="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

# Global semaphore to throttle concurrent outbound requests
_semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)


def _random_headers() -> dict[str, str]:
    return {
        "User-Agent": _ua.random,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
    }


def _build_proxy_map() -> dict[str, str] | None:
    proxies: dict[str, str] = {}
    if HTTP_PROXY:
        proxies["http://"] = HTTP_PROXY
    if HTTPS_PROXY:
        proxies["https://"] = HTTPS_PROXY
    return proxies or None


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), reraise=True)
async def fetch(url: str, *, timeout: float = 20.0) -> httpx.Response:
    """Fetch a URL with rate limiting, random UA, and retries."""
    async with _semaphore:
        # Random delay between requests
        delay = random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX)
        await asyncio.sleep(delay)

        proxy_map = _build_proxy_map()
        async with httpx.AsyncClient(
            headers=_random_headers(),
            follow_redirects=True,
            timeout=timeout,
            proxy=proxy_map,
        ) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response
