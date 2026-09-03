from fastapi import APIRouter, HTTPException

from app.core.scheduler import schedule_maintenance
from app.data_loader import load_scheduler_data
from app.schemas.scheduler import ScheduleResponse
from app.schemas.schedule_request import ScheduleRequest


router = APIRouter(
    prefix="/schedule",
    tags=["Scheduling"],
)


# ============================================================
# SCHEDULE ENDPOINT
# ============================================================

@router.post(
    "",
    response_model=ScheduleResponse,
)
def generate_schedule(
    request: ScheduleRequest,
):

    try:

        data = load_scheduler_data()

        result = schedule_maintenance(
            tasks=request.tasks,
            coa_windows=data["coa_windows"],
            assets=data["assets"],
            corridors=data["corridors"],
            trains=data["trains"],
            freight_forecast=data["freight_forecast"],
            planning_start_date=request.planning_start_date,
            planning_end_date=request.planning_end_date,
            occupied_window_ids=set(
                request.occupied_window_ids
            ),
            return_diagnostics=True,
        )

        return {
            "success": True,
            "data": result,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": str(exc),
            },
        )