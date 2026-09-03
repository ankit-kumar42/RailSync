
from pathlib import Path
from functools import lru_cache

import joblib
import pandas as pd


# ============================================================
# PROJECT PATHS
# ============================================================

# backend-ai/
# ├── app/
# ├── ml/
# │   ├── risk_model.pkl
# │   └── risk_scaler.pkl
#
# This file is:
# backend-ai/app/core/risk_model.py
#
# Therefore:
# Path(__file__).resolve().parents[2]
# points to backend-ai/

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = PROJECT_ROOT / "ml" / "risk_model.pkl"
SCALER_PATH = PROJECT_ROOT / "ml" / "risk_scaler.pkl"


# ============================================================
# LOAD MODEL + SCALER
# ============================================================

@lru_cache(maxsize=1)
def _load_model_and_scaler():
    """
    Load the trained model and scaler exactly once.

    Lazy loading is intentional.

    We do NOT load the model when FastAPI imports this module.
    The model is loaded only when predict_failure_risk()
    is actually called.
    """

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Risk model not found: {MODEL_PATH}"
        )

    if not SCALER_PATH.exists():
        raise FileNotFoundError(
            f"Risk scaler not found: {SCALER_PATH}"
        )

    try:
        model = joblib.load(MODEL_PATH)
    except Exception as exc:
        raise RuntimeError(
            f"Failed to load risk model from "
            f"{MODEL_PATH}: {exc}"
        ) from exc

    try:
        scaler = joblib.load(SCALER_PATH)
    except Exception as exc:
        raise RuntimeError(
            f"Failed to load risk scaler from "
            f"{SCALER_PATH}: {exc}"
        ) from exc

    return model, scaler


# ============================================================
# PREDICT FAILURE RISK
# ============================================================

def predict_failure_risk(
    age_years: float,
    days_since_last_maintenance: float,
    overdue_days: float,
    prior_failure_count: int,
    traffic_load: float,
) -> float:
    """
    Predict probability of asset failure.

    Training features:

        age_at_failure
        days_since_last_maintenance
        overdue_days_at_failure
        prior_failure_count
        traffic_load_at_time

    Returns:

        float in [0, 1]
    """

    # --------------------------------------------------------
    # Normalize / validate inputs
    # --------------------------------------------------------

    try:
        age_years = float(age_years)
        days_since_last_maintenance = float(
            days_since_last_maintenance
        )
        overdue_days = float(overdue_days)
        prior_failure_count = int(prior_failure_count)
        traffic_load = float(traffic_load)

    except (TypeError, ValueError) as exc:

        raise ValueError(
            "Invalid failure-risk input values."
        ) from exc

    # --------------------------------------------------------
    # Safety boundaries
    # --------------------------------------------------------

    age_years = max(
        age_years,
        0.0
    )

    days_since_last_maintenance = max(
        days_since_last_maintenance,
        0.0
    )

    overdue_days = max(
        overdue_days,
        0.0
    )

    prior_failure_count = max(
        prior_failure_count,
        0
    )

    traffic_load = max(
        0.0,
        min(
            traffic_load,
            1.0
        )
    )

    # --------------------------------------------------------
    # Load trained artifacts
    # --------------------------------------------------------

    model, scaler = _load_model_and_scaler()

    # --------------------------------------------------------
    # EXACT TRAINING FEATURE NAMES
    # --------------------------------------------------------

    features = pd.DataFrame(
        [{
            "age_at_failure": age_years,

            "days_since_last_maintenance":
                days_since_last_maintenance,

            "overdue_days_at_failure":
                overdue_days,

            "prior_failure_count":
                prior_failure_count,

            "traffic_load_at_time":
                traffic_load,
        }],
        columns=[
            "age_at_failure",
            "days_since_last_maintenance",
            "overdue_days_at_failure",
            "prior_failure_count",
            "traffic_load_at_time",
        ],
    )

    # --------------------------------------------------------
    # SCALE
    # --------------------------------------------------------

    try:

        scaled_features = scaler.transform(
            features
        )

    except Exception as exc:

        raise RuntimeError(
            "Risk scaler failed to transform "
            "the failure-risk features. "
            f"Expected features: {list(features.columns)}"
        ) from exc

    # --------------------------------------------------------
    # PREDICT
    # --------------------------------------------------------

    try:

        probabilities = model.predict_proba(
            scaled_features
        )

    except AttributeError as exc:

        raise RuntimeError(
            "The loaded risk model does not "
            "provide predict_proba()."
        ) from exc

    except Exception as exc:

        raise RuntimeError(
            "Risk model prediction failed."
        ) from exc

    # --------------------------------------------------------
    # Binary classifier safety check
    # --------------------------------------------------------

    if probabilities.ndim != 2:
        raise RuntimeError(
            "Risk model returned an invalid "
            "probability matrix."
        )

    if probabilities.shape[1] < 2:
        raise RuntimeError(
            "Risk model does not appear to be "
            "a binary classifier."
        )

    probability = float(
        probabilities[0][1]
    )

    # --------------------------------------------------------
    # FINAL SAFETY CLAMP
    # --------------------------------------------------------

    return max(
        0.0,
        min(
            probability,
            1.0
        )
    )

