"""
Data scrapers and API fetchers for trend report sub-items.

Each dimension has configurable sub-items with data sources.  For sources
that expose a public REST / GraphQL / WebSocket API the corresponding
``fetch_*`` coroutine should call the endpoint directly.  For sources
that do **not** offer a public API (e.g. government gazettes, Google
Trends, TradingView pine data) we fall back to lightweight scraping.

All fetchers return a ``DataSourceResult`` dataclass which carries:
  * source_name – human-readable label
  * raw_value   – numeric value on a 0-100 scale (or -100..100)
  * meta        – optional dict with extra context

Usage example (inside an async route or service):

    result = await fetch_data_source("Glassnode", "BTC/USDT",
                                     {"api_key": "...", "endpoint": "..."})
    print(result.raw_value)
"""

from __future__ import annotations

import asyncio
import logging
import re
from dataclasses import dataclass, field
from typing import Any, Callable, Coroutine

logger = logging.getLogger(__name__)


# ── Result container ─────────────────────────────────────────────────────────

@dataclass
class DataSourceResult:
    source_name: str
    raw_value: float = 0.0         # primary numeric output (0-100 scale)
    meta: dict[str, Any] = field(default_factory=dict)
    success: bool = True
    error: str | None = None


# ── Registry of fetchers ─────────────────────────────────────────────────────

_FETCHER_REGISTRY: dict[str, Callable[..., Coroutine[Any, Any, DataSourceResult]]] = {}


def register_fetcher(source_key: str):
    """Decorator – register an async fetcher function for *source_key*."""
    def wrapper(fn: Callable[..., Coroutine[Any, Any, DataSourceResult]]):
        _FETCHER_REGISTRY[source_key.lower()] = fn
        return fn
    return wrapper


async def fetch_data_source(
    source_key: str,
    symbol: str = "BTC/USDT",
    params: dict[str, Any] | None = None,
) -> DataSourceResult:
    """Dispatch to the registered fetcher for *source_key*.

    If no fetcher is registered a stub result is returned so the caller can
    degrade gracefully.
    """
    key = source_key.lower().strip()
    fetcher = _FETCHER_REGISTRY.get(key)
    if fetcher is None:
        logger.error("No fetcher registered for %r – returning stub result", source_key)
        return DataSourceResult(source_name=source_key, raw_value=50.0,
                                success=False, error="no fetcher registered")
    try:
        return await fetcher(symbol, params or {})
    except Exception as exc:
        logger.exception("Fetcher %r failed", source_key)
        return DataSourceResult(source_name=source_key, raw_value=50.0,
                                success=False, error=str(exc))


# ──────────────────────────────────────────────────────────────────────────────
# REST / JSON API fetchers  (replace stubs with real HTTP calls)
# ──────────────────────────────────────────────────────────────────────────────

@register_fetcher("fred")
async def _fetch_fred(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """FRED – Federal Reserve Economic Data (api.stlouisfed.org/fred)."""
    # TODO: call FRED REST API with api_key from params
    # Example: GET https://api.stlouisfed.org/fred/series/observations?series_id=DFF&api_key=...&file_type=json
    return DataSourceResult(source_name="FRED", raw_value=62.0,
                            meta={"interest_rate": 5.25, "cpi_yoy": 3.2})


@register_fetcher("tradingeconomics")
async def _fetch_tradingeconomics(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """TradingEconomics (tradingeconomics.com/api)."""
    return DataSourceResult(source_name="TradingEconomics", raw_value=60.0,
                            meta={"gdp_growth": 2.1})


@register_fetcher("quandl/nasdaq")
async def _fetch_quandl(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Quandl / Nasdaq Data Link (data.nasdaq.com/api)."""
    return DataSourceResult(source_name="Quandl/Nasdaq", raw_value=58.0)


@register_fetcher("worldbank")
async def _fetch_worldbank(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """World Bank Open Data (api.worldbank.org/v2)."""
    return DataSourceResult(source_name="WorldBank", raw_value=55.0)


@register_fetcher("imf")
async def _fetch_imf(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """IMF Data (data.imf.org/api)."""
    return DataSourceResult(source_name="IMF", raw_value=56.0)


# ── Policy dimension ──

@register_fetcher("sec_edgar")
async def _fetch_sec_edgar(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """SEC EDGAR filings (www.sec.gov/cgi-bin/browse-edgar)."""
    return DataSourceResult(source_name="SEC EDGAR", raw_value=55.0,
                            meta={"recent_filings": 12})


@register_fetcher("cryptoregulations")
async def _fetch_cryptoregulations(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """CryptoRegulations.org – global regulatory status."""
    return DataSourceResult(source_name="CryptoRegulations", raw_value=50.0)


@register_fetcher("coindesk")
async def _fetch_coindesk(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """CoinDesk API (data-api.coindesk.com)."""
    return DataSourceResult(source_name="CoinDesk", raw_value=58.0)


@register_fetcher("cointelegraph")
async def _fetch_cointelegraph(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Cointelegraph RSS (cointelegraph.com/rss)."""
    # TODO: parse RSS feed, extract policy-related articles, sentiment-score
    return DataSourceResult(source_name="Cointelegraph", raw_value=57.0)


# ── Supply & Demand dimension ──

@register_fetcher("glassnode")
async def _fetch_glassnode(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Glassnode on-chain metrics (api.glassnode.com)."""
    return DataSourceResult(source_name="Glassnode", raw_value=72.0,
                            meta={"exchange_balance_change": -12450})


@register_fetcher("cryptoquant")
async def _fetch_cryptoquant(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """CryptoQuant (api.cryptoquant.com)."""
    return DataSourceResult(source_name="CryptoQuant", raw_value=68.0)


@register_fetcher("coinmetrics")
async def _fetch_coinmetrics(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Coin Metrics (api.coinmetrics.io)."""
    return DataSourceResult(source_name="CoinMetrics", raw_value=65.0)


@register_fetcher("santiment")
async def _fetch_santiment(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Santiment GraphQL API (api.santiment.net)."""
    # TODO: GraphQL query for social + on-chain data
    return DataSourceResult(source_name="Santiment", raw_value=66.0)


@register_fetcher("messari")
async def _fetch_messari(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Messari (data.messari.io/api)."""
    return DataSourceResult(source_name="Messari", raw_value=64.0)


@register_fetcher("blockchain.com")
async def _fetch_blockchain_com(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Blockchain.com API (api.blockchain.info)."""
    return DataSourceResult(source_name="Blockchain.com", raw_value=63.0)


# ── Market Sentiment dimension ──

@register_fetcher("feargreed")
async def _fetch_fear_greed(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Alternative.me Fear & Greed Index (api.alternative.me/fng)."""
    # TODO: GET https://api.alternative.me/fng/?limit=1
    return DataSourceResult(source_name="Fear & Greed Index", raw_value=68.0,
                            meta={"label": "Greed"})


@register_fetcher("lunarcrush")
async def _fetch_lunarcrush(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """LunarCrush social intelligence (lunarcrush.com/api)."""
    return DataSourceResult(source_name="LunarCrush", raw_value=70.0)


@register_fetcher("thetie")
async def _fetch_thetie(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """The TIE institutional sentiment (thetie.io/api)."""
    return DataSourceResult(source_name="The TIE", raw_value=66.0)


@register_fetcher("twitter")
async def _fetch_twitter(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Twitter / X API v2 (api.twitter.com/2)."""
    return DataSourceResult(source_name="Twitter", raw_value=72.0,
                            meta={"bullish_pct": 72.0})


@register_fetcher("reddit")
async def _fetch_reddit(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Reddit API (www.reddit.com/dev/api)."""
    return DataSourceResult(source_name="Reddit", raw_value=64.0)


# ── Technical Analysis dimension ──

@register_fetcher("okx_binance")
async def _fetch_okx_binance(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """OKX / Binance REST + WebSocket (api.okx.com, api.binance.com)."""
    return DataSourceResult(source_name="OKX/Binance", raw_value=65.0,
                            meta={"volume_24h": 1_200_000_000})


@register_fetcher("coingecko")
async def _fetch_coingecko(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """CoinGecko (api.coingecko.com)."""
    return DataSourceResult(source_name="CoinGecko", raw_value=67.0)


@register_fetcher("coinmarketcap")
async def _fetch_coinmarketcap(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """CoinMarketCap (pro-api.coinmarketcap.com)."""
    return DataSourceResult(source_name="CoinMarketCap", raw_value=66.0)


@register_fetcher("cryptocompare")
async def _fetch_cryptocompare(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """CryptoCompare (min-api.cryptocompare.com)."""
    return DataSourceResult(source_name="CryptoCompare", raw_value=64.0)


# ──────────────────────────────────────────────────────────────────────────────
# Scrapers  (for sources without a public API)
# ──────────────────────────────────────────────────────────────────────────────

@register_fetcher("govannouncements")
async def _scrape_gov_announcements(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Scrape government announcement pages (central banks, SEC, etc.).

    Implementation plan:
    1. Maintain a list of target URLs (e.g. US Treasury, PBOC, ECB press pages).
    2. Use ``httpx`` (async) to fetch HTML.
    3. Parse with ``selectolax`` / ``beautifulsoup4`` to extract headlines.
    4. Run a simple keyword sentiment model on extracted text.
    5. Return aggregated score 0-100.
    """
    # Stub – replace with real scraping logic
    return DataSourceResult(
        source_name="Gov Announcements",
        raw_value=52.0,
        meta={"scraper": True, "urls_checked": 0},
    )


@register_fetcher("googletrends")
async def _scrape_google_trends(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Scrape Google Trends for crypto-related search interest.

    Implementation plan:
    1. Use ``pytrends`` (unofficial) or direct HTTP to Google Trends explore.
    2. Query interest-over-time for terms like "bitcoin", "crypto".
    3. Map the 0-100 interest index directly to our score scale.
    """
    # Stub – replace with real scraping logic
    return DataSourceResult(
        source_name="Google Trends",
        raw_value=60.0,
        meta={"scraper": True, "search_term": "bitcoin"},
    )


@register_fetcher("tradingview")
async def _scrape_tradingview(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Scrape or fetch TradingView chart data (unofficial).

    Implementation plan:
    1. Use ``tradingview_ta`` Python library for technical analysis summaries.
    2. Or call the internal ``pine_fetch()`` endpoint (undocumented).
    3. Parse summary: counts of buy / neutral / sell signals.
    4. Map (buys - sells) / total → 0-100 score.
    """
    # Stub – replace with real scraping logic
    return DataSourceResult(
        source_name="TradingView",
        raw_value=65.0,
        meta={"scraper": True, "buy_signals": 8, "sell_signals": 3, "neutral_signals": 5},
    )


# ──────────────────────────────────────────────────────────────────────────────
# Batch helper
# ──────────────────────────────────────────────────────────────────────────────

async def fetch_all_sources(
    sources: list[dict[str, Any]],
    symbol: str = "BTC/USDT",
) -> list[DataSourceResult]:
    """Concurrently fetch data from multiple sources.

    *sources* is a list of dicts each with at least ``{"key": "...", ...}``
    where ``key`` matches a registered fetcher name.
    """
    tasks = [
        fetch_data_source(src.get("key", src.get("name", "")), symbol, src)
        for src in sources
    ]
    return list(await asyncio.gather(*tasks))
