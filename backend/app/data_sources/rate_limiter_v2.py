"""Module 5: Rate Limiter V2 — Token-Bucket Algorithm

Pre-configured limits:
    tencent     5 req/s   (300 rpm)
    twelvedata  8 req/min
    akshare     3 req/s   (180 rpm)
    yfinance    2 req/s   (120 rpm)
    tiingo      50 req/h  (~0.83 rpm)

Override any provider via ``RATE_LIMIT_{PROVIDER}_RPM`` env var.

Usage::

    from app.data_sources.rate_limiter_v2 import TokenBucketRateLimiter, rate_limited

    limiter = TokenBucketRateLimiter()

    @rate_limited(provider="tencent")
    def fetch():
        ...
"""
from __future__ import annotations

import logging
import os
import threading
import time
from functools import wraps
from typing import Callable, Dict, Optional

logger = logging.getLogger(__name__)


class RateLimitExceeded(Exception):
    """Raised when a token cannot be acquired within *max_wait_sec*."""


class _TokenBucket:
    """Single token-bucket for one provider."""

    def __init__(self, rate_per_second: float) -> None:
        self._rate = rate_per_second          # tokens added per second
        self._capacity = max(rate_per_second, 1.0)
        self._tokens = self._capacity
        self._last_refill = time.monotonic()
        self._lock = threading.Lock()

    def _refill(self) -> None:
        now = time.monotonic()
        delta = now - self._last_refill
        self._tokens = min(self._capacity, self._tokens + delta * self._rate)
        self._last_refill = now

    def acquire(self, max_wait_sec: float = 10.0) -> None:
        """Block until a token is available or *max_wait_sec* expires."""
        deadline = time.monotonic() + max_wait_sec
        while True:
            with self._lock:
                self._refill()
                if self._tokens >= 1.0:
                    self._tokens -= 1.0
                    return
                # How long until the next token arrives?
                wait = (1.0 - self._tokens) / self._rate
            if time.monotonic() + wait > deadline:
                raise RateLimitExceeded(
                    f"Could not acquire token within {max_wait_sec}s"
                )
            time.sleep(min(wait, 0.05))


# Default provider configurations (req/min -> req/s)
_DEFAULT_CONFIGS: Dict[str, float] = {
    "tencent":    300 / 60,   # 5/s
    "twelvedata": 8 / 60,     # 8/min
    "akshare":    180 / 60,   # 3/s
    "yfinance":   120 / 60,   # 2/s
    "tiingo":     50 / 3600,  # 50/h
}


class TokenBucketRateLimiter:
    """Multi-provider token-bucket rate limiter.

    Rate for each provider can be overridden with the environment variable
    ``RATE_LIMIT_{PROVIDER_UPPER}_RPM``.
    """

    def __init__(self) -> None:
        self._buckets: Dict[str, _TokenBucket] = {}
        self._lock = threading.Lock()

    def _get_bucket(self, provider: str) -> _TokenBucket:
        with self._lock:
            if provider not in self._buckets:
                env_key = f"RATE_LIMIT_{provider.upper()}_RPM"
                rpm = float(os.getenv(env_key) or 0)
                if rpm > 0:
                    rate = rpm / 60.0
                else:
                    rate = _DEFAULT_CONFIGS.get(provider, 1.0)
                self._buckets[provider] = _TokenBucket(rate)
            return self._buckets[provider]

    def acquire(self, provider: str, max_wait_sec: float = 10.0) -> None:
        """Acquire a token for *provider*, blocking if necessary.

        Args:
            provider:    Provider name (case-insensitive key).
            max_wait_sec: Maximum seconds to wait before raising
                          :class:`RateLimitExceeded`.
        """
        self._get_bucket(provider).acquire(max_wait_sec)


# Singleton
_default_limiter = TokenBucketRateLimiter()


def rate_limited(
    provider: str,
    limiter: Optional[TokenBucketRateLimiter] = None,
    max_wait_sec: float = 10.0,
) -> Callable:
    """Decorator that enforces rate-limiting for *provider*.

    Args:
        provider:    Provider name passed to :class:`TokenBucketRateLimiter`.
        limiter:     Optional custom limiter; defaults to the module singleton.
        max_wait_sec: Forwarded to :meth:`TokenBucketRateLimiter.acquire`.
    """
    _limiter = limiter or _default_limiter

    def decorator(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*args, **kwargs):
            _limiter.acquire(provider, max_wait_sec=max_wait_sec)
            return fn(*args, **kwargs)

        return wrapper

    return decorator
