import { describe, it, expect, vi, afterEach } from "vitest";
import {
  formatBytes,
  formatDate,
  formatRelativeDate,
  formatDeadline,
} from "@/shared/lib/format";

describe("formatBytes()", () => {
  it.each([
    [0, "0 Б"],
    [1, "1 Б"],
    [500, "500 Б"],
    [1024, "1 КБ"],
    [1536, "1.5 КБ"],
    [2048, "2 КБ"],
    [1024 * 1024, "1 МБ"],
    [1.5 * 1024 * 1024, "1.5 МБ"],
    [500 * 1024 * 1024, "500 МБ"],
    [1024 * 1024 * 1024, "1 ГБ"],
  ])("formatBytes(%d) → '%s'", (input, expected) => {
    expect(formatBytes(input)).toBe(expected);
  });

  it.each([-1, -100])("returns '0 Б' for negative input (%d)", (input) => {
    expect(formatBytes(input)).toBe("0 Б");
  });
});

describe("formatDate()", () => {
  it.each([
    ["2024-01-15T12:00:00Z", /15/, /янв/i, /2024/],
    ["2024-12-25T00:00:00Z", /25/, /дек/i, /2024/],
    ["2023-06-01", /2023/, /июн/i, /1/],
  ])("formatDate('%s') contains expected parts", (iso, ...patterns) => {
    const result = formatDate(iso as string);
    for (const pattern of patterns) {
      expect(result).toMatch(pattern as RegExp);
    }
  });
});

describe("formatRelativeDate()", () => {
  it.each([
    ["1 hour ago", 3600 * 1000],
    ["30 seconds ago", 30 * 1000],
    ["30 days ago", 30 * 24 * 3600 * 1000],
  ])("%s → contains 'назад'", (_label, msAgo) => {
    const date = new Date(Date.now() - msAgo).toISOString();
    expect(formatRelativeDate(date)).toContain("назад");
  });
});

describe("formatDeadline()", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const BASE = new Date(2025, 0, 15, 0, 0, 0);

  const makeDate = (offsetDays: number) => {
    const d = new Date(BASE);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString();
  };

  const useFrozenTime = () => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  };

  it("returns 'Сегодня' for today", () => {
    useFrozenTime();
    const result = formatDeadline(makeDate(0));
    expect(result).toEqual({ text: "Сегодня", isOverdue: false });
  });

  it("returns 'Завтра' for tomorrow", () => {
    useFrozenTime();
    const result = formatDeadline(makeDate(1));
    expect(result).toEqual({ text: "Завтра", isOverdue: false });
  });

  it.each([3, 5, 7])("%d days ahead → 'Через %d дн.'", (offset) => {
    useFrozenTime();
    const result = formatDeadline(makeDate(offset));
    expect(result.text).toBe(`Через ${offset} дн.`);
    expect(result.isOverdue).toBe(false);
  });

  it.each([1, 5, 10])("%d days ago → overdue", (offset) => {
    useFrozenTime();
    const result = formatDeadline(makeDate(-offset));
    expect(result.text).toBe(`Просрочено на ${offset} дн.`);
    expect(result.isOverdue).toBe(true);
  });

  it("returns formatted date for 30+ days away", () => {
    useFrozenTime();
    const result = formatDeadline(makeDate(30));
    expect(result.isOverdue).toBe(false);
    expect(result.text).not.toContain("Через");
    expect(result.text).not.toContain("Просрочено");
  });
});