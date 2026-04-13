"""Data Providers Package

Helpers:
    get_cached(key) -> Optional[Any]
    set_cached(key, value, ttl=300)
    safe_float(value, default=0.0) -> float
"""
import time
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

_cache: dict = {}


def get_cached(key: str) -> Optional[Any]:
    """Retrieve a value from the in-memory cache if it hasn't expired."""
    entry = _cache.get(key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.time() > expires_at:
        del _cache[key]
        return None
    return value


def set_cached(key: str, value: Any, ttl: int = 300) -> None:
    """Store a value in the in-memory cache with a TTL (seconds)."""
    _cache[key] = (value, time.time() + ttl)


def safe_float(value: Any, default: float = 0.0) -> float:
    """Convert *value* to float; return *default* on failure."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default
