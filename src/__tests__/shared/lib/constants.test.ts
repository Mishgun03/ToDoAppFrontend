import { describe, it, expect } from "vitest";
import { PRIORITY_CONFIG, REPEAT_LABELS } from "@/shared/lib/constants";

describe("PRIORITY_CONFIG", () => {
  it("contains all five priority levels", () => {
    expect(Object.keys(PRIORITY_CONFIG)).toEqual([
      "BLOCKER",
      "HIGH",
      "MEDIUM",
      "LOW",
      "NONE",
    ]);
  });

  it("each priority has label, color, text, and border fields", () => {
    for (const key of Object.keys(PRIORITY_CONFIG)) {
      const config =
        PRIORITY_CONFIG[key as keyof typeof PRIORITY_CONFIG];
      expect(config).toHaveProperty("label");
      expect(config).toHaveProperty("color");
      expect(config).toHaveProperty("text");
      expect(config).toHaveProperty("border");
    }
  });

  it("BLOCKER has red color", () => {
    expect(PRIORITY_CONFIG.BLOCKER.color).toContain("red");
  });

  it("HIGH has orange color", () => {
    expect(PRIORITY_CONFIG.HIGH.color).toContain("orange");
  });

  it("MEDIUM has yellow color", () => {
    expect(PRIORITY_CONFIG.MEDIUM.color).toContain("yellow");
  });

  it("LOW has green color", () => {
    expect(PRIORITY_CONFIG.LOW.color).toContain("green");
  });

  it("NONE has gray color", () => {
    expect(PRIORITY_CONFIG.NONE.color).toContain("gray");
  });

  it("all labels are non-empty strings", () => {
    for (const config of Object.values(PRIORITY_CONFIG)) {
      expect(config.label.length).toBeGreaterThan(0);
    }
  });

  it("all color classes start with bg-", () => {
    for (const config of Object.values(PRIORITY_CONFIG)) {
      expect(config.color).toMatch(/^bg-/);
    }
  });

  it("all text classes start with text-", () => {
    for (const config of Object.values(PRIORITY_CONFIG)) {
      expect(config.text).toMatch(/^text-/);
    }
  });

  it("all border classes start with border-", () => {
    for (const config of Object.values(PRIORITY_CONFIG)) {
      expect(config.border).toMatch(/^border-/);
    }
  });
});

describe("REPEAT_LABELS", () => {
  it("contains all four repeat types", () => {
    expect(Object.keys(REPEAT_LABELS)).toEqual([
      "DAILY",
      "WEEKLY",
      "MONTHLY",
      "YEARLY",
    ]);
  });

  it("DAILY label is 'Daily'", () => {
    expect(REPEAT_LABELS.DAILY).toBe("Daily");
  });

  it("WEEKLY label is 'Weekly'", () => {
    expect(REPEAT_LABELS.WEEKLY).toBe("Weekly");
  });

  it("MONTHLY label is 'Monthly'", () => {
    expect(REPEAT_LABELS.MONTHLY).toBe("Monthly");
  });

  it("YEARLY label is 'Yearly'", () => {
    expect(REPEAT_LABELS.YEARLY).toBe("Yearly");
  });

  it("all labels are non-empty strings", () => {
    for (const label of Object.values(REPEAT_LABELS)) {
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
