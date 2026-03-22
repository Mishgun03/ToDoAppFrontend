import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/shared/lib/useDebounce";

describe("useDebounce()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update value before delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("initial");
  });

  it("updates value after delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("updated");
  });

  it("resets timer on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("c");
  });

  it("uses default delay of 300ms", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: "start" } },
    );

    rerender({ value: "end" });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("start");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("end");
  });

  it("works with custom delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "init" } },
    );

    rerender({ value: "new" });
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("init");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("new");
  });

  it("works with numeric values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(42);
  });

  it("works with object values", () => {
    const obj1 = { key: "a" };
    const obj2 = { key: "b" };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: obj1 } },
    );

    rerender({ value: obj2 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toEqual({ key: "b" });
  });
});
