from typing import Any

import requests


# ============================================================
# CONFIGURATION
# ============================================================

AI_BASE_URL = "http://127.0.0.1:8000"


# ============================================================
# BACKEND-AI CLIENT
# ============================================================

class AIClient:

    def __init__(
        self,
        base_url: str = AI_BASE_URL,
    ):

        self.base_url = base_url.rstrip("/")


    # ========================================================
    # GENERATE SCHEDULE
    # ========================================================

    def generate_schedule(
    self,
    tasks: list[dict[str, Any]],
    planning_start_date: str | None = None,
    planning_end_date: str | None = None,
    occupied_window_ids: list[str] | None = None,
) -> dict[str, Any]:

        payload = {
            "tasks": tasks,
            "planning_start_date": planning_start_date,
            "planning_end_date": planning_end_date,
            "occupied_window_ids": occupied_window_ids or [],
        }


        try:

            response = requests.post(
                f"{self.base_url}/schedule",
                json=payload,
                timeout=60,
            )

        except requests.RequestException as exc:

            raise RuntimeError(
                f"Backend-AI is unreachable: {exc}"
            ) from exc


        if response.status_code != 200:

            raise RuntimeError(
                "Backend-AI returned an error: "
                f"{response.status_code} "
                f"{response.text}"
            )


        try:

            return response.json()

        except ValueError as exc:

            raise RuntimeError(
                "Backend-AI returned invalid JSON."
            ) from exc