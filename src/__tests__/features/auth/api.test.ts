import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { register, login } from "@/features/auth/api";

function mockFetch(response: Partial<Response>) {
  const fn = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({}),
    ...response,
  });
  global.fetch = fn;
  return fn;
}

describe("auth API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("register()", () => {
    const validData = {
      username: "test",
      password: "Test123!a",
      email: "test@test.com",
      firstName: "Test",
      lastName: "User",
    };

    it("sends POST request to /auth/register", async () => {
      const fetchMock = mockFetch({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: "1",
          username: "test",
          email: "test@test.com",
          createdAt: "2024-01-01",
        }),
      });

      await register(validData);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    it("sends registration data as JSON body", async () => {
      const fetchMock = mockFetch({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: "1",
          username: "test",
          email: "test@test.com",
          createdAt: "2024-01-01",
        }),
      });

      await register(validData);
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body).toEqual(validData);
    });

    it("returns RegisterResponseDto on success", async () => {
      const responseData = {
        id: "uuid-123",
        username: "test",
        email: "test@test.com",
        createdAt: "2024-01-01T00:00:00Z",
      };

      mockFetch({
        ok: true,
        json: vi.fn().mockResolvedValue(responseData),
      });

      const result = await register(validData);
      expect(result).toEqual(responseData);
    });

    it("throws ApiError on 409 conflict", async () => {
      const errorResponse = {
        timestamp: "2024-01-01",
        status: 409,
        error: "Conflict",
        message: "User already exists",
        path: "/auth/register",
        details: null,
      };

      mockFetch({
        ok: false,
        status: 409,
        json: vi.fn().mockResolvedValue(errorResponse),
      });

      await expect(register(validData)).rejects.toMatchObject({
        status: 409,
        message: "User already exists",
      });
    });

    it("creates fallback error when response is not JSON", async () => {
      mockFetch({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: vi.fn().mockRejectedValue(new Error("parse failed")),
      });

      await expect(register(validData)).rejects.toMatchObject({
        status: 500,
        error: "Error",
      });
    });
  });

  describe("login()", () => {
    const credentials = { username: "user", password: "pass" };

    it("sends POST request to /auth/login", async () => {
      const fetchMock = mockFetch({
        ok: true,
        json: vi.fn().mockResolvedValue({ token: "jwt-token" }),
      });

      await login(credentials);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    it("sends credentials as JSON body", async () => {
      const fetchMock = mockFetch({
        ok: true,
        json: vi.fn().mockResolvedValue({ token: "jwt-token" }),
      });

      await login(credentials);
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body).toEqual(credentials);
    });

    it("returns JwtResponseDto on success", async () => {
      mockFetch({
        ok: true,
        json: vi.fn().mockResolvedValue({ token: "my-jwt-token" }),
      });

      const result = await login(credentials);
      expect(result).toEqual({ token: "my-jwt-token" });
    });

    it("throws ApiError on 401", async () => {
      mockFetch({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({
          timestamp: "2024-01-01",
          status: 401,
          error: "Unauthorized",
          message: "Bad credentials",
          path: "/auth/login",
          details: null,
        }),
      });

      await expect(login(credentials)).rejects.toMatchObject({
        status: 401,
        message: "Bad credentials",
      });
    });

    it("throws ApiError on 400 with field errors", async () => {
      mockFetch({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          timestamp: "2024-01-01",
          status: 400,
          error: "Bad Request",
          message: "Validation failed",
          path: "/auth/login",
          details: { fields: { username: "required" } },
        }),
      });

      await expect(login(credentials)).rejects.toMatchObject({
        status: 400,
        details: { fields: { username: "required" } },
      });
    });
  });
});
