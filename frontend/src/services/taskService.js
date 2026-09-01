// ============================================================
// API BASE URLs
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8001";
const AI_API_BASE_URL = "http://127.0.0.1:8000";

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
// TASKS
// ============================================================

export async function getTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return handleResponse(response);
}

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
// SCHEDULE GENERATION
// ============================================================
//
// IMPORTANT:
// Frontend calls 8001.
// Main backend 8001 reads MaintenanceTask.
// 8001 then communicates with AI backend 8000.
//

export async function generateSchedule(payload) {
  if (!payload) {
    throw new Error("Schedule payload is required.");
  }

  const response = await fetch(`${API_BASE_URL}/schedule`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

// ============================================================
// CONFIRM SCHEDULE
// ============================================================
//
// Main backend owns the confirmed schedule database.
//

export async function confirmSchedule({ scheduled = [], unscheduled = [] }) {
  const response = await fetch(`${API_BASE_URL}/schedule/confirm`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify({
      scheduled,
      unscheduled,
    }),
  });

  return handleResponse(response);
}

// ============================================================
// GET CONFIRMED SCHEDULE
// ============================================================

export async function getConfirmedSchedule() {
  const response = await fetch(`${API_BASE_URL}/schedule/confirmed`, {
    method: "GET",

    headers: {
      Accept: "application/json",
    },
  });

  return handleResponse(response);
}

// ============================================================
// UPDATE SCHEDULED STATUS
// ============================================================

export async function updateScheduledStatus(taskId, status) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  if (!status) {
    throw new Error("Status is required.");
  }

  const url =
    `${API_BASE_URL}/schedule/scheduled/` +
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

// ============================================================
// UPDATE UNSCHEDULED STATUS
// ============================================================

export async function updateUnscheduledStatus(taskId, status) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  if (!status) {
    throw new Error("Status is required.");
  }

  const url =
    `${API_BASE_URL}/schedule/unscheduled/` +
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
