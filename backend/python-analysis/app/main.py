"""
CryptoHub – Python Analysis Service
====================================
FastAPI application that provides market analysis, strategy backtesting,
and quantitative research endpoints.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analysis, strategy, backtest, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager – startup & shutdown hooks."""
    print("[cryptohub] Python analysis service starting up...")
    yield
    print("[cryptohub] Python analysis service shutting down...")


app = FastAPI(
    title="CryptoHub Analysis Service",
    description="Market analysis, strategy backtesting and quantitative research API",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router, tags=["Health"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Market Analysis"])
app.include_router(strategy.router, prefix="/api/v1/strategies", tags=["Strategies"])
app.include_router(backtest.router, prefix="/api/v1/backtest", tags=["Backtest"])
