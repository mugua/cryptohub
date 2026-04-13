"""Module 8: News Aggregator + Financial Calendar

Sources:
    News:     NewsAPI → Yahoo RSS → CNBC RSS → Reuters RSS
    Calendar: AKShare → investpy fallback

Usage::

    from app.data_providers.news_calendar import NewsCalendar
    nc = NewsCalendar()
    news   = nc.get_news(market="crypto", lang="zh", limit=20)
    events = nc.get_calendar(market="all")
"""
from __future__ import annotations

import logging
import os
import time
from typing import Dict, List, Optional

from app.data_providers import get_cached, set_cached

logger = logging.getLogger(__name__)

_NEWS_API_KEY = os.getenv("NEWS_API_KEY") or ""
_NEWS_CACHE_TTL = 900   # 15 min
_CAL_CACHE_TTL  = 3600  # 1 h

# ---------------------------------------------------------------------------
# RSS helpers
# ---------------------------------------------------------------------------

_RSS_FEEDS = {
    "crypto": [
        "https://feeds.finance.yahoo.com/rss/2.0/headline?s=BTC-USD&region=US&lang=en-US",
        "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    ],
    "stock": [
        "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US",
        "https://feeds.reuters.com/reuters/businessNews",
    ],
    "forex": [
        "https://feeds.finance.yahoo.com/rss/2.0/headline?s=EURUSD=X&region=US&lang=en-US",
    ],
}


def _parse_rss(url: str, limit: int = 20) -> List[Dict]:
    try:
        import xml.etree.ElementTree as ET
        import requests

        resp = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        root = ET.fromstring(resp.text)
        items = root.findall(".//item")[:limit]
        results = []
        for item in items:
            title = (item.findtext("title") or "").strip()
            link  = (item.findtext("link") or "").strip()
            pub   = (item.findtext("pubDate") or "").strip()
            desc  = (item.findtext("description") or "").strip()
            results.append(
                {"title": title, "url": link, "publishedAt": pub, "summary": desc,
                 "source": url, "sentiment": "neutral"}
            )
        return results
    except Exception as exc:
        logger.debug("RSS parse failed (%s): %s", url, exc)
        return []


def _newsapi_fetch(query: str, lang: str = "en", limit: int = 20) -> List[Dict]:
    if not _NEWS_API_KEY:
        return []
    try:
        import requests

        resp = requests.get(
            "https://newsapi.org/v2/everything",
            params={"q": query, "language": lang[:2], "pageSize": limit,
                    "sortBy": "publishedAt", "apiKey": _NEWS_API_KEY},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        results = []
        for art in data.get("articles", []):
            results.append(
                {"title": art.get("title", ""),
                 "url": art.get("url", ""),
                 "publishedAt": art.get("publishedAt", ""),
                 "summary": art.get("description", ""),
                 "source": art.get("source", {}).get("name", ""),
                 "sentiment": "neutral"}
            )
        return results
    except Exception as exc:
        logger.debug("NewsAPI fetch failed: %s", exc)
        return []


# ---------------------------------------------------------------------------
# Calendar helpers
# ---------------------------------------------------------------------------

def _akshare_calendar() -> List[Dict]:
    try:
        import akshare as ak  # type: ignore

        df = ak.macro_info_ws()
        if df is None or df.empty:
            return []
        events = []
        for _, row in df.iterrows():
            events.append(
                {
                    "time": str(row.get("发布时间", "")),
                    "country": str(row.get("国家", "")),
                    "event": str(row.get("指标名称", "")),
                    "actual": str(row.get("今值", "")),
                    "forecast": str(row.get("预期值", "")),
                    "previous": str(row.get("前值", "")),
                    "impact": _infer_impact(str(row.get("指标名称", ""))),
                    "sentiment": "neutral",
                }
            )
        return events
    except ImportError:
        return []
    except Exception as exc:
        logger.debug("akshare calendar failed: %s", exc)
        return []


_HIGH_IMPACT_KEYWORDS = ["CPI", "GDP", "NFP", "FOMC", "Interest Rate", "Inflation",
                         "Non-Farm", "央行", "利率", "通胀", "就业"]
_MEDIUM_IMPACT_KEYWORDS = ["PMI", "Retail", "Industrial", "Housing", "零售", "工业"]


def _infer_impact(event_name: str) -> str:
    upper = event_name.upper()
    for kw in _HIGH_IMPACT_KEYWORDS:
        if kw.upper() in upper:
            return "high"
    for kw in _MEDIUM_IMPACT_KEYWORDS:
        if kw.upper() in upper:
            return "medium"
    return "low"


# ---------------------------------------------------------------------------
# Main class
# ---------------------------------------------------------------------------

class NewsCalendar:
    """Aggregated news and financial calendar provider."""

    def get_news(
        self,
        market: str = "all",
        lang: str = "en",
        limit: int = 20,
    ) -> Dict:
        """Return latest news for *market* (crypto/stock/forex/all)."""
        cache_key = f"news:{market}:{lang}:{limit}"
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

        query_map = {
            "crypto": "bitcoin cryptocurrency",
            "stock": "stock market S&P",
            "forex": "forex currency exchange",
            "all": "finance market",
        }
        query = query_map.get(market, "finance")

        articles: List[Dict] = _newsapi_fetch(query, lang=lang, limit=limit)

        if not articles:
            feeds = _RSS_FEEDS.get(market, _RSS_FEEDS.get("stock", []))
            for feed_url in feeds:
                articles += _parse_rss(feed_url, limit=limit)
                if articles:
                    break

        output = {"articles": articles[:limit], "count": len(articles[:limit]),
                  "market": market, "fetched_at": time.time()}
        set_cached(cache_key, output, ttl=_NEWS_CACHE_TTL)
        return output

    def get_calendar(self, market: str = "all") -> Dict:
        """Return upcoming economic calendar events."""
        cache_key = f"calendar:{market}"
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

        events = _akshare_calendar()
        output = {"events": events, "count": len(events),
                  "market": market, "fetched_at": time.time()}
        set_cached(cache_key, output, ttl=_CAL_CACHE_TTL)
        return output
