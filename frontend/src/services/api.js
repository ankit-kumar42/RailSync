// src/services/api.js

const API_BASE_URL = "http://localhost:8001";

/**
 * Generic API request helper
 */
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage =
      data?.detail?.error ||
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  return data;
}

/* ============================================================
   SCHEDULE
============================================================ */

/**
 * Generate AI maintenance schedule
 *
 * Backend:
 * POST /schedule
 */
export async function generateSchedule(payload = {}) {
  return apiRequest("/schedule", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Confirm generated schedule
 *
 * Backend:
 * POST /schedule/confirm
 */
export async function confirmSchedule(scheduled, unscheduled) {
  return apiRequest("/schedule/confirm", {
    method: "POST",
    body: JSON.stringify({
      scheduled,
      unscheduled,
    }),
  });
}

/**
 * Get confirmed schedules
 *
 * Backend:
 * GET /schedule/confirmed
 */
export async function getConfirmedSchedule() {
  return apiRequest("/schedule/confirmed", {
    method: "GET",
  });
}

/**
 * Update scheduled task status
 *
 * Backend:
 * PATCH /schedule/scheduled/{task_id}/status?status=...
 */
export async function updateScheduledStatus(taskId, status) {
  return apiRequest(
    `/schedule/scheduled/${encodeURIComponent(taskId)}/status?status=${encodeURIComponent(
      status,
    )}`,
    {
      method: "PATCH",
    },
  );
}

/**
 * Update unscheduled task status
 *
 * Backend:
 * PATCH /schedule/unscheduled/{task_id}/status?status=...
 */
export async function updateUnscheduledStatus(taskId, status) {
  return apiRequest(
    `/schedule/unscheduled/${encodeURIComponent(taskId)}/status?status=${encodeURIComponent(
      status,
    )}`,
    {
      method: "PATCH",
    },
  );
}

/* ============================================================
   RISK
============================================================ */

/**
 * Asset failure risk prediction
 *
 * Backend:
 * POST /risk/predict
 */
export async function predictRisk({
  age_years,
  days_since_last_maintenance,
  overdue_days,
  prior_failure_count,
  traffic_load,
}) {
  const params = new URLSearchParams({
    age_years: String(age_years),
    days_since_last_maintenance: String(days_since_last_maintenance),
    overdue_days: String(overdue_days),
    prior_failure_count: String(prior_failure_count),
    traffic_load: String(traffic_load),
  });

  return apiRequest(`/risk/predict?${params.toString()}`, {
    method: "POST",
  });
}

/* ============================================================
   PRIORITY
============================================================ */

/**
 * Maintenance priority calculation
 *
 * Backend:
 * POST /priority/calculate
 */
export async function calculatePriority(payload) {
  return apiRequest("/priority/calculate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ============================================================
   COMPATIBILITY
============================================================ */

/**
 * Task compatibility calculation
 *
 * Backend:
 * POST /compatibility/calculate
 */
export async function calculateCompatibility(taskA, taskB) {
  return apiRequest("/compatibility/calculate", {
    method: "POST",
    body: JSON.stringify({
      task_a: taskA,
      task_b: taskB,
    }),
  });
}

/* ============================================================
   HEALTH CHECK
============================================================ */

export async function checkBackendHealth() {
  return apiRequest("/");
}

/* ============================================================
   DEFAULT EXPORT
============================================================ */

const api = {
  generateSchedule,
  confirmSchedule,
  getConfirmedSchedule,
  updateScheduledStatus,
  updateUnscheduledStatus,
  predictRisk,
  calculatePriority,
  calculateCompatibility,
  checkBackendHealth,
};

export default api;
