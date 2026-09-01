
// ============================================================
// src/services/scheduleService.js
//
// FRONTEND -> MAIN BACKEND :8001
//
// The frontend NEVER calls the AI backend :8000 directly.
//
// Flow:
//
// GET  /tasks
// POST /tasks
//
// POST /schedule
//      |
//      +--> Backend :8001 reads tasks from DB
//      |
//      +--> Backend :8001 calls AI :8000
//
// POST /schedule/confirm
//
// GET /schedule/confirmed
//
// PATCH /schedule/scheduled/{task_id}/status
//
// PATCH /schedule/unscheduled/{task_id}/status
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8001";


// ============================================================
// RESPONSE HANDLER
// ============================================================

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
// GENERIC FETCH HELPER
// ============================================================

async function request(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    console.error("Fetch error:", error);

    throw new Error(
      `Cannot connect to backend at ${API_BASE_URL}. ` +
        `Make sure your backend is running on port 8001.`,
    );
  }

  return handleResponse(response);
}


// ============================================================
// TASKS
// ============================================================

export async function getTasks() {
  return request(
    `${API_BASE_URL}/tasks`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
      },
    },
  );
}


export async function createTask(payload) {
  if (!payload) {
    throw new Error(
      "Task payload is required.",
    );
  }

  return request(
    `${API_BASE_URL}/tasks`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify(payload),
    },
  );
}


export async function deleteTask(taskId) {
  if (!taskId) {
    throw new Error(
      "Task ID is required.",
    );
  }

  return request(
    `${API_BASE_URL}/tasks/${encodeURIComponent(
      taskId,
    )}`,
    {
      method: "DELETE",

      headers: {
        Accept: "application/json",
      },
    },
  );
}


// ============================================================
// GENERATE SCHEDULE
// ============================================================

export async function generateSchedule({
  planning_start_date = null,
  planning_end_date = null,
} = {}) {
  return request(
    `${API_BASE_URL}/schedule`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        planning_start_date,
        planning_end_date,
      }),
    },
  );
}


// ============================================================
// CONFIRM SCHEDULE
// ============================================================

export async function confirmSchedule({
  scheduled = [],
  unscheduled = [],
} = {}) {
  return request(
    `${API_BASE_URL}/schedule/confirm`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        scheduled,
        unscheduled,
      }),
    },
  );
}


// ============================================================
// GET CONFIRMED SCHEDULE
// ============================================================

export async function getConfirmedSchedule() {
  return request(
    `${API_BASE_URL}/schedule/confirmed`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
      },
    },
  );
}


// ============================================================
// UPDATE SCHEDULED STATUS
// ============================================================

export async function updateScheduledStatus(
  taskId,
  status,
) {
  if (!taskId) {
    throw new Error(
      "Task ID is required.",
    );
  }

  if (!status) {
    throw new Error(
      "Status is required.",
    );
  }

  const url =
    `${API_BASE_URL}/schedule/scheduled/` +
    `${encodeURIComponent(taskId)}/status` +
    `?status=${encodeURIComponent(status)}`;

  return request(
    url,
    {
      method: "PATCH",

      headers: {
        Accept: "application/json",
      },
    },
  );
}


// ============================================================
// UPDATE UNSCHEDULED STATUS
// ============================================================

export async function updateUnscheduledStatus(
  taskId,
  status,
) {
  if (!taskId) {
    throw new Error(
      "Task ID is required.",
    );
  }

  if (!status) {
    throw new Error(
      "Status is required.",
    );
  }

  const url =
    `${API_BASE_URL}/schedule/unscheduled/` +
    `${encodeURIComponent(taskId)}/status` +
    `?status=${encodeURIComponent(status)}`;

  return request(
    url,
    {
      method: "PATCH",

      headers: {
        Accept: "application/json",
      },
    },
  );
}


// ============================================================
// DEFAULT EXPORT
// ============================================================

const scheduleService = {
  getTasks,
  createTask,
  deleteTask,

  generateSchedule,
  confirmSchedule,
  getConfirmedSchedule,

  updateScheduledStatus,
  updateUnscheduledStatus,
};

export default scheduleService;

