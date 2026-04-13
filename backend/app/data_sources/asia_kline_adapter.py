"""Module 2: Asia Stock K-Line Multi-Source Adapter

Provides a unified K-line (candlestick) interface for A-share and Hong Kong
stocks with automatic source failover.

Provider priority (``ASIA_KLINE_PROVIDER`` env var, default ``tencent``):
    tencent → twelvedata → akshare

Usage::

    from app.data_sources.asia_kline_adapter import AsiaKlineProviderRegistry

    registry = AsiaKlineProviderRegistry()
    klines = registry.fetch_klines("600519", period="1d", count=100)
"""
from __future__ import annotations

import logging
import os
import re
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

_PREFERRED = os.getenv("ASIA_KLINE_PROVIDER", "tencent").lower()
_TWELVEDATA_API_KEY = os.getenv("TWELVEDATA_API_KEY") or ""


# ---------------------------------------------------------------------------
# Code normalisation (reuses tencent_adapter helpers)
# ---------------------------------------------------------------------------

def _normalize_cn(symbol: str) -> str:
    symbol = symbol.strip().lower()
    if symbol.startswith(("sh", "sz")):
        return symbol
    digits = re.sub(r"[^0-9]", "", symbol)
    return f"sh{digits}" if digits.startswith(("6",)) else f"sz{digits}"


def _normalize_hk(symbol: str) -> str:
    symbol = symbol.strip().lower()
    if symbol.startswith("hk"):
        return symbol
    digits = re.sub(r"[^0-9]", "", symbol)
    return f"hk{digits.zfill(5)}"


def _is_hk(symbol: str) -> bool:
    s = symbol.strip().lower()
    return s.startswith("hk") or bool(re.fullmatch(r"\d{1,5}", s))


# ---------------------------------------------------------------------------
# Tencent K-line provider
# ---------------------------------------------------------------------------

_TENCENT_KLINE_URL = (
    "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get"
    "?_var=kline_{period}&param={code},{period},,,{count},{adj}"
)

_PERIOD_MAP = {
    "1d": "day",
    "1w": "week",
    "1m": "month",
    "60": "m60",
    "30": "m30",
    "15": "m15",
    "5": "m5",
}


def fetch_tencent_klines(
    symbol: str, period: str = "1d", count: int = 100, adj: str = "qfq"
) -> List[Dict]:
    """Fetch K-lines from Tencent Finance."""
    try:
        import json
        import requests

        code = _normalize_hk(symbol) if _is_hk(symbol) else _normalize_cn(symbol)
        tencent_period = _PERIOD_MAP.get(period, "day")
        url = _TENCENT_KLINE_URL.format(
            code=code, period=tencent_period, count=count, adj=adj
        )
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        text = resp.text
        # Strip JS assignment prefix
        json_start = text.find("{")
        if json_start < 0:
            return []
        data = json.loads(text[json_start:])
        qfq_data = (
            data.get("data", {})
            .get(code, {})
            .get(f"qfq{tencent_period}", [])
        )
        if not qfq_data:
            qfq_data = (
                data.get("data", {}).get(code, {}).get(tencent_period, [])
            )
        result = []
        for item in qfq_data:
            if len(item) >= 6:
                result.append(
                    {
                        "date": item[0],
                        "open": float(item[1]),
                        "close": float(item[2]),
                        "high": float(item[3]),
                        "low": float(item[4]),
                        "volume": float(item[5]),
                    }
                )
        return result
    except Exception as exc:
        logger.debug("Tencent klines (%s) failed: %s", symbol, exc)
        return []


# ---------------------------------------------------------------------------
# Twelve Data K-line provider
# ---------------------------------------------------------------------------

def fetch_twelvedata_klines(
    symbol: str, period: str = "1d", count: int = 100
) -> List[Dict]:
    """Fetch K-lines from Twelve Data (requires ``TWELVEDATA_API_KEY``)."""
    if not _TWELVEDATA_API_KEY:
        logger.debug("TWELVEDATA_API_KEY not set, skipping")
        return []
    try:
        import requests

        interval_map = {
            "1d": "1day",
            "1w": "1week",
            "1m": "1month",
            "60": "1h",
            "30": "30min",
            "15": "15min",
            "5": "5min",
        }
        interval = interval_map.get(period, "1day")
        # Twelvedata uses exchange suffix for Asian stocks
        td_symbol = symbol.upper()
        if re.fullmatch(r"\d{6}", symbol):
            exchange = "SHSE" if symbol.startswith("6") else "SZSE"
            td_symbol = f"{symbol}:{exchange}"
        url = (
            f"https://api.twelvedata.com/time_series"
            f"?symbol={td_symbol}&interval={interval}&outputsize={count}"
            f"&apikey={_TWELVEDATA_API_KEY}"
        )
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if "values" not in data:
            return []
        result = []
        for item in data["values"]:
            result.append(
                {
                    "date": item.get("datetime", ""),
                    "open": float(item.get("open", 0)),
                    "close": float(item.get("close", 0)),
                    "high": float(item.get("high", 0)),
                    "low": float(item.get("low", 0)),
                    "volume": float(item.get("volume", 0)),
                }
            )
        return result
    except Exception as exc:
        logger.debug("Twelvedata klines (%s) failed: %s", symbol, exc)
        return []


# ---------------------------------------------------------------------------
# AKShare K-line provider
# ---------------------------------------------------------------------------

def fetch_akshare_klines(
    symbol: str, period: str = "1d", count: int = 100
) -> List[Dict]:
    """Fetch K-lines from AKShare (A-share & HK)."""
    try:
        import akshare as ak  # type: ignore

        if _is_hk(symbol):
            digits = re.sub(r"[^0-9]", "", symbol).zfill(5)
            df = ak.stock_hk_hist(
                symbol=digits,
                period="daily" if period == "1d" else period,
                adjust="qfq",
            )
        else:
            digits = re.sub(r"[^0-9]", "", symbol)
            df = ak.stock_zh_a_hist(
                symbol=digits,
                period="daily" if period == "1d" else period,
                adjust="qfq",
            )
        if df is None or df.empty:
            return []
        df = df.tail(count)
        result = []
        for _, row in df.iterrows():
            result.append(
                {
                    "date": str(row.get("日期", row.get("date", ""))),
                    "open": float(row.get("开盘", row.get("open", 0))),
                    "close": float(row.get("收盘", row.get("close", 0))),
                    "high": float(row.get("最高", row.get("high", 0))),
                    "low": float(row.get("最低", row.get("low", 0))),
                    "volume": float(row.get("成交量", row.get("volume", 0))),
                }
            )
        return result
    except ImportError:
        logger.debug("akshare not installed")
        return []
    except Exception as exc:
        logger.debug("AKShare klines (%s) failed: %s", symbol, exc)
        return []


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------

_PROVIDERS = {
    "tencent": fetch_tencent_klines,
    "twelvedata": fetch_twelvedata_klines,
    "akshare": fetch_akshare_klines,
}


class AsiaKlineProviderRegistry:
    """Multi-source K-line registry with automatic failover.

    Provider order can be customised via ``ASIA_KLINE_PROVIDER`` (first
    choice) or the *preferred_provider* constructor argument.
    """

    def __init__(self, preferred_provider: Optional[str] = None) -> None:
        pref = (preferred_provider or _PREFERRED).lower()
        others = [k for k in _PROVIDERS if k != pref]
        self._order = [pref] + others

    def fetch_klines(
        self,
        symbol: str,
        period: str = "1d",
        count: int = 100,
        adj: str = "qfq",
    ) -> List[Dict]:
        """Fetch K-lines for *symbol* trying providers in priority order.

        Returns an empty list only when all providers fail.
        """
        for provider in self._order:
            try:
                fn = _PROVIDERS[provider]
                if provider == "tencent":
                    data = fn(symbol, period, count, adj)
                else:
                    data = fn(symbol, period, count)
                if data:
                    logger.debug(
                        "AsiaKline[%s] fetched %d bars from %s",
                        symbol,
                        len(data),
                        provider,
                    )
                    return data
            except Exception as exc:
                logger.warning(
                    "AsiaKline provider '%s' failed for %s: %s",
                    provider,
                    symbol,
                    exc,
                )
        logger.warning("AsiaKline: all providers failed for %s", symbol)
        return []
