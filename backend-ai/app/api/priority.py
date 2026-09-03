from fastapi import APIRouter, HTTPException

from app.schemas.priority import (
    PriorityRequest,
    PriorityResponse
)

from app.core.priority_engine import calculate_priority


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/priority",
    tags=["Priority"]
)


# ============================================================
# CALCULATE PRIORITY
# ============================================================

@router.post(
    "/calculate",
    response_model=PriorityResponse
)
def calculate_priority_api(
    request: PriorityRequest
):

    try:

        result = calculate_priority(
            task=request.task,
            asset=request.asset,
            corridor=request.corridor,
            traffic_load=request.traffic_load
        )

        return result

    except KeyError as e:

        raise HTTPException(
            status_code=400,
            detail=f"Missing required field: {e}"
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )