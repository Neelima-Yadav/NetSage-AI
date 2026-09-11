const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function buildHeaders(headers = {}) {
  return {
    Accept: "application/json",
    ...headers,
  };
}

async function request(path, { method = "GET", data, headers } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders({
      ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    }),
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const responseData = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = responseData?.detail ?? responseData?.message ?? "API request failed";
    throw new ApiError(message, { status: response.status, data: responseData });
  }

  return responseData;
}

function toQueryString(filters = {}) {
  const parameters = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      parameters.set(key, String(value));
    }
  });

  const query = parameters.toString();
  return query ? `?${query}` : "";
}

export async function diagnoseNetwork(data) {
  return request("/api/diagnose", { method: "POST", data });
}

export async function getDiagnosis(diagnosisId) {
  return request(`/api/diagnose/${encodeURIComponent(diagnosisId)}`);
}

export async function getDashboard() {
  return request("/api/dashboard");
}

export async function getHistory(filters) {
  return request(`/api/history${toQueryString(filters)}`);
}

export async function submitHumanReview(data) {
  return request("/api/review", { method: "POST", data });
}
