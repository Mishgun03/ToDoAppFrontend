import { describe, it, expect } from "vitest";
import { getPasswordStrength } from "@/shared/lib/password-strength";

describe("getPasswordStrength()", () => {
  it("returns score 0 for empty string", () => {
    const result = getPasswordStrength("");
    expect(result.score).toBe(0);
    expect(result.label).toBe("Слабый");
    expect(result.color).toBe("bg-red-500");
  });

  it("returns score 1 for lowercase-only short password", () => {
    const result = getPasswordStrength("abc");
    expect(result.score).toBe(1);
    expect(result.label).toBe("Слабый");
  });

  it("returns score 2 for lowercase + uppercase only (short)", () => {
    const result = getPasswordStrength("Abc");
    expect(result.score).toBe(2);
    expect(result.label).toBe("Слабый");
  });

  it("returns score 3 for lower + upper + digits (short)", () => {
    const result = getPasswordStrength("Abc1");
    expect(result.score).toBe(3);
    expect(result.label).toBe("Средний");
    expect(result.color).toBe("bg-yellow-500");
  });

  it("returns score 4 for lower + upper + digits + length>=8", () => {
    const result = getPasswordStrength("Abcdefg1");
    expect(result.score).toBe(4);
    expect(result.label).toBe("Хороший");
    expect(result.color).toBe("bg-blue-500");
  });

  it("returns score 5 for all criteria met", () => {
    const result = getPasswordStrength("Abcdefg1!");
    expect(result.score).toBe(5);
    expect(result.label).toBe("Надёжный");
    expect(result.color).toBe("bg-green-500");
  });

  it("increments score for length >= 8", () => {
    const short = getPasswordStrength("a");
    const long = getPasswordStrength("aaaaaaaa");
    expect(long.score).toBeGreaterThan(short.score);
  });

  it("increments score for uppercase letter", () => {
    const lower = getPasswordStrength("aaaa");
    const withUpper = getPasswordStrength("Aaaa");
    expect(withUpper.score).toBeGreaterThan(lower.score);
  });

  it("increments score for digit", () => {
    const noDigit = getPasswordStrength("aaaa");
    const withDigit = getPasswordStrength("aaaa1");
    expect(withDigit.score).toBeGreaterThan(noDigit.score);
  });

  it("increments score for special character", () => {
    const noSpecial = getPasswordStrength("aaaa");
    const withSpecial = getPasswordStrength("aaaa!");
    expect(withSpecial.score).toBeGreaterThan(noSpecial.score);
  });

  it("digits-only password of length 8 gets score 2", () => {
    const result = getPasswordStrength("12345678");
    expect(result.score).toBe(2);
    expect(result.label).toBe("Слабый");
  });

  it("returns correct result for strong common password", () => {
    const result = getPasswordStrength("MyP@ssw0rd");
    expect(result.score).toBe(5);
    expect(result.label).toBe("Надёжный");
  });

  it("special chars without other criteria still count", () => {
    const result = getPasswordStrength("!@#");
    expect(result.score).toBe(1);
  });

  it("long lowercase-only password scores 2", () => {
    const result = getPasswordStrength("abcdefghij");
    expect(result.score).toBe(2);
  });
});
