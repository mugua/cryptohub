"""Module 12: Futures Data Extended

US and Chinese futures with multi-source fallback.

US futures: ES, NQ, YM, RTY, ZB, ZN (Yahoo Finance suffixes)
CN futures:  rb (rebar), i (iron ore), j (coking coal),
             cu (copper), au (gold), ag (silver) — via AKShare

Fallback chain: Twelve Data → yfinance → Tiingo → AKShare (CN only)

Environment variable:
    FUTURES_CN_ENABLED  — set "true" to include CN futures (default false)

Usage::

    from app.data_sources.futures_extended import get_futures_quotes
    data = get_futures_quotes()
"""
from __future__ import annotations

import logging
import os
from typing import Dict, List, Optional

from app.data_providers import get_cached, set_cached, safe_float

logger = logging.getLogger(__name__)

_TWELVEDATA_KEY = os.getenv("TWELVEDATA_API_KEY") or ""
_TIINGO_KEY = os.getenv("TIINGO_API_KEY") or ""
_CN_ENABLED = os.getenv("FUTURES_CN_ENABLED", "false").lower() == "true"

# ---------------------------------------------------------------------------
# US futures catalogue
# ---------------------------------------------------------------------------

US_FUTURES: List[Dict] = [
    {"symbol": "ES=F",  "name": "E-mini S&P 500",   "name_cn": "标普500期货",  "category": "equity_index"},
    {"symbol": "NQ=F",  "name": "E-mini NASDAQ",     "name_cn": "纳斯达克期货","category": "equity_index"},
    {"symbol": "YM=F",  "name": "E-mini Dow Jones",  "name_cn": "道指期货",    "category": "equity_index"},
    {"symbol": "RTY=F", "name": "E-mini Russell2000","name_cn": "罗素2000期货","category": "equity_index"},
    {"symbol": "ZB=F",  "name": "US 30-Year Bond",   "name_cn": "30年国债期货","category": "rates"},
    {"symbol": "ZN=F",  "name": "US 10-Year Note",   "name_cn": "10年国债期货","category": "rates"},
    {"symbol": "CL=F",  "name": "Crude Oil WTI",     "name_cn": "原油期货",    "category": "energy"},
    {"symbol": "GC=F",  "name": "Gold",               "name_cn": "黄金期货",   "category": "precious_metals"},
    {"symbol": "SI=F",  "name": "Silver",             "name_cn": "白银期货",   "category": "precious_metals"},
]

CN_FUTURES_SYMBOLS: List[Dict] = [
    {"symbol": "RB0",  "name": "Rebar",            "name_cn": "螺纹钢", "category": "industrial_metals"},
    {"symbol": "I0",   "name": "Iron Ore",          "name_cn": "铁矿石", "category": "industrial_metals"},
    {"symbol": "J0",   "name": "Coking Coal",       "name_cn": "焦炭",   "category": "energy"},
    {"symbol": "CU0",  "name": "SHFE Copper",       "name_cn": "沪铜",   "category": "industrial_metals"},
    {"symbol": "AU0",  "name": "SHFE Gold",         "name_cn": "沪金",   "category": "precious_metals"},
    {"symbol": "AG0",  "name": "SHFE Silver",       "name_cn": "沪银",   "category": "precious_metals"},
]

# ---------------------------------------------------------------------------
# Source implementations
# ---------------------------------------------------------------------------

def _yfinance_future(item: Dict) -> Optional[Dict]:
    try:
        import yfinance as yf  # type: ignore

        fi = yf.Ticker(item["symbol"]).fast_info
        last = safe_float(getattr(fi, "last_price", None))
        prev = safe_float(getattr(fi, "previous_close", None))
        if not last:
            return None
        change = last - prev
        return {
            "symbol": item["symbol"],
            "name": item["name"],
            "name_cn": item["name_cn"],
            "price": last,
            "change": round(change, 4),
            "changePercent": round(change / prev * 100 if prev else 0, 4),
            "category": item["category"],
        }
    except Exception as exc:
        logger.debug("yfinance future(%s): %s", item["symbol"], exc)
        return None


def _twelvedata_future(item: Dict) -> Optional[Dict]:
    if not _TWELVEDATA_KEY:
        return None
    try:
        import requests

        resp = requests.get(
            "https://api.twelvedata.com/price",
            params={"symbol": item["symbol"], "apikey": _TWELVEDATA_KEY},
            timeout=8,
        )
        resp.raise_for_status()
        data = resp.json()
        price = safe_float(data.get("price"))
        if not price:
            return None
        return {
            "symbol": item["symbol"],
            "name": item["name"],
            "name_cn": item["name_cn"],
            "price": price,
            "change": 0.0,
            "changePercent": 0.0,
            "category": item["category"],
        }
    except Exception as exc:
        logger.debug("twelvedata future(%s): %s", item["symbol"], exc)
        return None


def _tiingo_future(item: Dict) -> Optional[Dict]:
    if not _TIINGO_KEY:
        return None
    try:
        import requests

        resp = requests.get(
            f"https://api.tiingo.com/tiingo/daily/{item['symbol'].replace('=F','')}/prices",
            headers={"Authorization": f"Token {_TIINGO_KEY}", "Content-Type": "application/json"},
            timeout=8,
        )
        resp.raise_for_status()
        rows = resp.json()
        if not rows:
            return None
        last = safe_float(rows[0].get("close"))
        prev = safe_float(rows[0].get("adjClose", last))
        change = last - prev
        return {
            "symbol": item["symbol"],
            "name": item["name"],
            "name_cn": item["name_cn"],
            "price": last,
            "change": round(change, 4),
            "changePercent": round(change / prev * 100 if prev else 0, 4),
            "category": item["category"],
        }
    except Exception as exc:
        logger.debug("tiingo future(%s): %s", item["symbol"], exc)
        return None


def _akshare_cn_future(item: Dict) -> Optional[Dict]:
    try:
        import akshare as ak  # type: ignore

        df = ak.futures_zh_spot(symbol=item["symbol"], market="CF", adjust=False)
        if df is None or df.empty:
            return None
        row = df.iloc[-1]
        last = safe_float(row.get("最新价", 0))
        prev = safe_float(row.get("昨结算", 0))
        change = last - prev
        return {
            "symbol": item["symbol"],
            "name": item["name"],
            "name_cn": item["name_cn"],
            "price": last,
            "change": round(change, 4),
            "changePercent": round(change / prev * 100 if prev else 0, 4),
            "category": item["category"],
        }
    except ImportError:
        return None
    except Exception as exc:
        logger.debug("akshare cn future(%s): %s", item["symbol"], exc)
        return None


def _fetch_us_future(item: Dict) -> Optional[Dict]:
    for fn in (_twelvedata_future, _yfinance_future, _tiingo_future):
        result = fn(item)
        if result:
            return result
    return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_futures_quotes() -> Dict:
    """Return US (and optionally CN) futures quotes with caching."""
    cache_key = "futures:extended"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    results: List[Dict] = []

    for item in US_FUTURES:
        try:
            q = _fetch_us_future(item)
            if q:
                results.append(q)
        except Exception as exc:
            logger.warning("futures %s failed: %s", item["symbol"], exc)

    if _CN_ENABLED:
        for item in CN_FUTURES_SYMBOLS:
            try:
                q = _akshare_cn_future(item)
                if q:
                    results.append(q)
            except Exception as exc:
                logger.warning("cn_future %s failed: %s", item["symbol"], exc)

    output = {"futures": results, "count": len(results)}
    set_cached(cache_key, output, ttl=300)
    return output
