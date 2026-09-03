# app/core/ahp.py

import numpy as np


# ============================================================
# PRIORITY CRITERIA
# ============================================================

CRITERIA = [
    "severity",
    "overdue",
    "maintenance_age",
    "asset_criticality",
    "corridor_criticality",
    "failure_risk",
    "traffic",
]


# ============================================================
# AHP PAIRWISE COMPARISON MATRIX
# ============================================================
#
# Meaning:
#
#   1   = equally important
#   3   = moderately more important
#   5   = strongly more important
#   7   = very strongly more important
#   9   = extremely more important
#
# Intermediate values:
#   2, 4, 6, 8
#
# If criterion A is 5 times more important than B:
#
#       matrix[A][B] = 5
#       matrix[B][A] = 1/5
#
# ============================================================

PAIRWISE_MATRIX = np.array([
    # severity
    # overdue
    # maintenance
    # asset
    # corridor
    # risk
    # traffic

    [1,   3,   4,   3,   5,   2,   4],   # severity

    [1/3, 1,   2,   2,   3,   1/2, 2],   # overdue

    [1/4, 1/2, 1,   1/2, 2,   1/3, 2],   # maintenance_age

    [1/3, 1/2, 2,   1,   3,   1/2, 2],   # asset_criticality

    [1/5, 1/3, 1/2, 1/3, 1,   1/4, 1/2], # corridor_criticality

    [1/2, 2,   3,   2,   4,   1,   3],   # failure_risk

    [1/4, 1/2, 1/2, 1/2, 2,   1/3, 1],   # traffic
], dtype=float)


# ============================================================
# RANDOM INDEX
# ============================================================
#
# RI values used by Saaty's AHP consistency test.
#
# CR = CI / RI
#
# Acceptable:
#
#       CR < 0.10
#
# ============================================================

RANDOM_INDEX = {
    1: 0.00,
    2: 0.00,
    3: 0.58,
    4: 0.90,
    5: 1.12,
    6: 1.24,
    7: 1.32,
    8: 1.41,
    9: 1.45,
    10: 1.49,
}


# ============================================================
# VALIDATE MATRIX
# ============================================================

def validate_matrix(matrix: np.ndarray) -> None:
    """
    Validate the AHP pairwise comparison matrix.
    """

    n = len(CRITERIA)

    if matrix.shape != (n, n):
        raise ValueError(
            f"Matrix must be {n}x{n}"
        )

    # Diagonal must be 1
    for i in range(n):
        if not np.isclose(matrix[i][i], 1.0):
            raise ValueError(
                "Diagonal values must be 1."
            )

    # Matrix must satisfy reciprocal property:
    #
    # A[i][j] = 1 / A[j][i]
    #
    for i in range(n):
        for j in range(n):

            if matrix[i][j] <= 0:
                raise ValueError(
                    "All pairwise values must be > 0."
                )

            if not np.isclose(
                matrix[i][j],
                1.0 / matrix[j][i]
            ):
                raise ValueError(
                    f"Matrix is not reciprocal at "
                    f"({i}, {j})."
                )


# ============================================================
# CALCULATE AHP WEIGHTS
# ============================================================

def calculate_weights(
    matrix: np.ndarray = PAIRWISE_MATRIX
) -> tuple[np.ndarray, float, float]:
    """
    Calculate priority weights using the
    principal eigenvector method.

    Returns:

        weights
        lambda_max
        consistency_ratio
    """

    validate_matrix(matrix)

    # --------------------------------------------------------
    # 1. Eigenvalues and eigenvectors
    # --------------------------------------------------------

    eigenvalues, eigenvectors = np.linalg.eig(
        matrix
    )

    # --------------------------------------------------------
    # 2. Principal eigenvalue
    # --------------------------------------------------------

    max_index = np.argmax(
        eigenvalues.real
    )

    lambda_max = eigenvalues[
        max_index
    ].real

    # --------------------------------------------------------
    # 3. Corresponding eigenvector
    # --------------------------------------------------------

    principal_vector = eigenvectors[
        :, max_index
    ].real

    # Eigenvectors can have negative sign.
    principal_vector = np.abs(
        principal_vector
    )

    # --------------------------------------------------------
    # 4. Normalize eigenvector
    # --------------------------------------------------------

    weights = (
        principal_vector
        / principal_vector.sum()
    )

    # --------------------------------------------------------
    # 5. Consistency Index
    # --------------------------------------------------------

    n = len(CRITERIA)

    consistency_index = (
        lambda_max - n
    ) / (n - 1)

    # --------------------------------------------------------
    # 6. Consistency Ratio
    # --------------------------------------------------------

    random_index = RANDOM_INDEX[n]

    if random_index == 0:
        consistency_ratio = 0.0
    else:
        consistency_ratio = (
            consistency_index
            / random_index
        )

    return (
        weights,
        lambda_max,
        consistency_ratio
    )


# ============================================================
# GENERATE PRIORITY WEIGHTS
# ============================================================

def generate_priority_weights() -> dict[str, float]:
    """
    Generate a dictionary that can directly
    be imported by priority.py.
    """

    (
        weights,
        lambda_max,
        consistency_ratio
    ) = calculate_weights()

    if consistency_ratio >= 0.10:
        raise ValueError(
            "AHP matrix is inconsistent. "
            f"Consistency Ratio = "
            f"{consistency_ratio:.4f}"
        )

    return {
        criterion: float(weight)
        for criterion, weight
        in zip(CRITERIA, weights)
    }


# ============================================================
# CALCULATE ONCE
# ============================================================

PRIORITY_WEIGHTS = generate_priority_weights()


# ============================================================
# OPTIONAL: PRINT AHP REPORT
# ============================================================

def print_ahp_report() -> None:

    (
        weights,
        lambda_max,
        consistency_ratio
    ) = calculate_weights()

    consistency_index = (
        lambda_max - len(CRITERIA)
    ) / (len(CRITERIA) - 1)

    print("=" * 60)
    print("AHP PRIORITY WEIGHTS")
    print("=" * 60)

    for criterion, weight in zip(
        CRITERIA,
        weights
    ):
        print(
            f"{criterion:<25}"
            f"{weight:.4f}"
        )

    print()
    print(
        f"Lambda max           : "
        f"{lambda_max:.4f}"
    )

    print(
        f"Consistency Index    : "
        f"{consistency_index:.4f}"
    )

    print(
        f"Consistency Ratio    : "
        f"{consistency_ratio:.4f}"
    )

    print()

    if consistency_ratio < 0.10:
        print("STATUS: CONSISTENT")
    else:
        print("STATUS: INCONSISTENT")


# ============================================================
# RUN DIRECTLY
# ============================================================

if __name__ == "__main__":
    print_ahp_report()