from typing import Any

from pydantic import BaseModel, Field


# ============================================================
# SCHEDULED TASK
# ============================================================

class ScheduledTask(BaseModel):

    task_id: str
    asset_id: str
    corridor_id: str

    block_window_id: str
    date: str

    start_time: str
    end_time: str

    estimated_duration_hrs: float
    available_window_hrs: float
    remaining_window_hrs: float

    priority_score: float
    traffic_load: float
    failure_risk: float

    compatibility_group: int
    compatibility_degree: int
    coordination_preference: bool

    priority_details: dict[str, Any] = Field(
        default_factory=dict
    )


# ============================================================
# UNSCHEDULED TASK
# ============================================================

class UnscheduledTask(BaseModel):

    task_id: str
    asset_id: str
    corridor_id: str

    compatibility_group: int

    feasible_windows: int
    duration_rejected_windows: int
    constraint_rejected_windows: int

    reason_code: str
    reason: str


# ============================================================
# OPTIMIZATION SUMMARY
# ============================================================

class OptimizationSummary(BaseModel):

    method: str
    objective: str

    total_priority: float
    priority_scale: int


# ============================================================
# SCHEDULER SUMMARY
# ============================================================

class SchedulerSummary(BaseModel):

    total_tasks: int

    scheduled_tasks: int
    unscheduled_tasks: int

    total_coa_windows: int
    approved_coa_windows: int

    used_coa_windows: int
    unused_approved_coa_windows: int

    compatibility_groups: int
    multi_task_compatibility_groups: int

    reason_counts: dict[str, int]

    optimization: OptimizationSummary


# ============================================================
# SCHEDULER DATA
# ============================================================

class SchedulerData(BaseModel):

    scheduled: list[ScheduledTask]
    unscheduled: list[UnscheduledTask]

    summary: SchedulerSummary


# ============================================================
# FINAL RESPONSE
# ============================================================

class ScheduleResponse(BaseModel):

    success: bool

    data: SchedulerData