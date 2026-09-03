from datetime import datetime

from sqlalchemy import String, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


# ============================================================
# SCHEDULED MAINTENANCE
# ============================================================

class ScheduledMaintenance(Base):

    __tablename__ = "scheduled_maintenance"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    task_id: Mapped[str] = mapped_column(
        String,
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
        primary_key=True,
        autoincrement=True,
    )

    task_id: Mapped[str] = mapped_column(
        String,
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