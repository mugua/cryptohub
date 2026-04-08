from __future__ import annotations

import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)


class SentimentService:
    """Fetch and compute sentiment scores in [-100, 100]."""

    async def get_fear_greed(self) -> dict[str, Any]:
        url = "https://api.alternative.me/fng/"
        params = {"limit": "1", "format": "json"}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()
            if "data" in data and data["data"]:
                entry = data["data"][0]
                value = int(entry.get("value", 50))
                classification = entry.get("value_classification", "Neutral")
                return {"value": value, "classification": classification}
        except Exception as exc:
            logger.warning("Fear & Greed fetch failed: %s", exc)

        return {"value": 50, "classification": "Neutral"}

    async def get_funding_rate(self, symbol: str) -> float:
        """Estimated funding rate score. In production, fetch from exchange APIs."""
        mock_rates: dict[str, float] = {
            "BTC": 0.01,
            "ETH": 0.008,
            "SOL": 0.015,
            "BNB": 0.005,
        }
        rate = mock_rates.get(symbol.upper(), 0.005)
        # Positive funding = longs pay shorts = slightly bearish
        # Normalize: 0.01% is neutral, higher = bearish, negative = bullish
        score = -(rate - 0.01) * 5000
        return max(-100.0, min(100.0, score))

    async def get_social_volume(self, symbol: str) -> float:
        """Mock social media volume score."""
        _ = symbol
        return 10.0

    async def get_google_trends(self, symbol: str) -> float:
        """Mock Google Trends score."""
        _ = symbol
        return 5.0

    async def analyze(self) -> dict[str, float]:
        fg = await self.get_fear_greed()
        fg_value = fg["value"]

        # Map Fear & Greed (0=extreme fear/bullish signal, 100=extreme greed/bearish)
        fg_score = (50 - fg_value) * 2.0
        fg_score = max(-100.0, min(100.0, fg_score))

        funding_score = await self.get_funding_rate("BTC")
        social_score = await self.get_social_volume("BTC")
        google_score = await self.get_google_trends("BTC")

        return {
            "fear_greed_index": fg_score,
            "funding_rate": funding_score,
            "social_media_volume": social_score,
            "google_trends": google_score,
        }
