"""Module 18: Strategy Optimizer

Provides grid-search parameter optimisation and Monte Carlo simulation for
trading strategies.

Usage::

    from app.services.experiment.optimizer import StrategyOptimizer

    opt = StrategyOptimizer(strategy_fn=my_strategy)
    result = opt.grid_search(param_grid={"fast": [5,10], "slow": [20,50]}, df=df)
    mc = opt.monte_carlo(df=df, params={"fast": 5, "slow": 20}, n_simulations=1000)
"""
from __future__ import annotations

import logging
import random
import statistics
from typing import Any, Callable, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


def _default_metric(returns: List[float]) -> float:
    """Compute Sharpe-like ratio: mean / std."""
    if not returns or len(returns) < 2:
        return 0.0
    mu = statistics.mean(returns)
    sigma = statistics.stdev(returns)
    return mu / sigma if sigma > 0 else 0.0


class StrategyOptimizer:
    """Grid-search optimiser and Monte Carlo simulator for strategy parameters.

    Args:
        strategy_fn: Callable ``(df, **params) -> List[float]`` that returns a
                     list of period returns given a DataFrame and parameters.
        metric_fn:   Callable ``(returns) -> float`` for scoring; defaults to
                     Sharpe-like ratio.
    """

    def __init__(
        self,
        strategy_fn: Callable,
        metric_fn: Optional[Callable] = None,
    ) -> None:
        self.strategy_fn = strategy_fn
        self.metric_fn = metric_fn or _default_metric

    # ------------------------------------------------------------------
    # Grid search
    # ------------------------------------------------------------------

    def grid_search(
        self,
        param_grid: Dict[str, List[Any]],
        df: Any,
        top_n: int = 5,
    ) -> Dict:
        """Exhaustive grid search over *param_grid*.

        Args:
            param_grid: Dict mapping parameter name -> list of values to try.
            df:         Input DataFrame passed to *strategy_fn*.
            top_n:      Number of top parameter sets to return.

        Returns:
            Dict with ``best_params``, ``best_score``, and ``top_results``.
        """
        import itertools

        keys = list(param_grid.keys())
        values = list(param_grid.values())
        combinations = list(itertools.product(*values))

        results: List[Tuple[float, Dict]] = []
        for combo in combinations:
            params = dict(zip(keys, combo))
            try:
                returns = self.strategy_fn(df, **params)
                score = self.metric_fn(returns)
                results.append((score, params))
            except Exception as exc:
                logger.debug("grid_search combo %s failed: %s", params, exc)

        results.sort(key=lambda x: x[0], reverse=True)
        top = results[:top_n]
        best_score, best_params = top[0] if top else (0.0, {})

        return {
            "best_params": best_params,
            "best_score": round(best_score, 6),
            "top_results": [
                {"params": p, "score": round(s, 6)} for s, p in top
            ],
            "total_combinations": len(combinations),
        }

    # ------------------------------------------------------------------
    # Monte Carlo simulation
    # ------------------------------------------------------------------

    def monte_carlo(
        self,
        df: Any,
        params: Dict[str, Any],
        n_simulations: int = 1000,
        confidence: float = 0.95,
    ) -> Dict:
        """Run *n_simulations* Monte Carlo trials by random return resampling.

        Args:
            df:            Input DataFrame.
            params:        Fixed parameters to pass to *strategy_fn*.
            n_simulations: Number of bootstrap resampling trials.
            confidence:    Confidence interval level (e.g. 0.95 for 95 % CI).

        Returns:
            Dict with ``median``, ``best``, ``worst``, ``ci_lower``,
            ``ci_upper``, and ``scores``.
        """
        try:
            base_returns = self.strategy_fn(df, **params)
        except Exception as exc:
            logger.warning("monte_carlo base run failed: %s", exc)
            return {"error": str(exc)}

        n = len(base_returns)
        if n == 0:
            return {"error": "strategy returned no returns"}

        scores: List[float] = []
        for _ in range(n_simulations):
            sample = random.choices(base_returns, k=n)  # noqa: S311
            scores.append(self.metric_fn(sample))

        scores.sort()
        alpha = 1.0 - confidence
        lo_idx = int(alpha / 2 * n_simulations)
        hi_idx = int((1 - alpha / 2) * n_simulations)

        return {
            "n_simulations": n_simulations,
            "median": round(statistics.median(scores), 6),
            "best": round(scores[-1], 6),
            "worst": round(scores[0], 6),
            "ci_lower": round(scores[lo_idx], 6),
            "ci_upper": round(scores[hi_idx], 6),
            "confidence": confidence,
        }
