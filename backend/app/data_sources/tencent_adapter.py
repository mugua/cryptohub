"""Module 1: Tencent Realtime Quote Adapter

Wraps the Tencent Finance HTTP API (no API key required) and provides a
unified interface for A-share (SH/SZ) and Hong Kong (HK) stocks.

Falls back to AKShare when Tencent is unavailable.

Usage::

    from app.data_sources.tencent_adapter import TencentRealtimeAdapter

    adapter = TencentRealtimeAdapter()
    quote = adapter.get_realtime_quote("600519")   # A-share
    quotes = adapter.get_batch_quotes(["00700", "AAPL"])
"""
from __future__ import annotations

import logging
import os
import re
import time
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

_TENCENT_URL = "https://qt.gtimg.cn/q={codes}"
_DEFAULT_RATE_LIMIT = int(os.getenv("TENCENT_RATE_LIMIT") or "5")  # req/s
_MIN_INTERVAL = 1.0 / max(_DEFAULT_RATE_LIMIT, 1)


# ---------------------------------------------------------------------------
# Code normalisation helpers (mirrors tencent.py from QuantDinger)
# ---------------------------------------------------------------------------

def normalize_cn_code(symbol: str) -> str:
    """Convert a bare A-share code to Tencent format.

    Examples::

        normalize_cn_code("600519") -> "sh600519"
        normalize_cn_code("000001") -> "sz000001"
    """
    symbol = symbol.strip().lower()
    if symbol.startswith(("sh", "sz")):
        return symbol
    digits = re.sub(r"[^0-9]", "", symbol)
    if digits.startswith(("0", "3")):
        return f"sz{digits}"
    return f"sh{digits}"


def normalize_hk_code(symbol: str) -> str:
    """Convert a Hong Kong stock code to Tencent format.

    Examples::

        normalize_hk_code("700")   -> "hk00700"
        normalize_hk_code("00700") -> "hk00700"
    """
    symbol = symbol.strip().lower()
    if symbol.startswith("hk"):
        return symbol
    digits = re.sub(r"[^0-9]", "", symbol)
    return f"hk{digits.zfill(5)}"


def _is_hk_symbol(symbol: str) -> bool:
    """Heuristic: pure digits ≤ 5 chars, or explicit hk prefix."""
    s = symbol.strip().lower()
    if s.startswith("hk"):
        return True
    return bool(re.fullmatch(r"\d{1,5}", s))


def _is_cn_symbol(symbol: str) -> bool:
    """Heuristic: 6-digit code or sh/sz prefix."""
    s = symbol.strip().lower()
    if s.startswith(("sh", "sz")):
        return True
    return bool(re.fullmatch(r"\d{6}", s))


# ---------------------------------------------------------------------------
# Raw fetch helpers
# ---------------------------------------------------------------------------

def fetch_quote(code: str) -> Optional[List[str]]:
    """Fetch raw Tencent quote for a single normalised *code*.

    Returns a list of value strings or *None* on failure.
    """
    try:
        import requests

        url = _TENCENT_URL.format(codes=code)
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        text = resp.text.strip()
        # Expected: v_sh600519="1~贵州茅台~...~"
        match = re.search(r'"([^"]*)"', text)
        if not match:
            return None
        data = match.group(1)
        parts = data.split("~")
        if len(parts) < 30:
            return None
        return parts
    except Exception as exc:
        logger.debug("Tencent fetch_quote(%s) failed: %s", code, exc)
        return None


def parse_quote_to_ticker(parts: List[str], symbol: str) -> Dict:
    """Parse raw Tencent field list into a unified ticker dict."""
    try:
        last = float(parts[3]) if parts[3] else 0.0
        prev_close = float(parts[4]) if parts[4] else 0.0
        open_price = float(parts[5]) if parts[5] else 0.0
        volume = float(parts[6]) * 100 if parts[6] else 0.0  # 手 → 股
        high = float(parts[33]) if parts[33] else 0.0
        low = float(parts[34]) if parts[34] else 0.0
        change = last - prev_close
        change_pct = (change / prev_close * 100) if prev_close else 0.0
        return {
            "symbol": symbol,
            "name": parts[1],
            "last": last,
            "change": round(change, 4),
            "changePercent": round(change_pct, 4),
            "volume": volume,
            "high": high,
            "low": low,
            "open": open_price,
            "previousClose": prev_close,
            "timestamp": parts[30] if len(parts) > 30 else "",
        }
    except (IndexError, ValueError) as exc:
        logger.debug("parse_quote_to_ticker failed: %s", exc)
        return {}


# ---------------------------------------------------------------------------
# Fallback via AKShare
# ---------------------------------------------------------------------------

def _akshare_quote(symbol: str) -> Optional[Dict]:
    try:
        import akshare as ak  # type: ignore

        if _is_cn_symbol(symbol):
            code = re.sub(r"[^0-9]", "", symbol)
            df = ak.stock_zh_a_spot_em()
            row = df[df["代码"] == code]
            if row.empty:
                return None
            r = row.iloc[0]
            last = float(r.get("最新价", 0))
            prev = float(r.get("昨收", 0))
            chg = last - prev
            return {
                "symbol": symbol,
                "name": r.get("名称", ""),
                "last": last,
                "change": round(chg, 4),
                "changePercent": round(chg / prev * 100 if prev else 0, 4),
                "volume": float(r.get("成交量", 0)),
                "high": float(r.get("最高", 0)),
                "low": float(r.get("最低", 0)),
                "open": float(r.get("今开", 0)),
                "previousClose": prev,
                "timestamp": "",
            }
    except ImportError:
        logger.debug("akshare not installed, cannot fall back")
    except Exception as exc:
        logger.debug("AKShare quote for %s failed: %s", symbol, exc)
    return None


# ---------------------------------------------------------------------------
# Main adapter
# ---------------------------------------------------------------------------

class TencentRealtimeAdapter:
    """Unified real-time quote adapter backed by Tencent Finance.

    Automatically normalises A-share (6-digit / sh/sz) and HK (≤5-digit / hk)
    codes.  Falls back to AKShare when Tencent is unavailable.
    """

    def __init__(self) -> None:
        self._last_call = 0.0

    def _throttle(self) -> None:
        now = time.monotonic()
        gap = _MIN_INTERVAL - (now - self._last_call)
        if gap > 0:
            time.sleep(gap)
        self._last_call = time.monotonic()

    def _normalise(self, symbol: str) -> str:
        if _is_hk_symbol(symbol):
            return normalize_hk_code(symbol)
        return normalize_cn_code(symbol)

    def get_realtime_quote(self, symbol: str) -> Dict:
        """Return a unified quote dict for *symbol*.

        Returns an empty dict when all sources fail.
        """
        self._throttle()
        code = self._normalise(symbol)
        parts = fetch_quote(code)
        if parts:
            return parse_quote_to_ticker(parts, symbol)
        # Fallback
        result = _akshare_quote(symbol)
        return result or {}

    def get_batch_quotes(self, symbols: List[str]) -> List[Dict]:
        """Return quotes for multiple *symbols* (sequential, rate-limited)."""
        results: List[Dict] = []
        for sym in symbols:
            try:
                q = self.get_realtime_quote(sym)
                if q:
                    results.append(q)
            except Exception as exc:
                logger.warning("get_batch_quotes: %s failed: %s", sym, exc)
        return results
