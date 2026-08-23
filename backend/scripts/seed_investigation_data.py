"""Seed script for Investigation Cases, Playbook Steps, Notes, Evidence, Watchlists & Audit Logs."""

import asyncio
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from decimal import Decimal
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import engine, async_session, Base
from app.models.user import User, UserRole
from app.models.account import Account, AccountStatus
from app.models.transaction import Transaction, TransactionStatus
from app.models.fraud_alert import FraudAlert, Severity, AlertStatus
from app.models.recovery import RecoveryCase, RecoveryProbability, CaseStatus
from app.models.investigation import (
    InvestigationCase,
    CasePlaybookStep,
    InvestigatorNote,
    CaseEvidence,
    CaseTimelineEvent,
    CasePriority,
    InvestigationStatus,
    PlaybookStepStatus,
)
from app.models.watchlist import WatchlistAccount, WatchlistRiskTier
from app.models.audit_log import AuditLog, AuditAction


async def seed_data():
    print("Ensuring database tables exist...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        now = datetime.now(timezone.utc)

        # 1. Create or Find Investigators & Supervisor
        from sqlalchemy import select
        res = await session.execute(select(User).where(User.email == "alok.khatri@moneytrace.dev"))
        investigator = res.scalar_one_or_none()
        if not investigator:
            investigator = User(
                id=uuid4(),
                full_name="Alok Khatri",
                email="alok.khatri@moneytrace.dev",
                password_hash="$2b$12$e8YnJ2rQp1Uq9p...mock",
                role=UserRole.INVESTIGATOR.value,
                is_active=True,
                trust_score=98.0,
                last_login_device="Firefox on MacOS",
                last_login_city="Delhi, India",
            )
            session.add(investigator)
            await session.flush()

        res2 = await session.execute(select(User).where(User.email == "supervisor@moneytrace.dev"))
        supervisor = res2.scalar_one_or_none()
        if not supervisor:
            supervisor = User(
                id=uuid4(),
                full_name="Priya Sengupta (Lead SOC)",
                email="supervisor@moneytrace.dev",
                password_hash="$2b$12$e8YnJ2rQp1Uq9p...mock",
                role=UserRole.SUPERVISOR.value,
                is_active=True,
                trust_score=99.0,
                last_login_device="Chrome on Windows 11",
                last_login_city="Mumbai, India",
            )
            session.add(supervisor)
            await session.flush()

        # 2. Seed Watchlist Accounts
        watchlists = [
            WatchlistAccount(
                id=uuid4(),
                account_number="ACC1005",
                account_holder_name="Vikas Dubey (Mule Tier 1)",
                bank_name="HDFC Bank",
                risk_tier=WatchlistRiskTier.CRITICAL.value,
                risk_score=94.0,
                reason="Primary layering node in multi-hop phishing syndicate; 90% passthrough within 3 mins.",
                typology="Mule Account",
                is_active=True,
                flagged_by="SOC Anomaly Engine",
                total_flagged_transactions=8,
                total_flagged_volume=480000.0,
                added_at=now - timedelta(days=2),
                updated_at=now - timedelta(days=2),
            ),
            WatchlistAccount(
                id=uuid4(),
                account_number="ACC2002",
                account_holder_name="Neha Agarwal (Layering Node)",
                bank_name="ICICI Bank",
                risk_tier=WatchlistRiskTier.HIGH.value,
                risk_score=88.0,
                reason="Rapid dispersal hub forwarding incoming credits across split destinations.",
                typology="Layering Node",
                is_active=True,
                flagged_by="Alok Khatri",
                total_flagged_transactions=5,
                total_flagged_volume=290000.0,
                added_at=now - timedelta(days=1),
                updated_at=now - timedelta(days=1),
            ),
            WatchlistAccount(
                id=uuid4(),
                account_number="ACC5008",
                account_holder_name="Rajesh Sharma (Syndicate Collector)",
                bank_name="State Bank of India",
                risk_tier=WatchlistRiskTier.CRITICAL.value,
                risk_score=98.0,
                reason="Terminal holding collector node; aggregate deposits exceed INR 15,00,000 across 12 source victims.",
                typology="Collector Hub",
                is_active=True,
                flagged_by="Lead SOC Supervisor",
                total_flagged_transactions=14,
                total_flagged_volume=1520000.0,
                added_at=now - timedelta(hours=8),
                updated_at=now - timedelta(hours=8),
            ),
        ]
        for w in watchlists:
            # Check if exists
            exists = await session.execute(select(WatchlistAccount).where(WatchlistAccount.account_number == w.account_number))
            if not exists.scalar_one_or_none():
                session.add(w)

        # 3. Seed Investigation Cases with Complete Playbook & Evidence
        case1_num = "CASE-2026-0801"
        exists_case = await session.execute(select(InvestigationCase).where(InvestigationCase.case_number == case1_num))
        if not exists_case.scalar_one_or_none():
            case1 = InvestigationCase(
                id=uuid4(),
                case_number=case1_num,
                title="Syndicate Alpha: Multi-Hop UPI Pass-Through Ring",
                description="Victim ACC1001 lost ₹1,50,000 via fraudulent APK screen-sharing. Funds were rapidly split and layered through ACC1005 and ACC2002 before consolidating into terminal holder ACC5008.",
                status=InvestigationStatus.IN_PROGRESS.value,
                priority=CasePriority.CRITICAL.value,
                total_amount=150000.0,
                victim_account="ACC1001",
                current_holder_account="ACC5008",
                mule_chain_count=3,
                recovery_probability=85.0,
                assigned_to_id=investigator.id,
                ai_summary="Victim ACC1001 lost ₹1,50,000. Funds moved rapidly through 3 mule accounts (ACC1005 -> ACC2002 -> ACC5008). Current holder is ACC5008. Recovery probability is evaluated at 85%. Immediate debit freeze directive under Section 91 CrPC is strongly advised.",
                risk_factors={
                    "large_amount": 40,
                    "velocity": 25,
                    "new_beneficiary": 20,
                    "mule_pattern": 15,
                },
                created_at=now - timedelta(hours=3),
                updated_at=now - timedelta(minutes=15),
            )
            session.add(case1)
            await session.flush()

            # Playbook steps for Case 1
            steps = [
                CasePlaybookStep(
                    id=uuid4(),
                    case_id=case1.id,
                    step_order=1,
                    step_key="VALIDATE_ALERT",
                    title="1. Validate Alert & Risk Scoring",
                    description="Examine anomaly trigger, confirm transaction amount, and verify threshold violation.",
                    action_type="VERIFY",
                    status=PlaybookStepStatus.COMPLETED.value,
                    completed_at=now - timedelta(hours=2, minutes=50),
                    completed_by="Alok Khatri",
                    result_data={"verified": True, "risk_score": 92.0},
                ),
                CasePlaybookStep(
                    id=uuid4(),
                    case_id=case1.id,
                    step_order=2,
                    step_key="TRACE_MONEY",
                    title="2. Trace Multi-Hop Fund Flow",
                    description="Construct graph money trail to track downstream dispersal across layering nodes.",
                    action_type="GRAPH_TRACE",
                    status=PlaybookStepStatus.COMPLETED.value,
                    completed_at=now - timedelta(hours=2, minutes=30),
                    completed_by="Alok Khatri",
                    result_data={"hops": ["ACC1001", "ACC1005", "ACC2002", "ACC5008"]},
                ),
                CasePlaybookStep(
                    id=uuid4(),
                    case_id=case1.id,
                    step_order=3,
                    step_key="IDENTIFY_HOLDER",
                    title="3. Identify Terminal Holding Account",
                    description="Locate current account holding active unspent balance before cash-out or ATM withdrawal.",
                    action_type="HOLDER_LOOKUP",
                    status=PlaybookStepStatus.COMPLETED.value,
                    completed_at=now - timedelta(hours=2),
                    completed_by="Alok Khatri",
                    result_data={"terminal_account": "ACC5008", "unspent_balance": 138000.0},
                ),
                CasePlaybookStep(
                    id=uuid4(),
                    case_id=case1.id,
                    step_order=4,
                    step_key="FREEZE_ACCOUNT",
                    title="4. Issue Asset Freeze Directive",
                    description="Execute debit freeze on holding node under Section 91 CrPC and notify beneficiary bank.",
                    action_type="FREEZE_DIRECTIVE",
                    status=PlaybookStepStatus.IN_PROGRESS.value,
                    completed_at=None,
                    completed_by=None,
                ),
                CasePlaybookStep(
                    id=uuid4(),
                    case_id=case1.id,
                    step_order=5,
                    step_key="GENERATE_REPORT",
                    title="5. Generate Forensic PDF Dossier",
                    description="Compile evidence, audit logs, and money flow diagram for judicial prosecution and FIU-IND reporting.",
                    action_type="EXPORT_PDF",
                    status=PlaybookStepStatus.PENDING.value,
                    completed_at=None,
                    completed_by=None,
                ),
            ]
            for s in steps:
                session.add(s)

            # Timeline Events
            timeline_items = [
                CaseTimelineEvent(
                    id=uuid4(),
                    case_id=case1.id,
                    event_type="FRAUD_DETECTED",
                    title="10:21 AM • High Risk Fraud Anomaly Detected",
                    description="Real-time detector flagged ₹1,50,000 transfer with risk score 92/100 (High Velocity + Mule Pattern).",
                    actor_name="MoneyTrace SOC Engine",
                    icon="notifications_active",
                    timestamp=now - timedelta(hours=3),
                ),
                CaseTimelineEvent(
                    id=uuid4(),
                    case_id=case1.id,
                    event_type="ALERT_GENERATED",
                    title="10:22 AM • Critical Fraud Alert ALT2026081601 Generated",
                    description="Automated alert priority escalated to CRITICAL. Notifications broadcasted to SOC dashboard.",
                    actor_name="SOC Alert Engine",
                    icon="warning",
                    timestamp=now - timedelta(hours=2, minutes=58),
                ),
                CaseTimelineEvent(
                    id=uuid4(),
                    case_id=case1.id,
                    event_type="INVESTIGATOR_ASSIGNED",
                    title="10:23 AM • Case Assigned to Lead Analyst",
                    description="Assigned to Alok Khatri for active multi-hop fund tracing and asset preservation.",
                    actor_name="Priya Sengupta (Lead SOC)",
                    icon="person_pin",
                    timestamp=now - timedelta(hours=2, minutes=55),
                ),
                CaseTimelineEvent(
                    id=uuid4(),
                    case_id=case1.id,
                    event_type="MONEY_TRACED",
                    title="10:25 AM • 3-Hop Fund Path Graph Traced",
                    description="Money movement traced: ACC1001 -> ACC1005 (₹1,50,000) -> ACC2002 (₹1,45,000) -> ACC5008 (₹1,38,000).",
                    actor_name="Alok Khatri",
                    icon="route",
                    timestamp=now - timedelta(hours=2, minutes=30),
                ),
                CaseTimelineEvent(
                    id=uuid4(),
                    case_id=case1.id,
                    event_type="FREEZE_DIRECTIVE",
                    title="10:27 AM • Recovery & Freeze Recommendation Generated",
                    description="Recovery probability calculated at 85%. Recommended immediate Section 91 CrPC notice for ACC5008.",
                    actor_name="AI Recovery Engine",
                    icon="security",
                    timestamp=now - timedelta(hours=2),
                ),
                CaseTimelineEvent(
                    id=uuid4(),
                    case_id=case1.id,
                    event_type="REPORT_EXPORTED",
                    title="10:29 AM • Preliminary Forensic Dossier Exported",
                    description="Exported formal legal investigation report for cyber crime cell coordination.",
                    actor_name="Alok Khatri",
                    icon="description",
                    timestamp=now - timedelta(hours=1, minutes=45),
                ),
            ]
            for t in timeline_items:
                session.add(t)

            # Notes
            notes = [
                InvestigatorNote(
                    id=uuid4(),
                    case_id=case1.id,
                    author_name="Alok Khatri",
                    author_role="Investigator",
                    content="Analyzed transaction logs. ACC1005 acted as immediate pass-through mule with 97% balance forward within 90 seconds. Moving to terminal holder lookup.",
                    note_type="FINDING",
                    created_at=now - timedelta(hours=2, minutes=40),
                ),
                InvestigatorNote(
                    id=uuid4(),
                    case_id=case1.id,
                    author_name="Alok Khatri",
                    author_role="Investigator",
                    content="Confirmed unspent balance of ₹1,38,000 in SBI account ACC5008. Drafted emergency Section 91 CrPC freeze directive. Requesting supervisor authorization.",
                    note_type="LEGAL_HOLD",
                    created_at=now - timedelta(hours=1, minutes=50),
                ),
                InvestigatorNote(
                    id=uuid4(),
                    case_id=case1.id,
                    author_name="Priya Sengupta (Lead SOC)",
                    author_role="Supervisor",
                    content="Freeze directive authorized. Destination bank compliance team alerted via secure banking liaison gateway.",
                    note_type="ESCALATION",
                    created_at=now - timedelta(hours=1, minutes=20),
                ),
            ]
            for n in notes:
                session.add(n)

            # Evidence Locker items
            evidence_items = [
                CaseEvidence(
                    id=uuid4(),
                    case_id=case1.id,
                    title="Transaction Proof & Header Logs (TXN-1001-ALPHA)",
                    evidence_type="RECEIPT",
                    content_text="Source IP: 103.21.244.2 (Proxy/VPN detected)\nDevice Fingerprint: Android SM-G998B\nAmount: INR 150,000.00\nUTR: 20260816892011",
                    uploaded_by="SOC Log Archiver",
                    hash_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    created_at=now - timedelta(hours=2, minutes=50),
                ),
                CaseEvidence(
                    id=uuid4(),
                    case_id=case1.id,
                    title="Multi-Hop Forensic Money Flow Graph Diagram",
                    evidence_type="SCREENSHOT",
                    file_path="/artifacts/money_flow_case1.png",
                    uploaded_by="Alok Khatri",
                    hash_sha256="a1b2c3d4e5f6789012345678abcdef1234567890abcdef1234567890abcdef12",
                    created_at=now - timedelta(hours=2, minutes=20),
                ),
                CaseEvidence(
                    id=uuid4(),
                    case_id=case1.id,
                    title="Section 91 CrPC Asset Preservation Notice",
                    evidence_type="PDF_REPORT",
                    file_path="/reports/CrPC_Section91_ACC5008.pdf",
                    uploaded_by="Priya Sengupta",
                    hash_sha256="9876543210fedcba0987654321fedcba0987654321fedcba0987654321fedcba",
                    created_at=now - timedelta(hours=1, minutes=15),
                ),
            ]
            for e in evidence_items:
                session.add(e)

        # 4. Seed Enterprise Audit Logs
        audit_samples = [
            AuditLog(
                id=uuid4(),
                user_name="Alok Khatri",
                user_email="alok.khatri@moneytrace.dev",
                user_role="investigator",
                action=AuditAction.LOGIN.value,
                target_type="AUTH",
                target_id="SESSION-0801",
                details={"ip": "103.21.244.2", "device": "Firefox on MacOS"},
                ip_address="103.21.244.2",
                timestamp=now - timedelta(hours=3, minutes=10),
            ),
            AuditLog(
                id=uuid4(),
                user_name="SOC Engine",
                user_role="system",
                action=AuditAction.CASE_CREATED.value,
                target_type="CASE",
                target_id="CASE-2026-0801",
                details={"title": "Syndicate Alpha: Multi-Hop UPI Pass-Through Ring", "amount": 150000.0},
                ip_address="127.0.0.1",
                timestamp=now - timedelta(hours=3),
            ),
            AuditLog(
                id=uuid4(),
                user_name="Alok Khatri",
                user_email="alok.khatri@moneytrace.dev",
                user_role="investigator",
                action=AuditAction.ACCOUNT_FROZEN.value,
                target_type="ACCOUNT",
                target_id="ACC5008",
                details={"reason": "Section 91 CrPC Debit Freeze on Syndicate Collector Node", "amount_preserved": 138000.0},
                ip_address="103.21.244.2",
                timestamp=now - timedelta(hours=1, minutes=30),
            ),
            AuditLog(
                id=uuid4(),
                user_name="Alok Khatri",
                user_email="alok.khatri@moneytrace.dev",
                user_role="investigator",
                action=AuditAction.REPORT_GENERATED.value,
                target_type="REPORT",
                target_id="CASE-2026-0801",
                details={"format": "PDF", "dossier": "Forensic Case Investigation Dossier"},
                ip_address="103.21.244.2",
                timestamp=now - timedelta(hours=1, minutes=10),
            ),
        ]
        for a in audit_samples:
            session.add(a)

        await session.commit()
        print("Successfully seeded Investigation Cases, Playbook Steps, Notes, Evidence, Watchlist & Audit Logs!")


if __name__ == "__main__":
    asyncio.run(seed_data())
