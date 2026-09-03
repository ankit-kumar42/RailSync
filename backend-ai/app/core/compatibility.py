import math
from typing import Dict, Any


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

LOCATION_DECAY_KM = 2.0

COMPATIBILITY_THRESHOLD = 0.50

WEIGHT_LOCATION = 0.40
WEIGHT_DEADLINE = 0.30
WEIGHT_DEFECT = 0.20
WEIGHT_DURATION = 0.10


# ---------------------------------------------------------
# Location helpers
# ---------------------------------------------------------

def _get_task_interval(
    task: Dict[str, Any]
) -> tuple[float, float]:
    """
    Return the physical location of a maintenance task
    as an interval.

    Track tasks:
        location_start_km
        location_end_km

    Signal / traction tasks:
        location_km

    A point location is represented as:

        location_km -> location_km
    """

    # Track task
    if (
        task.get("location_start_km") is not None
        and task.get("location_end_km") is not None
    ):

        start = float(
            task["location_start_km"]
        )

        end = float(
            task["location_end_km"]
        )

        return (
            min(start, end),
            max(start, end),
        )

    # Signal / traction task
    if task.get("location_km") is not None:

        location = float(
            task["location_km"]
        )

        return (
            location,
            location,
        )

    # No location information
    raise ValueError(
        "Task does not contain a valid maintenance location."
    )


def calculate_interval_distance(
    task_a: Dict[str, Any],
    task_b: Dict[str, Any]
) -> float:
    """
    Calculate the physical distance between two
    maintenance task locations.

    Supports:

        interval vs interval
        interval vs point
        point vs interval
        point vs point
    """

    a_start, a_end = _get_task_interval(
        task_a
    )

    b_start, b_end = _get_task_interval(
        task_b
    )

    # Intervals overlap
    if (
        a_start <= b_end
        and b_start <= a_end
    ):
        return 0.0

    # B is after A
    if a_end < b_start:
        return b_start - a_end

    # A is after B
    return a_start - b_end


def calculate_location_score(
    task_a: Dict[str, Any],
    task_b: Dict[str, Any]
) -> float:
    """
    Convert physical distance into [0,1].

    distance = 0
        -> 1.0

    Larger distance
        -> lower compatibility
    """

    distance = calculate_interval_distance(
        task_a,
        task_b
    )

    score = math.exp(
        -distance / LOCATION_DECAY_KM
    )

    return round(
        score,
        4
    )


# ---------------------------------------------------------
# Corridor
# ---------------------------------------------------------

def calculate_corridor_compatibility(
    task_a: Dict[str, Any],
    task_b: Dict[str, Any]
) -> float:
    """
    Tasks must belong to the same corridor
    to be coordinated.
    """

    if (
        task_a.get("corridor_id")
        == task_b.get("corridor_id")
    ):
        return 1.0

    return 0.0


# ---------------------------------------------------------
# Defect compatibility
# ---------------------------------------------------------

def _get_defect_type(
    task: Dict[str, Any]
) -> str | None:
    """
    Normalize defect type across maintenance systems.

    TMS / SMMS:
        defect_type

    TDMS:
        ohe_defect_type
    """

    defect = task.get(
        "defect_type"
    )

    if defect is not None:
        return str(defect).strip()

    defect = task.get(
        "ohe_defect_type"
    )

    if defect is not None:
        return str(defect).strip()

    return None


def calculate_defect_compatibility(
    task_a: Dict[str, Any],
    task_b: Dict[str, Any]
) -> float:
    """
    Estimate whether two maintenance defects
    can reasonably be coordinated.

    Same defect:
        1.0

    Different defects:
        0.5

    Missing defect information:
        0.5

    Missing information should not automatically
    make two tasks incompatible.
    """

    defect_a = _get_defect_type(
        task_a
    )

    defect_b = _get_defect_type(
        task_b
    )

    if (
        defect_a is None
        or defect_b is None
    ):
        return 0.5

    if defect_a == defect_b:
        return 1.0

    return 0.5


# ---------------------------------------------------------
# Duration compatibility
# ---------------------------------------------------------

def calculate_duration_compatibility(
    task_a: Dict[str, Any],
    task_b: Dict[str, Any]
) -> float:
    """
    Compare maintenance durations.

    Similar durations receive higher
    coordination compatibility.
    """

    try:

        duration_a = float(
            task_a[
                "estimated_duration_hrs"
            ]
        )

        duration_b = float(
            task_b[
                "estimated_duration_hrs"
            ]
        )

    except (
        TypeError,
        ValueError,
        KeyError
    ):

        return 0.0

    if (
        duration_a <= 0
        or duration_b <= 0
    ):
        return 0.0

    smaller = min(
        duration_a,
        duration_b
    )

    larger = max(
        duration_a,
        duration_b
    )

    score = (
        smaller / larger
    )

    return round(
        score,
        4
    )


# ---------------------------------------------------------
# Deadline compatibility
# ---------------------------------------------------------

def calculate_deadline_compatibility(
    task_a: Dict[str, Any],
    task_b: Dict[str, Any]
) -> float:
    """
    Compare maintenance urgency.

    Uses overdue_days as the common urgency
    feature across all maintenance systems.
    """

    try:

        overdue_a = float(
            task_a.get(
                "overdue_days",
                0
            )
        )

        overdue_b = float(
            task_b.get(
                "overdue_days",
                0
            )
        )

    except (
        TypeError,
        ValueError
    ):

        return 0.5

    difference = abs(
        overdue_a - overdue_b
    )

    score = math.exp(
        -difference / 30.0
    )

    return round(
        score,
        4
    )


# ---------------------------------------------------------
# Main compatibility calculation
# ---------------------------------------------------------

def calculate_compatibility(
    task_a: Dict[str, Any],
    task_b: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate compatibility between two
    maintenance tasks.

    Final score:

        C =
            0.40 * location
          + 0.30 * deadline
          + 0.20 * defect
          + 0.10 * duration

    Same corridor is mandatory.

    Compatibility remains a coordination layer
    and is NOT part of the AHP priority score.
    """

    task_a_id = task_a.get(
        "task_id"
    )

    task_b_id = task_b.get(
        "task_id"
    )

    # -----------------------------------------------------
    # Same task
    # -----------------------------------------------------

    if task_a_id == task_b_id:

        return {
            "task_a":
                task_a_id,

            "task_b":
                task_b_id,

            "compatibility_score":
                0.0,

            "corridor_compatibility":
                0.0,

            "location_score":
                0.0,

            "location_distance_km":
                0.0,

            "deadline_compatibility":
                0.0,

            "defect_compatibility":
                0.0,

            "duration_compatibility":
                0.0,

            "compatible":
                False,
        }

    # -----------------------------------------------------
    # Corridor
    # -----------------------------------------------------

    corridor_score = (
        calculate_corridor_compatibility(
            task_a,
            task_b
        )
    )

    # Different corridors cannot coordinate
    if corridor_score == 0.0:

        return {
            "task_a":
                task_a_id,

            "task_b":
                task_b_id,

            "compatibility_score":
                0.0,

            "corridor_compatibility":
                0.0,

            "location_score":
                0.0,

            "location_distance_km":
                None,

            "deadline_compatibility":
                0.0,

            "defect_compatibility":
                0.0,

            "duration_compatibility":
                0.0,

            "compatible":
                False,
        }

    # -----------------------------------------------------
    # Location
    # -----------------------------------------------------

    location_distance = (
        calculate_interval_distance(
            task_a,
            task_b
        )
    )

    location_score = (
        calculate_location_score(
            task_a,
            task_b
        )
    )

    # -----------------------------------------------------
    # Other compatibility dimensions
    # -----------------------------------------------------

    deadline_score = (
        calculate_deadline_compatibility(
            task_a,
            task_b
        )
    )

    defect_score = (
        calculate_defect_compatibility(
            task_a,
            task_b
        )
    )

    duration_score = (
        calculate_duration_compatibility(
            task_a,
            task_b
        )
    )

    # -----------------------------------------------------
    # Final compatibility score
    # -----------------------------------------------------

    compatibility_score = (
        WEIGHT_LOCATION
        * location_score

        + WEIGHT_DEADLINE
        * deadline_score

        + WEIGHT_DEFECT
        * defect_score

        + WEIGHT_DURATION
        * duration_score
    )

    compatibility_score = round(
        compatibility_score,
        4
    )

    compatible = (
        compatibility_score
        >= COMPATIBILITY_THRESHOLD
    )

    return {
        "task_a":
            task_a_id,

        "task_b":
            task_b_id,

        "compatibility_score":
            compatibility_score,

        "corridor_compatibility":
            corridor_score,

        "location_score":
            location_score,

        "location_distance_km":
            round(
                location_distance,
                4
            ),

        "deadline_compatibility":
            deadline_score,

        "defect_compatibility":
            defect_score,

        "duration_compatibility":
            duration_score,

        "compatible":
            compatible,
    }