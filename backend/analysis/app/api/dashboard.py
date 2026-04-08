from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.trading import Order, Strategy
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.dashboard import (
    AssetOverview,
    DashboardOverview,
    MarketCoin,
    StrategyStatusItem,
    TradeRecord,
)
from app.services.market_data import MarketDataService

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])
market_service = MarketDataService()


@router.get("/overview", response_model=APIResponse[DashboardOverview])
async def overview(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    market_coins = await market_service.get_market_overview()

    strategies_result = await db.execute(
        select(Strategy).where(Strategy.user_id == user.id).limit(10)
    )
    strategies = strategies_result.scalars().all()

    orders_result = await db.execute(
        select(Order)
        .where(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .limit(10)
    )
    orders = orders_result.scalars().all()

    assets = AssetOverview(
        total_value_usd=Decimal("0"),
        daily_pnl=Decimal("0"),
        daily_pnl_pct=Decimal("0"),
        btc_value=Decimal("0"),
    )

    strategy_items = [
        StrategyStatusItem(
            id=str(s.id),
            name=s.name,
            strategy_type=s.strategy_type,
            is_active=s.is_active,
            is_paper=s.is_paper,
        )
        for s in strategies
    ]

    trade_items = [
        TradeRecord(
            id=str(o.id),
            symbol=o.coin_symbol,
            side=o.side,
            quantity=o.quantity,
            price=o.price or Decimal("0"),
            status=o.status,
            created_at=o.created_at.isoformat() if o.created_at else "",
            exchange=o.exchange,
        )
        for o in orders
    ]

    data = DashboardOverview(
        assets=assets,
        market=market_coins,
        strategies=strategy_items,
        recent_trades=trade_items,
    )
    return APIResponse(data=data)


@router.get("/market-summary", response_model=APIResponse[list[MarketCoin]])
async def market_summary():
    coins = await market_service.get_market_overview()
    return APIResponse(data=coins)


@router.get("/recent-trades", response_model=APIResponse[list[TradeRecord]])
async def recent_trades(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    orders_result = await db.execute(
        select(Order)
        .where(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .limit(20)
    )
    orders = orders_result.scalars().all()
    items = [
        TradeRecord(
            id=str(o.id),
            symbol=o.coin_symbol,
            side=o.side,
            quantity=o.quantity,
            price=o.price or Decimal("0"),
            status=o.status,
            created_at=o.created_at.isoformat() if o.created_at else "",
            exchange=o.exchange,
        )
        for o in orders
    ]
    return APIResponse(data=items)


@router.get("/strategy-status", response_model=APIResponse[list[StrategyStatusItem]])
async def strategy_status(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Strategy).where(Strategy.user_id == user.id)
    )
    strategies = result.scalars().all()
    items = [
        StrategyStatusItem(
            id=str(s.id),
            name=s.name,
            strategy_type=s.strategy_type,
            is_active=s.is_active,
            is_paper=s.is_paper,
        )
        for s in strategies
    ]
    return APIResponse(data=items)
