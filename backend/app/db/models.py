from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


# ============================================================
# MAINTENANCE TASK
# ============================================================

class MaintenanceTask(Base):

    __tablename__ = "maintenance_tasks"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    task_id: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    asset_id: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    corridor_id: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    location_start_km: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    location_end_km: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    location_km: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    defect_type: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    overdue_days: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    last_maintenance_date: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    estimated_duration_hrs: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    system: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


# ============================================================
# SCHEDULED MAINTENANCE
# ============================================================

class ScheduledMaintenance(Base):

    __tablename__ = "scheduled_maintenance"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    task_id: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    asset_id: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    corridor_id: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    block_window_id: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    date: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    start_time: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    end_time: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    estimated_duration_hrs: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    priority_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    failure_risk: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    traffic_load: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="PENDING",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


# ============================================================
# UNSCHEDULED MAINTENANCE
# ============================================================

class UnscheduledMaintenance(Base):

    __tablename__ = "unscheduled_maintenance"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    task_id: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    asset_id: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    corridor_id: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    compatibility_group: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    reason_code: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    reason: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="PENDING",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )