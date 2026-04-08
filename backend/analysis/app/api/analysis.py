import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.analysis import AnalysisFactor, TrendReport
from app.models.user import User
from app.schemas.analysis import (
    FactorResponse,
    TrendReportDetail,
    TrendReportResponse,
)
from app.schemas.common import APIResponse, PaginatedResponse
from app.services.trend_engine import TrendEngine

router = APIRouter(prefix="/api/v1/analysis", tags=["analysis"])
trend_engine = TrendEngine()


@router.get("/trend/{symbol}", response_model=APIResponse[TrendReportDetail | None])
async def get_trend(
    symbol: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrendReport)
        .where(TrendReport.coin_symbol == symbol.upper())
        .order_by(TrendReport.created_at.desc())
        .limit(1)
    )
    report = result.scalar_one_or_none()
    if report is None:
        return APIResponse(data=None, message="No report found for this symbol")
    return APIResponse(data=TrendReportDetail.model_validate(report))


@router.post("/trend/{symbol}/generate", response_model=APIResponse[TrendReportDetail])
async def generate_trend(
    symbol: str,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await trend_engine.generate_report(db, symbol.upper())
    return APIResponse(data=TrendReportDetail.model_validate(report))


@router.get("/factors", response_model=APIResponse[list[FactorResponse]])
async def list_factors(
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(AnalysisFactor)
    if category:
        query = query.where(AnalysisFactor.category == category)
    query = query.order_by(AnalysisFactor.category, AnalysisFactor.factor_key)
    result = await db.execute(query)
    factors = result.scalars().all()
    return APIResponse(
        data=[FactorResponse.model_validate(f) for f in factors]
    )


@router.put("/factors/{factor_id}", response_model=APIResponse[FactorResponse])
async def update_factor(
    factor_id: uuid.UUID,
    weight: float | None = Query(None, ge=0, le=1),
    is_active: bool | None = Query(None),
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AnalysisFactor).where(AnalysisFactor.id == factor_id)
    )
    factor = result.scalar_one_or_none()
    if factor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Factor not found"
        )
    if weight is not None:
        factor.default_weight = weight
    if is_active is not None:
        factor.is_active = is_active
    await db.flush()
    await db.refresh(factor)
    return APIResponse(data=FactorResponse.model_validate(factor))


@router.get("/reports", response_model=PaginatedResponse[TrendReportResponse])
async def list_reports(
    symbol: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(TrendReport).order_by(TrendReport.created_at.desc())
    if symbol:
        query = query.where(TrendReport.coin_symbol == symbol.upper())

    from sqlalchemy import func as sa_func

    count_query = select(sa_func.count()).select_from(TrendReport)
    if symbol:
        count_query = count_query.where(TrendReport.coin_symbol == symbol.upper())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    reports = result.scalars().all()

    return PaginatedResponse(
        data=[TrendReportResponse.model_validate(r) for r in reports],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/reports/{report_id}", response_model=APIResponse[TrendReportDetail])
async def get_report(
    report_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrendReport).where(TrendReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Report not found"
        )
    return APIResponse(data=TrendReportDetail.model_validate(report))
