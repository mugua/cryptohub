import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, Field


class FactorResponse(BaseModel):
    id: uuid.UUID
    category: str
    factor_key: str
    name_zh: str
    name_en: str
    description_zh: Optional[str] = None
    description_en: Optional[str] = None
    data_source: Optional[str] = None
    default_weight: Decimal
    is_global: bool
    is_active: bool

    model_config = {"from_attributes": True}


class FactorUpdate(BaseModel):
    default_weight: Optional[Decimal] = Field(None, ge=0, le=1)
    is_active: Optional[bool] = None
    description_zh: Optional[str] = None
    description_en: Optional[str] = None


class CoinFactorOverrideResponse(BaseModel):
    id: uuid.UUID
    coin_symbol: str
    factor_id: uuid.UUID
    weight: Optional[Decimal] = None
    boost_coefficient: Decimal = Decimal("1.0")
    is_active: bool = True

    model_config = {"from_attributes": True}


class CoinFactorOverrideUpdate(BaseModel):
    weight: Optional[Decimal] = Field(None, ge=0, le=1)
    boost_coefficient: Optional[Decimal] = Field(None, ge=0, le=5)
    is_active: Optional[bool] = None


class TrendReportResponse(BaseModel):
    id: uuid.UUID
    coin_symbol: str
    report_type: str
    overall_score: Optional[Decimal] = None
    trend_signal: Optional[str] = None
    summary_zh: Optional[str] = None
    summary_en: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TrendReportDetail(TrendReportResponse):
    factor_scores: dict[str, Any] = {}
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
