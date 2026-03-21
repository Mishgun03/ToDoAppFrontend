import { getToken, clearToken } from "@/shared/lib/auth";
import type { ApiError } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {};

  if (options.headers) {
    const incoming = options.headers;
    if (incoming instanceof Headers) {
      incoming.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(incoming)) {
      incoming.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, incoming);
    }
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw {
      timestamp: new Date().toISOString(),
      status: response.status,
      error: response.status === 401 ? "Unauthorized" : "Forbidden",
      message: "Session expired",
      path,
      details: null,
    } satisfies ApiError;
  }

  if (!response.ok) {
    let error: ApiError;
    try {
      error = await response.json();
    } catch {
      error = {
        timestamp: new Date().toISOString(),
        status: response.status,
        error: "Error",
        message: response.statusText || "An unexpected error occurred",
        path,
        details: null,
      };
    }
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
