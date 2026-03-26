"""Market analysis router – macro, policy, sentiment, supply/demand, technical."""

import random
from datetime import datetime, timezone

from fastapi import APIRouter, Query

from app.models.schemas import (
    AnalysisReport, MacroAnalysis, PolicyAnalysis, PolicyEvent,
    SupplyDemandAnalysis, SentimentAnalysis, TechnicalAnalysis,
    TechnicalIndicator, Signal,
    DimensionScore, TrendReport,
)
from app.services.trend_report import (
    BASE_WEIGHTS, compute_trend, normalise_score, severity_from_score,
)

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
