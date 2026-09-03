from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from sqlalchemy import select

from app.db.database import SessionLocal
from app.db.models import (
    ScheduledMaintenance,
    UnscheduledMaintenance,
)


router = APIRouter(
    prefix="/schedule",
    tags=["Schedule Confirmation"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class ScheduleConfirmationRequest(BaseModel):

    scheduled: list[dict[str, Any]] = Field(
        default_factory=list
    )

    unscheduled: list[dict[str, Any]] = Field(
        default_factory=list
    )


# ============================================================
# CONFIRM + SAVE
# ============================================================

@router.post("/confirm")
def confirm_schedule(
    request: ScheduleConfirmationRequest,
):

    db: Session = SessionLocal()

    try:

        # ----------------------------------------------------
        # SAVE SCHEDULED TASKS
        # ----------------------------------------------------

        for task in request.scheduled:

            task_id = task.get("task_id")

            if not task_id:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "success": False,
                        "error": "Scheduled task is missing task_id.",
                    },
                )

            # Prevent duplicate confirmation
            existing = db.scalar(
                select(ScheduledMaintenance)
                .where(
                    ScheduledMaintenance.task_id == task_id
                )
            )

            if existing:
                existing.asset_id = task.get("asset_id")
                existing.corridor_id = task.get("corridor_id")
                existing.block_window_id = task.get("block_window_id")
                existing.date = task.get("date")
                existing.start_time = task.get("start_time")
                existing.end_time = task.get("end_time")
                existing.estimated_duration_hrs = task.get(
                    "estimated_duration_hrs"
                )
                existing.priority_score = task.get(
                    "priority_score"
                )
                existing.failure_risk = task.get(
                    "failure_risk"
                )

            else:

                record = ScheduledMaintenance(
                    task_id=task_id,
                    asset_id=task.get("asset_id"),
                    corridor_id=task.get("corridor_id"),
                    block_window_id=task.get("block_window_id"),
                    date=task.get("date"),
                    start_time=task.get("start_time"),
                    end_time=task.get("end_time"),
                    estimated_duration_hrs=task.get(
                        "estimated_duration_hrs"
                    ),
                    priority_score=task.get(
                        "priority_score"
                    ),
                    failure_risk=task.get(
                        "failure_risk"
                    ),
                    status="PENDING",
                )

                db.add(record)


        # ----------------------------------------------------
        # SAVE UNSCHEDULED TASKS
        # ----------------------------------------------------

        for task in request.unscheduled:

            task_id = task.get("task_id")

            if not task_id:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "success": False,
                        "error": "Unscheduled task is missing task_id.",
                    },
                )

            # Prevent duplicate confirmation
            existing = db.scalar(
                select(UnscheduledMaintenance)
                .where(
                    UnscheduledMaintenance.task_id == task_id
                )
            )

            if existing:
                existing.asset_id = task.get("asset_id")
                existing.corridor_id = task.get("corridor_id")
                existing.compatibility_group = task.get(
                    "compatibility_group"
                )
                existing.reason_code = task.get(
                    "reason_code"
                )
                existing.reason = task.get(
                    "reason"
                )

            else:

                record = UnscheduledMaintenance(
                    task_id=task_id,
                    asset_id=task.get("asset_id"),
                    corridor_id=task.get("corridor_id"),
                    compatibility_group=task.get(
                        "compatibility_group"
                    ),
                    reason_code=task.get(
                        "reason_code"
                    ),
                    reason=task.get(
                        "reason"
                    ),
                    status="PENDING",
                )

                db.add(record)


        # ----------------------------------------------------
        # COMMIT
        # ----------------------------------------------------

        db.commit()

        return {
            "success": True,
            "message": "Schedule confirmed and saved.",
            "data": {
                "scheduled_count": len(
                    request.scheduled
                ),
                "unscheduled_count": len(
                    request.unscheduled
                ),
            },
        }


    except HTTPException:
        raise

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": str(exc),
            },
        )


    finally:

        db.close()     
# ============================================================
# UPDATE SCHEDULED TASK STATUS
# ============================================================

@router.patch("/scheduled/{task_id}/status")
def update_scheduled_status(
    task_id: str,
    status: str,
):

    db: Session = SessionLocal()

    try:

        allowed_statuses = {
            "PENDING",
            "IN_PROGRESS",
            "DONE",
            "NOT_DONE",
        }

        status = status.upper()

        if status not in allowed_statuses:

            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": (
                        "Invalid status. "
                        "Allowed values: "
                        "PENDING, IN_PROGRESS, DONE, NOT_DONE"
                    ),
                },
            )

        record = db.scalar(
            select(ScheduledMaintenance)
            .where(
                ScheduledMaintenance.task_id == task_id
            )
        )

        if record is None:

            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": "Scheduled task not found.",
                },
            )

        record.status = status

        db.commit()

        return {
            "success": True,
            "message": "Scheduled task status updated.",
            "data": {
                "task_id": record.task_id,
                "status": record.status,
            },
        }

    except HTTPException:
        raise

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": str(exc),
            },
        )

    finally:

        db.close()


# ============================================================
# UPDATE UNSCHEDULED TASK STATUS
# ============================================================

@router.patch("/unscheduled/{task_id}/status")
def update_unscheduled_status(
    task_id: str,
    status: str,
):

    db: Session = SessionLocal()

    try:

        allowed_statuses = {
            "PENDING",
            "IN_PROGRESS",
            "DONE",
            "NOT_DONE",
        }

        status = status.upper()

        if status not in allowed_statuses:

            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": (
                        "Invalid status. "
                        "Allowed values: "
                        "PENDING, IN_PROGRESS, DONE, NOT_DONE"
                    ),
                },
            )

        record = db.scalar(
            select(UnscheduledMaintenance)
            .where(
                UnscheduledMaintenance.task_id == task_id
            )
        )

        if record is None:

            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": "Unscheduled task not found.",
                },
            )

        record.status = status

        db.commit()

        return {
            "success": True,
            "message": "Unscheduled task status updated.",
            "data": {
                "task_id": record.task_id,
                "status": record.status,
            },
        }

    except HTTPException:
        raise

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": str(exc),
            },
        )

    finally:

        db.close()

# ============================================================
# GET CONFIRMED SCHEDULE
# ============================================================

@router.get("/confirmed")
def get_confirmed_schedule():

    db: Session = SessionLocal()

    try:

        scheduled_records = db.scalars(
            select(ScheduledMaintenance)
        ).all()

        unscheduled_records = db.scalars(
            select(UnscheduledMaintenance)
        ).all()

        scheduled = [
            {
                "id": record.id,
                "task_id": record.task_id,
                "asset_id": record.asset_id,
                "corridor_id": record.corridor_id,
                "block_window_id": record.block_window_id,
                "date": record.date,
                "start_time": record.start_time,
                "end_time": record.end_time,
                "estimated_duration_hrs":
                    record.estimated_duration_hrs,
                "priority_score":
                    record.priority_score,
                "failure_risk":
                    record.failure_risk,
                "status": record.status,
                "created_at":
                    record.created_at.isoformat()
                    if record.created_at
                    else None,
            }
            for record in scheduled_records
        ]

        unscheduled = [
            {
                "id": record.id,
                "task_id": record.task_id,
                "asset_id": record.asset_id,
                "corridor_id": record.corridor_id,
                "compatibility_group":
                    record.compatibility_group,
                "reason_code":
                    record.reason_code,
                "reason":
                    record.reason,
                "status":
                    record.status,
                "created_at":
                    record.created_at.isoformat()
                    if record.created_at
                    else None,
            }
            for record in unscheduled_records
        ]

        return {
            "success": True,
            "data": {
                "scheduled": scheduled,
                "unscheduled": unscheduled,
                "summary": {
                    "scheduled_count":
                        len(scheduled),
                    "unscheduled_count":
                        len(unscheduled),
                    "total_count":
                        len(scheduled)
                        + len(unscheduled),
                },
            },
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": str(exc),
            },
        )

    finally:

        db.close()