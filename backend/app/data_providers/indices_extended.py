"""Module 7: Extended Global Indices Data Provider

Adds Asian, Chinese mainland, and emerging-market indices.

Fallback chain: yfinance → AKShare (A-share) → Twelve Data

Usage::

    from app.data_providers.indices_extended import get_extended_indices
    data = get_extended_indices()
"""
from __future__ import annotations

import logging
import os
from typing import Dict, List, Optional

from app.data_providers import get_cached, set_cached, safe_float

logger = logging.getLogger(__name__)

_TWELVEDATA_KEY = os.getenv("TWELVEDATA_API_KEY") or ""

INDICES: List[Dict] = [
    # Americas
    {"symbol": "^GSPC",  "name": "S&P 500",        "name_cn": "标普500",   "region": "americas",     "flag": "🇺🇸"},
    {"symbol": "^DJI",   "name": "Dow Jones",       "name_cn": "道琼斯",   "region": "americas",     "flag": "🇺🇸"},
    {"symbol": "^IXIC",  "name": "NASDAQ",          "name_cn": "纳斯达克", "region": "americas",     "flag": "🇺🇸"},
    {"symbol": "^RUT",   "name": "Russell 2000",    "name_cn": "罗素2000", "region": "americas",     "flag": "🇺🇸"},
    {"symbol": "^BVSP",  "name": "Bovespa",         "name_cn": "巴西指数", "region": "americas",     "flag": "🇧🇷"},
    # Europe
    {"symbol": "^FTSE",  "name": "FTSE 100",        "name_cn": "富时100",  "region": "europe",       "flag": "🇬🇧"},
    {"symbol": "^GDAXI", "name": "DAX",             "name_cn": "德国DAX",  "region": "europe",       "flag": "🇩🇪"},
    {"symbol": "^FCHI",  "name": "CAC 40",          "name_cn": "法国CAC",  "region": "europe",       "flag": "🇫🇷"},
    {"symbol": "^STOXX50E","name": "Euro Stoxx 50", "name_cn": "欧洲50",   "region": "europe",       "flag": "🇪🇺"},
    # Asia-Pacific
    {"symbol": "^N225",  "name": "Nikkei 225",      "name_cn": "日经225",  "region": "asia_pacific", "flag": "🇯🇵"},
    {"symbol": "^KS11",  "name": "KOSPI",           "name_cn": "韩国综合", "region": "asia_pacific", "flag": "🇰🇷"},
    {"symbol": "^TWII",  "name": "TAIEX",           "name_cn": "台湾加权", "region": "asia_pacific", "flag": "🇹🇼"},
    {"symbol": "^VNINDEX","name": "VN30",           "name_cn": "越南VN30", "region": "asia_pacific", "flag": "🇻🇳"},
    {"symbol": "^BSESN", "name": "SENSEX",          "name_cn": "印度SENSEX","region": "asia_pacific","flag": "🇮🇳"},
    {"symbol": "^AXJO",  "name": "ASX 200",         "name_cn": "澳洲200",  "region": "asia_pacific", "flag": "🇦🇺"},
    # China
    {"symbol": "000300.SS","name": "CSI 300",       "name_cn": "沪深300",  "region": "china",        "flag": "🇨🇳", "akshare": "sh000300"},
    {"symbol": "000016.SS","name": "SSE 50",        "name_cn": "上证50",   "region": "china",        "flag": "🇨🇳", "akshare": "sh000016"},
    {"symbol": "399006.SZ","name": "ChiNext",       "name_cn": "创业板指", "region": "china",        "flag": "🇨🇳", "akshare": "sz399006"},
    {"symbol": "^HSI",   "name": "Hang Seng",       "name_cn": "恒生指数", "region": "china",        "flag": "🇭🇰"},
    {"symbol": "^HSTECH","name": "Hang Seng Tech",  "name_cn": "恒生科技", "region": "china",        "flag": "🇭🇰"},
]


def _yfinance_index(item: Dict) -> Optional[Dict]:
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
            "change": round(change, 2),
            "changePercent": round(change / prev * 100 if prev else 0, 2),
            "region": item["region"],
            "flag_emoji": item.get("flag", ""),
        }
    except Exception as exc:
        logger.debug("yfinance index(%s): %s", item["symbol"], exc)
        return None


def _akshare_cn_index(item: Dict) -> Optional[Dict]:
    """Fetch A-share index from AKShare (priority for CN indices)."""
    try:
        import akshare as ak  # type: ignore

        code = item.get("akshare", "")
        if not code:
            return None
        df = ak.stock_zh_index_spot_em(symbol=code)
        if df is None or df.empty:
            return None
        row = df.iloc[0]
        last = safe_float(row.get("最新价", 0))
        prev = safe_float(row.get("昨收", 0))
        change = last - prev
        return {
            "symbol": item["symbol"],
            "name": item["name"],
            "name_cn": item["name_cn"],
            "price": last,
            "change": round(change, 2),
            "changePercent": round(change / prev * 100 if prev else 0, 2),
            "region": item["region"],
            "flag_emoji": item.get("flag", ""),
        }
    except ImportError:
        return None
    except Exception as exc:
        logger.debug("akshare cn index(%s): %s", item.get("akshare"), exc)
        return None


def _fetch_index(item: Dict) -> Optional[Dict]:
    # CN indices: try AKShare first
    if item.get("akshare"):
        result = _akshare_cn_index(item)
        if result:
            return result
    return _yfinance_index(item)


def get_extended_indices() -> Dict:
    """Return global index prices with extended coverage."""
    cache_key = "indices:extended"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    results: List[Dict] = []
    for item in INDICES:
        try:
            q = _fetch_index(item)
            if q:
                results.append(q)
        except Exception as exc:
            logger.warning("index %s failed: %s", item["symbol"], exc)

    output = {"indices": results, "count": len(results)}
    set_cached(cache_key, output, ttl=300)
    return output
