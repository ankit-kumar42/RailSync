import axios from "axios";

/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
|
| Vite:
|   VITE_API_BASE_URL=http://localhost:8000
|
| React:
|   REACT_APP_API_BASE_URL=http://localhost:8000
|
*/

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

const getErrorMessage = (error, fallback = "Something went wrong.") => {
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (typeof detail === "object" && detail.error) {
      return detail.error;
    }
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};

/*
|--------------------------------------------------------------------------
| GET CONFIRMED SCHEDULE
|--------------------------------------------------------------------------
|
| Backend:
| GET /schedule/confirmed
|
*/

export const getConfirmedSchedule = async () => {
  try {
    const response = await api.get("/schedule/confirmed");

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to load confirmed schedule."),
    );
  }
};

/*
|--------------------------------------------------------------------------
| CONFIRM SCHEDULE
|--------------------------------------------------------------------------
|
| Backend:
| POST /schedule/confirm
|
| Body:
| {
|   scheduled: [],
|   unscheduled: []
| }
|
*/

export const confirmSchedule = async (scheduled = [], unscheduled = []) => {
  try {
    const payload = {
      scheduled: scheduled.map((task) => ({
        task_id: task.task_id,
        asset_id: task.asset_id ?? null,
        corridor_id: task.corridor_id ?? null,
        block_window_id: task.block_window_id ?? null,
        date: task.date ?? null,
        start_time: task.start_time ?? null,
        end_time: task.end_time ?? null,
        estimated_duration_hrs: task.estimated_duration_hrs ?? null,
        priority_score: task.priority_score ?? null,
        failure_risk: task.failure_risk ?? null,
      })),

      unscheduled: unscheduled.map((task) => ({
        task_id: task.task_id,
        asset_id: task.asset_id ?? null,
        corridor_id: task.corridor_id ?? null,
        compatibility_group: task.compatibility_group ?? null,
        reason_code: task.reason_code ?? null,
        reason: task.reason ?? null,
      })),
    };

    const response = await api.post("/schedule/confirm", payload);

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to confirm schedule."));
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE SCHEDULED TASK STATUS
|--------------------------------------------------------------------------
|
| Backend:
| PATCH /schedule/scheduled/{task_id}/status?status=PENDING
|
*/

export const updateScheduledStatus = async (taskId, status) => {
  try {
    const response = await api.patch(
      `/schedule/scheduled/${encodeURIComponent(taskId)}/status`,
      null,
      {
        params: {
          status,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to update scheduled task status."),
    );
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE UNSCHEDULED TASK STATUS
|--------------------------------------------------------------------------
|
| Backend:
| PATCH /schedule/unscheduled/{task_id}/status?status=PENDING
|
*/

export const updateUnscheduledStatus = async (taskId, status) => {
  try {
    const response = await api.patch(
      `/schedule/unscheduled/${encodeURIComponent(taskId)}/status`,
      null,
      {
        params: {
          status,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to update unscheduled task status."),
    );
  }
};

export default api;
