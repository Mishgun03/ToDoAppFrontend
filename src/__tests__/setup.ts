import "@testing-library/jest-dom/vitest";

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(String(key)) ?? null;
    },
    key(index: number) {
      const keys = [...map.keys()];
      return keys[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(String(key));
    },
    setItem(key: string, value: string) {
      map.set(String(key), String(value));
    },
  } as Storage;
}

const memoryLocalStorage = createMemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
  value: memoryLocalStorage,
  writable: true,
  configurable: true,
});

if (typeof globalThis.window !== "undefined") {
  Object.defineProperty(globalThis.window, "localStorage", {
    value: memoryLocalStorage,
    writable: true,
    configurable: true,
  });
}
