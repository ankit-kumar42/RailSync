from pydantic import BaseModel, Field


class TaskInput(BaseModel):

    task_id: str
    asset_id: str
    corridor_id: str

    location_start_km: float
    location_end_km: float

    defect_type: str
    severity: str

    overdue_days: int = Field(
        ge=0
    )

    last_maintenance_date: str

    estimated_duration_hrs: float = Field(
        gt=0
    )


class CompatibilityResponse(BaseModel):

    task_a: str
    task_b: str

    compatibility_score: float

    corridor_compatibility: float

    location_score: float

    location_distance_km: float | None

    deadline_compatibility: float

    defect_compatibility: float

    duration_compatibility: float

    compatible: bool