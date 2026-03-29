"""Text extraction and cleaning utilities."""

from __future__ import annotations

import re

# Phone regex: international formats with optional country code
PHONE_REGEX = re.compile(
    r"(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}"
)

# Email regex
EMAIL_REGEX = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
)

# Blacklisted email prefixes (generic / non-useful)
EMAIL_BLACKLIST_PREFIXES = {
    "noreply",
    "no-reply",
    "no_reply",
    "donotreply",
    "mailer-daemon",
    "postmaster",
    "abuse",
    "spam",
    "webmaster",
    "hostmaster",
    "admin@example",
    "test",
    "example",
    "sentry",
    "wixpress",
}

# Blacklisted email domains
EMAIL_BLACKLIST_DOMAINS = {
    "example.com",
    "example.org",
    "test.com",
    "sentry.io",
    "wixpress.com",
    "googleapis.com",
    "googleusercontent.com",
    "w3.org",
    "schema.org",
    "facebook.com",
    "twitter.com",
}


def extract_emails(text: str) -> list[str]:
    """Extract valid, non-blacklisted email addresses from text."""
    raw = EMAIL_REGEX.findall(text)
    seen: set[str] = set()
    result: list[str] = []
    for email in raw:
        email_lower = email.lower().strip()
        if email_lower in seen:
            continue
        local_part = email_lower.split("@")[0]
        domain = email_lower.split("@")[1] if "@" in email_lower else ""
        if any(local_part.startswith(bl) for bl in EMAIL_BLACKLIST_PREFIXES):
            continue
        if domain in EMAIL_BLACKLIST_DOMAINS:
            continue
        # Skip image file references masquerading as emails
        if domain.endswith((".png", ".jpg", ".jpeg", ".gif", ".svg")):
            continue
        seen.add(email_lower)
        result.append(email_lower)
    return result


def extract_phones(text: str) -> list[str]:
    """Extract phone numbers from text."""
    matches = PHONE_REGEX.findall(text)
    phones: list[str] = []
    seen: set[str] = set()
    for m in matches:
        cleaned = re.sub(r"[^\d+]", "", m)
        if len(cleaned) < 7 or len(cleaned) > 16:
            continue
        if cleaned not in seen:
            seen.add(cleaned)
            phones.append(m.strip())
    return phones


def clean_company_name(name: str) -> str:
    """Clean up a company name extracted from search results."""
    if not name:
        return ""
    # Remove trailing separators and common suffixes
    name = re.sub(r"\s*[-|–—·•]\s*.*$", "", name)
    name = name.strip(" -|·•\"'")
    return name[:200]
