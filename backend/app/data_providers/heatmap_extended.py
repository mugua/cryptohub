"""Module 16: Heatmap Extended

Sector heatmaps for US (ETF-based), A-share (Shenwan L1), and HK (Hang Seng sectors).

Fallback chain:
    US sectors:     yfinance (sector ETFs)
    A-share sectors: AKShare (Shenwan L1 industry)
    HK sectors:     AKShare (HK industry)

Time dimension: 1d / 1w / 1m  (passed as ``period`` parameter)

Usage::

    from app.data_providers.heatmap_extended import get_heatmap
    data = get_heatmap(market="us", period="1d")
"""
from __future__ import annotations

import logging
from typing import Dict, List, Optional

from app.data_providers import get_cached, set_cached, safe_float

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# US sector ETF catalogue
# ---------------------------------------------------------------------------

_US_SECTOR_ETFS: List[Dict] = [
    {"symbol": "XLK",  "name": "Technology",       "name_cn": "科技"},
    {"symbol": "XLF",  "name": "Financials",        "name_cn": "金融"},
    {"symbol": "XLV",  "name": "Health Care",       "name_cn": "医疗保健"},
    {"symbol": "XLE",  "name": "Energy",             "name_cn": "能源"},
    {"symbol": "XLI",  "name": "Industrials",        "name_cn": "工业"},
    {"symbol": "XLY",  "name": "Cons. Discretionary","name_cn": "可选消费"},
    {"symbol": "XLP",  "name": "Cons. Staples",      "name_cn": "必选消费"},
    {"symbol": "XLB",  "name": "Materials",          "name_cn": "材料"},
    {"symbol": "XLRE", "name": "Real Estate",        "name_cn": "房地产"},
    {"symbol": "XLU",  "name": "Utilities",          "name_cn": "公用事业"},
    {"symbol": "XLC",  "name": "Communication Svcs", "name_cn": "通信服务"},
]


def _us_heatmap(period: str) -> List[Dict]:
    try:
        import yfinance as yf  # type: ignore

        results = []
        period_map = {"1d": "1d", "1w": "5d", "1m": "1mo"}
        yf_period = period_map.get(period, "1d")
        for item in _US_SECTOR_ETFS:
            try:
                hist = yf.Ticker(item["symbol"]).history(period=yf_period)
                if hist.empty:
                    continue
                first_close = safe_float(hist["Close"].iloc[0])
                last_close = safe_float(hist["Close"].iloc[-1])
                chg_pct = (last_close - first_close) / first_close * 100 if first_close else 0
                vol = safe_float(hist["Volume"].sum())
                results.append(
                    {
                        "sector": item["symbol"],
                        "name": item["name"],
                        "name_cn": item["name_cn"],
                        "change": round(last_close - first_close, 4),
                        "changePercent": round(chg_pct, 4),
                        "market_cap": 0,
                        "volume": vol,
                        "market": "us",
                        "stocks": [],
                    }
                )
            except Exception as exc:
                logger.debug("us_heatmap %s: %s", item["symbol"], exc)
        return results
    except Exception as exc:
        logger.warning("_us_heatmap failed: %s", exc)
        return []


def _cn_heatmap(period: str) -> List[Dict]:
    try:
        import akshare as ak  # type: ignore

        df = ak.stock_board_industry_name_em()
        if df is None or df.empty:
            return []
        results = []
        for _, row in df.iterrows():
            chg = safe_float(row.get("涨跌幅"))
            results.append(
                {
                    "sector": str(row.get("板块代码", "")),
                    "name": str(row.get("板块名称", "")),
                    "name_cn": str(row.get("板块名称", "")),
                    "change": safe_float(row.get("涨跌额")),
                    "changePercent": round(chg, 4),
                    "market_cap": safe_float(row.get("总市值")),
                    "volume": safe_float(row.get("成交量")),
                    "market": "cn",
                    "stocks": [],
                }
            )
        return results
    except ImportError:
        return []
    except Exception as exc:
        logger.warning("_cn_heatmap failed: %s", exc)
        return []


def _hk_heatmap(period: str) -> List[Dict]:
    try:
        import akshare as ak  # type: ignore

        df = ak.stock_hk_index_spot_em()
        if df is None or df.empty:
            return []
        results = []
        for _, row in df.iterrows():
            chg = safe_float(row.get("涨跌幅"))
            results.append(
                {
                    "sector": str(row.get("代码", "")),
                    "name": str(row.get("名称", "")),
                    "name_cn": str(row.get("名称", "")),
                    "change": safe_float(row.get("涨跌额")),
                    "changePercent": round(chg, 4),
                    "market_cap": 0,
                    "volume": safe_float(row.get("成交量")),
                    "market": "hk",
                    "stocks": [],
                }
            )
        return results
    except ImportError:
        return []
    except Exception as exc:
        logger.warning("_hk_heatmap failed: %s", exc)
        return []


_MARKET_FN = {
    "us": _us_heatmap,
    "cn": _cn_heatmap,
    "hk": _hk_heatmap,
}


def get_heatmap(market: str = "us", period: str = "1d") -> Dict:
    """Return sector heatmap data for *market* ('us'/'cn'/'hk') and *period*."""
    cache_key = f"heatmap:{market}:{period}"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    fn = _MARKET_FN.get(market.lower(), _us_heatmap)
    sectors = fn(period)
    output = {"sectors": sectors, "count": len(sectors), "market": market, "period": period}
    set_cached(cache_key, output, ttl=600)
    return output
