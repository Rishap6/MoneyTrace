"""Investigation model — Enterprise Case Management & Forensic Playbook."""

from datetime import datetime, timezone
from enum import Enum
from uuid import UUID, uuid4
from typing import List, Optional

from sqlalchemy import Column, DateTime, String, ForeignKey, Float, Text, Index, JSON, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CasePriority(str, Enum):
    """Investigation priority enum."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class InvestigationStatus(str, Enum):
    """Investigation status enum."""
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    PENDING_REVIEW = "PENDING_REVIEW"
    RECOVERED = "RECOVERED"
    CLOSED = "CLOSED"


class PlaybookStepStatus(str, Enum):
    """Status for individual playbook steps."""
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"


class InvestigationCase(Base):
    """Investigation Case tracking financial crime dossiers."""

    __tablename__ = "investigation_cases"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid4
    )

    # Human-readable case ID like CASE-2026-0801 or REC202608160001
    case_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    description: Mapped[str] = mapped_column(
        Text, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30), default=InvestigationStatus.OPEN.value, nullable=False, index=True
    )
    priority: Mapped[str] = mapped_column(
        String(20), default=CasePriority.HIGH.value, nullable=False, index=True
    )

    # Financial impact & target
    total_amount: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )
    victim_account: Mapped[str] = mapped_column(
        String(30), nullable=True
    )
    current_holder_account: Mapped[str] = mapped_column(
        String(30), nullable=True
    )
    mule_chain_count: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    recovery_probability: Mapped[float] = mapped_column(
        Float, default=75.0, nullable=False
    )

    # Foreign Keys
    assigned_to_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True
    )
    alert_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("fraud_alerts.id", ondelete="SET NULL"),
        nullable=True, index=True
    )
    transaction_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="SET NULL"),
        nullable=True, index=True
    )

    # AI Summary Cache & metadata
    ai_summary: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    risk_factors: Mapped[dict | None] = mapped_column(
        JSON, nullable=True
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
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
    closed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    assigned_to: Mapped["User | None"] = relationship(
        "User", foreign_keys=[assigned_to_id]
    )
    alert: Mapped["FraudAlert | None"] = relationship(
        "FraudAlert", foreign_keys=[alert_id]
    )
    transaction: Mapped["Transaction | None"] = relationship(
        "Transaction", foreign_keys=[transaction_id]
    )
    playbook_steps: Mapped[List["CasePlaybookStep"]] = relationship(
        "CasePlaybookStep", back_populates="case", cascade="all, delete-orphan", order_by="CasePlaybookStep.step_order"
    )
    notes: Mapped[List["InvestigatorNote"]] = relationship(
        "InvestigatorNote", back_populates="case", cascade="all, delete-orphan", order_by="InvestigatorNote.created_at.desc()"
    )
    evidence: Mapped[List["CaseEvidence"]] = relationship(
        "CaseEvidence", back_populates="case", cascade="all, delete-orphan", order_by="CaseEvidence.created_at.desc()"
    )
    timeline_events: Mapped[List["CaseTimelineEvent"]] = relationship(
        "CaseTimelineEvent", back_populates="case", cascade="all, delete-orphan", order_by="CaseTimelineEvent.timestamp.asc()"
    )

    def __repr__(self) -> str:
        return f"<InvestigationCase(case_number={self.case_number!r}, status={self.status})>"


class CasePlaybookStep(Base):
    """Step in the standard 5-stage Financial Fraud Recovery Playbook."""

    __tablename__ = "case_playbook_steps"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    case_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("investigation_cases.id", ondelete="CASCADE"),
        nullable=False, index=True
    )

    step_order: Mapped[int] = mapped_column(Integer, nullable=False)
    step_key: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. VALIDATE_ALERT, TRACE_MONEY, IDENTIFY_HOLDER, FREEZE_ACCOUNT, GENERATE_REPORT
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default=PlaybookStepStatus.PENDING.value, nullable=False
    )
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. VERIFY, GRAPH_TRACE, HOLDER_LOOKUP, FREEZE_DIRECTIVE, EXPORT_PDF
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    result_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    case: Mapped["InvestigationCase"] = relationship("InvestigationCase", back_populates="playbook_steps")


class InvestigatorNote(Base):
    """Investigator note attached to a case."""

    __tablename__ = "investigator_notes"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    case_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("investigation_cases.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    author_name: Mapped[str] = mapped_column(String(100), nullable=False)
    author_role: Mapped[str] = mapped_column(String(50), default="Investigator", nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    note_type: Mapped[str] = mapped_column(String(30), default="GENERAL", nullable=False)  # GENERAL, FINDING, LEGAL_HOLD, ESCALATION
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False, index=True
    )

    case: Mapped["InvestigationCase"] = relationship("InvestigationCase", back_populates="notes")


class CaseEvidence(Base):
    """Evidence asset in the case evidence locker."""

    __tablename__ = "case_evidence"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    case_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("investigation_cases.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    evidence_type: Mapped[str] = mapped_column(String(50), nullable=False)  # RECEIPT, SCREENSHOT, PDF_REPORT, NOTE, IP_LOG, BANK_DIRECTIVE
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    content_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    uploaded_by: Mapped[str] = mapped_column(String(100), nullable=False)
    hash_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)  # Chain of custody proof
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False, index=True
    )

    case: Mapped["InvestigationCase"] = relationship("InvestigationCase", back_populates="evidence")


class CaseTimelineEvent(Base):
    """Chronological milestone in the investigator case timeline."""

    __tablename__ = "case_timeline_events"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    case_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("investigation_cases.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)  # FRAUD_DETECTED, ALERT_GENERATED, INVESTIGATOR_ASSIGNED, MONEY_TRACED, FREEZE_DIRECTIVE, LEGAL_NOTICE, REPORT_EXPORTED, CASE_RESOLVED
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    actor_name: Mapped[str] = mapped_column(String(100), default="MoneyTrace SOC Engine", nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="info", nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False, index=True
    )

    case: Mapped["InvestigationCase"] = relationship("InvestigationCase", back_populates="timeline_events")
