import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.analysis import AnalysisFactor, CoinFactorOverride
from app.models.user import User
from app.schemas.analysis import (
    CoinFactorOverrideResponse,
    CoinFactorOverrideUpdate,
    FactorResponse,
    FactorUpdate,
)
from app.schemas.common import APIResponse
from app.schemas.user import ProfileUpdate, UserResponse

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])


@router.get("/factors/{factor_id}", response_model=APIResponse[FactorResponse])
async def get_factor(
    factor_id: uuid.UUID,
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
    return APIResponse(data=FactorResponse.model_validate(factor))


@router.put("/factors/{factor_id}", response_model=APIResponse[FactorResponse])
async def update_factor(
    factor_id: uuid.UUID,
    body: FactorUpdate,
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
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(factor, field, value)
    await db.flush()
    await db.refresh(factor)
    return APIResponse(data=FactorResponse.model_validate(factor))


@router.get(
    "/coins/{symbol}/factors/{factor_id}",
    response_model=APIResponse[CoinFactorOverrideResponse | None],
)
async def get_coin_factor_override(
    symbol: str,
    factor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CoinFactorOverride).where(
            CoinFactorOverride.coin_symbol == symbol.upper(),
            CoinFactorOverride.factor_id == factor_id,
        )
    )
    override = result.scalar_one_or_none()
    if override is None:
        return APIResponse(data=None, message="No override found")
    return APIResponse(data=CoinFactorOverrideResponse.model_validate(override))


@router.put(
    "/coins/{symbol}/factors/{factor_id}",
    response_model=APIResponse[CoinFactorOverrideResponse],
)
async def update_coin_factor_override(
    symbol: str,
    factor_id: uuid.UUID,
    body: CoinFactorOverrideUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify the factor exists
    factor_result = await db.execute(
        select(AnalysisFactor).where(AnalysisFactor.id == factor_id)
    )
    if factor_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Factor not found"
        )

    result = await db.execute(
        select(CoinFactorOverride).where(
            CoinFactorOverride.coin_symbol == symbol.upper(),
            CoinFactorOverride.factor_id == factor_id,
        )
    )
    override = result.scalar_one_or_none()

    if override is None:
        override = CoinFactorOverride(
            coin_symbol=symbol.upper(),
            factor_id=factor_id,
            weight=body.weight,
            boost_coefficient=body.boost_coefficient or Decimal("1.0"),
            is_active=body.is_active if body.is_active is not None else True,
            updated_by=user.id,
        )
        db.add(override)
    else:
        update_data = body.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(override, field, value)
        override.updated_by = user.id

    await db.flush()
    await db.refresh(override)
    return APIResponse(data=CoinFactorOverrideResponse.model_validate(override))


@router.get("/profile", response_model=APIResponse[UserResponse])
async def get_profile(user: User = Depends(get_current_user)):
    return APIResponse(data=UserResponse.model_validate(user))


@router.put("/profile", response_model=APIResponse[UserResponse])
async def update_profile(
    body: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    await db.flush()
    await db.refresh(user)
    return APIResponse(data=UserResponse.model_validate(user))
