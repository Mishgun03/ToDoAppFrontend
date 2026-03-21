import type {
  ApiError,
  JwtResponseDto,
  RegisterResponseDto,
} from "@/shared/api/types";
import type { LoginFormData, RegisterFormData } from "./schemas";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function authFetch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let error: ApiError;
    try {
      error = await response.json();
    } catch {
      error = {
        timestamp: new Date().toISOString(),
        status: response.status,
        error: "Error",
        message: response.statusText || "Произошла непредвиденная ошибка",
        path,
        details: null,
      };
    }
    throw error;
  }

  return response.json();
}

export function register(data: RegisterFormData): Promise<RegisterResponseDto> {
  return authFetch<RegisterResponseDto>("/auth/register", data);
}

export function login(data: LoginFormData): Promise<JwtResponseDto> {
  return authFetch<JwtResponseDto>("/auth/login", data);
}
