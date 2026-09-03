import networkx as nx

from app.core.compatibility import (
    calculate_compatibility,
    COMPATIBILITY_THRESHOLD
)


def build_graph(tasks):
    """
    Build a compatibility graph.

    Node:
        one TMS task

    Edge:
        two tasks are compatible enough
        to potentially be coordinated.
    """

    graph = nx.Graph()

    # -----------------------------------------------------
    # Add all tasks as nodes
    # -----------------------------------------------------

    for task in tasks:

        task_id = task["task_id"]

        graph.add_node(
            task_id,
            task=task
        )

    scores = {}

    # -----------------------------------------------------
    # Compare every pair of tasks
    # -----------------------------------------------------

    for i in range(len(tasks)):

        for j in range(i + 1, len(tasks)):

            task_a = tasks[i]
            task_b = tasks[j]

            result = calculate_compatibility(
                task_a,
                task_b
            )

            pair = (
                task_a["task_id"],
                task_b["task_id"]
            )

            scores[pair] = result

            # Add edge only when compatible
            if result["compatible"]:

                graph.add_edge(
                    task_a["task_id"],
                    task_b["task_id"],

                    compatibility_score=
                        result["compatibility_score"],

                    location_score=
                        result["location_score"],

                    location_distance_km=
                        result["location_distance_km"],

                    deadline_compatibility=
                        result["deadline_compatibility"],

                    defect_compatibility=
                        result["defect_compatibility"],

                    duration_compatibility=
                        result["duration_compatibility"]
                )

    return graph, scores


def get_connected_components(graph):
    """
    Find candidate coordination groups.

    Each connected component is a group of tasks
    that are connected through compatibility edges.
    """

    components = nx.connected_components(graph)

    return [
        list(component)
        for component in components
    ]