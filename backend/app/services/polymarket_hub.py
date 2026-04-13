"""Module 17: Polymarket Hub

Provides access to Polymarket prediction-market data.

Controlled by ``POLYMARKET_ENABLED`` env var (default: false).

Usage::

    from app.services.polymarket_hub import PolymarketHub

    hub = PolymarketHub()
    trending = hub.get_trending(limit=10)
    analysis = hub.analyze("market-id-here")
"""
from __future__ import annotations

import logging
import os
from typing import Dict, List, Optional

from app.data_providers import get_cached, set_cached, safe_float

logger = logging.getLogger(__name__)

_ENABLED = os.getenv("POLYMARKET_ENABLED", "false").lower() == "true"
_POLYMARKET_API = "https://clob.polymarket.com"
_GAMMA_API = "https://gamma-api.polymarket.com"


def _check_enabled() -> None:
    if not _ENABLED:
        raise RuntimeError(
            "Polymarket is disabled. Set POLYMARKET_ENABLED=true to enable."
        )


def _fetch_markets(limit: int = 20, category: Optional[str] = None) -> List[Dict]:
    """Fetch active markets from the Polymarket Gamma API."""
    try:
        import requests

        params: Dict = {"limit": limit, "active": "true", "closed": "false"}
        if category:
            params["tag"] = category
        resp = requests.get(f"{_GAMMA_API}/markets", params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as exc:
        logger.warning("_fetch_markets failed: %s", exc)
        return []


def _enrich_market(raw: Dict) -> Dict:
    """Normalise a raw Polymarket market dict into a standard format."""
    outcomes = raw.get("outcomes", [])
    prices = raw.get("outcomePrices", [])
    yes_price = safe_float(prices[0]) if prices else 0.0
    return {
        "id": raw.get("id", ""),
        "question": raw.get("question", ""),
        "category": raw.get("tags", [{}])[0].get("label", "") if raw.get("tags") else "",
        "yes_probability": round(yes_price * 100, 2),
        "no_probability": round((1 - yes_price) * 100, 2),
        "volume": safe_float(raw.get("volume")),
        "liquidity": safe_float(raw.get("liquidity")),
        "end_date": raw.get("endDate", ""),
        "outcomes": outcomes,
        "prices": prices,
    }


class PolymarketHub:
    """Prediction market data hub backed by Polymarket."""

    def get_trending(self, limit: int = 20) -> List[Dict]:
        """Return top trending markets sorted by volume."""
        _check_enabled()
        cache_key = f"polymarket:trending:{limit}"
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

        raw = _fetch_markets(limit=limit)
        enriched = [_enrich_market(m) for m in raw]
        enriched.sort(key=lambda x: x.get("volume", 0), reverse=True)
        set_cached(cache_key, enriched, ttl=300)
        return enriched

    def analyze(self, market_id: str) -> Dict:
        """Return detailed analysis for a single market by *market_id*."""
        _check_enabled()
        cache_key = f"polymarket:market:{market_id}"
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

        try:
            import requests

            resp = requests.get(
                f"{_GAMMA_API}/markets/{market_id}", timeout=10
            )
            resp.raise_for_status()
            raw = resp.json()
            result = _enrich_market(raw)
            set_cached(cache_key, result, ttl=300)
            return result
        except Exception as exc:
            logger.warning("analyze(%s) failed: %s", market_id, exc)
            return {"error": str(exc)}

    def batch_analyze(self, category: Optional[str] = None, limit: int = 20) -> List[Dict]:
        """Return enriched analysis for multiple markets in a *category*."""
        _check_enabled()
        cache_key = f"polymarket:batch:{category}:{limit}"
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

        raw = _fetch_markets(limit=limit, category=category)
        enriched = [_enrich_market(m) for m in raw]
        set_cached(cache_key, enriched, ttl=300)
        return enriched
