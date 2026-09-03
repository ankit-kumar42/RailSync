from typing import Any

import networkx as nx

from app.core.priority_engine import calculate_priority
from app.core.scheduling_constraints import (
    calculate_window_duration_hours,
    is_task_feasible,
)
from app.core.graph import (
    build_graph,
    get_connected_components,
)


# ============================================================
# DIAGNOSTIC REASON CODES
# ============================================================

CORRIDOR_NOT_FOUND = "CORRIDOR_NOT_FOUND"
ASSET_NOT_FOUND = "ASSET_NOT_FOUND"
NO_APPROVED_COA_WINDOW = "NO_APPROVED_COA_WINDOW"
DURATION_EXCEEDS_WINDOWS = "DURATION_EXCEEDS_WINDOWS"
SCHEDULING_CONSTRAINT = "SCHEDULING_CONSTRAINT"
INVALID_TASK_DATA = "INVALID_TASK_DATA"
INVALID_WINDOW_DATA = "INVALID_WINDOW_DATA"
WINDOW_ALREADY_ALLOCATED = "WINDOW_ALREADY_ALLOCATED"
NO_FEASIBLE_WINDOW = "NO_FEASIBLE_WINDOW"


# ============================================================
# OPTIMIZATION CONSTANTS
# ============================================================

_PRIORITY_SCALE = 1_000_000

# A compatible task must have at least this priority to
# participate in coordinated scheduling.
#
# IMPORTANT:
#
# This threshold ONLY controls coordination eligibility.
# It does NOT change the task's actual priority.
#
# Example:
#
#   A = 0.90
#   B = 0.70
#
# Both are eligible for coordination.
#
#   C = 0.45
#
# C remains eligible for normal individual scheduling,
# but cannot participate in a coordination bundle.
#
_COORDINATION_PRIORITY_THRESHOLD = 0.60


# ============================================================
# INTERNAL HELPERS
# ============================================================

def _to_bool(value: Any) -> bool:
    """Normalize CSV/API boolean values."""

    if isinstance(value, bool):
        return value

    if value is None:
        return False

    return str(value).strip().lower() in {
        "true",
        "1",
        "yes",
        "approved",
    }


def _safe_float(value: Any) -> float | None:
    """Safely convert a value to finite float."""

    try:
        result = float(value)
    except (TypeError, ValueError):
        return None

    if result != result:
        return None

    if result in (float("inf"), float("-inf")):
        return None

    return result


def _task_to_dict(task: Any) -> dict[str, Any]:
    """
    Normalize incoming task objects.

    Supports:
        - dict
        - Pydantic v2
        - Pydantic v1
        - generic Python objects
    """

    if isinstance(task, dict):
        return task

    model_dump = getattr(task, "model_dump", None)

    if callable(model_dump):
        return model_dump()

    dict_method = getattr(task, "dict", None)

    if callable(dict_method):
        return dict_method()

    if hasattr(task, "__dict__"):
        return dict(task.__dict__)

    raise TypeError(
        f"Unsupported task type: {type(task).__name__}"
    )


def _diagnostic(
    task: dict[str, Any],
    compatibility_group: int,
    reason_code: str,
    reason: str,
    feasible_windows: int = 0,
    duration_rejected_windows: int = 0,
    constraint_rejected_windows: int = 0,
) -> dict[str, Any]:
    """Create standardized diagnostic object."""

    return {
        "task_id": task.get("task_id"),
        "asset_id": task.get("asset_id"),
        "corridor_id": task.get("corridor_id"),
        "compatibility_group": compatibility_group,
        "feasible_windows": feasible_windows,
        "duration_rejected_windows": duration_rejected_windows,
        "constraint_rejected_windows": constraint_rejected_windows,
        "reason_code": reason_code,
        "reason": reason,
    }


def _task_key(task_id: Any) -> str:
    """Stable task key."""

    return str(task_id)


def _window_key(window_id: Any) -> str:
    """Stable window key."""

    return str(window_id)


def _priority_weight(priority: float) -> int:
    """Convert normalized priority into deterministic integer weight."""

    return int(
        round(
            priority * _PRIORITY_SCALE
        )
    )


# ============================================================
# COORDINATION SUBSET OPTIMIZATION
# ============================================================

def _find_best_compatible_subset(
    task_ids: list[str],
    candidates_by_task: dict[str, list[dict[str, Any]]],
    graph: nx.Graph,
    task_duration: dict[str, float],
    window_id: str,
    window_duration: float,
    priority_threshold: float,
) -> list[dict[str, Any]]:
    """
    Find the highest-total-priority mutually compatible subset
    that fits inside one COA window.

    Constraints:
        - task priority >= priority_threshold
        - task has a feasible candidate in this window
        - every selected pair is directly compatible
        - combined duration <= window duration

    A single task is NOT returned as a coordination bundle.
    At least two tasks are required.

    The compatibility component itself is not assumed to be
    fully pairwise compatible.
    """

    # --------------------------------------------------------
    # Build candidate map for this specific window.
    # --------------------------------------------------------

    window_candidates: dict[
        str,
        dict[str, Any],
    ] = {}

    for task_id in task_ids:

        candidates = candidates_by_task.get(
            task_id,
            [],
        )

        selected_candidate = None

        for candidate in candidates:

            if (
                _window_key(
                    candidate["block_window_id"]
                )
                != window_id
            ):
                continue

            if (
                candidate["priority_score"]
                < priority_threshold
            ):
                continue

            selected_candidate = candidate
            break

        if selected_candidate is not None:
            window_candidates[
                task_id
            ] = selected_candidate

    # Need at least two eligible tasks.
    if len(window_candidates) < 2:
        return []

    eligible_ids = list(
        window_candidates.keys()
    )

    # --------------------------------------------------------
    # Sort by priority descending.
    #
    # This allows the search to find strong solutions early.
    # --------------------------------------------------------

    eligible_ids.sort(
        key=lambda task_id: (
            -window_candidates[
                task_id
            ]["priority_score"],
            str(task_id),
        )
    )

    # --------------------------------------------------------
    # Remove tasks that individually cannot fit.
    # --------------------------------------------------------

    eligible_ids = [
        task_id
        for task_id in eligible_ids
        if task_duration[
            task_id
        ] <= window_duration
    ]

    if len(eligible_ids) < 2:
        return []

    # --------------------------------------------------------
    # Precompute suffix priority sums.
    #
    # Used as an upper bound for branch-and-bound.
    # --------------------------------------------------------

    suffix_priority = [
        0.0
        for _ in range(
            len(eligible_ids) + 1
        )
    ]

    for index in range(
        len(eligible_ids) - 1,
        -1,
        -1,
    ):

        task_id = eligible_ids[
            index
        ]

        suffix_priority[
            index
        ] = (
            suffix_priority[
                index + 1
            ]
            + window_candidates[
                task_id
            ]["priority_score"]
        )

    best_task_ids: list[str] = []
    best_priority = 0.0
    best_duration = 0.0

    # --------------------------------------------------------
    # Deterministic comparison for equal-priority solutions.
    #
    # Prefer:
    #   1. higher total priority
    #   2. more tasks
    #   3. lower duration
    #   4. lexicographically smaller task IDs
    # --------------------------------------------------------

    def is_better_solution(
        selected_ids: list[str],
        selected_priority: float,
        selected_duration: float,
    ) -> bool:

        nonlocal best_task_ids
        nonlocal best_priority
        nonlocal best_duration

        epsilon = 1e-12

        if (
            selected_priority
            > best_priority + epsilon
        ):
            return True

        if abs(
            selected_priority
            - best_priority
        ) > epsilon:
            return False

        if len(selected_ids) > len(
            best_task_ids
        ):
            return True

        if len(selected_ids) < len(
            best_task_ids
        ):
            return False

        if (
            selected_duration
            < best_duration - epsilon
        ):
            return True

        if (
            selected_duration
            > best_duration + epsilon
        ):
            return False

        return sorted(
            selected_ids
        ) < sorted(
            best_task_ids
        )

    # --------------------------------------------------------
    # Branch-and-bound DFS.
    # --------------------------------------------------------

    selected_ids: list[str] = []

    def dfs(
        index: int,
        current_duration: float,
        current_priority: float,
    ) -> None:

        nonlocal best_task_ids
        nonlocal best_priority
        nonlocal best_duration

        # ----------------------------------------------------
        # A coordination bundle requires at least two tasks.
        # ----------------------------------------------------

        if len(selected_ids) >= 2:

            if is_better_solution(
                selected_ids,
                current_priority,
                current_duration,
            ):

                best_task_ids = list(
                    selected_ids
                )

                best_priority = (
                    current_priority
                )

                best_duration = (
                    current_duration
                )

        # ----------------------------------------------------
        # No more candidates.
        # ----------------------------------------------------

        if index >= len(
            eligible_ids
        ):
            return

        # ----------------------------------------------------
        # Branch-and-bound.
        # ----------------------------------------------------

        maximum_possible_priority = (
            current_priority
            + suffix_priority[
                index
            ]
        )

        if (
            maximum_possible_priority
            < best_priority - 1e-12
        ):
            return

        # ----------------------------------------------------
        # Try including current task.
        # ----------------------------------------------------

        task_id = eligible_ids[
            index
        ]

        duration = task_duration[
            task_id
        ]

        new_duration = (
            current_duration
            + duration
        )

        if (
            new_duration
            <= window_duration + 1e-12
        ):

            # ------------------------------------------------
            # Every selected pair must be directly compatible.
            #
            # This prevents the transitive compatibility
            # problem:
            #
            #       A ----- B ----- C
            #
            # where A-B and B-C are compatible but A-C
            # is not.
            # ------------------------------------------------

            mutually_compatible = True

            for selected_task_id in (
                selected_ids
            ):

                if not graph.has_edge(
                    task_id,
                    selected_task_id,
                ):

                    mutually_compatible = False
                    break

            if mutually_compatible:

                selected_ids.append(
                    task_id
                )

                dfs(
                    index + 1,
                    new_duration,
                    current_priority
                    + window_candidates[
                        task_id
                    ]["priority_score"],
                )

                selected_ids.pop()

        # ----------------------------------------------------
        # Try excluding current task.
        # ----------------------------------------------------

        dfs(
            index + 1,
            current_duration,
            current_priority,
        )

    dfs(
        0,
        0.0,
        0.0,
    )

    if len(best_task_ids) < 2:
        return []

    # --------------------------------------------------------
    # Convert IDs back to candidate objects.
    # --------------------------------------------------------

    selected_candidates = [
        window_candidates[
            task_id
        ]
        for task_id in best_task_ids
    ]

    # --------------------------------------------------------
    # Deterministic ordering inside bundle.
    # --------------------------------------------------------

    selected_candidates.sort(
        key=lambda candidate: (
            -candidate[
                "priority_score"
            ],
            str(
                candidate[
                    "task_id"
                ]
            ),
        )
    )

    return selected_candidates


# ============================================================
# DIAGNOSTIC FINALIZATION
# ============================================================

def _finalize_unscheduled_reason(
    diagnostic: dict[str, Any],
) -> dict[str, Any]:
    """Convert incomplete diagnostic into final reason."""

    if diagnostic["reason_code"]:
        return diagnostic

    duration_rejected = diagnostic[
        "duration_rejected_windows"
    ]

    constraint_rejected = diagnostic[
        "constraint_rejected_windows"
    ]

    feasible_windows = diagnostic[
        "feasible_windows"
    ]

    if feasible_windows > 0:

        diagnostic["reason_code"] = (
            WINDOW_ALREADY_ALLOCATED
        )

        diagnostic["reason"] = (
            "The task had feasible maintenance windows, "
            "but those windows were allocated to other "
            "tasks by the priority-optimized assignment."
        )

        return diagnostic

    if (
        duration_rejected > 0
        and constraint_rejected == 0
    ):

        diagnostic["reason_code"] = (
            DURATION_EXCEEDS_WINDOWS
        )

        diagnostic["reason"] = (
            "The estimated maintenance duration is longer "
            "than every approved COA window available "
            "on the corridor."
        )

        return diagnostic

    if constraint_rejected > 0:

        diagnostic["reason_code"] = (
            SCHEDULING_CONSTRAINT
        )

        diagnostic["reason"] = (
            "The task does not satisfy the scheduling "
            "constraints for any approved COA window."
        )

        return diagnostic

    diagnostic["reason_code"] = (
        NO_FEASIBLE_WINDOW
    )

    diagnostic["reason"] = (
        "No approved COA window satisfied the task's "
        "scheduling requirements."
    )

    return diagnostic


# ============================================================
# SCHEDULER
# ============================================================

def schedule_maintenance(
    tasks: list[dict[str, Any]],
    coa_windows: list[dict[str, Any]],
    assets: dict[str, dict[str, Any]],
    corridors: dict[str, dict[str, Any]],
    trains: list[dict[str, Any]],
    freight_forecast: list[dict[str, Any]],
    planning_start_date: str | None = None,
    planning_end_date: str | None = None,

    # ========================================================
    # NEW:
    # Window IDs already occupied by active scheduled tasks.
    # ========================================================
    occupied_window_ids: set[str] | None = None,

    return_diagnostics: bool = False,
) -> list[dict[str, Any]] | dict[str, Any]:

    """
    Generate priority-optimized maintenance recommendations
    subject to compatibility, COA, duration, and scheduling
    constraints.

    Scheduling model
    ----------------

    Normal task:
        TASK -> COA WINDOW

    Coordinated tasks:
        COMPATIBLE HIGH-PRIORITY TASK SUBSET -> COA WINDOW

    Coordination eligibility:
        1. Tasks must be mutually compatible.
        2. Each task must have priority >=
           _COORDINATION_PRIORITY_THRESHOLD.
        3. Tasks must share a feasible COA window.
        4. Combined duration must fit inside
           the COA window.

    IMPORTANT:
        A complete compatibility component does NOT have to
        fit inside a COA window.

        If only a subset fits, the scheduler selects the
        mutually compatible subset with the maximum total
        priority.

    Priority behavior:
        Priority does NOT determine compatibility.

        Priority determines:
            - coordination eligibility through threshold
            - which compatible subset is preferred
            - final schedule ranking

    Every task can be scheduled at most once.

    A COA window can contain:
        - one normal task, OR
        - one coordinated compatible subset.
    """

    # ========================================================
    # NEW:
    # Normalize occupied window IDs.
    #
    # This keeps comparison consistent with _window_key().
    # ========================================================

    occupied_window_ids = {
        _window_key(window_id)
        for window_id in (
            occupied_window_ids or set()
        )
    }

    # ========================================================
    # 0. NORMALIZE TASKS
    # ========================================================

    normalized_tasks: list[
        dict[str, Any]
    ] = []

    for task in tasks:

        try:
            normalized_task = _task_to_dict(
                task
            )

        except Exception as exc:

            raise TypeError(
                f"Invalid maintenance task: {exc}"
            ) from exc

        normalized_tasks.append(
            normalized_task
        )

    tasks = normalized_tasks

    # ========================================================
    # 1. BASIC TASK INDEXES
    # ========================================================

    task_by_id: dict[
        str,
        dict[str, Any],
    ] = {}

    tasks_by_corridor: dict[
        str,
        list[dict[str, Any]],
    ] = {}

    diagnostics_by_task: dict[
        str,
        dict[str, Any],
    ] = {}

    for task in tasks:

        raw_task_id = task.get(
            "task_id"
        )

        if raw_task_id is None:
            continue

        task_id = _task_key(
            raw_task_id
        )

        if task_id in task_by_id:

            diagnostics_by_task[
                task_id
            ] = _diagnostic(
                task,
                -1,
                INVALID_TASK_DATA,
                "Duplicate task_id detected. Each maintenance "
                "task must have a unique task_id.",
            )

            continue

        task_by_id[
            task_id
        ] = task

        corridor_id = task.get(
            "corridor_id"
        )

        if corridor_id is not None:

            tasks_by_corridor.setdefault(
                str(corridor_id),
                [],
            ).append(
                task
            )

    # ========================================================
    # 2. COMPATIBILITY GRAPH
    # ========================================================

    graph, _ = build_graph(
        tasks
    )

    compatibility_components = (
        get_connected_components(
            graph
        )
    )

    task_to_group: dict[
        str,
        int,
    ] = {}

    for group_id, component in enumerate(
        compatibility_components
    ):

        for task_id in component:

            task_to_group[
                _task_key(task_id)
            ] = group_id

    # Tasks not represented in graph
    for task_id in task_by_id:

        if task_id not in task_to_group:

            task_to_group[
                task_id
            ] = -1

    # ========================================================
    # 3. COMPATIBILITY DEGREE
    # ========================================================

    compatibility_degree: dict[
        str,
        int,
    ] = {}

    for task_id in task_by_id:

        if task_id in graph:

            compatibility_degree[
                task_id
            ] = graph.degree(
                task_id
            )

        else:

            compatibility_degree[
                task_id
            ] = 0

    # ========================================================
    # 4. TRAIN INDEX
    # ========================================================

    trains_by_corridor: dict[
        str,
        list[dict[str, Any]],
    ] = {}

    for train in trains:

        corridor_id = train.get(
            "corridor_id"
        )

        if corridor_id is None:
            continue

        trains_by_corridor.setdefault(
            str(corridor_id),
            [],
        ).append(
            train
        )

    # ========================================================
    # 5. FREIGHT INDEX
    # ========================================================

    freight_by_corridor_date: dict[
        tuple[str, str],
        float,
    ] = {}

    for forecast in freight_forecast:

        corridor_id = forecast.get(
            "corridor_id"
        )

        forecast_date = forecast.get(
            "date"
        )

        if (
            corridor_id is None
            or forecast_date is None
        ):
            continue

        freight_volume = _safe_float(
            forecast.get(
                "expected_freight_volume"
            )
        )

        if freight_volume is None:
            continue

        freight_by_corridor_date[
            (
                str(corridor_id),
                str(forecast_date),
            )
        ] = freight_volume

    # ========================================================
    # 6. APPROVED COA WINDOWS
    # ========================================================

    approved_windows: list[
        dict[str, Any]
    ] = []

    windows_by_corridor: dict[
        str,
        list[dict[str, Any]],
    ] = {}

    window_by_id: dict[
        str,
        dict[str, Any],
    ] = {}

    for window in coa_windows:

        if not _to_bool(
            window.get(
                "approved",
                False,
            )
        ):
            continue

        corridor_id = window.get(
            "corridor_id"
        )

        window_id = window.get(
            "block_window_id"
        )

        if (
            corridor_id is None
            or window_id is None
        ):
            continue

        corridor_key = str(
            corridor_id
        )

        window_key = _window_key(
            window_id
        )

        # ====================================================
        # NEW:
        # This COA window is already occupied by an active
        # scheduled maintenance task.
        #
        # Do not allow the scheduler to consider it again.
        # ====================================================

        if window_key in occupied_window_ids:
            continue

        window_date = str(
            window.get(
                "date",
                "",
            )
        ).strip()

        window_start = str(
            window.get(
                "start_time",
                "",
            )
        ).strip()

        window_end = str(
            window.get(
                "end_time",
                "",
            )
        ).strip()

        if not window_date:
            continue

        if (
            planning_start_date is not None
            and window_date < planning_start_date
        ):
            continue

        if (
            planning_end_date is not None
            and window_date > planning_end_date
        ):
            continue

        try:

            duration_hours = (
                calculate_window_duration_hours(
                    window_start,
                    window_end,
                )
            )

        except (
            TypeError,
            ValueError,
        ):

            continue

        if duration_hours <= 0:
            continue

        if window_key in window_by_id:
            continue

        window_by_id[
            window_key
        ] = window

        approved_windows.append(
            window
        )

        windows_by_corridor.setdefault(
            corridor_key,
            [],
        ).append(
            window
        )

    # ========================================================
    # 7. TASK VALIDATION
    # ========================================================

    corridor_keys = {
        str(key)
        for key in corridors
    }

    for task_id, task in task_by_id.items():

        group_id = task_to_group.get(
            task_id,
            -1,
        )

        corridor_id = task.get(
            "corridor_id"
        )

        if corridor_id is None:

            diagnostics_by_task[
                task_id
            ] = _diagnostic(
                task,
                group_id,
                CORRIDOR_NOT_FOUND,
                "The task does not specify a corridor_id.",
            )

            continue

        corridor_key = str(
            corridor_id
        )

        if corridor_key not in corridor_keys:

            diagnostics_by_task[
                task_id
            ] = _diagnostic(
                task,
                group_id,
                CORRIDOR_NOT_FOUND,
                "The task references a corridor that does not "
                "exist in corridor master data.",
            )

            continue

        asset_id = task.get(
            "asset_id"
        )

        if asset_id is None:

            diagnostics_by_task[
                task_id
            ] = _diagnostic(
                task,
                group_id,
                ASSET_NOT_FOUND,
                "The task does not specify an asset_id.",
            )

            continue

        if asset_id not in assets:

            diagnostics_by_task[
                task_id
            ] = _diagnostic(
                task,
                group_id,
                ASSET_NOT_FOUND,
                "The task references an asset that does not "
                "exist in asset master data.",
            )

    # ========================================================
    # 8. TASK DURATIONS
    # ========================================================

    task_duration: dict[
        str,
        float,
    ] = {}

    for task_id, task in task_by_id.items():

        if task_id in diagnostics_by_task:
            continue

        duration = _safe_float(
            task.get(
                "estimated_duration_hrs"
            )
        )

        if duration is None or duration <= 0:

            diagnostics_by_task[
                task_id
            ] = _diagnostic(
                task,
                task_to_group.get(
                    task_id,
                    -1,
                ),
                INVALID_TASK_DATA,
                "The task maintenance duration must be "
                "greater than zero.",
            )

            continue

        task_duration[
            task_id
        ] = duration

    # ========================================================
    # 9. INDIVIDUAL CANDIDATES
    # ========================================================

    candidates: list[
        dict[str, Any]
    ] = []

    candidates_by_task: dict[
        str,
        list[dict[str, Any]],
    ] = {}

    candidates_by_edge: dict[
        tuple[str, str],
        dict[str, Any],
    ] = {}

    for corridor_id, corridor_windows in (
        windows_by_corridor.items()
    ):

        corridor = None

        for key, value in corridors.items():

            if str(key) == corridor_id:

                corridor = value
                break

        if corridor is None:
            continue

        corridor_tasks = (
            tasks_by_corridor.get(
                corridor_id,
                [],
            )
        )

        corridor_trains = (
            trains_by_corridor.get(
                corridor_id,
                [],
            )
        )

        for window in corridor_windows:

            block_window_id = window.get(
                "block_window_id"
            )

            window_key = _window_key(
                block_window_id
            )

            window_date = str(
                window.get(
                    "date",
                    "",
                )
            ).strip()

            window_start = str(
                window.get(
                    "start_time",
                    "",
                )
            ).strip()

            window_end = str(
                window.get(
                    "end_time",
                    "",
                )
            ).strip()

            try:

                window_duration_hours = (
                    calculate_window_duration_hours(
                        window_start,
                        window_end,
                    )
                )

            except (
                TypeError,
                ValueError,
            ):

                continue

            if window_duration_hours <= 0:
                continue

            freight_volume = (
                freight_by_corridor_date.get(
                    (
                        corridor_id,
                        window_date,
                    ),
                    0.0,
                )
            )

            for task in corridor_tasks:

                raw_task_id = task.get(
                    "task_id"
                )

                if raw_task_id is None:
                    continue

                task_id = _task_key(
                    raw_task_id
                )

                if task_id in diagnostics_by_task:

                    diagnostic = (
                        diagnostics_by_task[
                            task_id
                        ]
                    )

                    if diagnostic[
                        "reason_code"
                    ] in {
                        CORRIDOR_NOT_FOUND,
                        ASSET_NOT_FOUND,
                        INVALID_TASK_DATA,
                        NO_APPROVED_COA_WINDOW,
                    }:

                        continue

                duration = task_duration.get(
                    task_id
                )

                if duration is None:
                    continue

                # ------------------------------------------------
                # Individual duration
                # ------------------------------------------------

                if duration > window_duration_hours:

                    diagnostic = (
                        diagnostics_by_task.get(
                            task_id
                        )
                    )

                    if diagnostic is None:

                        diagnostic = _diagnostic(
                            task,
                            task_to_group.get(
                                task_id,
                                -1,
                            ),
                            "",
                            "",
                        )

                        diagnostics_by_task[
                            task_id
                        ] = diagnostic

                    diagnostic[
                        "duration_rejected_windows"
                    ] += 1

                    continue

                # ------------------------------------------------
                # Individual feasibility
                # ------------------------------------------------

                try:

                    feasible = is_task_feasible(
                        task,
                        window,
                    )

                except Exception as exc:

                    raise RuntimeError(
                        "Scheduling constraint evaluation "
                        f"failed for task {task_id} and "
                        f"window {window_key}: {exc}"
                    ) from exc

                if not feasible:

                    diagnostic = (
                        diagnostics_by_task.get(
                            task_id
                        )
                    )

                    if diagnostic is None:

                        diagnostic = _diagnostic(
                            task,
                            task_to_group.get(
                                task_id,
                                -1,
                            ),
                            "",
                            "",
                        )

                        diagnostics_by_task[
                            task_id
                        ] = diagnostic

                    diagnostic[
                        "constraint_rejected_windows"
                    ] += 1

                    continue

                # ------------------------------------------------
                # Asset
                # ------------------------------------------------

                asset_id = task.get(
                    "asset_id"
                )

                asset = assets.get(
                    asset_id
                )

                if asset is None:

                    diagnostics_by_task[
                        task_id
                    ] = _diagnostic(
                        task,
                        task_to_group.get(
                            task_id,
                            -1,
                        ),
                        ASSET_NOT_FOUND,
                        "The task references an asset that does "
                        "not exist in asset master data.",
                    )

                    continue

                # ------------------------------------------------
                # Priority
                # ------------------------------------------------

                try:

                    priority_result = (
                        calculate_priority(
                            task=task,
                            asset=asset,
                            corridor=corridor,
                            trains=corridor_trains,
                            freight_volume=freight_volume,
                            window_start=window_start,
                            window_end=window_end,
                        )
                    )

                except Exception as exc:

                    raise RuntimeError(
                        "Priority calculation failed for "
                        f"task {task_id}, window {window_key}: "
                        f"{exc}"
                    ) from exc

                priority_score = _safe_float(
                    priority_result.get(
                        "priority_score"
                    )
                )

                traffic_score = _safe_float(
                    priority_result.get(
                        "traffic_score"
                    )
                )

                failure_risk = _safe_float(
                    priority_result.get(
                        "failure_risk"
                    )
                )

                if (
                    priority_score is None
                    or traffic_score is None
                    or failure_risk is None
                ):

                    raise ValueError(
                        "Priority engine returned invalid "
                        "priority_score, traffic_score, or "
                        f"failure_risk for task {task_id}."
                    )

                priority_score = max(
                    0.0,
                    min(
                        1.0,
                        priority_score,
                    ),
                )

                traffic_score = max(
                    0.0,
                    min(
                        1.0,
                        traffic_score,
                    ),
                )

                failure_risk = max(
                    0.0,
                    min(
                        1.0,
                        failure_risk,
                    ),
                )

                compatibility_group = (
                    task_to_group.get(
                        task_id,
                        -1,
                    )
                )

                degree = (
                    compatibility_degree.get(
                        task_id,
                        0,
                    )
                )

                candidate = {
                    "task_id": task_id,
                    "asset_id": asset_id,
                    "corridor_id": corridor_id,
                    "block_window_id": block_window_id,
                    "date": window_date,
                    "start_time": window_start,
                    "end_time": window_end,
                    "estimated_duration_hrs": round(
                        duration,
                        4,
                    ),
                    "available_window_hrs": round(
                        window_duration_hours,
                        4,
                    ),
                    "remaining_window_hrs": round(
                        window_duration_hours
                        - duration,
                        4,
                    ),
                    "priority_score": priority_score,
                    "traffic_load": traffic_score,
                    "failure_risk": failure_risk,
                    "compatibility_group": compatibility_group,
                    "compatibility_degree": degree,
                    "coordination_preference": False,
                    "priority_details": priority_result,
                }

                edge_key = (
                    task_id,
                    window_key,
                )

                if edge_key in candidates_by_edge:
                    continue

                candidates_by_edge[
                    edge_key
                ] = candidate

                candidates.append(
                    candidate
                )

                candidates_by_task.setdefault(
                    task_id,
                    [],
                ).append(
                    candidate
                )

                diagnostic = (
                    diagnostics_by_task.get(
                        task_id
                    )
                )

                if diagnostic is None:

                    diagnostics_by_task[
                        task_id
                    ] = _diagnostic(
                        task,
                        compatibility_group,
                        "",
                        "",
                        feasible_windows=1,
                    )

                else:

                    diagnostic[
                        "feasible_windows"
                    ] += 1

    # ========================================================
    # 10. BUILD COORDINATION GROUPS
    # ========================================================

    #
    # A compatibility component is only a pool of potentially
    # related tasks.
    #
    # We do NOT assume every task in the component is mutually
    # compatible.
    #
    # Example:
    #
    #       A ----- B ----- C
    #
    # A-B and B-C may be compatible while A-C is not.
    #
    # Step 11 performs the actual pairwise compatibility check.
    #

    coordination_groups: dict[
        int,
        list[str],
    ] = {}

    for group_id, component in enumerate(
        compatibility_components
    ):

        eligible_task_ids: list[
            str
        ] = []

        for raw_task_id in component:

            task_id = _task_key(
                raw_task_id
            )

            if task_id not in task_by_id:
                continue

            # Task must have at least one feasible candidate.
            task_candidates = (
                candidates_by_task.get(
                    task_id,
                    [],
                )
            )

            if not task_candidates:
                continue

            # Highest feasible priority determines
            # coordination eligibility.
            highest_priority = max(
                candidate[
                    "priority_score"
                ]
                for candidate
                in task_candidates
            )

            if (
                highest_priority
                >= _COORDINATION_PRIORITY_THRESHOLD
            ):

                eligible_task_ids.append(
                    task_id
                )

        if len(
            eligible_task_ids
        ) > 1:

            coordination_groups[
                group_id
            ] = eligible_task_ids

    # ========================================================
    # 11. BUILD BEST BUNDLE CANDIDATES
    # ========================================================

    #
    # For every compatibility group and every possible window,
    # find the highest-total-priority mutually compatible subset
    # that fits.
    #

    bundle_candidates: list[
        dict[str, Any]
    ] = []

    bundle_candidates_by_group: dict[
        int,
        list[dict[str, Any]],
    ] = {}

    for group_id, group_task_ids in (
        coordination_groups.items()
    ):

        if len(
            group_task_ids
        ) < 2:
            continue

        # ----------------------------------------------------
        # Explicit same-corridor protection.
        # ----------------------------------------------------

        group_corridors = {
            str(
                task_by_id[
                    task_id
                ].get(
                    "corridor_id"
                )
            )
            for task_id in group_task_ids
        }

        if len(
            group_corridors
        ) != 1:
            continue

        corridor_id = next(
            iter(group_corridors)
        )

        # ----------------------------------------------------
        # Find all windows available to at least one member.
        # ----------------------------------------------------

        possible_window_ids: set[
            str
        ] = set()

        for task_id in group_task_ids:

            for candidate in (
                candidates_by_task.get(
                    task_id,
                    [],
                )
            ):

                possible_window_ids.add(
                    _window_key(
                        candidate[
                            "block_window_id"
                        ]
                    )
                )

        # ----------------------------------------------------
        # Evaluate every possible window.
        # ----------------------------------------------------

        for window_id in sorted(
            possible_window_ids
        ):

            window = window_by_id.get(
                window_id
            )

            if window is None:
                continue

            try:

                window_duration = (
                    calculate_window_duration_hours(
                        window[
                            "start_time"
                        ],
                        window[
                            "end_time"
                        ],
                    )
                )

            except (
                TypeError,
                ValueError,
            ):

                continue

            if window_duration <= 0:
                continue

            # ------------------------------------------------
            # Find best mutually compatible subset.
            # ------------------------------------------------

            selected_candidates = (
                _find_best_compatible_subset(
                    task_ids=group_task_ids,
                    candidates_by_task=candidates_by_task,
                    graph=graph,
                    task_duration=task_duration,
                    window_id=window_id,
                    window_duration=window_duration,
                    priority_threshold=(
                        _COORDINATION_PRIORITY_THRESHOLD
                    ),
                )
            )

            if len(
                selected_candidates
            ) < 2:
                continue

            selected_task_ids = [
                candidate[
                    "task_id"
                ]
                for candidate
                in selected_candidates
            ]

            combined_duration = sum(
                task_duration[
                    task_id
                ]
                for task_id
                in selected_task_ids
            )

            total_priority = sum(
                candidate[
                    "priority_score"
                ]
                for candidate
                in selected_candidates
            )

            highest_priority = max(
                candidate[
                    "priority_score"
                ]
                for candidate
                in selected_candidates
            )

            total_failure_risk = sum(
                candidate[
                    "failure_risk"
                ]
                for candidate
                in selected_candidates
            )

            total_traffic = sum(
                candidate[
                    "traffic_load"
                ]
                for candidate
                in selected_candidates
            )

            bundle = {
                "group_id": group_id,
                "task_ids": selected_task_ids,
                "corridor_id": corridor_id,
                "block_window_id": window[
                    "block_window_id"
                ],
                "date": str(
                    window.get(
                        "date",
                        "",
                    )
                ).strip(),
                "start_time": str(
                    window.get(
                        "start_time",
                        "",
                    )
                ).strip(),
                "end_time": str(
                    window.get(
                        "end_time",
                        "",
                    )
                ).strip(),
                "combined_duration_hrs": round(
                    combined_duration,
                    4,
                ),
                "available_window_hrs": round(
                    window_duration,
                    4,
                ),
                "remaining_window_hrs": round(
                    window_duration
                    - combined_duration,
                    4,
                ),
                "total_priority": total_priority,
                "highest_priority": highest_priority,
                "total_failure_risk": total_failure_risk,
                "total_traffic": total_traffic,
                "candidates": selected_candidates,
            }

            bundle_candidates.append(
                bundle
            )

            bundle_candidates_by_group.setdefault(
                group_id,
                [],
            ).append(
                bundle
            )

    # ========================================================
    # 12. SELECT COORDINATED GROUPS
    # ========================================================

    #
    # A compatibility group can select at most one bundle.
    #
    # A COA window can be occupied by at most one bundle.
    #
    # Bundle weight = total priority of the selected subset.
    #
    # This is a priority-optimized bundle assignment stage.
    #

    bundle_graph = nx.Graph()

    for bundle in bundle_candidates:

        group_node = (
            f"bundle::{bundle['group_id']}"
        )

        window_node = (
            "window::"
            f"{_window_key(bundle['block_window_id'])}"
        )

        weight = _priority_weight(
            bundle[
                "total_priority"
            ]
        )

        bundle_graph.add_edge(
            group_node,
            window_node,
            weight=weight,
        )

    bundle_matching = (
        nx.algorithms.matching.max_weight_matching(
            bundle_graph,
            maxcardinality=False,
            weight="weight",
        )
    )

    selected_bundles: list[
        dict[str, Any]
    ] = []

    selected_bundle_groups: set[
        int
    ] = set()

    used_window_ids: set[
        str
    ] = set()

    for node_a, node_b in bundle_matching:

        if node_a.startswith(
            "bundle::"
        ):

            bundle_node = node_a
            window_node = node_b

        elif node_b.startswith(
            "bundle::"
        ):

            bundle_node = node_b
            window_node = node_a

        else:

            continue

        group_id = int(
            bundle_node[
                len("bundle::"):
            ]
        )

        window_id = window_node[
            len("window::"):
        ]

        selected = None

        for bundle in (
            bundle_candidates_by_group.get(
                group_id,
                [],
            )
        ):

            if (
                _window_key(
                    bundle[
                        "block_window_id"
                    ]
                )
                == window_id
            ):

                selected = bundle
                break

        if selected is None:
            continue

        selected_bundles.append(
            selected
        )

        selected_bundle_groups.add(
            group_id
        )

        used_window_ids.add(
            window_id
        )

    # ========================================================
    # 13. CONVERT SELECTED BUNDLES TO SCHEDULE
    # ========================================================

    scheduled: list[
        dict[str, Any]
    ] = []

    matched_task_ids: set[
        str
    ] = set()

    matched_window_ids: set[
        str
    ] = set()

    for bundle in selected_bundles:

        task_ids = bundle[
            "task_ids"
        ]

        for candidate in bundle[
            "candidates"
        ]:

            result = dict(
                candidate
            )

            # Every task reports the same remaining capacity
            # because the complete coordination subset shares
            # the same COA window.
            result[
                "remaining_window_hrs"
            ] = bundle[
                "remaining_window_hrs"
            ]

            result[
                "coordination_preference"
            ] = True

            result[
                "coordination"
            ] = {
                "enabled": True,
                "compatibility_group":
                    bundle[
                        "group_id"
                    ],
                "priority_threshold":
                    _COORDINATION_PRIORITY_THRESHOLD,
                "group_task_count":
                    len(task_ids),
                "group_task_ids":
                    list(task_ids),
                "combined_duration_hrs":
                    bundle[
                        "combined_duration_hrs"
                    ],
                "available_window_hrs":
                    bundle[
                        "available_window_hrs"
                    ],
                "remaining_window_hrs":
                    bundle[
                        "remaining_window_hrs"
                    ],
            }

            scheduled.append(
                result
            )

            matched_task_ids.add(
                candidate[
                    "task_id"
                ]
            )

        matched_window_ids.add(
            _window_key(
                bundle[
                    "block_window_id"
                ]
            )
        )

    # ========================================================
    # 14. INDIVIDUAL TASK MATCHING
    # ========================================================

    #
    # Tasks not selected into a coordination bundle continue
    # through individual scheduling.
    #
    # This includes:
    #
    #   - low-priority tasks
    #   - incompatible tasks
    #   - compatible tasks excluded from the best subset
    #   - compatible tasks whose group could not form a bundle
    #   - tasks with no common coordination window
    #

    individual_graph = nx.Graph()

    for candidate in candidates:

        task_id = candidate[
            "task_id"
        ]

        window_id = _window_key(
            candidate[
                "block_window_id"
            ]
        )

        if task_id in matched_task_ids:
            continue

        if window_id in matched_window_ids:
            continue

        task_node = (
            f"task::{task_id}"
        )

        window_node = (
            f"window::{window_id}"
        )

        weight = _priority_weight(
            candidate[
                "priority_score"
            ]
        )

        individual_graph.add_edge(
            task_node,
            window_node,
            weight=weight,
        )

    individual_matching = (
        nx.algorithms.matching.max_weight_matching(
            individual_graph,
            maxcardinality=False,
            weight="weight",
        )
    )

    for node_a, node_b in individual_matching:

        if node_a.startswith(
            "task::"
        ):

            task_node = node_a
            window_node = node_b

        elif node_b.startswith(
            "task::"
        ):

            task_node = node_b
            window_node = node_a

        else:

            continue

        task_id = task_node[
            len("task::"):
        ]

        window_id = window_node[
            len("window::"):
        ]

        if task_id in matched_task_ids:
            continue

        if window_id in matched_window_ids:
            continue

        candidate = candidates_by_edge.get(
            (
                task_id,
                window_id,
            )
        )

        if candidate is None:
            continue

        result = dict(
            candidate
        )

        result[
            "coordination_preference"
        ] = False

        scheduled.append(
            result
        )

        matched_task_ids.add(
            task_id
        )

        matched_window_ids.add(
            window_id
        )

    # ========================================================
    # 15. FINAL UNSCHEDULED DIAGNOSTICS
    # ========================================================

    unscheduled: list[
        dict[str, Any]
    ] = []

    for task_id, task in task_by_id.items():

        if task_id in matched_task_ids:
            continue

        diagnostic = (
            diagnostics_by_task.get(
                task_id
            )
        )

        task_candidates = (
            candidates_by_task.get(
                task_id,
                [],
            )
        )

        if task_candidates:

            existing = diagnostic

            diagnostic = _diagnostic(
                task,
                task_to_group.get(
                    task_id,
                    -1,
                ),
                WINDOW_ALREADY_ALLOCATED,
                "The task had feasible maintenance windows, "
                "but those windows were allocated to other "
                "tasks by the priority-optimized assignment.",
                feasible_windows=len(
                    task_candidates
                ),
                duration_rejected_windows=(
                    existing.get(
                        "duration_rejected_windows",
                        0,
                    )
                    if existing
                    else 0
                ),
                constraint_rejected_windows=(
                    existing.get(
                        "constraint_rejected_windows",
                        0,
                    )
                    if existing
                    else 0
                ),
            )

        elif diagnostic is None:

            diagnostic = _diagnostic(
                task,
                task_to_group.get(
                    task_id,
                    -1,
                ),
                NO_FEASIBLE_WINDOW,
                "No approved COA window satisfied the "
                "task's duration and scheduling constraints.",
            )

        else:

            diagnostic = (
                _finalize_unscheduled_reason(
                    diagnostic
                )
            )

        diagnostics_by_task[
            task_id
        ] = diagnostic

        unscheduled.append(
            diagnostic
        )

    # ========================================================
    # 16. FINAL DETERMINISTIC RANKING
    # ========================================================

    #
    # Coordination does NOT alter individual task priority.
    #
    # Example:
    #
    #   HIGH = 0.90
    #   LOW  = 0.70
    #
    # If both share a window:
    #
    #   HIGH appears first
    #   LOW  appears second
    #

    scheduled.sort(
        key=lambda candidate: (
            -candidate[
                "priority_score"
            ],
            -candidate[
                "failure_risk"
            ],
            -candidate[
                "traffic_load"
            ],
            -candidate[
                "compatibility_degree"
            ],
            str(
                candidate[
                    "date"
                ]
            ),
            candidate[
                "start_time"
            ],
            str(
                candidate[
                    "task_id"
                ]
            ),
        )
    )

    # ========================================================
    # 17. REASON COUNTS
    # ========================================================

    reason_counts: dict[
        str,
        int,
    ] = {}

    for diagnostic in unscheduled:

        reason_code = diagnostic[
            "reason_code"
        ]

        reason_counts[
            reason_code
        ] = (
            reason_counts.get(
                reason_code,
                0,
            )
            + 1
        )

    # ========================================================
    # 18. OBJECTIVE
    # ========================================================

    total_priority = sum(
        candidate[
            "priority_score"
        ]
        for candidate in scheduled
    )

    total_scaled_priority = sum(
        _priority_weight(
            candidate[
                "priority_score"
            ]
        )
        for candidate in scheduled
    )

    # ========================================================
    # 19. SUMMARY
    # ========================================================

    summary = {
        "total_tasks": len(
            tasks
        ),

        "scheduled_tasks": len(
            scheduled
        ),

        "unscheduled_tasks": len(
            unscheduled
        ),

        "total_coa_windows": len(
            coa_windows
        ),

        "approved_coa_windows": len(
            approved_windows
        ),

        "used_coa_windows": len(
            matched_window_ids
        ),

        "unused_approved_coa_windows": (
            len(
                approved_windows
            )
            - len(
                matched_window_ids
            )
        ),

        "compatibility_groups": len(
            compatibility_components
        ),

        "multi_task_compatibility_groups": sum(
            1
            for component
            in compatibility_components
            if len(component) > 1
        ),

        "coordinated_groups_scheduled": len(
            selected_bundles
        ),

        "coordinated_tasks_scheduled": sum(
            len(
                bundle[
                    "task_ids"
                ]
            )
            for bundle in selected_bundles
        ),

        "coordination_priority_threshold":
            _COORDINATION_PRIORITY_THRESHOLD,

        "reason_counts":
            reason_counts,

        "optimization": {
            "method":
                "priority_threshold_compatibility_subset_matching_plus_task_matching",

            "objective":
                "maximize_total_priority",

            "total_priority":
                round(
                    total_priority,
                    6,
                ),

            "total_scaled_priority":
                total_scaled_priority,

            "priority_scale":
                _PRIORITY_SCALE,

            "constraints": {
                "max_tasks_per_window":
                    "multiple_mutually_compatible_high_priority_tasks",

                "max_windows_per_task":
                    1,

                "combined_duration_required":
                    True,

                "coordination_priority_threshold":
                    _COORDINATION_PRIORITY_THRESHOLD,
            },
        },
    }

    # ========================================================
    # 20. RETURN
    # ========================================================

    if return_diagnostics:

        return {
            "scheduled": scheduled,
            "unscheduled": unscheduled,
            "summary": summary,
        }

    return scheduled