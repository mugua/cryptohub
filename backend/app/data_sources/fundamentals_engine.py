"""Module 13: Fundamentals Engine

Provides financial fundamentals, statements, and earnings history.

Sources:
    A-share / HK: Twelve Data → AKShare
    US stocks:    yfinance → Twelve Data

Usage::

    from app.data_sources.fundamentals_engine import FundamentalsEngine

    engine = FundamentalsEngine()
    data = engine.get_fundamentals("us_stock", "AAPL")
    stmts = engine.get_financial_statements("us_stock", "AAPL")
    earnings = engine.get_earnings("us_stock", "AAPL")
"""
from __future__ import annotations

import logging
import os
from typing import Any, Dict, List, Optional

from app.data_providers import get_cached, set_cached, safe_float

logger = logging.getLogger(__name__)

_TWELVEDATA_KEY = os.getenv("TWELVEDATA_API_KEY") or ""
_CACHE_TTL = 3600  # 1 h


# ---------------------------------------------------------------------------
# yfinance helpers (US stocks primary)
# ---------------------------------------------------------------------------

def _yfinance_fundamentals(symbol: str) -> Optional[Dict]:
    try:
        import yfinance as yf  # type: ignore

        info = yf.Ticker(symbol).info
        if not info:
            return None
        return {
            "pe_ratio": safe_float(info.get("trailingPE")),
            "pb_ratio": safe_float(info.get("priceToBook")),
            "ps_ratio": safe_float(info.get("priceToSalesTrailing12Months")),
            "peg_ratio": safe_float(info.get("pegRatio")),
            "roe": safe_float(info.get("returnOnEquity")),
            "roa": safe_float(info.get("returnOnAssets")),
            "gross_margin": safe_float(info.get("grossMargins")),
            "net_margin": safe_float(info.get("profitMargins")),
            "debt_to_equity": safe_float(info.get("debtToEquity")),
            "current_ratio": safe_float(info.get("currentRatio")),
            "free_cash_flow": safe_float(info.get("freeCashflow")),
            "dividend_yield": safe_float(info.get("dividendYield")),
            "market_cap": safe_float(info.get("marketCap")),
            "52w_high": safe_float(info.get("fiftyTwoWeekHigh")),
            "52w_low": safe_float(info.get("fiftyTwoWeekLow")),
            "beta": safe_float(info.get("beta")),
            "source": "yfinance",
        }
    except Exception as exc:
        logger.debug("yfinance fundamentals(%s): %s", symbol, exc)
        return None


def _yfinance_statements(symbol: str) -> Optional[Dict]:
    try:
        import yfinance as yf  # type: ignore

        tk = yf.Ticker(symbol)
        return {
            "income_statement": tk.financials.to_dict() if tk.financials is not None else {},
            "balance_sheet": tk.balance_sheet.to_dict() if tk.balance_sheet is not None else {},
            "cash_flow": tk.cashflow.to_dict() if tk.cashflow is not None else {},
            "source": "yfinance",
        }
    except Exception as exc:
        logger.debug("yfinance statements(%s): %s", symbol, exc)
        return None


def _yfinance_earnings(symbol: str) -> Optional[List[Dict]]:
    try:
        import yfinance as yf  # type: ignore

        tk = yf.Ticker(symbol)
        eps_df = tk.earnings_history
        if eps_df is None or eps_df.empty:
            return None
        rows = []
        for _, row in eps_df.iterrows():
            rows.append(
                {
                    "date": str(row.get("Earnings Date", "")),
                    "eps_estimate": safe_float(row.get("EPS Estimate")),
                    "eps_actual": safe_float(row.get("Reported EPS")),
                    "surprise_pct": safe_float(row.get("Surprise(%)")),
                }
            )
        return rows
    except Exception as exc:
        logger.debug("yfinance earnings(%s): %s", symbol, exc)
        return None


# ---------------------------------------------------------------------------
# Twelve Data helpers (CN/HK primary, US fallback)
# ---------------------------------------------------------------------------

def _td_fundamentals(symbol: str, exchange: str = "") -> Optional[Dict]:
    if not _TWELVEDATA_KEY:
        return None
    try:
        import requests

        td_symbol = f"{symbol}:{exchange}" if exchange else symbol
        resp = requests.get(
            "https://api.twelvedata.com/statistics",
            params={"symbol": td_symbol, "apikey": _TWELVEDATA_KEY},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        stats = data.get("statistics", {})
        valuation = stats.get("valuations_metrics", {})
        income = stats.get("income_statement", {})
        bs = stats.get("balance_sheet", {})
        return {
            "pe_ratio": safe_float(valuation.get("trailing_pe")),
            "pb_ratio": safe_float(valuation.get("price_to_book_mrq")),
            "ps_ratio": safe_float(valuation.get("price_to_sales_ttm")),
            "peg_ratio": safe_float(valuation.get("peg_ratio")),
            "gross_margin": safe_float(income.get("gross_profit_margin")),
            "net_margin": safe_float(income.get("net_profit_margin")),
            "roe": safe_float(bs.get("return_on_equity_ttm")),
            "roa": safe_float(bs.get("return_on_assets_ttm")),
            "source": "twelvedata",
        }
    except Exception as exc:
        logger.debug("td fundamentals(%s): %s", symbol, exc)
        return None


# ---------------------------------------------------------------------------
# AKShare helpers (CN/HK)
# ---------------------------------------------------------------------------

def _akshare_cn_fundamentals(symbol: str) -> Optional[Dict]:
    try:
        import akshare as ak  # type: ignore
        import re

        code = re.sub(r"[^0-9]", "", symbol)
        df = ak.stock_a_indicator_lg(symbol=code)
        if df is None or df.empty:
            return None
        row = df.iloc[-1]
        return {
            "pe_ratio": safe_float(row.get("pe")),
            "pb_ratio": safe_float(row.get("pb")),
            "dividend_yield": safe_float(row.get("dv_ratio")),
            "market_cap": safe_float(row.get("total_mv")),
            "source": "akshare",
        }
    except ImportError:
        return None
    except Exception as exc:
        logger.debug("akshare cn fundamentals(%s): %s", symbol, exc)
        return None


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

class FundamentalsEngine:
    """Multi-source fundamentals engine supporting CN/HK/US markets."""

    def get_fundamentals(self, market: str, symbol: str) -> Dict:
        """Return key financial ratios for *symbol* in *market*."""
        cache_key = f"fundamentals:{market}:{symbol}"
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

        result: Optional[Dict] = None
        if market in ("cn_stock",):
            result = _td_fundamentals(symbol, "SHSE" if symbol.startswith("6") else "SZSE")
            if not result:
                result = _akshare_cn_fundamentals(symbol)
        elif market == "hk_stock":
            result = _td_fundamentals(symbol, "HKEX")
        else:  # us_stock or default
            result = _yfinance_fundamentals(symbol)
            if not result:
                result = _td_fundamentals(symbol)

        output = result or {}
        set_cached(cache_key, output, ttl=_CACHE_TTL)
        return output

    def get_financial_statements(self, market: str, symbol: str) -> Dict:
        """Return income statement, balance sheet, and cash flow."""
        cache_key = f"statements:{market}:{symbol}"
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

        result: Optional[Dict] = None
        if market == "us_stock":
            result = _yfinance_statements(symbol)
        # CN/HK: Twelve Data statements not yet implemented; return empty dict.

        output = result or {}
        set_cached(cache_key, output, ttl=_CACHE_TTL)
        return output

    def get_earnings(self, market: str, symbol: str) -> List[Dict]:
        """Return quarterly earnings history."""
        cache_key = f"earnings:{market}:{symbol}"
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

        result: Optional[List[Dict]] = None
        if market == "us_stock":
            result = _yfinance_earnings(symbol)

        output = result or []
        set_cached(cache_key, output, ttl=_CACHE_TTL)
        return output
