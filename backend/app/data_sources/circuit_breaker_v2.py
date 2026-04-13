"""Module 4: Circuit Breaker V2

Three-state finite state machine per data provider:
  CLOSED -> OPEN -> HALF_OPEN -> CLOSED

Usage::

    from app.data_sources.circuit_breaker_v2 import CircuitBreakerV2, circuit_breaker

    cb = CircuitBreakerV2()

    @circuit_breaker(name="tencent")
    def fetch_data():
        ...
"""
from __future__ import annotations

import logging
import time
import threading
from dataclasses import dataclass, field
from enum import Enum
from functools import wraps
from typing import Callable, Dict, Optional

logger = logging.getLogger(__name__)


class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


@dataclass
class _ProviderState:
    state: CircuitState = CircuitState.CLOSED
    failure_count: int = 0
    success_count: int = 0
    last_failure_time: float = 0.0
    last_error: Optional[str] = None


class CircuitBreakerV2:
    """Enhanced three-state circuit breaker with per-provider isolation.

    Args:
        failure_threshold:   Number of failures before opening the circuit.
        recovery_timeout:    Seconds to wait before allowing a probe request
                             from OPEN state (transitions to HALF_OPEN).
        success_threshold:   Consecutive successes in HALF_OPEN required to
                             close the circuit again.
    """

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        success_threshold: int = 2,
    ) -> None:
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold
        self._states: Dict[str, _ProviderState] = {}
        self._lock = threading.Lock()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _get_state(self, source: str) -> _ProviderState:
        with self._lock:
            if source not in self._states:
                self._states[source] = _ProviderState()
            return self._states[source]

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def is_available(self, source: str) -> bool:
        """Return *True* if the circuit allows a request for *source*."""
        ps = self._get_state(source)
        with self._lock:
            if ps.state == CircuitState.CLOSED:
                return True
            if ps.state == CircuitState.OPEN:
                elapsed = time.time() - ps.last_failure_time
                if elapsed >= self.recovery_timeout:
                    ps.state = CircuitState.HALF_OPEN
                    ps.success_count = 0
                    logger.warning(
                        "CircuitBreaker[%s] OPEN -> HALF_OPEN after %.1fs",
                        source,
                        elapsed,
                    )
                    return True
                return False
            # HALF_OPEN: allow probe requests
            return True

    def record_success(self, source: str) -> None:
        """Register a successful call; may close the circuit."""
        ps = self._get_state(source)
        with self._lock:
            if ps.state == CircuitState.HALF_OPEN:
                ps.success_count += 1
                if ps.success_count >= self.success_threshold:
                    ps.state = CircuitState.CLOSED
                    ps.failure_count = 0
                    ps.success_count = 0
                    logger.warning(
                        "CircuitBreaker[%s] HALF_OPEN -> CLOSED", source
                    )
            elif ps.state == CircuitState.CLOSED:
                ps.failure_count = 0

    def record_failure(self, source: str, error: Optional[str] = None) -> None:
        """Register a failed call; may open the circuit."""
        ps = self._get_state(source)
        with self._lock:
            ps.last_failure_time = time.time()
            ps.last_error = error
            if ps.state == CircuitState.HALF_OPEN:
                ps.state = CircuitState.OPEN
                ps.success_count = 0
                logger.warning(
                    "CircuitBreaker[%s] HALF_OPEN -> OPEN (probe failed: %s)",
                    source,
                    error,
                )
                return
            ps.failure_count += 1
            if (
                ps.state == CircuitState.CLOSED
                and ps.failure_count >= self.failure_threshold
            ):
                ps.state = CircuitState.OPEN
                logger.warning(
                    "CircuitBreaker[%s] CLOSED -> OPEN after %d failures; "
                    "last error: %s",
                    source,
                    ps.failure_count,
                    error,
                )

    def get_all_states(self) -> Dict:
        """Return a snapshot of all provider states."""
        with self._lock:
            return {
                src: {
                    "state": ps.state.value,
                    "failure_count": ps.failure_count,
                    "success_count": ps.success_count,
                    "last_error": ps.last_error,
                    "last_failure_time": ps.last_failure_time,
                }
                for src, ps in self._states.items()
            }


# Singleton instance used by the decorator
_default_cb = CircuitBreakerV2()


def circuit_breaker(name: str, cb: Optional[CircuitBreakerV2] = None) -> Callable:
    """Decorator that wraps a function with circuit-breaker protection.

    Args:
        name: Provider name used to track state.
        cb:   Optional :class:`CircuitBreakerV2` instance; defaults to the
              module-level singleton.

    Raises:
        RuntimeError: When the circuit is OPEN and requests are not allowed.
    """
    _cb = cb or _default_cb

    def decorator(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not _cb.is_available(name):
                raise RuntimeError(
                    f"CircuitBreaker[{name}] is OPEN – request blocked"
                )
            try:
                result = fn(*args, **kwargs)
                _cb.record_success(name)
                return result
            except Exception as exc:
                _cb.record_failure(name, str(exc))
                raise

        return wrapper

    return decorator
