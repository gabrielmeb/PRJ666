// utils/api.js
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Helper to get the JWT token (from cookies, localStorage, etc.)
function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userToken") || "";
  }
  return "";
}

function createAbortController(timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
}

// Base fetch wrapper that includes the Authorization header
export async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  // Check if the request body is a FormData instance.
  const isFormData = options.body instanceof FormData;

  // Set default headers conditionally based on whether we're sending FormData.
  const defaultHeaders = isFormData
    ? {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    : {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      };

  // Destructure timeout from options, the rest go to fetch.
  const { timeout = 10000, ...fetchOptions } = options;
  const { controller, timeoutId } = createAbortController(timeout);

  // Merge headers: default headers are overridden by any custom headers provided in options.
  const config = {
    ...fetchOptions,
    signal: controller.signal,
    headers: {
      ...defaultHeaders,
      ...(fetchOptions.headers || {})
    }
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // If response is not JSON formatted, fallback to the status message.
      }
      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  }
}
