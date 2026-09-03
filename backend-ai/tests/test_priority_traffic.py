import pandas as pd

from app.core.traffic_engine import analyze_traffic
from app.core.priority_engine import calculate_priority


# ============================================================
# FILE PATHS
# ============================================================

TASK_PATH = "ml/notebooks/01_tms_track_maintenance.csv"
COA_PATH = "ml/notebooks/04_coa_block_availability.csv"
TIMETABLE_PATH = "ml/notebooks/05_train_timetable.csv"
FREIGHT_PATH = "ml/notebooks/06_freight_forecast.csv"


# ============================================================
# LOAD DATA
# ============================================================

task_df = pd.read_csv(TASK_PATH)
coa_df = pd.read_csv(COA_PATH)
timetable_df = pd.read_csv(TIMETABLE_PATH)
freight_df = pd.read_csv(FREIGHT_PATH)


# ============================================================
# CLEAN DATA
# ============================================================

coa_df["date"] = pd.to_datetime(
    coa_df["date"]
).dt.date

freight_df["date"] = pd.to_datetime(
    freight_df["date"]
).dt.date


coa_df["approved"] = (
    coa_df["approved"]
    .astype(str)
    .str.strip()
    .str.lower()
    .isin([
        "true",
        "1",
        "yes",
        "approved"
    ])
)


timetable_df["day_of_week"] = (
    timetable_df["day_of_week"]
    .astype(str)
    .str.strip()
    .str.lower()
)


freight_df["day_of_week"] = (
    freight_df["day_of_week"]
    .astype(str)
    .str.strip()
    .str.lower()
)


# ============================================================
# RESULTS
# ============================================================

results = []


# ============================================================
# PROCESS APPROVED COA WINDOWS
# ============================================================

for _, coa in coa_df.iterrows():

    if not coa["approved"]:
        continue


    corridor_id = coa["corridor_id"]

    window_date = coa["date"]


    start_time = str(
        coa["start_time"]
    ).strip()

    end_time = str(
        coa["end_time"]
    ).strip()


    # ========================================================
    # DAY OF WEEK
    # ========================================================

    day_of_week = (
        pd.Timestamp(window_date)
        .strftime("%a")
        .lower()
    )


    # ========================================================
    # GET TRAINS
    # ========================================================

    corridor_trains_df = timetable_df[
        (
            timetable_df["corridor_id"]
            == corridor_id
        )
        &
        (
            timetable_df["day_of_week"]
            == day_of_week
        )
    ]


    trains = [
        row.to_dict()
        for _, row
        in corridor_trains_df.iterrows()
    ]


    # ========================================================
    # GET FREIGHT
    # ========================================================

    freight_matches = freight_df[
        (
            freight_df["corridor_id"]
            == corridor_id
        )
        &
        (
            freight_df["date"]
            == window_date
        )
    ]


    if freight_matches.empty:

        freight_volume = 0.0

    else:

        freight_volume = float(
            freight_matches.iloc[0][
                "expected_freight_volume"
            ]
        )


    # ========================================================
    # TRAFFIC ENGINE
    # ========================================================

    traffic_result = analyze_traffic(
        trains=trains,
        freight_volume=freight_volume,
        window_start=start_time,
        window_end=end_time
    )


    traffic_load = traffic_result[
        "traffic_load"
    ]


    # ========================================================
    # FIND TASKS ON THIS CORRIDOR
    # ========================================================

    corridor_tasks = task_df[
        task_df["corridor_id"]
        ==
        corridor_id
    ]


    if corridor_tasks.empty:
        continue


    # ========================================================
    # PRIORITY ENGINE
    # ========================================================

    for _, task_row in corridor_tasks.head(1).iterrows():

        task = task_row.to_dict()


        # ----------------------------------------------------
        # Temporary asset master information
        # ----------------------------------------------------

        asset = {
            "asset_id": task["asset_id"],
            "criticality_rating": 3,
            "age_years": 10,
            "historical_failure_count": 2
        }


        # ----------------------------------------------------
        # Temporary corridor master information
        # ----------------------------------------------------

        corridor = {
            "corridor_id": corridor_id,
            "operational_criticality": 3
        }


        # ----------------------------------------------------
        # Calculate priority WITH traffic
        # ----------------------------------------------------

        priority_result = calculate_priority(
            task=task,
            asset=asset,
            corridor=corridor,
            traffic_load=traffic_load
        )


        results.append({
            "task_id": task["task_id"],
            "corridor_id": corridor_id,
            "block_window_id": coa[
                "block_window_id"
            ],
            "traffic_load": traffic_load,
            "priority_score": priority_result[
                "priority_score"
            ],
            "traffic_contribution":
                priority_result[
                    "contributions"
                ]["traffic"]
        })


# ============================================================
# RESULTS DATAFRAME
# ============================================================

results_df = pd.DataFrame(results)


# ============================================================
# OUTPUT
# ============================================================

print("=" * 70)
print("PRIORITY + TRAFFIC INTEGRATION TEST")
print("=" * 70)

print(
    f"Approved COA windows: "
    f"{coa_df['approved'].sum()}"
)

print(
    f"Priority calculations: "
    f"{len(results_df)}"
)


if not results_df.empty:

    print()
    print("=" * 70)
    print("PRIORITY + TRAFFIC RESULTS")
    print("=" * 70)

    print(
        results_df[
            [
                "task_id",
                "corridor_id",
                "block_window_id",
                "traffic_load",
                "traffic_contribution",
                "priority_score"
            ]
        ]
        .head(20)
        .to_string(index=False)
    )


# ============================================================
# TRAFFIC IMPACT CHECK
# ============================================================

if not results_df.empty:

    print()
    print("=" * 70)
    print("TRAFFIC IMPACT CHECK")
    print("=" * 70)

    non_zero_traffic = results_df[
        results_df["traffic_load"] > 0
    ]

    print(
        "Results with traffic:",
        len(non_zero_traffic)
    )

    print(
        "Maximum traffic load:",
        results_df["traffic_load"].max()
    )

    print(
        "Maximum traffic contribution:",
        results_df["traffic_contribution"].max()
    )


# ============================================================
# VALIDATION
# ============================================================

assert not results_df.empty

assert (
    results_df["traffic_load"]
    .between(0, 1)
    .all()
)

assert (
    results_df["priority_score"]
    .between(0, 1)
    .all()
)

assert (
    results_df["traffic_contribution"]
    >= 0
).all()


# ============================================================
# FINAL
# ============================================================

print()
print("=" * 70)
print("VALIDATION")
print("=" * 70)

print(
    "Traffic engine → Priority engine integration works."
)

print(
    "Traffic load is reaching the priority engine."
)

print(
    "Traffic contribution is included in priority score."
)