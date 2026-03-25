"""Strategy information router – lists available quantitative strategies."""

from fastapi import APIRouter

from app.models.schemas import StrategyInfo, StrategyType

router = APIRouter()

STRATEGIES: list[StrategyInfo] = [
    StrategyInfo(
        type=StrategyType.grid,
        name="网格交易",
        description="在预设价格区间内等间距挂单，通过价格震荡反复成交获利。适合震荡市场。",
        default_params={"lower": 60000, "upper": 70000, "grids": 20, "capital": 5000},
        risk_level="low",
        suitable_market="震荡行情",
    ),
    StrategyInfo(
        type=StrategyType.dca,
        name="定投策略 (DCA)",
        description="按固定时间间隔定额买入目标资产，通过摊低成本应对市场波动。",
        default_params={"amount": 100, "interval": "1d", "max_positions": 30},
        risk_level="low",
        suitable_market="长期持有 / 下跌趋势",
    ),
    StrategyInfo(
        type=StrategyType.momentum,
        name="动量策略",
        description="追踪市场强势趋势，当资产在一定时间窗口内持续上涨时买入，反之卖出。",
        default_params={"lookback": 14, "threshold": 0.05, "hold_period": 7},
        risk_level="medium",
        suitable_market="单边趋势行情",
    ),
    StrategyInfo(
        type=StrategyType.mean_reversion,
        name="均值回归",
        description="基于价格均值回归理论，当价格大幅偏离均值时进行反向操作。",
        default_params={"window": 20, "entry_zscore": 2.0, "exit_zscore": 0.5},
        risk_level="medium",
        suitable_market="震荡行情",
    ),
    StrategyInfo(
        type=StrategyType.arbitrage,
        name="套利策略",
        description="利用同一资产在不同交易所或合约之间的价差进行无风险套利。",
        default_params={"min_spread_pct": 0.3, "capital": 10000, "exchanges": ["binance", "okx"]},
        risk_level="low",
        suitable_market="价差明显时",
    ),
    StrategyInfo(
        type=StrategyType.macd_crossover,
        name="MACD 金叉/死叉",
        description="MACD 信号线金叉时做多，死叉时平仓或做空。经典趋势跟踪策略。",
        default_params={"fast": 12, "slow": 26, "signal": 9},
        risk_level="medium",
        suitable_market="趋势行情",
    ),
    StrategyInfo(
        type=StrategyType.rsi_reversal,
        name="RSI 反转",
        description="RSI 进入超卖区间时做多，超买区间时做空。适合短线交易。",
        default_params={"period": 14, "oversold": 30, "overbought": 70},
        risk_level="medium",
        suitable_market="震荡行情",
    ),
    StrategyInfo(
        type=StrategyType.bollinger_bands,
        name="布林带策略",
        description="价格触及布林带下轨时买入，触及上轨时卖出；或突破时追势。",
        default_params={"period": 20, "std_dev": 2.0, "mode": "mean_reversion"},
        risk_level="medium",
        suitable_market="震荡或趋势",
    ),
    StrategyInfo(
        type=StrategyType.turtle_trading,
        name="海龟交易",
        description="唐奇安通道突破系统，20日新高买入，10日新低止损，经典趋势跟踪策略。",
        default_params={"entry_period": 20, "exit_period": 10, "atr_multiplier": 2.0, "risk_per_trade": 0.02},
        risk_level="medium",
        suitable_market="强趋势行情",
    ),
    StrategyInfo(
        type=StrategyType.custom,
        name="自定义策略",
        description="通过 Python 代码自定义交易逻辑，支持技术指标、机器学习模型等。",
        default_params={"code": "# Your strategy code here\n"},
        risk_level="high",
        suitable_market="由策略逻辑决定",
    ),
]


@router.get("", response_model=list[StrategyInfo])
async def list_strategies() -> list[StrategyInfo]:
    """Return all available quantitative strategy templates."""
    return STRATEGIES


@router.get("/{strategy_type}", response_model=StrategyInfo)
async def get_strategy(strategy_type: StrategyType) -> StrategyInfo:
    """Return details for a specific strategy type."""
    for s in STRATEGIES:
        if s.type == strategy_type:
            return s
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail=f"Strategy type '{strategy_type}' not found")
