import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setToken,
  getToken,
  clearToken,
  decodeToken,
  isTokenExpired,
} from "@/shared/lib/auth";

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fakesignature`;
}

describe("auth token management", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "todoapi_token=; path=/; max-age=0";
  });

  describe("setToken()", () => {
    it("stores token in localStorage", () => {
      setToken("abc123");
      expect(localStorage.getItem("todoapi_token")).toBe("abc123");
    });

    it("sets a cookie with the token", () => {
      setToken("abc123");
      expect(document.cookie).toContain("todoapi_token=abc123");
    });
  });

  describe("getToken()", () => {
    it("returns token from localStorage", () => {
      localStorage.setItem("todoapi_token", "mytoken");
      expect(getToken()).toBe("mytoken");
    });

    it("returns null when no token stored", () => {
      expect(getToken()).toBeNull();
    });
  });

  describe("clearToken()", () => {
    it("removes token from localStorage", () => {
      localStorage.setItem("todoapi_token", "mytoken");
      clearToken();
      expect(localStorage.getItem("todoapi_token")).toBeNull();
    });

    it("clears the cookie", () => {
      setToken("mytoken");
      clearToken();
      expect(document.cookie).not.toContain("todoapi_token=mytoken");
    });
  });
});

describe("decodeToken()", () => {
  it("decodes a valid JWT payload", () => {
    const token = makeJwt({ sub: "42", username: "alice", exp: 9999999999 });
    const result = decodeToken(token);
    expect(result).toEqual({
      sub: "42",
      username: "alice",
      exp: 9999999999,
    });
  });

  it("returns sub and username fields", () => {
    const token = makeJwt({ sub: "1", username: "bob" });
    const result = decodeToken(token);
    expect(result?.sub).toBe("1");
    expect(result?.username).toBe("bob");
  });

  it("returns null for a token with wrong number of parts", () => {
    expect(decodeToken("only.two")).toBeNull();
    expect(decodeToken("one")).toBeNull();
    expect(decodeToken("a.b.c.d")).toBeNull();
  });

  it("returns null for invalid base64 payload", () => {
    expect(decodeToken("a.!!!invalid!!!.c")).toBeNull();
  });

  it("returns null for non-JSON payload", () => {
    const fakePayload = btoa("not json at all");
    expect(decodeToken(`a.${fakePayload}.c`)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(decodeToken("")).toBeNull();
  });

  it("preserves optional iat field", () => {
    const token = makeJwt({ sub: "1", username: "u", iat: 1000 });
    expect(decodeToken(token)?.iat).toBe(1000);
  });
});

describe("isTokenExpired()", () => {
  it("returns false for a token expiring far in the future", () => {
    const token = makeJwt({
      sub: "1",
      username: "u",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    expect(isTokenExpired(token)).toBe(false);
  });

  it("returns true for a token that already expired", () => {
    const token = makeJwt({
      sub: "1",
      username: "u",
      exp: Math.floor(Date.now() / 1000) - 3600,
    });
    expect(isTokenExpired(token)).toBe(true);
  });

  it("returns true when exp is exactly now (edge case)", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    vi.spyOn(Date, "now").mockReturnValue(nowSec * 1000);
    const token = makeJwt({ sub: "1", username: "u", exp: nowSec });
    expect(isTokenExpired(token)).toBe(true);
    vi.restoreAllMocks();
  });

  it("returns true when token has no exp field", () => {
    const token = makeJwt({ sub: "1", username: "u" });
    expect(isTokenExpired(token)).toBe(true);
  });

  it("returns true for an invalid token", () => {
    expect(isTokenExpired("garbage")).toBe(true);
  });
});
