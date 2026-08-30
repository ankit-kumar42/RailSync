const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Convert backend errors into a useful frontend Error.
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
      typeof backendError === "string" ? backendError : "Request failed.",
    );
  }

  return data;
}

/**
 * GET /tasks
 *
 * Returns all maintenance tasks.
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
 * GET /tasks/{task_id}
 *
 * Returns one maintenance task.
 */
export async function getTask(taskId) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/tasks/${encodeURIComponent(taskId)}`,
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
 * POST /tasks
 *
 * Creates a new maintenance task.
 */
export async function createTask(task) {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(task),
  });

  return handleResponse(response);
}

/**
 * DELETE /tasks/{task_id}
 *
 * Deletes a maintenance task.
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
