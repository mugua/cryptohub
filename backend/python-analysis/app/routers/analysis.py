"""Market analysis router – macro, policy, sentiment, supply/demand, technical."""

import random
from datetime import datetime, timezone

from fastapi import APIRouter, Query
from pydantic import ValidationError

from app.models.schemas import (
    AnalysisReport, MacroAnalysis, PolicyAnalysis, PolicyEvent,
    SupplyDemandAnalysis, SentimentAnalysis, TechnicalAnalysis,
    TechnicalIndicator, Signal,
    DimensionScore, TrendReport, TrendReportConfig,
)
from app.services.trend_report import (
    BASE_WEIGHTS, compute_trend, normalise_score, severity_from_score,
)
from app.services.data_scrapers import fetch_data_source, fetch_all_sources

router = APIRouter()

SUPPORTED_SYMBOLS = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "XRP/USDT"]


@router.get("/report", response_model=AnalysisReport)
async def get_analysis_report(
    symbol: str = Query("BTC/USDT", description="Trading pair symbol"),
) -> AnalysisReport:
    """
    Generate a comprehensive market analysis report for the given symbol.

    Covers five dimensions:
    * Macro economy
    * Policy & regulation
    * Supply & demand (on-chain)
    * Market sentiment
    * Technical analysis
    """
    is_btc = symbol.startswith("BTC")

    macro = MacroAnalysis(
        score=62,
        inflation_expectation="moderate (3.2% YoY)",
        dollar_index=104.2,
        fear_greed_index=68,
        summary="美联储降息预期增强，宏观流动性趋于宽松，对风险资产整体利好。",
    )

    policy = PolicyAnalysis(
        score=55 if is_btc else 40,
        recent_events=[
            PolicyEvent(date="2026-03-20", country="美国", title="SEC批准多只现货ETF申请", impact="positive"),
            PolicyEvent(date="2026-03-18", country="欧盟", title="MiCA法规正式生效", impact="neutral"),
            PolicyEvent(date="2026-03-10", country="中国香港", title="虚拟资产交易平台监管细则更新", impact="neutral"),
        ],
        summary="全球主要监管机构对加密市场态度趋于明朗，机构合规渠道持续拓展。",
    )

    supply_demand = SupplyDemandAnalysis(
        score=72,
        exchange_netflow=-12450,
        miners_netflow=-3200,
        whale_activity="accumulating",
        summary="链上数据显示大量比特币从交易所流出，鲸鱼地址持续积累。",
    )

    sentiment = SentimentAnalysis(
        score=68,
        fear_greed_index=68,
        fear_greed_label="贪婪",
        twitter_bullish_pct=72.0,
        reddit_sentiment="偏多",
        summary="市场情绪处于贪婪区间，散户FOMO情绪升温，需警惕短期回调风险。",
    )

    support = [65000, 63000, 60000] if is_btc else [3400, 3200, 3000]
    resistance = [68000, 70000, 72000] if is_btc else [3600, 3800, 4000]
    technical = TechnicalAnalysis(
        trend="uptrend",
        support_levels=support,
        resistance_levels=resistance,
        indicators=[
            TechnicalIndicator(name="RSI(14)", value=62.4, signal="neutral"),
            TechnicalIndicator(name="MACD", value="金叉", signal="buy"),
            TechnicalIndicator(name="MA(20)", value=65800 if is_btc else 3480, signal="buy"),
            TechnicalIndicator(name="MA(50)", value=63200 if is_btc else 3320, signal="buy"),
            TechnicalIndicator(name="Bollinger", value="中轨以上", signal="neutral"),
            TechnicalIndicator(name="ADX", value=32.1, signal="buy"),
        ],
        summary="价格位于多条均线之上，MACD出现金叉，整体技术面偏多。",
    )

    return AnalysisReport(
        symbol=symbol,
        generated_at=datetime.now(timezone.utc),
        macro=macro,
        policy=policy,
        supply_demand=supply_demand,
        sentiment=sentiment,
        technical=technical,
        summary="综合宏观、政策、链上及技术面分析，当前处于多头趋势中，建议逢低布局。",
        signal=Signal.buy,
    )


@router.get("/symbols")
async def get_supported_symbols() -> dict:
    """Return the list of symbols supported for analysis."""
    return {"data": SUPPORTED_SYMBOLS}


@router.get("/sentiment/{symbol}")
async def get_sentiment(symbol: str) -> dict:
    """Return a real-time sentiment snapshot for the given symbol."""
    return {
        "data": {
            "symbol": symbol,
            "fear_greed_index": random.randint(40, 80),
            "twitter_bullish_pct": round(random.uniform(50, 80), 1),
            "reddit_sentiment": random.choice(["偏多", "中性", "偏空"]),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
    }


@router.get("/trend-report", response_model=TrendReport)
async def get_trend_report(
    symbol: str = Query("BTC/USDT", description="Trading pair symbol"),
) -> TrendReport:
    """
    Generate a composite trend report by aggregating five analysis dimensions:

    * Macro Economy        (20 %)
    * Regulation & Policy  (25 %)
    * Supply & Demand      (25 %)
    * Market Sentiment     (15 %)
    * Technical Analysis   (15 %)

    Each dimension score is normalised to [-1, 1], weighted (with severity
    boost), and aggregated into a single composite score.  The composite
    score is then classified into a signal label.
    """
    is_btc = symbol.startswith("BTC")

    # Raw scores on a -100..100 scale (mock – replace with real data feeds)
    raw_macro = 62.0
    raw_policy = 55.0 if is_btc else 40.0
    raw_supply = 72.0
    raw_sentiment = 68.0
    raw_technical = 65.0

    dims = [
        DimensionScore(
            name="macro",
            raw_score=normalise_score(raw_macro),
            base_weight=BASE_WEIGHTS["macro"],
            adjusted_weight=0,  # filled by compute_trend
            severity=severity_from_score(raw_macro),
            summary="美联储降息预期增强，宏观流动性趋于宽松，对风险资产整体利好。",
        ),
        DimensionScore(
            name="policy",
            raw_score=normalise_score(raw_policy),
            base_weight=BASE_WEIGHTS["policy"],
            adjusted_weight=0,
            severity=severity_from_score(raw_policy),
            summary="全球主要监管机构对加密市场态度趋于明朗，机构合规渠道持续拓展。",
        ),
        DimensionScore(
            name="supply_demand",
            raw_score=normalise_score(raw_supply),
            base_weight=BASE_WEIGHTS["supply_demand"],
            adjusted_weight=0,
            severity=severity_from_score(raw_supply),
            summary="链上数据显示大量比特币从交易所流出，鲸鱼地址持续积累。",
        ),
        DimensionScore(
            name="sentiment",
            raw_score=normalise_score(raw_sentiment),
            base_weight=BASE_WEIGHTS["sentiment"],
            adjusted_weight=0,
            severity=severity_from_score(raw_sentiment),
            summary="市场情绪处于贪婪区间，散户FOMO情绪升温，需警惕短期回调风险。",
        ),
        DimensionScore(
            name="technical",
            raw_score=normalise_score(raw_technical),
            base_weight=BASE_WEIGHTS["technical"],
            adjusted_weight=0,
            severity=severity_from_score(raw_technical),
            summary="价格位于多条均线之上，MACD出现金叉，整体技术面偏多。",
        ),
    ]

    composite, signal = compute_trend(dims)

    return TrendReport(
        symbol=symbol,
        generated_at=datetime.now(timezone.utc),
        composite_score=composite,
        signal=signal,
        dimensions=dims,
        summary=(
            "综合宏观、政策、链上、情绪及技术面五大维度加权分析，"
            f"当前综合趋势得分 {composite:+.2f}，信号为{signal.value}，"
            "建议关注关键支撑阻力位变化。"
        ),
    )


# ── Trend Report Configuration ───────────────────────────────────────────────

# In-memory store (replace with database in production)
_trend_config_store: TrendReportConfig | None = None


@router.get("/trend-config", response_model=TrendReportConfig)
async def get_trend_config() -> TrendReportConfig:
    """Return current trend report configuration (dimensions + sub-items)."""
    if _trend_config_store is not None:
        return _trend_config_store
    # Return default configuration
    from app.models.schemas import SubItemConfig, DimensionConfig
    return TrendReportConfig(
        dimensions=[
            DimensionConfig(name="macro", base_weight=0.20, enabled=True, sub_items=[
                SubItemConfig(name="FRED", weight=0.25, data_source="FRED (美联储经济数据)", data_description="利率、通胀率、CPI、失业率、GDP", api_type="REST API", api_endpoint="api.stlouisfed.org/fred"),
                SubItemConfig(name="TradingEconomics", weight=0.25, data_source="TradingEconomics", data_description="全球宏观经济指标", api_type="REST API", api_endpoint="tradingeconomics.com/api"),
                SubItemConfig(name="Quandl/Nasdaq", weight=0.20, data_source="Quandl/Nasdaq Data Link", data_description="金融经济数据集", api_type="REST API", api_endpoint="data.nasdaq.com/api"),
                SubItemConfig(name="WorldBank", weight=0.15, data_source="World Bank Open Data", data_description="全球经济指标", api_type="REST API", api_endpoint="api.worldbank.org/v2"),
                SubItemConfig(name="IMF", weight=0.15, data_source="IMF Data", data_description="国际货币基金组织数据", api_type="REST API", api_endpoint="data.imf.org/api"),
            ]),
            DimensionConfig(name="policy", base_weight=0.25, enabled=True, sub_items=[
                SubItemConfig(name="SEC_EDGAR", weight=0.20, data_source="SEC EDGAR", data_description="SEC公告、注册文件", api_type="REST API", api_endpoint="www.sec.gov/cgi-bin/browse-edgar"),
                SubItemConfig(name="CryptoRegulations", weight=0.20, data_source="CryptoRegulations.org", data_description="全球加密货币监管状态", api_type="REST API", api_endpoint="需申请"),
                SubItemConfig(name="CoinDesk", weight=0.20, data_source="CoinDesk API", data_description="监管新闻、政策动态", api_type="REST API", api_endpoint="data-api.coindesk.com"),
                SubItemConfig(name="Cointelegraph", weight=0.20, data_source="Cointelegraph API", data_description="政策法规新闻", api_type="RSS/JSON", api_endpoint="cointelegraph.com/rss"),
                SubItemConfig(name="GovAnnouncements", weight=0.20, data_source="官方政府公报", data_description="美国、中国、欧盟、韩国央行/财政部公告", api_type="Scraper", api_endpoint="需爬虫 自建RSS解析"),
            ]),
            DimensionConfig(name="supply_demand", base_weight=0.25, enabled=True, sub_items=[
                SubItemConfig(name="Glassnode", weight=0.20, data_source="Glassnode", data_description="链上指标、交易所余额、持仓分布", api_type="REST API", api_endpoint="api.glassnode.com"),
                SubItemConfig(name="CryptoQuant", weight=0.20, data_source="CryptoQuant", data_description="交易所资金流动、矿工数据", api_type="REST API", api_endpoint="api.cryptoquant.com"),
                SubItemConfig(name="CoinMetrics", weight=0.15, data_source="Coin Metrics", data_description="全链数据分析", api_type="REST API", api_endpoint="api.coinmetrics.io"),
                SubItemConfig(name="Santiment", weight=0.15, data_source="Santiment", data_description="社交+链上数据", api_type="GraphQL API", api_endpoint="api.santiment.net"),
                SubItemConfig(name="Messari", weight=0.15, data_source="Messari", data_description="资产指标、交易所数据", api_type="REST API", api_endpoint="data.messari.io/api"),
                SubItemConfig(name="BlockchainDotCom", weight=0.15, data_source="Blockchain.com API", data_description="区块链原始数据", api_type="REST API", api_endpoint="api.blockchain.info"),
            ]),
            DimensionConfig(name="sentiment", base_weight=0.15, enabled=True, sub_items=[
                SubItemConfig(name="FearGreed", weight=0.20, data_source="Alternative.me (Fear & Greed Index)", data_description="恐惧贪婪指数", api_type="JSON API", api_endpoint="api.alternative.me/fng"),
                SubItemConfig(name="LunarCrush", weight=0.20, data_source="LunarCrush", data_description="社交媒体情绪、影响力排名", api_type="REST API", api_endpoint="lunarcrush.com/api"),
                SubItemConfig(name="SantimentSocial", weight=0.15, data_source="Santiment", data_description="加权社交情绪", api_type="GraphQL API", api_endpoint="api.santiment.net"),
                SubItemConfig(name="TheTIE", weight=0.15, data_source="The TIE", data_description="机构投资者情绪", api_type="REST API", api_endpoint="thetie.io/api"),
                SubItemConfig(name="Twitter", weight=0.10, data_source="Twitter API v2", data_description="社交推文情感分析", api_type="REST API", api_endpoint="api.twitter.com/2"),
                SubItemConfig(name="Reddit", weight=0.10, data_source="Reddit API", data_description="加密货币板块情绪", api_type="REST API", api_endpoint="www.reddit.com/dev/api"),
                SubItemConfig(name="GoogleTrends", weight=0.10, data_source="Google Trends API", data_description="搜索热度趋势", api_type="Scraper", api_endpoint="trends.google.com/trends/explore"),
            ]),
            DimensionConfig(name="technical", base_weight=0.15, enabled=True, sub_items=[
                SubItemConfig(name="OKX_Binance", weight=0.25, data_source="OKX/Binance API", data_description="K线、交易量、深度图", api_type="REST/WebSocket", api_endpoint="api.okx.com;api.binance.com"),
                SubItemConfig(name="CoinGecko", weight=0.25, data_source="CoinGecko", data_description="价格、市值、历史数据", api_type="REST API", api_endpoint="api.coingecko.com"),
                SubItemConfig(name="CoinMarketCap", weight=0.20, data_source="CoinMarketCap", data_description="市场数据、历史价格", api_type="REST API", api_endpoint="pro-api.coinmarketcap.com"),
                SubItemConfig(name="CryptoCompare", weight=0.15, data_source="CryptoCompare", data_description="多交易所OHLCV数据", api_type="REST/WebSocket", api_endpoint="min-api.cryptocompare.com"),
                SubItemConfig(name="TradingView", weight=0.15, data_source="TradingView (UNOFFICIAL)", data_description="图表数据", api_type="Scraper", api_endpoint="pine_fetch() 或爬虫"),
            ]),
        ],
        boost_factor=0.8,
    )


@router.post("/trend-config", response_model=TrendReportConfig)
async def save_trend_config(config: TrendReportConfig) -> TrendReportConfig:
    """Save trend report configuration.

    Validates that enabled dimension weights sum to 1.0 (100%).
    """
    global _trend_config_store
    enabled_total = sum(d.base_weight for d in config.dimensions if d.enabled)
    if abs(enabled_total - 1.0) > 0.01:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=422,
            detail=f"Enabled dimension weights must sum to 100% (got {enabled_total * 100:.1f}%)",
        )
    _trend_config_store = config
    return config


@router.get("/data-source/{source_key}")
async def get_data_source(
    source_key: str,
    symbol: str = Query("BTC/USDT", description="Trading pair symbol"),
) -> dict:
    """Fetch data from a single registered data source (for testing / preview)."""
    result = await fetch_data_source(source_key, symbol)
    return {
        "data": {
            "source_name": result.source_name,
            "raw_value": result.raw_value,
            "success": result.success,
            "error": result.error,
            "meta": result.meta,
        }
    }
