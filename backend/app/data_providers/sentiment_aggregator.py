"""Module 3: Market Sentiment Aggregator

Aggregates 7 market-sentiment sub-indicators in a single call.

Sub-indicators:
    VIX, DXY, VXN, GVZ, Fear & Greed, Yield Curve, Put/Call Ratio

Usage::

    from app.data_providers.sentiment_aggregator import SentimentAggregator

    agg = SentimentAggregator()
    data = agg.get_all()
    vix = agg.get_indicator("vix")
"""
from __future__ import annotations

import logging
import os
import time
from typing import Any, Dict, Optional

from app.data_providers import get_cached, set_cached, safe_float

logger = logging.getLogger(__name__)

_CACHE_TTL = int(os.getenv("SENTIMENT_CACHE_TTL") or "300")

# Weights for overall_sentiment score (must sum to 1.0)
_WEIGHTS = {
    "vix": 0.25,
    "fear_greed": 0.25,
    "dxy": 0.15,
    "yield_curve": 0.15,
    "vxn": 0.067,
    "gvz": 0.067,
    "put_call_ratio": 0.066,
}


# ---------------------------------------------------------------------------
# Individual indicator fetchers
# ---------------------------------------------------------------------------

def fetch_fear_greed_index() -> Dict:
    """Fetch CNN Fear & Greed Index from alternative.me API."""
    try:
        import requests

        resp = requests.get(
            "https://api.alternative.me/fng/?limit=1", timeout=8
        )
        resp.raise_for_status()
        data = resp.json()
        entry = data["data"][0]
        value = safe_float(entry.get("value"))
        return {
            "indicator": "fear_greed",
            "value": value,
            "label": entry.get("value_classification", ""),
            "normalized": value / 100.0,
            "timestamp": entry.get("timestamp", ""),
        }
    except Exception as exc:
        logger.debug("fetch_fear_greed_index failed: %s", exc)
        return {"indicator": "fear_greed", "error": str(exc)}


def fetch_vix() -> Dict:
    """Fetch CBOE VIX (yfinance → akshare fallback)."""
    try:
        import yfinance as yf  # type: ignore

        ticker = yf.Ticker("^VIX")
        info = ticker.fast_info
        value = safe_float(getattr(info, "last_price", None))
        return {
            "indicator": "vix",
            "value": value,
            "normalized": min(value / 80.0, 1.0),
        }
    except Exception:
        pass
    try:
        import akshare as ak  # type: ignore

        df = ak.index_vix_baidu()
        if not df.empty:
            value = safe_float(df.iloc[-1].get("收盘", 0))
            return {
                "indicator": "vix",
                "value": value,
                "normalized": min(value / 80.0, 1.0),
            }
    except Exception as exc:
        logger.debug("fetch_vix akshare failed: %s", exc)
    return {"indicator": "vix", "error": "all sources failed"}


def fetch_dollar_index() -> Dict:
    """Fetch US Dollar Index DXY (yfinance → akshare fallback)."""
    try:
        import yfinance as yf  # type: ignore

        ticker = yf.Ticker("DX-Y.NYB")
        info = ticker.fast_info
        value = safe_float(getattr(info, "last_price", None))
        return {
            "indicator": "dxy",
            "value": value,
            "normalized": min(max((value - 80) / 40.0, 0.0), 1.0),
        }
    except Exception:
        pass
    try:
        import akshare as ak  # type: ignore

        df = ak.macro_usa_dxy_hf()
        if not df.empty:
            value = safe_float(df.iloc[-1].iloc[-1])
            return {
                "indicator": "dxy",
                "value": value,
                "normalized": min(max((value - 80) / 40.0, 0.0), 1.0),
            }
    except Exception as exc:
        logger.debug("fetch_dollar_index akshare failed: %s", exc)
    return {"indicator": "dxy", "error": "all sources failed"}


def fetch_yield_curve() -> Dict:
    """Fetch 10-year US Treasury yield as proxy for yield-curve sentiment."""
    try:
        import yfinance as yf  # type: ignore

        ticker = yf.Ticker("^TNX")
        info = ticker.fast_info
        value = safe_float(getattr(info, "last_price", None))
        return {
            "indicator": "yield_curve",
            "value": value,
            "normalized": min(max(value / 10.0, 0.0), 1.0),
        }
    except Exception as exc:
        logger.debug("fetch_yield_curve failed: %s", exc)
        return {"indicator": "yield_curve", "error": str(exc)}


def fetch_vxn() -> Dict:
    """Fetch CBOE Nasdaq Volatility Index (VXN)."""
    try:
        import yfinance as yf  # type: ignore

        ticker = yf.Ticker("^VXN")
        info = ticker.fast_info
        value = safe_float(getattr(info, "last_price", None))
        return {
            "indicator": "vxn",
            "value": value,
            "normalized": min(value / 80.0, 1.0),
        }
    except Exception as exc:
        logger.debug("fetch_vxn failed: %s", exc)
        return {"indicator": "vxn", "error": str(exc)}


def fetch_gvz() -> Dict:
    """Fetch CBOE Gold Volatility Index (GVZ)."""
    try:
        import yfinance as yf  # type: ignore

        ticker = yf.Ticker("^GVZ")
        info = ticker.fast_info
        value = safe_float(getattr(info, "last_price", None))
        return {
            "indicator": "gvz",
            "value": value,
            "normalized": min(value / 50.0, 1.0),
        }
    except Exception as exc:
        logger.debug("fetch_gvz failed: %s", exc)
        return {"indicator": "gvz", "error": str(exc)}


def fetch_put_call_ratio() -> Dict:
    """Estimate put/call ratio using VIX term structure as a proxy."""
    try:
        import yfinance as yf  # type: ignore

        vix9d = safe_float(
            getattr(yf.Ticker("^VIX9D").fast_info, "last_price", None)
        )
        vix = safe_float(
            getattr(yf.Ticker("^VIX").fast_info, "last_price", None)
        )
        ratio = (vix9d / vix) if vix > 0 else 1.0
        return {
            "indicator": "put_call_ratio",
            "value": round(ratio, 4),
            "normalized": min(max(ratio / 2.0, 0.0), 1.0),
        }
    except Exception as exc:
        logger.debug("fetch_put_call_ratio failed: %s", exc)
        return {"indicator": "put_call_ratio", "error": str(exc)}


_FETCHERS = {
    "vix": fetch_vix,
    "dxy": fetch_dollar_index,
    "vxn": fetch_vxn,
    "gvz": fetch_gvz,
    "fear_greed": fetch_fear_greed_index,
    "yield_curve": fetch_yield_curve,
    "put_call_ratio": fetch_put_call_ratio,
}


# ---------------------------------------------------------------------------
# Aggregator class
# ---------------------------------------------------------------------------

class SentimentAggregator:
    """Fetches and caches all 7 sentiment sub-indicators.

    Each indicator is fetched independently so a single failure does not
    prevent the others from being returned.
    """

    def __init__(self, cache_ttl: int = _CACHE_TTL) -> None:
        self._ttl = cache_ttl

    def get_indicator(self, name: str) -> Dict:
        """Return a single indicator by *name*, using cache when available."""
        cache_key = f"sentiment:{name}"
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

        fetcher = _FETCHERS.get(name)
        if not fetcher:
            return {"error": f"Unknown indicator: {name}"}
        result = fetcher()
        result["fetched_at"] = time.time()
        set_cached(cache_key, result, ttl=self._ttl)
        return result

    def get_all(self) -> Dict:
        """Return all indicators plus an aggregated overall_sentiment score."""
        cache_key = "sentiment:all"
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

        indicators: Dict[str, Any] = {}
        for name, fetcher in _FETCHERS.items():
            try:
                result = fetcher()
                result["fetched_at"] = time.time()
                indicators[name] = result
                set_cached(f"sentiment:{name}", result, ttl=self._ttl)
            except Exception as exc:
                logger.warning("Sentiment fetcher '%s' raised: %s", name, exc)
                indicators[name] = {"indicator": name, "error": str(exc)}

        overall = self._compute_overall(indicators)
        output = {
            "indicators": indicators,
            "overall_sentiment": overall,
            "fetched_at": time.time(),
        }
        set_cached(cache_key, output, ttl=self._ttl)
        return output

    @staticmethod
    def _compute_overall(indicators: Dict) -> Dict:
        """Compute a weighted overall sentiment score (0–1, higher = bearish)."""
        weighted_sum = 0.0
        total_weight = 0.0
        for name, weight in _WEIGHTS.items():
            ind = indicators.get(name, {})
            normalized = ind.get("normalized")
            if normalized is not None:
                weighted_sum += safe_float(normalized) * weight
                total_weight += weight
        score = weighted_sum / total_weight if total_weight > 0 else 0.5
        if score >= 0.7:
            label = "extreme_fear"
        elif score >= 0.55:
            label = "fear"
        elif score >= 0.45:
            label = "neutral"
        elif score >= 0.3:
            label = "greed"
        else:
            label = "extreme_greed"
        return {"score": round(score, 4), "label": label}
