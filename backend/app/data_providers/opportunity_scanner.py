"""Module 15: Opportunity Scanner

Scans multiple markets for trading opportunities and ranks them by strength.

Markets: Crypto / USStock / CNStock / HKStock / Forex / PredictionMarket

Usage::

    from app.data_providers.opportunity_scanner import OpportunityScanner

    scanner = OpportunityScanner()
    result = scanner.scan()
    filtered = scanner.list_opportunities(market="Crypto", signal="bullish")
"""
from __future__ import annotations

import logging
import os
from typing import Dict, List, Optional

from app.data_providers import get_cached, set_cached, safe_float

logger = logging.getLogger(__name__)

_CACHE_TTL = int(os.getenv("OPPORTUNITY_CACHE_TTL") or "600")

_STRENGTH_ORDER = {"strong": 0, "medium": 1, "weak": 2}


def _classify_strength(change_pct: float) -> str:
    abs_chg = abs(change_pct)
    if abs_chg >= 5.0:
        return "strong"
    if abs_chg >= 2.0:
        return "medium"
    return "weak"


def _classify_signal(change_pct: float) -> str:
    return "bullish" if change_pct > 0 else "bearish"


# ---------------------------------------------------------------------------
# Per-market scanners
# ---------------------------------------------------------------------------

def _scan_crypto() -> List[Dict]:
    try:
        import requests

        resp = requests.get(
            "https://api.coingecko.com/api/v3/coins/markets",
            params={
                "vs_currency": "usd",
                "order": "percent_change_24h_desc",
                "per_page": 50,
                "page": 1,
                "sparkline": False,
                "price_change_percentage": "24h",
            },
            timeout=10,
        )
        resp.raise_for_status()
        coins = resp.json()
        results = []
        for c in coins:
            chg = safe_float(c.get("price_change_percentage_24h"))
            results.append(
                {
                    "market": "Crypto",
                    "symbol": c.get("symbol", "").upper(),
                    "name": c.get("name", ""),
                    "price": safe_float(c.get("current_price")),
                    "changePercent": round(chg, 4),
                    "volume": safe_float(c.get("total_volume")),
                    "signal": _classify_signal(chg),
                    "strength": _classify_strength(chg),
                }
            )
        return results
    except Exception as exc:
        logger.warning("_scan_crypto failed: %s", exc)
        return []


def _scan_us_stocks() -> List[Dict]:
    try:
        import yfinance as yf  # type: ignore

        symbols = [
            "AAPL", "MSFT", "AMZN", "GOOGL", "NVDA", "META", "TSLA",
            "AMD", "NFLX", "CRM", "INTC", "BABA", "UBER", "PYPL",
        ]
        results = []
        for sym in symbols:
            try:
                fi = yf.Ticker(sym).fast_info
                last = safe_float(getattr(fi, "last_price", None))
                prev = safe_float(getattr(fi, "previous_close", None))
                if not last or not prev:
                    continue
                chg = (last - prev) / prev * 100
                results.append(
                    {
                        "market": "USStock",
                        "symbol": sym,
                        "name": sym,
                        "price": last,
                        "changePercent": round(chg, 4),
                        "volume": safe_float(getattr(fi, "three_month_average_volume", None)),
                        "signal": _classify_signal(chg),
                        "strength": _classify_strength(chg),
                    }
                )
            except Exception:
                continue
        return results
    except Exception as exc:
        logger.warning("_scan_us_stocks failed: %s", exc)
        return []


def _scan_cn_stocks() -> List[Dict]:
    try:
        import akshare as ak  # type: ignore

        df = ak.stock_zh_a_spot_em()
        if df is None or df.empty:
            return []
        df = df.nlargest(30, "涨跌幅")
        results = []
        for _, row in df.iterrows():
            chg = safe_float(row.get("涨跌幅"))
            results.append(
                {
                    "market": "CNStock",
                    "symbol": str(row.get("代码", "")),
                    "name": str(row.get("名称", "")),
                    "price": safe_float(row.get("最新价")),
                    "changePercent": round(chg, 4),
                    "volume": safe_float(row.get("成交量")),
                    "signal": _classify_signal(chg),
                    "strength": _classify_strength(chg),
                }
            )
        return results
    except ImportError:
        return []
    except Exception as exc:
        logger.warning("_scan_cn_stocks failed: %s", exc)
        return []


def _scan_hk_stocks() -> List[Dict]:
    try:
        import akshare as ak  # type: ignore

        df = ak.stock_hk_spot_em()
        if df is None or df.empty:
            return []
        df = df.nlargest(20, "涨跌幅")
        results = []
        for _, row in df.iterrows():
            chg = safe_float(row.get("涨跌幅"))
            results.append(
                {
                    "market": "HKStock",
                    "symbol": str(row.get("代码", "")),
                    "name": str(row.get("名称", "")),
                    "price": safe_float(row.get("最新价")),
                    "changePercent": round(chg, 4),
                    "volume": safe_float(row.get("成交量")),
                    "signal": _classify_signal(chg),
                    "strength": _classify_strength(chg),
                }
            )
        return results
    except ImportError:
        return []
    except Exception as exc:
        logger.warning("_scan_hk_stocks failed: %s", exc)
        return []


def _scan_forex() -> List[Dict]:
    try:
        import yfinance as yf  # type: ignore

        pairs = ["EURUSD=X", "GBPUSD=X", "USDJPY=X", "AUDUSD=X", "USDCAD=X",
                 "USDCHF=X", "NZDUSD=X", "USDCNH=X"]
        results = []
        for sym in pairs:
            try:
                fi = yf.Ticker(sym).fast_info
                last = safe_float(getattr(fi, "last_price", None))
                prev = safe_float(getattr(fi, "previous_close", None))
                if not last or not prev:
                    continue
                chg = (last - prev) / prev * 100
                results.append(
                    {
                        "market": "Forex",
                        "symbol": sym.replace("=X", ""),
                        "name": sym.replace("=X", ""),
                        "price": last,
                        "changePercent": round(chg, 4),
                        "volume": 0,
                        "signal": _classify_signal(chg),
                        "strength": _classify_strength(chg),
                    }
                )
            except Exception:
                continue
        return results
    except Exception as exc:
        logger.warning("_scan_forex failed: %s", exc)
        return []


_MARKET_SCANNERS = {
    "Crypto": _scan_crypto,
    "USStock": _scan_us_stocks,
    "CNStock": _scan_cn_stocks,
    "HKStock": _scan_hk_stocks,
    "Forex": _scan_forex,
}


# ---------------------------------------------------------------------------
# Scanner class
# ---------------------------------------------------------------------------

class OpportunityScanner:
    """Scans all markets for trading opportunities and caches results."""

    def scan(self) -> Dict:
        """Run a full scan across all markets."""
        cache_key = "opportunities:scan"
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

        all_opportunities: List[Dict] = []
        for market, scanner in _MARKET_SCANNERS.items():
            try:
                opps = scanner()
                all_opportunities.extend(opps)
            except Exception as exc:
                logger.warning("Scanner[%s] failed: %s", market, exc)

        # Sort: strong first, then by abs changePercent desc
        all_opportunities.sort(
            key=lambda x: (
                _STRENGTH_ORDER.get(x.get("strength", "weak"), 2),
                -abs(x.get("changePercent", 0)),
            )
        )

        output = {
            "opportunities": all_opportunities,
            "count": len(all_opportunities),
        }
        set_cached(cache_key, output, ttl=_CACHE_TTL)
        return output

    def list_opportunities(
        self,
        market: Optional[str] = None,
        signal: Optional[str] = None,
        strength: Optional[str] = None,
    ) -> List[Dict]:
        """Return filtered opportunities from the cached scan result."""
        data = self.scan()
        opps = data.get("opportunities", [])
        if market:
            opps = [o for o in opps if o.get("market", "").lower() == market.lower()]
        if signal:
            opps = [o for o in opps if o.get("signal", "") == signal.lower()]
        if strength:
            opps = [o for o in opps if o.get("strength", "") == strength.lower()]
        return opps
