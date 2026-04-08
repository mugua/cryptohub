from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class AssetOverview(BaseModel):
    total_value_usd: Decimal = Decimal("0")
    daily_pnl: Decimal = Decimal("0")
    daily_pnl_pct: Decimal = Decimal("0")
    btc_value: Decimal = Decimal("0")


class MarketCoin(BaseModel):
    symbol: str
    name: str
    price: Decimal
    change_24h: Decimal = Decimal("0")
    change_7d: Decimal = Decimal("0")
    market_cap: Optional[Decimal] = None
    volume_24h: Optional[Decimal] = None
    trend_signal: Optional[str] = None


class StrategyStatusItem(BaseModel):
    id: str
    name: str
    strategy_type: str
    is_active: bool
    is_paper: bool
    pnl: Decimal = Decimal("0")
    win_rate: Optional[Decimal] = None


class TradeRecord(BaseModel):
    id: str
    symbol: str
    side: str
    quantity: Decimal
    price: Decimal
    status: str
    created_at: str
    exchange: str


class DashboardOverview(BaseModel):
    assets: AssetOverview
    market: list[MarketCoin] = []
    strategies: list[StrategyStatusItem] = []
    recent_trades: list[TradeRecord] = []
