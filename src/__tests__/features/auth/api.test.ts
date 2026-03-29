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

  const validRegister = {
    username: "test",
    password: "Test123!a",
    email: "test@test.com",
    firstName: "Test",
    lastName: "User",
  };

  it("register() POSTs JSON to /auth/register and returns parsed body", async () => {
    const payload = {
      id: "1",
      username: "test",
      email: "test@test.com",
      createdAt: "2024-01-01",
    };
    const fetchMock = mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue(payload),
    });

    await expect(register(validRegister)).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRegister),
      }),
    );
  });

  it("register() throws ApiError on 409 conflict", async () => {
    mockFetch({
      ok: false,
      status: 409,
      json: vi.fn().mockResolvedValue({
        timestamp: "2024-01-01",
        status: 409,
        error: "Conflict",
        message: "User already exists",
        path: "/auth/register",
        details: null,
      }),
    });

    await expect(register(validRegister)).rejects.toMatchObject({
      status: 409,
      message: "User already exists",
    });
  });

  it("login() POSTs JSON credentials to /auth/login and returns token payload", async () => {
    const credentials = { username: "user", password: "pass" };
    const fetchMock = mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({ token: "jwt-token" }),
    });

    await expect(login(credentials)).resolves.toEqual({ token: "jwt-token" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }),
    );
  });

  it("login() throws parsed ApiError on non-ok response (incl. field details)", async () => {
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

    await expect(
      login({ username: "user", password: "pass" }),
    ).rejects.toMatchObject({
      status: 400,
      message: "Validation failed",
      details: { fields: { username: "required" } },
    });
  });
});
