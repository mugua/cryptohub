"""Module 23 (routes): Global Search API Blueprint

Endpoint:
    GET /api/search?q=xxx&types=strategies,indicators,symbols
"""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.services.global_search import GlobalSearchService

search_bp = Blueprint("search", __name__)
_svc = GlobalSearchService()


@search_bp.route("", methods=["GET"])
def search():
    """Full-text search across strategies, indicators, symbols, and analysis."""
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"success": False, "error": "Missing query parameter 'q'"}), 400

    types_param = request.args.get("types", "")
    types = [t.strip() for t in types_param.split(",") if t.strip()] or None

    limit = int(request.args.get("limit", 20))
    data = _svc.search(q, types=types, limit=limit)
    return jsonify({"success": True, "data": data})
