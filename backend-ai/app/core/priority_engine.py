
from datetime import date, datetime
from typing import Any

from app.core.ahp import PRIORITY_WEIGHTS
from app.core.risk_model import predict_failure_risk
from app.core.traffic_engine import analyze_traffic


# ============================================================
# NORMALIZATION LIMITS
# ============================================================

MAX_OVERDUE_DAYS = 90
MAX_MAINTENANCE_AGE_DAYS = 365


# ============================================================
# SEVERITY
# ============================================================

SEVERITY_SCORE = {
    "Low": 0.33,
    "Medium": 0.66,
    "High": 1.00,
    "Critical": 1.00,
}


def normalize_severity(
    severity: str
) -> float:
    """
    Convert severity into [0, 1].
    """

    severity = str(
        severity
    ).strip().title()

    if severity not in SEVERITY_SCORE:
        raise ValueError(
            f"Unknown severity: {severity}"
        )

    return SEVERITY_SCORE[severity]


# ============================================================
# OVERDUE
# ============================================================

def normalize_overdue(
    overdue_days: float
) -> float:
    """
    Convert overdue days into [0, 1].
    """

    try:
        overdue_days = float(
            overdue_days
        )
    except (TypeError, ValueError) as exc:

        raise ValueError(
            "Invalid overdue_days."
        ) from exc

    overdue_days = max(
        overdue_days,
        0.0
    )

    return min(
        overdue_days / MAX_OVERDUE_DAYS,
        1.0
    )


# ============================================================
# MAINTENANCE AGE
# ============================================================

def calculate_maintenance_age(
    last_maintenance_date: str,
    today: date | None = None
) -> int:
    """
    Calculate days since last maintenance.
    """

    if today is None:
        today = date.today()

    try:

        maintenance_date = datetime.strptime(
            str(last_maintenance_date).strip(),
            "%Y-%m-%d"
        ).date()

    except (TypeError, ValueError) as exc:

        raise ValueError(
            "last_maintenance_date must "
            "use YYYY-MM-DD format."
        ) from exc

    return max(
        (
            today
            - maintenance_date
        ).days,
        0
    )


def normalize_maintenance_age(
    age_days: int
) -> float:
    """
    Convert maintenance age into [0, 1].
    """

    age_days = max(
        int(age_days),
        0
    )

    return min(
        age_days / MAX_MAINTENANCE_AGE_DAYS,
        1.0
    )


# ============================================================
# CRITICALITY
# ============================================================

def normalize_criticality(
    criticality: float
) -> float:
    """
    Criticality expected in range 1-5.

    1 -> 0
    5 -> 1
    """

    try:
        criticality = float(
            criticality
        )
    except (TypeError, ValueError) as exc:

        raise ValueError(
            "Invalid criticality."
        ) from exc

    return max(
        0.0,
        min(
            (
                criticality - 1.0
            ) / 4.0,
            1.0
        )
    )


# ============================================================
# TRAFFIC
# ============================================================

def normalize_traffic(
    traffic_load: float
) -> float:
    """
    Ensure traffic load is in [0, 1].
    """

    try:
        traffic_load = float(
            traffic_load
        )
    except (TypeError, ValueError) as exc:

        raise ValueError(
            "Invalid traffic_load."
        ) from exc

    return max(
        0.0,
        min(
            traffic_load,
            1.0
        )
    )


# ============================================================
# PRIORITY ENGINE
# ============================================================

def calculate_priority(
    task: dict[str, Any],
    asset: dict[str, Any],
    corridor: dict[str, Any],
    trains: list[dict[str, Any]] | None = None,
    freight_volume: float = 0.0,
    window_start: str | None = None,
    window_end: str | None = None,
    today: date | None = None,
    traffic_load: float | None = None,
) -> dict[str, Any]:
    """
    Calculate maintenance priority.

    The function supports TWO modes.

    --------------------------------------------------------
    MODE 1 — Full scheduler mode
    --------------------------------------------------------

    Provide:

        trains
        freight_volume
        window_start
        window_end

    Traffic is calculated internally.

    --------------------------------------------------------
    MODE 2 — Direct/test mode
    --------------------------------------------------------

    Provide:

        traffic_load

    The supplied traffic load is used directly.

    --------------------------------------------------------
    Priority factors
    --------------------------------------------------------

        severity
        overdue
        maintenance age
        asset criticality
        corridor criticality
        failure risk
        traffic
    """

    if not isinstance(task, dict):
        raise TypeError(
            "task must be a dictionary."
        )

    if not isinstance(asset, dict):
        raise TypeError(
            "asset must be a dictionary."
        )

    if not isinstance(corridor, dict):
        raise TypeError(
            "corridor must be a dictionary."
        )

    # ========================================================
    # 1. TASK FEATURES
    # ========================================================

    severity_score = normalize_severity(
        task["severity"]
    )

    overdue_score = normalize_overdue(
        task["overdue_days"]
    )

    maintenance_age_days = (
        calculate_maintenance_age(
            task["last_maintenance_date"],
            today
        )
    )

    maintenance_age_score = (
        normalize_maintenance_age(
            maintenance_age_days
        )
    )

    # ========================================================
    # 2. MASTER DATA FEATURES
    # ========================================================

    asset_criticality_score = (
        normalize_criticality(
            asset["criticality_rating"]
        )
    )

    corridor_criticality_score = (
        normalize_criticality(
            corridor["operational_criticality"]
        )
    )

    # ========================================================
    # 3. TRAFFIC
    # ========================================================

    if traffic_load is not None:

        # ----------------------------------------------------
        # Direct traffic value supplied.
        #
        # This is used by tests and direct callers.
        # ----------------------------------------------------

        traffic_load = normalize_traffic(
            traffic_load
        )

        traffic_result = {
            "maintenance_window": {
                "start_time":
                    window_start,

                "end_time":
                    window_end,
            },

            "train_count": 0,

            "train_impact": 0.0,

            "freight_volume":
                float(freight_volume),

            "freight_impact": 0.0,

            "traffic_load":
                traffic_load,

            "trains":
                [],
        }

    else:

        # ----------------------------------------------------
        # Full scheduler mode.
        # ----------------------------------------------------

        if trains is None:
            trains = []

        if window_start is None:
            raise ValueError(
                "window_start is required when "
                "traffic_load is not supplied."
            )

        if window_end is None:
            raise ValueError(
                "window_end is required when "
                "traffic_load is not supplied."
            )

        traffic_result = analyze_traffic(
            trains=trains,
            freight_volume=freight_volume,
            window_start=window_start,
            window_end=window_end
        )

        traffic_load = normalize_traffic(
            traffic_result[
                "traffic_load"
            ]
        )

    # ========================================================
    # 4. ML FAILURE RISK
    # ========================================================

    try:

        age_years = float(
            asset["age_years"]
        )

        prior_failure_count = int(
            asset[
                "historical_failure_count"
            ]
        )

    except (KeyError, TypeError, ValueError) as exc:

        raise ValueError(
            "Asset must contain valid "
            "age_years and "
            "historical_failure_count."
        ) from exc

    failure_risk = predict_failure_risk(
        age_years=age_years,

        days_since_last_maintenance=float(
            maintenance_age_days
        ),

        overdue_days=float(
            task["overdue_days"]
        ),

        prior_failure_count=
            prior_failure_count,

        traffic_load=traffic_load,
    )

    failure_risk = normalize_traffic(
        failure_risk
    )

    # ========================================================
    # 5. AHP WEIGHTS
    # ========================================================

    required_weights = [
        "severity",
        "overdue",
        "maintenance_age",
        "asset_criticality",
        "corridor_criticality",
        "failure_risk",
        "traffic",
    ]

    for key in required_weights:

        if key not in PRIORITY_WEIGHTS:

            raise KeyError(
                f"Missing AHP priority weight: {key}"
            )

    w_severity = PRIORITY_WEIGHTS[
        "severity"
    ]

    w_overdue = PRIORITY_WEIGHTS[
        "overdue"
    ]

    w_maintenance = PRIORITY_WEIGHTS[
        "maintenance_age"
    ]

    w_asset = PRIORITY_WEIGHTS[
        "asset_criticality"
    ]

    w_corridor = PRIORITY_WEIGHTS[
        "corridor_criticality"
    ]

    w_risk = PRIORITY_WEIGHTS[
        "failure_risk"
    ]

    w_traffic = PRIORITY_WEIGHTS[
        "traffic"
    ]

    # ========================================================
    # 6. CONTRIBUTIONS
    # ========================================================

    severity_contribution = (
        w_severity
        * severity_score
    )

    overdue_contribution = (
        w_overdue
        * overdue_score
    )

    maintenance_contribution = (
        w_maintenance
        * maintenance_age_score
    )

    asset_contribution = (
        w_asset
        * asset_criticality_score
    )

    corridor_contribution = (
        w_corridor
        * corridor_criticality_score
    )

    risk_contribution = (
        w_risk
        * failure_risk
    )

    traffic_contribution = (
        w_traffic
        * traffic_load
    )

    # ========================================================
    # 7. FINAL PRIORITY
    # ========================================================

    priority_score = (
        severity_contribution
        + overdue_contribution
        + maintenance_contribution
        + asset_contribution
        + corridor_contribution
        + risk_contribution
        + traffic_contribution
    )

    priority_score = max(
        0.0,
        min(
            priority_score,
            1.0
        )
    )

    # ========================================================
    # 8. RETURN EXPLAINABLE RESULT
    # ========================================================

    return {

        "task_id":
            task.get("task_id"),

        "priority_score":
            round(
                priority_score,
                4
            ),

        # ----------------------------------------------------
        # Normalized features
        # ----------------------------------------------------

        "severity_score":
            round(
                severity_score,
                4
            ),

        "overdue_score":
            round(
                overdue_score,
                4
            ),

        "maintenance_age_days":
            maintenance_age_days,

        "maintenance_age_score":
            round(
                maintenance_age_score,
                4
            ),

        "asset_criticality_score":
            round(
                asset_criticality_score,
                4
            ),

        "corridor_criticality_score":
            round(
                corridor_criticality_score,
                4
            ),

        "failure_risk":
            round(
                failure_risk,
                4
            ),

        "traffic_score":
            round(
                traffic_load,
                4
            ),

        # ----------------------------------------------------
        # Traffic explanation
        # ----------------------------------------------------

        "traffic": {
            "traffic_load":
                round(
                    traffic_load,
                    4
                ),

            "train_count":
                traffic_result[
                    "train_count"
                ],

            "train_impact":
                round(
                    traffic_result[
                        "train_impact"
                    ],
                    4
                ),

            "freight_volume":
                traffic_result[
                    "freight_volume"
                ],

            "freight_impact":
                round(
                    traffic_result[
                        "freight_impact"
                    ],
                    4
                ),

            "maintenance_window":
                traffic_result[
                    "maintenance_window"
                ],
        },

        # ----------------------------------------------------
        # Explainability
        # ----------------------------------------------------

        "contributions": {

            "severity":
                round(
                    severity_contribution,
                    4
                ),

            "overdue":
                round(
                    overdue_contribution,
                    4
                ),

            "maintenance_age":
                round(
                    maintenance_contribution,
                    4
                ),

            "asset_criticality":
                round(
                    asset_contribution,
                    4
                ),

            "corridor_criticality":
                round(
                    corridor_contribution,
                    4
                ),

            "failure_risk":
                round(
                    risk_contribution,
                    4
                ),

            "traffic":
                round(
                    traffic_contribution,
                    4
                ),
        },
    }

