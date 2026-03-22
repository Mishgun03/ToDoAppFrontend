import { describe, it, expect } from "vitest";
import {
  createTodoSchema,
  updateTodoSchema,
} from "@/features/todos/schemas";

describe("createTodoSchema", () => {
  it("accepts minimal valid data (title only)", () => {
    const result = createTodoSchema.safeParse({ title: "My todo" });
    expect(result.success).toBe(true);
  });

  it("accepts full valid data", () => {
    const result = createTodoSchema.safeParse({
      title: "Task",
      content: "Description",
      deadline: "2025-12-31",
      priority: "HIGH",
      repeatType: "DAILY",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createTodoSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 128 chars", () => {
    const result = createTodoSchema.safeParse({
      title: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("accepts title of exactly 128 chars", () => {
    const result = createTodoSchema.safeParse({
      title: "a".repeat(128),
    });
    expect(result.success).toBe(true);
  });

  it("rejects content longer than 2048 chars", () => {
    const result = createTodoSchema.safeParse({
      title: "ok",
      content: "a".repeat(2049),
    });
    expect(result.success).toBe(false);
  });

  it("accepts content of exactly 2048 chars", () => {
    const result = createTodoSchema.safeParse({
      title: "ok",
      content: "a".repeat(2048),
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty string content", () => {
    const result = createTodoSchema.safeParse({
      title: "ok",
      content: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid priority values", () => {
    for (const priority of ["BLOCKER", "HIGH", "MEDIUM", "LOW", "NONE"]) {
      const result = createTodoSchema.safeParse({ title: "ok", priority });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid priority value", () => {
    const result = createTodoSchema.safeParse({
      title: "ok",
      priority: "CRITICAL",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid repeatType values", () => {
    for (const repeatType of ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]) {
      const result = createTodoSchema.safeParse({ title: "ok", repeatType });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid repeatType value", () => {
    const result = createTodoSchema.safeParse({
      title: "ok",
      repeatType: "HOURLY",
    });
    expect(result.success).toBe(false);
  });

  it("accepts null repeatType", () => {
    const result = createTodoSchema.safeParse({
      title: "ok",
      repeatType: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty deadline string", () => {
    const result = createTodoSchema.safeParse({
      title: "ok",
      deadline: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts undefined optional fields", () => {
    const result = createTodoSchema.safeParse({
      title: "ok",
      content: undefined,
      deadline: undefined,
      priority: undefined,
      repeatType: undefined,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateTodoSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    const result = updateTodoSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts partial update with title", () => {
    const result = updateTodoSchema.safeParse({ title: "Updated" });
    expect(result.success).toBe(true);
  });

  it("rejects title longer than 128 chars", () => {
    const result = updateTodoSchema.safeParse({
      title: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only title", () => {
    const result = updateTodoSchema.safeParse({ title: "   " });
    expect(result.success).toBe(false);
  });

  it("accepts update with done boolean", () => {
    const result = updateTodoSchema.safeParse({ done: true });
    expect(result.success).toBe(true);
  });

  it("accepts update with done=false", () => {
    const result = updateTodoSchema.safeParse({ done: false });
    expect(result.success).toBe(true);
  });

  it("rejects done as non-boolean", () => {
    const result = updateTodoSchema.safeParse({ done: "yes" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid priority values", () => {
    for (const priority of ["BLOCKER", "HIGH", "MEDIUM", "LOW", "NONE"]) {
      const result = updateTodoSchema.safeParse({ priority });
      expect(result.success).toBe(true);
    }
  });

  it("accepts null repeatType (to clear repeat)", () => {
    const result = updateTodoSchema.safeParse({ repeatType: null });
    expect(result.success).toBe(true);
  });

  it("accepts content of 2048 chars", () => {
    const result = updateTodoSchema.safeParse({
      content: "a".repeat(2048),
    });
    expect(result.success).toBe(true);
  });

  it("rejects content longer than 2048 chars", () => {
    const result = updateTodoSchema.safeParse({
      content: "a".repeat(2049),
    });
    expect(result.success).toBe(false);
  });

  it("accepts full valid update", () => {
    const result = updateTodoSchema.safeParse({
      title: "New Title",
      content: "New content",
      deadline: "2025-06-01",
      done: true,
      priority: "BLOCKER",
      repeatType: "WEEKLY",
    });
    expect(result.success).toBe(true);
  });
});
