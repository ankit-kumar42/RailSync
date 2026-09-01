// src/services/api.js

// ============================================================
// MAIN BACKEND
// ============================================================
//
// Frontend talks ONLY to port 8001.
//
// Port 8000 is the internal AI backend and should NOT be
// called directly from the frontend.
//
// Flow:
//
// Frontend
//    ↓
// localhost:8001/tasks
// localhost:8001/schedule
// localhost:8001/schedule/confirm
//    ↓
// Backend 8001
//    ↓
// AI Backend 8000
// ============================================================

const API_BASE_URL = "http://localhost:8001";


// ============================================================
// GENERIC API REQUEST
// ============================================================

async function apiRequest(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,

      headers: {
        Accept: "application/json",

        ...(options.body
          ? {
              "Content-Type": "application/json",
            }
          : {}),

        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new Error(
      "Unable to connect to the backend. Please make sure the backend is running on port 8001.",
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    // Response may not contain JSON.
  }

  if (!response.ok) {
    const backendError =
      data?.detail?.error ||
      data?.detail?.message ||
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}`;

    throw new Error(
      typeof backendError === "string"
        ? backendError
        : JSON.stringify(backendError),
    );
  }

  return data;
}


// ============================================================
// TASKS
// ============================================================

/**
 * GET /tasks
 *
 * Returns all maintenance tasks stored in the main backend DB.
 */
export async function getTasks() {
  return apiRequest("/tasks", {
    method: "GET",
  });
}


/**
 * POST /tasks
 *
 * Creates a maintenance task in the main backend DB.
 */
export async function createTask(payload) {
  if (!payload) {
    throw new Error("Task payload is required.");
  }

  return apiRequest("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


/**
 * GET /tasks/{task_id}
 */
export async function getTask(taskId) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  return apiRequest(
    `/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "GET",
    },
  );
}


/**
 * DELETE /tasks/{task_id}
 */
export async function deleteTask(taskId) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  return apiRequest(
    `/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "DELETE",
    },
  );
}


// ============================================================
// SCHEDULE GENERATION
// ============================================================

/**
 * POST /schedule
 *
 * IMPORTANT:
 *
 * The frontend does NOT send the tasks here.
 *
 * Backend 8001 gets all MaintenanceTask records from its DB.
 *
 * Backend 8001 then internally calls:
 *
 *     Backend AI 8000 /schedule
 *
 * Request:
 *
 * {
 *   planning_start_date: "2026-09-01",
 *   planning_end_date: "2026-09-07"
 * }
 */
export async function generateSchedule({
  planning_start_date = null,
  planning_end_date = null,
} = {}) {
  return apiRequest("/schedule", {
    method: "POST",

    body: JSON.stringify({
      planning_start_date,
      planning_end_date,
    }),
  });
}


// ============================================================
// CONFIRM SCHEDULE
// ============================================================

/**
 * POST /schedule/confirm
 *
 * Saves the schedule selected/reviewed by the user.
 *
 * Request:
 *
 * {
 *   scheduled: [...],
 *   unscheduled: [...]
 * }
 */
export async function confirmSchedule({
  scheduled = [],
  unscheduled = [],
} = {}) {
  return apiRequest("/schedule/confirm", {
    method: "POST",

    body: JSON.stringify({
      scheduled,
      unscheduled,
    }),
  });
}


// ============================================================
// GET CONFIRMED SCHEDULE
// ============================================================

/**
 * GET /schedule/confirmed
 *
 * Returns schedules that have already been confirmed.
 */
export async function getConfirmedSchedule() {
  return apiRequest("/schedule/confirmed", {
    method: "GET",
  });
}


// ============================================================
// SCHEDULED TASK STATUS
// ============================================================

/**
 * PATCH /schedule/scheduled/{task_id}/status
 *
 * Backend status values:
 *
 * PENDING
 * IN_PROGRESS
 * DONE
 */
export async function updateScheduledStatus(taskId, status) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  if (!status) {
    throw new Error("Status is required.");
  }

  const endpoint =
    `/schedule/scheduled/${encodeURIComponent(taskId)}` +
    `/status?status=${encodeURIComponent(status)}`;

  return apiRequest(endpoint, {
    method: "PATCH",
  });
}


// ============================================================
// UNSCHEDULED TASK STATUS
// ============================================================

/**
 * PATCH /schedule/unscheduled/{task_id}/status
 *
 * Backend status values:
 *
 * PENDING
 * RESOLVED
 * CANCELLED
 */
export async function updateUnscheduledStatus(taskId, status) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  if (!status) {
    throw new Error("Status is required.");
  }

  const endpoint =
    `/schedule/unscheduled/${encodeURIComponent(taskId)}` +
    `/status?status=${encodeURIComponent(status)}`;

  return apiRequest(endpoint, {
    method: "PATCH",
  });
}


// ============================================================
// RISK
// ============================================================

export async function predictRisk({
  age_years,
  days_since_last_maintenance,
  overdue_days,
  prior_failure_count,
  traffic_load,
}) {
  const params = new URLSearchParams({
    age_years: String(age_years),
    days_since_last_maintenance: String(
      days_since_last_maintenance,
    ),
    overdue_days: String(overdue_days),
    prior_failure_count: String(
      prior_failure_count,
    ),
    traffic_load: String(traffic_load),
  });

  return apiRequest(
    `/risk/predict?${params.toString()}`,
    {
      method: "POST",
    },
  );
}


// ============================================================
// PRIORITY
// ============================================================

export async function calculatePriority(payload) {
  if (!payload) {
    throw new Error("Priority payload is required.");
  }

  return apiRequest("/priority/calculate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


// ============================================================
// COMPATIBILITY
// ============================================================

export async function calculateCompatibility(
  taskA,
  taskB,
) {
  if (!taskA || !taskB) {
    throw new Error(
      "Both tasks are required for compatibility calculation.",
    );
  }

  return apiRequest("/compatibility/calculate", {
    method: "POST",

    body: JSON.stringify({
      task_a: taskA,
      task_b: taskB,
    }),
  });
}


// ============================================================
// HEALTH CHECK
// ============================================================

export async function checkBackendHealth() {
  return apiRequest("/", {
    method: "GET",
  });
}


// ============================================================
// DEFAULT EXPORT
// ============================================================

const api = {
  getTasks,
  getTask,
  createTask,
  deleteTask,

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

