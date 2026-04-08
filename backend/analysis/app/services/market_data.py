from __future__ import annotations

import logging
from decimal import Decimal
from typing import Any

import httpx

from config import settings

logger = logging.getLogger(__name__)

# Map common symbols to CoinGecko IDs
SYMBOL_TO_ID: dict[str, str] = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "BNB": "binancecoin",
    "SOL": "solana",
    "XRP": "ripple",
    "ADA": "cardano",
    "DOGE": "dogecoin",
    "DOT": "polkadot",
    "AVAX": "avalanche-2",
    "MATIC": "matic-network",
    "LINK": "chainlink",
    "UNI": "uniswap",
    "LTC": "litecoin",
    "ATOM": "cosmos",
    "ARB": "arbitrum",
}

DEFAULT_TOP_COINS = ["bitcoin", "ethereum", "binancecoin", "solana", "ripple",
                     "cardano", "dogecoin", "polkadot", "avalanche-2", "chainlink"]


class MarketDataService:
    def __init__(self) -> None:
        self.base_url = settings.COINGECKO_BASE_URL
        self.timeout = 15.0

    def _resolve_id(self, symbol: str) -> str:
        return SYMBOL_TO_ID.get(symbol.upper(), symbol.lower())

    async def get_current_prices(
        self, symbols: list[str]
    ) -> dict[str, dict[str, Any]]:
        coin_ids = [self._resolve_id(s) for s in symbols]
        ids_param = ",".join(coin_ids)
        url = f"{self.base_url}/simple/price"
        params = {
            "ids": ids_param,
            "vs_currencies": "usd",
            "include_24hr_change": "true",
            "include_market_cap": "true",
            "include_24hr_vol": "true",
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                return resp.json()
        except Exception as exc:
            logger.warning("CoinGecko price fetch failed: %s", exc)
            return {}

    async def get_ohlcv(
        self, symbol: str, days: int = 30
    ) -> list[list[float]]:
        coin_id = self._resolve_id(symbol)
        url = f"{self.base_url}/coins/{coin_id}/ohlc"
        params = {"vs_currency": "usd", "days": str(days)}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                return resp.json()
        except Exception as exc:
            logger.warning("CoinGecko OHLCV fetch failed for %s: %s", symbol, exc)
            return []

    async def get_market_overview(self) -> list[Any]:
        url = f"{self.base_url}/coins/markets"
        params = {
            "vs_currency": "usd",
            "ids": ",".join(DEFAULT_TOP_COINS),
            "order": "market_cap_desc",
            "per_page": "10",
            "page": "1",
            "sparkline": "false",
            "price_change_percentage": "24h,7d",
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()

            from app.schemas.dashboard import MarketCoin

            coins = []
            for item in data:
                coins.append(
                    MarketCoin(
                        symbol=item.get("symbol", "").upper(),
                        name=item.get("name", ""),
                        price=Decimal(str(item.get("current_price", 0))),
                        change_24h=Decimal(
                            str(item.get("price_change_percentage_24h_in_currency", 0) or 0)
                        ),
                        change_7d=Decimal(
                            str(item.get("price_change_percentage_7d_in_currency", 0) or 0)
                        ),
                        market_cap=Decimal(str(item.get("market_cap", 0) or 0)),
                        volume_24h=Decimal(str(item.get("total_volume", 0) or 0)),
                    )
                )
            return coins
        except Exception as exc:
            logger.warning("CoinGecko market overview failed: %s", exc)
            return self._mock_market_overview()

    @staticmethod
    def _mock_market_overview() -> list[Any]:
        from app.schemas.dashboard import MarketCoin

        return [
            MarketCoin(
                symbol="BTC", name="Bitcoin",
                price=Decimal("67000"), change_24h=Decimal("1.2"), change_7d=Decimal("3.5"),
                market_cap=Decimal("1300000000000"), volume_24h=Decimal("25000000000"),
            ),
            MarketCoin(
                symbol="ETH", name="Ethereum",
                price=Decimal("3500"), change_24h=Decimal("-0.5"), change_7d=Decimal("2.1"),
                market_cap=Decimal("420000000000"), volume_24h=Decimal("12000000000"),
            ),
            MarketCoin(
                symbol="SOL", name="Solana",
                price=Decimal("175"), change_24h=Decimal("2.8"), change_7d=Decimal("8.3"),
                market_cap=Decimal("78000000000"), volume_24h=Decimal("3500000000"),
            ),
        ]
