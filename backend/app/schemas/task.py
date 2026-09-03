
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


# ============================================================
# CREATE TASK
# ============================================================

class MaintenanceTaskCreate(BaseModel):

    task_id: str

    asset_id: str

    corridor_id: str

    location_start_km: Optional[float] = None

    location_end_km: Optional[float] = None

    location_km: Optional[float] = None

    defect_type: str

    severity: str = Field(
        ...,
        pattern="^(Low|Medium|High|Critical)$",
    )

    overdue_days: int = 0

    last_maintenance_date: str

    estimated_duration_hrs: float

    system: Optional[str] = None


# ============================================================
# RESPONSE
# ============================================================

class MaintenanceTaskResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    task_id: str

    asset_id: str

    corridor_id: str

    location_start_km: Optional[float] = None

    location_end_km: Optional[float] = None

    location_km: Optional[float] = None

    defect_type: str

    severity: str

    overdue_days: int

    last_maintenance_date: str

    estimated_duration_hrs: float

    system: Optional[str] = None

