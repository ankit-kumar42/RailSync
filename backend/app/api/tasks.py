
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import MaintenanceTask
from app.schemas.task import (
    MaintenanceTaskCreate,
    MaintenanceTaskResponse,
)


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


# ============================================================
# CREATE TASK
# ============================================================

@router.post(
    "",
    response_model=MaintenanceTaskResponse,
)
def create_task(
    request: MaintenanceTaskCreate,
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # CHECK DUPLICATE TASK
    # --------------------------------------------------------

    existing = db.scalar(
        select(MaintenanceTask)
        .where(
            MaintenanceTask.task_id == request.task_id
        )
    )

    if existing is not None:

        raise HTTPException(
            status_code=409,
            detail={
                "success": False,
                "error": "Task already exists.",
                "task_id": request.task_id,
            },
        )


    # --------------------------------------------------------
    # CREATE DATABASE RECORD
    # --------------------------------------------------------

    task = MaintenanceTask(
        task_id=request.task_id,

        asset_id=request.asset_id,

        corridor_id=request.corridor_id,

        location_start_km=
            request.location_start_km,

        location_end_km=
            request.location_end_km,

        location_km=
            request.location_km,

        defect_type=
            request.defect_type,

        severity=
            request.severity,

        overdue_days=
            request.overdue_days,

        last_maintenance_date=
            request.last_maintenance_date,

        estimated_duration_hrs=
            request.estimated_duration_hrs,

        system=
            request.system,
    )


    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    try:

        db.add(task)

        db.commit()

        db.refresh(task)

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": str(exc),
            },
        )


    return task


# ============================================================
# GET ALL TASKS
# ============================================================

@router.get(
    "",
    response_model=list[MaintenanceTaskResponse],
)
def get_tasks(
    db: Session = Depends(get_db),
):

    tasks = db.scalars(
        select(MaintenanceTask)
        .order_by(
            MaintenanceTask.id
        )
    ).all()


    return list(tasks)


# ============================================================
# GET SINGLE TASK
# ============================================================

@router.get(
    "/{task_id}",
    response_model=MaintenanceTaskResponse,
)
def get_task(
    task_id: str,
    db: Session = Depends(get_db),
):

    task = db.scalar(
        select(MaintenanceTask)
        .where(
            MaintenanceTask.task_id == task_id
        )
    )


    if task is None:

        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": "Task not found.",
                "task_id": task_id,
            },
        )


    return task


# ============================================================
# DELETE TASK
# ============================================================

@router.delete(
    "/{task_id}"
)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
):

    task = db.scalar(
        select(MaintenanceTask)
        .where(
            MaintenanceTask.task_id == task_id
        )
    )


    if task is None:

        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": "Task not found.",
                "task_id": task_id,
            },
        )


    try:

        db.delete(task)

        db.commit()

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": str(exc),
            },
        )


    return {
        "success": True,
        "message": "Task deleted.",
        "task_id": task_id,
    }

