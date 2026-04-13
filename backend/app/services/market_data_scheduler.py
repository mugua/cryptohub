"""Module 11: Market Data Scheduler

Background scheduler that periodically refreshes market data into the
in-memory cache using ``threading.Timer``-based loops.

Predefined tasks (all intervals configurable via env vars):
    crypto          60 s   SCHEDULER_INTERVAL_CRYPTO
    stocks          300 s  SCHEDULER_INTERVAL_STOCKS
    forex           600 s  SCHEDULER_INTERVAL_FOREX
    commodities     600 s  SCHEDULER_INTERVAL_COMMODITIES
    indices         600 s  SCHEDULER_INTERVAL_INDICES
    sentiment      3600 s  SCHEDULER_INTERVAL_SENTIMENT
    news           3600 s  SCHEDULER_INTERVAL_NEWS

Environment variables:
    SCHEDULER_ENABLED   — set to "false" to disable (default: true)
    SCHEDULER_TASKS     — comma-separated list of tasks to enable
                          (default: all)

Usage::

    from app.services.market_data_scheduler import MarketDataScheduler

    scheduler = MarketDataScheduler()
    scheduler.start()
"""
from __future__ import annotations

import logging
import os
import threading
from typing import Callable, Dict, Optional

logger = logging.getLogger(__name__)

_ENABLED = os.getenv("SCHEDULER_ENABLED", "true").lower() != "false"
_TASKS_ENV = os.getenv("SCHEDULER_TASKS", "")  # e.g. "crypto,stocks"


def _default_interval(task: str, default: int) -> int:
    env_key = f"SCHEDULER_INTERVAL_{task.upper()}"
    return int(os.getenv(env_key) or str(default))


# ---------------------------------------------------------------------------
# Task runner helpers
# ---------------------------------------------------------------------------

def _run_crypto() -> None:
    try:
        from app.data_providers import get_cached, set_cached
        import yfinance as yf  # type: ignore

        symbols = ["BTC-USD", "ETH-USD", "BNB-USD", "XRP-USD", "SOL-USD"]
        results = []
        for sym in symbols:
            try:
                fi = yf.Ticker(sym).fast_info
                results.append({
                    "symbol": sym,
                    "price": float(getattr(fi, "last_price", 0) or 0),
                })
            except Exception:
                pass
        set_cached("scheduler:crypto", results, ttl=120)
        logger.debug("Scheduler: crypto updated (%d symbols)", len(results))
    except Exception as exc:
        logger.warning("Scheduler crypto task failed: %s", exc)


def _run_stocks() -> None:
    try:
        from app.data_providers import set_cached
        import yfinance as yf  # type: ignore

        symbols = ["AAPL", "MSFT", "AMZN", "GOOGL", "NVDA"]
        results = []
        for sym in symbols:
            try:
                fi = yf.Ticker(sym).fast_info
                results.append({
                    "symbol": sym,
                    "price": float(getattr(fi, "last_price", 0) or 0),
                })
            except Exception:
                pass
        set_cached("scheduler:stocks", results, ttl=600)
        logger.debug("Scheduler: stocks updated (%d symbols)", len(results))
    except Exception as exc:
        logger.warning("Scheduler stocks task failed: %s", exc)


def _run_commodities() -> None:
    try:
        from app.data_providers.commodities_extended import get_extended_commodities
        get_extended_commodities()
        logger.debug("Scheduler: commodities updated")
    except Exception as exc:
        logger.warning("Scheduler commodities task failed: %s", exc)


def _run_indices() -> None:
    try:
        from app.data_providers.indices_extended import get_extended_indices
        get_extended_indices()
        logger.debug("Scheduler: indices updated")
    except Exception as exc:
        logger.warning("Scheduler indices task failed: %s", exc)


def _run_sentiment() -> None:
    try:
        from app.data_providers.sentiment_aggregator import SentimentAggregator
        SentimentAggregator().get_all()
        logger.debug("Scheduler: sentiment updated")
    except Exception as exc:
        logger.warning("Scheduler sentiment task failed: %s", exc)


def _run_news() -> None:
    try:
        from app.data_providers.news_calendar import NewsCalendar
        nc = NewsCalendar()
        nc.get_news(market="all")
        nc.get_calendar()
        logger.debug("Scheduler: news updated")
    except Exception as exc:
        logger.warning("Scheduler news task failed: %s", exc)


def _run_forex() -> None:
    try:
        from app.data_providers import set_cached
        import yfinance as yf  # type: ignore

        pairs = ["EURUSD=X", "GBPUSD=X", "USDJPY=X", "AUDUSD=X", "USDCNH=X"]
        results = []
        for sym in pairs:
            try:
                fi = yf.Ticker(sym).fast_info
                results.append({
                    "symbol": sym,
                    "price": float(getattr(fi, "last_price", 0) or 0),
                })
            except Exception:
                pass
        set_cached("scheduler:forex", results, ttl=700)
        logger.debug("Scheduler: forex updated (%d pairs)", len(results))
    except Exception as exc:
        logger.warning("Scheduler forex task failed: %s", exc)


# Catalogue: name -> (runner_fn, default_interval_seconds)
_TASK_CATALOGUE: Dict[str, tuple] = {
    "crypto":      (_run_crypto,      _default_interval("crypto", 60)),
    "stocks":      (_run_stocks,      _default_interval("stocks", 300)),
    "forex":       (_run_forex,       _default_interval("forex", 600)),
    "commodities": (_run_commodities, _default_interval("commodities", 600)),
    "indices":     (_run_indices,     _default_interval("indices", 600)),
    "sentiment":   (_run_sentiment,   _default_interval("sentiment", 3600)),
    "news":        (_run_news,        _default_interval("news", 3600)),
}


# ---------------------------------------------------------------------------
# Scheduler
# ---------------------------------------------------------------------------

class _TaskLoop:
    """Repeating timer loop for a single task."""

    def __init__(self, name: str, fn: Callable, interval: int) -> None:
        self.name = name
        self.fn = fn
        self.interval = interval
        self._timer: Optional[threading.Timer] = None
        self._stop = threading.Event()

    def start(self) -> None:
        self._stop.clear()
        self._schedule()

    def stop(self) -> None:
        self._stop.set()
        if self._timer:
            self._timer.cancel()

    def _schedule(self) -> None:
        if self._stop.is_set():
            return
        self._timer = threading.Timer(self.interval, self._run)
        self._timer.daemon = True
        self._timer.start()

    def _run(self) -> None:
        try:
            self.fn()
        except Exception as exc:
            logger.error("Task '%s' error: %s", self.name, exc)
        self._schedule()


class MarketDataScheduler:
    """Orchestrates periodic market data refresh tasks."""

    def __init__(self) -> None:
        enabled_tasks: set = set()
        if _TASKS_ENV:
            enabled_tasks = {t.strip().lower() for t in _TASKS_ENV.split(",")}
        else:
            enabled_tasks = set(_TASK_CATALOGUE.keys())

        self._loops: Dict[str, _TaskLoop] = {}
        for name, (fn, interval) in _TASK_CATALOGUE.items():
            if name in enabled_tasks:
                self._loops[name] = _TaskLoop(name, fn, interval)

    def start(self) -> None:
        """Start all enabled task loops (immediately runs first tick)."""
        if not _ENABLED:
            logger.info("MarketDataScheduler disabled by SCHEDULER_ENABLED=false")
            return
        for loop in self._loops.values():
            # Run once immediately in a daemon thread, then schedule repeats
            t = threading.Thread(target=loop.fn, name=f"init:{loop.name}", daemon=True)
            t.start()
            loop.start()
        logger.info(
            "MarketDataScheduler started with tasks: %s",
            list(self._loops.keys()),
        )

    def stop(self) -> None:
        """Stop all task loops."""
        for loop in self._loops.values():
            loop.stop()
        logger.info("MarketDataScheduler stopped")
