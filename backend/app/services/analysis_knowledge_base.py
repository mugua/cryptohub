"""Module 22: Analysis Knowledge Base

Stores AI analysis results, verifies predictions against actual prices,
and provides query / export capabilities.

Usage::

    from app.services.analysis_knowledge_base import AnalysisKnowledgeBase

    kb = AnalysisKnowledgeBase()
    kb.store(user_id=1, market="crypto", symbol="BTC",
             direction="bullish", confidence=0.8,
             entry_price=50000, stop_loss=47000, take_profit=56000,
             reasoning="Strong momentum...")
    records = kb.query(user_id=1, market="crypto")
    csv = kb.export_csv(user_id=1)
"""
from __future__ import annotations

import csv
import io
import logging
import os
import threading
import time
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# In-memory store (replaced by DB in production)
# ---------------------------------------------------------------------------
_store: List[Dict] = []
_id_counter = 0
_id_lock = threading.Lock()


def _next_id() -> int:
    global _id_counter
    with _id_lock:
        _id_counter += 1
        return _id_counter


class AnalysisKnowledgeBase:
    """Stores and queries AI analysis records with accuracy tracking."""

    # ------------------------------------------------------------------
    # Write
    # ------------------------------------------------------------------

    def store(
        self,
        user_id: int,
        market: str,
        symbol: str,
        direction: str,
        confidence: float,
        entry_price: float,
        stop_loss: float = 0.0,
        take_profit: float = 0.0,
        reasoning: str = "",
        lang: str = "zh-CN",
        analysis_json: str = "",
    ) -> int:
        """Persist an AI analysis record and return its ID."""
        record_id = _next_id()
        record = {
            "id": record_id,
            "user_id": user_id,
            "market": market,
            "symbol": symbol,
            "direction": direction,
            "confidence": confidence,
            "entry_price": entry_price,
            "stop_loss": stop_loss,
            "take_profit": take_profit,
            "reasoning": reasoning,
            "lang": lang,
            "analysis_json": analysis_json,
            "was_correct": None,
            "actual_return_pct": None,
            "created_at": time.time(),
            "validated_at": None,
        }
        _store.append(record)
        self._persist_to_db(record)
        return record_id

    def validate(
        self,
        record_id: int,
        actual_price: float,
    ) -> Optional[Dict]:
        """Mark a record as correct/incorrect given the *actual_price*.

        Compares actual_price to entry_price and predicted direction.
        """
        record = next((r for r in _store if r["id"] == record_id), None)
        if not record:
            return None

        entry = record["entry_price"]
        direction = record["direction"].lower()
        if entry > 0:
            actual_return = (actual_price - entry) / entry * 100
        else:
            actual_return = 0.0

        if direction in ("bullish", "buy", "long"):
            was_correct = actual_price > entry
        elif direction in ("bearish", "sell", "short"):
            was_correct = actual_price < entry
        else:
            was_correct = None

        record["was_correct"] = was_correct
        record["actual_return_pct"] = round(actual_return, 4)
        record["validated_at"] = time.time()
        return record

    # ------------------------------------------------------------------
    # Read
    # ------------------------------------------------------------------

    def query(
        self,
        user_id: Optional[int] = None,
        market: Optional[str] = None,
        symbol: Optional[str] = None,
        since_ts: Optional[float] = None,
        until_ts: Optional[float] = None,
        limit: int = 100,
    ) -> List[Dict]:
        """Filter stored records and return up to *limit* results."""
        results = list(_store)
        if user_id is not None:
            results = [r for r in results if r["user_id"] == user_id]
        if market:
            results = [r for r in results if r["market"].lower() == market.lower()]
        if symbol:
            results = [r for r in results if r["symbol"].upper() == symbol.upper()]
        if since_ts is not None:
            results = [r for r in results if r["created_at"] >= since_ts]
        if until_ts is not None:
            results = [r for r in results if r["created_at"] <= until_ts]
        results.sort(key=lambda x: x["created_at"], reverse=True)
        return results[:limit]

    def accuracy_stats(
        self,
        user_id: Optional[int] = None,
        market: Optional[str] = None,
    ) -> Dict:
        """Compute prediction accuracy for the given filters."""
        records = self.query(user_id=user_id, market=market, limit=10000)
        validated = [r for r in records if r.get("was_correct") is not None]
        if not validated:
            return {"total": 0, "correct": 0, "accuracy": 0.0, "avg_return_pct": 0.0}
        correct = sum(1 for r in validated if r["was_correct"])
        returns = [r["actual_return_pct"] for r in validated if r["actual_return_pct"] is not None]
        avg_return = sum(returns) / len(returns) if returns else 0.0
        return {
            "total": len(validated),
            "correct": correct,
            "accuracy": round(correct / len(validated), 4),
            "avg_return_pct": round(avg_return, 4),
        }

    # ------------------------------------------------------------------
    # Export
    # ------------------------------------------------------------------

    def export_csv(
        self,
        user_id: Optional[int] = None,
        market: Optional[str] = None,
    ) -> str:
        """Return a CSV string of matching records."""
        records = self.query(user_id=user_id, market=market, limit=10000)
        if not records:
            return ""
        fieldnames = [
            "id", "user_id", "market", "symbol", "direction", "confidence",
            "entry_price", "stop_loss", "take_profit", "was_correct",
            "actual_return_pct", "lang", "created_at",
        ]
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)
        return buf.getvalue()

    # ------------------------------------------------------------------
    # DB persistence stub
    # ------------------------------------------------------------------

    @staticmethod
    def _persist_to_db(record: Dict) -> None:
        try:
            import psycopg2  # type: ignore

            dsn = os.getenv("DATABASE_URL") or ""
            if not dsn:
                return
            conn = psycopg2.connect(dsn)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO qd_analysis_memory
                      (user_id, market, symbol, direction, confidence,
                       entry_price, stop_loss, take_profit, reasoning,
                       lang, analysis_json)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    """,
                    (
                        record["user_id"], record["market"], record["symbol"],
                        record["direction"], record["confidence"],
                        record["entry_price"], record["stop_loss"],
                        record["take_profit"], record["reasoning"],
                        record["lang"], record["analysis_json"],
                    ),
                )
            conn.commit()
            conn.close()
        except Exception as exc:
            logger.debug("_persist_to_db failed: %s", exc)
