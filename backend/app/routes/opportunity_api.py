"""Module 15 (routes): Opportunity Scanner API Blueprint

Endpoints:
    GET /api/opportunities/scan
        — trigger a full market scan; returns all opportunities sorted by strength

    GET /api/opportunities/list
        — filter cached results
        Query params: market, signal, strength
"""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.data_providers.opportunity_scanner import OpportunityScanner

opportunity_bp = Blueprint("opportunity", __name__)
_scanner = OpportunityScanner()


@opportunity_bp.route("/scan", methods=["GET"])
def scan():
    """Run a full opportunity scan across all markets."""
    data = _scanner.scan()
    return jsonify({"success": True, "data": data})


@opportunity_bp.route("/list", methods=["GET"])
def list_opportunities():
    """Return filtered opportunity list."""
    market = request.args.get("market")
    signal = request.args.get("signal")
    strength = request.args.get("strength")
    opps = _scanner.list_opportunities(market=market, signal=signal, strength=strength)
    return jsonify({"success": True, "data": opps, "count": len(opps)})
