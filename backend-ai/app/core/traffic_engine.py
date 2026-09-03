
from datetime import datetime
from typing import Any


# ============================================================
# TRAIN TYPE WEIGHTS
# ============================================================

TRAIN_TYPE_WEIGHT = {
    "passenger": 0.4,
    "express": 0.8,
}


# ============================================================
# NORMALIZATION LIMITS
# ============================================================

MAX_TRAINS_PER_WINDOW = 10
MAX_FREIGHT_VOLUME = 1000.0


# ============================================================
# TIME UTILITIES
# ============================================================

def time_to_minutes(
    time_string: str
) -> int:
    """
    Convert HH:MM into minutes since midnight.
    """

    if time_string is None:
        raise ValueError(
            "Time cannot be None."
        )

    value = str(
        time_string
    ).strip()

    try:

        parsed = datetime.strptime(
            value,
            "%H:%M"
        )

    except ValueError as exc:

        raise ValueError(
            f"Invalid time '{value}'. "
            "Expected HH:MM."
        ) from exc

    return (
        parsed.hour * 60
        + parsed.minute
    )


# ============================================================
# INTERVAL NORMALIZATION
# ============================================================

def _normalize_interval(
    start: int,
    end: int
) -> tuple[int, int]:
    """
    Convert an interval into a representation
    suitable for overlap checking.

    Crossing midnight is represented by
    extending the end by 24 hours.
    """

    if end <= start:
        end += 24 * 60

    return start, end


# ============================================================
# TRAIN / MAINTENANCE WINDOW OVERLAP
# ============================================================

def train_overlaps_window(
    train: dict[str, Any],
    window_start: str,
    window_end: str
) -> bool:
    """
    Determine whether a train overlaps
    the maintenance window.

    Handles midnight-crossing intervals.
    """

    if not isinstance(train, dict):
        return False

    departure = train.get(
        "departure_time"
    )

    arrival = train.get(
        "arrival_time"
    )

    if departure is None or arrival is None:
        return False

    try:

        train_start = time_to_minutes(
            departure
        )

        train_end = time_to_minutes(
            arrival
        )

        maintenance_start = time_to_minutes(
            window_start
        )

        maintenance_end = time_to_minutes(
            window_end
        )

    except ValueError:

        return False

    train_start, train_end = (
        _normalize_interval(
            train_start,
            train_end
        )
    )

    maintenance_start, maintenance_end = (
        _normalize_interval(
            maintenance_start,
            maintenance_end
        )
    )

    # --------------------------------------------------------
    # Check normal position
    # --------------------------------------------------------

    if (
        train_start < maintenance_end
        and
        train_end > maintenance_start
    ):
        return True

    # --------------------------------------------------------
    # Check train shifted by one day
    # --------------------------------------------------------

    shifted_train_start = (
        train_start + 24 * 60
    )

    shifted_train_end = (
        train_end + 24 * 60
    )

    if (
        shifted_train_start < maintenance_end
        and
        shifted_train_end > maintenance_start
    ):
        return True

    # --------------------------------------------------------
    # Check maintenance window shifted by one day
    # --------------------------------------------------------

    shifted_window_start = (
        maintenance_start + 24 * 60
    )

    shifted_window_end = (
        maintenance_end + 24 * 60
    )

    if (
        train_start < shifted_window_end
        and
        train_end > shifted_window_start
    ):
        return True

    return False


# ============================================================
# GET TRAINS IN MAINTENANCE WINDOW
# ============================================================

def get_trains_in_window(
    trains: list[dict[str, Any]],
    window_start: str,
    window_end: str
) -> list[dict[str, Any]]:
    """
    Return trains overlapping the maintenance window.
    """

    if not trains:
        return []

    return [
        train
        for train in trains
        if train_overlaps_window(
            train,
            window_start,
            window_end
        )
    ]


# ============================================================
# NORMALIZE TRAIN DENSITY
# ============================================================

def normalize_train_density(
    train_count: int
) -> float:
    """
    0 trains  -> 0
    10 trains -> 1
    10+       -> 1
    """

    try:
        train_count = int(
            train_count
        )
    except (TypeError, ValueError):
        train_count = 0

    train_count = max(
        train_count,
        0
    )

    return min(
        train_count / MAX_TRAINS_PER_WINDOW,
        1.0
    )


# ============================================================
# NORMALIZE FREIGHT
# ============================================================

def normalize_freight_volume(
    freight_volume: float
) -> float:
    """
    Convert freight volume to [0, 1].
    """

    try:
        freight_volume = float(
            freight_volume
        )
    except (TypeError, ValueError):
        freight_volume = 0.0

    freight_volume = max(
        freight_volume,
        0.0
    )

    return min(
        freight_volume / MAX_FREIGHT_VOLUME,
        1.0
    )


# ============================================================
# TRAIN IMPACT
# ============================================================

def calculate_train_impact(
    trains: list[dict[str, Any]]
) -> float:
    """
    Calculate train traffic impact.

    Considers:

        1. Number of trains
        2. Train type
    """

    if not trains:
        return 0.0

    weighted_sum = 0.0

    valid_train_count = 0

    for train in trains:

        if not isinstance(train, dict):
            continue

        train_type = str(
            train.get(
                "train_type",
                "passenger"
            )
        ).strip().lower()

        weight = TRAIN_TYPE_WEIGHT.get(
            train_type,
            0.4
        )

        weighted_sum += weight
        valid_train_count += 1

    if valid_train_count == 0:
        return 0.0

    density_score = normalize_train_density(
        valid_train_count
    )

    average_type_weight = (
        weighted_sum
        / valid_train_count
    )

    train_impact = (
        density_score
        * average_type_weight
    )

    return max(
        0.0,
        min(
            train_impact,
            1.0
        )
    )


# ============================================================
# COMBINED TRAFFIC LOAD
# ============================================================

def calculate_traffic_load(
    trains: list[dict[str, Any]],
    freight_volume: float
) -> float:
    """
    Combined traffic load.

    Train traffic: 70%
    Freight traffic: 30%
    """

    train_impact = calculate_train_impact(
        trains
    )

    freight_impact = normalize_freight_volume(
        freight_volume
    )

    traffic_load = (
        0.7 * train_impact
        +
        0.3 * freight_impact
    )

    return round(
        max(
            0.0,
            min(
                traffic_load,
                1.0
            )
        ),
        4
    )


# ============================================================
# COMPLETE TRAFFIC ANALYSIS
# ============================================================

def analyze_traffic(
    trains: list[dict[str, Any]],
    freight_volume: float,
    window_start: str,
    window_end: str
) -> dict[str, Any]:
    """
    Complete traffic analysis for one
    maintenance window.
    """

    if trains is None:
        trains = []

    try:
        freight_volume = float(
            freight_volume
        )
    except (TypeError, ValueError):
        freight_volume = 0.0

    freight_volume = max(
        freight_volume,
        0.0
    )

    # --------------------------------------------------------
    # Find overlapping trains
    # --------------------------------------------------------

    trains_in_window = get_trains_in_window(
        trains=trains,
        window_start=window_start,
        window_end=window_end
    )

    # --------------------------------------------------------
    # Train impact
    # --------------------------------------------------------

    train_impact = calculate_train_impact(
        trains_in_window
    )

    # --------------------------------------------------------
    # Freight impact
    # --------------------------------------------------------

    freight_impact = normalize_freight_volume(
        freight_volume
    )

    # --------------------------------------------------------
    # Combined load
    # --------------------------------------------------------

    traffic_load = calculate_traffic_load(
        trains_in_window,
        freight_volume
    )

    # --------------------------------------------------------
    # Return explainable result
    # --------------------------------------------------------

    return {
        "maintenance_window": {
            "start_time": str(
                window_start
            ),
            "end_time": str(
                window_end
            ),
        },

        "train_count": len(
            trains_in_window
        ),

        "train_impact": round(
            train_impact,
            4
        ),

        "freight_volume": float(
            freight_volume
        ),

        "freight_impact": round(
            freight_impact,
            4
        ),

        "traffic_load": traffic_load,

        "trains": trains_in_window,
    }

