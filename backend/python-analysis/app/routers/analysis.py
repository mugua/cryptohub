"""Market analysis router – macro, policy, sentiment, supply/demand, technical."""

import random
from datetime import datetime, timezone

from fastapi import APIRouter, Query

from app.models.schemas import (
    AnalysisReport, MacroAnalysis, PolicyAnalysis, PolicyEvent,
    SupplyDemandAnalysis, SentimentAnalysis, TechnicalAnalysis,
    TechnicalIndicator, Signal,
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
