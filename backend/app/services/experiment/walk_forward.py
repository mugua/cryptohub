"""Module 18: Walk-Forward Analyser

Splits historical data into sequential train/test folds and measures
out-of-sample strategy performance.

Usage::

    from app.services.experiment.walk_forward import WalkForwardAnalyzer

    wfa = WalkForwardAnalyzer(strategy_fn=my_strategy, n_folds=5, train_pct=0.7)
    result = wfa.run(df=df, params={"fast": 5, "slow": 20})
"""
from __future__ import annotations

import logging
import statistics
from typing import Any, Callable, Dict, List, Optional

logger = logging.getLogger(__name__)


def _default_metric(returns: List[float]) -> float:
    if not returns or len(returns) < 2:
        return 0.0
    mu = statistics.mean(returns)
    sigma = statistics.stdev(returns)
    return mu / sigma if sigma > 0 else 0.0


class WalkForwardAnalyzer:
    """Walk-forward analysis for strategy validation.

    Args:
        strategy_fn:   Callable ``(df_slice, **params) -> List[float]``
        n_folds:       Number of sequential folds to use.
        train_pct:     Fraction of each fold used for training (default 0.7).
        metric_fn:     Scoring function; defaults to Sharpe-like ratio.
        optimize_fn:   Optional callable ``(df_train, params) -> Dict`` that
                       returns optimised params from the training window.
                       When omitted, the input *params* are used as-is.
    """

    def __init__(
        self,
        strategy_fn: Callable,
        n_folds: int = 5,
        train_pct: float = 0.7,
        metric_fn: Optional[Callable] = None,
        optimize_fn: Optional[Callable] = None,
    ) -> None:
        self.strategy_fn = strategy_fn
        self.n_folds = n_folds
        self.train_pct = train_pct
        self.metric_fn = metric_fn or _default_metric
        self.optimize_fn = optimize_fn

    def _slice_df(self, df: Any, start: int, end: int) -> Any:
        """Return a slice of *df* using iloc."""
        return df.iloc[start:end]

    def run(self, df: Any, params: Dict[str, Any]) -> Dict:
        """Execute the walk-forward analysis.

        Args:
            df:     Full historical DataFrame (must support ``iloc``).
            params: Base strategy parameters.

        Returns:
            Dict with per-fold results and aggregate statistics.
        """
        total_rows = len(df)
        fold_size = total_rows // self.n_folds
        if fold_size < 10:
            return {"error": "Not enough data for walk-forward analysis"}

        fold_results: List[Dict] = []

        for fold_idx in range(self.n_folds):
            fold_start = fold_idx * fold_size
            fold_end = fold_start + fold_size
            if fold_idx == self.n_folds - 1:
                fold_end = total_rows  # Last fold gets remaining rows

            split = fold_start + int((fold_end - fold_start) * self.train_pct)

            df_train = self._slice_df(df, fold_start, split)
            df_test = self._slice_df(df, split, fold_end)

            # Optionally optimise on training window
            fold_params = dict(params)
            if self.optimize_fn and len(df_train) >= 5:
                try:
                    optimised = self.optimize_fn(df_train, fold_params)
                    if optimised:
                        fold_params.update(optimised)
                except Exception as exc:
                    logger.debug("Fold %d optimize_fn failed: %s", fold_idx, exc)

            # Evaluate on out-of-sample test window
            try:
                oos_returns = self.strategy_fn(df_test, **fold_params)
                oos_score = self.metric_fn(oos_returns)
                train_returns = self.strategy_fn(df_train, **fold_params)
                train_score = self.metric_fn(train_returns)
            except Exception as exc:
                logger.warning("Fold %d strategy_fn failed: %s", fold_idx, exc)
                oos_score = 0.0
                train_score = 0.0
                oos_returns = []

            fold_results.append(
                {
                    "fold": fold_idx + 1,
                    "train_range": [fold_start, split],
                    "test_range": [split, fold_end],
                    "params_used": fold_params,
                    "train_score": round(train_score, 6),
                    "oos_score": round(oos_score, 6),
                    "oos_n_returns": len(oos_returns),
                }
            )

        oos_scores = [f["oos_score"] for f in fold_results]
        return {
            "n_folds": self.n_folds,
            "train_pct": self.train_pct,
            "folds": fold_results,
            "mean_oos_score": round(statistics.mean(oos_scores), 6) if oos_scores else 0.0,
            "median_oos_score": round(statistics.median(oos_scores), 6) if oos_scores else 0.0,
            "best_oos_score": round(max(oos_scores), 6) if oos_scores else 0.0,
            "worst_oos_score": round(min(oos_scores), 6) if oos_scores else 0.0,
        }
