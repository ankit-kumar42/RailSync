from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    ScheduledMaintenance,
    UnscheduledMaintenance,
)


router = APIRouter(
    prefix="/schedule",
    tags=["Schedule Management"],
)


# ============================================================
# CONFIRM SCHEDULE
# ============================================================

@router.post("/confirm")
def confirm_schedule(
    payload: dict[str, Any],
    db: Session = Depends(get_db),
):

    scheduled = payload.get(
        "scheduled",
        [],
    )

    unscheduled = payload.get(
        "unscheduled",
        [],
    )


    if not isinstance(scheduled, list):

        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "scheduled must be a list.",
            },
        )


    if not isinstance(unscheduled, list):

        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "unscheduled must be a list.",
            },
        )


    try:

        # ----------------------------------------------------
        # SCHEDULED
        # ----------------------------------------------------

        for task in scheduled:

            task_id = task.get(
                "task_id"
            )

            if not task_id:

                raise HTTPException(
                    status_code=400,
                    detail={
                        "success": False,
                        "error": (
                            "Scheduled task "
                            "is missing task_id."
                        ),
                    },
                )


            existing = db.scalar(
                select(ScheduledMaintenance)
                .where(
                    ScheduledMaintenance.task_id
                    == task_id
                )
            )


            if existing:

                existing.asset_id = task.get(
                    "asset_id"
                )

                existing.corridor_id = task.get(
                    "corridor_id"
                )

                existing.block_window_id = task.get(
                    "block_window_id"
                )

                existing.date = task.get(
                    "date"
                )

                existing.start_time = task.get(
                    "start_time"
                )

                existing.end_time = task.get(
                    "end_time"
                )

                existing.estimated_duration_hrs = (
                    task.get(
                        "estimated_duration_hrs"
                    )
                )

                existing.priority_score = task.get(
                    "priority_score"
                )

                existing.failure_risk = task.get(
                    "failure_risk"
                )

                existing.traffic_load = task.get(
                    "traffic_load"
                )

            else:

                record = ScheduledMaintenance(
                    task_id=task_id,
                    asset_id=task.get("asset_id"),
                    corridor_id=task.get("corridor_id"),
                    block_window_id=task.get(
                        "block_window_id"
                    ),
                    date=task.get("date"),
                    start_time=task.get(
                        "start_time"
                    ),
                    end_time=task.get(
                        "end_time"
                    ),
                    estimated_duration_hrs=task.get(
                        "estimated_duration_hrs"
                    ),
                    priority_score=task.get(
                        "priority_score"
                    ),
                    failure_risk=task.get(
                        "failure_risk"
                    ),
                    traffic_load=task.get(
                        "traffic_load"
                    ),
                    status="PENDING",
                )

                db.add(record)


        # ----------------------------------------------------
        # UNSCHEDULED
        # ----------------------------------------------------

        for task in unscheduled:

            task_id = task.get(
                "task_id"
            )

            if not task_id:

                raise HTTPException(
                    status_code=400,
                    detail={
                        "success": False,
                        "error": (
                            "Unscheduled task "
                            "is missing task_id."
                        ),
                    },
                )


            existing = db.scalar(
                select(UnscheduledMaintenance)
                .where(
                    UnscheduledMaintenance.task_id
                    == task_id
                )
            )


            if existing:

                existing.asset_id = task.get(
                    "asset_id"
                )

                existing.corridor_id = task.get(
                    "corridor_id"
                )

                existing.compatibility_group = (
                    task.get(
                        "compatibility_group"
                    )
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
                    asset_id=task.get(
                        "asset_id"
                    ),
                    corridor_id=task.get(
                        "corridor_id"
                    ),
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


        db.commit()


        return {
            "success": True,
            "message": (
                "Schedule confirmed "
                "and saved."
            ),
            "data": {
                "scheduled_count":
                    len(scheduled),

                "unscheduled_count":
                    len(unscheduled),
            },
        }


    except HTTPException:

        db.rollback()
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

# ============================================================
# GET CONFIRMED SCHEDULE
# ============================================================

@router.get("/confirmed")
def get_confirmed_schedule(
    db: Session = Depends(get_db),
):

    scheduled = db.scalars(
        select(ScheduledMaintenance)
        .order_by(
            ScheduledMaintenance.date,
            ScheduledMaintenance.start_time,
        )
    ).all()


    unscheduled = db.scalars(
        select(UnscheduledMaintenance)
        .order_by(
            UnscheduledMaintenance.id
        )
    ).all()


    return {
        "success": True,
        "data": {

            "scheduled": [
                {
                    "id": task.id,
                    "task_id": task.task_id,
                    "asset_id": task.asset_id,
                    "corridor_id": task.corridor_id,
                    "block_window_id":
                        task.block_window_id,
                    "date": task.date,
                    "start_time":
                        task.start_time,
                    "end_time":
                        task.end_time,
                    "estimated_duration_hrs":
                        task.estimated_duration_hrs,
                    "priority_score":
                        task.priority_score,
                    "failure_risk":
                        task.failure_risk,
                    "traffic_load":
                        task.traffic_load,
                    "status": task.status,
                    "created_at":
                        task.created_at,
                }

                for task in scheduled
            ],

            "unscheduled": [
                {
                    "id": task.id,
                    "task_id": task.task_id,
                    "asset_id": task.asset_id,
                    "corridor_id":
                        task.corridor_id,
                    "compatibility_group":
                        task.compatibility_group,
                    "reason_code":
                        task.reason_code,
                    "reason":
                        task.reason,
                    "status":
                        task.status,
                    "created_at":
                        task.created_at,
                }

                for task in unscheduled
            ],

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

# ============================================================
# UPDATE SCHEDULED STATUS
# ============================================================

@router.patch(
    "/scheduled/{task_id}/status"
)
def update_scheduled_status(
    task_id: str,
    status: str,
    db: Session = Depends(get_db),
):

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
                    "PENDING, IN_PROGRESS, "
                    "DONE, NOT_DONE"
                ),
            },
        )


    task = db.scalar(
        select(ScheduledMaintenance)
        .where(
            ScheduledMaintenance.task_id
            == task_id
        )
    )


    if task is None:

        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": (
                    "Scheduled task not found."
                ),
            },
        )


    task.status = status

    db.commit()


    return {
        "success": True,
        "message": (
            "Scheduled task status updated."
        ),
        "data": {
            "task_id": task.task_id,
            "status": task.status,
        },
    }


# ============================================================
# UPDATE UNSCHEDULED STATUS
# ============================================================

@router.patch(
    "/unscheduled/{task_id}/status"
)
def update_unscheduled_status(
    task_id: str,
    status: str,
    db: Session = Depends(get_db),
):

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
                    "PENDING, IN_PROGRESS, "
                    "DONE, NOT_DONE"
                ),
            },
        )


    task = db.scalar(
        select(UnscheduledMaintenance)
        .where(
            UnscheduledMaintenance.task_id
            == task_id
        )
    )


    if task is None:

        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": (
                    "Unscheduled task not found."
                ),
            },
        )


    task.status = status

    db.commit()


    return {
        "success": True,
        "message": (
            "Unscheduled task status updated."
        ),
        "data": {
            "task_id": task.task_id,
            "status": task.status,
        },
    }