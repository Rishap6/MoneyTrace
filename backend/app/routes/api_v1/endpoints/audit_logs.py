"""Audit Logs endpoints — Immutable activity trail for compliance and SOC review."""

from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, Query, status, HTTPException, Body
from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user
from app.database import get_session
from app.models.user import User
from app.models.audit_log import AuditLog, AuditAction

router = APIRouter()


@router.get("/")
async def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    target_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve paginated audit logs for compliance tracking."""
    query = select(AuditLog)

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(AuditLog.user_name).like(s),
                func.lower(AuditLog.target_id).like(s),
                func.lower(AuditLog.action).like(s),
            )
        )
    if action:
        query = query.where(func.lower(AuditLog.action) == action.lower())
    if target_type:
        query = query.where(func.lower(AuditLog.target_type) == target_type.lower())

    # Count
    count_query = select(func.count(AuditLog.id))
    if search:
        s = f"%{search.strip().lower()}%"
        count_query = count_query.where(
            or_(
                func.lower(AuditLog.user_name).like(s),
                func.lower(AuditLog.target_id).like(s),
                func.lower(AuditLog.action).like(s),
            )
        )
    if action:
        count_query = count_query.where(func.lower(AuditLog.action) == action.lower())
    if target_type:
        count_query = count_query.where(func.lower(AuditLog.target_type) == target_type.lower())

    total_res = await session.execute(count_query)
    total = total_res.scalar_one() or 0

    query = query.order_by(AuditLog.timestamp.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    logs = result.scalars().all()

    return {
        "logs": [
            {
                "id": str(log.id),
                "user_name": log.user_name,
                "user_email": log.user_email,
                "user_role": log.user_role,
                "action": log.action,
                "target_type": log.target_type,
                "target_id": log.target_id,
                "details": log.details,
                "ip_address": log.ip_address,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            }
            for log in logs
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_audit_log(
    data: dict = Body(...),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Record an audit log entry."""
    now = datetime.now(timezone.utc)
    entry = AuditLog(
        id=uuid4(),
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_email=current_user.email,
        user_role=current_user.role if isinstance(current_user.role, str) else current_user.role.value,
        action=data.get("action", AuditAction.NOTE_ADDED.value).upper(),
        target_type=data.get("target_type", "SYSTEM").upper(),
        target_id=data.get("target_id", "SYS-001"),
        details=data.get("details", {}),
        ip_address=data.get("ip_address", "127.0.0.1"),
        timestamp=now,
    )
    session.add(entry)
    await session.commit()
    return {"success": True, "id": str(entry.id)}
