import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/shared/lib/auth", () => ({
  getToken: vi.fn(),
  clearToken: vi.fn(),
}));

import { apiClient } from "@/shared/api/client";
import { getToken, clearToken } from "@/shared/lib/auth";

const mockedGetToken = vi.mocked(getToken);
const mockedClearToken = vi.mocked(clearToken);

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

describe("apiClient()", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedGetToken.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("makes request to correct URL", async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: "test" }),
    });

    await apiClient("/todos");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/todos"),
      expect.any(Object),
    );
  });

  it("sets Content-Type to application/json by default", async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    await apiClient("/test");
    const callArgs = fetchMock.mock.calls[0][1];
    expect(callArgs.headers["Content-Type"]).toBe("application/json");
  });

  it("does not set Content-Type for FormData body", async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    const formData = new FormData();
    formData.append("file", "data");
    await apiClient("/upload", { body: formData });

    const callArgs = fetchMock.mock.calls[0][1];
    expect(callArgs.headers["Content-Type"]).toBeUndefined();
  });

  it("adds Authorization header when token exists", async () => {
    mockedGetToken.mockReturnValue("my-token");
    const fetchMock = mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    await apiClient("/test");
    const callArgs = fetchMock.mock.calls[0][1];
    expect(callArgs.headers["Authorization"]).toBe("Bearer my-token");
  });

  it("does not add Authorization header when no token", async () => {
    mockedGetToken.mockReturnValue(null);
    const fetchMock = mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    await apiClient("/test");
    const callArgs = fetchMock.mock.calls[0][1];
    expect(callArgs.headers["Authorization"]).toBeUndefined();
  });

  it("returns parsed JSON on success", async () => {
    mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: "1", name: "Todo" }),
    });

    const result = await apiClient<{ id: string; name: string }>("/test");
    expect(result).toEqual({ id: "1", name: "Todo" });
  });

  it("returns undefined for 204 No Content", async () => {
    mockFetch({
      ok: true,
      status: 204,
      json: vi.fn(),
    });

    const result = await apiClient("/test");
    expect(result).toBeUndefined();
  });

  it("clears token and redirects on 401", async () => {
    mockFetch({ ok: false, status: 401 });
    delete (window as Record<string, unknown>).location;
    (window as Record<string, unknown>).location = { href: "" };

    await expect(apiClient("/test")).rejects.toMatchObject({
      status: 401,
      error: "Unauthorized",
    });
    expect(mockedClearToken).toHaveBeenCalled();
  });

  it("clears token and redirects on 403", async () => {
    mockFetch({ ok: false, status: 403 });
    delete (window as Record<string, unknown>).location;
    (window as Record<string, unknown>).location = { href: "" };

    await expect(apiClient("/test")).rejects.toMatchObject({
      status: 403,
      error: "Forbidden",
    });
    expect(mockedClearToken).toHaveBeenCalled();
  });

  it("throws ApiError for non-ok responses", async () => {
    mockFetch({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        timestamp: "2024-01-01",
        status: 400,
        error: "Bad Request",
        message: "Invalid data",
        path: "/test",
        details: null,
      }),
    });

    await expect(apiClient("/test")).rejects.toMatchObject({
      status: 400,
      error: "Bad Request",
      message: "Invalid data",
    });
  });

  it("creates fallback error when response body is not JSON", async () => {
    mockFetch({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: vi.fn().mockRejectedValue(new Error("not json")),
    });

    await expect(apiClient("/test")).rejects.toMatchObject({
      status: 500,
      error: "Error",
      message: "Internal Server Error",
    });
  });

  it("merges incoming Headers object", async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    const headers = new Headers();
    headers.set("X-Custom", "value");
    await apiClient("/test", { headers });

    const callArgs = fetchMock.mock.calls[0][1];
    expect(callArgs.headers["x-custom"]).toBe("value");
    expect(callArgs.headers["Content-Type"]).toBe("application/json");
  });

  it("merges incoming array-style headers", async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    await apiClient("/test", {
      headers: [["X-Custom", "arr-val"]],
    });

    const callArgs = fetchMock.mock.calls[0][1];
    expect(callArgs.headers["X-Custom"]).toBe("arr-val");
  });

  it("merges incoming object-style headers", async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    await apiClient("/test", {
      headers: { "X-Custom": "obj-val" },
    });

    const callArgs = fetchMock.mock.calls[0][1];
    expect(callArgs.headers["X-Custom"]).toBe("obj-val");
  });

  it("passes through request options like method", async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    await apiClient("/test", { method: "DELETE" });
    const callArgs = fetchMock.mock.calls[0][1];
    expect(callArgs.method).toBe("DELETE");
  });
});
