const API_BASE_URL = "http://localhost:5173";

export async function generateSchedule(payload) {
  const response = await fetch(`${API_BASE_URL}/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.detail?.error || result?.detail || "Failed to generate schedule",
    );
  }

  return result;
}
