import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn()", () => {
  it("merges simple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, null, undefined, 0, "b")).toBe("a b");
  });

  it("handles conditional classes via object syntax", () => {
    expect(cn({ "text-red": true, "text-blue": false })).toBe("text-red");
  });

  it("handles array syntax", () => {
    expect(cn(["p-2", "m-4"])).toBe("p-2 m-4");
  });

  it("deduplicates conflicting Tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("merges Tailwind variants correctly", () => {
    expect(cn("hover:bg-red-500", "hover:bg-blue-500")).toBe(
      "hover:bg-blue-500",
    );
  });

  it("keeps non-conflicting Tailwind classes", () => {
    expect(cn("p-2", "m-4", "text-lg")).toBe("p-2 m-4 text-lg");
  });

  it("handles mixed clsx + tailwind-merge", () => {
    const isActive = true;
    expect(cn("bg-white", isActive && "bg-black")).toBe("bg-black");
  });

  it("handles deeply nested arrays", () => {
    expect(cn(["a", ["b", ["c"]]])).toBe("a b c");
  });
});
