const API_BASE_URL = "http://localhost:8000";

export async function predictRisk(data) {
  const params = new URLSearchParams({
    age_years: data.age_years,
    days_since_last_maintenance: data.days_since_last_maintenance,
    overdue_days: data.overdue_days,
    prior_failure_count: data.prior_failure_count,
    traffic_load: data.traffic_load,
  });

  const response = await fetch(
    `${API_BASE_URL}/risk/predict?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : "Risk prediction failed",
    );
  }

  return result;
}
