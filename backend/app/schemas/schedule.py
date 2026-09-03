from typing import Any

from pydantic import BaseModel


class ScheduleRequest(BaseModel):

    planning_start_date: str | None = None

    planning_end_date: str | None = None

    tasks: list[dict[str, Any]]


class ScheduleResponse(BaseModel):

    success: bool

    data: dict[str, Any]