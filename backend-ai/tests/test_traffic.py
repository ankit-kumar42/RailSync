import pandas as pd

from app.core.traffic_engine import (
    analyze_traffic
)


# ============================================================
# FILE PATHS
# ============================================================

COA_PATH = "ml/notebooks/04_coa_block_availability.csv"
TIMETABLE_PATH = "ml/notebooks/05_train_timetable.csv"
FREIGHT_PATH = "ml/notebooks/06_freight_forecast.csv"


# ============================================================
# LOAD DATA
# ============================================================

coa_df = pd.read_csv(COA_PATH)
timetable_df = pd.read_csv(TIMETABLE_PATH)
freight_df = pd.read_csv(FREIGHT_PATH)


# ============================================================
# CLEAN COLUMN VALUES
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
# DATA SYNCHRONIZATION DIAGNOSTICS
# ============================================================

print("=" * 70)
print("DATA SYNCHRONIZATION CHECK")
print("=" * 70)

# ------------------------------------------------------------
# Number of unique corridors
# ------------------------------------------------------------

print(
    f"COA corridors: "
    f"{coa_df['corridor_id'].nunique()}"
)

print(
    f"Timetable corridors: "
    f"{timetable_df['corridor_id'].nunique()}"
)

print(
    f"Freight corridors: "
    f"{freight_df['corridor_id'].nunique()}"
)

print()


# ------------------------------------------------------------
# Corridor overlap
# ------------------------------------------------------------

coa_corridors = set(
    coa_df["corridor_id"]
)

timetable_corridors = set(
    timetable_df["corridor_id"]
)

freight_corridors = set(
    freight_df["corridor_id"]
)


coa_timetable_overlap = (
    coa_corridors
    &
    timetable_corridors
)

coa_freight_overlap = (
    coa_corridors
    &
    freight_corridors
)


print(
    "COA ∩ Timetable:",
    len(coa_timetable_overlap)
)

print(
    "COA ∩ Freight:",
    len(coa_freight_overlap)
)

print()


# ------------------------------------------------------------
# Sample corridor IDs
# ------------------------------------------------------------

print("Sample COA corridors:")
print(
    sorted(coa_corridors)[:10]
)

print()

print("Sample Timetable corridors:")
print(
    sorted(timetable_corridors)[:10]
)

print()

print("Sample Freight corridors:")
print(
    sorted(freight_corridors)[:10]
)

print()


# ------------------------------------------------------------
# Missing corridor IDs
# ------------------------------------------------------------

missing_timetable_corridors = (
    coa_corridors
    -
    timetable_corridors
)

missing_freight_corridors = (
    coa_corridors
    -
    freight_corridors
)


print(
    "COA corridors missing from Timetable:",
    len(missing_timetable_corridors)
)

if missing_timetable_corridors:
    print(
        sorted(missing_timetable_corridors)[:20]
    )

print()


print(
    "COA corridors missing from Freight:",
    len(missing_freight_corridors)
)

if missing_freight_corridors:
    print(
        sorted(missing_freight_corridors)[:20]
    )

print()


# ------------------------------------------------------------
# Day-of-week distribution
# ------------------------------------------------------------

print("=" * 70)
print("DAY-OF-WEEK CHECK")
print("=" * 70)

coa_days = (
    coa_df["date"]
    .apply(
        lambda x:
        pd.Timestamp(x)
        .day_name()
        .lower()
    )
)

print("COA days:")
print(
    coa_days.value_counts()
)

print()

print("Timetable days:")
print(
    timetable_df["day_of_week"]
    .value_counts()
)

print()

print("Freight days:")
print(
    freight_df["day_of_week"]
    .value_counts()
)

print()


# ------------------------------------------------------------
# Date ranges
# ------------------------------------------------------------

print("=" * 70)
print("DATE RANGE CHECK")
print("=" * 70)

print("COA date range:")
print(
    coa_df["date"].min(),
    "to",
    coa_df["date"].max()
)

print()

print("Freight date range:")
print(
    freight_df["date"].min(),
    "to",
    freight_df["date"].max()
)

print()


# ============================================================
# TEST RESULTS
# ============================================================

results = []


# ============================================================
# PROCESS EACH APPROVED COA WINDOW
# ============================================================

for _, coa in coa_df.iterrows():

    # --------------------------------------------------------
    # Ignore unavailable maintenance windows
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # Determine day of week
    # --------------------------------------------------------

    day_of_week = (
        pd.Timestamp(window_date)
        .strftime("%a")
        .lower()
    )

    # --------------------------------------------------------
    # Get timetable for this corridor + day
    # --------------------------------------------------------

    corridor_trains_df = timetable_df[
        (
            timetable_df["corridor_id"]
            ==
            corridor_id
        )
        &
        (
            timetable_df["day_of_week"]
            ==
            day_of_week
        )
    ]


    trains = [
        row.to_dict()
        for _, row
        in corridor_trains_df.iterrows()
    ]


    # --------------------------------------------------------
    # Get freight forecast
    # --------------------------------------------------------

    freight_matches = freight_df[
        (
            freight_df["corridor_id"]
            ==
            corridor_id
        )
        &
        (
            freight_df["date"]
            ==
            window_date
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


    # --------------------------------------------------------
    # Analyze traffic
    # --------------------------------------------------------

    traffic_result = analyze_traffic(
        trains=trains,
        freight_volume=freight_volume,
        window_start=start_time,
        window_end=end_time
    )


    # --------------------------------------------------------
    # Add identifying information
    # --------------------------------------------------------

    traffic_result["corridor_id"] = (
        corridor_id
    )

    traffic_result["date"] = str(
        window_date
    )

    traffic_result["block_window_id"] = (
        coa["block_window_id"]
    )


    results.append(
        traffic_result
    )


# ============================================================
# RESULTS DATAFRAME
# ============================================================

results_df = pd.DataFrame(
    results
)


# ============================================================
# OUTPUT
# ============================================================

print("=" * 70)
print("TRAFFIC ENGINE TEST")
print("=" * 70)

print(
    f"Total COA windows: "
    f"{len(coa_df)}"
)

print(
    f"Approved windows: "
    f"{coa_df['approved'].sum()}"
)

print(
    f"Traffic calculations: "
    f"{len(results_df)}"
)

print()


# ============================================================
# DISPLAY RESULTS
# ============================================================

if not results_df.empty:

    print("=" * 70)
    print("TRAFFIC ANALYSIS - FIRST 20 WINDOWS")
    print("=" * 70)

    print(
        results_df[
            [
                "corridor_id",
                "date",
                "block_window_id",
                "train_count",
                "train_impact",
                "freight_volume",
                "freight_impact",
                "traffic_load"
            ]
        ]
        .head(20)
        .to_string(index=False)
    )

    # --------------------------------------------------------
    # Show windows where trains were actually found
    # --------------------------------------------------------

    train_results = results_df[
        results_df["train_count"] > 0
    ]

    print()
    print("=" * 70)
    print("WINDOWS WITH TRAINS")
    print("=" * 70)

    if train_results.empty:

        print(
            "WARNING: No COA maintenance window "
            "has overlapping timetable trains."
        )

    else:

        print(
            train_results[
                [
                    "corridor_id",
                    "date",
                    "block_window_id",
                    "train_count",
                    "train_impact",
                    "traffic_load"
                ]
            ]
            .head(20)
            .to_string(index=False)
        )

    # --------------------------------------------------------
    # Show windows with freight
    # --------------------------------------------------------

    freight_results = results_df[
        results_df["freight_volume"] > 0
    ]

    print()
    print("=" * 70)
    print("WINDOWS WITH FREIGHT")
    print("=" * 70)

    if freight_results.empty:

        print(
            "WARNING: No COA maintenance window "
            "has freight forecast data."
        )

    else:

        print(
            freight_results[
                [
                    "corridor_id",
                    "date",
                    "block_window_id",
                    "freight_volume",
                    "freight_impact",
                    "traffic_load"
                ]
            ]
            .head(20)
            .to_string(index=False)
        )

    # --------------------------------------------------------
    # Show highest traffic windows
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("HIGHEST TRAFFIC WINDOWS")
    print("=" * 70)

    print(
        results_df[
            [
                "corridor_id",
                "date",
                "block_window_id",
                "train_count",
                "train_impact",
                "freight_volume",
                "freight_impact",
                "traffic_load"
            ]
        ]
        .sort_values(
            "traffic_load",
            ascending=False
        )
        .head(20)
        .to_string(index=False)
    )

# ============================================================
# TRAFFIC DISTRIBUTION
# ============================================================

if not results_df.empty:

    print()
    print("=" * 70)
    print("TRAFFIC DISTRIBUTION")
    print("=" * 70)

    print(
        "Windows with trains:",
        (
            results_df["train_count"] > 0
        ).sum()
    )

    print(
        "Windows with freight:",
        (
            results_df["freight_volume"] > 0
        ).sum()
    )

    print(
        "Windows with non-zero traffic:",
        (
            results_df["traffic_load"] > 0
        ).sum()
    )

    print(
        "Maximum traffic load:",
        results_df["traffic_load"].max()
    )

    print(
        "Average traffic load:",
        round(
            results_df["traffic_load"].mean(),
            4
        )
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
    results_df["train_impact"]
    .between(0, 1)
    .all()
)


assert (
    results_df["freight_impact"]
    .between(0, 1)
    .all()
)


# ============================================================
# FINAL
# ============================================================

print()
print("=" * 70)
print("VALIDATION")
print("=" * 70)

print(
    "All traffic loads are between 0 and 1."
)

print(
    "All train-impact values are between 0 and 1."
)

print(
    "All freight-impact values are between 0 and 1."
)

print(
    "Traffic engine integration is working."
)