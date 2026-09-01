import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function calculateCompatibility(payload) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/compatibility/calculate`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Compatibility API error:",
      error.response?.data || error.message,
    );

    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
      throw new Error(
        detail.map((item) => item.msg || "Validation error").join(", "),
      );
    }

    if (typeof detail === "string") {
      throw new Error(detail);
    }

    throw new Error("Unable to calculate task compatibility.");
  }
}
