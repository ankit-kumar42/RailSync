const API_BASE_URL = "http://localhost:8000";

export async function calculatePriority(payload) {
  const response = await fetch(`${API_BASE_URL}/priority/calculate`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : "Priority calculation failed",
    );
  }

  return result;
}
