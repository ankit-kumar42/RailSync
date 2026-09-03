import pandas as pd

from app.core.compatibility import (
    calculate_compatibility
)

from app.core.graph import (
    build_graph,
    get_connected_components
)


# ---------------------------------------------------------
# Load TMS dataset
# ---------------------------------------------------------

df = pd.read_csv(
    "ml/notebooks/01_tms_track_maintenance.csv"
)

tasks = df.to_dict(
    orient="records"
)


print("=" * 60)
print("TMS COMPATIBILITY TEST")
print("=" * 60)

print(
    "Number of tasks:",
    len(tasks)
)


# ---------------------------------------------------------
# Test two tasks
# ---------------------------------------------------------

task_a = tasks[0]
task_b = tasks[1]


print("\n" + "=" * 60)
print("TASK A")
print("=" * 60)

print(task_a)


print("\n" + "=" * 60)
print("TASK B")
print("=" * 60)

print(task_b)


# ---------------------------------------------------------
# Compatibility
# ---------------------------------------------------------

result = calculate_compatibility(
    task_a,
    task_b
)


print("\n" + "=" * 60)
print("COMPATIBILITY")
print("=" * 60)

for key, value in result.items():

    print(
        f"{key}: {value}"
    )


# ---------------------------------------------------------
# Build graph
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("BUILDING GRAPH")
print("=" * 60)


graph, scores = build_graph(
    tasks
)


print(
    "Nodes:",
    graph.number_of_nodes()
)

print(
    "Edges:",
    graph.number_of_edges()
)


# ---------------------------------------------------------
# Connected components
# ---------------------------------------------------------

components = get_connected_components(
    graph
)


print("\n" + "=" * 60)
print("CONNECTED COMPONENTS")
print("=" * 60)

print(
    "Number of groups:",
    len(components)
)


# Only show groups containing multiple tasks
multi_task_groups = [
    group
    for group in components
    if len(group) > 1
]


print(
    "Multi-task groups:",
    len(multi_task_groups)
)


for i, group in enumerate(
    multi_task_groups[:20],
    start=1
):

    print(
        f"Group {i}: {group}"
    )