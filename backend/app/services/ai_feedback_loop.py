"""Module 19: AI Feedback Loop

Records AI analysis results, collects user feedback, calibrates accuracy,
and adjusts prompts when accuracy degrades.

Usage::

    from app.services.ai_feedback_loop import AIFeedbackLoop

    loop = AIFeedbackLoop()
    loop.record_analysis(user_id=1, analysis_id=42, symbol="BTC",
                         direction="bullish", confidence=0.8,
                         entry_price=50000, reasoning="...")
    loop.submit_feedback(user_id=1, analysis_id=42, feedback="agree")
    stats = loop.calibration_stats(user_id=1)
"""
from __future__ import annotations

import logging
import os
import time
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

_ENABLED = os.getenv("FEATURE_AI_FEEDBACK_ENABLED", "false").lower() == "true"

# In-memory stores (replaced by DB in production)
_analyses: Dict[int, Dict] = {}   # analysis_id -> record
_feedbacks: List[Dict] = []        # list of feedback entries


class AIFeedbackLoop:
    """Records AI predictions, collects user feedback, and measures accuracy."""

    # ------------------------------------------------------------------
    # Recording
    # ------------------------------------------------------------------

    def record_analysis(
        self,
        user_id: int,
        analysis_id: int,
        symbol: str,
        direction: str,
        confidence: float,
        entry_price: float,
        stop_loss: float = 0.0,
        take_profit: float = 0.0,
        reasoning: str = "",
        market: str = "",
        lang: str = "zh-CN",
    ) -> None:
        """Persist an AI analysis prediction in memory (or DB when available)."""
        _analyses[analysis_id] = {
            "id": analysis_id,
            "user_id": user_id,
            "symbol": symbol,
            "market": market,
            "direction": direction,
            "confidence": confidence,
            "entry_price": entry_price,
            "stop_loss": stop_loss,
            "take_profit": take_profit,
            "reasoning": reasoning,
            "lang": lang,
            "was_correct": None,
            "created_at": time.time(),
        }
        self._persist_to_db(analysis_id)
        logger.debug("Recorded analysis id=%d symbol=%s", analysis_id, symbol)

    def submit_feedback(
        self,
        user_id: int,
        analysis_id: int,
        feedback: str,
        comment: str = "",
    ) -> Dict:
        """Accept user feedback ('agree' or 'disagree') for an analysis.

        Returns the updated analysis record.
        """
        if feedback not in ("agree", "disagree"):
            return {"error": "feedback must be 'agree' or 'disagree'"}

        record = _analyses.get(analysis_id)
        if not record:
            return {"error": f"analysis_id {analysis_id} not found"}

        was_correct = feedback == "agree"
        record["was_correct"] = was_correct
        _feedbacks.append(
            {
                "user_id": user_id,
                "analysis_id": analysis_id,
                "feedback": feedback,
                "comment": comment,
                "created_at": time.time(),
            }
        )
        self._persist_feedback_to_db(user_id, analysis_id, feedback, comment)
        logger.info("Feedback recorded: analysis_id=%d was_correct=%s", analysis_id, was_correct)

        # Auto-reflection when accuracy drops
        self._reflect_if_needed(user_id)
        return {"success": True, "was_correct": was_correct}

    # ------------------------------------------------------------------
    # Statistics
    # ------------------------------------------------------------------

    def calibration_stats(self, user_id: Optional[int] = None) -> Dict:
        """Return accuracy statistics for the given *user_id* (or all users)."""
        relevant = [
            r for r in _analyses.values()
            if r.get("was_correct") is not None
            and (user_id is None or r["user_id"] == user_id)
        ]
        if not relevant:
            return {"total": 0, "correct": 0, "accuracy": 0.0}
        correct = sum(1 for r in relevant if r["was_correct"])
        return {
            "total": len(relevant),
            "correct": correct,
            "accuracy": round(correct / len(relevant), 4),
        }

    # ------------------------------------------------------------------
    # Prompt adjustment
    # ------------------------------------------------------------------

    def get_adjusted_prompt_hint(self, user_id: Optional[int] = None) -> str:
        """Return a prompt modifier based on historical accuracy.

        When accuracy < 50 %, returns a cautionary instruction.
        """
        stats = self.calibration_stats(user_id)
        if stats["total"] < 10:
            return ""
        if stats["accuracy"] < 0.5:
            return (
                "Note: recent predictions have been below expectations. "
                "Please be more conservative and highlight uncertainty."
            )
        if stats["accuracy"] > 0.75:
            return (
                "Historical predictions have been strong. "
                "Maintain current analytical approach."
            )
        return ""

    def _reflect_if_needed(self, user_id: int) -> None:
        stats = self.calibration_stats(user_id)
        if stats["total"] >= 10 and stats["accuracy"] < 0.4:
            logger.warning(
                "AI accuracy for user %d is %.1f%% — prompt adjustment recommended",
                user_id,
                stats["accuracy"] * 100,
            )

    # ------------------------------------------------------------------
    # DB persistence stubs (replace with real psycopg2 calls)
    # ------------------------------------------------------------------

    @staticmethod
    def _persist_to_db(analysis_id: int) -> None:
        record = _analyses.get(analysis_id)
        if not record:
            return
        try:
            import psycopg2  # type: ignore
            import json

            dsn = os.getenv("DATABASE_URL") or ""
            if not dsn:
                return
            conn = psycopg2.connect(dsn)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO qd_analysis_memory
                      (user_id, market, symbol, direction, confidence,
                       entry_price, stop_loss, take_profit, reasoning, lang)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT DO NOTHING
                    """,
                    (
                        record["user_id"], record["market"], record["symbol"],
                        record["direction"], record["confidence"],
                        record["entry_price"], record["stop_loss"],
                        record["take_profit"], record["reasoning"], record["lang"],
                    ),
                )
            conn.commit()
            conn.close()
        except Exception as exc:
            logger.debug("_persist_to_db failed: %s", exc)

    @staticmethod
    def _persist_feedback_to_db(
        user_id: int, analysis_id: int, feedback: str, comment: str
    ) -> None:
        try:
            import psycopg2  # type: ignore

            dsn = os.getenv("DATABASE_URL") or ""
            if not dsn:
                return
            conn = psycopg2.connect(dsn)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO qd_ai_feedback (user_id, analysis_id, feedback, comment)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (user_id, analysis_id, feedback, comment),
                )
            conn.commit()
            conn.close()
        except Exception as exc:
            logger.debug("_persist_feedback_to_db failed: %s", exc)
