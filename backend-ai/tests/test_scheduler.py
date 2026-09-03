from app.core.scheduler import schedule_maintenance


def make_asset(asset_id: str) -> dict:
    return {
        "asset_id": asset_id,
        "criticality_rating": 3,
        "age_years": 10,
        "historical_failure_count": 2,
    }


def make_corridor(corridor_id: str) -> dict:
    return {
        "corridor_id": corridor_id,
        "operational_criticality": 3,
    }


def make_task(
    task_id: str,
    asset_id: str,
    corridor_id: str,
    location_km: float,
) -> dict:
    return {
        "task_id": task_id,
        "asset_id": asset_id,
        "corridor_id": corridor_id,
        "estimated_duration_hrs": 2,

        # Priority-engine fields
        "severity": "Medium",
        "overdue_days": 10,
        "last_maintenance_date": "2026-01-01",

        # Compatibility-engine fields
        "location_km": location_km,
        "defect_type": "track_defect",
    }


def test_scheduler_does_not_duplicate_tasks():

    tasks = [
        make_task("T1", "A1", "C1", 100),
        make_task("T2", "A2", "C1", 105),
    ]

    coa_windows = [
        {
            "block_window_id": "W1",
            "corridor_id": "C1",
            "date": "2026-08-30",
            "start_time": "10:00",
            "end_time": "14:00",
            "approved": True,
        },
        {
            "block_window_id": "W2",
            "corridor_id": "C1",
            "date": "2026-08-31",
            "start_time": "10:00",
            "end_time": "14:00",
            "approved": True,
        },
    ]

    result = schedule_maintenance(
        tasks=tasks,
        coa_windows=coa_windows,
        assets={
            "A1": make_asset("A1"),
            "A2": make_asset("A2"),
        },
        corridors={
            "C1": make_corridor("C1"),
        },
        trains=[],
        freight_forecast=[],
        return_diagnostics=True,
    )

    scheduled = result["scheduled"]

    task_ids = [
        item["task_id"]
        for item in scheduled
    ]

    assert len(task_ids) == len(set(task_ids))


def test_scheduler_does_not_duplicate_windows():

    tasks = [
        make_task("T1", "A1", "C1", 100),
        make_task("T2", "A2", "C1", 105),
    ]

    coa_windows = [
        {
            "block_window_id": "W1",
            "corridor_id": "C1",
            "date": "2026-08-30",
            "start_time": "10:00",
            "end_time": "14:00",
            "approved": True,
        },
    ]

    result = schedule_maintenance(
        tasks=tasks,
        coa_windows=coa_windows,
        assets={
            "A1": make_asset("A1"),
            "A2": make_asset("A2"),
        },
        corridors={
            "C1": make_corridor("C1"),
        },
        trains=[],
        freight_forecast=[],
        return_diagnostics=True,
    )

    scheduled = result["scheduled"]

    window_ids = [
        item["block_window_id"]
        for item in scheduled
    ]

    assert len(window_ids) == len(set(window_ids))


def test_scheduler_only_uses_approved_windows():

    tasks = [
        make_task("T1", "A1", "C1", 100),
    ]

    coa_windows = [
        {
            "block_window_id": "W1",
            "corridor_id": "C1",
            "date": "2026-08-30",
            "start_time": "10:00",
            "end_time": "14:00",
            "approved": True,
        },
        {
            "block_window_id": "W2",
            "corridor_id": "C1",
            "date": "2026-08-31",
            "start_time": "10:00",
            "end_time": "14:00",
            "approved": False,
        },
    ]

    result = schedule_maintenance(
        tasks=tasks,
        coa_windows=coa_windows,
        assets={
            "A1": make_asset("A1"),
        },
        corridors={
            "C1": make_corridor("C1"),
        },
        trains=[],
        freight_forecast=[],
        return_diagnostics=True,
    )

    approved_window_ids = {
        window["block_window_id"]
        for window in coa_windows
        if window["approved"]
    }

    for item in result["scheduled"]:
        assert item["block_window_id"] in approved_window_ids


def test_scheduler_only_schedules_input_tasks():

    tasks = [
        make_task("T1", "A1", "C1", 100),
        make_task("T2", "A2", "C1", 105),
    ]

    coa_windows = [
        {
            "block_window_id": "W1",
            "corridor_id": "C1",
            "date": "2026-08-30",
            "start_time": "10:00",
            "end_time": "14:00",
            "approved": True,
        },
        {
            "block_window_id": "W2",
            "corridor_id": "C1",
            "date": "2026-08-31",
            "start_time": "10:00",
            "end_time": "14:00",
            "approved": True,
        },
    ]

    result = schedule_maintenance(
        tasks=tasks,
        coa_windows=coa_windows,
        assets={
            "A1": make_asset("A1"),
            "A2": make_asset("A2"),
        },
        corridors={
            "C1": make_corridor("C1"),
        },
        trains=[],
        freight_forecast=[],
        return_diagnostics=True,
    )

    input_task_ids = {
        task["task_id"]
        for task in tasks
    }

    scheduled_task_ids = {
        item["task_id"]
        for item in result["scheduled"]
    }

    assert scheduled_task_ids.issubset(
        input_task_ids
    )