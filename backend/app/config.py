"""Application configuration loaded from environment variables."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# Server
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))

# Rate limiting
REQUEST_DELAY_MIN: float = float(os.getenv("REQUEST_DELAY_MIN", "1.5"))
REQUEST_DELAY_MAX: float = float(os.getenv("REQUEST_DELAY_MAX", "3.5"))
MAX_CONCURRENT_REQUESTS: int = int(os.getenv("MAX_CONCURRENT_REQUESTS", "3"))

# Search
MAX_RESULTS_PER_QUERY: int = int(os.getenv("MAX_RESULTS_PER_QUERY", "20"))
MAX_PAGES_TO_CRAWL: int = int(os.getenv("MAX_PAGES_TO_CRAWL", "5"))

# Export
EXPORT_DIR: Path = Path(os.getenv("EXPORT_DIR", "./exports"))
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

# Proxy
HTTP_PROXY: str | None = os.getenv("HTTP_PROXY")
HTTPS_PROXY: str | None = os.getenv("HTTPS_PROXY")

# CORS
CORS_ORIGINS: list[str] = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]

# Default search keywords for the transportation industry
DEFAULT_KEYWORDS: list[str] = [
    "airport transfer",
    "chauffeur service",
    "taxi service",
    "private transfer",
    "limousine service",
    "shuttle service",
]

# Service detection keywords
SERVICE_KEYWORDS: list[str] = [
    "airport transfer",
    "chauffeur",
    "taxi",
    "limousine",
    "limo",
    "shuttle",
    "private hire",
    "executive transfer",
    "corporate transport",
    "sedan service",
    "minibus",
    "fleet",
    "vip transfer",
    "meet and greet",
    "point to point",
]
