"""User model — extended for Multi-Role RBAC and Security Monitoring."""

from datetime import datetime, timezone
from uuid import UUID, uuid4
from enum import Enum
from typing import List, Optional

from sqlalchemy import Column, DateTime, Boolean, String, Float, Integer
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, Enum):
    """Roles supported by MoneyTrace RBAC."""
    CUSTOMER = "customer"
    INVESTIGATOR = "investigator"
    ANALYST = "analyst"
    SUPERVISOR = "supervisor"
    EXECUTIVE = "executive"
    ADMIN = "admin"


class User(Base):
    """Authenticated user in MoneyTrace."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid4
    )

    # Personal info
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)

    # Auth
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Authorization & RBAC
    role: Mapped[str] = mapped_column(
        String(50),
        default=UserRole.CUSTOMER.value,
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Customer Banking Security & Trust Metrics
    transaction_pin_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    trust_score: Mapped[float] = mapped_column(Float, default=96.0, nullable=False)
    last_login_device: Mapped[str | None] = mapped_column(String(150), default="Chrome on Windows 11", nullable=True)
    last_login_city: Mapped[str | None] = mapped_column(String(100), default="Mumbai, India", nullable=True)
    last_login_ip: Mapped[str | None] = mapped_column(String(45), default="103.21.244.2", nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    accounts: Mapped[List["Account"]] = relationship(
        "Account", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(email={self.email!r}, role={self.role})>"
