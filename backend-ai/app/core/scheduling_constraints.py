from datetime import datetime
from typing import Any


# ============================================================
# TIME UTILITIES
# ============================================================

def time_to_minutes(time_string: Any) -> int:
    """
    Convert a time value into minutes since midnight.

    Supported formats:

        HH:MM
        HH:MM:SS
        HH:MM:SS.microseconds
        ISO datetime strings

    Examples:

        "22:30"            -> 1350
        "22:30:00"         -> 1350
        "01:30"            -> 90
        "01:30:00"         -> 90
        "2026-09-02T22:30:00" -> 1350
    """

    if time_string is None:
        raise ValueError(
            "Time value cannot be None."
        )

    value = str(time_string).strip()

    if not value:
        raise ValueError(
            "Time value cannot be empty."
        )

    # --------------------------------------------------------
    # Remove CSV-style surrounding quotes
    # --------------------------------------------------------

    value = value.strip("\"'")

    # --------------------------------------------------------
    # HH:MM
    # --------------------------------------------------------

    try:
        parsed = datetime.strptime(
            value,
            "%H:%M",
        )

        return (
            parsed.hour * 60
            + parsed.minute
        )

    except ValueError:
        pass

    # --------------------------------------------------------
    # HH:MM:SS
    # --------------------------------------------------------

    try:
        parsed = datetime.strptime(
            value,
            "%H:%M:%S",
        )

        return (
            parsed.hour * 60
            + parsed.minute
        )

    except ValueError:
        pass

    # --------------------------------------------------------
    # HH:MM:SS.microseconds
    # --------------------------------------------------------

    try:
        parsed = datetime.strptime(
            value,
            "%H:%M:%S.%f",
        )

        return (
            parsed.hour * 60
            + parsed.minute
        )

    except ValueError:
        pass

    # --------------------------------------------------------
    # ISO datetime
    #
    # Example:
    #
    # 2026-09-02T22:30:00
    # --------------------------------------------------------

    try:
        parsed = datetime.fromisoformat(
            value
        )

        return (
            parsed.hour * 60
            + parsed.minute
        )

    except ValueError:
        pass

    # --------------------------------------------------------
    # Handle values containing a valid HH:MM at the beginning
    #
    # Examples:
    #
    # 09:30:00+05:30
    # 22:00:00Z
    # --------------------------------------------------------

    if len(value) >= 5:

        possible_time = value[:5]

        try:
            parsed = datetime.strptime(
                possible_time,
                "%H:%M",
            )

            return (
                parsed.hour * 60
                + parsed.minute
            )

        except ValueError:
            pass

    raise ValueError(
        f"Invalid time format: {time_string!r}. "
        "Expected HH:MM, HH:MM:SS, or a valid "
        "datetime value."
    )


# ============================================================
# WINDOW DURATION
# ============================================================

def calculate_window_duration_hours(
    start_time: Any,
    end_time: Any,
) -> float:
    """
    Calculate the duration of a COA maintenance window.

    Handles windows crossing midnight.

    Examples:

        09:00 -> 12:00
        = 3 hours

        22:00 -> 01:00
        = 3 hours

        22:00:00 -> 01:30:00
        = 3.5 hours
    """

    start = time_to_minutes(
        start_time
    )

    end = time_to_minutes(
        end_time
    )

    # --------------------------------------------------------
    # Same start/end means zero duration.
    # --------------------------------------------------------

    if end == start:
        return 0.0

    # --------------------------------------------------------
    # Window crosses midnight.
    # --------------------------------------------------------

    if end < start:
        end += 24 * 60

    duration_minutes = (
        end - start
    )

    return duration_minutes / 60.0


# ============================================================
# TASK DURATION
# ============================================================

def get_task_duration_hours(
    task: dict[str, Any],
) -> float:
    """
    Return the estimated maintenance duration.

    Invalid, missing, zero, negative, NaN, or infinite
    durations are treated as infeasible.
    """

    try:
        duration = float(
            task.get(
                "estimated_duration_hrs"
            )
        )

    except (
        TypeError,
        ValueError,
    ):
        return 0.0

    # NaN
    if duration != duration:
        return 0.0

    # Infinity
    if duration in (
        float("inf"),
        float("-inf"),
    ):
        return 0.0

    return duration


# ============================================================
# ID NORMALIZATION
# ============================================================

def normalize_id(
    value: Any,
) -> str:
    """
    Normalize IDs for reliable comparison.

    Examples:

        101    -> "101"
        "101"  -> "101"
    """

    if value is None:
        return ""

    return str(value).strip()


# ============================================================
# CORRIDOR COMPATIBILITY
# ============================================================

def is_same_corridor(
    task: dict[str, Any],
    window: dict[str, Any],
) -> bool:
    """
    Check whether task and COA window belong
    to the same corridor.
    """

    task_corridor = normalize_id(
        task.get("corridor_id")
    )

    window_corridor = normalize_id(
        window.get("corridor_id")
    )

    if not task_corridor:
        return False

    if not window_corridor:
        return False

    return (
        task_corridor
        == window_corridor
    )


# ============================================================
# APPROVAL CHECK
# ============================================================

def is_approved_window(
    window: dict[str, Any],
) -> bool:
    """
    Check whether a COA window is approved.

    Supported values:

        True
        False
        "true"
        "false"
        "1"
        "0"
        "yes"
        "approved"
    """

    value = window.get(
        "approved",
        False,
    )

    if isinstance(value, bool):
        return value

    if value is None:
        return False

    return (
        str(value)
        .strip()
        .lower()
        in {
            "true",
            "1",
            "yes",
            "approved",
        }
    )


# ============================================================
# DURATION COMPATIBILITY
# ============================================================

def has_sufficient_duration(
    task: dict[str, Any],
    window: dict[str, Any],
) -> bool:
    """
    Check whether the COA window is long enough
    for the maintenance task.
    """

    task_duration = get_task_duration_hours(
        task
    )

    if task_duration <= 0:
        return False

    try:
        window_duration = (
            calculate_window_duration_hours(
                window.get("start_time"),
                window.get("end_time"),
            )
        )

    except (
        TypeError,
        ValueError,
    ):
        return False

    if window_duration <= 0:
        return False

    return (
        task_duration
        <= window_duration
    )


# ============================================================
# COMPLETE FEASIBILITY CHECK
# ============================================================

def is_task_feasible(
    task: dict[str, Any],
    window: dict[str, Any],
) -> bool:
    """
    Determine whether a maintenance task can be
    assigned to a COA window.

    Conditions:

        1. COA window must be approved.
        2. Task and window must belong to same corridor.
        3. Task must have a valid positive duration.
        4. Maintenance duration must fit inside window.
    """

    # --------------------------------------------------------
    # Approval
    # --------------------------------------------------------

    if not is_approved_window(
        window
    ):
        return False

    # --------------------------------------------------------
    # Corridor
    # --------------------------------------------------------

    if not is_same_corridor(
        task,
        window,
    ):
        return False

    # --------------------------------------------------------
    # Duration
    # --------------------------------------------------------

    if not has_sufficient_duration(
        task,
        window,
    ):
        return False

    return True


# ============================================================
# EXPLAINABLE FEASIBILITY
# ============================================================

def check_task_feasibility(
    task: dict[str, Any],
    window: dict[str, Any],
) -> dict[str, Any]:
    """
    Return an explainable feasibility result.

    Useful for:

        - debugging
        - API responses
        - monitoring
        - testing
    """

    approved = is_approved_window(
        window
    )

    same_corridor = is_same_corridor(
        task,
        window,
    )

    task_duration = get_task_duration_hours(
        task
    )

    try:
        window_duration = (
            calculate_window_duration_hours(
                window.get("start_time"),
                window.get("end_time"),
            )
        )

    except (
        TypeError,
        ValueError,
    ):
        window_duration = 0.0

    valid_task_duration = (
        task_duration > 0
    )

    valid_window_duration = (
        window_duration > 0
    )

    sufficient_duration = (
        valid_task_duration
        and valid_window_duration
        and task_duration <= window_duration
    )

    feasible = (
        approved
        and same_corridor
        and sufficient_duration
    )

    return {
        "feasible": feasible,

        "approved": approved,

        "same_corridor": same_corridor,

        "task_duration_hours": round(
            task_duration,
            4,
        ),

        "window_duration_hours": round(
            window_duration,
            4,
        ),

        "valid_task_duration": (
            valid_task_duration
        ),

        "valid_window_duration": (
            valid_window_duration
        ),

        "sufficient_duration": (
            sufficient_duration
        ),

        "remaining_window_hours": round(
            max(
                window_duration
                - task_duration,
                0.0,
            ),
            4,
        ),
    }