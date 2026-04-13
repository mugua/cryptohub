"""Module 3 (routes): Sentiment API Blueprint

Endpoints:
    GET /api/sentiment/all            — all 7 indicators + overall score
    GET /api/sentiment/<indicator>    — single indicator
"""
from __future__ import annotations

from flask import Blueprint, jsonify

from app.data_providers.sentiment_aggregator import SentimentAggregator

sentiment_bp = Blueprint("sentiment", __name__)
_agg = SentimentAggregator()


@sentiment_bp.route("/all", methods=["GET"])
def get_all_sentiment():
    """Return all sentiment indicators plus the aggregated score."""
    data = _agg.get_all()
    return jsonify({"success": True, "data": data})


@sentiment_bp.route("/<string:indicator>", methods=["GET"])
def get_single_sentiment(indicator: str):
    """Return a single sentiment indicator by name."""
    data = _agg.get_indicator(indicator)
    if "error" in data and "Unknown" in data["error"]:
        return jsonify({"success": False, "error": data["error"]}), 404
    return jsonify({"success": True, "data": data})
