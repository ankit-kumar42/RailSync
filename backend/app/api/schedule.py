from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    MaintenanceTask,
    ScheduledMaintenance,
    UnscheduledMaintenance,
)
from app.services.ai_client import AIClient


router = APIRouter(
    prefix="/schedule",
    tags=["Scheduling"],
)


ai_client = AIClient()


# ============================================================
# GENERATE SCHEDULE
# ============================================================

@router.post("")
@router.post("")
def generate_schedule(
    payload: dict[str, Any] | None = None,
    db: Session = Depends(get_db),
):
    payload = payload or {}

    # ------------------------------------------------------------
    # LOAD ALL MAINTENANCE TASKS
    # ------------------------------------------------------------

    records = db.scalars(
        select(MaintenanceTask)
        .order_by(MaintenanceTask.id)
    ).all()

    if not records:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": "No maintenance tasks found.",
            },
        )

    # ------------------------------------------------------------
    # LOAD EXISTING SCHEDULING STATE
    # ------------------------------------------------------------

    scheduled_records = db.scalars(
        select(ScheduledMaintenance)
    ).all()

    unscheduled_records = db.scalars(
        select(UnscheduledMaintenance)
    ).all()

    scheduled_by_task = {
        str(record.task_id): record
        for record in scheduled_records
    }

    unscheduled_by_task = {
        str(record.task_id): record
        for record in unscheduled_records
    }

    # ------------------------------------------------------------
    # DETERMINE WHICH TASKS STILL NEED SCHEDULING
    # ------------------------------------------------------------

    tasks = []

    for task in records:

        task_id = str(task.task_id)

        # If the task is already scheduled,
        # do not send it for scheduling again.
        if task_id in scheduled_by_task:
            continue

        # If it was previously unscheduled,
        # only PENDING tasks should be retried.
        unscheduled = unscheduled_by_task.get(task_id)

        if unscheduled is not None:
            status = str(
                unscheduled.status
            ).strip().upper()

            if status != "PENDING":
                continue

        tasks.append(
            {
                "task_id": task.task_id,
                "asset_id": task.asset_id,
                "corridor_id": task.corridor_id,
                "location_start_km": task.location_start_km,
                "location_end_km": task.location_end_km,
                "location_km": task.location_km,
                "defect_type": task.defect_type,
                "severity": task.severity,
                "overdue_days": task.overdue_days,
                "last_maintenance_date": task.last_maintenance_date,
                "estimated_duration_hrs": task.estimated_duration_hrs,
                "system": task.system,
            }
        )

    # ------------------------------------------------------------
    # DETERMINE COA WINDOWS CURRENTLY OCCUPIED
    # ------------------------------------------------------------

    occupied_window_ids = {
        str(record.block_window_id)
        for record in scheduled_records
        if (
            record.block_window_id
            and str(record.status).strip().upper()
            in {"PENDING", "IN_PROGRESS"}
        )
    }

    # ------------------------------------------------------------
    # PLANNING RANGE
    # ------------------------------------------------------------

    planning_start_date = payload.get(
        "planning_start_date"
    )

    planning_end_date = payload.get(
        "planning_end_date"
    )

    # ------------------------------------------------------------
    # SEND ACTIVE TASKS + OCCUPIED WINDOWS TO BACKEND-AI
    # ------------------------------------------------------------

    try:
        result = ai_client.generate_schedule(
            tasks=tasks,
            planning_start_date=planning_start_date,
            planning_end_date=planning_end_date,
            occupied_window_ids=list(
                occupied_window_ids
            ),
        )

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "success": False,
                "error": str(exc),
            },
        )

    return result
    # --------------------------------------------------------
    # CONVERT DATABASE TASKS → AI TASKS
    # --------------------------------------------------------

    tasks = []

    for task in records:

        tasks.append(
            {
                "task_id": task.task_id,
                "asset_id": task.asset_id,
                "corridor_id": task.corridor_id,

                "location_start_km":
                    task.location_start_km,

                "location_end_km":
                    task.location_end_km,

                "location_km":
                    task.location_km,

                "defect_type":
                    task.defect_type,

                "severity":
                    task.severity,

                "overdue_days":
                    task.overdue_days,

                "last_maintenance_date":
                    task.last_maintenance_date,

                "estimated_duration_hrs":
                    task.estimated_duration_hrs,

                "system":
                    task.system,
            }
        )


    # --------------------------------------------------------
    # PLANNING RANGE
    # --------------------------------------------------------

    planning_start_date = payload.get(
        "planning_start_date"
    )

    planning_end_date = payload.get(
        "planning_end_date"
    )


    # --------------------------------------------------------
    # CALL BACKEND-AI
    # --------------------------------------------------------

    try:

        result = ai_client.generate_schedule(
            tasks=tasks,
            planning_start_date=
                planning_start_date,
            planning_end_date=
                planning_end_date,
        )

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail={
                "success": False,
                "error": str(exc),
            },
        )


    return result


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
        []
    )

    unscheduled = payload.get(
        "unscheduled",
        []
    )


    # --------------------------------------------------------
    # BASIC VALIDATION
    # --------------------------------------------------------

    if not isinstance(scheduled, list):

        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "'scheduled' must be a list.",
            },
        )


    if not isinstance(unscheduled, list):

        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "'unscheduled' must be a list.",
            },
        )


    try:

        # ====================================================
        # SAVE SCHEDULED TASKS
        # ====================================================

        for item in scheduled:

            task_id = item.get("task_id")

            if not task_id:
                continue


            existing = db.scalar(
                select(ScheduledMaintenance)
                .where(
                    ScheduledMaintenance.task_id
                    == task_id
                )
            )


            if existing:

                # Update existing record

                existing.asset_id = item.get(
                    "asset_id"
                )

                existing.corridor_id = item.get(
                    "corridor_id"
                )

                existing.block_window_id = item.get(
                    "block_window_id"
                )

                existing.date = item.get(
                    "date"
                )

                existing.start_time = item.get(
                    "start_time"
                )

                existing.end_time = item.get(
                    "end_time"
                )

                existing.estimated_duration_hrs = (
                    item.get(
                        "estimated_duration_hrs"
                    )
                )

                existing.priority_score = (
                    item.get(
                        "priority_score"
                    )
                )

                existing.failure_risk = (
                    item.get(
                        "failure_risk"
                    )
                )

                existing.traffic_load = (
                    item.get(
                        "traffic_load"
                    )
                )

            else:

                db.add(
                    ScheduledMaintenance(
                        task_id=task_id,

                        asset_id=item.get(
                            "asset_id"
                        ),

                        corridor_id=item.get(
                            "corridor_id"
                        ),

                        block_window_id=item.get(
                            "block_window_id"
                        ),

                        date=item.get(
                            "date"
                        ),

                        start_time=item.get(
                            "start_time"
                        ),

                        end_time=item.get(
                            "end_time"
                        ),

                        estimated_duration_hrs=
                            item.get(
                                "estimated_duration_hrs"
                            ),

                        priority_score=item.get(
                            "priority_score"
                        ),

                        failure_risk=item.get(
                            "failure_risk"
                        ),

                        traffic_load=item.get(
                            "traffic_load"
                        ),

                        status="PENDING",
                    )
                )


        # ====================================================
        # SAVE UNSCHEDULED TASKS
        # ====================================================

        for item in unscheduled:

            task_id = item.get("task_id")

            if not task_id:
                continue


            existing = db.scalar(
                select(UnscheduledMaintenance)
                .where(
                    UnscheduledMaintenance.task_id
                    == task_id
                )
            )


            if existing:

                existing.asset_id = item.get(
                    "asset_id"
                )

                existing.corridor_id = item.get(
                    "corridor_id"
                )

                existing.compatibility_group = (
                    item.get(
                        "compatibility_group"
                    )
                )

                existing.reason_code = item.get(
                    "reason_code"
                )

                existing.reason = item.get(
                    "reason"
                )

            else:

                db.add(
                    UnscheduledMaintenance(
                        task_id=task_id,

                        asset_id=item.get(
                            "asset_id"
                        ),

                        corridor_id=item.get(
                            "corridor_id"
                        ),

                        compatibility_group=
                            item.get(
                                "compatibility_group"
                            ),

                        reason_code=item.get(
                            "reason_code"
                        ),

                        reason=item.get(
                            "reason"
                        ),

                        status="PENDING",
                    )
                )


        db.commit()


    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error":
                    f"Failed to save schedule: {exc}",
            },
        )


    return {
        "success": True,
        "message":
            "Schedule confirmed and saved.",
        "data": {
            "scheduled_count":
                len(scheduled),

            "unscheduled_count":
                len(unscheduled),
        },
    }


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
            ScheduledMaintenance.id
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
                    "id": item.id,
                    "task_id": item.task_id,
                    "asset_id": item.asset_id,
                    "corridor_id": item.corridor_id,
                    "block_window_id":
                        item.block_window_id,
                    "date": item.date,
                    "start_time":
                        item.start_time,
                    "end_time":
                        item.end_time,
                    "estimated_duration_hrs":
                        item.estimated_duration_hrs,
                    "priority_score":
                        item.priority_score,
                    "failure_risk":
                        item.failure_risk,
                    "traffic_load":
                        item.traffic_load,
                    "status": item.status,
                    "created_at":
                        item.created_at,
                }
                for item in scheduled
            ],

            "unscheduled": [
                {
                    "id": item.id,
                    "task_id": item.task_id,
                    "asset_id": item.asset_id,
                    "corridor_id":
                        item.corridor_id,
                    "compatibility_group":
                        item.compatibility_group,
                    "reason_code":
                        item.reason_code,
                    "reason":
                        item.reason,
                    "status": item.status,
                    "created_at":
                        item.created_at,
                }
                for item in unscheduled
            ],

            "summary": {
                "scheduled_count":
                    len(scheduled),

                "unscheduled_count":
                    len(unscheduled),

                "total_count":
                    len(scheduled) +
                    len(unscheduled),
            },
        },
    }


# ============================================================
# UPDATE SCHEDULED TASK STATUS
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
    }


    status = status.upper()


    if status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error":
                    "Invalid status.",
                "allowed":
                    sorted(allowed_statuses),
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
                "error":
                    "Scheduled task not found.",
                "task_id": task_id,
            },
        )


    # --------------------------------------------------------
    # ENFORCE STATUS LIFECYCLE
    # --------------------------------------------------------

    current = task.status


    valid_transition = (
        current == status
        or
        (current == "PENDING"
         and status == "IN_PROGRESS")
        or
        (current == "IN_PROGRESS"
         and status == "DONE")
    )


    if not valid_transition:

        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error":
                    f"Invalid status transition: "
                    f"{current} -> {status}",
            },
        )


    task.status = status

    db.commit()

    db.refresh(task)


    return {
        "success": True,
        "message":
            "Scheduled task status updated.",
        "data": {
            "task_id":
                task.task_id,
            "status":
                task.status,
        },
    }


# ============================================================
# UPDATE UNSCHEDULED TASK STATUS
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
        "RESOLVED",
        "CANCELLED",
    }


    status = status.upper()


    if status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error":
                    "Invalid status.",
                "allowed":
                    sorted(allowed_statuses),
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
                "error":
                    "Unscheduled task not found.",
                "task_id": task_id,
            },
        )


    task.status = status

    db.commit()

    db.refresh(task)


    return {
        "success": True,
        "message":
            "Unscheduled task status updated.",
        "data": {
            "task_id":
                task.task_id,
            "status":
                task.status,
        },
    }