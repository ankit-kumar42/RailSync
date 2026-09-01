
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Calculate maintenance priority.
 *
 * Backend:
 * POST /priority/calculate
 *
 * Request:
 *
 * {
 *   task: {
 *     severity,
 *     overdue_days,
 *     last_maintenance_date
 *   },
 *   asset: {
 *     criticality_rating,
 *     age_years,
 *     historical_failure_count
 *   },
 *   corridor: {
 *     operational_criticality
 *   },
 *   traffic_load
 * }
 */
export async function calculatePriority(payload) {
  try {
    console.log(
      "Sending priority payload:",
      JSON.stringify(payload, null, 2)
    );

    const response = await axios.post(
      `${API_BASE_URL}/priority/calculate`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log(
      "Priority API response:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Priority API error:",
      error?.response?.data || error
    );

    const detail =
      error?.response?.data?.detail;

    if (detail) {
      throw new Error(
        Array.isArray(detail)
          ? detail
              .map((item) => item.msg)
              .join(", ")
          : String(detail)
      );
    }

    if (error?.response?.status === 400) {
      throw new Error(
        "The priority request was rejected by the backend. Check the task, asset and corridor fields."
      );
    }

    if (error?.response?.status === 422) {
      throw new Error(
        "Invalid priority request data. Check the required fields and their types."
      );
    }

    if (error?.response?.status === 500) {
      throw new Error(
        "Priority engine failed on the backend."
      );
    }

    if (error?.request) {
      throw new Error(
        "Cannot connect to the backend at http://127.0.0.1:8000."
      );
    }

    throw new Error(
      error?.message ||
        "Unable to calculate maintenance priority."
    );
  }
}

