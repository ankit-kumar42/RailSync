from pydantic import BaseModel, Field
from typing import Any


# ============================================================
# REQUEST
# ============================================================

class PriorityRequest(BaseModel):
    task: dict[str, Any]
    asset: dict[str, Any]
    corridor: dict[str, Any]

    traffic_load: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0
    )


# ============================================================
# RESPONSE
# ============================================================

class PriorityResponse(BaseModel):
    task_id: str

    priority_score: float

    severity_score: float
    overdue_score: float

    maintenance_age_days: int
    maintenance_age_score: float

    asset_criticality_score: float
    corridor_criticality_score: float

    failure_risk: float
    traffic_score: float

    contributions: dict[str, float]