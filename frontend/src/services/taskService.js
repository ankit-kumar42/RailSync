
// ============================================================
// API BASE URLs
// ============================================================

// Main backend: tasks, maintenance, database
const API_BASE_URL ="http://127.0.0.1:8001";

// AI / scheduling backend
const AI_API_BASE_URL ="http://127.0.0.1:8000";


/**
 * Convert backend errors into a useful Error.
 */
async function handleResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    // Response may not contain JSON.
  }

  if (!response.ok) {
    const backendError =
      data?.detail?.error ||
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
 * Main backend: http://127.0.0.1:8001
 */
export async function getTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return handleResponse(response);
}


/**
 * POST /tasks
 *
 * Main backend: http://127.0.0.1:8001
 */
export async function createTask(payload) {
  if (!payload) {
    throw new Error("Task payload is required.");
  }

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}


/**
 * DELETE /tasks/{task_id}
 *
 * Main backend: http://127.0.0.1:8001
 */
export async function deleteTask(taskId) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return handleResponse(response);
}


// ============================================================
// AI SCHEDULING
// ============================================================

/**
 * POST /schedule
 *
 * AI backend: http://127.0.0.1:8000
 *
 * Generates a maintenance schedule.
 */
export async function generateSchedule(payload) {
  if (!payload) {
    throw new Error("Schedule payload is required.");
  }

  const response = await fetch(`${AI_API_BASE_URL}/schedule`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}


/**
 * POST /schedule/confirm
 *
 * Saves the user's confirmed schedule.
 */
export async function confirmSchedule({
  scheduled = [],
  unscheduled = [],
}) {
  const response = await fetch(
    `${AI_API_BASE_URL}/schedule/confirm`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        scheduled,
        unscheduled,
      }),
    },
  );

  return handleResponse(response);
}


/**
 * GET /schedule/confirmed
 */
export async function getConfirmedSchedule() {
  const response = await fetch(
    `${AI_API_BASE_URL}/schedule/confirmed`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
      },
    },
  );

  return handleResponse(response);
}


/**
 * PATCH /schedule/scheduled/{task_id}/status
 */
export async function updateScheduledStatus(taskId, status) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  if (!status) {
    throw new Error("Status is required.");
  }

  const url =
    `${AI_API_BASE_URL}/schedule/scheduled/` +
    `${encodeURIComponent(taskId)}/status` +
    `?status=${encodeURIComponent(status)}`;

  const response = await fetch(url, {
    method: "PATCH",

    headers: {
      Accept: "application/json",
    },
  });

  return handleResponse(response);
}


/**
 * PATCH /schedule/unscheduled/{task_id}/status
 */
export async function updateUnscheduledStatus(taskId, status) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  if (!status) {
    throw new Error("Status is required.");
  }

  const url =
    `${AI_API_BASE_URL}/schedule/unscheduled/` +
    `${encodeURIComponent(taskId)}/status` +
    `?status=${encodeURIComponent(status)}`;

  const response = await fetch(url, {
    method: "PATCH",

    headers: {
      Accept: "application/json",
    },
  });

  return handleResponse(response);
}
