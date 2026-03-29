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

  const usernameCases = [
    { name: "rejects empty username", value: "", expected: false },
    {
      name: "rejects username longer than 64 chars",
      value: "a".repeat(65),
      expected: false,
    },
    {
      name: "accepts username of exactly 64 chars",
      value: "a".repeat(64),
      expected: true,
    },
    { name: "accepts single character username", value: "a", expected: true },
  ];

  describe("username", () => {
    it.each(usernameCases)("$name", ({ value, expected }) => {
      const result = registerSchema.safeParse({ ...validData, username: value });
      expect(result.success).toBe(expected);
    });
  });

  const passwordCases = [
    {
      name: "rejects password shorter than 8 chars",
      value: "Ab1!xyz",
      expected: false,
    },
    {
      name: "rejects password longer than 20 chars",
      value: "Abcdefgh1!abcdefgh1!x",
      expected: false,
    },
    {
      name: "rejects password without uppercase letter",
      value: "abcdefg1!",
      expected: false,
    },
    {
      name: "rejects password without lowercase letter",
      value: "ABCDEFG1!",
      expected: false,
    },
    {
      name: "rejects password without digit",
      value: "Abcdefgh!",
      expected: false,
    },
    {
      name: "rejects password without special character",
      value: "Abcdefg1a",
      expected: false,
    },
    {
      name: "rejects password with spaces",
      value: "Ab cde1! ",
      expected: false,
    },
    {
      name: "accepts password of exactly 8 characters",
      value: "Abcdef1!",
      expected: true,
    },
    {
      name: "accepts password of exactly 20 characters",
      value: "Abcdefghij1234567@!a",
      expected: true,
    },
  ];

  describe("password", () => {
    it.each(passwordCases)("$name", ({ value, expected }) => {
      const result = registerSchema.safeParse({ ...validData, password: value });
      expect(result.success).toBe(expected);
    });
  });

  const emailCases = [
    {
      name: "rejects invalid email format",
      value: "not-an-email",
      expected: false,
    },
    { name: "rejects empty email", value: "", expected: false },
    {
      name: "rejects email longer than 320 chars",
      value: `${"a".repeat(310)}@example.com`,
      expected: false,
    },
    { name: "accepts normal email", value: "user@test.org", expected: true },
  ];

  describe("email", () => {
    it.each(emailCases)("$name", ({ value, expected }) => {
      const result = registerSchema.safeParse({ ...validData, email: value });
      expect(result.success).toBe(expected);
    });
  });

  const firstNameCases = [
    { name: "rejects empty firstName", value: "", expected: false },
    {
      name: "rejects firstName longer than 100 chars",
      value: "a".repeat(101),
      expected: false,
    },
    {
      name: "accepts firstName of 100 chars",
      value: "a".repeat(100),
      expected: true,
    },
  ];

  describe("firstName", () => {
    it.each(firstNameCases)("$name", ({ value, expected }) => {
      const result = registerSchema.safeParse({ ...validData, firstName: value });
      expect(result.success).toBe(expected);
    });
  });

  const lastNameCases = [
    { name: "rejects empty lastName", value: "", expected: false },
    {
      name: "rejects lastName longer than 100 chars",
      value: "a".repeat(101),
      expected: false,
    },
    {
      name: "accepts lastName of 100 chars",
      value: "a".repeat(100),
      expected: true,
    },
  ];

  describe("lastName", () => {
    it.each(lastNameCases)("$name", ({ value, expected }) => {
      const result = registerSchema.safeParse({ ...validData, lastName: value });
      expect(result.success).toBe(expected);
    });
  });
});

describe("loginSchema", () => {
  const loginCases: Array<{ name: string; value: unknown; expected: boolean }> = [
    {
      name: "accepts valid login data",
      value: { username: "user", password: "pass" },
      expected: true,
    },
    {
      name: "rejects empty username",
      value: { username: "", password: "pass" },
      expected: false,
    },
    {
      name: "rejects empty password",
      value: { username: "user", password: "" },
      expected: false,
    },
    {
      name: "rejects missing username field",
      value: { password: "pass" },
      expected: false,
    },
    {
      name: "rejects missing password field",
      value: { username: "user" },
      expected: false,
    },
    {
      name: "rejects completely empty object",
      value: {},
      expected: false,
    },
  ];

  it.each(loginCases)("$name", ({ value, expected }) => {
    const result = loginSchema.safeParse(value);
    expect(result.success).toBe(expected);
  });
});
