
from fastapi import APIRouter, HTTPException
from typing import Any

from app.core.risk_model import predict_failure_risk


router = APIRouter(
    prefix = "/risk",
    tags = ["Risk"],
)


# ============================================================
# RISK PREDICTION
# ============================================================

@router.post("/predict")
def predict_risk(
    age_years: float,
    days_since_last_maintenance: float,
    overdue_days: float,
    prior_failure_count: int,
    traffic_load: float,
) -> dict[str, Any]:
    """
    Predict asset failure probability.

    The risk model expects exactly five features:

        1. age_years
        2. days_since_last_maintenance
        3. overdue_days
        4. prior_failure_count
        5. traffic_load
    """

    try:

        # ----------------------------------------------------
        # Basic validation
        # ----------------------------------------------------

        if age_years < 0:
            raise HTTPException(
                status_code=400,
                detail="age_years cannot be negative."
            )

        if days_since_last_maintenance < 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    "days_since_last_maintenance "
                    "cannot be negative."
                )
            )

        if overdue_days < 0:
            raise HTTPException(
                status_code=400,
                detail="overdue_days cannot be negative."
            )

        if prior_failure_count < 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    "prior_failure_count "
                    "cannot be negative."
                )
            )

        if not 0 <= traffic_load <= 1:
            raise HTTPException(
                status_code=400,
                detail="traffic_load must be between 0 and 1."
            )

        # ----------------------------------------------------
        # Risk model
        # ----------------------------------------------------

        failure_probability = predict_failure_risk(
            age_years=float(age_years),
            days_since_last_maintenance=float(
                days_since_last_maintenance
            ),
            overdue_days=float(overdue_days),
            prior_failure_count=int(
                prior_failure_count
            ),
            traffic_load=float(traffic_load),
        )

        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return {
            "failure_probability": round(
                float(failure_probability),
                4
            ),
            "risk_level": (
                "Critical"
                if failure_probability >= 0.75
                else "High"
                if failure_probability >= 0.50
                else "Medium"
                if failure_probability >= 0.25
                else "Low"
            ),
            "features": {
                "age_years": float(age_years),
                "days_since_last_maintenance": float(
                    days_since_last_maintenance
                ),
                "overdue_days": float(overdue_days),
                "prior_failure_count": int(
                    prior_failure_count
                ),
                "traffic_load": float(traffic_load),
            }
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Risk prediction failed: {exc}"
        ) from exc

