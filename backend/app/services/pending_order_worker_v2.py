"""Module 9: Pending Order Worker V2

Background thread that polls ``qd_pending_orders`` for 'pending' orders and
evaluates trigger conditions against the current market price.

Condition types:
    limit_buy / limit_sell / stop_loss / take_profit / trailing_stop

Environment variables:
    PENDING_ORDER_POLL_SEC  — polling interval in seconds (default 10)
    DATABASE_URL            — PostgreSQL connection string

Usage::

    from app.services.pending_order_worker_v2 import PendingOrderWorker

    worker = PendingOrderWorker()
    worker.start()
    # ... later ...
    worker.stop()
"""
from __future__ import annotations

import logging
import os
import threading
import time
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

_POLL_SEC = float(os.getenv("PENDING_ORDER_POLL_SEC") or "10")


# ---------------------------------------------------------------------------
# DB helpers (PostgreSQL via psycopg2)
# ---------------------------------------------------------------------------

def _get_conn():
    """Return a new psycopg2 connection or raise ImportError / OperationalError."""
    import psycopg2  # type: ignore

    dsn = os.getenv("DATABASE_URL") or ""
    if not dsn:
        raise RuntimeError("DATABASE_URL not set")
    return psycopg2.connect(dsn)


def _fetch_pending_orders(conn) -> List[Dict]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, user_id, symbol, condition_type, trigger_price,
                   amount, side, market_type, leverage, expires_at
            FROM qd_pending_orders
            WHERE status = 'pending'
              AND (expires_at IS NULL OR expires_at > NOW())
            ORDER BY created_at
            LIMIT 500
            """
        )
        cols = [desc[0] for desc in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]


_UPDATE_SQL: dict = {
    "triggered": (
        "UPDATE qd_pending_orders "
        "SET status = %s, triggered_at = NOW(), error_msg = %s, updated_at = NOW() "
        "WHERE id = %s"
    ),
    "filled": (
        "UPDATE qd_pending_orders "
        "SET status = %s, filled_at = NOW(), error_msg = %s, updated_at = NOW() "
        "WHERE id = %s"
    ),
    "_default": (
        "UPDATE qd_pending_orders "
        "SET status = %s, error_msg = %s, updated_at = NOW() "
        "WHERE id = %s"
    ),
}


def _update_order(conn, order_id: int, status: str, error_msg: str = "") -> None:
    """Update a pending order row using pre-written parameterised statements
    (no f-string interpolation into SQL)."""
    sql = _UPDATE_SQL.get(status, _UPDATE_SQL["_default"])
    with conn.cursor() as cur:
        cur.execute(sql, (status, error_msg, order_id))
    conn.commit()


# ---------------------------------------------------------------------------
# Market price stub (replace with real data source integration)
# ---------------------------------------------------------------------------

def _get_current_price(symbol: str) -> Optional[float]:
    """Get the latest price for *symbol* from any available source."""
    try:
        import yfinance as yf  # type: ignore

        fi = yf.Ticker(symbol).fast_info
        price = getattr(fi, "last_price", None)
        return float(price) if price else None
    except Exception:
        pass
    return None


# ---------------------------------------------------------------------------
# Trigger evaluation
# ---------------------------------------------------------------------------

def _should_trigger(order: Dict, current_price: float) -> bool:
    ctype = order["condition_type"]
    trigger = float(order["trigger_price"])
    side = (order.get("side") or "").lower()

    if ctype == "limit_buy":
        return current_price <= trigger
    if ctype == "limit_sell":
        return current_price >= trigger
    if ctype == "stop_loss":
        return (current_price <= trigger) if side == "buy" else (current_price >= trigger)
    if ctype == "take_profit":
        return (current_price >= trigger) if side == "buy" else (current_price <= trigger)
    if ctype == "trailing_stop":
        # Simplified: treat trigger_price as the current trail stop level
        return current_price <= trigger if side == "buy" else current_price >= trigger
    return False


def _notify(order: Dict, status: str, error: str = "") -> None:
    """Log notification (webhook integration point)."""
    symbol = order.get("symbol", "")
    side = order.get("side", "")
    price = order.get("trigger_price", "")
    if status == "triggered":
        logger.info("Order triggered: %s %s @ %s (id=%s)", symbol, side, price, order["id"])
    elif status == "filled":
        logger.info("Order filled: %s %s (id=%s)", symbol, side, order["id"])
    elif status == "failed":
        logger.warning("Order failed: %s — %s (id=%s)", symbol, error, order["id"])


# ---------------------------------------------------------------------------
# Worker
# ---------------------------------------------------------------------------

class PendingOrderWorker:
    """Background thread that monitors and triggers pending orders."""

    def __init__(self, poll_sec: float = _POLL_SEC) -> None:
        self._poll_sec = poll_sec
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None

    def start(self) -> None:
        """Start the background polling thread."""
        if self._thread and self._thread.is_alive():
            logger.warning("PendingOrderWorker already running")
            return
        self._stop_event.clear()
        self._thread = threading.Thread(
            target=self._run, name="PendingOrderWorker", daemon=True
        )
        self._thread.start()
        logger.info("PendingOrderWorker started (poll=%ss)", self._poll_sec)

    def stop(self) -> None:
        """Signal the worker to stop and wait for it to finish."""
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=self._poll_sec + 5)
        logger.info("PendingOrderWorker stopped")

    def _run(self) -> None:
        while not self._stop_event.is_set():
            try:
                self._tick()
            except Exception as exc:
                logger.error("PendingOrderWorker tick error: %s", exc)
            self._stop_event.wait(self._poll_sec)

    def _tick(self) -> None:
        try:
            conn = _get_conn()
        except Exception as exc:
            logger.debug("PendingOrderWorker: DB unavailable — %s", exc)
            return

        try:
            orders = _fetch_pending_orders(conn)
            if not orders:
                return
            for order in orders:
                try:
                    price = _get_current_price(order["symbol"])
                    if price is None:
                        continue
                    if _should_trigger(order, price):
                        _update_order(conn, order["id"], "triggered")
                        _notify(order, "triggered")
                        # Placeholder: execute real trade here
                        _update_order(conn, order["id"], "filled")
                        _notify(order, "filled")
                except Exception as exc:
                    _update_order(conn, order["id"], "failed", str(exc))
                    _notify(order, "failed", str(exc))
        finally:
            conn.close()
