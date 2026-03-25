"""Backtest router – runs quantitative strategy simulations on historical data."""

import math
import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter

from app.models.schemas import BacktestRequest, BacktestResult, EquityPoint

router = APIRouter()


@router.post("/run", response_model=BacktestResult)
async def run_backtest(req: BacktestRequest) -> BacktestResult:
    """
    Run a backtest simulation for the given strategy and parameters.

    Currently uses a Monte Carlo simulation as a placeholder.
    Replace with real OHLCV data fetching and signal generation in production.
    """
    start = datetime.fromisoformat(req.start_date)
    end = datetime.fromisoformat(req.end_date)
    days = max(1, (end - start).days)

    # Simulate equity curve
    equity = req.initial_capital
    peak = equity
    max_dd = 0.0
    wins = 0
    total_trades = 0
    curve: list[EquityPoint] = []

    # Strategy-specific drift parameters
    drift_map = {
        "grid": 0.001,
        "dca": 0.0008,
        "momentum": 0.0015,
        "mean_reversion": 0.001,
        "macd_crossover": 0.0012,
        "rsi_reversal": 0.0011,
        "bollinger_bands": 0.001,
        "turtle_trading": 0.0018,
        "arbitrage": 0.0006,
        "custom": 0.001,
    }
    drift = drift_map.get(req.strategy_type, 0.001)
    vol = 0.015

    for i in range(days):
        day = start + timedelta(days=i)
        daily_return = random.gauss(drift, vol)
        equity *= 1 + daily_return

        if equity > peak:
            peak = equity
        dd = (peak - equity) / peak
        if dd > max_dd:
            max_dd = dd

        # Simulate trades ~every 3 days
        if i % 3 == 0:
            total_trades += 1
            if daily_return > 0:
                wins += 1

        curve.append(EquityPoint(time=day.strftime("%Y-%m-%d"), value=round(equity, 2)))

    final = equity
    total_return = (final / req.initial_capital - 1) * 100
    years = days / 365
    ann_return = ((final / req.initial_capital) ** (1 / max(years, 0.01)) - 1) * 100

    # Approximate Sharpe ratio
    returns = [
        (curve[i].value / curve[i - 1].value - 1)
        for i in range(1, len(curve))
        if curve[i - 1].value > 0
    ]
    mean_r = sum(returns) / len(returns) if returns else 0
    std_r = math.sqrt(sum((r - mean_r) ** 2 for r in returns) / len(returns)) if len(returns) > 1 else 0.01
    sharpe = (mean_r / std_r) * math.sqrt(252) if std_r > 0 else 0

    win_rate = (wins / total_trades * 100) if total_trades > 0 else 0

    return BacktestResult(
        strategy_type=req.strategy_type,
        symbol=req.symbol,
        start_date=req.start_date,
        end_date=req.end_date,
        initial_capital=req.initial_capital,
        final_capital=round(final, 2),
        total_return=round(total_return, 2),
        annualized_return=round(ann_return, 2),
        max_drawdown=round(max_dd * 100, 2),
        sharpe_ratio=round(sharpe, 2),
        win_rate=round(win_rate, 1),
        total_trades=total_trades,
        profitable_trades=wins,
        equity_curve=curve,
    )
