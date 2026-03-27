"""Pydantic models for the analysis service."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ── Shared ────────────────────────────────────────────────────────────────────

class Signal(str, Enum):
    strong_buy = "strong_buy"
    buy = "buy"
    neutral = "neutral"
    sell = "sell"
    strong_sell = "strong_sell"


# ── Analysis models ───────────────────────────────────────────────────────────

class MacroAnalysis(BaseModel):
    score: float = Field(..., ge=-100, le=100)
    inflation_expectation: str
    dollar_index: float
    fear_greed_index: int
    summary: str


class PolicyEvent(BaseModel):
    date: str
    country: str
    title: str
    impact: str  # positive | negative | neutral


class PolicyAnalysis(BaseModel):
    score: float = Field(..., ge=-100, le=100)
    recent_events: list[PolicyEvent]
    summary: str


class SupplyDemandAnalysis(BaseModel):
    score: float = Field(..., ge=-100, le=100)
    exchange_netflow: float
    miners_netflow: float
    whale_activity: str  # accumulating | distributing | neutral
    summary: str


class SentimentAnalysis(BaseModel):
    score: float = Field(..., ge=-100, le=100)
    fear_greed_index: int
    fear_greed_label: str
    twitter_bullish_pct: float
    reddit_sentiment: str
    summary: str


class TechnicalIndicator(BaseModel):
    name: str
    value: Any
    signal: str  # buy | sell | neutral


class ExecutionMetrics(BaseModel):
    """Execution-layer health metrics (slippage, latency, API stability)."""
    avg_slippage_bps: float = Field(0, description="Average slippage in basis points")
    network_latency_ms: float = Field(0, description="API round-trip latency in ms")
    api_success_rate: float = Field(1.0, ge=0, le=1, description="API call success rate 0-1")
    order_book_depth_score: float = Field(
        0, ge=0, le=100, description="Liquidity depth score 0-100"
    )
    execution_risk: str = "low"  # low | medium | high


class TechnicalTrend(BaseModel):
    """Trend assessment for a given time-horizon."""
    horizon: str  # short_term | mid_long_term
    trend: str  # uptrend | downtrend | sideways
    confidence: float = Field(0.5, ge=0, le=1, description="Confidence 0-1")
    key_indicators: list[TechnicalIndicator] = []
    summary: str = ""


class TechnicalAnalysis(BaseModel):
    trend: str  # uptrend | downtrend | sideways  (overall / backward-compat)
    short_term_trend: TechnicalTrend | None = None
    mid_long_term_trend: TechnicalTrend | None = None
    support_levels: list[float]
    resistance_levels: list[float]
    indicators: list[TechnicalIndicator]
    execution: ExecutionMetrics | None = None
    summary: str


class AnalysisReport(BaseModel):
    symbol: str
    generated_at: datetime
    macro: MacroAnalysis
    policy: PolicyAnalysis
    supply_demand: SupplyDemandAnalysis
    sentiment: SentimentAnalysis
    technical: TechnicalAnalysis
    summary: str
    signal: Signal


# ── Trend Report models ──────────────────────────────────────────────────────

class TrendSignal(str, Enum):
    strong_bullish = "strong_bullish"
    mild_bullish = "mild_bullish"
    neutral = "neutral"
    mild_bearish = "mild_bearish"
    strong_bearish = "strong_bearish"


class DimensionScore(BaseModel):
    """Score and weight details for one analysis dimension."""
    name: str
    raw_score: float = Field(..., ge=-1, le=1, description="Normalised score in [-1, 1]")
    base_weight: float = Field(..., ge=0, le=1)
    adjusted_weight: float = Field(..., ge=0, le=1)
    severity: float = Field(..., ge=0, le=1, description="Importance / severity 0-1")
    summary: str


class SubItemConfig(BaseModel):
    """Configurable sub-item within a dimension (data source + API config)."""
    name: str
    weight: float = Field(0, ge=0, le=1, description="Weight within parent dimension")
    data_source: str = ""
    data_description: str = ""
    api_type: str = "REST API"    # REST API | GraphQL API | WebSocket | RSS/JSON | Scraper
    api_endpoint: str = ""
    enabled: bool = True


class DimensionConfig(BaseModel):
    """Config for a single analysis dimension (frontend-editable).

    ``sub_items`` holds **common / base** indicators that apply to all coins.
    ``coin_specific_items`` holds per-coin quantitative factors keyed by a
    normalised coin symbol (e.g. ``"BTC"``, ``"ETH"``).
    """
    name: str
    base_weight: float = Field(..., ge=0, le=1)
    enabled: bool = True
    sub_items: list[SubItemConfig] = []
    coin_specific_items: dict[str, list[SubItemConfig]] = {}


class TrendReportConfig(BaseModel):
    """Full trend report configuration (five dimensions + boost)."""
    dimensions: list[DimensionConfig]
    boost_factor: float = Field(0.8, ge=0, le=2)


class TrendReport(BaseModel):
    """Aggregated multi-dimension trend report."""
    symbol: str
    generated_at: datetime
    composite_score: float = Field(..., ge=-1, le=1)
    signal: TrendSignal
    dimensions: list[DimensionScore]
    summary: str


# ── Backtest models ───────────────────────────────────────────────────────────

class BacktestRequest(BaseModel):
    strategy_type: str
    symbol: str
    start_date: str
    end_date: str
    initial_capital: float = 10_000.0
    params: dict[str, Any] = {}


class EquityPoint(BaseModel):
    time: str
    value: float


class BacktestResult(BaseModel):
    strategy_type: str
    symbol: str
    start_date: str
    end_date: str
    initial_capital: float
    final_capital: float
    total_return: float
    annualized_return: float
    max_drawdown: float
    sharpe_ratio: float
    win_rate: float
    total_trades: int
    profitable_trades: int
    equity_curve: list[EquityPoint]


# ── Strategy models ───────────────────────────────────────────────────────────

class StrategyType(str, Enum):
    grid = "grid"
    dca = "dca"
    momentum = "momentum"
    mean_reversion = "mean_reversion"
    arbitrage = "arbitrage"
    macd_crossover = "macd_crossover"
    rsi_reversal = "rsi_reversal"
    bollinger_bands = "bollinger_bands"
    turtle_trading = "turtle_trading"
    custom = "custom"


class StrategyInfo(BaseModel):
    type: StrategyType
    name: str
    description: str
    default_params: dict[str, Any]
    risk_level: str  # low | medium | high
    suitable_market: str
