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
    it("stores token in localStorage and cookie", () => {
      setToken("abc123");
      expect(localStorage.getItem("todoapi_token")).toBe("abc123");
      expect(document.cookie).toContain("todoapi_token=abc123");
    });
  });

  describe("getToken()", () => {
    it.each([
      ["returns token when stored", "mytoken", "mytoken"],
      ["returns null when empty", null, null],
    ])("%s", (_label, stored, expected) => {
      if (stored) localStorage.setItem("todoapi_token", stored);
      expect(getToken()).toBe(expected);
    });
  });

  describe("clearToken()", () => {
    it("removes token from localStorage and cookie", () => {
      setToken("mytoken");
      clearToken();
      expect(localStorage.getItem("todoapi_token")).toBeNull();
      expect(document.cookie).not.toContain("todoapi_token=mytoken");
    });
  });
});

describe("decodeToken()", () => {
  // валидные токены
  it.each([
    [
      { sub: "42", username: "alice", exp: 9999999999 },
      { sub: "42", username: "alice", exp: 9999999999 },
    ],
    [
      { sub: "1", username: "bob" },
      { sub: "1", username: "bob" },
    ],
    [
      { sub: "1", username: "u", iat: 1000 },
      { sub: "1", username: "u", iat: 1000 },
    ],
  ])("decodes payload %j correctly", (payload, expected) => {
    expect(decodeToken(makeJwt(payload))).toEqual(expected);
  });

  // невалидные токены - null
  it.each([
    ["wrong part count (2)", "only.two"],
    ["wrong part count (1)", "one"],
    ["wrong part count (4)", "a.b.c.d"],
    ["invalid base64", "a.!!!invalid!!!.c"],
    ["non-JSON payload", `a.${btoa("not json")}.c`],
    ["empty string", ""],
  ])("returns null for %s", (_label, token) => {
    expect(decodeToken(token)).toBeNull();
  });
});

describe("isTokenExpired()", () => {
  const nowSec = () => Math.floor(Date.now() / 1000);

  it.each([
    ["future exp", { exp: nowSec() + 3600 }, false],
    ["past exp", { exp: nowSec() - 3600 }, true],
    ["no exp field", {}, true],
  ])("%s → %s", (_label, extra, expected) => {
    const token = makeJwt({ sub: "1", username: "u", ...extra });
    expect(isTokenExpired(token)).toBe(expected);
  });

  it("returns true when exp === now", () => {
    const now = nowSec();
    vi.spyOn(Date, "now").mockReturnValue(now * 1000);
    const token = makeJwt({ sub: "1", username: "u", exp: now });
    expect(isTokenExpired(token)).toBe(true);
    vi.restoreAllMocks();
  });

  it("returns true for garbage token", () => {
    expect(isTokenExpired("garbage")).toBe(true);
  });
});