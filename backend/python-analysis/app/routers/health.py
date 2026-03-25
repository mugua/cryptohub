"""Health check router."""

from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/health")
async def health() -> JSONResponse:
    return JSONResponse({
        "status": "ok",
        "service": "cryptohub-python-analysis",
        "time": datetime.now(timezone.utc).isoformat(),
    })
