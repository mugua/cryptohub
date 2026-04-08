import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AnalysisFactor(Base):
    __tablename__ = "analysis_factors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    factor_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name_zh: Mapped[str] = mapped_column(String(200), nullable=False)
    name_en: Mapped[str] = mapped_column(String(200), nullable=False)
    description_zh: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    data_source: Mapped[str | None] = mapped_column(String(200), nullable=True)
    default_weight: Mapped[Decimal] = mapped_column(
        Numeric(5, 4), default=Decimal("0.1")
    )
    is_global: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    overrides: Mapped[list["CoinFactorOverride"]] = relationship(
        back_populates="factor"
    )


class CoinFactorOverride(Base):
    __tablename__ = "coin_factor_overrides"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    coin_symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    factor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analysis_factors.id", ondelete="CASCADE"),
        nullable=False,
    )
    weight: Mapped[Decimal | None] = mapped_column(Numeric(5, 4), nullable=True)
    boost_coefficient: Mapped[Decimal] = mapped_column(
        Numeric(5, 4), default=Decimal("1.0")
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    factor: Mapped["AnalysisFactor"] = relationship(back_populates="overrides")


class TrendReport(Base):
    __tablename__ = "trend_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    coin_symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    report_type: Mapped[str] = mapped_column(String(50), default="comprehensive")
    overall_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    trend_signal: Mapped[str | None] = mapped_column(String(20), nullable=True)
    factor_scores: Mapped[dict] = mapped_column(JSONB, nullable=False)
    summary_zh: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    valid_from: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    valid_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
