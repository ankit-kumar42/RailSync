// ============================================================
// RISK SERVICE
// Backend-AI Risk Prediction API
//
// Backend-AI:
// POST http://127.0.0.1:8000/risk/predict
//
// Required query parameters:
//   age_years
//   days_since_last_maintenance
//   overdue_days
//   prior_failure_count
//   traffic_load
// ============================================================

const RISK_API_BASE_URL =
  import.meta.env.VITE_AI_API_URL || "http://127.0.0.1:8000";

// ============================================================
// PREDICT ASSET FAILURE RISK
// ============================================================

export async function predictRisk({
  age_years,
  days_since_last_maintenance,
  overdue_days,
  prior_failure_count,
  traffic_load,
}) {
  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (age_years === undefined || age_years === null || age_years === "") {
    throw new Error("age_years is required.");
  }

  if (
    days_since_last_maintenance === undefined ||
    days_since_last_maintenance === null ||
    days_since_last_maintenance === ""
  ) {
    throw new Error("days_since_last_maintenance is required.");
  }

  if (
    overdue_days === undefined ||
    overdue_days === null ||
    overdue_days === ""
  ) {
    throw new Error("overdue_days is required.");
  }

  if (
    prior_failure_count === undefined ||
    prior_failure_count === null ||
    prior_failure_count === ""
  ) {
    throw new Error("prior_failure_count is required.");
  }

  if (
    traffic_load === undefined ||
    traffic_load === null ||
    traffic_load === ""
  ) {
    throw new Error("traffic_load is required.");
  }

  // ----------------------------------------------------------
  // BUILD QUERY PARAMETERS
  // ----------------------------------------------------------

  const params = new URLSearchParams();

  params.append("age_years", String(Number(age_years)));

  params.append(
    "days_since_last_maintenance",
    String(Number(days_since_last_maintenance)),
  );

  params.append("overdue_days", String(Number(overdue_days)));

  params.append("prior_failure_count", String(Number(prior_failure_count)));

  params.append("traffic_load", String(Number(traffic_load)));

  // ----------------------------------------------------------
  // API REQUEST
  // ----------------------------------------------------------

  const url = `${RISK_API_BASE_URL}/risk/predict?` + params.toString();

  console.log("========================================");

  console.log("RISK PREDICTION REQUEST");

  console.log("URL:", url);

  console.log("FEATURES:", {
    age_years,
    days_since_last_maintenance,
    overdue_days,
    prior_failure_count,
    traffic_load,
  });

  console.log("========================================");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  // ----------------------------------------------------------
  // READ RESPONSE
  // ----------------------------------------------------------

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  console.log("RISK PREDICTION RESPONSE:", data);

  // ----------------------------------------------------------
  // ERROR HANDLING
  // ----------------------------------------------------------

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.error ||
      data?.message ||
      `Risk prediction failed with status ${response.status}.`;

    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message),
    );
  }

  // ----------------------------------------------------------
  // RETURN API RESPONSE
  // ----------------------------------------------------------

  return data;
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  predictRisk,
};
