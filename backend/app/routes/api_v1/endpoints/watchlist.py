"""Watchlist endpoints — Suspect and Mule Account Monitoring."""

from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, Query, status, HTTPException, Body
from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user
from app.database import get_session
from app.models.user import User
from app.models.watchlist import WatchlistAccount, WatchlistRiskTier
from app.models.audit_log import AuditLog, AuditAction

router = APIRouter()


@router.get("/")
async def list_watchlist(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    risk_tier: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """List monitored suspect accounts on the Watchlist."""
    query = select(WatchlistAccount)

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(WatchlistAccount.account_number).like(s),
                func.lower(WatchlistAccount.account_holder_name).like(s),
                func.lower(WatchlistAccount.reason).like(s),
            )
        )
    if risk_tier:
        query = query.where(func.lower(WatchlistAccount.risk_tier) == risk_tier.lower())
    if is_active is not None:
        query = query.where(WatchlistAccount.is_active == is_active)

    # Count
    count_query = select(func.count(WatchlistAccount.id))
    if search:
        s = f"%{search.strip().lower()}%"
        count_query = count_query.where(
            or_(
                func.lower(WatchlistAccount.account_number).like(s),
                func.lower(WatchlistAccount.account_holder_name).like(s),
            )
        )
    if risk_tier:
        count_query = count_query.where(func.lower(WatchlistAccount.risk_tier) == risk_tier.lower())

    total_res = await session.execute(count_query)
    total = total_res.scalar_one() or 0

    query = query.order_by(WatchlistAccount.added_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    accounts = result.scalars().all()

    return {
        "watchlist": [
            {
                "id": str(a.id),
                "account_number": a.account_number,
                "account_holder_name": a.account_holder_name,
                "bank_name": a.bank_name,
                "risk_tier": a.risk_tier,
                "risk_score": a.risk_score,
                "reason": a.reason,
                "typology": a.typology,
                "is_active": a.is_active,
                "flagged_by": a.flagged_by,
                "total_flagged_transactions": a.total_flagged_transactions,
                "total_flagged_volume": a.total_flagged_volume,
                "added_at": a.added_at.isoformat() if a.added_at else None,
            }
            for a in accounts
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    data: dict = Body(...),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Add a suspect account to the monitored Watchlist."""
    acc_num = data.get("account_number", "").strip().upper()
    if not acc_num:
        raise HTTPException(status_code=400, detail="Account number required")

    # Check if exists
    res = await session.execute(select(WatchlistAccount).where(WatchlistAccount.account_number == acc_num))
    existing = res.scalar_one_or_none()
    if existing:
        existing.is_active = True
        existing.risk_tier = data.get("risk_tier", WatchlistRiskTier.HIGH.value).upper()
        existing.reason = data.get("reason", existing.reason)
        await session.commit()
        return {"success": True, "message": f"Account {acc_num} updated on Watchlist"}

    now = datetime.now(timezone.utc)
    entry = WatchlistAccount(
        id=uuid4(),
        account_number=acc_num,
        account_holder_name=data.get("account_holder_name", f"Holder of {acc_num}"),
        bank_name=data.get("bank_name", "MoneyTrace Bank"),
        risk_tier=data.get("risk_tier", WatchlistRiskTier.HIGH.value).upper(),
        risk_score=float(data.get("risk_score", 88.0)),
        reason=data.get("reason", "Suspect mule account flagged by investigator."),
        typology=data.get("typology", "Mule Account"),
        is_active=True,
        flagged_by=current_user.full_name,
        total_flagged_transactions=int(data.get("total_flagged_transactions", 1)),
        total_flagged_volume=float(data.get("total_flagged_volume", 50000.0)),
        added_at=now,
        updated_at=now,
    )
    session.add(entry)

    # Log audit
    audit = AuditLog(
        id=uuid4(),
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role if isinstance(current_user.role, str) else current_user.role.value,
        action=AuditAction.WATCHLIST_ADDED.value,
        target_type="ACCOUNT",
        target_id=acc_num,
        details={"reason": entry.reason, "tier": entry.risk_tier},
        timestamp=now,
    )
    session.add(audit)

    await session.commit()
    return {"success": True, "id": str(entry.id), "account_number": acc_num}


@router.delete("/{account_number}")
async def remove_from_watchlist(
    account_number: str,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Remove / deactivate account from Watchlist."""
    acc_num = account_number.strip().upper()
    res = await session.execute(select(WatchlistAccount).where(WatchlistAccount.account_number == acc_num))
    entry = res.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Account not found on Watchlist")

    entry.is_active = False
    await session.commit()
    return {"success": True, "message": f"Account {acc_num} deactivated from Watchlist"}
