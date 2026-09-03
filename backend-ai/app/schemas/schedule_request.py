from typing import Literal

from pydantic import BaseModel, Field


class MaintenanceRequest(BaseModel):

    # --------------------------------------------------------
    # Identity
    # --------------------------------------------------------

    task_id: str
    asset_id: str
    corridor_id: str

    # --------------------------------------------------------
    # Location
    # --------------------------------------------------------

    # TMS uses these
    location_start_km: float | None = None
    location_end_km: float | None = None

    # SMMS / TDMS use this
    location_km: float | None = None

    # --------------------------------------------------------
    # Maintenance information
    # --------------------------------------------------------

    defect_type: str
    severity: Literal[
        "Low",
        "Medium",
        "High",
        "Critical",
    ]

    overdue_days: int = 0

    last_maintenance_date: str

    estimated_duration_hrs: float

    # --------------------------------------------------------
    # Source system
    # --------------------------------------------------------

    system: str | None = None


class ScheduleRequest(BaseModel):

    planning_start_date: str | None = None
    planning_end_date: str | None = None

    tasks: list[MaintenanceRequest] = Field(
        default_factory=list
    )

    occupied_window_ids: list[str] = Field(
        default_factory=list
    )