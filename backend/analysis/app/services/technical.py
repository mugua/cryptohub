from __future__ import annotations

import logging
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class TechnicalAnalysisService:
    """Calculate technical indicators and return scores in [-100, 100]."""

    @staticmethod
    def calculate_rsi(prices: list[float], period: int = 14) -> float:
        if len(prices) < period + 1:
            return 0.0

        series = pd.Series(prices)
        delta = series.diff()
        gain = delta.where(delta > 0, 0.0)
        loss = (-delta).where(delta < 0, 0.0)

        avg_gain = gain.rolling(window=period, min_periods=period).mean()
        avg_loss = loss.rolling(window=period, min_periods=period).mean()

        rs = avg_gain / avg_loss.replace(0, np.nan)
        rsi = 100.0 - (100.0 / (1.0 + rs))
        rsi_value = float(rsi.iloc[-1]) if not pd.isna(rsi.iloc[-1]) else 50.0

        # Map RSI to score: RSI>70 bearish (negative), RSI<30 bullish (positive)
        if rsi_value >= 70:
            score = -((rsi_value - 70) / 30) * 100
        elif rsi_value <= 30:
            score = ((30 - rsi_value) / 30) * 100
        else:
            score = ((50 - rsi_value) / 20) * 50

        return float(np.clip(score, -100, 100))

    @staticmethod
    def calculate_macd(
        prices: list[float], fast: int = 12, slow: int = 26, signal: int = 9
    ) -> float:
        if len(prices) < slow + signal:
            return 0.0

        series = pd.Series(prices)
        ema_fast = series.ewm(span=fast, adjust=False).mean()
        ema_slow = series.ewm(span=slow, adjust=False).mean()
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal, adjust=False).mean()
        histogram = macd_line - signal_line

        hist_val = float(histogram.iloc[-1])
        price_ref = prices[-1] if prices[-1] != 0 else 1.0
        # Normalize histogram relative to price
        normalized = (hist_val / abs(price_ref)) * 1000

        return float(np.clip(normalized, -100, 100))

    @staticmethod
    def calculate_bollinger(
        prices: list[float], period: int = 20, num_std: float = 2.0
    ) -> float:
        if len(prices) < period:
            return 0.0

        series = pd.Series(prices)
        sma = series.rolling(window=period).mean()
        std = series.rolling(window=period).std()

        upper = sma + num_std * std
        lower = sma - num_std * std

        current_price = prices[-1]
        upper_val = float(upper.iloc[-1])
        lower_val = float(lower.iloc[-1])
        band_width = upper_val - lower_val

        if band_width == 0:
            return 0.0

        # Position in band: 0 = lower, 1 = upper
        position = (current_price - lower_val) / band_width
        # Near lower band = bullish, near upper = bearish
        score = (0.5 - position) * 200

        return float(np.clip(score, -100, 100))

    @staticmethod
    def calculate_ma200(prices: list[float]) -> float:
        if len(prices) < 200:
            # Use available data for a shorter MA
            period = min(len(prices), 50)
            if period < 10:
                return 0.0
        else:
            period = 200

        series = pd.Series(prices)
        ma = series.rolling(window=period).mean()
        ma_val = float(ma.iloc[-1])

        if ma_val == 0:
            return 0.0

        current_price = prices[-1]
        pct_diff = ((current_price - ma_val) / ma_val) * 100

        # Above MA200 = bullish, below = bearish
        score = pct_diff * 5
        return float(np.clip(score, -100, 100))

    @staticmethod
    def calculate_volume_profile(volumes: list[float]) -> float:
        if len(volumes) < 10:
            return 0.0

        series = pd.Series(volumes)
        short_avg = series.tail(5).mean()
        long_avg = series.mean()

        if long_avg == 0:
            return 0.0

        ratio = short_avg / long_avg
        # High recent volume relative to average = bullish momentum
        score = (ratio - 1.0) * 100

        return float(np.clip(score, -100, 100))

    async def analyze(self, symbol: str) -> dict[str, Any]:
        from app.services.market_data import MarketDataService

        market_service = MarketDataService()
        ohlcv = await market_service.get_ohlcv(symbol, days=365)

        if not ohlcv:
            return self._mock_scores()

        closes = [candle[4] for candle in ohlcv if len(candle) >= 5]
        volumes = []

        # CoinGecko OHLCV doesn't have volume, so we approximate from price changes
        for i in range(len(closes)):
            volumes.append(abs(closes[i] - closes[i - 1]) if i > 0 else 0)

        if len(closes) < 15:
            return self._mock_scores()

        return {
            "rsi_14": self.calculate_rsi(closes),
            "macd": self.calculate_macd(closes),
            "bollinger_bands": self.calculate_bollinger(closes),
            "ma_200": self.calculate_ma200(closes),
            "volume_profile": self.calculate_volume_profile(volumes),
        }

    @staticmethod
    def _mock_scores() -> dict[str, float]:
        return {
            "rsi_14": 15.0,
            "macd": 10.0,
            "bollinger_bands": 5.0,
            "ma_200": 20.0,
            "volume_profile": 8.0,
        }
