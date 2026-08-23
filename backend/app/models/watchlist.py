"""Watchlist model — Suspect and Mule Account Monitoring."""

from datetime import datetime, timezone
from enum import Enum
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, String, Float, Text, Index, Boolean
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WatchlistRiskTier(str, Enum):
    """Watchlist risk classification."""
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class WatchlistAccount(Base):
    """Monitored suspect / mule account on the high-risk watchlist."""

    __tablename__ = "watchlist_accounts"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid4
    )

    account_number: Mapped[str] = mapped_column(
        String(30), unique=True, nullable=False, index=True
    )
    account_holder_name: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    bank_name: Mapped[str] = mapped_column(
        String(100), default="MoneyTrace Bank", nullable=False
    )
    risk_tier: Mapped[str] = mapped_column(
        String(20), default=WatchlistRiskTier.HIGH.value, nullable=False, index=True
    )
    risk_score: Mapped[float] = mapped_column(
        Float, default=85.0, nullable=False
    )
    reason: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # e.g. "Known mule holding account in multi-hop syndicate", "High velocity transfer burst"
    typology: Mapped[str] = mapped_column(
        String(100), default="Mule Account", nullable=False
    )  # MULE, COLLECTOR, STRUCTURING, SANCTION, STOLEN_IDENTITY
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, index=True
    )
    flagged_by: Mapped[str] = mapped_column(
        String(100), default="SOC Detection Engine", nullable=False
    )
    total_flagged_transactions: Mapped[int] = mapped_column(
        Float, default=1.0, nullable=False
    )
    total_flagged_volume: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )

    # Timestamps
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __repr__(self) -> str:
        return f"<WatchlistAccount(account_number={self.account_number!r}, risk_tier={self.risk_tier!r})>"
