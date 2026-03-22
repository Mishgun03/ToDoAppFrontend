import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>(
    "next/server",
  );
  return {
    ...actual,
    NextResponse: {
      redirect: vi.fn((url: URL) => ({ type: "redirect", url })),
      next: vi.fn(() => ({ type: "next" })),
    },
  };
});

import { middleware } from "@/middleware";
import { NextResponse } from "next/server";

function createRequest(pathname: string, token?: string): NextRequest {
  const url = new URL(pathname, "http://localhost:3000");
  const req = new NextRequest(url);
  if (token) {
    req.cookies.set("todoapi_token", token);
  }
  return req;
}

describe("middleware", () => {
  describe("unauthenticated user", () => {
    it("allows access to /login", () => {
      middleware(createRequest("/login"));
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it("allows access to /register", () => {
      middleware(createRequest("/register"));
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it("allows access to / (landing)", () => {
      middleware(createRequest("/"));
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it("redirects to /login for /dashboard", () => {
      middleware(createRequest("/dashboard"));
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/login" }),
      );
    });

    it("redirects to /login for /todos/123", () => {
      middleware(createRequest("/todos/123"));
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/login" }),
      );
    });

    it("redirects to /login for /profile", () => {
      middleware(createRequest("/profile"));
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/login" }),
      );
    });
  });

  describe("authenticated user", () => {
    it("redirects from /login to /dashboard", () => {
      middleware(createRequest("/login", "valid-token"));
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/dashboard" }),
      );
    });

    it("redirects from /register to /dashboard", () => {
      middleware(createRequest("/register", "valid-token"));
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/dashboard" }),
      );
    });

    it("redirects from / to /dashboard", () => {
      middleware(createRequest("/", "valid-token"));
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/dashboard" }),
      );
    });

    it("allows access to /dashboard", () => {
      middleware(createRequest("/dashboard", "valid-token"));
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it("allows access to /todos/123", () => {
      middleware(createRequest("/todos/123", "valid-token"));
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it("allows access to /profile", () => {
      middleware(createRequest("/profile", "valid-token"));
      expect(NextResponse.next).toHaveBeenCalled();
    });
  });
});
