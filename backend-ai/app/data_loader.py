from pathlib import Path
import csv
from typing import Any


# ============================================================
# DATA DIRECTORY
# ============================================================

DATA_DIR = (
    Path(__file__).resolve().parent.parent
    / "ml"
    / "notebooks"
)


# ============================================================
# CSV HELPER
# ============================================================

def _read_csv(filename: str) -> list[dict[str, Any]]:
    """
    Read a CSV file and return a list of dictionaries.
    """

    path = DATA_DIR / filename

    if not path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {path}"
        )

    with path.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as file:

        return list(
            csv.DictReader(file)
        )


# ============================================================
# TYPE CONVERSION
# ============================================================

def _to_float(
    value: Any,
    default: float = 0.0,
) -> float:

    try:
        return float(value)
    except (
        TypeError,
        ValueError,
    ):
        return default


def _to_int(
    value: Any,
    default: int = 0,
) -> int:

    try:
        return int(float(value))
    except (
        TypeError,
        ValueError,
    ):
        return default


def _to_bool(value: Any) -> bool:

    if isinstance(value, bool):
        return value

    return str(value).strip().lower() in {
        "1",
        "true",
        "yes",
        "approved",
    }


# ============================================================
# TASK LOADER
# ============================================================

def load_tasks() -> list[dict[str, Any]]:
    """
    Load maintenance tasks from TMS, SMMS and TDMS.

    All three systems are normalized into the common
    scheduler task structure.
    """

    track_tasks = _read_csv(
        "01_tms_track_maintenance.csv"
    )

    signal_tasks = _read_csv(
        "02_smms_signal_maintenance.csv"
    )

    traction_tasks = _read_csv(
        "03_tdms_traction_maintenance.csv"
    )

    tasks: list[dict[str, Any]] = []

    # --------------------------------------------------------
    # TRACK / TMS
    # --------------------------------------------------------

    for row in track_tasks:

        tasks.append({
            **row,

            "system":
                "TMS",

            "estimated_duration_hrs":
                _to_float(
                    row.get(
                        "estimated_duration_hrs"
                    )
                ),

            "location_start_km":
                _to_float(
                    row.get(
                        "location_start_km"
                    )
                ),

            "location_end_km":
                _to_float(
                    row.get(
                        "location_end_km"
                    )
                ),

            "defect_type":
                row.get(
                    "defect_type",
                    ""
                ),

            "overdue_days":
                _to_int(
                    row.get(
                        "overdue_days"
                    )
                ),
        })

    # --------------------------------------------------------
    # SIGNAL / SMMS
    # --------------------------------------------------------

    for row in signal_tasks:

        location = _to_float(
            row.get(
                "location_km"
            )
        )

        tasks.append({
            **row,

            "system":
                "SMMS",

            "estimated_duration_hrs":
                _to_float(
                    row.get(
                        "estimated_duration_hrs"
                    )
                ),

            # Signal maintenance is a point location.
            # Represent it as a zero-length interval.
            "location_start_km":
                location,

            "location_end_km":
                location,

            "defect_type":
                row.get(
                    "defect_type",
                    ""
                ),

            "overdue_days":
                _to_int(
                    row.get(
                        "overdue_days"
                    )
                ),
        })

    # --------------------------------------------------------
    # TRACTION / TDMS
    # --------------------------------------------------------

    for row in traction_tasks:

        location = _to_float(
            row.get(
                "location_km"
            )
        )

        tasks.append({
            **row,

            "system":
                "TDMS",

            "estimated_duration_hrs":
                _to_float(
                    row.get(
                        "estimated_duration_hrs"
                    )
                ),

            # Traction maintenance is a point location.
            # Represent it as a zero-length interval.
            "location_start_km":
                location,

            "location_end_km":
                location,

            # Normalize TDMS defect terminology
            # into the common scheduler field.
            "defect_type":
                row.get(
                    "ohe_defect_type",
                    ""
                ),

            "overdue_days":
                _to_int(
                    row.get(
                        "overdue_days"
                    )
                ),
        })

    return tasks
# ============================================================
# COA WINDOWS
# ============================================================

def load_coa_windows() -> list[dict[str, Any]]:
    """
    Load approved and unapproved COA windows.
    """

    rows = _read_csv(
        "04_coa_block_availability.csv"
    )

    windows: list[dict[str, Any]] = []

    for row in rows:

        windows.append({
            **row,

            "approved":
                _to_bool(
                    row.get(
                        "approved"
                    )
                ),

            "max_duration_hrs":
                _to_float(
                    row.get(
                        "max_duration_hrs"
                    )
                ),
        })

    return windows


# ============================================================
# TRAIN TIMETABLE
# ============================================================

def load_trains() -> list[dict[str, Any]]:
    """
    Load train timetable.
    """

    return _read_csv(
        "05_train_timetable.csv"
    )


# ============================================================
# FREIGHT FORECAST
# ============================================================

def load_freight_forecast() -> list[dict[str, Any]]:
    """
    Load corridor-level freight forecast.
    """

    rows = _read_csv(
        "06_freight_forecast.csv"
    )

    forecasts: list[dict[str, Any]] = []

    for row in rows:

        forecasts.append({
            **row,

            "expected_freight_volume":
                _to_float(
                    row.get(
                        "expected_freight_volume"
                    )
                ),
        })

    return forecasts


# ============================================================
# ASSET MASTER
# ============================================================

def load_assets() -> dict[
    str,
    dict[str, Any]
]:
    """
    Load asset master indexed by asset_id.
    """

    rows = _read_csv(
        "07_assets_master.csv"
    )

    assets: dict[
        str,
        dict[str, Any]
    ] = {}

    for row in rows:

        asset_id = row.get(
            "asset_id"
        )

        if not asset_id:
            continue

        assets[asset_id] = {
            **row,

            "age_years":
                _to_float(
                    row.get(
                        "age_years"
                    )
                ),

            "criticality_rating":
                _to_int(
                    row.get(
                        "criticality_rating"
                    )
                ),

            "historical_failure_count":
                _to_int(
                    row.get(
                        "historical_failure_count"
                    )
                ),
        }

    return assets


# ============================================================
# CORRIDOR MASTER
# ============================================================

def load_corridors() -> dict[
    str,
    dict[str, Any]
]:
    """
    Load corridor master indexed by corridor_id.
    """

    rows = _read_csv(
        "08_corridors_master.csv"
    )

    corridors: dict[
        str,
        dict[str, Any]
    ] = {}

    for row in rows:

        corridor_id = row.get(
            "corridor_id"
        )

        if not corridor_id:
            continue

        corridors[corridor_id] = {
            **row,

            "total_length_km":
                _to_float(
                    row.get(
                        "total_length_km"
                    )
                ),

            "operational_criticality":
                _to_int(
                    row.get(
                        "operational_criticality"
                    )
                ),
        }

    return corridors


# ============================================================
# COMPLETE DATASET
# ============================================================

def load_scheduler_data() -> dict[str, Any]:
    """
    Load all data required by the maintenance scheduler.
    """

    return {
        "tasks":
            load_tasks(),

        "coa_windows":
            load_coa_windows(),

        "assets":
            load_assets(),

        "corridors":
            load_corridors(),

        "trains":
            load_trains(),

        "freight_forecast":
            load_freight_forecast(),
    }