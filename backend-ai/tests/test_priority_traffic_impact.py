from datetime import date

from app.core.priority_engine import calculate_priority


# ============================================================
# TEST DATA
# ============================================================

TASK = {
    "task_id": "TEST_TRAFFIC_001",
    "severity": "High",
    "overdue_days": 30,
    "last_maintenance_date": "2026-01-01"
}


ASSET = {
    "asset_id": "TEST_ASSET_001",
    "criticality_rating": 3,
    "age_years": 10,
    "historical_failure_count": 2
}


CORRIDOR = {
    "corridor_id": "TEST_CORRIDOR_001",
    "operational_criticality": 3
}


# ============================================================
# TEST TRAINS
# ============================================================

# No train overlaps the maintenance window.
NO_TRAFFIC_TRAINS = [
    {
        "train_id": "TRAIN_001",
        "departure_time": "08:00",
        "arrival_time": "09:00",
        "train_type": "passenger"
    }
]


# One passenger train overlaps the maintenance window.
PASSENGER_TRAFFIC_TRAINS = [
    {
        "train_id": "TRAIN_001",
        "departure_time": "10:30",
        "arrival_time": "11:30",
        "train_type": "passenger"
    }
]


# Multiple express trains overlap the maintenance window.
HIGH_TRAFFIC_TRAINS = [
    {
        "train_id": "TRAIN_001",
        "departure_time": "10:00",
        "arrival_time": "11:30",
        "train_type": "express"
    },
    {
        "train_id": "TRAIN_002",
        "departure_time": "10:15",
        "arrival_time": "11:45",
        "train_type": "express"
    },
    {
        "train_id": "TRAIN_003",
        "departure_time": "10:30",
        "arrival_time": "12:00",
        "train_type": "express"
    },
    {
        "train_id": "TRAIN_004",
        "departure_time": "10:45",
        "arrival_time": "12:15",
        "train_type": "express"
    },
    {
        "train_id": "TRAIN_005",
        "departure_time": "11:00",
        "arrival_time": "12:30",
        "train_type": "express"
    }
]


# ============================================================
# MAINTENANCE WINDOW
# ============================================================

WINDOW_START = "10:00"
WINDOW_END = "12:00"

TEST_DATE = date(2026, 8, 27)


# ============================================================
# HELPER
# ============================================================

def run_priority(
    trains,
    freight_volume=0.0
):
    """
    Run Priority Engine with controlled traffic input.
    """

    return calculate_priority(
        task=TASK,
        asset=ASSET,
        corridor=CORRIDOR,

        trains=trains,

        freight_volume=freight_volume,

        window_start=WINDOW_START,
        window_end=WINDOW_END,

        today=TEST_DATE
    )


# ============================================================
# TEST 1
# NO TRAFFIC
# ============================================================

no_traffic_result = run_priority(
    trains=NO_TRAFFIC_TRAINS,
    freight_volume=0.0
)


# ============================================================
# TEST 2
# NORMAL TRAFFIC
# ============================================================

normal_traffic_result = run_priority(
    trains=PASSENGER_TRAFFIC_TRAINS,
    freight_volume=0.0
)


# ============================================================
# TEST 3
# HIGH TRAFFIC
# ============================================================

high_traffic_result = run_priority(
    trains=HIGH_TRAFFIC_TRAINS,
    freight_volume=0.0
)


# ============================================================
# DISPLAY RESULTS
# ============================================================

print("=" * 70)
print("PRIORITY TRAFFIC IMPACT TEST")
print("=" * 70)


print()
print("-" * 70)
print("NO TRAFFIC")
print("-" * 70)

print(
    "Traffic load:",
    no_traffic_result["traffic"]["traffic_load"]
)

print(
    "Train count:",
    no_traffic_result["traffic"]["train_count"]
)

print(
    "Traffic contribution:",
    no_traffic_result[
        "contributions"
    ]["traffic"]
)

print(
    "Priority score:",
    no_traffic_result["priority_score"]
)


print()
print("-" * 70)
print("NORMAL TRAFFIC")
print("-" * 70)

print(
    "Traffic load:",
    normal_traffic_result["traffic"]["traffic_load"]
)

print(
    "Train count:",
    normal_traffic_result["traffic"]["train_count"]
)

print(
    "Train impact:",
    normal_traffic_result["traffic"]["train_impact"]
)

print(
    "Traffic contribution:",
    normal_traffic_result[
        "contributions"
    ]["traffic"]
)

print(
    "Priority score:",
    normal_traffic_result["priority_score"]
)


print()
print("-" * 70)
print("HIGH TRAFFIC")
print("-" * 70)

print(
    "Traffic load:",
    high_traffic_result["traffic"]["traffic_load"]
)

print(
    "Train count:",
    high_traffic_result["traffic"]["train_count"]
)

print(
    "Train impact:",
    high_traffic_result["traffic"]["train_impact"]
)

print(
    "Traffic contribution:",
    high_traffic_result[
        "contributions"
    ]["traffic"]
)

print(
    "Priority score:",
    high_traffic_result["priority_score"]
)


# ============================================================
# VALIDATION
# ============================================================

print()
print("=" * 70)
print("VALIDATION")
print("=" * 70)


# ------------------------------------------------------------
# 1. No traffic should produce zero traffic load
# ------------------------------------------------------------

assert (
    no_traffic_result["traffic"]["traffic_load"]
    == 0.0
), (
    "Expected zero traffic load for the no-traffic scenario."
)


# ------------------------------------------------------------
# 2. No traffic should produce zero traffic contribution
# ------------------------------------------------------------

assert (
    no_traffic_result[
        "contributions"
    ]["traffic"]
    == 0.0
), (
    "Traffic contribution should be zero "
    "when traffic load is zero."
)


# ------------------------------------------------------------
# 3. Normal traffic must be detected
# ------------------------------------------------------------

assert (
    normal_traffic_result[
        "traffic"
    ]["train_count"]
    > 0
), (
    "Traffic Engine failed to detect "
    "the overlapping train."
)


# ------------------------------------------------------------
# 4. Normal traffic must produce non-zero load
# ------------------------------------------------------------

assert (
    normal_traffic_result[
        "traffic"
    ]["traffic_load"]
    > 0
), (
    "Traffic load should be greater than zero "
    "when a train overlaps the maintenance window."
)


# ------------------------------------------------------------
# 5. Normal traffic must contribute to priority
# ------------------------------------------------------------

assert (
    normal_traffic_result[
        "contributions"
    ]["traffic"]
    > 0
), (
    "Traffic contribution should be greater than zero "
    "when traffic exists."
)


# ------------------------------------------------------------
# 6. Traffic should increase priority
# ------------------------------------------------------------

assert (
    normal_traffic_result["priority_score"]
    >
    no_traffic_result["priority_score"]
), (
    "Priority score did not increase "
    "when traffic was introduced."
)


# ------------------------------------------------------------
# 7. Higher traffic should produce higher traffic load
# ------------------------------------------------------------

assert (
    high_traffic_result[
        "traffic"
    ]["traffic_load"]
    >
    normal_traffic_result[
        "traffic"
    ]["traffic_load"]
), (
    "Higher traffic scenario did not produce "
    "a higher traffic load."
)


# ------------------------------------------------------------
# 8. Higher traffic should produce higher contribution
# ------------------------------------------------------------

assert (
    high_traffic_result[
        "contributions"
    ]["traffic"]
    >
    normal_traffic_result[
        "contributions"
    ]["traffic"]
), (
    "Higher traffic did not produce "
    "a higher traffic contribution."
)


# ------------------------------------------------------------
# 9. Higher traffic should produce higher priority
# ------------------------------------------------------------

assert (
    high_traffic_result["priority_score"]
    >
    normal_traffic_result["priority_score"]
), (
    "Higher traffic did not increase "
    "the final priority score."
)


# ------------------------------------------------------------
# 10. Priority scores must remain normalized
# ------------------------------------------------------------

assert (
    0.0
    <= no_traffic_result["priority_score"]
    <= 1.0
)

assert (
    0.0
    <= normal_traffic_result["priority_score"]
    <= 1.0
)

assert (
    0.0
    <= high_traffic_result["priority_score"]
    <= 1.0
)


# ------------------------------------------------------------
# 11. Traffic loads must remain normalized
# ------------------------------------------------------------

assert (
    0.0
    <= no_traffic_result[
        "traffic"
    ]["traffic_load"]
    <= 1.0
)

assert (
    0.0
    <= normal_traffic_result[
        "traffic"
    ]["traffic_load"]
    <= 1.0
)

assert (
    0.0
    <= high_traffic_result[
        "traffic"
    ]["traffic_load"]
    <= 1.0
)


# ============================================================
# FINAL
# ============================================================

print()
print("✓ No traffic produces zero traffic contribution.")
print("✓ Traffic Engine detects overlapping trains.")
print("✓ Traffic produces a non-zero traffic load.")
print("✓ Traffic contributes to priority.")
print("✓ Introducing traffic increases priority.")
print("✓ Higher traffic produces higher traffic load.")
print("✓ Higher traffic produces higher traffic contribution.")
print("✓ Higher traffic produces higher priority.")
print("✓ Priority scores remain within [0, 1].")
print("✓ Traffic loads remain within [0, 1].")

print()
print("=" * 70)
print("TRAFFIC IMPACT VALIDATION PASSED")
print("=" * 70)