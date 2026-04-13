"""Module 23: Global Search Service

Searches across strategies, indicators, trading pairs/stocks, analysis
records, and community indicators using parallel queries.

Usage::

    from app.services.global_search import GlobalSearchService

    svc = GlobalSearchService()
    results = svc.search("bitcoin", types=["symbols", "strategies"])
"""
from __future__ import annotations

import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

_DB_URL = os.getenv("DATABASE_URL") or ""


# ---------------------------------------------------------------------------
# Relevance scoring helpers
# ---------------------------------------------------------------------------

def _relevance_score(query: str, text: str) -> int:
    """Score how well *text* matches *query* (higher is better)."""
    q = query.lower()
    t = text.lower()
    if t == q:
        return 3          # exact match
    if t.startswith(q):
        return 2          # prefix match
    if q in t:
        return 1          # substring match
    return 0


def _sort_by_relevance(query: str, items: List[Dict], field: str = "name") -> List[Dict]:
    for item in items:
        item["_score"] = _relevance_score(query, item.get(field, ""))
    items.sort(key=lambda x: x.get("_score", 0), reverse=True)
    return [i for i in items if i.get("_score", 0) > 0]


# ---------------------------------------------------------------------------
# Per-type search implementations
# ---------------------------------------------------------------------------

def _search_symbols(query: str) -> List[Dict]:
    """Search built-in symbol/stock names."""
    from app.services.symbol_name_resolver import (
        _CN_STOCK, _HK_STOCK, _US_STOCK, _CRYPTO,
    )

    results: List[Dict] = []
    catalogues = [
        ("cn_stock", _CN_STOCK),
        ("hk_stock", _HK_STOCK),
        ("us_stock", _US_STOCK),
        ("crypto", _CRYPTO),
    ]
    q = query.lower()
    for market, mapping in catalogues:
        for symbol, name in mapping.items():
            if q in symbol.lower() or q in name.lower():
                results.append(
                    {"type": "symbol", "market": market, "symbol": symbol,
                     "name": name, "_score": _relevance_score(query, f"{symbol} {name}")}
                )
    results.sort(key=lambda x: x.get("_score", 0), reverse=True)
    return results


def _search_db_table(
    query: str,
    table: str,
    search_cols: List[str],
    return_cols: List[str],
    result_type: str,
) -> List[Dict]:
    """Generic ILIKE search over a DB table."""
    if not _DB_URL:
        return []
    try:
        import psycopg2  # type: ignore

        conn = psycopg2.connect(_DB_URL)
        like_clauses = " OR ".join(f"{col} ILIKE %s" for col in search_cols)
        sql = (
            f"SELECT {', '.join(return_cols)} FROM {table} "
            f"WHERE {like_clauses} LIMIT 50"
        )
        params = tuple(f"%{query}%" for _ in search_cols)
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
        conn.close()
        results = []
        for row in rows:
            item = dict(zip(return_cols, row))
            item["type"] = result_type
            results.append(item)
        return results
    except Exception as exc:
        logger.debug("_search_db_table(%s, %s): %s", table, result_type, exc)
        return []


def _search_strategies(query: str) -> List[Dict]:
    return _search_db_table(
        query,
        table="qd_strategies",
        search_cols=["name", "description"],
        return_cols=["id", "name", "description"],
        result_type="strategy",
    )


def _search_indicators(query: str) -> List[Dict]:
    return _search_db_table(
        query,
        table="qd_indicators",
        search_cols=["name", "description"],
        return_cols=["id", "name", "description"],
        result_type="indicator",
    )


def _search_analysis_records(query: str) -> List[Dict]:
    return _search_db_table(
        query,
        table="qd_analysis_memory",
        search_cols=["symbol", "market", "reasoning"],
        return_cols=["id", "symbol", "market", "direction", "created_at"],
        result_type="analysis",
    )


def _search_community_indicators(query: str) -> List[Dict]:
    return _search_db_table(
        query,
        table="qd_community_indicators",
        search_cols=["name", "description", "tags"],
        return_cols=["id", "name", "description"],
        result_type="community_indicator",
    )


_SEARCH_FNS = {
    "symbols":              _search_symbols,
    "strategies":           _search_strategies,
    "indicators":           _search_indicators,
    "analysis":             _search_analysis_records,
    "community_indicators": _search_community_indicators,
}

_ALL_TYPES = list(_SEARCH_FNS.keys())


# ---------------------------------------------------------------------------
# Service class
# ---------------------------------------------------------------------------

class GlobalSearchService:
    """Parallel cross-type search service."""

    def search(
        self,
        query: str,
        types: Optional[List[str]] = None,
        limit: int = 20,
    ) -> Dict:
        """Search across selected *types* for *query*.

        Args:
            query:  Search string.
            types:  List of type keys to search (default: all).
            limit:  Maximum results per type.

        Returns:
            Dict with per-type result lists and a flat ``results`` list sorted
            by relevance.
        """
        if not query or not query.strip():
            return {"results": [], "count": 0, "query": query}

        selected_types = types or _ALL_TYPES
        selected_types = [t for t in selected_types if t in _SEARCH_FNS]

        all_results: List[Dict] = []
        type_results: Dict[str, List[Dict]] = {}

        with ThreadPoolExecutor(max_workers=min(len(selected_types), 5)) as pool:
            futures = {
                pool.submit(_SEARCH_FNS[t], query): t
                for t in selected_types
            }
            for future in as_completed(futures):
                type_name = futures[future]
                try:
                    items = future.result()[:limit]
                    type_results[type_name] = items
                    all_results.extend(items)
                except Exception as exc:
                    logger.warning("search type '%s' failed: %s", type_name, exc)
                    type_results[type_name] = []

        # Global sort by _score
        all_results.sort(key=lambda x: x.get("_score", 0), reverse=True)
        return {
            "query": query,
            "results": all_results[:limit * len(selected_types)],
            "count": len(all_results),
            "by_type": type_results,
        }
