from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analysis import AnalysisFactor, CoinFactorOverride, TrendReport
from app.services.market_data import MarketDataService
from app.services.sentiment import SentimentService
from app.services.technical import TechnicalAnalysisService

logger = logging.getLogger(__name__)

# Maps factor_key -> service method that provides its score
FACTOR_SERVICE_MAP: dict[str, str] = {
    # Technical
    "rsi_14": "technical",
    "macd": "technical",
    "bollinger_bands": "technical",
    "ma_200": "technical",
    "volume_profile": "technical",
    # Sentiment
    "fear_greed_index": "sentiment",
    "funding_rate": "sentiment",
    "social_media_volume": "sentiment",
    "google_trends": "sentiment",
}


class TrendEngine:
    """Core analysis engine that combines all factors into a trend report."""

    def __init__(self) -> None:
        self.technical = TechnicalAnalysisService()
        self.sentiment = SentimentService()
        self.market_data = MarketDataService()

    async def _get_factor_scores(self, symbol: str) -> dict[str, float]:
        """Gather raw scores from all available services."""
        technical_scores = await self.technical.analyze(symbol)
        sentiment_scores = await self.sentiment.analyze()

        all_scores: dict[str, float] = {}
        all_scores.update(technical_scores)
        all_scores.update(sentiment_scores)

        # Macro / policy / supply-demand factors get default neutral scores
        # In production these would come from dedicated data services
        macro_factors = [
            "us_cpi", "us_interest_rate", "dxy_index",
            "us_employment", "global_m2",
        ]
        policy_factors = [
            "us_crypto_policy", "china_crypto_policy",
            "eu_crypto_policy", "sec_actions",
        ]
        supply_demand_factors = [
            "exchange_reserves", "whale_movement",
            "mining_hashrate", "etf_flows",
        ]
        for key in macro_factors + policy_factors + supply_demand_factors:
            all_scores.setdefault(key, 0.0)

        return all_scores

    async def generate_report(
        self, db: AsyncSession, symbol: str
    ) -> TrendReport:
        # Step a: Load all active factors
        result = await db.execute(
            select(AnalysisFactor).where(AnalysisFactor.is_active.is_(True))
        )
        factors = result.scalars().all()

        if not factors:
            logger.warning("No active factors found, using defaults")
            return await self._generate_fallback_report(db, symbol)

        # Step b: Load coin-specific overrides
        overrides_result = await db.execute(
            select(CoinFactorOverride).where(
                CoinFactorOverride.coin_symbol == symbol.upper(),
                CoinFactorOverride.is_active.is_(True),
            )
        )
        overrides = overrides_result.scalars().all()
        override_map: dict[str, CoinFactorOverride] = {
            str(o.factor_id): o for o in overrides
        }

        # Step c-d: Get raw scores from services
        raw_scores = await self._get_factor_scores(symbol)

        # Step e: Compute weighted score
        weighted_sum = Decimal("0")
        weight_boost_sum = Decimal("0")
        factor_details: dict[str, Any] = {}

        for factor in factors:
            factor_id_str = str(factor.id)
            override = override_map.get(factor_id_str)

            # Effective weight: override or default
            effective_weight = (
                override.weight
                if override and override.weight is not None
                else factor.default_weight
            )
            # Boost coefficient: override or 1.0
            boost = (
                override.boost_coefficient
                if override and override.boost_coefficient is not None
                else Decimal("1.0")
            )

            raw_score = raw_scores.get(factor.factor_key, 0.0)
            score_decimal = Decimal(str(raw_score))

            contribution = score_decimal * effective_weight * boost
            weight_contribution = effective_weight * boost

            weighted_sum += contribution
            weight_boost_sum += weight_contribution

            factor_details[factor.factor_key] = {
                "factor_id": factor_id_str,
                "category": factor.category,
                "name_zh": factor.name_zh,
                "name_en": factor.name_en,
                "raw_score": float(raw_score),
                "weight": float(effective_weight),
                "boost": float(boost),
                "contribution": float(contribution),
                "has_override": override is not None,
            }

        # Final score calculation
        if weight_boost_sum > 0:
            final_score = (weighted_sum / weight_boost_sum)
        else:
            final_score = Decimal("0")

        final_score = max(Decimal("-100"), min(Decimal("100"), final_score))

        # Step f: Map to signal
        signal = self._score_to_signal(float(final_score))

        # Step g: Generate summary text
        summary_zh = self._generate_summary_zh(symbol, float(final_score), signal)
        summary_en = self._generate_summary_en(symbol, float(final_score), signal)

        # Step h: Save to database
        report = TrendReport(
            coin_symbol=symbol.upper(),
            report_type="comprehensive",
            overall_score=final_score,
            trend_signal=signal,
            factor_scores=factor_details,
            summary_zh=summary_zh,
            summary_en=summary_en,
            valid_from=datetime.now(timezone.utc),
            valid_until=datetime.now(timezone.utc) + timedelta(hours=4),
        )
        db.add(report)
        await db.flush()
        await db.refresh(report)

        logger.info(
            "Generated trend report for %s: score=%.2f signal=%s",
            symbol, final_score, signal,
        )

        # Step i: Return the report
        return report

    async def _generate_fallback_report(
        self, db: AsyncSession, symbol: str
    ) -> TrendReport:
        """Generate a report with mock data when no factors are configured."""
        raw_scores = await self._get_factor_scores(symbol)
        avg_score = sum(raw_scores.values()) / max(len(raw_scores), 1)
        final_score = max(-100.0, min(100.0, avg_score))
        signal = self._score_to_signal(final_score)

        report = TrendReport(
            coin_symbol=symbol.upper(),
            report_type="comprehensive",
            overall_score=Decimal(str(round(final_score, 2))),
            trend_signal=signal,
            factor_scores={k: {"raw_score": v} for k, v in raw_scores.items()},
            summary_zh=self._generate_summary_zh(symbol, final_score, signal),
            summary_en=self._generate_summary_en(symbol, final_score, signal),
            valid_from=datetime.now(timezone.utc),
            valid_until=datetime.now(timezone.utc) + timedelta(hours=4),
        )
        db.add(report)
        await db.flush()
        await db.refresh(report)
        return report

    @staticmethod
    def _score_to_signal(score: float) -> str:
        if score < -60:
            return "strong_sell"
        elif score < -20:
            return "sell"
        elif score <= 20:
            return "neutral"
        elif score <= 60:
            return "buy"
        else:
            return "strong_buy"

    @staticmethod
    def _generate_summary_zh(symbol: str, score: float, signal: str) -> str:
        signal_map = {
            "strong_buy": "强烈看多",
            "buy": "看多",
            "neutral": "中性",
            "sell": "看空",
            "strong_sell": "强烈看空",
        }
        signal_text = signal_map.get(signal, "中性")
        direction = "上涨" if score > 0 else "下跌" if score < 0 else "横盘"
        return (
            f"{symbol} 综合趋势分析得分为 {score:.1f}，信号为{signal_text}。"
            f"技术面和情绪面综合分析显示，当前市场偏向{direction}趋势。"
            f"建议结合个人风险偏好和资金管理策略进行决策。"
        )

    @staticmethod
    def _generate_summary_en(symbol: str, score: float, signal: str) -> str:
        signal_map = {
            "strong_buy": "Strong Buy",
            "buy": "Buy",
            "neutral": "Neutral",
            "sell": "Sell",
            "strong_sell": "Strong Sell",
        }
        signal_text = signal_map.get(signal, "Neutral")
        direction = "bullish" if score > 0 else "bearish" if score < 0 else "sideways"
        return (
            f"{symbol} comprehensive trend analysis score is {score:.1f}, "
            f"signal: {signal_text}. "
            f"Combined technical and sentiment analysis suggests a {direction} trend. "
            f"Consider your personal risk tolerance and capital management strategy."
        )
