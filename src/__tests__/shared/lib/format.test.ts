import { describe, it, expect, vi, afterEach } from "vitest";
import {
  formatBytes,
  formatDate,
  formatRelativeDate,
  formatDeadline,
} from "@/shared/lib/format";

describe("formatBytes()", () => {
  it("returns '0 Б' for 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 Б");
  });

  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500 Б");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 КБ");
  });

  it("formats kilobytes with decimal", () => {
    expect(formatBytes(1536)).toBe("1.5 КБ");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1024 * 1024)).toBe("1 МБ");
  });

  it("formats megabytes with decimal", () => {
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1.5 МБ");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1 ГБ");
  });

  it("formats large megabyte values", () => {
    expect(formatBytes(500 * 1024 * 1024)).toBe("500 МБ");
  });

  it("formats 2048 bytes as 2 КБ", () => {
    expect(formatBytes(2048)).toBe("2 КБ");
  });

  it("formats 1 byte", () => {
    expect(formatBytes(1)).toBe("1 Б");
  });
});

describe("formatDate()", () => {
  it("formats ISO date string to Russian locale", () => {
    const result = formatDate("2024-01-15T12:00:00Z");
    expect(result).toMatch(/15/);
    expect(result).toMatch(/янв/i);
    expect(result).toMatch(/2024/);
  });

  it("formats another date correctly", () => {
    const result = formatDate("2024-12-25T00:00:00Z");
    expect(result).toMatch(/25/);
    expect(result).toMatch(/дек/i);
    expect(result).toMatch(/2024/);
  });

  it("handles date without time zone", () => {
    const result = formatDate("2023-06-01");
    expect(result).toMatch(/2023/);
  });
});

describe("formatRelativeDate()", () => {
  it("returns a string containing 'назад' for a past date", () => {
    const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();
    expect(formatRelativeDate(pastDate)).toContain("назад");
  });

  it("returns a relative string for a very recent date", () => {
    const recent = new Date(Date.now() - 30 * 1000).toISOString();
    const result = formatRelativeDate(recent);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("returns a relative string for an older date", () => {
    const oldDate = new Date(
      Date.now() - 30 * 24 * 3600 * 1000,
    ).toISOString();
    const result = formatRelativeDate(oldDate);
    expect(result).toContain("назад");
  });
});

describe("formatDeadline()", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Сегодня' for today's date", () => {
    const today = new Date();
    today.setHours(23, 59, 0, 0);
    const result = formatDeadline(today.toISOString());
    expect(result.text).toBe("Сегодня");
    expect(result.isOverdue).toBe(false);
  });

  it("returns 'Завтра' for tomorrow's date", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    const result = formatDeadline(tomorrow.toISOString());
    expect(result.text).toBe("Завтра");
    expect(result.isOverdue).toBe(false);
  });

  it("returns overdue text for a past date", () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    past.setHours(12, 0, 0, 0);
    const result = formatDeadline(past.toISOString());
    expect(result.text).toContain("Просрочено");
    expect(result.isOverdue).toBe(true);
  });

  it("returns 'Через N дн.' for a date within 7 days", () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    future.setHours(12, 0, 0, 0);
    const result = formatDeadline(future.toISOString());
    expect(result.text).toMatch(/Через \d+ дн\./);
    expect(result.isOverdue).toBe(false);
  });

  it("returns formatted date for a date more than 7 days away", () => {
    const farFuture = new Date();
    farFuture.setDate(farFuture.getDate() + 30);
    const result = formatDeadline(farFuture.toISOString());
    expect(result.isOverdue).toBe(false);
    expect(result.text).not.toContain("Через");
    expect(result.text).not.toContain("Просрочено");
  });

  it("overdue result includes day count", () => {
    const past = new Date();
    past.setDate(past.getDate() - 10);
    past.setHours(0, 0, 0, 0);
    const result = formatDeadline(past.toISOString());
    expect(result.text).toMatch(/\d+/);
    expect(result.isOverdue).toBe(true);
  });
});
