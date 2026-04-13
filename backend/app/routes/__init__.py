"""API Routes Module"""
from flask import Flask


def register_routes(app: Flask) -> None:
    """Register all API route blueprints with the Flask *app*."""
    from app.routes.sentiment_api import sentiment_bp
    from app.routes.opportunity_api import opportunity_bp
    from app.routes.search_api import search_bp

    app.register_blueprint(sentiment_bp, url_prefix="/api/sentiment")
    app.register_blueprint(opportunity_bp, url_prefix="/api/opportunities")
    app.register_blueprint(search_bp, url_prefix="/api/search")
