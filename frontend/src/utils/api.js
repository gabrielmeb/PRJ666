// lib/api.js
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Helper to get the JWT token (from cookies, localStorage, etc.)
function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || "";
  }
  return "";
}

// Base fetch wrapper that includes the Authorization header
export async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    // Optionally handle error statuses
    const errorData = await res.json();
    throw new Error(errorData.message || `Error ${res.status}`);
  }

  return res.json();
}
