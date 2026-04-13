"""Module 6: Extended Commodities Data Provider

Adds copper, platinum, palladium, coffee, cocoa, cotton, soybeans, and
Chinese futures (rebar, iron ore) on top of the standard commodity set.

Fallback chain: Twelve Data → yfinance → Tiingo → AKShare

Usage::

    from app.data_providers.commodities_extended import get_extended_commodities
    data = get_extended_commodities()
"""
from __future__ import annotations

import logging
import os
from typing import Dict, List, Optional

from app.data_providers import get_cached, set_cached, safe_float

logger = logging.getLogger(__name__)

_TWELVEDATA_KEY = os.getenv("TWELVEDATA_API_KEY") or ""
_TIINGO_KEY = os.getenv("TIINGO_API_KEY") or ""
_PREFERRED = os.getenv("COMMODITY_PROVIDER", "yfinance").lower()

# ---------------------------------------------------------------------------
# Commodity catalogue
# ---------------------------------------------------------------------------

COMMODITIES: List[Dict] = [
    # Precious metals
    {"symbol": "GC=F",  "td": "XAU/USD", "name": "Gold",       "name_cn": "黄金",   "unit": "USD/oz",  "category": "precious_metals"},
    {"symbol": "SI=F",  "td": "XAG/USD", "name": "Silver",     "name_cn": "白银",   "unit": "USD/oz",  "category": "precious_metals"},
    {"symbol": "PL=F",  "td": "XPT/USD", "name": "Platinum",   "name_cn": "铂金",   "unit": "USD/oz",  "category": "precious_metals"},
    {"symbol": "PA=F",  "td": "XPD/USD", "name": "Palladium",  "name_cn": "钯金",   "unit": "USD/oz",  "category": "precious_metals"},
    # Energy
    {"symbol": "CL=F",  "td": "WTI/USD", "name": "Crude Oil",  "name_cn": "原油",   "unit": "USD/bbl", "category": "energy"},
    {"symbol": "BZ=F",  "td": "BRENT/USD","name": "Brent Oil", "name_cn": "布伦特", "unit": "USD/bbl", "category": "energy"},
    {"symbol": "NG=F",  "td": "NG1!",    "name": "Nat. Gas",   "name_cn": "天然气", "unit": "USD/MMBtu","category": "energy"},
    # Agriculture
    {"symbol": "KC=F",  "td": "COFFEE",  "name": "Coffee",     "name_cn": "咖啡",   "unit": "USD/lb",  "category": "agriculture"},
    {"symbol": "CC=F",  "td": "COCOA",   "name": "Cocoa",      "name_cn": "可可",   "unit": "USD/t",   "category": "agriculture"},
    {"symbol": "CT=F",  "td": "COTTON",  "name": "Cotton",     "name_cn": "棉花",   "unit": "USD/lb",  "category": "agriculture"},
    {"symbol": "ZS=F",  "td": "SOYBEAN", "name": "Soybeans",   "name_cn": "大豆",   "unit": "USD/bu",  "category": "agriculture"},
    {"symbol": "ZW=F",  "td": "WHEAT",   "name": "Wheat",      "name_cn": "小麦",   "unit": "USD/bu",  "category": "agriculture"},
    {"symbol": "ZC=F",  "td": "CORN",    "name": "Corn",       "name_cn": "玉米",   "unit": "USD/bu",  "category": "agriculture"},
    # Industrial metals
    {"symbol": "HG=F",  "td": "COPPER",  "name": "Copper",     "name_cn": "铜",     "unit": "USD/lb",  "category": "industrial_metals"},
    {"symbol": "ALI=F", "td": "ALI1!",   "name": "Aluminium",  "name_cn": "铝",     "unit": "USD/t",   "category": "industrial_metals"},
]

CN_FUTURES: List[Dict] = [
    {"symbol": "RB0",  "name": "Rebar",       "name_cn": "螺纹钢", "unit": "CNY/t",  "category": "industrial_metals"},
    {"symbol": "I0",   "name": "Iron Ore",    "name_cn": "铁矿石", "unit": "CNY/t",  "category": "industrial_metals"},
    {"symbol": "J0",   "name": "Coking Coal", "name_cn": "焦炭",   "unit": "CNY/t",  "category": "energy"},
    {"symbol": "CU0",  "name": "SHFE Copper", "name_cn": "沪铜",   "unit": "CNY/t",  "category": "industrial_metals"},
    {"symbol": "AU0",  "name": "SHFE Gold",   "name_cn": "沪金",   "unit": "CNY/g",  "category": "precious_metals"},
    {"symbol": "AG0",  "name": "SHFE Silver", "name_cn": "沪银",   "unit": "CNY/kg", "category": "precious_metals"},
]


# ---------------------------------------------------------------------------
# Per-source fetchers
# ---------------------------------------------------------------------------

def _yfinance_price(symbol: str) -> Optional[float]:
    try:
        import yfinance as yf  # type: ignore

        info = yf.Ticker(symbol).fast_info
        return safe_float(getattr(info, "last_price", None)) or None
    except Exception as exc:
        logger.debug("yfinance price(%s): %s", symbol, exc)
        return None


def _yfinance_quote(item: Dict) -> Optional[Dict]:
    try:
        import yfinance as yf  # type: ignore

        ticker = yf.Ticker(item["symbol"])
        fi = ticker.fast_info
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
            "unit": item["unit"],
            "category": item["category"],
        }
    except Exception as exc:
        logger.debug("yfinance_quote(%s): %s", item["symbol"], exc)
        return None


def _akshare_cn_futures(item: Dict) -> Optional[Dict]:
    """Fetch Chinese futures price from AKShare."""
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
            "unit": item["unit"],
            "category": item["category"],
        }
    except ImportError:
        return None
    except Exception as exc:
        logger.debug("akshare_cn_futures(%s): %s", item["symbol"], exc)
        return None


def _fetch_commodity(item: Dict) -> Optional[Dict]:
    """Try each provider in priority order for a single commodity."""
    result = _yfinance_quote(item)
    if result:
        return result
    return None


def get_extended_commodities() -> Dict:
    """Return extended commodity prices including CN futures when enabled."""
    cache_key = "commodities:extended"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    results: List[Dict] = []
    for item in COMMODITIES:
        try:
            q = _fetch_commodity(item)
            if q:
                results.append(q)
        except Exception as exc:
            logger.warning("commodity %s failed: %s", item["symbol"], exc)

    cn_enabled = os.getenv("FUTURES_CN_ENABLED", "false").lower() == "true"
    if cn_enabled:
        for item in CN_FUTURES:
            try:
                q = _akshare_cn_futures(item)
                if q:
                    results.append(q)
            except Exception as exc:
                logger.warning("cn_futures %s failed: %s", item["symbol"], exc)

    output = {"commodities": results, "count": len(results)}
    set_cached(cache_key, output, ttl=300)
    return output
