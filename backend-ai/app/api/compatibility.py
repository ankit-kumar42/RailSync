from fastapi import APIRouter

from app.schemas.compatibility import (
    TaskInput,
    CompatibilityResponse
)

from app.core.compatibility import (
    calculate_compatibility
)


router = APIRouter(
    prefix="/compatibility",
    tags=["Compatibility"]
)


@router.post(
    "/calculate",
    response_model=CompatibilityResponse
)
def calculate(
    task_a: TaskInput,
    task_b: TaskInput
):

    result = calculate_compatibility(
        task_a.model_dump(),
        task_b.model_dump()
    )

    return result