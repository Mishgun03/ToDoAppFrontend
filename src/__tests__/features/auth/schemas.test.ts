import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "@/features/auth/schemas";

describe("registerSchema", () => {
  const validData = {
    username: "johndoe",
    password: "Strong1!a",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe("username", () => {
    it("rejects empty username", () => {
      const result = registerSchema.safeParse({ ...validData, username: "" });
      expect(result.success).toBe(false);
    });

    it("rejects username longer than 64 chars", () => {
      const result = registerSchema.safeParse({
        ...validData,
        username: "a".repeat(65),
      });
      expect(result.success).toBe(false);
    });

    it("accepts username of exactly 64 chars", () => {
      const result = registerSchema.safeParse({
        ...validData,
        username: "a".repeat(64),
      });
      expect(result.success).toBe(true);
    });

    it("accepts single character username", () => {
      const result = registerSchema.safeParse({
        ...validData,
        username: "a",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("password", () => {
    it("rejects password shorter than 8 chars", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "Ab1!xyz",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password longer than 20 chars", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "Abcdefgh1!abcdefgh1!x",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password without uppercase letter", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "abcdefg1!",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password without lowercase letter", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "ABCDEFG1!",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password without digit", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "Abcdefgh!",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password without special character", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "Abcdefg1a",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password with spaces", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "Ab cde1! ",
      });
      expect(result.success).toBe(false);
    });

    it("accepts password of exactly 8 characters", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "Abcdef1!",
      });
      expect(result.success).toBe(true);
    });

    it("accepts password of exactly 20 characters", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "Abcdefghij1234567@!a",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("email", () => {
    it("rejects invalid email format", () => {
      const result = registerSchema.safeParse({
        ...validData,
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty email", () => {
      const result = registerSchema.safeParse({ ...validData, email: "" });
      expect(result.success).toBe(false);
    });

    it("rejects email longer than 320 chars", () => {
      const result = registerSchema.safeParse({
        ...validData,
        email: `${"a".repeat(310)}@example.com`,
      });
      expect(result.success).toBe(false);
    });

    it("accepts normal email", () => {
      const result = registerSchema.safeParse({
        ...validData,
        email: "user@test.org",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("firstName", () => {
    it("rejects empty firstName", () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects firstName longer than 100 chars", () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("accepts firstName of 100 chars", () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: "a".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("lastName", () => {
    it("rejects empty lastName", () => {
      const result = registerSchema.safeParse({ ...validData, lastName: "" });
      expect(result.success).toBe(false);
    });

    it("rejects lastName longer than 100 chars", () => {
      const result = registerSchema.safeParse({
        ...validData,
        lastName: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("accepts lastName of 100 chars", () => {
      const result = registerSchema.safeParse({
        ...validData,
        lastName: "a".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      username: "user",
      password: "pass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty username", () => {
    const result = loginSchema.safeParse({ username: "", password: "pass" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ username: "user", password: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing username field", () => {
    const result = loginSchema.safeParse({ password: "pass" });
    expect(result.success).toBe(false);
  });

  it("rejects missing password field", () => {
    const result = loginSchema.safeParse({ username: "user" });
    expect(result.success).toBe(false);
  });

  it("rejects completely empty object", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
