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


# ── Technical Analysis dimension (refined sub-categories) ──

@register_fetcher("ta_trend_indicators")
async def _fetch_ta_trend_indicators(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Trend indicators – MA cross-overs, EMA, MACD.

    Short-term: EMA(7)/EMA(25) cross, MA(20) direction.
    Mid/long-term: MA(50)/MA(200) golden/death cross, ADX trend strength.
    Data source: Binance / OKX OHLCV via REST + WebSocket.
    Output: trend_up | trend_down | sideways (per time-horizon).
    """
    return DataSourceResult(
        source_name="Trend Indicators (MA/EMA/MACD)",
        raw_value=68.0,
        meta={
            "short_term": {"ema7_vs_ema25": "bullish_cross", "ma20_slope": "rising",
                           "macd_histogram": 120.5, "signal": "trend_up"},
            "mid_long_term": {"ma50_vs_ma200": "golden_cross", "adx": 32.1,
                              "signal": "trend_up"},
        },
    )


@register_fetcher("ta_momentum")
async def _fetch_ta_momentum(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Momentum / oscillator indicators – RSI, Stochastic RSI, CCI, Williams %R.

    Short-term: RSI(14), StochRSI(14), Williams %R.
    Mid/long-term: RSI(28), CCI(20).
    Data source: OHLCV from Binance/OKX.
    Output: overbought | oversold | neutral.
    """
    return DataSourceResult(
        source_name="Momentum (RSI/StochRSI/CCI)",
        raw_value=62.0,
        meta={
            "rsi_14": 62.4, "stoch_rsi": 74.2, "williams_r": -28.5,
            "rsi_28": 58.1, "cci_20": 85.3,
            "short_term_signal": "neutral",
            "mid_long_term_signal": "neutral",
        },
    )


@register_fetcher("ta_volatility")
async def _fetch_ta_volatility(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Volatility indicators – Bollinger Bands, ATR, Historical Volatility.

    Short-term: BB(20,2) width, ATR(14).
    Mid/long-term: 30-day historical vol, BB(50,2).
    Data source: OHLCV from Binance/OKX.
    Output: high_volatility | low_volatility | normal.
    """
    return DataSourceResult(
        source_name="Volatility (BB/ATR/HV)",
        raw_value=55.0,
        meta={
            "bb_width_pct": 4.2, "atr_14": 1850.0, "hv_30d": 0.62,
            "bb_position": "upper_half",
            "signal": "normal",
        },
    )


@register_fetcher("ta_volume")
async def _fetch_ta_volume(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Volume analysis – OBV, VWAP, Volume Profile, CMF.

    Short-term: volume surge detection, VWAP deviation, intraday profile.
    Mid-term: OBV trend, Chaikin Money Flow (CMF).
    Data source: OHLCV + volume from Binance/OKX REST.
    Output: volume_confirm | volume_diverge | neutral.
    """
    return DataSourceResult(
        source_name="Volume (OBV/VWAP/CMF)",
        raw_value=66.0,
        meta={
            "obv_trend": "rising", "vwap_deviation_pct": 1.2,
            "cmf_20": 0.15, "volume_ratio_24h": 1.35,
            "signal": "volume_confirm",
        },
    )


@register_fetcher("ta_support_resistance")
async def _fetch_ta_support_resistance(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Support & resistance levels – Fibonacci, Pivot Points, key levels.

    Short-term: daily Pivot Points, intraday S/R.
    Mid/long-term: Fibonacci retracement (38.2%/50%/61.8%), monthly S/R.
    Data source: OHLCV from Binance/OKX.
    Output: near_support | near_resistance | in_range.
    """
    return DataSourceResult(
        source_name="Support & Resistance (Fib/Pivot)",
        raw_value=60.0,
        meta={
            "pivot_point": 66500, "support_1": 65000, "resistance_1": 68000,
            "fib_382": 63200, "fib_500": 61500, "fib_618": 59800,
            "signal": "in_range",
        },
    )


@register_fetcher("ta_candlestick_patterns")
async def _fetch_ta_candlestick(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Candlestick / chart pattern recognition.

    Short-term: single/double candle patterns (engulfing, doji, hammer, etc.).
    Mid-term: three-candle and chart patterns (head-and-shoulders, triangle).
    Data source: OHLCV from Binance/OKX.
    Output: bullish_pattern | bearish_pattern | no_pattern.
    """
    return DataSourceResult(
        source_name="Candlestick Patterns",
        raw_value=58.0,
        meta={
            "recent_patterns": [
                {"name": "bullish_engulfing", "timeframe": "4h", "reliability": "high"},
                {"name": "doji", "timeframe": "1d", "reliability": "medium"},
            ],
            "signal": "bullish_pattern",
        },
    )


@register_fetcher("ta_market_microstructure")
async def _fetch_ta_microstructure(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Market microstructure – order book depth, bid-ask spread, liquidations.

    Short-term: order book imbalance, bid-ask spread, recent liquidations.
    Data source: Binance/OKX order book (WebSocket), Coinglass liquidation data.
    Output: buy_pressure | sell_pressure | balanced.
    """
    return DataSourceResult(
        source_name="Market Microstructure (Depth/Spread)",
        raw_value=63.0,
        meta={
            "bid_ask_spread_bps": 1.2, "order_book_imbalance": 0.15,
            "liquidations_24h_long": 45_000_000,
            "liquidations_24h_short": 32_000_000,
            "signal": "buy_pressure",
        },
    )


@register_fetcher("ta_execution_layer")
async def _fetch_ta_execution_layer(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """Execution layer monitoring – slippage, network latency, API stability.

    Tracks: average slippage (bps), API response latency (ms), API call
    success rate, and order-book depth score.
    Data source: internal monitoring, exchange ping, historical fill data.
    Output: execution_risk_low | execution_risk_medium | execution_risk_high.
    """
    return DataSourceResult(
        source_name="Execution Layer (Slippage/Latency/API)",
        raw_value=78.0,
        meta={
            "avg_slippage_bps": 3.2, "network_latency_ms": 45,
            "api_success_rate": 0.997,
            "order_book_depth_score": 82,
            "signal": "execution_risk_low",
        },
    )


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
# Coin-specific quantitative factor fetchers
# ──────────────────────────────────────────────────────────────────────────────

# ── BTC-specific factors ──

@register_fetcher("btc_halving_cycle")
async def _fetch_btc_halving(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """BTC halving cycle phase – blocks until next halving, historical pattern.

    Data source: Blockchain.com / Blockchair REST API.
    Output: cycle phase (early/mid/late/post-halving) + days remaining.
    """
    return DataSourceResult(
        source_name="BTC Halving Cycle",
        raw_value=72.0,
        meta={
            "blocks_until_halving": 215_000,
            "estimated_days": 410,
            "cycle_phase": "mid_cycle",
            "current_block_reward": 3.125,
        },
    )


@register_fetcher("btc_hashrate")
async def _fetch_btc_hashrate(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """BTC hash rate & mining difficulty – network security indicator.

    Data source: Blockchain.com / Glassnode / CoinMetrics REST API.
    Output: hash rate trend (rising/falling/stable), difficulty adjustment %.
    """
    return DataSourceResult(
        source_name="BTC Hash Rate & Difficulty",
        raw_value=70.0,
        meta={
            "hashrate_th": 620_000_000,
            "hashrate_change_30d_pct": 5.2,
            "difficulty": 83_148_355_189_239,
            "next_difficulty_adj_pct": 2.1,
            "signal": "rising",
        },
    )


@register_fetcher("btc_miner_flow")
async def _fetch_btc_miner_flow(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """BTC miner revenue & outflow – miner selling pressure indicator.

    Data source: Glassnode / CryptoQuant REST API.
    Output: miner_accumulating | miner_distributing | miner_neutral.
    """
    return DataSourceResult(
        source_name="BTC Miner Revenue & Outflow",
        raw_value=65.0,
        meta={
            "miner_revenue_usd_24h": 38_500_000,
            "miner_outflow_btc_7d": -120,
            "miner_reserve_btc": 1_820_000,
            "signal": "miner_accumulating",
        },
    )


@register_fetcher("btc_mvrv")
async def _fetch_btc_mvrv(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """BTC MVRV ratio – Market Value vs Realized Value.

    Data source: Glassnode / CoinMetrics / LookIntoBitcoin REST API.
    Output: overvalued (>3.5) | fair_value (1.0-3.5) | undervalued (<1.0).
    """
    return DataSourceResult(
        source_name="BTC MVRV Ratio",
        raw_value=62.0,
        meta={
            "mvrv_ratio": 2.15,
            "mvrv_zscore": 1.8,
            "signal": "fair_value",
        },
    )


@register_fetcher("btc_nupl")
async def _fetch_btc_nupl(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """BTC NUPL – Net Unrealized Profit/Loss.

    Data source: Glassnode / LookIntoBitcoin REST API.
    Output: euphoria (>0.75) | belief (0.5-0.75) | optimism (0.25-0.5) |
            hope (0-0.25) | capitulation (<0).
    """
    return DataSourceResult(
        source_name="BTC NUPL",
        raw_value=66.0,
        meta={
            "nupl": 0.55,
            "phase": "belief",
        },
    )


@register_fetcher("btc_stock_to_flow")
async def _fetch_btc_s2f(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """BTC Stock-to-Flow model deviation.

    Data source: LookIntoBitcoin / custom calculation from on-chain data.
    Output: deviation percentage from S2F model price.
    """
    return DataSourceResult(
        source_name="BTC Stock-to-Flow",
        raw_value=58.0,
        meta={
            "s2f_ratio": 56.2,
            "s2f_model_price": 95_000,
            "actual_price": 67_500,
            "deviation_pct": -28.9,
            "signal": "below_model",
        },
    )


@register_fetcher("btc_lightning_network")
async def _fetch_btc_lightning(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """BTC Lightning Network capacity – L2 adoption indicator.

    Data source: mempool.space / 1ML.com REST API.
    Output: network capacity trend (growing/shrinking/stable).
    """
    return DataSourceResult(
        source_name="BTC Lightning Network",
        raw_value=60.0,
        meta={
            "capacity_btc": 5_420,
            "num_channels": 68_500,
            "num_nodes": 16_200,
            "capacity_change_30d_pct": 3.1,
            "signal": "growing",
        },
    )


# ── ETH-specific factors ──

@register_fetcher("eth_gas_congestion")
async def _fetch_eth_gas(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """ETH gas price & network congestion – network usage indicator.

    Data source: Etherscan / Alchemy / Infura REST API.
    Output: congested | normal | low_activity.
    """
    return DataSourceResult(
        source_name="ETH Gas & Congestion",
        raw_value=60.0,
        meta={
            "gas_price_gwei": 25,
            "pending_tx_count": 145_000,
            "gas_used_pct": 52.0,
            "signal": "normal",
        },
    )


@register_fetcher("eth_burn_rate")
async def _fetch_eth_burn(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """ETH burn rate (EIP-1559) – deflationary pressure indicator.

    Data source: Etherscan / ultrasound.money REST API.
    Output: net issuance status (deflationary/inflationary/neutral).
    """
    return DataSourceResult(
        source_name="ETH Burn Rate (EIP-1559)",
        raw_value=68.0,
        meta={
            "burn_rate_eth_24h": 2_850,
            "issuance_eth_24h": 2_100,
            "net_issuance_eth_24h": -750,
            "signal": "deflationary",
        },
    )


@register_fetcher("eth_staking")
async def _fetch_eth_staking(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """ETH staking rate & validator count – network commitment indicator.

    Data source: Beaconcha.in / Lido / Rated.network REST API.
    Output: staking trend (increasing/decreasing/stable).
    """
    return DataSourceResult(
        source_name="ETH Staking & Validators",
        raw_value=72.0,
        meta={
            "total_staked_eth": 32_500_000,
            "staking_rate_pct": 27.1,
            "validator_count": 1_015_000,
            "staking_apy_pct": 3.8,
            "signal": "increasing",
        },
    )


@register_fetcher("eth_defi_tvl")
async def _fetch_eth_defi_tvl(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """ETH DeFi TVL – ecosystem health indicator.

    Data source: DefiLlama REST API (api.llama.fi).
    Output: tvl trend (growing/shrinking/stable).
    """
    return DataSourceResult(
        source_name="ETH DeFi TVL",
        raw_value=65.0,
        meta={
            "tvl_usd": 58_000_000_000,
            "tvl_change_30d_pct": 8.5,
            "top_protocols": ["Lido", "Aave", "Uniswap", "Maker", "EigenLayer"],
            "signal": "growing",
        },
    )


@register_fetcher("eth_l2_activity")
async def _fetch_eth_l2(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """ETH L2 rollup activity – Arbitrum, Optimism, Base stats.

    Data source: L2Beat (l2beat.com) / DefiLlama REST API.
    Output: l2 adoption trend (growing/shrinking/stable).
    """
    return DataSourceResult(
        source_name="ETH L2 Activity",
        raw_value=70.0,
        meta={
            "l2_tvl_usd": 22_000_000_000,
            "l2_tx_count_7d": 45_000_000,
            "top_l2s": ["Arbitrum", "Optimism", "Base", "zkSync", "Starknet"],
            "l2_tvl_change_30d_pct": 12.5,
            "signal": "growing",
        },
    )


@register_fetcher("eth_btc_ratio")
async def _fetch_eth_btc_ratio(symbol: str, params: dict[str, Any]) -> DataSourceResult:
    """ETH/BTC ratio trend – relative strength indicator.

    Data source: Binance / CoinGecko REST API.
    Output: eth_outperform | eth_underperform | parity.
    """
    return DataSourceResult(
        source_name="ETH/BTC Ratio",
        raw_value=48.0,
        meta={
            "eth_btc_ratio": 0.052,
            "ratio_change_30d_pct": -3.5,
            "ratio_ma_50": 0.055,
            "signal": "eth_underperform",
        },
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
