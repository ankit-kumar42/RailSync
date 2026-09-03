from pydantic import BaseModel, Field


class RiskRequest(BaseModel):
    age_years: float = Field(..., ge=0)
    days_since_last_maintenance: float = Field(..., ge=0)
    overdue_days: float = Field(..., ge=0)
    prior_failure_count: int = Field(..., ge=0)
    traffic_load: float = Field(..., ge=0)
    asset_criticality: int = Field(..., ge=1, le=5)


class RiskResponse(BaseModel):
    age_years: float
    days_since_last_maintenance: float
    overdue_days: float
    prior_failure_count: int
    traffic_load: float
    asset_criticality: int

    failure_probability: float